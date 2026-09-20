import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { mockUsers } from "../data/mockUsers";

const PremiumContext = createContext();

const getPremiumKey = (userId) => `@mindclick_is_premium_${userId || "guest"}`;
const getIncognitoKey = (userId) => `@mindclick_is_incognito_${userId || "guest"}`;
const getViewsKey = (userId) => `@mindclick_profile_views_${userId || "guest"}`;

// ค่าเริ่มต้นสำหรับประวัติการเข้าชมแบบตัวอย่างเพื่อให้นักพัฒนาเห็นภาพทันที
const initialDemoViews = [
  {
    visitorId: "mock_user_1",
    visitorName: "แพรว นภัสสร",
    visitorImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    matchPercentage: 94,
    visitedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 นาทีที่แล้ว
  },
  {
    visitorId: "mock_user_2",
    visitorName: "วิน ภัทรดนัย",
    visitorImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    matchPercentage: 88,
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 ชั่วโมงที่แล้ว
  },
  {
    visitorId: "mock_user_3",
    visitorName: "มีน ธัญญ่า",
    visitorImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    matchPercentage: 82,
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // เมื่อวานนี้
  },
];

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const { profile } = useData();

  const [isPremium, setIsPremium] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [profileViews, setProfileViews] = useState([]);
  const [isLoadingPremium, setIsLoadingPremium] = useState(true);

  // โหลดข้อมูลสถานะและประวัติคนเข้าชมเมื่อ User เปลี่ยน
  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setIsIncognito(false);
      setProfileViews([]);
      setIsLoadingPremium(false);
      return;
    }

    let isMounted = true;
    async function loadData() {
      try {
        const [premVal, incogVal, viewsVal] = await Promise.all([
          AsyncStorage.getItem(getPremiumKey(user.id)),
          AsyncStorage.getItem(getIncognitoKey(user.id)),
          AsyncStorage.getItem(getViewsKey(user.id)),
        ]);

        if (isMounted) {
          setIsPremium(premVal === "true");
          setIsIncognito(incogVal === "true");

          if (viewsVal) {
            try {
              const parsed = JSON.parse(viewsVal);
              // กรองเฉพาะประวัติภายใน 30 วันย้อนหลัง (Rolling 30-Day Window)
              const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
              const filtered = (parsed || []).filter(
                (v) => new Date(v.visitedAt).getTime() >= thirtyDaysAgo
              );
              setProfileViews(filtered);
            } catch {
              setProfileViews(initialDemoViews);
            }
          } else {
            // ใส่ข้อมูลจำลองเริ่มต้นเพื่อให้เห็นฟีเจอร์ชัดเจน
            setProfileViews(initialDemoViews);
            AsyncStorage.setItem(getViewsKey(user.id), JSON.stringify(initialDemoViews));
          }
        }
      } catch (err) {
        console.warn("Error loading premium data:", err);
      } finally {
        if (isMounted) setIsLoadingPremium(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // สลับสถานะ Premium (สำหรับทดสอบ Dev Mode และ Paywall)
  const togglePremiumMock = useCallback(
    async (targetStatus) => {
      const nextStatus = typeof targetStatus === "boolean" ? targetStatus : !isPremium;
      setIsPremium(nextStatus);
      if (user?.id) {
        await AsyncStorage.setItem(getPremiumKey(user.id), String(nextStatus));
      }
      return nextStatus;
    },
    [isPremium, user?.id]
  );

  // สลับโหมดซ่อนตัว (Incognito Mode)
  const toggleIncognito = useCallback(async () => {
    const nextVal = !isIncognito;
    setIsIncognito(nextVal);
    if (user?.id) {
      await AsyncStorage.setItem(getIncognitoKey(user.id), String(nextVal));
    }
    return nextVal;
  }, [isIncognito, user?.id]);

  // บันทึกการเข้าชมโปรไฟล์เมื่อผู้ใช้กดดูหน้า MatchDetailScreen
  const recordProfileView = useCallback(
    async (targetUserId) => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return;
      if (isIncognito) {
        // หากเปิดโหมดซ่อนตัว จะไม่บันทึกร่องรอยใดๆ
        return;
      }

      try {
        const targetViewsKey = getViewsKey(targetUserId);
        const existingRaw = await AsyncStorage.getItem(targetViewsKey);
        let list = existingRaw ? JSON.parse(existingRaw) : [];

        // ลบรายการเดิมของผู้ใช้คนนี้ออกก่อน เพื่ออัปเดต timestamp ใหม่ล่าสุด (De-duplication)
        list = list.filter((v) => v.visitorId !== user.id);

        // ใส่รายการผู้เข้าชมใหม่ไว้บนสุด
        const newEntry = {
          visitorId: user.id,
          visitorName: profile?.name || user.name || "เพื่อนร่วมแอป",
          visitorImage: profile?.image || user.image || null,
          matchPercentage: Math.floor(Math.random() * 25) + 75, // 75 - 99%
          visitedAt: new Date().toISOString(),
        };

        const updatedList = [newEntry, ...list].slice(0, 50); // บันทึกสูงสุด 50 คนล่าสุด
        await AsyncStorage.setItem(targetViewsKey, JSON.stringify(updatedList));

        // หากกำลังเข้าดูโปรไฟล์ตัวเองในกรณีทดสอบ ให้อัปเดต state ทันที
        if (targetUserId === user.id) {
          setProfileViews(updatedList);
        }
      } catch (err) {
        console.warn("Error recording profile view:", err);
      }
    },
    [user, profile, isIncognito]
  );

  // เพิ่มผู้เข้าชมแบบ Mock เพื่อความสะดวกในการทดสอบฟีเจอร์
  const addMockProfileView = useCallback(async () => {
    if (!user?.id) return;
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const mockEntry = {
      visitorId: randomUser.id + "_" + Date.now(),
      visitorName: randomUser.name,
      visitorImage: randomUser.image,
      matchPercentage: Math.floor(Math.random() * 20) + 80,
      visitedAt: new Date().toISOString(),
    };

    const updated = [mockEntry, ...profileViews];
    setProfileViews(updated);
    await AsyncStorage.setItem(getViewsKey(user.id), JSON.stringify(updated));
  }, [user?.id, profileViews]);

  // ล้างประวัติเพื่อทดสอบ
  const clearProfileViews = useCallback(async () => {
    if (!user?.id) return;
    setProfileViews([]);
    await AsyncStorage.setItem(getViewsKey(user.id), JSON.stringify([]));
  }, [user?.id]);

  const viewCount = profileViews.length;

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isIncognito,
        profileViews,
        viewCount,
        isLoadingPremium,
        togglePremiumMock,
        toggleIncognito,
        recordProfileView,
        addMockProfileView,
        clearProfileViews,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
