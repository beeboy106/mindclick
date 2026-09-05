import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =======================================================================
// Firebase Config สำหรับโปรเจกต์ Mindclick
// =======================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyDBYnMIPYSpcVVp60X2Qny8FRPilnoZSsQ",
  authDomain: "mindclick-f4bf4.firebaseapp.com",
  projectId: "mindclick-f4bf4",
  storageBucket: "mindclick-f4bf4.firebasestorage.app",
  messagingSenderId: "702542015984",
  appId: "1:702542015984:web:dd08ad2b1cb2c210d28135",
  measurementId: "G-196BS65ESH",
};

// ตรวจสอบว่าผู้ใช้ใส่ Config จริงแล้วหรือยัง
export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes("YOUR_API_KEY") &&
    Boolean(firebaseConfig.projectId) &&
    !firebaseConfig.projectId.includes("YOUR_PROJECT_ID")
  );
};

let dbInstance = null;

export const getDb = () => {
  if (!dbInstance && isFirebaseConfigured()) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      dbInstance = getFirestore(app);
    } catch (err) {
      console.warn("Firebase initialization warning:", err);
    }
  }
  return dbInstance;
};
