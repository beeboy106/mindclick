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
const FIREBASE_AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const FIREBASE_SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1";
let firebaseAuthToken = null;

// Firestore REST ต้องแนบ Firebase ID token เมื่อเปิด Security Rules ใน production
export function setFirebaseAuthToken(token) {
  firebaseAuthToken = token || null;
}

function firestoreHeaders() {
  return {
    "Content-Type": "application/json",
    ...(firebaseAuthToken ? { Authorization: `Bearer ${firebaseAuthToken}` } : {}),
  };
}

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("YOUR_API_KEY") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("YOUR_PROJECT_ID")
  );
};

// แลก Google ID token ที่ได้จาก Native Google Sign-In เป็น Firebase session
export async function signInWithFirebaseGoogle(googleIdToken) {
  if (!isFirebaseConfigured() || !googleIdToken) return null;
  try {
    const res = await fetch(
      `${FIREBASE_AUTH_BASE_URL}/accounts:signInWithIdp?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
          requestUri: "https://mindclick-f4bf4.firebaseapp.com",
          returnSecureToken: true,
          returnIdpCredential: false,
        }),
      }
    );
    if (!res.ok) return null;
    const session = await res.json();
    setFirebaseAuthToken(session.idToken);
    return session;
  } catch (err) {
    console.warn("signInWithFirebaseGoogle error:", err);
    return null;
  }
}

// ต่ออายุ Firebase session ที่เก็บไว้เมื่อเปิดแอปใหม่
export async function refreshFirebaseSession(refreshToken) {
  if (!isFirebaseConfigured() || !refreshToken) return null;
  try {
    const res = await fetch(
      `${FIREBASE_SECURE_TOKEN_URL}/token?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    );
    if (!res.ok) return null;
    const session = await res.json();
    setFirebaseAuthToken(session.id_token);
    return {
      firebaseIdToken: session.id_token,
      firebaseRefreshToken: session.refresh_token,
      firebaseUid: session.user_id,
      firebaseTokenExpiresAt: Date.now() + Number(session.expires_in || 0) * 1000,
    };
  } catch (err) {
    console.warn("refreshFirebaseSession error:", err);
    return null;
  }
}

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

// อ่านข้อมูลผู้ใช้ 1 คน (แยกแยะสถานะ: พบข้อมูล, บัญชีใหม่ 404, หรือเกิดข้อผิดพลาดเครือข่าย/โควตา)
export async function getFirestoreUser(userId) {
  if (!isFirebaseConfigured() || !userId) {
    return { success: false, error: "Firebase not configured or invalid userId" };
  }
  try {
    const url = `${BASE_URL}/users/${encodeURIComponent(userId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, { headers: firestoreHeaders() });
    if (!res.ok) {
      if (res.status === 404) {
        return { success: true, notFound: true, data: null };
      }
      return { success: false, status: res.status, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, notFound: false, data: fromFirestoreFields(data.fields) };
  } catch (e) {
    console.warn("getFirestoreUser error:", e);
    return { success: false, error: e.message || "Network request failed" };
  }
}

// สร้าง Room ID ที่สอดคล้องกันสำหรับคู่สนทนาทั้ง 2 ฝ่าย
export function getChatRoomId(userId1, userId2) {
  if (!userId1 || !userId2) return null;
  return [String(userId1), String(userId2)].sort().join("_");
}

// ค้นหาห้องแชตทั้งหมดของผู้ใช้ เพื่อให้ผู้รับเห็นข้อความแรกแม้ยังไม่มีรายชื่อเพื่อนในเครื่อง
export async function getFirestoreChatRooms(userId) {
  if (!isFirebaseConfigured() || !userId) return [];
  try {
    const url = `${BASE_URL}:runQuery?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: firestoreHeaders(),
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "chats" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "participants" },
              op: "ARRAY_CONTAINS",
              value: { stringValue: String(userId) },
            },
          },
        },
      }),
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return rows
      .filter((row) => row.document)
      .map(({ document }) => ({
        id: document.name.split("/").pop(),
        ...fromFirestoreFields(document.fields),
      }))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (err) {
    console.warn("getFirestoreChatRooms error:", err);
    return [];
  }
}

// ส่งข้อความแชทขึ้น Cloud Firestore เพื่อให้เครื่องคู่สนทนาได้รับ
export async function sendFirestoreChatMessage(senderId, receiverId, text, participantInfo = []) {
  if (!isFirebaseConfigured() || !senderId || !receiverId || !text) return null;
  const roomId = getChatRoomId(senderId, receiverId);
  if (!roomId) return null;

  try {
    const now = new Date();
    const timestamp = now.getTime();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const msgData = {
      senderId,
      receiverId,
      text: text.trim(),
      createdAt: timeStr,
      timestamp,
    };

    // 1. สร้าง/อัปเดตหัวห้องก่อน เพื่อให้ Security Rules ของข้อความตรวจ participant ได้
    const roomFields = {
      participants: toFirestoreValue([senderId, receiverId]),
      participantInfo: toFirestoreValue(participantInfo),
      lastMessage: toFirestoreValue(text.trim()),
      lastSenderId: toFirestoreValue(senderId),
      updatedAt: toFirestoreValue(timestamp),
      lastTime: toFirestoreValue(timeStr),
    };

    const roomUrl = `${BASE_URL}/chats/${encodeURIComponent(roomId)}?key=${firebaseConfig.apiKey}`;
    const roomRes = await fetch(roomUrl, {
      method: "PATCH",
      headers: firestoreHeaders(),
      body: JSON.stringify({ fields: roomFields }),
    });

    if (!roomRes.ok) {
      console.warn("sendFirestoreChatMessage room update failed:", roomRes.status);
      return null;
    }

    // 2. บันทึกข้อความลง Sub-collection messages
    const msgFields = {};
    for (const [k, v] of Object.entries(msgData)) {
      msgFields[k] = toFirestoreValue(v);
    }
    const postUrl = `${BASE_URL}/chats/${encodeURIComponent(roomId)}/messages?key=${firebaseConfig.apiKey}`;
    const postRes = await fetch(postUrl, {
      method: "POST",
      headers: firestoreHeaders(),
      body: JSON.stringify({ fields: msgFields }),
    });

    if (postRes.ok) {
      const data = await postRes.json();
      const msgId = data.name ? data.name.split("/").pop() : `msg_${timestamp}`;
      return { id: msgId, ...msgData };
    }
    console.warn("sendFirestoreChatMessage failed:", postRes.status, roomRes.status);
    return null;
  } catch (err) {
    console.warn("sendFirestoreChatMessage error:", err);
    return null;
  }
}

// ดึงรายการข้อความแชทในห้องจาก Cloud Firestore
export async function getFirestoreChatMessages(userId1, userId2) {
  if (!isFirebaseConfigured() || !userId1 || !userId2) return [];
  const roomId = getChatRoomId(userId1, userId2);
  if (!roomId) return [];

  try {
    const url = `${BASE_URL}/chats/${encodeURIComponent(roomId)}/messages?pageSize=100&key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, { headers: firestoreHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];

    const messages = data.documents.map((doc) => {
      const parsed = fromFirestoreFields(doc.fields);
      const msgId = doc.name.split("/").pop();
      return {
        id: msgId,
        ...parsed,
      };
    });

    // เรียงตามเวลาเก่า -> ใหม่
    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return messages;
  } catch (err) {
    console.warn("getFirestoreChatMessages error:", err);
    return [];
  }
}
