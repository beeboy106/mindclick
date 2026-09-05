import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUsers } from "../data/mockUsers";
import { getMatches } from "../lib/getMatch";
import { useAuth } from "./AuthContext";
import {
  isFirebaseConfigured,
  getFirestoreUser,
  saveFirestoreUser,
  getAllFirestoreUsers,
} from "../lib/firebase";

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

  // ฟังก์ชันดึงรายชื่อผู้ใช้จาก Cloud Firestore
  const fetchCloudPool = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    try {
      const allCloudUsers = await getAllFirestoreUsers();
      const realUsers = allCloudUsers.filter(
        (u) =>
          u.id !== user?.id &&
          u.categoryAnswers &&
          u.categoryAnswers.length > 0
      );

      // ผสานคนจริงไว้ด้านบน และ mockUsers เสริมหากคนจริงยังมีน้อย
      const combined = [
        ...realUsers,
        ...mockUsers.filter((m) => !realUsers.some((r) => r.id === m.id)),
      ];
      setUsersPool(combined);
      AsyncStorage.setItem(USERS_POOL_KEY, JSON.stringify(combined));
    } catch (err) {
      console.warn("Error fetching cloud users pool:", err);
    }
  }, [user?.id]);

  // 2. ซิงค์กับ Firebase Firestore เมื่อมี user ล็อกอิน
  useEffect(() => {
    if (!user || !isFirebaseConfigured()) return;

    let isMounted = true;

    async function syncUserData() {
      try {
        const cloudUser = await getFirestoreUser(user.id);

        if (cloudUser && isMounted) {
          // โหลดโปรไฟล์
          setProfile((prev) => ({
            ...prev,
            ...cloudUser,
            socialLinks: {
              ...prev.socialLinks,
              ...(cloudUser.socialLinks || {}),
            },
          }));

          // โหลดคำตอบ
          if (cloudUser.completedCategories && cloudUser.categoryAnswers) {
            const cloudQuiz = {
              completedCategories: cloudUser.completedCategories || [],
              categoryAnswers: cloudUser.categoryAnswers || [],
            };
            setQuizResponse(cloudQuiz);
            AsyncStorage.setItem(QUIZ_KEY, JSON.stringify(cloudQuiz));
          }

          if (cloudUser.favorites) {
            setFavorites(cloudUser.favorites);
            AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(cloudUser.favorites));
          }
        } else if (isMounted) {
          // หากยังไม่มี ให้สร้างไว้ใน Firestore
          await saveFirestoreUser(user.id, {
            id: user.id,
            name: user.name || "Google User",
            email: user.email || "",
            image: user.image || null,
            gender: "prefer_not_to_say",
            bio: "",
            socialLinks: {},
            galleryImages: [],
            completedCategories: [],
            categoryAnswers: [],
            hasCompletedQuiz: false,
            favorites: [],
            isRealUser: true,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Error syncing user data:", err);
      }

      if (isMounted) {
        await fetchCloudPool();
      }
    }

    syncUserData();

    // ดึงข้อมูล Pool ทุกๆ 15 วินาทีเพื่อให้อัปเดตสดเสมอ
    const interval = setInterval(fetchCloudPool, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, fetchCloudPool]);

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

      // บันทึกขึ้น Cloud Firestore
      if (user && isFirebaseConfigured()) {
        await saveFirestoreUser(user.id, {
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
        });
        // รีเฟรช Pool ทันที
        fetchCloudPool();
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
        await saveFirestoreUser(user.id, {
          ...partialProfile,
          updatedAt: new Date().toISOString(),
        });
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
        await saveFirestoreUser(user.id, {
          favorites: updatedFavorites,
          updatedAt: new Date().toISOString(),
        });
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
        await saveFirestoreUser(user.id, {
          completedCategories: [],
          categoryAnswers: [],
          hasCompletedQuiz: false,
          updatedAt: new Date().toISOString(),
        });
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
        refreshPool: fetchCloudPool,
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
