import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = "@friendq_auth_session";

// -------------------------------------------------------------
// ใส่ Google Client ID จาก Google Cloud Console ที่นี่ (ถ้าต้องการใช้จริง)
// -------------------------------------------------------------
export const GOOGLE_CONFIG = {
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

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

  // ฟังก์ชันเข้าสู่ระบบด้วย Google
  const signInWithGoogle = async () => {
    setAuthError(null);

    const isConfigured =
      GOOGLE_CONFIG.webClientId &&
      !GOOGLE_CONFIG.webClientId.includes("YOUR_WEB_CLIENT_ID");

    if (isConfigured) {
      try {
        // เมื่อใส่ Client ID จริง: เรียกหน้าต่าง Google OAuth ผ่าน WebBrowser
        const redirectUrl = "https://auth.expo.io/@anonymous/friendq-mobile";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          GOOGLE_CONFIG.webClientId
        )}&response_type=token&scope=profile%20email&redirect_uri=${encodeURIComponent(
          redirectUrl
        )}`;

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

        if (result.type === "success" && result.url) {
          const params = new URLSearchParams(result.url.split("#")[1] || "");
          const accessToken = params.get("access_token");

          if (accessToken) {
            const userInfoRes = await fetch(
              "https://www.googleapis.com/userinfo/v2/me",
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const googleUser = await userInfoRes.json();

            const loggedInUser = {
              id: googleUser.id || "google_" + Date.now(),
              name: googleUser.name || "Google User",
              email: googleUser.email || "",
              image: googleUser.picture || null,
              provider: "google",
            };
            await saveUserSession(loggedInUser);
            return;
          }
        }
      } catch (err) {
        console.error("Google OAuth error:", err);
      }
    }

    // โหมดจำลองสำหรับ Snack Expo ให้ล็อกอินเป็น Google User ได้ทันที 100%
    const demoGoogleUser = {
      id: "user_google_demo",
      name: "สมชาย ใจดี",
      email: "somchai.google@gmail.com",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      provider: "google",
    };
    await saveUserSession(demoGoogleUser);
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
