import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { usePremium } from "./PremiumContext";
import { mockUsers } from "../data/mockUsers";
import { sendChatNotification } from "../lib/notificationService";
import {
  sendFirestoreChatMessage,
  getFirestoreChatMessages,
  saveFirestorePost,
  getFirestorePosts,
  deleteFirestorePost,
} from "../lib/firebase";

const POSTS_STORAGE_KEY = "@mindclick_feed_posts";
const STATUS_STORAGE_PREFIX = "@mindclick_user_status_";
const CHATS_STORAGE_PREFIX = "@mindclick_chats_";
const FRIENDS_STORAGE_PREFIX = "@mindclick_friends_";
const DAILY_POST_STORAGE_PREFIX = "@mindclick_daily_posts_";
export const DAILY_POST_LIMIT = 2;

// 4 หมวดกระทู้หลัก + แท็บฟีด
export const FORUM_TOPICS = [
  { id: "all", label: "ฟีด", description: "เรื่องราวทั่วไปและทุกกระทู้รวมกัน" },
  { id: "movies_series", label: "หนัง&ซีรีย์", description: "รีวิว แนะนำหนังและซีรีย์น่าดู", placeholder: "แชร์รีวิวหนัง ซีรีย์ที่น่าดู หรือฉากที่ชอบ..." },
  { id: "hobbies", label: "งานอดิเรก", description: "ศิลปะ ดนตรี ท่องเที่ยว งานอดิเรกสร้างสรรค์", placeholder: "แชร์งานอดิเรก ฝีมือดนตรี ศิลปะ หรือทริปท่องเที่ยว..." },
  { id: "news", label: "ข่าวสาร", description: "สาระความรู้ ข่าวสารทันเหตุการณ์และเทคโนโลยี", placeholder: "แชร์ข่าวสาร สาระความรู้ หรือประเด็นน่าสนใจ..." },
  { id: "boardgames", label: "บอร์ดเกม", description: "แนะนำเกม นัดเล่นบอร์ดเกม แลกเปลี่ยนกลยุทธ์", placeholder: "ชวนเล่นบอร์ดเกม แนะนำเกมสนุกๆ หรือถามกติกา..." },
];

// Mock โพสต์เริ่มต้น (ครอบคลุมทั้งฟีดทั่วไปและ 4 หมวดกระทู้)
const INITIAL_POSTS = [
  {
    id: "post_init_1",
    authorId: "user_mock_aphisak",
    authorName: "Aphisak Phutsupha",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    authorEmail: "aphisak@example.com",
    authorIsBubbleUser: true,
    topicId: "hobbies",
    content: "สวัสดีเพื่อนๆ Mindclick ทุกคนครับ ใครที่ชอบด้านดนตรีหรือไปเที่ยววันหยุด ทักมาคุยแลกเปลี่ยนกันได้นะ",
    image: null,
    createdAt: "16 ก.ย. 2569 15:38",
    likes: ["user_mock_1"],
    comments: [
      {
        id: "c_1",
        userId: "user_mock_1",
        userName: "ฟ้าใส ธนภัทร",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        isBubbleUser: true,
        content: "สวัสดีค่ะ ไว้ชวนไปฟังดนตรีสดด้วยกันนะคะ",
        createdAt: "16 ก.ย. 2569 15:45",
        parentId: null,
        replyTo: null,
      },
      {
        id: "c_1_rep",
        userId: "user_mock_aphisak",
        userName: "Aphisak Phutsupha",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        isBubbleUser: true,
        content: "ยินดีเลยครับ มีร้านแถวเอกมัยเล่นดีมาก ไว้ไปด้วยกันนะ",
        createdAt: "16 ก.ย. 2569 15:50",
        parentId: "c_1",
        replyTo: {
          commentId: "c_1",
          userName: "ฟ้าใส ธนภัทร",
        },
      },
    ],
  },
  {
    id: "post_init_movie",
    authorId: "user_mock_1",
    authorName: "ฟ้าใส ธนภัทร",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    authorEmail: "fasai@example.com",
    authorIsBubbleUser: true,
    topicId: "movies_series",
    content: "เพิ่งดูซีรีย์เรื่องใหม่จบไป เนื้อเรื่องลุ้นหักมุมมาก มีใครกำลังดูเรื่องนี้อยู่บ้าง มาคุยกันได้นะ",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    createdAt: "16 ก.ย. 2569 16:20",
    likes: ["user_mock_aphisak"],
    comments: [
      {
        id: "c_m1",
        userId: "user_mock_janon",
        userName: "Janon Kingkohyao",
        userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
        isBubbleUser: false,
        content: "เรื่องอะไรเหรอครับ กำลังหาซีรีย์ดูวันหยุดพอดีเลย แนะนำหน่อยครับ",
        createdAt: "16 ก.ย. 2569 16:30",
        parentId: null,
        replyTo: null,
      },
    ],
  },
  {
    id: "post_init_boardgame",
    authorId: "user_mock_kedtisak",
    authorName: "KEDTISAK RAKRUAUG",
    authorAvatar: null,
    authorEmail: "kedtisak@example.com",
    authorIsBubbleUser: false,
    topicId: "boardgames",
    content: "เสาร์-อาทิตย์นี้ มีใครสนใจเล่น Catan หรือ Dixit แถวสยามไหมครับ ขาดอีก 2 คน บอร์ดเกมเมอร์มือใหม่ยินดีต้อนรับครับ",
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80",
    createdAt: "16 ก.ย. 2569 10:45",
    likes: ["user_mock_janon"],
    comments: [
      {
        id: "c_b1",
        userId: "user_mock_aphisak",
        userName: "Aphisak Phutsupha",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        isBubbleUser: true,
        content: "สนใจครับ เล่น Catan ประจำเลย ว่างช่วงบ่ายครับ",
        createdAt: "16 ก.ย. 2569 11:15",
        parentId: null,
        replyTo: null,
      },
      {
        id: "c_b2",
        userId: "user_mock_kedtisak",
        userName: "KEDTISAK RAKRUAUG",
        userAvatar: null,
        isBubbleUser: false,
        content: "ยอดเยี่ยมเลยครับ เดี๋ยวส่งโลเคชั่นร้านให้ในแชทนะ",
        createdAt: "16 ก.ย. 2569 11:20",
        parentId: "c_b1",
        replyTo: {
          commentId: "c_b1",
          userName: "Aphisak Phutsupha",
        },
      },
    ],
  },
  {
    id: "post_init_news",
    authorId: "user_mock_sarawut",
    authorName: "Sarawut Dara",
    authorAvatar: null,
    authorEmail: "sarawut@example.com",
    authorIsBubbleUser: false,
    topicId: "news",
    content: "อัปเดตเทรนด์ AI และเทคโนโลยีในปี 2026 ตอนนี้มีเครื่องมือใหม่ๆ ช่วยพัฒนาแอปได้เร็วขึ้นเยอะมาก มีใครลองใช้ตัวไหนบ้างแล้วครับ",
    image: null,
    createdAt: "16 ก.ย. 2569 12:00",
    likes: ["user_mock_1", "user_mock_aphisak"],
    comments: [],
  },
  {
    id: "post_init_2",
    authorId: "user_mock_janon",
    authorName: "Janon Kingkohyao",
    authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    authorEmail: "janon@example.com",
    authorIsBubbleUser: false,
    topicId: null,
    content: "วันนี้มีใครไปอ่านหนังสือหรือทำงานที่หอสมุดบ้างไหมครับ หาเพื่อนติวและพูดคุยเรื่องโปรเจกต์",
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
    isBubbleUser: true,
    status: "online",
    lastMessage: "สะดวกคุยไหมครับเรื่องผลแมตช์",
    lastTime: "15:38",
    unread: 1,
  },
  {
    id: "user_mock_janon",
    name: "Janon Kingkohyao",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    isBubbleUser: false,
    status: "busy",
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
  const { user, isDemoMode = false, blockedUserIds = [] } = useAuth();
  const { profile, usersPool } = useData();
  const { isBubbleUser } = usePremium();
  const userId = user?.id || "guest";

  const postsKey = isDemoMode ? "@mindclick_demo_feed_posts" : "@mindclick_prod_feed_posts";
  const friendsKey = isDemoMode ? `@mindclick_demo_friends_${userId}` : `@mindclick_prod_friends_${userId}`;
  const chatsKey = isDemoMode ? `@mindclick_demo_chats_${userId}` : `@mindclick_prod_chats_${userId}`;

  const [posts, setPosts] = useState([]);
  const [dailyPostCount, setDailyPostCount] = useState(0);
  const userPreferenceRef = useRef("online");
  const [userStatus, setUserStatusState] = useState(
    AppState.currentState === "active" ? "online" : "offline"
  );
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState({}); // { [friendId]: [ { id, senderId, text, createdAt } ] }
  const [isLoading, setIsLoading] = useState(true);

  const isSyncingPostsRef = useRef(false);
  const syncCooldownUntilRef = useRef(0);

  // ดึงโพสต์ล่าสุดจาก Cloud Firestore และผสานกับข้อมูลในเครื่อง
  const syncPostsFromFirestore = useCallback(async () => {
    if (isDemoMode || isSyncingPostsRef.current) return;
    if (Date.now() < syncCooldownUntilRef.current) return;

    isSyncingPostsRef.current = true;
    try {
      const cloudPosts = await getFirestorePosts();
      if (cloudPosts === null) {
        // กรณีโควตาจำกัด (429) หรือปัญหาเครือข่าย ให้หน่วงเวลาก่อนลองใหม่ 45 วินาที
        syncCooldownUntilRef.current = Date.now() + 45000;
        return;
      }

      // กรองโพสต์ตัวอย่างออกสำหรับโหมดผู้ใช้จริง
      const realCloudPosts = cloudPosts.filter(
        (p) => !p.id.startsWith("post_init_") && !p.authorId?.startsWith("user_mock_")
      );

      setPosts((prevPosts) => {
        const now = Date.now();
        // เก็บโพสต์ล่าสุดที่ตนเองเพิ่งโพสต์ไปไม่เกิน 20 วินาที เพื่อป้องกันโพสต์หายชั่วคราวก่อน Firestore อัปเดตเสร็จ
        const pendingLocalPosts = (prevPosts || []).filter((p) => {
          const isMine = p.authorId === userId;
          const postTime = p.timestamp || (p.id?.startsWith("post_") ? parseInt(p.id.replace("post_", ""), 10) : 0);
          const isRecent = now - postTime < 20000;
          const existsInCloud = realCloudPosts.some((cp) => cp.id === p.id);
          return isMine && isRecent && !existsInCloud;
        });

        const merged = [...pendingLocalPosts, ...realCloudPosts];
        merged.sort((a, b) => {
          const timeA = a.timestamp || (a.id?.startsWith("post_") ? parseInt(a.id.replace("post_", ""), 10) : 0);
          const timeB = b.timestamp || (b.id?.startsWith("post_") ? parseInt(b.id.replace("post_", ""), 10) : 0);
          return timeB - timeA;
        });

        const prevClean = (prevPosts || []).filter(
          (p) => !p.id.startsWith("post_init_") && !p.authorId?.startsWith("user_mock_")
        );
        if (JSON.stringify(prevClean) === JSON.stringify(merged)) {
          return prevPosts;
        }

        AsyncStorage.setItem(postsKey, JSON.stringify(merged)).catch((err) => {
          console.error("Error caching synced posts:", err);
        });
        return merged;
      });
    } catch (err) {
      console.warn("syncPostsFromFirestore error:", err);
    } finally {
      isSyncingPostsRef.current = false;
    }
  }, [isDemoMode, postsKey, userId]);

  // ซิงค์โพสต์ใหม่จาก Cloud Firestore อัตโนมัติทุกๆ 8 วินาทีเมื่อเปิดแอปใช้งาน
  useEffect(() => {
    if (isDemoMode) return;
    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        syncPostsFromFirestore();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isDemoMode, syncPostsFromFirestore]);

  // โหลดโพสต์ สถานะ และประวัติแชทจาก AsyncStorage ตามโหมด (Real / Demo)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. โหลดโพสต์
        const storedPosts = await AsyncStorage.getItem(postsKey);
        if (storedPosts) {
          const parsed = JSON.parse(storedPosts);
          const cleanPosts = isDemoMode
            ? parsed
            : parsed.filter(
                (p) => !p.id.startsWith("post_init_") && !p.authorId?.startsWith("user_mock_")
              );
          setPosts(cleanPosts);
        } else {
          // โหมดสาธิตพรีเซนต์อาจารย์ = มี Mock Posts เริ่มต้น, โหมดใช้งานจริง = ว่างเปล่าสำหรับผู้ใช้จริง
          const initialPostsData = isDemoMode ? INITIAL_POSTS : [];
          setPosts(initialPostsData);
          await AsyncStorage.setItem(postsKey, JSON.stringify(initialPostsData));
        }

        // หากเป็นโหมดผู้ใช้จริง ซิงค์โพสต์จาก Cloud Firestore
        if (!isDemoMode) {
          syncPostsFromFirestore();
        }

        // 2. โหลดสถานะของผู้ใช้
        const storedStatus = await AsyncStorage.getItem(`${STATUS_STORAGE_PREFIX}${userId}`);
        const pref = storedStatus === "busy" || storedStatus === "online" ? storedStatus : "online";
        userPreferenceRef.current = pref;
        if (AppState.currentState === "active") {
          setUserStatusState(pref);
        } else {
          setUserStatusState("offline");
        }

        // 3. โหลดรายชื่อเพื่อน
        const storedFriends = await AsyncStorage.getItem(friendsKey);
        if (storedFriends) {
          const parsed = JSON.parse(storedFriends);
          const cleanFriends = isDemoMode
            ? parsed
            : parsed.filter((f) => !f.id?.startsWith("user_mock_"));
          setFriends(cleanFriends);
        } else {
          const initialFriendsData = isDemoMode ? DEFAULT_FRIENDS : [];
          setFriends(initialFriendsData);
          await AsyncStorage.setItem(friendsKey, JSON.stringify(initialFriendsData));
        }

        // 4. โหลดประวัติแชท
        const storedChats = await AsyncStorage.getItem(chatsKey);
        if (storedChats) {
          const parsed = JSON.parse(storedChats);
          if (!isDemoMode) {
            // กรองแชทเพื่อน mock ออก
            const cleanChats = {};
            for (const [k, v] of Object.entries(parsed)) {
              if (!k.startsWith("user_mock_")) {
                cleanChats[k] = v;
              }
            }
            setChats(cleanChats);
          } else {
            setChats(parsed);
          }
        } else {
          const initialChatMap = isDemoMode
            ? {
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
              }
            : {};
          setChats(initialChatMap);
          await AsyncStorage.setItem(chatsKey, JSON.stringify(initialChatMap));
        }

        // 5. โหลดสถิติจำนวนโพสต์ประจำวัน
        const todayKey = new Date().toISOString().split("T")[0];
        const storedDailyPosts = await AsyncStorage.getItem(`${DAILY_POST_STORAGE_PREFIX}${userId}_${todayKey}`);
        if (storedDailyPosts) {
          setDailyPostCount(parseInt(storedDailyPosts, 10) || 0);
        } else {
          setDailyPostCount(0);
        }
      } catch (err) {
        console.error("Error loading feed data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [userId, isDemoMode, postsKey, friendsKey, chatsKey]);

  // ติดตามการสลับเข้า-ออกจากแอป (AppState) เพื่อปรับสถานะ 'ออฟไลน์' อัตโนมัติเมื่อออกจากแอป
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        setUserStatusState(userPreferenceRef.current || "online");
      } else {
        setUserStatusState("offline");
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, []);

  // ฟังก์ชันจัดเก็บโพสต์ลง AsyncStorage
  const savePosts = async (newPosts) => {
    setPosts(newPosts);
    try {
      await AsyncStorage.setItem(postsKey, JSON.stringify(newPosts));
    } catch (err) {
      console.error("Error saving posts:", err);
    }
  };

  // รีเซ็ตโควต้าโพสต์ประจำวัน (สำหรับทดสอบ Dev Mode)
  const resetDailyPostQuota = useCallback(async () => {
    setDailyPostCount(0);
    const todayKey = new Date().toISOString().split("T")[0];
    try {
      await AsyncStorage.removeItem(`${DAILY_POST_STORAGE_PREFIX}${userId}_${todayKey}`);
    } catch (err) {
      console.error("Error resetting daily posts:", err);
    }
  }, [userId]);

  // 1. สร้างโพสต์ใหม่ (รองรับ topicId สำหรับกระทู้ และตรวจสอบโควต้าโพสต์)
  const addPost = useCallback(
    async ({ content, image = null, topicId = null, authorName = null, authorAvatar = null }) => {
      // ตรวจสอบโควต้าสำหรับผู้ใช้ปกติ (2 ครั้งต่อวัน)
      if (!isBubbleUser && dailyPostCount >= DAILY_POST_LIMIT) {
        const limitErr = new Error("DAILY_LIMIT_REACHED");
        limitErr.code = "DAILY_LIMIT_REACHED";
        throw limitErr;
      }

      const now = new Date();
      const timestamp = now.getTime();
      const dateStr = `${now.getDate()} ${now.toLocaleString("th-TH", { month: "short" })} ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const resolvedName = authorName || profile?.name || user?.name || "ผู้ใช้งาน";
      const resolvedAvatar = authorAvatar !== undefined && authorAvatar !== null ? authorAvatar : (profile?.image || user?.image || null);

      const newPost = {
        id: `post_${timestamp}`,
        authorId: userId,
        authorName: resolvedName,
        authorAvatar: resolvedAvatar,
        authorEmail: user?.email || profile?.email || "",
        topicId: topicId || null,
        content: content.trim(),
        image: image || null,
        createdAt: dateStr,
        timestamp,
        likes: [],
        comments: [],
        authorIsBubbleUser: Boolean(isBubbleUser),
      };

      const updated = [newPost, ...posts];
      await savePosts(updated);

      // บันทึกขึ้น Cloud Firestore เมื่ออยู่ในโหมดผู้ใช้จริง
      if (!isDemoMode) {
        saveFirestorePost(newPost).catch((err) => {
          console.warn("Failed to save post to Cloud Firestore:", err);
        });
      }

      // บันทึกและปรับปรุงสถิติจำนวนโพสต์วันนี้
      const nextCount = dailyPostCount + 1;
      setDailyPostCount(nextCount);
      const todayKey = new Date().toISOString().split("T")[0];
      try {
        await AsyncStorage.setItem(`${DAILY_POST_STORAGE_PREFIX}${userId}_${todayKey}`, String(nextCount));
      } catch (err) {
        console.error("Error saving daily post count:", err);
      }

      return newPost;
    },
    [posts, user, userId, profile, isBubbleUser, dailyPostCount, isDemoMode]
  );

  // 2. ลบโพสต์ (เฉพาะโพสต์ของตนเอง)
  const deletePost = useCallback(
    async (postId) => {
      const updated = posts.filter((p) => p.id !== postId);
      await savePosts(updated);
      if (!isDemoMode && postId) {
        deleteFirestorePost(postId).catch((err) => {
          console.warn("Failed to delete post from Cloud Firestore:", err);
        });
      }
    },
    [posts, isDemoMode]
  );

  // 3. กดถูกใจ / ยกเลิกถูกใจ (Toggle Like)
  const toggleLike = useCallback(
    async (postId) => {
      let targetPost = null;
      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        const hasLiked = (p.likes || []).includes(userId);
        const newLikes = hasLiked
          ? p.likes.filter((id) => id !== userId)
          : [...(p.likes || []), userId];
        const nextP = { ...p, likes: newLikes };
        targetPost = nextP;
        return nextP;
      });
      await savePosts(updated);
      if (!isDemoMode && targetPost) {
        saveFirestorePost(targetPost).catch((err) => {
          console.warn("Failed to sync like to Cloud Firestore:", err);
        });
      }
    },
    [posts, userId, isDemoMode]
  );

  // 4. เพิ่มความคิดเห็น (Comment) และตอบกลับความคิดเห็น (Reply แบบซ้อน)
  const addComment = useCallback(
    async (postId, commentText, replyInfo = null) => {
      if (!commentText || !commentText.trim()) return;

      const now = new Date();
      const dateStr = `${now.getDate()} ${now.toLocaleString("th-TH", { month: "short" })} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const parentId = replyInfo?.rootId || replyInfo?.parentId || null;
      const targetCommentId = replyInfo?.targetId || replyInfo?.commentId || replyInfo?.id || null;
      const targetUserName = replyInfo?.userName || null;

      const resolvedName = profile?.name || user?.name || "ผู้ใช้งาน";
      const resolvedAvatar = profile?.image || user?.image || null;

      const newComment = {
        id: `c_${Date.now()}`,
        userId: userId,
        userName: resolvedName,
        userAvatar: resolvedAvatar,
        isBubbleUser: Boolean(isBubbleUser),
        content: commentText.trim(),
        createdAt: dateStr,
        parentId: parentId,
        replyTo: targetUserName
          ? {
              commentId: targetCommentId,
              userName: targetUserName,
            }
          : null,
      };

      let targetPost = null;
      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        const nextP = {
          ...p,
          comments: [...(p.comments || []), newComment],
        };
        targetPost = nextP;
        return nextP;
      });

      await savePosts(updated);
      if (!isDemoMode && targetPost) {
        saveFirestorePost(targetPost).catch((err) => {
          console.warn("Failed to sync comment to Cloud Firestore:", err);
        });
      }
    },
    [posts, user, userId, profile, isBubbleUser, isDemoMode]
  );

  // ซิงค์โพสต์และคอมเมนต์ของผู้ใช้ปัจจุบันเมื่อมีการแก้ไขชื่อหรือรูปโปรไฟล์
  useEffect(() => {
    if (!userId || userId === "guest" || (!profile?.name && !profile?.image)) return;

    const currentName = profile?.name || user?.name || "ผู้ใช้งาน";
    const currentImage = profile?.image || user?.image || null;

    let hasChanged = false;
    const syncedPosts = posts.map((post) => {
      let postChanged = false;
      let updatedPost = post;

      if (post.authorId === userId) {
        if (post.authorName !== currentName || post.authorAvatar !== currentImage) {
          updatedPost = {
            ...updatedPost,
            authorName: currentName,
            authorAvatar: currentImage,
          };
          postChanged = true;
        }
      }

      if (updatedPost.comments && updatedPost.comments.length > 0) {
        let commentsChanged = false;
        const updatedComments = updatedPost.comments.map((c) => {
          if (c.userId === userId) {
            if (c.userName !== currentName || c.userAvatar !== currentImage) {
              commentsChanged = true;
              return { ...c, userName: currentName, userAvatar: currentImage };
            }
          }
          return c;
        });

        if (commentsChanged) {
          updatedPost = { ...updatedPost, comments: updatedComments };
          postChanged = true;
        }
      }

      if (postChanged) hasChanged = true;
      return updatedPost;
    });

    if (hasChanged) {
      savePosts(syncedPosts);
    }
  }, [profile?.name, profile?.image, userId, user?.name, user?.image]);

  // 5. เปลี่ยนสถานะผู้ใช้ (ออนไลน์ / ห้ามรบกวน) - ออฟไลน์จะตรวจจับอัตโนมัติตาม AppState
  const setUserStatus = useCallback(
    async (status) => {
      const validStatus = status === "busy" ? "busy" : "online";
      userPreferenceRef.current = validStatus;
      if (AppState.currentState === "active") {
        setUserStatusState(validStatus);
      }
      try {
        await AsyncStorage.setItem(`${STATUS_STORAGE_PREFIX}${userId}`, validStatus);
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
        AsyncStorage.setItem(friendsKey, JSON.stringify(updated)).catch(
          (err) => console.error("Error saving friends in sendMessage:", err)
        );
        return updated;
      });

      try {
        await AsyncStorage.setItem(
          chatsKey,
          JSON.stringify(updatedChats)
        );
      } catch (err) {
        console.error("Error saving chats:", err);
      }

      // ส่งข้อความขึ้น Cloud Firestore ทันทีเมื่อคุยกับผู้ใช้จริง
      if (friendId && !friendId.startsWith("user_mock_")) {
        sendFirestoreChatMessage(userId, friendId, text.trim()).catch((err) => {
          console.warn("Failed to sync message to Cloud Firestore:", err);
        });
      } else if (friendId && isDemoMode && friendId.startsWith("user_mock_")) {
        // จำลองการตอบกลับของเพื่อน (เฉพาะโหมดสาธิตพรีเซนต์อาจารย์หรือเพื่อน mock เท่านั้น)
        setTimeout(async () => {
          const replyText = "ได้รับข้อความแล้วครับ เดี๋ยวสักครู่ตอบกลับนะครับ";
          const replyNow = new Date();
          const replyTimeStr = `${String(replyNow.getHours()).padStart(2, "0")}:${String(replyNow.getMinutes()).padStart(2, "0")}`;

          const replyMsg = {
            id: `msg_rep_${Date.now()}`,
            senderId: friendId,
            text: replyText,
            createdAt: replyTimeStr,
          };

          setChats((prev) => {
            const nextMsgs = [...(prev[friendId] || []), replyMsg];
            const next = { ...prev, [friendId]: nextMsgs };
            AsyncStorage.setItem(chatsKey, JSON.stringify(next)).catch(() => {});
            return next;
          });

          let senderName = "เพื่อน Mindclick";
          setFriends((prevFriends) => {
            const updated = prevFriends.map((f) => {
              if (f.id === friendId) {
                senderName = f.name;
                return {
                  ...f,
                  lastMessage: replyText,
                  lastTime: replyTimeStr,
                  unread: (f.unread || 0) + 1,
                };
              }
              return f;
            });
            AsyncStorage.setItem(friendsKey, JSON.stringify(updated)).catch(() => {});
            return updated;
          });

          // ส่ง Notification เข้าสู่เครื่องจริง (หากไม่ได้อยู่ในโหมดห้ามรบกวน)
          await sendChatNotification({
            senderName,
            messageText: replyText,
            friendId,
            isDndActive: userStatus === "busy",
          });
        }, 3500);
      }
    },
    [chats, userId, friendsKey, chatsKey, isDemoMode, userStatus]
  );

  // ดึงข้อความแชทล่าสุดจาก Cloud Firestore เพื่อให้ได้รับข้อความจากอีกเครื่อง
  const syncChatWithFriend = useCallback(
    async (friendId) => {
      if (!friendId || friendId.startsWith("user_mock_") || !userId) return;
      try {
        const cloudMessages = await getFirestoreChatMessages(userId, friendId);
        if (cloudMessages && cloudMessages.length > 0) {
          setChats((prev) => {
            const currentMsgs = prev[friendId] || [];
            if (currentMsgs.length === cloudMessages.length && currentMsgs.length > 0) {
              const lastCurrent = currentMsgs[currentMsgs.length - 1];
              const lastCloud = cloudMessages[cloudMessages.length - 1];
              if (lastCurrent.id === lastCloud.id) return prev;
            }
            const updated = { ...prev, [friendId]: cloudMessages };
            AsyncStorage.setItem(chatsKey, JSON.stringify(updated)).catch(() => {});
            return updated;
          });

          const lastMsg = cloudMessages[cloudMessages.length - 1];
          if (lastMsg) {
            setFriends((prevFriends) => {
              const updated = prevFriends.map((f) =>
                f.id === friendId
                  ? {
                      ...f,
                      lastMessage: lastMsg.text,
                      lastTime: lastMsg.createdAt || f.lastTime,
                    }
                  : f
              );
              AsyncStorage.setItem(friendsKey, JSON.stringify(updated)).catch(() => {});
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn("syncChatWithFriend error:", err);
      }
    },
    [userId, chatsKey, friendsKey]
  );

  // 7. มาร์กแชทว่าอ่านแล้ว
  const markAsRead = useCallback((friendId) => {
    setFriends((prev) => {
      const updated = prev.map((f) => (f.id === friendId ? { ...f, unread: 0 } : f));
      AsyncStorage.setItem(friendsKey, JSON.stringify(updated)).catch(
        (err) => console.error("Error saving friends in markAsRead:", err)
      );
      return updated;
    });
  }, [friendsKey]);

  // 8. เริ่มแชทกับคู่แมตช์ / บุคคลใหม่ (Spark Opener & Add to Friends & Dark Room Migration)
  const startChatWithUser = useCallback(
    async (targetUser, initialMessage = null, initialChatHistory = null) => {
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

      const latestMessageText =
        initialChatHistory && initialChatHistory.length > 0
          ? initialChatHistory[initialChatHistory.length - 1].text
          : initialMessage || "เริ่มบทสนทนาใหม่";

      if (existingIndex >= 0) {
        targetFriend = {
          ...nextFriends[existingIndex],
          name: displayName,
          avatar: displayAvatar,
          lastMessage: latestMessageText,
          lastTime: timeStr,
          unread: 0,
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
          lastMessage: latestMessageText,
          lastTime: timeStr,
          unread: 0,
        };
        nextFriends.unshift(targetFriend);
      }

      setFriends(nextFriends);

      let nextChats = { ...chats };
      let currentMsgs = [...(nextChats[targetId] || [])];

      if (initialChatHistory && Array.isArray(initialChatHistory) && initialChatHistory.length > 0) {
        currentMsgs = [...currentMsgs, ...initialChatHistory];
      } else if (initialMessage && initialMessage.trim()) {
        const newMsg = {
          id: `msg_${Date.now()}`,
          senderId: userId,
          text: initialMessage.trim(),
          createdAt: timeStr,
        };
        currentMsgs.push(newMsg);
      }

      nextChats[targetId] = currentMsgs;
      setChats(nextChats);

      try {
        await AsyncStorage.setItem(
          friendsKey,
          JSON.stringify(nextFriends)
        );
        if (currentMsgs.length > 0) {
          await AsyncStorage.setItem(
            chatsKey,
            JSON.stringify(nextChats)
          );
        }
      } catch (err) {
        console.error("Error saving startChatWithUser:", err);
      }

      return targetFriend;
    },
    [friends, chats, userId, friendsKey, chatsKey]
  );

  // คำนวณจำนวนแจ้งเตือนแชทที่ยังไม่ได้อ่าน
  // โหมดห้ามรบกวน (userStatus === "busy"): จะไม่แสดงการแจ้งเตือนแชท (badge count = 0)
  const rawUnreadCount = friends.reduce((sum, f) => sum + (f.unread || 0), 0);
  const totalUnreadCount = userStatus === "busy" ? 0 : rawUnreadCount;

  // คำนวณจำนวนโพสต์ที่เหลือสำหรับวันนี้
  const remainingPostsToday = isBubbleUser ? Infinity : Math.max(0, DAILY_POST_LIMIT - dailyPostCount);

  // กรองโพสต์และคอมเมนต์ของผู้ใช้ที่ถูกบล็อก (Safety & App Store Compliance)
  const visiblePosts = (posts || [])
    .filter((post) => !blockedUserIds.includes(post.authorId))
    .map((post) => ({
      ...post,
      comments: (post.comments || []).filter(
        (c) => !blockedUserIds.includes(c.userId)
      ),
    }));

  // กรองเพื่อนที่ถูกบล็อก
  const visibleFriends = (friends || []).filter(
    (f) => !blockedUserIds.includes(f.id)
  );

  return (
    <FeedContext.Provider
      value={{
        posts: visiblePosts,
        isLoading,
        userStatus,
        setUserStatus,
        isDndActive: userStatus === "busy",
        addPost,
        deletePost,
        toggleLike,
        addComment,
        friends: visibleFriends,
        chats,
        sendMessage,
        syncChatWithFriend,
        markAsRead,
        startChatWithUser,
        totalUnreadCount,
        rawUnreadCount,
        dailyPostCount,
        dailyPostLimit: DAILY_POST_LIMIT,
        remainingPostsToday,
        resetDailyPostQuota,
        isDemoMode,
        refreshPosts: syncPostsFromFirestore,
        syncPostsFromFirestore,
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
