// =======================================================================
// Firebase Firestore REST Client for FriendQ
// 100% Snack Expo Compatible (Zero native dependencies, Zero Snackager errors)
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

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("YOUR_API_KEY") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("YOUR_PROJECT_ID")
  );
};

// แปลงค่าจาก JavaScript Object -> Firestore REST Format
export function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

// แปลงค่าจาก Firestore REST Format -> JavaScript Object
export function fromFirestoreFields(fields) {
  if (!fields) return {};
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if ("stringValue" in v) res[k] = v.stringValue;
    else if ("booleanValue" in v) res[k] = v.booleanValue;
    else if ("integerValue" in v) res[k] = parseInt(v.integerValue, 10);
    else if ("doubleValue" in v) res[k] = v.doubleValue;
    else if ("nullValue" in v) res[k] = null;
    else if ("arrayValue" in v) {
      res[k] = (v.arrayValue.values || []).map((item) => {
        if ("mapValue" in item) return fromFirestoreFields(item.mapValue.fields);
        if ("stringValue" in item) return item.stringValue;
        if ("integerValue" in item) return parseInt(item.integerValue, 10);
        if ("booleanValue" in item) return item.booleanValue;
        return null;
      });
    } else if ("mapValue" in v) {
      res[k] = fromFirestoreFields(v.mapValue.fields);
    }
  }
  return res;
}

// อ่านข้อมูลผู้ใช้ 1 คน
export async function getFirestoreUser(userId) {
  if (!isFirebaseConfigured() || !userId) return null;
  try {
    const url = `${BASE_URL}/users/${encodeURIComponent(userId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return fromFirestoreFields(data.fields);
  } catch (e) {
    console.warn("getFirestoreUser error:", e);
    return null;
  }
}

// บันทึก/อัปเดตข้อมูลผู้ใช้
export async function saveFirestoreUser(userId, userData) {
  if (!isFirebaseConfigured() || !userId) return false;
  try {
    const fields = {};
    for (const [k, v] of Object.entries(userData)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }

    const url = `${BASE_URL}/users/${encodeURIComponent(userId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    return res.ok;
  } catch (e) {
    console.warn("saveFirestoreUser error:", e);
    return false;
  }
}

// ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ เพื่อนำมาคำนวณ Match
export async function getAllFirestoreUsers() {
  if (!isFirebaseConfigured()) return [];
  try {
    const url = `${BASE_URL}/users?pageSize=100&key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map((doc) => {
      const parsed = fromFirestoreFields(doc.fields);
      const docId = doc.name.split("/").pop();
      return {
        id: docId,
        ...parsed,
        isRealUser: true,
      };
    });
  } catch (e) {
    console.warn("getAllFirestoreUsers error:", e);
    return [];
  }
}
