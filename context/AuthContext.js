import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

// Complete any pending auth session (required for web & deep linking)
WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = "@friendq_auth_session";

// -------------------------------------------------------------
// ใส่ Google Client IDs ที่ได้จาก Google Cloud Console ที่นี่:
// -------------------------------------------------------------
export const GOOGLE_CONFIG = {
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Hook สำหรับ Google Auth Request ผ่าน Expo Auth Session
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
  });

  // โหลด Session จาก AsyncStorage ตอนเริ่มต้นแอป
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load stored auth session:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  // เมื่อได้ผลลัพธ์จาก Google OAuth Response
  useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type === "success") {
        const { authentication } = response;
        if (authentication?.accessToken) {
          try {
            // ดึงข้อมูล User Profile จาก Google UserInfo API
            const userInfoResponse = await fetch(
              "https://www.googleapis.com/userinfo/v2/me",
              {
                headers: { Authorization: `Bearer ${authentication.accessToken}` },
              }
            );
            const googleUser = await userInfoResponse.json();

            const loggedInUser = {
              id: googleUser.id || "google_user_" + Date.now(),
              name: googleUser.name || "Google User",
              email: googleUser.email || "",
              image: googleUser.picture || null,
              provider: "google",
            };

            await saveUserSession(loggedInUser);
          } catch (err) {
            console.error("Failed to fetch Google user info:", err);
            setAuthError("ไม่สามารถดึงข้อมูลโปรไฟล์จาก Google ได้");
          }
        }
      } else if (response?.type === "error") {
        setAuthError("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google");
      }
    }

    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  // บันทึก Session ลง AsyncStorage
  const saveUserSession = async (userData) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setAuthError(null);
    } catch (e) {
      console.error("Error saving auth session:", e);
    }
  };

  // ฟังก์ชันกดเข้าสู่ระบบด้วย Google
  const signInWithGoogle = async () => {
    setAuthError(null);

    // ตรวจสอบว่าได้กำหนด Client ID จริงหรือยัง
    const isConfigured =
      GOOGLE_CONFIG.webClientId &&
      !GOOGLE_CONFIG.webClientId.includes("YOUR_WEB_CLIENT_ID");

    if (isConfigured && request) {
      // เรียกหน้าต่างล็อกอิน Google OAuth จริง
      await promptAsync();
    } else {
      // โหมดจำลองสำหรับรันบน Snack Expo ได้ทันที 100% โดยไม่ต้องมี Client ID
      const demoGoogleUser = {
        id: "user_google_demo",
        name: "สมชาย ใจดี",
        email: "somchai.google@gmail.com",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        provider: "google_demo",
      };
      await saveUserSession(demoGoogleUser);
    }
  };

  // ออกจากระบบ
  const signOut = async () => {
    try {
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
        signInWithGoogle,
        signOut,
        setUser,
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
