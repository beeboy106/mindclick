import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { mockUsers } from "../data/mockUsers";

const POSTS_STORAGE_KEY = "@mindclick_feed_posts";
const STATUS_STORAGE_PREFIX = "@mindclick_user_status_";
const CHATS_STORAGE_PREFIX = "@mindclick_chats_";
const FRIENDS_STORAGE_PREFIX = "@mindclick_friends_";

// Mock โพสต์เริ่มต้น (อ้างอิงจากตัวอย่างหน้าจอ)
const INITIAL_POSTS = [
  {
    id: "post_init_1",
    authorId: "user_mock_aphisak",
    authorName: "Aphisak Phutsupha",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    authorEmail: "aphisak@example.com",
    content: "สวัสดีเพื่อนๆ Mindclick ทุกคนครับ ใครที่ชอบด้านดนตรีหรือไปเที่ยววันหยุด ทักมาคุยแลกเปลี่ยนกันได้นะ 🎵⛺",
    image: null,
    createdAt: "16 ก.ย. 2569 15:38",
    likes: ["user_mock_1"],
    comments: [
      {
        id: "c_1",
        userId: "user_mock_1",
        userName: "ฟ้าใส ธนภัทร",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        content: "สวัสดีค่ะ ไว้ชวนไปฟังดนตรีสดด้วยกันนะคะ",
        createdAt: "16 ก.ย. 2569 15:45",
      },
    ],
  },
  {
    id: "post_init_2",
    authorId: "user_mock_janon",
    authorName: "Janon Kingkohyao",
    authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    authorEmail: "janon@example.com",
    content: "วันนี้มีใครไปอ่านหนังสือหรือทำงานที่หอสมุดบ้างไหมครับ หาเพื่อนติวและพูดคุยเรื่องโปรเจกต์ 📚💻",
    image: null,
    createdAt: "16 ก.ย. 2569 14:10",
    likes: ["user_mock_2", "user_mock_aphisak"],
    comments: [],
  },
];

// รายชื่อเพื่อนที่เคยคุยด้วย (อ้างอิงจากรายชื่อ Friends ในรูปหน้าจอ)
const DEFAULT_FRIENDS = [
  {
    id: "user_mock_aphisak",
    name: "Aphisak Phutsupha",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    status: "online",
    lastMessage: "สะดวกคุยไหมครับเรื่องผลแมตช์",
    lastTime: "15:38",
    unread: 1,
  },
  {
    id: "user_mock_janon",
    name: "Janon Kingkohyao",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    status: "offline",
    lastMessage: "ขอบคุณครับ เจอกันพรุ่งนี้",
    lastTime: "14:15",
    unread: 0,
  },
  {
    id: "user_mock_kedtisak",
    name: "KEDTISAK RAKRUAUG",
    avatar: null,
    status: "offline",
    lastMessage: "ยินดีที่ได้รู้จักครับ",
    lastTime: "เมื่อวาน",
    unread: 0,
  },
  {
    id: "user_mock_sarawut",
    name: "Sarawut Dara",
    avatar: null,
    status: "offline",
    lastMessage: "สวัสดีครับผม",
    lastTime: "12 ก.ย.",
    unread: 0,
  },
  {
    id: "user_mock_1",
    name: "ฟ้าใส ธนภัทร",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    status: "online",
    lastMessage: "สวัสดีค่ะ เราแมตช์กัน 4 ด้านเลย!",
    lastTime: "เมื่อวาน",
    unread: 1,
  },
];

const FeedContext = createContext();

export function FeedProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [posts, setPosts] = useState([]);
  const [userStatus, setUserStatusState] = useState("online"); // 'online' | 'busy' | 'offline'
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);
  const [chats, setChats] = useState({}); // { [friendId]: [ { id, senderId, text, createdAt } ] }
  const [isLoading, setIsLoading] = useState(true);

  // โหลดโพสต์ สถานะ และประวัติแชทจาก AsyncStorage
  useEffect(() => {
    async function loadData() {
      try {
        // 1. โหลดโพสต์
        const storedPosts = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        } else {
          setPosts(INITIAL_POSTS);
          await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
        }

        // 2. โหลดสถานะของผู้ใช้
        const storedStatus = await AsyncStorage.getItem(`${STATUS_STORAGE_PREFIX}${userId}`);
        if (storedStatus) {
          setUserStatusState(storedStatus);
        }

        // 3. โหลดรายชื่อเพื่อนและแชท
        const storedFriends = await AsyncStorage.getItem(`${FRIENDS_STORAGE_PREFIX}${userId}`);
        if (storedFriends) {
          setFriends(JSON.parse(storedFriends));
        } else {
          setFriends(DEFAULT_FRIENDS);
          await AsyncStorage.setItem(`${FRIENDS_STORAGE_PREFIX}${userId}`, JSON.stringify(DEFAULT_FRIENDS));
        }

        // 4. โหลดประวัติแชท
        const storedChats = await AsyncStorage.getItem(`${CHATS_STORAGE_PREFIX}${userId}`);
        if (storedChats) {
          setChats(JSON.parse(storedChats));
        } else {
          // เตรียมข้อความเริ่มต้นสำหรับเพื่อนบางคน
          const initialChatMap = {
            user_mock_aphisak: [
              {
                id: "msg_1",
                senderId: "user_mock_aphisak",
                text: "สวัสดีครับ เห็นว่าเราตอบคำถามตรงกันหลายด้านเลย",
                createdAt: "15:30",
              },
              {
                id: "msg_2",
                senderId: "user_mock_aphisak",
                text: "สะดวกคุยไหมครับเรื่องผลแมตช์",
                createdAt: "15:38",
              },
            ],
            user_mock_1: [
              {
                id: "msg_3",
                senderId: "user_mock_1",
                text: "สวัสดีค่ะ เราแมตช์กัน 4 ด้านเลย!",
                createdAt: "10:20",
              },
            ],
          };
          setChats(initialChatMap);
          await AsyncStorage.setItem(`${CHATS_STORAGE_PREFIX}${userId}`, JSON.stringify(initialChatMap));
        }
      } catch (err) {
        console.error("Error loading feed data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // ฟังก์ชันจัดเก็บโพสต์ลง AsyncStorage
  const savePosts = async (newPosts) => {
    setPosts(newPosts);
    try {
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(newPosts));
    } catch (err) {
      console.error("Error saving posts:", err);
    }
  };

  // 1. สร้างโพสต์ใหม่
  const addPost = useCallback(
    async ({ content, image = null }) => {
      const now = new Date();
      const dateStr = `${now.getDate()} ${now.toLocaleString("th-TH", { month: "short" })} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newPost = {
        id: `post_${Date.now()}`,
        authorId: userId,
        authorName: user?.name || "ฉัน",
        authorAvatar: user?.image || null,
        authorEmail: user?.email || "",
        content: content.trim(),
        image: image || null,
        createdAt: dateStr,
        likes: [],
        comments: [],
      };

      const updated = [newPost, ...posts];
      await savePosts(updated);
      return newPost;
    },
    [posts, user, userId]
  );

  // 2. ลบโพสต์ (เฉพาะโพสต์ของตนเอง)
  const deletePost = useCallback(
    async (postId) => {
      const updated = posts.filter((p) => p.id !== postId);
      await savePosts(updated);
    },
    [posts]
  );

  // 3. กดถูกใจ / ยกเลิกถูกใจ (Toggle Like)
  const toggleLike = useCallback(
    async (postId) => {
      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        const hasLiked = (p.likes || []).includes(userId);
        const newLikes = hasLiked
          ? p.likes.filter((id) => id !== userId)
          : [...(p.likes || []), userId];
        return { ...p, likes: newLikes };
      });
      await savePosts(updated);
    },
    [posts, userId]
  );

  // 4. เพิ่มความคิดเห็น (Comment)
  const addComment = useCallback(
    async (postId, commentText) => {
      if (!commentText || !commentText.trim()) return;

      const now = new Date();
      const dateStr = `${now.getDate()} ${now.toLocaleString("th-TH", { month: "short" })} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newComment = {
        id: `c_${Date.now()}`,
        userId: userId,
        userName: user?.name || "ฉัน",
        userAvatar: user?.image || null,
        content: commentText.trim(),
        createdAt: dateStr,
      };

      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
        };
      });

      await savePosts(updated);
    },
    [posts, user, userId]
  );

  // 5. เปลี่ยนสถานะผู้ใช้ (ออนไลน์ / ห้ามรบกวน / ออฟไลน์)
  const setUserStatus = useCallback(
    async (status) => {
      setUserStatusState(status);
      try {
        await AsyncStorage.setItem(`${STATUS_STORAGE_PREFIX}${userId}`, status);
      } catch (err) {
        console.error("Error saving status:", err);
      }
    },
    [userId]
  );

  // 6. ส่งข้อความแชท 1-on-1
  const sendMessage = useCallback(
    async (friendId, text) => {
      if (!text || !text.trim()) return;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newMsg = {
        id: `msg_${Date.now()}`,
        senderId: userId,
        text: text.trim(),
        createdAt: timeStr,
      };

      const currentFriendMsgs = chats[friendId] || [];
      const updatedFriendMsgs = [...currentFriendMsgs, newMsg];
      const updatedChats = {
        ...chats,
        [friendId]: updatedFriendMsgs,
      };

      setChats(updatedChats);

      // อัปเดตข้อความล่าสุดในรายชื่อเพื่อน
      setFriends((prevFriends) => {
        const updated = prevFriends.map((f) =>
          f.id === friendId
            ? { ...f, lastMessage: text.trim(), lastTime: timeStr, unread: 0 }
            : f
        );
        AsyncStorage.setItem(`${FRIENDS_STORAGE_PREFIX}${userId}`, JSON.stringify(updated)).catch(
          (err) => console.error("Error saving friends in sendMessage:", err)
        );
        return updated;
      });

      try {
        await AsyncStorage.setItem(
          `${CHATS_STORAGE_PREFIX}${userId}`,
          JSON.stringify(updatedChats)
        );
      } catch (err) {
        console.error("Error saving chats:", err);
      }
    },
    [chats, userId]
  );

  // 7. มาร์กแชทว่าอ่านแล้ว
  const markAsRead = useCallback((friendId) => {
    setFriends((prev) => {
      const updated = prev.map((f) => (f.id === friendId ? { ...f, unread: 0 } : f));
      AsyncStorage.setItem(`${FRIENDS_STORAGE_PREFIX}${userId}`, JSON.stringify(updated)).catch(
        (err) => console.error("Error saving friends in markAsRead:", err)
      );
      return updated;
    });
  }, [userId]);

  // 8. เริ่มแชทกับคู่แมตช์ / บุคคลใหม่ (Spark Opener & Add to Friends)
  const startChatWithUser = useCallback(
    async (targetUser, initialMessage = null) => {
      if (!targetUser) return null;
      const targetId = targetUser.id || targetUser.visitorId;
      if (!targetId) return null;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const displayName = targetUser.name || targetUser.visitorName || "เพื่อน Mindclick";
      const displayAvatar = targetUser.image || targetUser.avatar || targetUser.visitorAvatar || null;

      let targetFriend;
      let nextFriends = [...friends];
      const existingIndex = nextFriends.findIndex((f) => f.id === targetId);

      if (existingIndex >= 0) {
        targetFriend = {
          ...nextFriends[existingIndex],
          name: displayName,
          avatar: displayAvatar,
          ...(initialMessage ? { lastMessage: initialMessage, lastTime: timeStr, unread: 0 } : {}),
        };
        // เลื่อนคนนี้ขึ้นมาบนสุดของรายการแชท
        nextFriends.splice(existingIndex, 1);
        nextFriends.unshift(targetFriend);
      } else {
        targetFriend = {
          id: targetId,
          name: displayName,
          avatar: displayAvatar,
          status: "online",
          lastMessage: initialMessage || "เริ่มบทสนทนาใหม่",
          lastTime: timeStr,
          unread: 0,
        };
        nextFriends.unshift(targetFriend);
      }

      setFriends(nextFriends);

      let nextChats = { ...chats };
      if (initialMessage && initialMessage.trim()) {
        const newMsg = {
          id: `msg_${Date.now()}`,
          senderId: userId,
          text: initialMessage.trim(),
          createdAt: timeStr,
        };
        const currentMsgs = nextChats[targetId] || [];
        nextChats[targetId] = [...currentMsgs, newMsg];
        setChats(nextChats);
      }

      try {
        await AsyncStorage.setItem(
          `${FRIENDS_STORAGE_PREFIX}${userId}`,
          JSON.stringify(nextFriends)
        );
        if (initialMessage && initialMessage.trim()) {
          await AsyncStorage.setItem(
            `${CHATS_STORAGE_PREFIX}${userId}`,
            JSON.stringify(nextChats)
          );
        }
      } catch (err) {
        console.error("Error saving startChatWithUser:", err);
      }

      return targetFriend;
    },
    [friends, chats, userId]
  );

  // คำนวณจำนวนแจ้งเตือนแชทที่ยังไม่ได้อ่าน
  const totalUnreadCount = friends.reduce((sum, f) => sum + (f.unread || 0), 0);

  return (
    <FeedContext.Provider
      value={{
        posts,
        isLoading,
        userStatus,
        setUserStatus,
        addPost,
        deletePost,
        toggleLike,
        addComment,
        friends,
        chats,
        sendMessage,
        markAsRead,
        startChatWithUser,
        totalUnreadCount,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
}
