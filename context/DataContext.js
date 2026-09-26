import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUsers } from "../data/mockUsers";
import { getMatches } from "../lib/getMatch";
import { useAuth } from "./AuthContext";
import {
  isFirebaseConfigured,
  getFirestoreUser,
} from "../lib/firebase";
import {
  isSupabaseConfigured,
  getSupabaseAccount,
  upsertSupabaseProfile,
  upsertSupabaseQuiz,
  getSupabaseDirectory,
  setSupabaseFavorite,
} from "../lib/supabaseApi";

const USERS_POOL_KEY = "@friendq_users_pool";

// ฟังก์ชันสร้างคีย์แยกเฉพาะแต่ละ User เพื่อไม่ให้ข้อมูลปนกันตอนสลับบัญชี
const getProfileKey = (userId) => `@friendq_profile_${userId || "guest"}`;
const getQuizKey = (userId) => `@friendq_quiz_${userId || "guest"}`;
const getQuizPendingKey = (userId) => `@friendq_quiz_pending_${userId || "guest"}`;
const getFavoritesKey = (userId) => `@friendq_favorites_${userId || "guest"}`;
const getPolicyKey = (userId) => `@friendq_policy_${userId || "guest"}`;

const defaultProfile = {
  name: "",
  email: "",
  gender: "prefer_not_to_say",
  faculty: "",
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

const profileFromSupabase = (row, user) => ({
  ...defaultProfile,
  name: row?.display_name || user?.name || "",
  email: user?.email || "",
  image: row?.avatar_url || user?.image || null,
  gender: row?.gender || "prefer_not_to_say",
  faculty: row?.faculty || "",
  bio: row?.bio || "",
  socialLinks: { ...defaultProfile.socialLinks, ...(row?.social_links || {}) },
  galleryImages: row?.gallery_images || [],
});

const directoryUserFromSupabase = (row) => {
  const quiz = Array.isArray(row?.quiz) ? row.quiz[0] : row?.quiz;
  return {
    id: row.legacy_user_id,
    name: row.display_name,
    image: row.avatar_url,
    gender: row.gender,
    faculty: row.faculty,
    bio: row.bio,
    socialLinks: row.social_links || {},
    galleryImages: row.gallery_images || [],
    completedCategories: quiz?.completed_categories || [],
    categoryAnswers: quiz?.category_answers || [],
    isRealUser: true,
  };
};

// ฟังก์ชันตรวจสอบความสมบูรณ์ของโปรไฟล์ (ต้องกรอกให้ครบถ้วนก่อนตอบคำถามแมตช์)
export function checkProfileCompletion(profile, user) {
  const name = (profile?.name || user?.name || "").trim();
  const image = profile?.image || user?.image;
  const gender = profile?.gender;
  const bio = (profile?.bio || "").trim();
  const socialLinks = profile?.socialLinks || {};

  const hasName = Boolean(name && name.length > 0);
  const hasImage = Boolean(image && typeof image === "string" && image.trim().length > 0);
  const hasGender = Boolean(gender && gender !== "prefer_not_to_say");
  const hasBio = Boolean(bio && bio.length > 0);
  const hasSocial = Object.values(socialLinks).some(
    (v) => typeof v === "string" && v.trim().length > 0
  );

  const missingFields = [];
  if (!hasImage) missingFields.push("รูปโปรไฟล์");
  if (!hasName) missingFields.push("ชื่อผู้ใช้งาน");
  if (!hasGender) missingFields.push("เพศ");
  if (!hasBio) missingFields.push("คำแนะนำตัว");
  if (!hasSocial) missingFields.push("ช่องทางติดต่อ (อย่างน้อย 1 ช่องทาง)");

  const isComplete = missingFields.length === 0;

  return {
    isComplete,
    hasName,
    hasImage,
    hasGender,
    hasBio,
    hasSocial,
    missingFields,
  };
}

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user, updateUserSession, isDemoMode = false } = useAuth();

  const [profile, setProfile] = useState(defaultProfile);
  const [quizResponse, setQuizResponse] = useState(defaultQuizResponse);
  const [favorites, setFavorites] = useState([]);
  const [usersPool, setUsersPool] = useState([]);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(true); // เริ่มต้น true ระหว่างโหลด
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ดึงรายชื่อผู้ใช้จาก Supabase สำหรับคำนวณ Match (ข้ามเมื่ออยู่ในโหมดสาธิต)
  const fetchCloudPool = useCallback(async () => {
    if (isDemoMode) {
      setUsersPool(mockUsers);
      return;
    }
    if (!isSupabaseConfigured() || !user?.firebaseIdToken) return;
    try {
      const result = await getSupabaseDirectory(user.firebaseIdToken);
      const realUsers = (result?.profiles || [])
        .map(directoryUserFromSupabase)
        .filter((u) => u.id !== user?.id && u.categoryAnswers.length > 0);

      setUsersPool(realUsers);
      await AsyncStorage.setItem(USERS_POOL_KEY, JSON.stringify(realUsers));
    } catch (err) {
      console.warn("Error fetching Supabase users pool; keeping cached pool:", err);
    }
  }, [user?.id, user?.firebaseIdToken, isDemoMode]);

  // ซิงค์ข้อมูลเมื่อผู้ใช้ล็อกอิน สลับบัญชี หรือออกจากระบบ
  useEffect(() => {
    // 1. ถ้าออกจากระบบ ให้ล้าง state ทั้งหมดทันที ไม่ให้ข้อมูลคนเก่าค้าง
    if (!user) {
      setProfile(defaultProfile);
      setQuizResponse(defaultQuizResponse);
      setFavorites([]);
      setHasAcceptedPolicy(true);
      setIsLoadingData(false);
      return;
    }

    let isMounted = true;
    setIsLoadingData(true);

    async function loadUserData() {
      const pKey = getProfileKey(user.id);
      const qKey = getQuizKey(user.id);
      const fKey = getFavoritesKey(user.id);
      const polKey = getPolicyKey(user.id);

      try {
        // ก. โหลดข้อมูลแคชเฉพาะของ User นี้ในเครื่องก่อน
        const [localProfile, localQuiz, localFavs, localPolicy, localPool, localQuizPending] = await Promise.all([
          AsyncStorage.getItem(pKey),
          AsyncStorage.getItem(qKey),
          AsyncStorage.getItem(fKey),
          AsyncStorage.getItem(polKey),
          AsyncStorage.getItem(USERS_POOL_KEY),
          AsyncStorage.getItem(getQuizPendingKey(user.id)),
        ]);

        if (isMounted) {
          if (localPool && !isDemoMode) {
            try {
              const parsedPool = JSON.parse(localPool);
              if (Array.isArray(parsedPool) && parsedPool.length > 0) {
                setUsersPool(parsedPool);
              }
            } catch (poolErr) {
              // ignore parse error
            }
          }
          if (localProfile) {
            const parsed = JSON.parse(localProfile);
            setProfile(parsed);
            if (updateUserSession && (parsed.name || parsed.image) && (parsed.name !== user.name || parsed.image !== user.image)) {
              updateUserSession({
                name: parsed.name || user.name,
                image: parsed.image || user.image,
              });
            }
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

          if (localPolicy === "true") {
            setHasAcceptedPolicy(true);
          } else {
            setHasAcceptedPolicy(false);
          }
        }

        // ข. Supabase เป็น source of truth สำหรับโปรไฟล์ แบบทดสอบ และรายการโปรด
        if (isSupabaseConfigured() && user.firebaseIdToken && !isDemoMode) {
          try {
            let account = await getSupabaseAccount(user.firebaseIdToken);

            // ย้ายบัญชีเดิมแบบ lazy migration ครั้งแรก โดยใช้ local cache ก่อน และอ่าน Firestore เพียงครั้งเดียวถ้าจำเป็น
            if (!account?.profile) {
              let legacy = null;
              if (isFirebaseConfigured()) {
                const legacyResult = await getFirestoreUser(user.id);
                if (legacyResult.success && !legacyResult.notFound) legacy = legacyResult.data;
              }
              const cachedProfile = localProfile ? JSON.parse(localProfile) : null;
              const cachedQuiz = localQuiz ? JSON.parse(localQuiz) : null;
              const seedProfile = legacy || cachedProfile || {};
              const seedQuiz = legacy
                ? { completedCategories: legacy.completedCategories || [], categoryAnswers: legacy.categoryAnswers || [] }
                : cachedQuiz || defaultQuizResponse;

              await upsertSupabaseProfile(user.firebaseIdToken, {
                legacyUserId: user.id,
                name: seedProfile.name || user.name || "Google User",
                image: seedProfile.image || user.image || null,
                gender: seedProfile.gender || "prefer_not_to_say",
                faculty: seedProfile.faculty || "",
                bio: seedProfile.bio || "",
                socialLinks: seedProfile.socialLinks || {},
                galleryImages: seedProfile.galleryImages || [],
                hasAcceptedPolicy: Boolean(legacy?.hasAcceptedPolicy || localPolicy === "true"),
                policyAcceptedAt: legacy?.policyAcceptedAt || null,
              });
              if (seedQuiz.categoryAnswers.length || seedQuiz.completedCategories.length) {
                await upsertSupabaseQuiz(user.firebaseIdToken, seedQuiz);
              }
              account = await getSupabaseAccount(user.firebaseIdToken);
            }

            if (account?.profile && localQuizPending === "true" && localQuiz) {
              await upsertSupabaseQuiz(user.firebaseIdToken, JSON.parse(localQuiz));
              await AsyncStorage.removeItem(getQuizPendingKey(user.id));
              account = await getSupabaseAccount(user.firebaseIdToken);
            }

            if (account?.profile && isMounted) {
              const cloudProfile = profileFromSupabase(account.profile, user);
              const cloudQuiz = {
                completedCategories: account.quiz?.completed_categories || [],
                categoryAnswers: account.quiz?.category_answers || [],
              };
              const cloudFavorites = account.favorites || [];
              setProfile(cloudProfile);
              setQuizResponse(cloudQuiz);
              setFavorites(cloudFavorites);
              await Promise.all([
                AsyncStorage.setItem(pKey, JSON.stringify(cloudProfile)),
                AsyncStorage.setItem(qKey, JSON.stringify(cloudQuiz)),
                AsyncStorage.setItem(fKey, JSON.stringify(cloudFavorites)),
              ]);
              if (account.profile.has_accepted_policy) {
                setHasAcceptedPolicy(true);
                await AsyncStorage.setItem(polKey, "true");
              }
              if (updateUserSession && (cloudProfile.name || cloudProfile.image)) {
                await updateUserSession({ name: cloudProfile.name, image: cloudProfile.image });
              }
            }
          } catch (cloudError) {
            console.warn("Cannot reach Supabase, keeping local data:", cloudError);
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

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.firebaseIdToken, isDemoMode, fetchCloudPool]);

  // บันทึกคำตอบ Quiz ทีละหมวดหมู่
  const saveCategoryAnswers = async (categoryId, answers, questionOrder) => {
    if (!user) return { success: false };
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

      if (isSupabaseConfigured() && user.firebaseIdToken && !isDemoMode) {
        try {
          await upsertSupabaseQuiz(user.firebaseIdToken, {
            completedCategories: currentCompleted,
            categoryAnswers: updatedCategoryAnswers,
          });
          await AsyncStorage.removeItem(getQuizPendingKey(user.id));
        } catch (cloudError) {
          await AsyncStorage.setItem(getQuizPendingKey(user.id), "true");
          console.warn("saveCategoryAnswers: Supabase save failed:", cloudError);
          return { success: true, cloudError: true };
        }
        fetchCloudPool();
      }

      return { success: true };
    } catch (err) {
      console.error("Error saving category answers:", err);
      return { success: false };
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

      if (isSupabaseConfigured() && user.firebaseIdToken && !isDemoMode) {
        await upsertSupabaseProfile(user.firebaseIdToken, {
          legacyUserId: user.id,
          name: updated.name,
          image: updated.image || user.image || null,
          gender: updated.gender,
          faculty: updated.faculty || "",
          bio: updated.bio,
          socialLinks: updated.socialLinks,
          galleryImages: updated.galleryImages,
          hasAcceptedPolicy,
        });
      }

      await AsyncStorage.setItem(getProfileKey(user.id), JSON.stringify(updated));
      setProfile(updated);

      if (updateUserSession) {
        await updateUserSession({
          name: updated.name,
          image: updated.image || user.image || null,
        });
      }

      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // เพิ่มรูปภาพลง Gallery
  const addGalleryImage = async (uri, additionalProfileData = {}) => {
    if (profile.galleryImages.length >= 9) {
      return { success: false, error: "อัลบั้มรูปภาพสามารถใส่ได้สูงสุด 9 รูป" };
    }

    const newImage = {
      id: "gallery_" + Date.now(),
      url: uri,
      order: profile.galleryImages.length,
    };

    const updatedGallery = [...profile.galleryImages, newImage];
    await updateProfile({
      galleryImages: updatedGallery,
      ...additionalProfileData,
    });
    return { success: true };
  };

  // Save a multi-select gallery upload in one profile update. Updating once
  // prevents a later upload from overwriting an earlier one with stale state.
  const addGalleryImages = async (uris, additionalProfileData = {}) => {
    const availableSlots = Math.max(0, 9 - profile.galleryImages.length);
    const acceptedUris = (uris || []).filter(Boolean).slice(0, availableSlots);
    if (!acceptedUris.length) {
      return { success: false, error: "อัลบั้มรูปภาพสามารถใส่ได้สูงสุด 9 รูป" };
    }

    const timestamp = Date.now();
    const newImages = acceptedUris.map((uri, index) => ({
      id: `gallery_${timestamp}_${index}`,
      url: uri,
      order: profile.galleryImages.length + index,
    }));
    await updateProfile({
      galleryImages: [...profile.galleryImages, ...newImages],
      ...additionalProfileData,
    });
    return { success: true, added: newImages.length };
  };

  // ลบรูปภาพออกจาก Gallery
  const removeGalleryImage = async (imageId, additionalProfileData = {}) => {
    const updatedGallery = profile.galleryImages
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({ ...img, order: idx }));

    await updateProfile({
      galleryImages: updatedGallery,
      ...additionalProfileData,
    });
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

      if (isSupabaseConfigured() && user.firebaseIdToken && !isDemoMode) {
        await setSupabaseFavorite(user.firebaseIdToken, targetUserId, isNowFavorited);
      }

      await AsyncStorage.setItem(getFavoritesKey(user.id), JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);

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
      if (isSupabaseConfigured() && user.firebaseIdToken && !isDemoMode) {
        await upsertSupabaseQuiz(user.firebaseIdToken, {
          completedCategories: [],
          categoryAnswers: [],
        });
      }
      await AsyncStorage.setItem(getQuizKey(user.id), JSON.stringify(defaultQuizResponse));
      await AsyncStorage.removeItem(getQuizPendingKey(user.id));
      setQuizResponse(defaultQuizResponse);
    } catch (err) {
      console.error("Error resetting quiz data:", err);
    }
  };

  // ยินยอมนโยบายการเก็บข้อมูล (PDPA Consent)
  const acceptPolicy = async () => {
    if (!user) return;
    try {
      if (isSupabaseConfigured() && user.firebaseIdToken && !isDemoMode) {
        await upsertSupabaseProfile(user.firebaseIdToken, {
          legacyUserId: user.id,
          name: profile.name || user.name || "Google User",
          image: profile.image || user.image || null,
          gender: profile.gender,
          faculty: profile.faculty,
          bio: profile.bio,
          socialLinks: profile.socialLinks,
          galleryImages: profile.galleryImages,
          hasAcceptedPolicy: true,
          policyAcceptedAt: new Date().toISOString(),
        });
      }
      setHasAcceptedPolicy(true);
      const polKey = getPolicyKey(user.id);
      await AsyncStorage.setItem(polKey, "true");
    } catch (err) {
      console.warn("Error accepting policy:", err);
    }
  };

  const resetAllData = async () => {
    if (!user) return;
    try {
      await AsyncStorage.multiRemove([
        getProfileKey(user.id),
        getQuizKey(user.id),
        getQuizPendingKey(user.id),
        getFavoritesKey(user.id),
        getPolicyKey(user.id),
      ]);
      setProfile(defaultProfile);
      setQuizResponse(defaultQuizResponse);
      setFavorites([]);
      setUsersPool(mockUsers);
      setHasAcceptedPolicy(false);
    } catch (err) {
      console.error("Error resetting all data:", err);
    }
  };

  const profileCompletion = checkProfileCompletion(profile, user);
  const isProfileComplete = profileCompletion.isComplete;

  return (
    <DataContext.Provider
      value={{
        profile,
        quizResponse,
        favorites,
        usersPool,
        isLoadingData,
        hasAcceptedPolicy,
        acceptPolicy,
        saveCategoryAnswers,
        updateProfile,
        addGalleryImage,
        addGalleryImages,
        removeGalleryImage,
        toggleFavorite,
        isFavorite,
        getMatchList,
        getUserById,
        resetQuizData,
        resetAllData,
        refreshPool: fetchCloudPool,
        isProfileComplete,
        profileCompletion,
        checkProfileCompletion,
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
