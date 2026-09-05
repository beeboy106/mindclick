import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUsers } from "../data/mockUsers";
import { getMatches } from "../lib/getMatch";
import { useAuth } from "./AuthContext";
import { getDb, isFirebaseConfigured } from "../lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

const PROFILE_KEY = "@friendq_user_profile";
const QUIZ_KEY = "@friendq_quiz_responses";
const FAVORITES_KEY = "@friendq_favorites";
const USERS_POOL_KEY = "@friendq_users_pool";

const defaultProfile = {
  gender: "prefer_not_to_say",
  bio: "",
  socialLinks: {
    instagram: "",
    facebook: "",
    line: "",
    tiktok: "",
    twitter: "",
  },
  image: null,
  galleryImages: [],
};

const defaultQuizResponse = {
  completedCategories: [],
  categoryAnswers: [],
};

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(defaultProfile);
  const [quizResponse, setQuizResponse] = useState(defaultQuizResponse);
  const [favorites, setFavorites] = useState([]);
  const [usersPool, setUsersPool] = useState(mockUsers);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. โหลดข้อมูลแคชในเครื่องตอนเปิดแอป
  useEffect(() => {
    async function initLocalData() {
      try {
        const [storedProfile, storedQuiz, storedFavorites, storedPool] =
          await Promise.all([
            AsyncStorage.getItem(PROFILE_KEY),
            AsyncStorage.getItem(QUIZ_KEY),
            AsyncStorage.getItem(FAVORITES_KEY),
            AsyncStorage.getItem(USERS_POOL_KEY),
          ]);

        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (storedQuiz) setQuizResponse(JSON.parse(storedQuiz));
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedPool) {
          setUsersPool(JSON.parse(storedPool));
        } else {
          setUsersPool(mockUsers);
        }
      } catch (err) {
        console.error("Error loading local storage data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    initLocalData();
  }, []);

  // 2. ซิงค์กับ Firebase Firestore เมื่อมี user ล็อกอิน
  useEffect(() => {
    if (!user || !isFirebaseConfigured()) return;
    const db = getDb();
    if (!db) return;

    let unsubscribeSnapshot = null;

    async function syncCloudUserData() {
      try {
        const userDocRef = doc(db, "users", user.id);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const cloudData = userDocSnap.data();
          // โหลดโปรไฟล์จาก Cloud
          setProfile((prev) => ({
            ...prev,
            ...cloudData,
            socialLinks: {
              ...prev.socialLinks,
              ...(cloudData.socialLinks || {}),
            },
          }));

          // โหลดคำตอบควิซจาก Cloud
          if (cloudData.completedCategories && cloudData.categoryAnswers) {
            const cloudQuiz = {
              completedCategories: cloudData.completedCategories || [],
              categoryAnswers: cloudData.categoryAnswers || [],
            };
            setQuizResponse(cloudQuiz);
            AsyncStorage.setItem(QUIZ_KEY, JSON.stringify(cloudQuiz));
          }

          if (cloudData.favorites) {
            setFavorites(cloudData.favorites);
            AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(cloudData.favorites));
          }
        } else {
          // หากยังไม่มีข้อมูลใน Cloud ให้สร้างข้อมูลเริ่มต้นของผู้ใช้นี้
          await setDoc(userDocRef, {
            id: user.id,
            name: user.name || "Google User",
            email: user.email || "",
            image: user.image || null,
            gender: profile.gender || "prefer_not_to_say",
            bio: profile.bio || "",
            socialLinks: profile.socialLinks || {},
            galleryImages: profile.galleryImages || [],
            completedCategories: quizResponse.completedCategories || [],
            categoryAnswers: quizResponse.categoryAnswers || [],
            hasCompletedQuiz: quizResponse.completedCategories?.length === 4,
            favorites: favorites || [],
            isRealUser: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Error syncing user data with Firestore:", err);
      }

      // ฟัง Real-time Pool ของผู้ใช้คนอื่นๆ เพื่อการคำนวณแมตช์สดๆ
      try {
        const usersCollectionRef = collection(db, "users");
        unsubscribeSnapshot = onSnapshot(usersCollectionRef, (snapshot) => {
          const realUsers = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // ไม่รวมตัวเราเอง และต้องมีชุดคำตอบ
            if (
              data.id !== user.id &&
              data.categoryAnswers &&
              data.categoryAnswers.length > 0
            ) {
              realUsers.push({
                ...data,
                isRealUser: true,
              });
            }
          });

          // รวมคนจริงไว้บนสุด และใส่ mockUsers เสริมหากคนจริงยังมีน้อย
          const combined = [
            ...realUsers,
            ...mockUsers.filter((m) => !realUsers.some((r) => r.id === m.id)),
          ];
          setUsersPool(combined);
          AsyncStorage.setItem(USERS_POOL_KEY, JSON.stringify(combined));
        });
      } catch (err) {
        console.warn("Error subscribing to users pool in Firestore:", err);
      }
    }

    syncCloudUserData();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [user]);

  // บันทึกคำตอบ Quiz ทีละหมวดหมู่
  const saveCategoryAnswers = async (categoryId, answers, questionOrder) => {
    try {
      const currentCompleted = [...quizResponse.completedCategories];
      if (!currentCompleted.includes(categoryId)) {
        currentCompleted.push(categoryId);
      }

      const otherAnswers = (quizResponse.categoryAnswers || []).filter(
        (ca) => ca.categoryId !== categoryId
      );

      const updatedCategoryAnswers = [
        ...otherAnswers,
        {
          categoryId,
          answers,
          questionOrder,
        },
      ];

      const newQuizData = {
        completedCategories: currentCompleted,
        categoryAnswers: updatedCategoryAnswers,
      };

      await AsyncStorage.setItem(QUIZ_KEY, JSON.stringify(newQuizData));
      setQuizResponse(newQuizData);

      // บันทึกขึ้น Cloud Firestore (ถ้าต่อเน็ตและล็อกอินอยู่)
      if (user && isFirebaseConfigured()) {
        const db = getDb();
        if (db) {
          const userDocRef = doc(db, "users", user.id);
          await setDoc(
            userDocRef,
            {
              id: user.id,
              name: user.name || "Google User",
              email: user.email || "",
              image: profile.image || user.image || null,
              gender: profile.gender,
              bio: profile.bio,
              socialLinks: profile.socialLinks,
              galleryImages: profile.galleryImages,
              completedCategories: currentCompleted,
              categoryAnswers: updatedCategoryAnswers,
              hasCompletedQuiz: currentCompleted.length === 4,
              isRealUser: true,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }

      return true;
    } catch (err) {
      console.error("Error saving category answers:", err);
      return false;
    }
  };

  // อัปเดตข้อมูล Profile
  const updateProfile = async (partialProfile) => {
    try {
      const updated = {
        ...profile,
        ...partialProfile,
        socialLinks: {
          ...profile.socialLinks,
          ...(partialProfile.socialLinks || {}),
        },
      };

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);

      // บันทึกขึ้น Cloud Firestore
      if (user && isFirebaseConfigured()) {
        const db = getDb();
        if (db) {
          const userDocRef = doc(db, "users", user.id);
          await setDoc(
            userDocRef,
            {
              ...partialProfile,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }

      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // เพิ่มรูปภาพลง Gallery (สูงสุด 9 รูป)
  const addGalleryImage = async (uri) => {
    try {
      if (profile.galleryImages.length >= 9) {
        return { success: false, error: "อัลบั้มรูปภาพสามารถใส่ได้สูงสุด 9 รูป" };
      }

      const newImage = {
        id: "gallery_" + Date.now(),
        url: uri,
        order: profile.galleryImages.length,
      };

      const updatedGallery = [...profile.galleryImages, newImage];
      await updateProfile({ galleryImages: updatedGallery });
      return { success: true };
    } catch (err) {
      console.error("Error adding gallery image:", err);
      return { success: false, error: "ไม่สามารถเพิ่มรูปภาพได้" };
    }
  };

  // ลบรูปภาพออกจาก Gallery
  const removeGalleryImage = async (imageId) => {
    try {
      const updatedGallery = profile.galleryImages
        .filter((img) => img.id !== imageId)
        .map((img, idx) => ({ ...img, order: idx }));

      await updateProfile({ galleryImages: updatedGallery });
      return true;
    } catch (err) {
      console.error("Error removing gallery image:", err);
      return false;
    }
  };

  // สลับสถานะ Favorite (บันทึก / ยกเลิก)
  const toggleFavorite = async (targetUserId) => {
    try {
      let updatedFavorites;
      let isNowFavorited = false;

      if (favorites.includes(targetUserId)) {
        updatedFavorites = favorites.filter((id) => id !== targetUserId);
        isNowFavorited = false;
      } else {
        updatedFavorites = [...favorites, targetUserId];
        isNowFavorited = true;
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);

      // บันทึกขึ้น Cloud Firestore
      if (user && isFirebaseConfigured()) {
        const db = getDb();
        if (db) {
          const userDocRef = doc(db, "users", user.id);
          await setDoc(
            userDocRef,
            {
              favorites: updatedFavorites,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }

      return isNowFavorited;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      return false;
    }
  };

  // ตรวจสอบว่า User ID นี้ถูก Favorite หรือยัง
  const isFavorite = (targetUserId) => {
    return favorites.includes(targetUserId);
  };

  // คำนวณรายชื่อคู่ Match ทั้งหมด
  const getMatchList = () => {
    return getMatches(quizResponse, usersPool);
  };

  // ค้นหาข้อมูล User ตาม ID
  const getUserById = (targetUserId) => {
    return usersPool.find((u) => u.id === targetUserId) || null;
  };

  // ล้างคำตอบ Quiz เพื่อเริ่มทำใหม่
  const resetQuizData = async () => {
    try {
      await AsyncStorage.setItem(QUIZ_KEY, JSON.stringify(defaultQuizResponse));
      setQuizResponse(defaultQuizResponse);

      if (user && isFirebaseConfigured()) {
        const db = getDb();
        if (db) {
          const userDocRef = doc(db, "users", user.id);
          await setDoc(
            userDocRef,
            {
              completedCategories: [],
              categoryAnswers: [],
              hasCompletedQuiz: false,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.error("Error resetting quiz data:", err);
    }
  };

  // ล้างข้อมูลทั้งหมดเพื่อทดสอบระบบใหม่
  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        PROFILE_KEY,
        QUIZ_KEY,
        FAVORITES_KEY,
        USERS_POOL_KEY,
      ]);
      setProfile(defaultProfile);
      setQuizResponse(defaultQuizResponse);
      setFavorites([]);
      setUsersPool(mockUsers);
    } catch (err) {
      console.error("Error resetting all data:", err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        quizResponse,
        favorites,
        usersPool,
        isLoadingData,
        saveCategoryAnswers,
        updateProfile,
        addGalleryImage,
        removeGalleryImage,
        toggleFavorite,
        isFavorite,
        getMatchList,
        getUserById,
        resetQuizData,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
