import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =======================================================================
// นำ Firebase Config จาก Firebase Console (Project Settings -> General)
// มาวางแทนที่ค่าด้านล่างนี้
// =======================================================================
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
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
