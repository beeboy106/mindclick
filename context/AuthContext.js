import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

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
    } catch (e) {
      console.error("Error saving auth session:", e);
    }
  };

  // เข้าสู่ระบบแบบจำลอง (Demo Google Account)
  const signInWithDemo = async (customUser) => {
    let demoId = "118198207968490232896";
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) demoId = parsed.id;
      }
    } catch (e) {
      // ignore
    }

    const demoGoogleUser = customUser || {
      id: demoId,
      name: "ณัฐวุฒิ พงศาวสีกุล",
      email: "beemnum2548@gmail.com",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      provider: "google",
    };
    await saveUserSession(demoGoogleUser);
  };

  // ฟังก์ชันเข้าสู่ระบบด้วย Google จริง
  const signInWithGoogle = async () => {
    setAuthError(null);

    const isConfigured =
      GOOGLE_CONFIG.webClientId &&
      !GOOGLE_CONFIG.webClientId.includes("YOUR_WEB_CLIENT_ID");

    if (isConfigured) {
      // 1. บน Native (Android/iOS Development Build) - ใช้ Google Play Services โดยตรง
      if (Platform.OS !== "web" && GoogleSignin) {
        try {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          const response = await GoogleSignin.signIn();
          const gUser = response.data?.user || response.user || response;
          if (gUser && (gUser.email || gUser.name)) {
            const loggedInUser = {
              id: gUser.id || "google_" + Date.now(),
              name: gUser.name || "Google User",
              email: gUser.email || "",
              image: gUser.photo || null,
              provider: "google",
            };
            await saveUserSession(loggedInUser);
            return;
          }
        } catch (nativeErr) {
          console.warn("Native GoogleSignin error:", nativeErr);
          // หากผู้ใช้กดยกเลิก
          if (nativeErr.code === "SIGN_IN_CANCELLED" || nativeErr.code === "12501") {
            return;
          }
          setAuthError(
            nativeErr.message?.includes("DEVELOPER_ERROR")
              ? "กรุณาเพิ่ม SHA-1 ใน Firebase Console ก่อนเข้าสู่ระบบ (ดูขั้นตอนในแชท)"
              : `เกิดข้อผิดพลาดในการล็อกอิน: ${nativeErr.message || nativeErr}`
          );
          return;
        }
      }

      // 2. บน Web (หรือโหมดทดสอบ) - ใช้ Pop-up OAuth ดักจับ Token จาก Hash
      try {
        let redirectUrl = "https://snack-runtime.eascdn.net/v2/54/index.html";
        if (Platform.OS === "web" && typeof window !== "undefined") {
          redirectUrl = window.location.origin + window.location.pathname;
        }

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          GOOGLE_CONFIG.webClientId
        )}&response_type=token&scope=profile%20email&prompt=select_account&redirect_uri=${encodeURIComponent(
          redirectUrl
        )}`;

        let accessToken = null;

        if (Platform.OS === "web" && typeof window !== "undefined") {
          // บน Web ให้เปิด popup window และจับ token จาก hash เมื่อ Google redirect กลับมา
          const popup = window.open(
            authUrl,
            "google_oauth",
            "width=520,height=650,top=100,left=100"
          );

          if (!popup) {
            throw new Error("หน้าต่างล็อกอินถูกเบราว์เซอร์บล็อก (Pop-up blocked)");
          }

          accessToken = await new Promise((resolve) => {
            const timer = setInterval(() => {
              try {
                if (popup.closed) {
                  clearInterval(timer);
                  resolve(null);
                  return;
                }

                // เมื่อ Google redirect กลับมาที่โดเมน snack-runtime.eascdn.net
                if (popup.location && popup.location.href) {
                  const hash = popup.location.hash || "";
                  if (hash.includes("access_token=")) {
                    clearInterval(timer);
                    const params = new URLSearchParams(hash.substring(1));
                    const token = params.get("access_token");
                    try {
                      popup.close();
                    } catch (e) {
                      // ignore
                    }
                    resolve(token);
                  }
                }
              } catch (e) {
                // ขณะอยู่บน accounts.google.com จะติด cross-origin ให้ข้ามไป
              }
            }, 300);

            // Timeout หลังจาก 2 นาที
            setTimeout(() => {
              clearInterval(timer);
              try {
                if (!popup.closed) popup.close();
              } catch (e) {
                // ignore
              }
              resolve(null);
            }, 120000);
          });
        } else {
          // Fallback สำหรับ Native หากไม่ได้ใช้ GoogleSignin
          const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
          if (result.type === "success" && result.url) {
            const params = new URLSearchParams(result.url.split("#")[1] || "");
            accessToken = params.get("access_token");
          }
        }

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
      } catch (err) {
        console.error("Google OAuth error:", err);
      }
    }

    // หากยังไม่สามารถเข้าสู่ระบบได้
    setAuthError("ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง");
  };

  // ออกจากระบบ
  const signOut = async () => {
    try {
      if (Platform.OS !== "web" && GoogleSignin) {
        try {
          await GoogleSignin.signOut();
        } catch (e) {
          // ignore
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
        signInWithGoogle,
        signInWithDemo,
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
