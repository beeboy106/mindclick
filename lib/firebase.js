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

// บันทึก/อัปเดตข้อมูลผู้ใช้ (Merge update เฉพาะฟิลด์ที่ส่งมา พร้อม fallback สร้างเอกสารใหม่)
export async function saveFirestoreUser(userId, userData) {
  if (!isFirebaseConfigured() || !userId) return false;
  try {
    const fields = {};
    const maskParams = [];
    for (const [k, v] of Object.entries(userData)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
        maskParams.push(`updateMask.fieldPaths=${encodeURIComponent(k)}`);
      }
    }

    const maskQuery = maskParams.length > 0 ? `&${maskParams.join("&")}` : "";
    const url = `${BASE_URL}/users/${encodeURIComponent(userId)}?key=${firebaseConfig.apiKey}${maskQuery}`;
    let res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });

    // หากยังไม่มี Document บน Cloud (404 Not Found) ให้สร้างขึ้นมาใหม่โดยไม่ใส่ updateMask
    if (!res.ok && res.status === 404) {
      const createUrl = `${BASE_URL}/users/${encodeURIComponent(userId)}?key=${firebaseConfig.apiKey}`;
      res = await fetch(createUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
    }

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

// สร้าง Room ID ที่สอดคล้องกันสำหรับคู่สนทนาทั้ง 2 ฝ่าย
export function getChatRoomId(userId1, userId2) {
  if (!userId1 || !userId2) return null;
  return [String(userId1), String(userId2)].sort().join("_");
}

// ส่งข้อความแชทขึ้น Cloud Firestore เพื่อให้เครื่องคู่สนทนาได้รับ
export async function sendFirestoreChatMessage(senderId, receiverId, text) {
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

    // 1. บันทึกข้อความลง Sub-collection messages
    const msgFields = {};
    for (const [k, v] of Object.entries(msgData)) {
      msgFields[k] = toFirestoreValue(v);
    }

    const postUrl = `${BASE_URL}/chats/${encodeURIComponent(roomId)}/messages?key=${firebaseConfig.apiKey}`;
    const postRes = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: msgFields }),
    });

    // 2. อัปเดตข้อมูลหัวห้องแชท (Last message และ Participants)
    const roomFields = {
      participants: toFirestoreValue([senderId, receiverId]),
      lastMessage: toFirestoreValue(text.trim()),
      lastSenderId: toFirestoreValue(senderId),
      updatedAt: toFirestoreValue(timestamp),
      lastTime: toFirestoreValue(timeStr),
    };

    const roomUrl = `${BASE_URL}/chats/${encodeURIComponent(roomId)}?key=${firebaseConfig.apiKey}`;
    await fetch(roomUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: roomFields }),
    });

    if (postRes.ok) {
      const data = await postRes.json();
      const msgId = data.name ? data.name.split("/").pop() : `msg_${timestamp}`;
      return { id: msgId, ...msgData };
    }
    return { id: `msg_${timestamp}`, ...msgData };
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
    const res = await fetch(url);
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

// บันทึกหรืออัปเดตโพสต์ลง Cloud Firestore (คอลเลกชัน posts)
export async function saveFirestorePost(post) {
  if (!isFirebaseConfigured() || !post?.id) return false;
  try {
    const fields = {};
    for (const [k, v] of Object.entries(post)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    const url = `${BASE_URL}/posts/${encodeURIComponent(post.id)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    return res.ok;
  } catch (e) {
    console.warn("saveFirestorePost error:", e);
    return false;
  }
}

// ดึงรายการโพสต์ทั้งหมดจาก Cloud Firestore
export async function getFirestorePosts() {
  if (!isFirebaseConfigured()) return null;
  try {
    const url = `${BASE_URL}/posts?pageSize=100&key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!data.documents) return [];

    const posts = data.documents.map((doc) => {
      const parsed = fromFirestoreFields(doc.fields);
      const docId = doc.name.split("/").pop();
      return {
        id: docId,
        ...parsed,
        likes: Array.isArray(parsed.likes) ? parsed.likes : [],
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      };
    });

    // เรียงลำดับจากโพสต์ใหม่สุดไปเก่าสุด
    posts.sort((a, b) => {
      const timeA = a.timestamp || (a.id?.startsWith("post_") ? parseInt(a.id.replace("post_", ""), 10) : 0);
      const timeB = b.timestamp || (b.id?.startsWith("post_") ? parseInt(b.id.replace("post_", ""), 10) : 0);
      return timeB - timeA;
    });

    return posts;
  } catch (e) {
    console.warn("getFirestorePosts error:", e);
    return null;
  }
}

// ลบโพสต์ออกจาก Cloud Firestore
export async function deleteFirestorePost(postId) {
  if (!isFirebaseConfigured() || !postId) return false;
  try {
    const url = `${BASE_URL}/posts/${encodeURIComponent(postId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    console.warn("deleteFirestorePost error:", e);
    return false;
  }
}

