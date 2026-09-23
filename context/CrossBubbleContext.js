import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

const CROSS_BUBBLE_STORAGE_KEY = "@mindclick_cross_bubble_active";
const CROSS_BUBBLE_ALIAS_KEY = "@mindclick_cross_bubble_alias";
const CROSS_BUBBLE_LOUNGE_ROOMS_KEY = "@mindclick_cross_bubble_lounge_rooms";
const CROSS_BUBBLE_ONE_ON_ONE_KEY = "@mindclick_cross_bubble_one_on_one";
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
  { faculty: "วิศวกรรมศาสตร์", matchRate: 94, studentsCount: 42, color: "#818CF8", isConnected: true },
  { faculty: "พยาบาลศาสตร์", matchRate: 88, studentsCount: 35, color: "#FB7185", isConnected: true },
  { faculty: "อักษรศาสตร์", matchRate: 85, studentsCount: 29, color: "#A78BFA", isConnected: true },
  { faculty: "พาณิชยศาสตร์และการบัญชี", matchRate: 79, studentsCount: 38, color: "#38BDF8", isConnected: true },
  { faculty: "สถาปัตยกรรมศาสตร์", matchRate: 76, studentsCount: 24, color: "#F59E0B", isConnected: true },
  { faculty: "แพทยศาสตร์", matchRate: 71, studentsCount: 18, color: "#2DD4BF", isConnected: false },
  { faculty: "นิติศาสตร์", matchRate: 68, studentsCount: 22, color: "#F472B6", isConnected: false },
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

const INITIAL_LOUNGE_ROOMS = [
  {
    id: "lounge_active_1",
    title: "กลุ่มคนรักดนตรีอินดี้ที่ชอบนอนดึก",
    theme: "ดนตรี & ไลฟ์สไตล์กลางคืน",
    faculties: ["วิศวกรรมศาสตร์", "พยาบาลศาสตร์", "อักษรศาสตร์", "พาณิชยศาสตร์และการบัญชี"],
    memberCount: 5,
    bubbleEnergy: 45,
    isActive: true,
    lastMessage: "สวัสดีครับทุกคน เราเด็กบัญชีแต่วันนี้ขอหนีงบดุลมาฟังเพลงด้วยคน",
    lastMessageTime: "22:12",
    mutualRevealState: {
      userHasConsented: false,
      allConsented: false,
      consentCount: 3,
      totalRequired: 4,
    },
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
    messages: [
      {
        id: "msg_sys_1",
        isSystem: true,
        text: "ยินดีต้อนรับสู่ห้องสังสรรค์ (Blind Lounge): คุณและเพื่อนอีก 4 คนจากต่างคณะที่สไตล์ตรงกันถูกจัดกลุ่มมารวมกันที่นี่ ชวนคุยและเปิดบทสนทนาเพื่อสะสมความสนิทในห้องสำหรับเปิดเผยตัวตนจริงร่วมกัน (Mutual Reveal)",
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
    ],
  },
  {
    id: "lounge_archived_2",
    title: "กลุ่มสายปั่นงานดึกเด็กหอ",
    theme: "เอาตัวรอดช่วงมิดเทอม",
    faculties: ["สถาปัตยกรรมศาสตร์", "วิศวกรรมศาสตร์", "นิติศาสตร์"],
    memberCount: 4,
    bubbleEnergy: 100,
    isActive: false,
    lastMessage: "สอบเสร็จแล้วไว้ไปกินชาบูกันนะทุกคน!",
    lastMessageTime: "เมื่อสัปดาห์ที่แล้ว",
    mutualRevealState: {
      userHasConsented: true,
      allConsented: true,
      consentCount: 4,
      totalRequired: 4,
    },
    activePoll: null,
    members: [
      {
        id: "m_arch_old",
        alias: "สถาปัตย์นอนเช้า",
        icon: "color-palette-outline",
        faculty: "สถาปัตยกรรมศาสตร์",
        realName: "ก้องภพ ปรีดา",
        realAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        realBio: "สายโมเดลและกาแฟสด",
        consented: true,
      },
      {
        id: "m_law_old",
        alias: "นิติท่องมาตราตีสาม",
        icon: "book-outline",
        faculty: "นิติศาสตร์",
        realName: "พิชชาภา วัฒนา",
        realAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        realBio: "อ่านหนังสือกองโตทุกค่ำคืน",
        consented: true,
      },
    ],
    messages: [
      {
        id: "msg_old_1",
        isSystem: true,
        text: "ห้องสังสรรค์ในอดีต (ประวัติการสนทนายังคงถูกเก็บไว้เพื่อทบทวนความทรงจำ)",
        createdAt: "18:00",
      },
      {
        id: "msg_old_2",
        senderId: "m_arch_old",
        senderAlias: "สถาปัตย์นอนเช้า",
        senderIcon: "color-palette-outline",
        text: "ส่งไฟนอลโมเดลเสร็จแล้ว รอดตายอย่างปาฏิหาริย์!",
        createdAt: "04:30",
      },
      {
        id: "msg_old_3",
        senderId: "m_law_old",
        senderAlias: "นิติท่องมาตราตีสาม",
        senderIcon: "book-outline",
        text: "สอบเสร็จแล้วไว้ไปกินชาบูกันนะทุกคน!",
        createdAt: "11:20",
      },
    ],
  },
];

const INITIAL_ONE_ON_ONE_ROOMS = [
  {
    id: "one_1",
    partnerAlias: "เด็กอักษรชอบดูดาว #421",
    partnerFaculty: "อักษรศาสตร์",
    partnerIcon: "planet-outline",
    partnerRealName: "วริศรา เจริญสุข",
    partnerRealAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    partnerRealBio: "ชอบดูดาว ถ่ายรูปฟิล์ม และอ่านวรรณกรรมอินดี้",
    userRequestedReveal: false,
    partnerRequestedReveal: false,
    isRevealed: false,
    lastMessage: "ถ้าเธอชอบฟังเพลงนอกกระแส เรามีเพลย์ลิสต์อยากแชร์เยอะเลย",
    lastMessageTime: "21:40",
    messages: [
      {
        id: "m_1_1",
        senderAlias: "เด็กอักษรชอบดูดาว #421",
        senderIcon: "planet-outline",
        text: "สวัสดีจ้า! ยินดีที่ได้คุยกันนะ วันนี้เรียนเหนื่อยไหม",
        createdAt: "21:35",
        isMe: false,
      },
      {
        id: "m_1_2",
        senderAlias: "คุณ",
        senderIcon: "finger-print-outline",
        text: "เหนื่อยมากกก นั่งทำแล็บทั้งบ่ายเลย",
        createdAt: "21:38",
        isMe: true,
      },
      {
        id: "m_1_3",
        senderAlias: "เด็กอักษรชอบดูดาว #421",
        senderIcon: "planet-outline",
        text: "ถ้าเธอชอบฟังเพลงนอกกระแส เรามีเพลย์ลิสต์อยากแชร์เยอะเลย",
        createdAt: "21:40",
        isMe: false,
      },
    ],
  },
];

const RANDOM_GROUP_THEMES = [
  {
    title: "บอร์ดเกมคาเฟ่ & ตี้หาเพื่อนเล่นเกม",
    theme: "บอร์ดเกม & กิจกรรมยามว่าง",
    faculties: ["วิทยาศาสตร์", "วิศวกรรมศาสตร์", "สถาปัตยกรรมศาสตร์", "นิเทศศาสตร์"],
    question: "บอร์ดเกมแนวไหนที่คุณชอบเล่นมากที่สุดเวลาอยู่กับเพื่อน?",
    options: [
      { text: "แนวบลัฟฟ์/โกหกจับคนร้าย (Werewolf, Avalon)", votes: 2 },
      { text: "แนววางแผน ยึดพื้นที่ สร้างเมือง (Catan, Carcassonne)", votes: 1 },
      { text: "แนวปาร์ตี้เกม เฮฮา หัวเราะท้องแข็ง (Exploding Kittens)", votes: 2 },
      { text: "เกมอะไรก็ได้ ขอแค่มีของกินอร่อยๆ", votes: 0 },
    ],
  },
  {
    title: "คอมมูนิตี้กาแฟดริป & เพลย์ลิสต์ Lo-Fi",
    theme: "กาแฟ & ดนตรีผ่อนคลาย",
    faculties: ["พยาบาลศาสตร์", "แพทยศาสตร์", "อักษรศาสตร์", "พาณิชยศาสตร์และการบัญชี"],
    question: "เครื่องดื่มแก้วโปรดที่ช่วยให้คุณตาสว่างตอนปั่นงานดึกคืออะไร?",
    options: [
      { text: "อเมริกาโน่เย็น ไม่หวานเลย เข้มๆ", votes: 3 },
      { text: "ชาเขียวมัทฉะลาเต้ หวานน้อย", votes: 2 },
      { text: "ชานมไข่มุก เยียวยาจิตใจ", votes: 1 },
      { text: "น้ำเปล่าเย็นจัดๆ สดชื่นที่สุด", votes: 0 },
    ],
  },
  {
    title: "ชมรมคนรักภาพยนตร์นอกกระแส & คอนเสิร์ต",
    theme: "ภาพยนตร์ ศิลปะ & ดนตรีสด",
    faculties: ["อักษรศาสตร์", "นิเทศศาสตร์", "วิจิตรศิลป์", "สถาปัตยกรรมศาสตร์"],
    question: "โรงภาพยนตร์หรือบรรยากาศดูหนังแบบไหนที่คุณชอบที่สุด?",
    options: [
      { text: "โรงหนังอินดี้เงียบๆ คนไม่เยอะ (เช่น House Samyan)", votes: 3 },
      { text: "นอนคลุมโปงดูซีรีย์คนเดียวในห้อง", votes: 2 },
      { text: "ดูหนังกับเพื่อนในหอ พร้อมป๊อปคอร์น", votes: 1 },
      { text: "ชอบไปดูดนตรีสดมากกว่าดูหนัง", votes: 0 },
    ],
  },
];

const RANDOM_ONE_ON_ONE_PARTNERS = [
  {
    alias: "เด็กแพทย์แอบมาฟังเพลง #812",
    faculty: "แพทยศาสตร์",
    icon: "headset-outline",
    realName: "นันทิภัทร โชคอนันต์",
    realAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    realBio: "นักศึกษาแพทย์ปี 3 ชอบเล่นกีตาร์โปร่งและวิ่งมาราธอน",
    greeting: "สวัสดีครับ เพิ่งอ่านแล็บกายวิภาคเสร็จ ขอแวะมาคุยคลายเครียดหน่อย ยินดีที่ได้รู้จักนะ!",
  },
  {
    alias: "เด็กสถาปัตย์ตัดโมเดลยันเช้า #634",
    faculty: "สถาปัตยกรรมศาสตร์",
    icon: "color-palette-outline",
    realName: "จิรัฏฐ์ อนันตศิลป์",
    realAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    realBio: "เด็กสถาปัตย์ชอบดื่มชาเขียวและถ่ายภาพ Street",
    greeting: "สวัสดี! คืนนี้มีใครยังไม่นอนบ้าง เรานั่งตัดโมเดลคนเดียวเหงามาก มาคุยกันนะ",
  },
  {
    alias: "เด็กพยาบาลเวรบ่ายชอบดูการ์ตูน #319",
    faculty: "พยาบาลศาสตร์",
    icon: "cafe-outline",
    realName: "ปวริศา รัตนโชติ",
    realAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    realBio: "เด็กพยาบาลรักแมวและติดอนิเมะ Ghibli",
    greeting: "ฮัลโหลลล เพิ่งลงเวรมาเลย วันนี้เจอคนไข้น่ารักมาก เลยอยากมาแบ่งปันพลังบวกให้เพื่อนๆ",
  },
  {
    alias: "เด็กนิติรักความยุติธรรม #755",
    faculty: "นิติศาสตร์",
    icon: "terminal-outline",
    realName: "ธนกฤต ศิริพงษ์",
    realAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    realBio: "เด็กนิติจอมขบคิด ชอบดูซีรีย์สืบสวนและฟังพอดแคสต์",
    greeting: "สวัสดีครับ พักสายตาจากการอ่านประมวลกฎหมายมาคุยด้วยครับ มีเรื่องอะไรสนุกๆ แลกเปลี่ยนกันได้นะ",
  },
];

const CrossBubbleContext = createContext();

export function CrossBubbleProvider({ children }) {
  const { user } = useAuth();
  const { profile } = useData();

  const [isCrossBubbleMode, setIsCrossBubbleMode] = useState(false);
  const [userAlias, setUserAlias] = useState(null);

  // Blind Lounge Multiple Rooms State
  const [loungeRooms, setLoungeRooms] = useState(INITIAL_LOUNGE_ROOMS);
  const [activeLoungeRoomId, setActiveLoungeRoomId] = useState(null); // null means in Lobby!

  // 1 on 1 Multiple Rooms State
  const [oneOnOneRooms, setOneOnOneRooms] = useState(INITIAL_ONE_ON_ONE_ROOMS);
  const [activeOneOnOneRoomId, setActiveOneOnOneRoomId] = useState(null); // null means in 1 on 1 Lobby!

  const [whisperPosts, setWhisperPosts] = useState(INITIAL_WHISPERS);
  const [radarData] = useState(DEFAULT_RADAR_DATA);

  // Current active lounge room object (fallback to first room)
  const currentLounge =
    loungeRooms.find((r) => r.id === activeLoungeRoomId) || loungeRooms[0];
  const loungeMessages = currentLounge?.messages || [];
  const bubbleEnergy = currentLounge?.bubbleEnergy || 50;
  const mutualRevealState = currentLounge?.mutualRevealState || {
    userHasConsented: false,
    allConsented: false,
    consentCount: 2,
    totalRequired: 4,
  };

  // Generate random alias
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

  // Load saved state from AsyncStorage
  useEffect(() => {
    async function loadStorage() {
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

        const storedRooms = await AsyncStorage.getItem(CROSS_BUBBLE_LOUNGE_ROOMS_KEY);
        if (storedRooms) {
          setLoungeRooms(JSON.parse(storedRooms));
        }

        const storedOneOnOne = await AsyncStorage.getItem(CROSS_BUBBLE_ONE_ON_ONE_KEY);
        if (storedOneOnOne) {
          setOneOnOneRooms(JSON.parse(storedOneOnOne));
        }

        const storedWhispers = await AsyncStorage.getItem(CROSS_BUBBLE_WHISPER_KEY);
        if (storedWhispers) {
          setWhisperPosts(JSON.parse(storedWhispers));
        }
      } catch (e) {
        console.warn("CrossBubble loadStorage error:", e);
      }
    }

    loadStorage();
  }, [generateRandomAlias]);

  // Toggle Cross-Bubble Mode
  const toggleCrossBubbleMode = useCallback(async (forcedState) => {
    setIsCrossBubbleMode((prev) => {
      const nextState = forcedState !== undefined ? forcedState : !prev;
      AsyncStorage.setItem(CROSS_BUBBLE_STORAGE_KEY, nextState ? "true" : "false");
      return nextState;
    });
  }, []);

  // Regenerate Alias
  const regenerateAlias = useCallback(async () => {
    const newAlias = generateRandomAlias();
    setUserAlias(newAlias);
    await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(newAlias));
    return newAlias;
  }, [generateRandomAlias]);

  // Change Mascot
  const changeMascot = useCallback(async (newIcon) => {
    if (!userAlias) return;
    const updated = { ...userAlias, icon: newIcon };
    setUserAlias(updated);
    await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(updated));
  }, [userAlias]);

  // Send message in Blind Lounge (supports specific roomId or currently active room)
  const sendLoungeMessage = useCallback(async (text, targetRoomId = null) => {
    if (!text || !text.trim()) return;

    const roomId = targetRoomId || activeLoungeRoomId || loungeRooms[0]?.id;
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

    setLoungeRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id !== roomId) return room;
        const newEnergy = Math.min(100, (room.bubbleEnergy || 0) + 10);
        return {
          ...room,
          messages: [...(room.messages || []), newMsg],
          lastMessage: text.trim(),
          lastMessageTime: timeStr,
          bubbleEnergy: newEnergy,
        };
      });
      AsyncStorage.setItem(CROSS_BUBBLE_LOUNGE_ROOMS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [activeLoungeRoomId, loungeRooms, user?.id, userAlias]);

  // Vote icebreaker poll in Blind Lounge
  const voteLoungePoll = useCallback((pollId, optionIndex, targetRoomId = null) => {
    const roomId = targetRoomId || activeLoungeRoomId || loungeRooms[0]?.id;

    setLoungeRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id !== roomId || !room.activePoll || room.activePoll.userVotedIndex !== null) {
          return room;
        }

        const updatedOptions = room.activePoll.options.map((opt, idx) => {
          if (idx === optionIndex) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        const newEnergy = Math.min(100, (room.bubbleEnergy || 0) + 15);

        return {
          ...room,
          bubbleEnergy: newEnergy,
          activePoll: {
            ...room.activePoll,
            options: updatedOptions,
            userVotedIndex: optionIndex,
          },
        };
      });

      AsyncStorage.setItem(CROSS_BUBBLE_LOUNGE_ROOMS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [activeLoungeRoomId, loungeRooms]);

  // Request mutual reveal in Blind Lounge
  const requestMutualReveal = useCallback((targetRoomId = null) => {
    const roomId = targetRoomId || activeLoungeRoomId || loungeRooms[0]?.id;

    setLoungeRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id !== roomId) return room;

        const currentConsent = room.mutualRevealState || {
          userHasConsented: false,
          allConsented: false,
          consentCount: 2,
          totalRequired: 4,
        };

        const newCount = currentConsent.consentCount + (currentConsent.userHasConsented ? 0 : 1);
        const isAll = newCount >= currentConsent.totalRequired;

        return {
          ...room,
          mutualRevealState: {
            ...currentConsent,
            userHasConsented: true,
            consentCount: newCount,
            allConsented: isAll,
          },
        };
      });

      AsyncStorage.setItem(CROSS_BUBBLE_LOUNGE_ROOMS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [activeLoungeRoomId, loungeRooms]);

  // Create & match a new random Blind Lounge group
  const createNewRandomLoungeRoom = useCallback(() => {
    const template =
      RANDOM_GROUP_THEMES[Math.floor(Math.random() * RANDOM_GROUP_THEMES.length)];
    const newRoomId = `lounge_${Date.now()}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newRoom = {
      id: newRoomId,
      title: template.title,
      theme: template.theme,
      faculties: template.faculties,
      memberCount: 5,
      bubbleEnergy: 15,
      isActive: true,
      lastMessage: "เริ่มเปิดห้องสังสรรค์ใหม่แล้ว มาทักทายกัน!",
      lastMessageTime: timeStr,
      mutualRevealState: {
        userHasConsented: false,
        allConsented: false,
        consentCount: 1,
        totalRequired: 4,
      },
      activePoll: {
        id: `poll_${Date.now()}`,
        question: template.question,
        options: template.options,
        userVotedIndex: null,
      },
      members: [
        {
          id: `mem_rand_1_${Date.now()}`,
          alias: "เด็กสายชิลล์ #204",
          icon: "headset-outline",
          faculty: template.faculties[0] || "วิศวกรรมศาสตร์",
          realName: "ศิริชัย เลิศวิมล",
          realAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
          realBio: "ชอบคุยเรื่องเพลงและของกิน",
          consented: true,
        },
        {
          id: `mem_rand_2_${Date.now()}`,
          alias: "เด็กชอบนอนดึก #588",
          icon: "moon-outline",
          faculty: template.faculties[1] || "อักษรศาสตร์",
          realName: "กัญญาณัฐ สุวรรณ",
          realAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
          realBio: "เด็กอักษรชอบดูภาพยนตร์และถ่ายรูป",
          consented: false,
        },
      ],
      messages: [
        {
          id: `msg_sys_${Date.now()}`,
          isSystem: true,
          text: `ยินดีต้อนรับสู่ห้องสังสรรค์ใหม่: "${template.title}" สมาชิกถูกจัดกลุ่มจาก 4 คณะ ตอบคำถามและชวนคุยเพื่อปลดล็อกโปรไฟล์จริงร่วมกัน!`,
          createdAt: timeStr,
        },
        {
          id: `msg_init_${Date.now()}`,
          senderId: `mem_rand_1`,
          senderAlias: "เด็กสายชิลล์ #204",
          senderIcon: "headset-outline",
          text: "สวัสดีทุกคน เพิ่งสุ่มได้มาเจอกลุ่มนี้ ยินดีที่ได้คุยกับเพื่อนต่างคณะครับ!",
          createdAt: timeStr,
        },
      ],
    };

    setLoungeRooms((prev) => {
      const updated = [newRoom, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_LOUNGE_ROOMS_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveLoungeRoomId(newRoomId);
    return newRoom;
  }, []);

  // 1 on 1 Messaging Operations
  const sendOneOnOneMessage = useCallback(async (roomId, text) => {
    if (!text || !text.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg = {
      id: `m_1on1_${Date.now()}`,
      senderAlias: userAlias?.nickname || "คุณ",
      senderIcon: userAlias?.icon || "finger-print-outline",
      text: text.trim(),
      createdAt: timeStr,
      isMe: true,
    };

    setOneOnOneRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          messages: [...(room.messages || []), newMsg],
          lastMessage: text.trim(),
          lastMessageTime: timeStr,
        };
      });
      AsyncStorage.setItem(CROSS_BUBBLE_ONE_ON_ONE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [userAlias]);

  // Request or toggle real profile reveal in 1 on 1
  const requestOneOnOneReveal = useCallback((roomId) => {
    setOneOnOneRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id !== roomId) return room;
        // When user requests reveal, immediately reveal both or mark requested
        const nowRevealed = !room.isRevealed;
        return {
          ...room,
          userRequestedReveal: nowRevealed,
          isRevealed: nowRevealed,
        };
      });
      AsyncStorage.setItem(CROSS_BUBBLE_ONE_ON_ONE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Create new random 1 on 1 match
  const createNewOneOnOneRoom = useCallback(() => {
    const partner =
      RANDOM_ONE_ON_ONE_PARTNERS[Math.floor(Math.random() * RANDOM_ONE_ON_ONE_PARTNERS.length)];
    const newRoomId = `one_${Date.now()}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newRoom = {
      id: newRoomId,
      partnerAlias: partner.alias,
      partnerFaculty: partner.faculty,
      partnerIcon: partner.icon,
      partnerRealName: partner.realName,
      partnerRealAvatar: partner.realAvatar,
      partnerRealBio: partner.realBio,
      userRequestedReveal: false,
      partnerRequestedReveal: false,
      isRevealed: false,
      lastMessage: partner.greeting,
      lastMessageTime: timeStr,
      messages: [
        {
          id: `m_init_${Date.now()}`,
          senderAlias: partner.alias,
          senderIcon: partner.icon,
          text: partner.greeting,
          createdAt: timeStr,
          isMe: false,
        },
      ],
    };

    setOneOnOneRooms((prev) => {
      const updated = [newRoom, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_ONE_ON_ONE_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveOneOnOneRoomId(newRoomId);
    return newRoom;
  }, []);

  // Whisper Post Actions
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

        // Blind Lounge State & Functions
        loungeRooms,
        activeLoungeRoomId,
        setActiveLoungeRoomId,
        currentLounge,
        loungeMessages,
        bubbleEnergy,
        mutualRevealState,
        sendLoungeMessage,
        voteLoungePoll,
        requestMutualReveal,
        createNewRandomLoungeRoom,

        // 1 on 1 State & Functions
        oneOnOneRooms,
        activeOneOnOneRoomId,
        setActiveOneOnOneRoomId,
        sendOneOnOneMessage,
        requestOneOnOneReveal,
        createNewOneOnOneRoom,

        // Whisper & Radar
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
