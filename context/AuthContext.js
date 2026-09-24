import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform, NativeModules } from "react-native";

let GoogleSignin = null;
if (Platform.OS !== "web") {
  try {
    const gSigninModule = require("@react-native-google-signin/google-signin");
    GoogleSignin = gSigninModule.GoogleSignin;
  } catch (e) {
    // รันบน Expo Go หรือสภาพแวดล้อมที่ยังไม่ได้คอมไพล์เนทีฟ
  }
}

try {
  if (Platform.OS !== "web") {
    WebBrowser.maybeCompleteAuthSession();
  }
} catch (e) {
  // ป้องกันข้อผิดพลาด iframe บน Web
}

const AUTH_STORAGE_KEY = "@friendq_auth_session";
const BLOCKED_USERS_STORAGE_PREFIX = "@mindclick_blocked_users_";
const REPORTS_STORAGE_KEY = "@mindclick_reports_history";

// -------------------------------------------------------------
// Google Client ID
// -------------------------------------------------------------
export const GOOGLE_CONFIG = {
  webClientId: "702542015984-unuf8133kals37q2s2pc81r4vugrep10.apps.googleusercontent.com",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [blockedUserIds, setBlockedUserIds] = useState([]);

  // โหลด Session และรายการที่ถูกบล็อกจาก AsyncStorage ตอนเริ่มต้นแอป
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          if (parsed?.id) {
            const blockedRaw = await AsyncStorage.getItem(`${BLOCKED_USERS_STORAGE_PREFIX}${parsed.id}`);
            if (blockedRaw) {
              setBlockedUserIds(JSON.parse(blockedRaw));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load stored auth session:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  // กำหนดค่า GoogleSignin บน Native เมื่อเริ่มต้นแอป
  useEffect(() => {
    if (Platform.OS !== "web" && GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_CONFIG.webClientId,
        });
      } catch (e) {
        console.warn("GoogleSignin configure error:", e);
      }
    }
  }, []);

  // บันทึก Session ลง AsyncStorage
  const saveUserSession = async (userData) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setAuthError(null);
      if (userData?.id) {
        const blockedRaw = await AsyncStorage.getItem(`${BLOCKED_USERS_STORAGE_PREFIX}${userData.id}`);
        if (blockedRaw) {
          setBlockedUserIds(JSON.parse(blockedRaw));
        }
      }
    } catch (e) {
      console.error("Error saving auth session:", e);
    }
  };

  // อัปเดตข้อมูล Session ของ User ปัจจุบัน (เช่น เมื่อแก้ชื่อหรือรูปโปรไฟล์)
  const updateUserSession = async (partialData) => {
    try {
      const currentStored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const baseUser = currentStored ? JSON.parse(currentStored) : user || {};
      const updatedUser = {
        ...baseUser,
        ...partialData,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (e) {
      console.error("Error updating user session:", e);
    }
  };

  // สลับโหมดใช้งานจริง / โหมดสาธิตพรีเซนต์อาจารย์
  const toggleDemoMode = async () => {
    const currentMode = Boolean(user?.isDemoMode);
    const nextMode = !currentMode;
    const updated = await updateUserSession({ isDemoMode: nextMode });
    return updated?.isDemoMode;
  };

  // บล็อกผู้ใช้ (Block User)
  const blockUser = async (targetUserId, targetName = "ผู้ใช้งาน") => {
    if (!targetUserId) return;
    const nextBlocked = Array.from(new Set([...blockedUserIds, targetUserId]));
    setBlockedUserIds(nextBlocked);
    if (user?.id) {
      await AsyncStorage.setItem(
        `${BLOCKED_USERS_STORAGE_PREFIX}${user.id}`,
        JSON.stringify(nextBlocked)
      );
    }
    return nextBlocked;
  };

  // ปลดบล็อกผู้ใช้ (Unblock User)
  const unblockUser = async (targetUserId) => {
    if (!targetUserId) return;
    const nextBlocked = blockedUserIds.filter((id) => id !== targetUserId);
    setBlockedUserIds(nextBlocked);
    if (user?.id) {
      await AsyncStorage.setItem(
        `${BLOCKED_USERS_STORAGE_PREFIX}${user.id}`,
        JSON.stringify(nextBlocked)
      );
    }
    return nextBlocked;
  };

  // ส่งรายงานพฤติกรรมหรือเนื้อหา (Report Content/User)
  const submitReport = async (reportData) => {
    try {
      const raw = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const newReport = {
        id: `rep_${Date.now()}`,
        reporterId: user?.id || "guest",
        ...reportData,
      };
      const updated = [newReport, ...list];
      await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error("Error saving report:", e);
      return false;
    }
  };

  // ยืนยันอีเมลนักศึกษา
  const verifyStudentEmail = async (studentEmail) => {
    if (!studentEmail || !studentEmail.includes("@")) return false;
    const isEduDomain = studentEmail.endsWith(".ac.th") || studentEmail.includes(".edu");
    const updatedUser = await updateUserSession({
      studentEmail: studentEmail.trim().toLowerCase(),
      isStudentVerified: true,
      isEduDomain,
    });
    return updatedUser;
  };

  // เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัยสงขลานครินทร์ (@psu.ac.th) เท่านั้น
  const signInWithPsuEmail = async (email, customName) => {
    setAuthError(null);
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError("กรุณากรอกอีเมลมหาวิทยาลัย");
      return false;
    }
    if (!cleanEmail.endsWith("@psu.ac.th")) {
      setAuthError("กรุณาใช้อีเมลมหาวิทยาลัยสงขลานครินทร์ (@psu.ac.th) เท่านั้น");
      return false;
    }

    const studentPrefix = cleanEmail.split("@")[0];
    const derivedName = customName || studentPrefix;
    const psuUser = {
      id: "psu_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"),
      name: derivedName,
      email: cleanEmail,
      studentEmail: cleanEmail,
      isStudentVerified: true,
      provider: "psu_email",
    };

    await saveUserSession(psuUser);
    return true;
  };

  // เข้าสู่ระบบแบบจำลอง (Demo Mode - แยกขาดจากผู้ใช้จริง ไม่เก็บข้อมูล)
  const signInWithDemo = async (customUser) => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const demoKeys = allKeys.filter(
        (key) =>
          key.includes("user_demo_session") ||
          key.includes("_demo") ||
          key.includes("demo_")
      );
      if (demoKeys.length > 0) {
        await AsyncStorage.multiRemove(demoKeys);
      }
    } catch (cleanErr) {
      console.warn("Error cleaning previous demo storage:", cleanErr);
    }

    const demoUser = customUser || {
      id: "user_demo_session",
      name: "ผู้ใช้สาธิต (Demo)",
      email: "demo@psu.ac.th",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      provider: "psu_email",
      isDemoMode: true,
      isStudentVerified: true,
      studentEmail: "demo@psu.ac.th",
    };
    await saveUserSession(demoUser);
  };

  // ฟังก์ชันเข้าสู่ระบบด้วย Google จริง (เฉพาะ Native Google Sign-In บนอุปกรณ์)
  const signInWithGoogle = async () => {
    setAuthError(null);

    if (Platform.OS === "web") {
      setAuthError("การเข้าสู่ระบบด้วย Google บนเว็บยังไม่เปิดใช้งาน กรุณาใช้งานบนแอปมือถือหรือเข้าสู่ระบบด้วยโหมดสาธิต");
      return;
    }

    if (!GoogleSignin) {
      try {
        const gSigninModule = require("@react-native-google-signin/google-signin");
        GoogleSignin = gSigninModule.GoogleSignin;
      } catch (e) {
        setAuthError("ไม่พบโมดูล Native Google Sign-In ในสภาพแวดล้อมนี้ กรุณาเปิดผ่านไฟล์ติดตั้ง APK หรือใช้โหมดสาธิต");
        return;
      }
    }

    if (!GoogleSignin) {
      setAuthError("อุปกรณ์นี้ไม่รองรับ Native Google Sign-In กรุณาใช้งานผ่านโหมดสาธิต");
      return;
    }

    try {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_CONFIG.webClientId,
        });
      } catch (cfgErr) {
        // ignore if already configured
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const gUser = response.data?.user || response.user || response;
      if (gUser && (gUser.email || gUser.name)) {
        const gEmail = (gUser.email || "").trim().toLowerCase();
        const rawId = gUser.id || gUser.sub || gEmail.replace(/[^a-zA-Z0-9]/g, "_");
        const consistentId = `google_${rawId}`;

        const loggedInUser = {
          id: consistentId,
          name: gUser.name || gEmail.split("@")[0],
          email: gEmail,
          studentEmail: gEmail,
          isStudentVerified: true,
          image: gUser.photo || gUser.photoUrl || gUser.picture || null,
          provider: "google",
        };
        await saveUserSession(loggedInUser);
        return;
      }

      setAuthError("ไม่สามารถดึงข้อมูลบัญชี Google ได้ กรุณาลองใหม่อีกครั้ง");
    } catch (nativeErr) {
      console.warn("Native GoogleSignin error:", nativeErr);
      if (nativeErr.code === "SIGN_IN_CANCELLED" || nativeErr.code === "12501") {
        // ผู้ใช้กดยกเลิกหน้าต่างเลือกบัญชีเอง
        return;
      }
      if (nativeErr.code === "PLAY_SERVICES_NOT_AVAILABLE" || nativeErr.code === "12500") {
        setAuthError("Google Play Services ไม่พร้อมใช้งานในอุปกรณ์นี้");
        return;
      }
      if (nativeErr.code === "DEVELOPER_ERROR" || nativeErr.code === "10") {
        setAuthError("เกิดข้อผิดพลาดในการเชื่อมต่อ (Developer Error 10): ตรวจสอบ SHA-1 ใน Google Cloud Console หรือเข้าใช้งานผ่านโหมดสาธิต");
        return;
      }
      setAuthError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ (" + (nativeErr.message || nativeErr.code || "กรุณาลองใหม่อีกครั้ง") + ")");
    }
  };

  // ออกจากระบบ
  const signOut = async () => {
    try {
      if (Platform.OS !== "web" && GoogleSignin && NativeModules?.RNGoogleSignin) {
        try {
          await GoogleSignin.signOut();
        } catch (e) {
          // ignore
        }
      }
      if (user?.isDemoMode) {
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const demoKeys = allKeys.filter(
            (key) =>
              key.includes("user_demo_session") ||
              key.includes("_demo") ||
              key.includes("demo_")
          );
          if (demoKeys.length > 0) {
            await AsyncStorage.multiRemove(demoKeys);
          }
        } catch (cleanErr) {
          console.warn("Error cleaning demo storage on signOut:", cleanErr);
        }
      }
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        isDemoMode: Boolean(user?.isDemoMode),
        toggleDemoMode,
        blockedUserIds,
        blockUser,
        unblockUser,
        submitReport,
        verifyStudentEmail,
        signInWithPsuEmail,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        setUser,
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
