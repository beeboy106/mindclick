import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { mockUsers } from "../data/mockUsers";
import { getSharedInsights } from "../lib/mindInsight";

const PremiumContext = createContext();

const getPremiumKey = (userId) => `@mindclick_is_premium_${userId || "guest"}`;
const getTrialStartKey = (userId) => `@mindclick_trial_start_${userId || "guest"}`;
const getWelcomeKey = (userId) => `@mindclick_trial_welcome_shown_${userId || "guest"}`;
const getWarningKey = (userId) => `@mindclick_warning_last_shown_${userId || "guest"}`;
const getDevSimKey = (userId) => `@mindclick_dev_sim_state_${userId || "guest"}`;
const getIncognitoKey = (userId) => `@mindclick_is_incognito_${userId || "guest"}`;
const getViewsKey = (userId) => `@mindclick_profile_views_${userId || "guest"}`;

const TRIAL_DAYS = 7;

// ค่าเริ่มต้นสำหรับประวัติการเข้าชมพร้อม Mind-Insight และ Mutual Spark (Zero Emoji Policy)
const initialDemoViews = [
  {
    visitorId: "mock_user_1",
    visitorName: "ฟ้าใส ธนภัทร",
    visitorFaculty: "คณะวิทยาศาสตร์",
    visitorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    matchPercentage: 92,
    isSpark: true,
    sharedInsights: [
      {
        tag: "รสนิยมดนตรี & คอนเสิร์ตตรงกัน",
        color: "#67E8F9",
        icon: "headset-outline",
        icebreakers: [
          "เห็นชอบฟังเพลงและไปคอนเสิร์ตเหมือนกันเลย ช่วงนี้มีศิลปินหรือเพลย์ลิสต์ไหนที่ฟังวนซ้ำๆ บ่อยสุดมั้ย?",
        ],
      },
      {
        tag: "สายเที่ยวพักผ่อน & ตะลุยวันหยุด",
        color: "#86EFAC",
        icon: "compass-outline",
        icebreakers: [
          "เห็นชอบเที่ยวและทำกิจกรรมวันหยุดคล้ายกันเลย ถ้ามีเวลาว่าง 1 วันชอบไปนั่งชิลที่ไหนแถวมหาลัย?",
        ],
      },
    ],
    visitedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 นาทีที่แล้ว
  },
  {
    visitorId: "mock_user_2",
    visitorName: "นนท์ วรเมธ",
    visitorFaculty: "คณะวิศวกรรมศาสตร์",
    visitorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    matchPercentage: 86,
    isSpark: true,
    sharedInsights: [
      {
        tag: "ชอบความท้าทาย & ประสบการณ์ใหม่",
        color: "#FDE047",
        icon: "sparkles-outline",
        icebreakers: [
          "เห็นค่านิยมชอบลองอะไรใหม่ๆ ตรงกันเลย ช่วงนี้กำลังอินกับกิจกรรมหรือโปรเจกต์อะไรอยู่เหรอ?",
        ],
      },
    ],
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 ชั่วโมงที่แล้ว
  },
  {
    visitorId: "mock_user_3",
    visitorName: "แพรว ชนิตา",
    visitorFaculty: "คณะสถาปัตยกรรมศาสตร์",
    visitorImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    matchPercentage: 79,
    isSpark: false,
    sharedInsights: [
      {
        tag: "สไตล์การเปิดบทสนทนาที่เข้ากันได้",
        color: "#F472B6",
        icon: "chatbubbles-outline",
        icebreakers: [
          "เห็นสไตล์การพูดคุยและสร้างเพื่อนใหม่คล้ายกันมาก เลยอยากแวะมาทักทาย ทำความรู้จักกันไว้!",
        ],
      },
    ],
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // เมื่อวานนี้
  },
];

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const { profile, quizResponse, getUserById } = useData();

  // สถานะการสมัครสมาชิกและทดลองใช้
  const [isPaid, setIsPaid] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [lastWarningDate, setLastWarningDate] = useState("");
  const [devSim, setDevSim] = useState(null); // 'day1' | 'day5' | 'expired' | 'paid' | null

  const [isIncognito, setIsIncognito] = useState(false);
  const [profileViews, setProfileViews] = useState([]);
  const [isLoadingPremium, setIsLoadingPremium] = useState(true);

  // โหลดข้อมูลสถานะและประวัติคนเข้าชมเมื่อ User เปลี่ยน
  useEffect(() => {
    if (!user) {
      setIsPaid(false);
      setTrialStartDate(null);
      setHasShownWelcome(false);
      setLastWarningDate("");
      setDevSim(null);
      setIsIncognito(false);
      setProfileViews([]);
      setIsLoadingPremium(false);
      return;
    }

    let isMounted = true;
    async function loadData() {
      try {
        const [
          premVal,
          trialStartVal,
          welcomeVal,
          warningVal,
          simVal,
          incogVal,
          viewsVal,
        ] = await Promise.all([
          AsyncStorage.getItem(getPremiumKey(user.id)),
          AsyncStorage.getItem(getTrialStartKey(user.id)),
          AsyncStorage.getItem(getWelcomeKey(user.id)),
          AsyncStorage.getItem(getWarningKey(user.id)),
          AsyncStorage.getItem(getDevSimKey(user.id)),
          AsyncStorage.getItem(getIncognitoKey(user.id)),
          AsyncStorage.getItem(getViewsKey(user.id)),
        ]);

        if (isMounted) {
          setIsPaid(premVal === "true");
          setHasShownWelcome(welcomeVal === "true");
          setLastWarningDate(warningVal || "");
          setDevSim(simVal || null);
          setIsIncognito(incogVal === "true");

          if (trialStartVal) {
            setTrialStartDate(trialStartVal);
          } else {
            const nowIso = new Date().toISOString();
            setTrialStartDate(nowIso);
            await AsyncStorage.setItem(getTrialStartKey(user.id), nowIso);
          }

          if (viewsVal) {
            try {
              const parsed = JSON.parse(viewsVal);
              const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
              const filtered = (parsed || []).filter(
                (v) => new Date(v.visitedAt).getTime() >= thirtyDaysAgo
              );
              setProfileViews(filtered.length > 0 ? filtered : initialDemoViews);
            } catch {
              setProfileViews(initialDemoViews);
            }
          } else {
            setProfileViews(initialDemoViews);
            await AsyncStorage.setItem(getViewsKey(user.id), JSON.stringify(initialDemoViews));
          }
        }
      } catch (err) {
        console.warn("Error loading bubble user data:", err);
      } finally {
        if (isMounted) setIsLoadingPremium(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // คำนวณจำนวนวันที่เหลือและสถานะการทดลองใช้
  const { daysRemaining, isTrialActive, isBubbleUser } = useMemo(() => {
    if (devSim === "paid") {
      return { daysRemaining: 0, isTrialActive: false, isBubbleUser: true };
    }
    if (devSim === "expired") {
      return { daysRemaining: 0, isTrialActive: false, isBubbleUser: false };
    }
    if (devSim === "day5") {
      // จำลองเหลือ 3 วัน (วันที่ 5 ของการทดลองใช้)
      return { daysRemaining: 3, isTrialActive: true, isBubbleUser: true };
    }
    if (devSim === "day1") {
      // จำลองเหลือ 7 วัน
      return { daysRemaining: 7, isTrialActive: true, isBubbleUser: true };
    }

    if (isPaid) {
      return { daysRemaining: 0, isTrialActive: false, isBubbleUser: true };
    }

    if (!trialStartDate) {
      return { daysRemaining: TRIAL_DAYS, isTrialActive: true, isBubbleUser: true };
    }

    const elapsedMs = Date.now() - new Date(trialStartDate).getTime();
    const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsedMs / (24 * 60 * 60 * 1000)));
    const active = daysLeft > 0;

    return {
      daysRemaining: daysLeft,
      isTrialActive: active,
      isBubbleUser: active || isPaid,
    };
  }, [devSim, isPaid, trialStartDate]);

  // ฟังก์ชันตรวจสอบและส่งสัญญาณแจ้งเตือน 3 วันสุดท้าย (ทำงานในครั้งแรกของวันเมื่อเข้าใช้ฟีเจอร์)
  const checkAndTriggerWarning = useCallback(
    async (featureName = "") => {
      if (isPaid || !isTrialActive || daysRemaining > 3) {
        return { shouldWarn: false, daysRemaining };
      }

      const todayStr = new Date().toISOString().split("T")[0];
      if (lastWarningDate === todayStr) {
        // วันนี้เคยแจ้งเตือนไปแล้ว
        return { shouldWarn: false, daysRemaining };
      }

      // บันทึกว่าวันนี้ได้รับการแจ้งเตือนแล้ว
      setLastWarningDate(todayStr);
      if (user?.id) {
        await AsyncStorage.setItem(getWarningKey(user.id), todayStr);
      }

      return { shouldWarn: true, daysRemaining, featureName };
    },
    [isPaid, isTrialActive, daysRemaining, lastWarningDate, user?.id]
  );

  // ปิดป็อปอัพต้อนรับและบันทึกว่าเคยแสดงแล้ว
  const dismissWelcome = useCallback(async () => {
    setHasShownWelcome(true);
    if (user?.id) {
      await AsyncStorage.setItem(getWelcomeKey(user.id), "true");
    }
  }, [user?.id]);

  // จำลองการชำระเงินอัปเกรดเป็นผู้ใช้ฟองสบู่
  const upgradeToBubble = useCallback(
    async (planId = "quarterly") => {
      setIsPaid(true);
      setDevSim("paid");
      if (user?.id) {
        await AsyncStorage.setItem(getPremiumKey(user.id), "true");
        await AsyncStorage.setItem(getDevSimKey(user.id), "paid");
      }
      return true;
    },
    [user?.id]
  );

  // สลับสถานะสำหรับ Dev / Test (Backward compatibility)
  const togglePremiumMock = useCallback(
    async (targetStatus) => {
      const nextStatus = typeof targetStatus === "boolean" ? targetStatus : !isBubbleUser;
      if (nextStatus) {
        await upgradeToBubble();
      } else {
        setIsPaid(false);
        setDevSim("expired");
        if (user?.id) {
          await AsyncStorage.setItem(getPremiumKey(user.id), "false");
          await AsyncStorage.setItem(getDevSimKey(user.id), "expired");
        }
      }
      return nextStatus;
    },
    [isBubbleUser, upgradeToBubble, user?.id]
  );

  // แผงควบคุมสลับสถานะจำลอง (Dev Simulation)
  const setSimulationState = useCallback(
    async (simKey) => {
      if (simKey === "reset") {
        setDevSim(null);
        setIsPaid(false);
        const nowIso = new Date().toISOString();
        setTrialStartDate(nowIso);
        setHasShownWelcome(false);
        setLastWarningDate("");
        if (user?.id) {
          await AsyncStorage.multiRemove([
            getDevSimKey(user.id),
            getPremiumKey(user.id),
            getWelcomeKey(user.id),
            getWarningKey(user.id),
          ]);
          await AsyncStorage.setItem(getTrialStartKey(user.id), nowIso);
        }
        return;
      }

      setDevSim(simKey);
      if (simKey === "paid") {
        setIsPaid(true);
      } else {
        setIsPaid(false);
      }

      if (simKey === "day5") {
        // ล้างวันที่แจ้งเตือนเพื่อให้ทดสอบการเด้งเตือนครั้งแรกของวันได้ทันที
        setLastWarningDate("");
        if (user?.id) {
          await AsyncStorage.removeItem(getWarningKey(user.id));
        }
      }

      if (user?.id) {
        await AsyncStorage.setItem(getDevSimKey(user.id), simKey);
      }
    },
    [user?.id]
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

  // บันทึกการเข้าชมโปรไฟล์
  const recordProfileView = useCallback(
    async (targetUserId) => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return;
      if (isIncognito) return;

      try {
        const targetViewsKey = getViewsKey(targetUserId);
        const existingRaw = await AsyncStorage.getItem(targetViewsKey);
        let list = existingRaw ? JSON.parse(existingRaw) : [];

        list = list.filter((v) => v.visitorId !== user.id);

        const targetUserObj = getUserById ? getUserById(targetUserId) : null;
        const sharedInsights = getSharedInsights(
          quizResponse?.categoryAnswers,
          targetUserObj?.categoryAnswers
        );

        const matchPct = Math.floor(Math.random() * 20) + 80;

        const newEntry = {
          visitorId: user.id,
          visitorName: profile?.name || user.name || "เพื่อนร่วมแอป",
          visitorFaculty: profile?.faculty || "คณะวิศวกรรมศาสตร์",
          visitorImage: profile?.image || user.image || null,
          matchPercentage: matchPct,
          isSpark: matchPct >= 80,
          sharedInsights,
          visitedAt: new Date().toISOString(),
        };

        const updatedList = [newEntry, ...list].slice(0, 50);
        await AsyncStorage.setItem(targetViewsKey, JSON.stringify(updatedList));

        if (targetUserId === user.id) {
          setProfileViews(updatedList);
        }
      } catch (err) {
        console.warn("Error recording profile view:", err);
      }
    },
    [user, profile, isIncognito, quizResponse, getUserById]
  );

  // เพิ่มผู้เข้าชมแบบ Mock เพื่อทดสอบ
  const addMockProfileView = useCallback(async () => {
    if (!user?.id) return;
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const sharedInsights = getSharedInsights(
      quizResponse?.categoryAnswers,
      randomUser.categoryAnswers
    );
    const matchPct = Math.floor(Math.random() * 20) + 80;

    const mockEntry = {
      visitorId: randomUser.id + "_" + Date.now(),
      visitorName: randomUser.name,
      visitorFaculty: randomUser.faculty || "คณะวิทยาศาสตร์",
      visitorImage: randomUser.image,
      matchPercentage: matchPct,
      isSpark: matchPct >= 80,
      sharedInsights,
      visitedAt: new Date().toISOString(),
    };

    const updated = [mockEntry, ...profileViews];
    setProfileViews(updated);
    await AsyncStorage.setItem(getViewsKey(user.id), JSON.stringify(updated));
  }, [user?.id, profileViews, quizResponse]);

  // ล้างประวัติเพื่อทดสอบ
  const clearProfileViews = useCallback(async () => {
    if (!user?.id) return;
    setProfileViews([]);
    await AsyncStorage.setItem(getViewsKey(user.id), JSON.stringify([]));
  }, [user?.id]);

  const viewCount = profileViews.length;
  const sparkVisitors = profileViews.filter((v) => v.isSpark || v.matchPercentage >= 80);
  const hasSparkVisitor = sparkVisitors.length > 0;
  const topSparkVisitor = sparkVisitors[0] || null;

  return (
    <PremiumContext.Provider
      value={{
        isBubbleUser,
        isPremium: isBubbleUser, // Backward compatibility
        isPaid,
        daysRemaining,
        isTrialActive,
        hasShownWelcome,
        dismissWelcome,
        checkAndTriggerWarning,
        upgradeToBubble,
        devSim,
        setSimulationState,
        isIncognito,
        profileViews,
        viewCount,
        hasSparkVisitor,
        topSparkVisitor,
        sparkVisitorsCount: sparkVisitors.length,
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
