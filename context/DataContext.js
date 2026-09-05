import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUsers } from "../data/mockUsers";
import { getMatches } from "../lib/getMatch";
import { useAuth } from "./AuthContext";

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
  const [usersPool, setUsersPool] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // โหลดข้อมูลทั้งหมดเมื่อเปิดแอป
  useEffect(() => {
    async function initData() {
      try {
        const [storedProfile, storedQuiz, storedFavorites, storedPool] =
          await Promise.all([
            AsyncStorage.getItem(PROFILE_KEY),
            AsyncStorage.getItem(QUIZ_KEY),
            AsyncStorage.getItem(FAVORITES_KEY),
            AsyncStorage.getItem(USERS_POOL_KEY),
          ]);

        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }

        if (storedQuiz) {
          setQuizResponse(JSON.parse(storedQuiz));
        }

        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }

        // ตรวจสอบ Mock Users Pool ถ้ายังไม่มีให้ตั้งค่าเริ่มต้น
        if (storedPool) {
          setUsersPool(JSON.parse(storedPool));
        } else {
          await AsyncStorage.setItem(USERS_POOL_KEY, JSON.stringify(mockUsers));
          setUsersPool(mockUsers);
        }
      } catch (err) {
        console.error("Error initializing local data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    initData();
  }, []);

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
    } catch (err) {
      console.error("Error resetting quiz data:", err);
    }
  };

  // ล้างข้อมูลทั้งหมดเพื่อทดสอบระบบใหม่
  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([PROFILE_KEY, QUIZ_KEY, FAVORITES_KEY]);
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
