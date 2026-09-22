import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

const CROSS_BUBBLE_STORAGE_KEY = "@mindclick_cross_bubble_active";
const CROSS_BUBBLE_ALIAS_KEY = "@mindclick_cross_bubble_alias";
const CROSS_BUBBLE_ENERGY_KEY = "@mindclick_cross_bubble_energy";
const CROSS_BUBBLE_CHATS_KEY = "@mindclick_cross_bubble_chats";
const CROSS_BUBBLE_WHISPER_KEY = "@mindclick_cross_bubble_whispers";

// รายการไอคอนมาสคอต (Vector Icons จาก @expo/vector-icons Ionicons)
const MASCOT_ICONS = [
  "terminal-outline",
  "headset-outline",
  "cafe-outline",
  "moon-outline",
  "color-palette-outline",
  "game-controller-outline",
  "planet-outline",
  "flash-outline",
  "compass-outline",
  "finger-print-outline",
];

const ALIAS_PREFIXES = [
  "สายชิล", "ชอบนอนดึก", "ติดกาแฟ", "ฟังเพลงอินดี้", "บ้าพลัง",
  "สายปั่นงาน", "ชอบกินชานม", "นักคิดลึก", "นอนเช้า", "รักสงบ",
  "สายนั่งบาร์", "ชอบดูดาว", "สายเกมเมอร์", "ตัวตึง", "สายอาร์ต"
];

const DEFAULT_RADAR_DATA = [
  { faculty: "วิศวกรรมศาสตร์", matchRate: 94, studentsCount: 42, color: "#38bdf8", isConnected: true },
  { faculty: "พยาบาลศาสตร์", matchRate: 88, studentsCount: 35, color: "#f43f5e", isConnected: true },
  { faculty: "อักษรศาสตร์", matchRate: 85, studentsCount: 29, color: "#c084fc", isConnected: true },
  { faculty: "พาณิชยศาสตร์และการบัญชี", matchRate: 79, studentsCount: 38, color: "#4ade80", isConnected: true },
  { faculty: "สถาปัตยกรรมศาสตร์", matchRate: 76, studentsCount: 24, color: "#fbbf24", isConnected: true },
  { faculty: "แพทยศาสตร์", matchRate: 71, studentsCount: 18, color: "#2dd4bf", isConnected: false },
  { faculty: "นิติศาสตร์", matchRate: 68, studentsCount: 22, color: "#fb7185", isConnected: false },
];

const INITIAL_WHISPERS = [
  {
    id: "wh_1",
    authorFaculty: "เด็กแพทย์",
    authorIcon: "fitness-outline",
    content: "ใครบอกเด็กแพทย์อ่านแต่หนังสือ ตอนนี้อยากมีตี้เล่นบอร์ดเกมหรือไปนั่งฟังเพลงมาก มีใครว่างบ้าง",
    createdAt: "10 นาทีที่แล้ว",
    pops: 14,
    hasPopped: false,
  },
  {
    id: "wh_2",
    authorFaculty: "เด็กสถาปัตย์",
    authorIcon: "business-outline",
    content: "โปรเจกต์ส่งพรุ่งนี้เช้า เพิ่งขึ้นโมเดลเสร็จไป 30% กาแฟแก้วที่ 4 ต้องเข้าแล้ว สู้ชีวิตมาก",
    createdAt: "25 นาทีที่แล้ว",
    pops: 28,
    hasPopped: true,
  },
  {
    id: "wh_3",
    authorFaculty: "เด็กวิศวะ",
    authorIcon: "construct-outline",
    content: "แอบมองเด็กอักษรที่โรงอาหารกลางมาทั้งเทอม คุยในกลุ่มนี้เผื่อจะเจอคนที่แอบมอง",
    createdAt: "1 ชั่วโมงที่แล้ว",
    pops: 45,
    hasPopped: false,
  },
  {
    id: "wh_4",
    authorFaculty: "เด็กบัญชี",
    authorIcon: "calculator-outline",
    content: "งบการเงินไม่ดุลสักที ใครคิดว่าบัญชีง่ายขอให้มาลองนั่งทำตอนตีสองครึ่ง",
    createdAt: "2 ชั่วโมงที่แล้ว",
    pops: 21,
    hasPopped: false,
  },
];

const CrossBubbleContext = createContext();

export function CrossBubbleProvider({ children }) {
  const { user } = useAuth();
  const { profile } = useData();

  const [isCrossBubbleMode, setIsCrossBubbleMode] = useState(false);
  const [userAlias, setUserAlias] = useState(null);
  const [bubbleEnergy, setBubbleEnergy] = useState(45); // 0-100%
  const [mutualRevealState, setMutualRevealState] = useState({
    userHasConsented: false,
    allConsented: false,
    consentCount: 3,
    totalRequired: 4,
  });

  // ข้อมูล Weekly Micro-Lounge
  const [currentLounge, setCurrentLounge] = useState({
    id: "lounge_week_12",
    title: "กลุ่มคนรักดนตรีอินดี้ที่ชอบนอนดึก",
    theme: "ดนตรี & ไลฟ์สไตล์กลางคืน",
    faculties: ["วิศวกรรมศาสตร์", "พยาบาลศาสตร์", "อักษรศาสตร์", "พาณิชยศาสตร์และการบัญชี"],
    memberCount: 5,
    activePoll: {
      id: "poll_night_music",
      question: "ถ้าคืนนี้มีเวลาว่าง 3 ชั่วโมงก่อนนอน คุณจะเลือกทำอะไร?",
      options: [
        { text: "เปิดเพลย์ลิสต์เพลงอินดี้ นอนมองเพดาน", votes: 3 },
        { text: "หาของกินรอบดึก / สั่งเดลิเวอรี่มากิน", votes: 1 },
        { text: "ไถซีรีย์หรืออนิเมะจนสว่าง", votes: 1 },
        { text: "อ่านหนังสือเงียบๆ ชิลล์ๆ", votes: 0 },
      ],
      userVotedIndex: null,
    },
    members: [
      {
        id: "member_nurse",
        alias: "พยาบาลเวรดึกติดกาแฟ",
        icon: "cafe-outline",
        faculty: "พยาบาลศาสตร์",
        realName: "ฟ้าใส ธนภัทร",
        realAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        realBio: "ชอบฟังดนตรีสดและกาแฟดริป",
        consented: true,
      },
      {
        id: "member_arts",
        alias: "อักษรฟังเพลงนอกกระแส",
        icon: "headset-outline",
        faculty: "อักษรศาสตร์",
        realName: "Aphisak Phutsupha",
        realAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        realBio: "เด็กอักษรเอกวรรณกรรม ชอบคอนเสิร์ตอินดี้",
        consented: true,
      },
      {
        id: "member_acc",
        alias: "บัญชีเล่นบอร์ดเกมยันเช้า",
        icon: "game-controller-outline",
        faculty: "พาณิชยศาสตร์และการบัญชี",
        realName: "Janon Kingkohyao",
        realAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
        realBio: "เด็กบัญชีแต่ไม่ชอบตัวเลข ชอบบอร์ดเกมมากกว่า",
        consented: true,
      },
      {
        id: "member_arch",
        alias: "สถาปัตย์ปั่นงานข้ามคืน",
        icon: "color-palette-outline",
        faculty: "สถาปัตยกรรมศาสตร์",
        realName: "KEDTISAK RAKRUAUG",
        realAvatar: null,
        realBio: "นอนเช้าตื่นบ่าย โมเดลคืองานศิลปะ",
        consented: false,
      },
    ],
  });

  const [loungeMessages, setLoungeMessages] = useState([
    {
      id: "msg_sys_1",
      isSystem: true,
      text: "ยินดีต้อนรับสู่แชทกลุ่มลับ (Blind Lounge): คุณและเพื่อนอีก 4 คนจากต่างคณะที่สไตล์ตรงกันถูกจัดกลุ่มมารวมกันที่นี่ พูดคุยและทำภารกิจเพื่อสะสมพลังกลุ่มสำหรับเปิดเผยตัวตนจริงร่วมกัน (Mutual Reveal)",
      createdAt: "22:00",
    },
    {
      id: "msg_lounge_1",
      senderId: "member_nurse",
      senderAlias: "พยาบาลเวรดึกติดกาแฟ",
      senderIcon: "cafe-outline",
      text: "สวัสดีทุกคน เพิ่งลงเวรมาพอดีเลย ใครชอบฟังวง Dept หรือ Anatomy Rabbit บ้าง",
      createdAt: "22:05",
    },
    {
      id: "msg_lounge_2",
      senderId: "member_arts",
      senderAlias: "อักษรฟังเพลงนอกกระแส",
      senderIcon: "headset-outline",
      text: "เราชอบมาก เพลง 'คงต้องบอกลา' ฟังวนทุกคืนเลย ยินดีที่ได้รู้จักเพื่อนๆ นะ",
      createdAt: "22:08",
    },
    {
      id: "msg_lounge_3",
      senderId: "member_acc",
      senderAlias: "บัญชีเล่นบอร์ดเกมยันเช้า",
      senderIcon: "game-controller-outline",
      text: "สวัสดีครับทุกคน เราเด็กบัญชีแต่วันนี้ขอหนีงบดุลมาฟังเพลงด้วยคน",
      createdAt: "22:12",
    },
  ]);

  const [whisperPosts, setWhisperPosts] = useState(INITIAL_WHISPERS);
  const [radarData] = useState(DEFAULT_RADAR_DATA);

  // ฟังก์ชันสร้างหรือสุ่มตัวตนนามแฝง
  const generateRandomAlias = useCallback((customFaculty = null) => {
    const facultyName = customFaculty || profile?.faculty || "วิศวกรรมศาสตร์";
    const shortFaculty = facultyName.replace("คณะ", "").split(" ")[0].trim() || "นิรนาม";
    const prefix = ALIAS_PREFIXES[Math.floor(Math.random() * ALIAS_PREFIXES.length)];
    const icon = MASCOT_ICONS[Math.floor(Math.random() * MASCOT_ICONS.length)];
    const num = Math.floor(100 + Math.random() * 900);

    return {
      nickname: `${shortFaculty}${prefix} #${num}`,
      faculty: facultyName,
      shortFaculty,
      icon,
      badge: "ผู้ทลาย Social Bubble",
    };
  }, [profile?.faculty]);

  // โหลดสถานะโหมดมืดและนามแฝงจาก AsyncStorage
  useEffect(() => {
    async function loadCrossBubbleStorage() {
      try {
        const storedActive = await AsyncStorage.getItem(CROSS_BUBBLE_STORAGE_KEY);
        if (storedActive === "true") {
          setIsCrossBubbleMode(true);
        }

        const storedAlias = await AsyncStorage.getItem(CROSS_BUBBLE_ALIAS_KEY);
        if (storedAlias) {
          const parsed = JSON.parse(storedAlias);
          if (!MASCOT_ICONS.includes(parsed.icon)) {
            parsed.icon = MASCOT_ICONS[0];
          }
          parsed.badge = "ผู้ทลาย Social Bubble";
          setUserAlias(parsed);
        } else {
          const newAlias = generateRandomAlias();
          setUserAlias(newAlias);
          await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(newAlias));
        }

        const storedEnergy = await AsyncStorage.getItem(CROSS_BUBBLE_ENERGY_KEY);
        if (storedEnergy) {
          setBubbleEnergy(parseInt(storedEnergy, 10));
        }

        const storedWhispers = await AsyncStorage.getItem(CROSS_BUBBLE_WHISPER_KEY);
        if (storedWhispers) {
          setWhisperPosts(JSON.parse(storedWhispers));
        }
      } catch (e) {
        console.warn("loadCrossBubbleStorage error:", e);
      }
    }

    loadCrossBubbleStorage();
  }, [generateRandomAlias]);

  // สลับโหมด Cross-Bubble
  const toggleCrossBubbleMode = useCallback(async (forcedState) => {
    setIsCrossBubbleMode((prev) => {
      const nextState = forcedState !== undefined ? forcedState : !prev;
      AsyncStorage.setItem(CROSS_BUBBLE_STORAGE_KEY, nextState ? "true" : "false");
      return nextState;
    });
  }, []);

  // สุ่มฉายาใหม่
  const regenerateAlias = useCallback(async () => {
    const newAlias = generateRandomAlias();
    setUserAlias(newAlias);
    await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(newAlias));
    return newAlias;
  }, [generateRandomAlias]);

  // เปลี่ยนมาสคอต
  const changeMascot = useCallback(async (newIcon) => {
    if (!userAlias) return;
    const updated = { ...userAlias, icon: newIcon };
    setUserAlias(updated);
    await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(updated));
  }, [userAlias]);

  // ส่งข้อความในห้องแชทกลุ่มลับ (เพิ่มพลัง Bubble Energy)
  const sendLoungeMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg = {
      id: `lounge_msg_${Date.now()}`,
      senderId: user?.id || "my_user",
      senderAlias: userAlias?.nickname || "คุณ",
      senderIcon: userAlias?.icon || "finger-print-outline",
      text: text.trim(),
      createdAt: timeStr,
      isMe: true,
    };

    setLoungeMessages((prev) => [...prev, newMsg]);

    // เพิ่มพลังเกจ Bubble Energy (+10% ทุกครั้งที่คุย)
    setBubbleEnergy((prev) => {
      const next = Math.min(100, prev + 10);
      AsyncStorage.setItem(CROSS_BUBBLE_ENERGY_KEY, String(next));
      return next;
    });
  }, [user?.id, userAlias]);

  // โหวตคำถาม Icebreaker ในกลุ่ม (+15% พลัง Bubble Energy)
  const voteLoungePoll = useCallback((pollId, optionIndex) => {
    setCurrentLounge((prev) => {
      if (!prev.activePoll || prev.activePoll.userVotedIndex !== null) return prev;

      const updatedOptions = prev.activePoll.options.map((opt, idx) => {
        if (idx === optionIndex) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      return {
        ...prev,
        activePoll: {
          ...prev.activePoll,
          options: updatedOptions,
          userVotedIndex: optionIndex,
        },
      };
    });

    setBubbleEnergy((prev) => {
      const next = Math.min(100, prev + 15);
      AsyncStorage.setItem(CROSS_BUBBLE_ENERGY_KEY, String(next));
      return next;
    });
  }, []);

  // ส่งความยินยอมเปิดเผยตัวตนจริง (Mutual Reveal)
  const requestMutualReveal = useCallback(() => {
    setMutualRevealState((prev) => {
      const newCount = prev.consentCount + (prev.userHasConsented ? 0 : 1);
      const isAll = newCount >= prev.totalRequired;
      return {
        ...prev,
        userHasConsented: true,
        consentCount: newCount,
        allConsented: isAll,
      };
    });
  }, []);

  // โพสต์ข้อความในกระดานกระซิบ (Whisper Wall)
  const addWhisperPost = useCallback(async (content, facultyTag = null) => {
    if (!content || !content.trim()) return;

    const newPost = {
      id: `wh_${Date.now()}`,
      authorFaculty: facultyTag || userAlias?.shortFaculty || "เด็กมหาวิทยาลัย",
      authorIcon: userAlias?.icon || "finger-print-outline",
      content: content.trim(),
      createdAt: "เมื่อสักครู่",
      pops: 1,
      hasPopped: true,
    };

    setWhisperPosts((prev) => {
      const updated = [newPost, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_WHISPER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [userAlias]);

  // กด Reaction แตกฟองสบู่ (Bubble Pop)
  const toggleWhisperPop = useCallback((postId) => {
    setWhisperPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== postId) return p;
        const willPop = !p.hasPopped;
        return {
          ...p,
          hasPopped: willPop,
          pops: willPop ? p.pops + 1 : Math.max(0, p.pops - 1),
        };
      });
      AsyncStorage.setItem(CROSS_BUBBLE_WHISPER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <CrossBubbleContext.Provider
      value={{
        isCrossBubbleMode,
        toggleCrossBubbleMode,
        userAlias,
        regenerateAlias,
        changeMascot,
        mascotOptions: MASCOT_ICONS,
        currentLounge,
        loungeMessages,
        sendLoungeMessage,
        voteLoungePoll,
        bubbleEnergy,
        mutualRevealState,
        requestMutualReveal,
        whisperPosts,
        addWhisperPost,
        toggleWhisperPop,
        radarData,
      }}
    >
      {children}
    </CrossBubbleContext.Provider>
  );
}

export function useCrossBubble() {
  const context = useContext(CrossBubbleContext);
  if (!context) {
    throw new Error("useCrossBubble must be used within a CrossBubbleProvider");
  }
  return context;
}
