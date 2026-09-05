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

const USERS_POOL_KEY = "@friendq_users_pool";

// ฟังก์ชันสร้างคีย์แยกเฉพาะแต่ละ User เพื่อไม่ให้ข้อมูลปนกันตอนสลับบัญชี
const getProfileKey = (userId) => `@friendq_profile_${userId || "guest"}`;
const getQuizKey = (userId) => `@friendq_quiz_${userId || "guest"}`;
const getFavoritesKey = (userId) => `@friendq_favorites_${userId || "guest"}`;

const defaultProfile = {
  name: "",
  email: "",
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

  // ดึงรายชื่อผู้ใช้จาก Cloud Firestore สำหรับคำนวณ Match
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

      // รวมคนจริงไว้บนสุด และใส่ mockUsers เสริมหากคนจริงยังมีน้อย
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

  // ซิงค์ข้อมูลเมื่อผู้ใช้ล็อกอิน สลับบัญชี หรือออกจากระบบ
  useEffect(() => {
    // 1. ถ้าออกจากระบบ ให้ล้าง state ทั้งหมดทันที ไม่ให้ข้อมูลคนเก่าค้าง
    if (!user) {
      setProfile(defaultProfile);
      setQuizResponse(defaultQuizResponse);
      setFavorites([]);
      setIsLoadingData(false);
      return;
    }

    let isMounted = true;
    setIsLoadingData(true);

    async function loadUserData() {
      const pKey = getProfileKey(user.id);
      const qKey = getQuizKey(user.id);
      const fKey = getFavoritesKey(user.id);

      try {
        // ก. โหลดข้อมูลแคชเฉพาะของ User นี้ในเครื่องก่อน
        const [localProfile, localQuiz, localFavs] = await Promise.all([
          AsyncStorage.getItem(pKey),
          AsyncStorage.getItem(qKey),
          AsyncStorage.getItem(fKey),
        ]);

        if (isMounted) {
          if (localProfile) {
            setProfile(JSON.parse(localProfile));
          } else {
            // ถ้าเป็นบัญชีใหม่ในเครื่องนี้ ให้เริ่มด้วยข้อมูลเริ่มต้นของเขาเอง
            setProfile({
              ...defaultProfile,
              name: user.name || "",
              email: user.email || "",
              image: user.image || null,
            });
          }

          if (localQuiz) setQuizResponse(JSON.parse(localQuiz));
          else setQuizResponse(defaultQuizResponse);

          if (localFavs) setFavorites(JSON.parse(localFavs));
          else setFavorites([]);
        }

        // ข. โหลดข้อมูลจริงล่าสุดจาก Cloud Firestore ของ User นี้
        if (isFirebaseConfigured()) {
          const cloudUser = await getFirestoreUser(user.id);

          if (cloudUser && isMounted) {
            const mergedProfile = {
              ...defaultProfile,
              name: cloudUser.name || user.name || "",
              email: cloudUser.email || user.email || "",
              image: cloudUser.image || user.image || null,
              gender: cloudUser.gender || "prefer_not_to_say",
              bio: cloudUser.bio || "",
              socialLinks: {
                ...defaultProfile.socialLinks,
                ...(cloudUser.socialLinks || {}),
              },
              galleryImages: cloudUser.galleryImages || [],
            };

            setProfile(mergedProfile);
            await AsyncStorage.setItem(pKey, JSON.stringify(mergedProfile));

            const cloudQuiz = {
              completedCategories: cloudUser.completedCategories || [],
              categoryAnswers: cloudUser.categoryAnswers || [],
            };
            setQuizResponse(cloudQuiz);
            await AsyncStorage.setItem(qKey, JSON.stringify(cloudQuiz));

            if (cloudUser.favorites) {
              setFavorites(cloudUser.favorites);
              await AsyncStorage.setItem(fKey, JSON.stringify(cloudUser.favorites));
            }
          } else if (isMounted) {
            // บัญชีใหม่ในระบบ Cloud ให้บันทึกข้อมูลเริ่มต้นขึ้น Firestore
            const initialData = {
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
            };
            await saveFirestoreUser(user.id, initialData);
          }
        }
      } catch (err) {
        console.warn("Error loading user data:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }

      if (isMounted) {
        await fetchCloudPool();
      }
    }

    loadUserData();

    // ดึงข้อมูล Pool ทุก 15 วินาที
    const interval = setInterval(fetchCloudPool, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, fetchCloudPool]);

  // บันทึกคำตอบ Quiz ทีละหมวดหมู่
  const saveCategoryAnswers = async (categoryId, answers, questionOrder) => {
    if (!user) return false;
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

      await AsyncStorage.setItem(getQuizKey(user.id), JSON.stringify(newQuizData));
      setQuizResponse(newQuizData);

      // บันทึกขึ้น Cloud Firestore
      if (isFirebaseConfigured()) {
        await saveFirestoreUser(user.id, {
          completedCategories: currentCompleted,
          categoryAnswers: updatedCategoryAnswers,
          hasCompletedQuiz: currentCompleted.length === 4,
          updatedAt: new Date().toISOString(),
        });
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
    if (!user) return false;
    try {
      const updated = {
        ...profile,
        ...partialProfile,
        name: partialProfile.name !== undefined ? partialProfile.name : (profile.name || user.name || ""),
        email: user.email || profile.email || "",
        socialLinks: {
          ...profile.socialLinks,
          ...(partialProfile.socialLinks || {}),
        },
      };

      await AsyncStorage.setItem(getProfileKey(user.id), JSON.stringify(updated));
      setProfile(updated);

      // บันทึกขึ้น Cloud Firestore
      if (isFirebaseConfigured()) {
        await saveFirestoreUser(user.id, {
          name: updated.name,
          email: updated.email,
          image: updated.image || user.image || null,
          gender: updated.gender,
          bio: updated.bio,
          socialLinks: updated.socialLinks,
          galleryImages: updated.galleryImages,
          updatedAt: new Date().toISOString(),
        });
      }

      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // เพิ่มรูปภาพลง Gallery
  const addGalleryImage = async (uri) => {
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
  };

  // ลบรูปภาพออกจาก Gallery
  const removeGalleryImage = async (imageId) => {
    const updatedGallery = profile.galleryImages
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({ ...img, order: idx }));

    await updateProfile({ galleryImages: updatedGallery });
    return true;
  };

  // สลับสถานะ Favorite
  const toggleFavorite = async (targetUserId) => {
    if (!user) return false;
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

      await AsyncStorage.setItem(getFavoritesKey(user.id), JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);

      if (isFirebaseConfigured()) {
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

  const isFavorite = (targetUserId) => favorites.includes(targetUserId);

  const getMatchList = () => getMatches(quizResponse, usersPool);

  const getUserById = (targetUserId) => usersPool.find((u) => u.id === targetUserId) || null;

  const resetQuizData = async () => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(getQuizKey(user.id), JSON.stringify(defaultQuizResponse));
      setQuizResponse(defaultQuizResponse);

      if (isFirebaseConfigured()) {
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

  const resetAllData = async () => {
    if (!user) return;
    try {
      await AsyncStorage.multiRemove([
        getProfileKey(user.id),
        getQuizKey(user.id),
        getFavoritesKey(user.id),
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
