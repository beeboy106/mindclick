import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { useFeed } from "./FeedContext";
import { usePremium } from "./PremiumContext";

const CROSS_BUBBLE_STORAGE_KEY = "@mindclick_cross_bubble_active";
const CROSS_BUBBLE_ALIAS_KEY = "@mindclick_cross_bubble_alias";
const CROSS_BUBBLE_DARK_ROOMS_KEY = "@mindclick_cross_bubble_dark_rooms";
const CROSS_BUBBLE_MISSIONS_KEY = "@mindclick_cross_bubble_missions";
const CROSS_BUBBLE_POINTS_KEY = "@mindclick_cross_bubble_points";
const CROSS_BUBBLE_STREAK_KEY = "@mindclick_cross_bubble_streak";
const CROSS_BUBBLE_UNLOCKED_AVATARS_KEY = "@mindclick_cross_bubble_unlocked_avatars";

// รายการไอคอนมาสคอตพื้นฐาน (Ionicons)
export const MASCOT_ICONS = [
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

// รายการอวาตารพรีเมียมที่ปลดล็อคได้จากแต้มสะสม
export const SHOP_AVATARS = [
  { id: "rocket-outline", name: "นักท่องอวกาศ", cost: 30, desc: "สำหรับผู้กล้าที่พร้อมทะยานข้ามขอบเขตเดิมๆ" },
  { id: "sparkles-outline", name: "ประกายเวทมนตร์", cost: 50, desc: "เปล่งประกายสร้างสีสันและพลังบวกให้เพื่อนรอบตัว" },
  { id: "diamond-outline", name: "เพชรยอดมงกุฎ", cost: 70, desc: "เปล่งแสงระยิบระยับ ทรงคุณค่าและสง่างาม" },
  { id: "shield-outline", name: "ผู้พิทักษ์บับเบิ้ล", cost: 90, desc: "พร้อมปกป้องมิตรภาพและเคารพความหลากหลาย" },
  { id: "flame-outline", name: "เปลวเพลิงนิรันดร์", cost: 120, desc: "ไฟลุกโชนต่อเนื่อง แสดงถึงความกระตือรือร้น" },
  { id: "trophy-outline", name: "แชมป์เปี้ยนคณะ", cost: 150, desc: "สัญลักษณ์แห่งความสำเร็จของคนรุ่นใหม่" },
];

const ALIAS_PREFIXES = [
  "สายชิล", "ชอบนอนดึก", "ติดกาแฟ", "ฟังเพลงอินดี้", "บ้าพลัง",
  "สายปั่นงาน", "ชอบกินชานม", "นักคิดลึก", "นอนเช้า", "รักสงบ",
  "สายนั่งบาร์", "ชอบดูดาว", "สายเกมเมอร์", "ตัวตึง", "สายอาร์ต"
];

// หัวข้อประจำวัน 3 ด้าน
export const TOPIC_CATEGORIES = {
  PREFERENCES: "ความชอบ",
  DEBATES: "ข้อถกเถียง",
  HYPOTHETICAL: "สถานการณ์สมมติและการแก้ปัญหา",
};

// คลังหัวข้อประจำวันตัวอย่าง
const DAILY_TOPICS = [
  {
    id: "topic_hypo_1",
    category: TOPIC_CATEGORIES.HYPOTHETICAL,
    categoryKey: "hypothetical",
    title: "ถ้าเกิดไวรัสซอมบี้ระบาดทั่วจุฬาฯ ในชั่วโมงเรียน คุณจะเอาตัวรอดอย่างไร?",
    description: "วางแผนกลยุทธ์รวมกลุ่มกับเพื่อน 5 คนเพื่อเอาชีวิตรอดและหาทางออกจากมหาวิทยาลัย",
    preQuestions: [
      {
        id: "q1",
        question: "ไอเท็ม 1 ชิ้นในกระเป๋าหรือรอบตัวที่คุณจะหยิบติดมือทันทีคืออะไร?",
        placeholder: "เช่น สมาร์ทโฟน, มีดพับตัดโมเดล, เสื้อคลุมหนา",
      },
      {
        id: "q2",
        question: "ตึกเรียนหรือจุดใดในมหาลัยที่คุณคิดว่าปลอดภัยที่สุดในการหลบภัย?",
        placeholder: "เช่น หอสมุดกลาง, ตึกวิศวะ 100 ปี, ดาดฟ้าคณะสถาปัตย์",
      },
    ],
  },
  {
    id: "topic_pref_1",
    category: TOPIC_CATEGORIES.PREFERENCES,
    categoryKey: "preferences",
    title: "เมนูเยียวยาจิตใจยามค่ำคืนหลังโปรเจกต์เดือด และร้านลับในดวงใจ",
    description: "แบ่งปันของกินรอบดึกที่ช่วยชุบชีวิตคุณในคืนที่อ่านหนังสือหนักหรือปั่นงานข้ามคืน",
    preQuestions: [
      {
        id: "q1",
        question: "ของกินรอบดึกที่คุณสั่งบ่อยที่สุดคืออะไร?",
        placeholder: "เช่น ชาบูดึก, บะหมี่เกี๊ยว, มาม่าต้มยำชีส",
      },
      {
        id: "q2",
        question: "ร้านลับรอบมหาลัยที่คุณอยากแนะนำให้เพื่อนต่างคณะไปลองคือร้านไหน?",
        placeholder: "เช่น ร้านป้าปากซอย, ข้าวต้มตีสอง, คาเฟ่หลังมอ",
      },
    ],
  },
  {
    id: "topic_deb_1",
    category: TOPIC_CATEGORIES.DEBATES,
    categoryKey: "debates",
    title: "เรียนเพื่อใบปริญญาเกียรตินิยม VS เรียนให้จบพร้อมประสบการณ์ชีวิตสุดเหวี่ยง",
    description: "ถกมุมมองค่านิยมของชีวิตนักศึกษาในยุคปัจจุบัน สิ่งไหนคุ้มค่าและสำคัญกว่ากัน",
    preQuestions: [
      {
        id: "q1",
        question: "คุณให้น้ำหนักกับเรื่องไหนมากกว่า (เกรดเฉลี่ย VS ประสบการณ์/กิจกรรม)?",
        placeholder: "เช่น เกรด 3.8+ สำคัญที่สุด, กิจกรรม 70% เรียน 30%",
      },
      {
        id: "q2",
        question: "สิ่งที่เสียดายที่สุดหากไม่ได้ทำก่อนเรียนจบมหาวิทยาลัยคืออะไร?",
        placeholder: "เช่น การไปแลกเปลี่ยน, การไปนั่งชิลกับเพื่อนทุกคณะ",
      },
    ],
  },
];

// รายการเพื่อนจำลอง 4 คนในห้องสังสรรค์ เชื่อมโยงกับผู้ใช้ในหน้าหลัก (FeedContext / mockUsers)
const SIMULATED_CLASSMATES = [
  {
    id: "member_med",
    feedUserId: "user_mock_1",
    alias: "เด็กแพทย์สายลุย",
    icon: "fitness-outline",
    faculty: "แพทยศาสตร์",
    roleplay: "นักสืบโคนัน (พูดจาวิเคราะห์ สังเกตพฤติกรรมเพื่อนตลอดเวลา)",
    preAnswers: {
      q1: "ชุดปฐมพยาบาลเบื้องต้นและยารักษาโรค",
      q2: "ห้องผ่าตัดบนตึกชั้น 7 ประตูล็อคแน่นหนา",
    },
    realName: "ฟ้าใส ธนภัทร",
    realAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    realFaculty: "แพทยศาสตร์ ปี 3",
    instagram: "@fasai.med_chula",
    lineId: "fasai_med",
    realBio: "นักศึกษาแพทย์ปี 3 ชอบฟังดนตรีสดและวิ่งมาราธอนช่วงวันหยุด",
    chatLinesStage1: [
      "สวัสดีเพื่อนๆ ทุกคน เราเด็กแพทย์นะ คืนนี้แวะมาคุยด้วย",
      "มีใครพกของกินหรือของมีคมติดกระเป๋ามาบ้างไหม จากการวิเคราะห์เราต้องการเสบียงด่วน",
    ],
    chatLinesStage2: [
      "ถ้าซอมบี้บุกจริง เราเสนอให้ไปตั้งรับที่ชั้นสูงๆ เพราะซอมบี้เคลื่อนที่ช้าตามบันได",
      "เรามีชุดปฐมพยาบาลพกติดตัวตลอด ถ้าใครบาดเจ็บเราทำแผลเบื้องต้นให้ได้นะ",
    ],
  },
  {
    id: "member_eng",
    feedUserId: "user_mock_aphisak",
    alias: "เด็กวิศวะสายแฮก",
    icon: "terminal-outline",
    faculty: "วิศวกรรมศาสตร์",
    roleplay: "วิศวกรซ่อมทุกอย่าง (เสนอวิธีดัดแปลงสิ่งของรอบตัวให้กลายเป็นอุปกรณ์)",
    preAnswers: {
      q1: "ไขควงมัลติทูลและพาวเวอร์แบงก์ 30000mAh",
      q2: "ช็อปวิศวะเครื่องกล มีเครื่องมือช่างและเหล็กกล้า",
    },
    realName: "Aphisak Phutsupha",
    realAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    realFaculty: "วิศวกรรมศาสตร์ (คอมพิวเตอร์) ปี 2",
    instagram: "@aphisak_engr",
    lineId: "aphisak_code",
    realBio: "วิศวะคอมฯ ชอบงานอดิเรก ดนตรี และระบบความปลอดภัยไซเบอร์",
    chatLinesStage1: [
      "หวัดดีครับทุกคน เราเด็กวิศวะคอม ใครเน็ตช้าบอกเราได้นะ",
      "เรามีไขควงมัลติทูลกับพาวเวอร์แบงก์ยักษ์พร้อมลุยเสมอ",
    ],
    chatLinesStage2: [
      "เราสามารถดัดแปลงแบตเตอรี่รถมอเตอร์ไซค์มาทำรั้วไฟฟ้าสกัดซอมบี้ได้นะ",
      "ใครอยู่ช็อปวิศวะมีโครงเหล็กกับแผ่นอะลูมิเนียม เสริมเกราะป้องกันได้สบาย",
    ],
  },
  {
    id: "member_arts",
    feedUserId: "user_mock_janon",
    alias: "เด็กอักษรชวนคุย",
    icon: "headset-outline",
    faculty: "อักษรศาสตร์",
    roleplay: "กวีพเนจรผู้อารมณ์ดี (พูดจาสละสลวย เปรียบเปรยโลกในแง่ดี)",
    preAnswers: {
      q1: "สมุดบันทึกและปากกาหมึกซึมคู่ใจ",
      q2: "ดาดฟ้าตึกเทวาลัย ลมเย็นและมองเห็นวิวเมืองรอบด้าน",
    },
    realName: "Janon Kingkohyao",
    realAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    realFaculty: "อักษรศาสตร์ (ภาษาอังกฤษ) ปี 3",
    instagram: "@janon_arts",
    lineId: "janon_boardgame",
    realBio: "เด็กอักษรเอกวรรณกรรม ชอบเล่นบอร์ดเกมและดูภาพยนตร์อินดี้",
    chatLinesStage1: [
      "สวัสดีเพื่อนๆ เราเด็กอักษรจ้า ยินดีที่ได้คุยกันในห้องนี้นะ",
      "แม้โลกภายนอกจะวุ่นวาย แต่ในแชทนี้เราสัมผัสได้ถึงมิตรภาพอบอุ่น",
    ],
    chatLinesStage2: [
      "ถ้าต้องหลบภัย เราขอเสนอให้ไปดาดฟ้าเทวาลัย มองดาวรอความช่วยเหลือแบบโรแมนติก",
      "เรามีสมุดบันทึก จะคอยจดบันทึกวีรกรรมความกล้าหาญของพวกเรา 5 คนไว้ชั่วลูกชั่วหลาน",
    ],
  },
  {
    id: "member_arch",
    feedUserId: "user_mock_kedtisak",
    alias: "เด็กสถาปัตย์ปั้นโมเดล",
    icon: "color-palette-outline",
    faculty: "สถาปัตยกรรมศาสตร์",
    roleplay: "เชฟกระทะเหล็ก (เน้นเรื่องเสบียงและคิดเมนูปรุงอาหารจากสิ่งรอบตัว)",
    preAnswers: {
      q1: "มีดพับอเนกประสงค์และไฟแช็ก",
      q2: "โรงอาหารใต้ตึกเรียน แหล่งรวมเสบียงและเตาแก๊ส",
    },
    realName: "KEDTISAK RAKRUAUG",
    realAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    realFaculty: "สถาปัตยกรรมศาสตร์ (สถาปัตย์หลัก) ปี 4",
    instagram: "@kedtisak_arch",
    lineId: "kedtisak_space",
    realBio: "นอนเช้าตื่นบ่าย โมเดลคืองานศิลปะ ชอบดื่มชาเขียวมัทฉะเข้มข้น",
    chatLinesStage1: [
      "โย่วทุกคน เราเด็กสถาปัตย์ เพิ่งส่งงานเสร็จสดๆ ร้อนๆ ตาจะปิดแล้ว",
      "แต่เพื่อภารกิจ เรามีมีดพับกับไฟแช็กพร้อมสร้างสรรค์ทุกอย่าง",
    ],
    chatLinesStage2: [
      "กองทัพต้องเดินด้วยท้อง ถ้าซอมบี้ล้อม เราต้องบุกไปโรงอาหารก่อนเลย",
      "โรงอาหารมีทั้งวัตถุดิบและเตา เราจะทำเมนูมาม่าคั่วพริกเกลือแจกทุกคนเอง",
    ],
  },
];

// รายการภารกิจรายวันเริ่มต้น 5 ข้อ (เชื่อมโยงกับฟีเจอร์จริง 100% พร้อมระบุแท็บปลายทาง)
export const INITIAL_DAILY_MISSIONS = [
  {
    id: "m_lounge",
    title: "เข้าร่วมห้องสังสรรค์ประจำวัน",
    description: "สุ่มกลุ่ม 5 คนเวลา 19:00 หรือจำลองเข้าห้อง",
    progress: 0,
    target: 1,
    points: 50,
    claimed: false,
    icon: "chatbubbles-outline",
    targetTab: "BlindLoungeTab",
  },
  {
    id: "m_darkroom",
    title: "แชทกับเพื่อนในห้องมืด 1 ครั้ง",
    description: "สานต่อบทสนทนาตัวต่อตัวกับเพื่อนที่แมตช์ได้",
    progress: 0,
    target: 1,
    points: 30,
    claimed: false,
    icon: "moon-outline",
    targetTab: "DarkRoomTab",
  },
  {
    id: "m_add_friend",
    title: "ส่งคำขอเพิ่มเพื่อนในห้องมืด",
    description: "เชื่อมโยงมิตรภาพสู่หน้าแชทหลัก",
    progress: 0,
    target: 1,
    points: 30,
    claimed: false,
    icon: "person-add-outline",
    targetTab: "DarkRoomTab",
  },
  {
    id: "m_quiz_guess",
    title: "ทายโรลเพลย์เพื่อนในห้องสังสรรค์ถูกต้อง",
    description: "ตอบควิซและจับไต๋บทบาทเพื่อนให้ได้",
    progress: 0,
    target: 1,
    points: 40,
    claimed: false,
    icon: "help-buoy-outline",
    targetTab: "BlindLoungeTab",
  },
  {
    id: "m_change_mascot",
    title: "ปรับแต่งนามแฝงหรือเปลี่ยนอวาตาร",
    description: "เปลี่ยนไอคอนมาสคอตหรือตั้งชื่อฉายาใหม่",
    progress: 0,
    target: 1,
    points: 20,
    claimed: false,
    icon: "color-wand-outline",
    targetTab: "MyAliasTab",
  },
];

// ห้องมืดเริ่มต้น (เริ่มต้นแบบนิรนาม ยังไม่เปิดเผยตัวตนจริง)
const INITIAL_DARK_ROOMS = [
  {
    id: "dark_default_1",
    partnerId: "member_arts",
    feedUserId: "user_mock_janon",
    partnerAlias: "เด็กอักษรชวนคุย",
    partnerIcon: "headset-outline",
    partnerRealName: "Janon Kingkohyao",
    partnerRealAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    partnerRealFaculty: "อักษรศาสตร์ (ภาษาอังกฤษ) ปี 3",
    instagram: "@janon_arts",
    lineId: "janon_boardgame",
    partnerBio: "ชอบดูดาว ถ่ายรูปฟิล์ม และอ่านวรรณกรรมอินดี้",
    friendStatus: "none", // 'none' | 'pending' | 'accepted'
    isRealIdentityRevealed: false,
    lastMessage: "คุยกันสบายๆ ก่อนได้เลยนะ ไม่ต้องเกร็ง หากคุยถูกคอกดเพิ่มเพื่อนได้เลยจ้า",
    lastMessageTime: "เมื่อสักครู่",
    messages: [
      {
        id: "dm_1",
        senderId: "member_arts",
        text: "สวัสดีจ้า! ยินดีที่ได้คุยกันในห้องมืดนะ",
        createdAt: "20:00",
        isMe: false,
      },
      {
        id: "dm_2",
        senderId: "member_arts",
        text: "คุยกันสบายๆ ก่อนได้เลยนะ ไม่ต้องเกร็ง หากคุยถูกคอกดเพิ่มเพื่อนได้เลยจ้า",
        createdAt: "20:01",
        isMe: false,
      },
    ],
  },
];

const CrossBubbleContext = createContext();

export function CrossBubbleProvider({ children }) {
  const { user } = useAuth();
  const { profile } = useData();
  const { startChatWithUser, posts: feedPosts } = useFeed();
  const { addPeekPasses, extendTrial, peekPasses } = usePremium();

  // โหมดเปิดใช้งาน Cross-Bubble
  const [isCrossBubbleMode, setIsCrossBubbleMode] = useState(false);

  // แท็บปลายทางในหน้าหลักเมื่อกลับจากโหมด Cross-Bubble (ค่าเริ่มต้นเปิดแอปเป็น HomeTab)
  const [targetMainTab, setTargetMainTab] = useState("HomeTab");

  // โปรไฟล์นามแฝงของผู้ใช้
  const [userAlias, setUserAlias] = useState(null);

  // ข้อมูลสถานะไฟ และแต้มสะสม
  const [streakDays, setStreakDays] = useState(3);
  const [isFlameActive, setIsFlameActive] = useState(true);
  const [bubblePoints, setBubblePoints] = useState(160);
  const [unlockedAvatars, setUnlockedAvatars] = useState(MASCOT_ICONS);

  // ภารกิจรายวัน
  const [dailyMissions, setDailyMissions] = useState(INITIAL_DAILY_MISSIONS);

  // ห้องมืด (Dark Room)
  const [darkRooms, setDarkRooms] = useState(INITIAL_DARK_ROOMS);
  const [activeDarkRoomId, setActiveDarkRoomId] = useState(null);

  // ====================================================
  // ห้องสังสรรค์ (Social Lounge State Machine)
  // Stages: 'countdown' | 'pre_input' | 'mission_brief' | 'stage1' | 'stage2' | 'quiz' | 'vote_close' | 'revealed'
  // ====================================================
  const [loungeStage, setLoungeStage] = useState("countdown");
  const [todayTopicIndex, setTodayTopicIndex] = useState(0);
  const todayTopic = DAILY_TOPICS[todayTopicIndex] || DAILY_TOPICS[0];

  // คำตอบก่อนเข้าห้องของผู้ใช้
  const [userPreAnswers, setUserPreAnswers] = useState({ q1: "", q2: "" });

  // ภารกิจลับของผู้ใช้ในรอบนี้
  const [userMission, setUserMission] = useState({
    roleplayTitle: "ประธานรุ่นไฟแรง (Student President)",
    roleplayInstruction: "สวมบทบาทเป็นประธานรุ่นที่คอยประสานงาน เป็นมิตร และพยายามให้ทุกคนมีส่วนร่วม",
    secretTask: "สืบให้ได้ว่าเพื่อนอย่างน้อย 2 คนจะพกไอเท็มอะไรติดมือเวลาฉุกเฉิน",
    targetQuestionId: "q1",
  });

  // ข้อความแชทในห้องสังสรรค์
  const [loungeMessages, setLoungeMessages] = useState([]);
  // ตัวจับเวลาของสเตจ (วินาที)
  const [stageSecondsLeft, setStageSecondsLeft] = useState(300); // 5 mins
  // การโหวตข้ามสเตจของผู้ใช้
  const [userVotedSkip, setUserVotedSkip] = useState(false);
  const [skipVotesCount, setSkipVotesCount] = useState(0);

  // การตอบควิซ
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDetails, setQuizDetails] = useState([]);

  // การโหวตปิดห้อง
  const [userVotedClose, setUserVotedClose] = useState(false);
  const [closeVotesCount, setCloseVotesCount] = useState(0);

  // รายชื่อเพื่อนร่วมห้อง 4 คน
  const [loungeMembers] = useState(SIMULATED_CLASSMATES);
  // รายการคนที่แมตช์แล้ว
  const [matchedMemberIds, setMatchedMemberIds] = useState([]);

  // Timer reference
  const timerRef = useRef(null);

  // สร้างนามแฝงสุ่ม
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

  // โหลดสถานะที่บันทึกไว้ใน Local Storage
  useEffect(() => {
    async function loadStorage() {
      try {
        const storedActive = await AsyncStorage.getItem(CROSS_BUBBLE_STORAGE_KEY);
        if (storedActive === "true") setIsCrossBubbleMode(true);

        const storedAlias = await AsyncStorage.getItem(CROSS_BUBBLE_ALIAS_KEY);
        if (storedAlias) {
          const parsed = JSON.parse(storedAlias);
          parsed.badge = "ผู้ทลาย Social Bubble";
          setUserAlias(parsed);
        } else {
          const newAlias = generateRandomAlias();
          setUserAlias(newAlias);
          await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(newAlias));
        }

        const storedDark = await AsyncStorage.getItem(CROSS_BUBBLE_DARK_ROOMS_KEY);
        if (storedDark) setDarkRooms(JSON.parse(storedDark));

        const storedMissions = await AsyncStorage.getItem(CROSS_BUBBLE_MISSIONS_KEY);
        if (storedMissions) {
          try {
            const parsed = JSON.parse(storedMissions);
            // ล้างภารกิจจำลองที่ถูกยกเลิกไปแล้ว (เช่น m_post_note หรือกระดานลับ) ทันที
            const sanitized = INITIAL_DAILY_MISSIONS.map((defaultM) => {
              const existing = Array.isArray(parsed) ? parsed.find((p) => p.id === defaultM.id) : null;
              if (existing) {
                return {
                  ...defaultM,
                  progress: typeof existing.progress === "number" ? existing.progress : 0,
                  claimed: Boolean(existing.claimed),
                };
              }
              return defaultM;
            });
            setDailyMissions(sanitized);
            await AsyncStorage.setItem(CROSS_BUBBLE_MISSIONS_KEY, JSON.stringify(sanitized));
          } catch {
            setDailyMissions(INITIAL_DAILY_MISSIONS);
            await AsyncStorage.setItem(CROSS_BUBBLE_MISSIONS_KEY, JSON.stringify(INITIAL_DAILY_MISSIONS));
          }
        } else {
          setDailyMissions(INITIAL_DAILY_MISSIONS);
          await AsyncStorage.setItem(CROSS_BUBBLE_MISSIONS_KEY, JSON.stringify(INITIAL_DAILY_MISSIONS));
        }

        const storedPoints = await AsyncStorage.getItem(CROSS_BUBBLE_POINTS_KEY);
        if (storedPoints !== null) {
          const parsedPts = parseInt(storedPoints, 10);
          if (isNaN(parsedPts) || parsedPts <= 0) {
            setBubblePoints(120);
            await AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, "120");
          } else {
            setBubblePoints(parsedPts);
          }
        } else {
          setBubblePoints(120);
          await AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, "120");
        }

        const storedStreak = await AsyncStorage.getItem(CROSS_BUBBLE_STREAK_KEY);
        if (storedStreak) setStreakDays(parseInt(storedStreak, 10));

        const storedUnlocked = await AsyncStorage.getItem(CROSS_BUBBLE_UNLOCKED_AVATARS_KEY);
        if (storedUnlocked) setUnlockedAvatars(JSON.parse(storedUnlocked));
      } catch (err) {
        console.warn("Failed to load cross bubble storage:", err);
      }
    }
    loadStorage();
  }, [generateRandomAlias]);

  // อัปเดตความคืบหน้าของภารกิจรายวันอัตโนมัติ
  const updateMissionProgress = useCallback((missionId, amount = 1) => {
    setDailyMissions((prev) => {
      const next = prev.map((m) => {
        if (m.id === missionId && !m.claimed) {
          const newProgress = Math.min(m.target, m.progress + amount);
          return { ...m, progress: newProgress };
        }
        return m;
      });
      AsyncStorage.setItem(CROSS_BUBBLE_MISSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // เคลมรางวัลภารกิจรายวัน
  const claimMissionReward = useCallback((missionId) => {
    setDailyMissions((prev) => {
      let earnedPoints = 0;
      const next = prev.map((m) => {
        if (m.id === missionId && m.progress >= m.target && !m.claimed) {
          earnedPoints = m.points;
          return { ...m, claimed: true };
        }
        return m;
      });
      if (earnedPoints > 0) {
        setBubblePoints((pts) => {
          const total = pts + earnedPoints;
          AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, String(total));
          return total;
        });
      }
      AsyncStorage.setItem(CROSS_BUBBLE_MISSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ปลดล็อคอวาตารใหม่จากร้านค้าและสวมใส่ทันที
  const unlockAvatar = useCallback((avatarId, cost) => {
    if (bubblePoints < cost) return false;
    const newPoints = bubblePoints - cost;
    setBubblePoints(newPoints);
    AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, String(newPoints));

    setUnlockedAvatars((prev) => {
      const next = prev.includes(avatarId) ? prev : [...prev, avatarId];
      AsyncStorage.setItem(CROSS_BUBBLE_UNLOCKED_AVATARS_KEY, JSON.stringify(next));
      return next;
    });

    // สวมใส่อวาตารที่ซื้อทันที
    setUserAlias((prev) => {
      const next = { ...prev, icon: avatarId };
      AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(next));
      return next;
    });

    updateMissionProgress("m_change_mascot", 1);
    return true;
  }, [bubblePoints, updateMissionProgress]);

  // แลกตั๋วส่องโปรไฟล์ 1 ใบ (ใช้ 40 แต้ม)
  const exchangePeekPass = useCallback((cost = 40) => {
    if (bubblePoints < cost) return false;
    const newPoints = bubblePoints - cost;
    setBubblePoints(newPoints);
    AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, String(newPoints));
    if (addPeekPasses) {
      addPeekPasses(1);
    }
    return true;
  }, [addPeekPasses, bubblePoints]);

  // แลกขยายเวลาทดลองใช้งานผู้ใช้ฟองสบู่ +1 วัน (ใช้ 80 แต้ม)
  const exchangeTrialExtension = useCallback((cost = 80) => {
    if (bubblePoints < cost) return false;
    const newPoints = bubblePoints - cost;
    setBubblePoints(newPoints);
    AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, String(newPoints));
    if (extendTrial) {
      extendTrial(1);
    }
    return true;
  }, [bubblePoints, extendTrial]);

  // แลกเกราะพิทักษ์ไฟสตรีค (ใช้ 50 แต้ม)
  const exchangeFlameShield = useCallback((cost = 50) => {
    if (bubblePoints < cost) return false;
    const newPoints = bubblePoints - cost;
    setBubblePoints(newPoints);
    AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, String(newPoints));
    setIsFlameActive(true);
    setStreakDays((prev) => {
      const nextStreak = prev + 1;
      AsyncStorage.setItem(CROSS_BUBBLE_STREAK_KEY, String(nextStreak));
      return nextStreak;
    });
    return true;
  }, [bubblePoints]);

  // สลับโหมด Cross-Bubble (สามารถระบุแท็บปลายทางเมื่อกลับสู่โหมดปกติได้ ค่าเริ่มต้นคือ "FeedTab")
  const toggleCrossBubbleMode = useCallback(async (active, targetTab = "FeedTab") => {
    if (!active) {
      setTargetMainTab(targetTab || "FeedTab");
    } else {
      setTargetMainTab(null);
    }
    setIsCrossBubbleMode(active);
    await AsyncStorage.setItem(CROSS_BUBBLE_STORAGE_KEY, active ? "true" : "false");
  }, []);

  // เปลี่ยนชื่อนามแฝง (Alias)
  const updateUserAliasName = useCallback(async (newName) => {
    if (!newName.trim()) return;
    setUserAlias((prev) => {
      const next = { ...prev, nickname: newName.trim() };
      AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(next));
      return next;
    });
    updateMissionProgress("m_change_mascot", 1);
  }, [updateMissionProgress]);

  // เปลี่ยนไอคอนมาสคอต
  const changeMascot = useCallback(async (icon) => {
    setUserAlias((prev) => {
      const next = { ...prev, icon };
      AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(next));
      return next;
    });
    updateMissionProgress("m_change_mascot", 1);
  }, [updateMissionProgress]);

  // สุ่มฉายาใหม่
  const regenerateAlias = useCallback(async () => {
    const newAlias = generateRandomAlias();
    setUserAlias(newAlias);
    await AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(newAlias));
    return newAlias;
  }, [generateRandomAlias]);

  // ====================================================
  // ห้องสังสรรค์ (Social Lounge Controls)
  // ====================================================

  const enterLoungeDevMode = useCallback(() => {
    setLoungeStage("pre_input");
    setUserVotedSkip(false);
    setSkipVotesCount(0);
    setUserVotedClose(false);
    setCloseVotesCount(0);
    setQuizSubmitted(false);
    setQuizScore(0);
    setMatchedMemberIds([]);
    setLoungeMessages([]);
    updateMissionProgress("m_lounge", 1);
  }, [updateMissionProgress]);

  const submitPreAnswers = useCallback((answers) => {
    setUserPreAnswers(answers);
    setLoungeStage("mission_brief");
  }, []);

  const startStage1 = useCallback(() => {
    setLoungeStage("stage1");
    setStageSecondsLeft(300);
    setUserVotedSkip(false);
    setSkipVotesCount(0);

    const sysMsg = {
      id: "sys_start",
      isSystem: true,
      text: "ยินดีต้อนรับสู่ห้องสังสรรค์ประจำวัน (19:00) สเตจที่ 1: แนะนำตัวและพูดคุยสอบถามข้อมูลเพื่อนร่วมกลุ่ม 5 คน (มีเวลา 5 นาที หรือกดโหวตข้ามเมื่อพร้อม)",
      createdAt: "19:00",
    };
    setLoungeMessages([sysMsg]);

    setTimeout(() => {
      const m1 = SIMULATED_CLASSMATES[0];
      setLoungeMessages((prev) => [
        ...prev,
        {
          id: `m_intro_1_${Date.now()}`,
          senderId: m1.id,
          senderAlias: m1.alias,
          senderIcon: m1.icon,
          text: m1.chatLinesStage1[0],
          createdAt: "19:01",
        },
      ]);
    }, 1500);

    setTimeout(() => {
      const m2 = SIMULATED_CLASSMATES[1];
      setLoungeMessages((prev) => [
        ...prev,
        {
          id: `m_intro_2_${Date.now()}`,
          senderId: m2.id,
          senderAlias: m2.alias,
          senderIcon: m2.icon,
          text: m2.chatLinesStage1[0],
          createdAt: "19:02",
        },
      ]);
    }, 3500);

    setTimeout(() => {
      const m3 = SIMULATED_CLASSMATES[2];
      setLoungeMessages((prev) => [
        ...prev,
        {
          id: `m_intro_3_${Date.now()}`,
          senderId: m3.id,
          senderAlias: m3.alias,
          senderIcon: m3.icon,
          text: m3.chatLinesStage1[0],
          createdAt: "19:03",
        },
      ]);
    }, 6000);

    updateMissionProgress("m_lounge", 1);
  }, [updateMissionProgress]);

  const startStage2 = useCallback(() => {
    setLoungeStage("stage2");
    setStageSecondsLeft(600);
    setUserVotedSkip(false);
    setSkipVotesCount(0);

    const sysMsg = {
      id: `sys_stage2_${Date.now()}`,
      isSystem: true,
      text: `สเตจที่ 2 เริ่มต้นขึ้นแล้ว: ถกหัวข้อประจำวัน "${todayTopic.title}" (มีเวลา 10 นาที สามารถกดโหวตข้ามเพื่อเริ่มตอบคำถามควิซได้ทุกเมื่อ)`,
      createdAt: "19:05",
    };
    setLoungeMessages((prev) => [...prev, sysMsg]);

    setTimeout(() => {
      const m1 = SIMULATED_CLASSMATES[0];
      setLoungeMessages((prev) => [
        ...prev,
        {
          id: `m_s2_1_${Date.now()}`,
          senderId: m1.id,
          senderAlias: m1.alias,
          senderIcon: m1.icon,
          text: m1.chatLinesStage2[0],
          createdAt: "19:06",
        },
      ]);
    }, 2000);

    setTimeout(() => {
      const m4 = SIMULATED_CLASSMATES[3];
      setLoungeMessages((prev) => [
        ...prev,
        {
          id: `m_s2_2_${Date.now()}`,
          senderId: m4.id,
          senderAlias: m4.alias,
          senderIcon: m4.icon,
          text: m4.chatLinesStage2[0],
          createdAt: "19:07",
        },
      ]);
    }, 5000);
  }, [todayTopic.title]);

  const sendLoungeMessage = useCallback((text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `msg_user_${Date.now()}`,
      senderId: "me",
      senderAlias: userAlias?.nickname || "คุณ",
      senderIcon: userAlias?.icon || "finger-print-outline",
      text: text.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setLoungeMessages((prev) => [...prev, newMsg]);

    const randomClassmate = SIMULATED_CLASSMATES[Math.floor(Math.random() * SIMULATED_CLASSMATES.length)];
    const replyLine =
      loungeStage === "stage1"
        ? randomClassmate.chatLinesStage1[1] || randomClassmate.chatLinesStage1[0]
        : randomClassmate.chatLinesStage2[1] || randomClassmate.chatLinesStage2[0];

    setTimeout(() => {
      setLoungeMessages((prev) => [
        ...prev,
        {
          id: `msg_sim_${Date.now()}`,
          senderId: randomClassmate.id,
          senderAlias: randomClassmate.alias,
          senderIcon: randomClassmate.icon,
          text: replyLine,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        },
      ]);
    }, 1800);
  }, [loungeStage, userAlias]);

  useEffect(() => {
    if (loungeStage !== "stage1" && loungeStage !== "stage2") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStageSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (loungeStage === "stage1") {
            startStage2();
          } else if (loungeStage === "stage2") {
            setLoungeStage("quiz");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loungeStage, startStage2]);

  const voteSkipStage = useCallback(() => {
    if (userVotedSkip) return;
    setUserVotedSkip(true);
    setSkipVotesCount(1);

    setTimeout(() => setSkipVotesCount(2), 500);
    setTimeout(() => setSkipVotesCount(3), 1000);
    setTimeout(() => setSkipVotesCount(4), 1600);
    setTimeout(() => {
      setSkipVotesCount(5);
      if (loungeStage === "stage1") {
        startStage2();
      } else if (loungeStage === "stage2") {
        setLoungeStage("quiz");
      }
    }, 2200);
  }, [loungeStage, startStage2, userVotedSkip]);

  const submitQuizAnswers = useCallback((answers) => {
    let score = 0;
    const details = [];

    SIMULATED_CLASSMATES.forEach((member) => {
      const userAns = answers[member.id] || {};
      const actualRole = member.roleplay;
      const actualItem = member.preAnswers.q1;

      const guessedRoleMatch = actualRole.includes(userAns.roleplayGuess || "xxx");
      const itemMatch = userAns.itemAnswer && userAns.itemAnswer.trim().length > 0;

      let memberPoints = 0;
      if (guessedRoleMatch) {
        memberPoints += 25;
        score += 25;
      }
      if (itemMatch) {
        memberPoints += 25;
        score += 25;
      }

      details.push({
        memberId: member.id,
        memberAlias: member.alias,
        actualRole,
        actualItem,
        userRoleGuess: userAns.roleplayGuess || "ไม่ได้ระบุ",
        userItemAnswer: userAns.itemAnswer || "ไม่ได้ระบุ",
        isRoleCorrect: guessedRoleMatch,
        isItemCorrect: !!itemMatch,
        points: memberPoints,
      });
    });

    setQuizScore(score);
    setQuizDetails(details);
    setQuizSubmitted(true);
    setLoungeStage("vote_close");

    if (score >= 25) {
      updateMissionProgress("m_quiz_guess", 1);
    }
  }, [updateMissionProgress]);

  const voteCloseRoom = useCallback(() => {
    if (userVotedClose) return;
    setUserVotedClose(true);
    setCloseVotesCount(1);

    setTimeout(() => setCloseVotesCount(3), 600);
    setTimeout(() => {
      setCloseVotesCount(5);
      setLoungeStage("revealed");
    }, 1400);
  }, [userVotedClose]);

  // แมตช์เพื่อนเพื่อเปิดแชทในห้องมืด (เริ่มต้นแบบนิรนาม ยังไม่เปิดเผยตัวตนจริง)
  const matchWithMember = useCallback((memberId) => {
    const member = SIMULATED_CLASSMATES.find((m) => m.id === memberId);
    if (!member) return null;

    if (!matchedMemberIds.includes(memberId)) {
      setMatchedMemberIds((prev) => [...prev, memberId]);
    }

    const roomId = `dark_${member.id}`;
    let targetRoom = null;

    setDarkRooms((prev) => {
      const existing = prev.find((r) => r.partnerId === member.id || r.id === roomId);
      if (existing) {
        targetRoom = existing;
        return prev;
      }

      // สร้างห้องมืดใหม่ เริ่มต้นด้วย isRealIdentityRevealed: false และ friendStatus: 'none'
      const newDarkRoom = {
        id: roomId,
        partnerId: member.id,
        feedUserId: member.feedUserId,
        partnerAlias: member.alias,
        partnerIcon: member.icon,
        partnerRealName: member.realName,
        partnerRealAvatar: member.realAvatar,
        partnerRealFaculty: member.realFaculty,
        instagram: member.instagram,
        lineId: member.lineId,
        partnerBio: member.realBio,
        friendStatus: "none", // 'none' | 'pending' | 'accepted'
        isRealIdentityRevealed: false,
        lastMessage: "เริ่มการสนทนาแบบนิรนาม กดเพิ่มเพื่อนเมื่อพร้อมเปิดเผยตัวจริง",
        lastMessageTime: "เมื่อสักครู่",
        messages: [
          {
            id: `msg_m_${Date.now()}`,
            senderId: member.id,
            text: `สวัสดีครับ! ยินดีที่ได้จับคู่มาคุยต่อในห้องมืดนะ คุยกันชิลๆ ได้เลยครับ`,
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
          },
        ],
      };

      targetRoom = newDarkRoom;
      const next = [newDarkRoom, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_DARK_ROOMS_KEY, JSON.stringify(next));
      return next;
    });

    setActiveDarkRoomId(roomId);
    return roomId;
  }, [matchedMemberIds]);

  const resetLoungeSession = useCallback(() => {
    setLoungeStage("countdown");
    setUserVotedSkip(false);
    setSkipVotesCount(0);
    setUserVotedClose(false);
    setCloseVotesCount(0);
    setQuizSubmitted(false);
    setQuizScore(0);
    setMatchedMemberIds([]);
    setLoungeMessages([]);
    setTodayTopicIndex((prev) => (prev + 1) % DAILY_TOPICS.length);
  }, []);

  // ====================================================
  // ห้องมืด (Dark Room Controls & Add Friend Flow)
  // ====================================================

  // ส่งคำขอเพิ่มเพื่อนในห้องมืด -> เพื่อนจำลองตอบรับอัตโนมัติ -> ซิงค์เข้าแชทหน้าหลัก
  const sendFriendRequest = useCallback((roomId) => {
    setDarkRooms((prev) => {
      const room = prev.find((r) => r.id === roomId);
      if (!room || room.friendStatus === "accepted") return prev;

      const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const requestSysMsg = {
        id: `sys_fr_${Date.now()}`,
        isSystem: true,
        text: "คุณได้ส่งคำขอเพิ่มเพื่อนแล้ว รอการตอบรับจากคู่สนทนา...",
        createdAt: timeNow,
      };

      const updatedWithPending = prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            friendStatus: "pending",
            messages: [...r.messages, requestSysMsg],
          };
        }
        return r;
      });

      AsyncStorage.setItem(CROSS_BUBBLE_DARK_ROOMS_KEY, JSON.stringify(updatedWithPending));

      // เพื่อนตอบรับคำขออัตโนมัติหลัง 2 วินาที
      setTimeout(() => {
        setDarkRooms((current) => {
          const target = current.find((r) => r.id === roomId);
          if (!target) return current;

          const acceptTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const acceptMsg = {
            id: `msg_accept_${Date.now()}`,
            senderId: target.partnerId,
            text: `เราตอบรับคำขอเป็นเพื่อนแล้วนะ! ยินดีที่ได้รู้จักตัวจริงนะ เราชื่อ ${target.partnerRealName} อยู่ ${target.partnerRealFaculty} คอนแทกต์จริงเปิดเผยแล้ว และเราจะคุยกันต่อในแชทหน้าหลักได้ด้วย!`,
            createdAt: acceptTime,
            isMe: false,
          };

          const sysRevealedMsg = {
            id: `sys_revealed_${Date.now()}`,
            isSystem: true,
            text: "เป็นเพื่อนกันแล้ว! ตัวตนจริงและช่องทางติดต่อของทั้งสองฝ่ายถูกเปิดเผยเรียบร้อยแล้ว และเพื่อนคนนี้จะแสดงในแชทหน้าหลัก",
            createdAt: acceptTime,
          };

          const updatedWithAccepted = current.map((r) => {
            if (r.id === roomId) {
              return {
                ...r,
                friendStatus: "accepted",
                isRealIdentityRevealed: true,
                lastMessage: acceptMsg.text,
                lastMessageTime: acceptTime,
                messages: [...r.messages, acceptMsg, sysRevealedMsg],
              };
            }
            return r;
          });

          AsyncStorage.setItem(CROSS_BUBBLE_DARK_ROOMS_KEY, JSON.stringify(updatedWithAccepted));

          // ซิงค์เพื่อนคนนี้เข้าสู่แชทหน้าหลัก (FeedContext) พร้อมย้ายประวัติแชทจากห้องมืด
          if (startChatWithUser) {
            const darkHistory = (target.messages || [])
              .filter((m) => !m.isSystem && m.text)
              .map((m) => ({
                id: m.id || `migrated_${Date.now()}_${Math.random()}`,
                senderId: m.isMe ? (user?.id || "guest") : (target.feedUserId || target.partnerId),
                text: m.text,
                createdAt: m.createdAt,
              }));

            startChatWithUser(
              {
                id: target.feedUserId || target.partnerId,
                name: target.partnerRealName,
                avatar: target.partnerRealAvatar,
                faculty: target.partnerRealFaculty,
                status: "online",
              },
              `สวัสดีครับ เป็นเพื่อนกันจากห้องมืดในโหมด Cross-Bubble แล้วนะ!`,
              darkHistory
            );
          }

          updateMissionProgress("m_add_friend", 1);

          return updatedWithAccepted;
        });
      }, 2200);

      return updatedWithPending;
    });
  }, [startChatWithUser, updateMissionProgress]);

  // ส่งข้อความในห้องมืด
  const sendDarkRoomMessage = useCallback((roomId, text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `dm_${Date.now()}`,
      senderId: "me",
      text: text.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setDarkRooms((prev) => {
      const next = prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            lastMessage: text.trim(),
            lastMessageTime: "เมื่อสักครู่",
            messages: [...r.messages, newMsg],
          };
        }
        return r;
      });
      AsyncStorage.setItem(CROSS_BUBBLE_DARK_ROOMS_KEY, JSON.stringify(next));
      return next;
    });

    updateMissionProgress("m_darkroom", 1);
  }, [updateMissionProgress]);

  // ดึงรายการโพสต์ของเพื่อนคนนี้ (จากฟีดหลัก)
  const getFriendPosts = useCallback((feedUserId, partnerRealName) => {
    if (!feedPosts || feedPosts.length === 0) return [];
    const matchedPosts = feedPosts.filter(
      (p) =>
        (feedUserId && p.authorId === feedUserId) ||
        (partnerRealName && p.authorName === partnerRealName)
    );

    // หากไม่พบโพสต์ตรงตัว ให้แสดงโพสต์ตัวอย่างของเพื่อนคนนั้น
    if (matchedPosts.length === 0) {
      return [
        {
          id: `sample_post_${feedUserId || "1"}`,
          authorName: partnerRealName || "เพื่อนใน Mindclick",
          content: "ยินดีที่ได้แลกเปลี่ยนมิตรภาพและก้าวข้าม Social Bubble มารู้จักกันในรั้วมหาวิทยาลัยนะ!",
          createdAt: "วันนี้",
          likes: ["me"],
          topicId: "hobbies",
        },
      ];
    }

    return matchedPosts;
  }, [feedPosts]);

  return (
    <CrossBubbleContext.Provider
      value={{
        isCrossBubbleMode,
        toggleCrossBubbleMode,
        targetMainTab,
        setTargetMainTab,
        userAlias,
        updateUserAliasName,
        changeMascot,
        regenerateAlias,
        mascotOptions: MASCOT_ICONS,
        shopAvatars: SHOP_AVATARS,
        unlockedAvatars,
        unlockAvatar,
        streakDays,
        isFlameActive,
        bubblePoints,
        dailyMissions,
        claimMissionReward,
        updateMissionProgress,
        exchangePeekPass,
        exchangeTrialExtension,
        exchangeFlameShield,
        peekPasses,
        darkRooms,
        activeDarkRoomId,
        setActiveDarkRoomId,
        sendDarkRoomMessage,
        sendFriendRequest,
        getFriendPosts,
        // Social Lounge
        loungeStage,
        todayTopic,
        userPreAnswers,
        userMission,
        loungeMessages,
        stageSecondsLeft,
        userVotedSkip,
        skipVotesCount,
        loungeMembers,
        quizSubmitted,
        quizScore,
        quizDetails,
        userVotedClose,
        closeVotesCount,
        matchedMemberIds,
        enterLoungeDevMode,
        submitPreAnswers,
        startStage1,
        startStage2,
        sendLoungeMessage,
        voteSkipStage,
        submitQuizAnswers,
        voteCloseRoom,
        matchWithMember,
        resetLoungeSession,
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
