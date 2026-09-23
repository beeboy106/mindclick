import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

const CROSS_BUBBLE_STORAGE_KEY = "@mindclick_cross_bubble_active";
const CROSS_BUBBLE_ALIAS_KEY = "@mindclick_cross_bubble_alias";
const CROSS_BUBBLE_DARK_ROOMS_KEY = "@mindclick_cross_bubble_dark_rooms";
const CROSS_BUBBLE_WHISPER_KEY = "@mindclick_cross_bubble_whispers";
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
  { id: "rocket-outline", name: "นักท่องอวกาศ", cost: 50 },
  { id: "sparkles-outline", name: "ประกายเวทมนตร์", cost: 80 },
  { id: "diamond-outline", name: "เพชรยอดมงกุฎ", cost: 120 },
  { id: "shield-outline", name: "ผู้พิทักษ์บับเบิ้ล", cost: 150 },
  { id: "flame-outline", name: "เปลวเพลิงนิรันดร์", cost: 200 },
  { id: "trophy-outline", name: "แชมป์เปี้ยนคณะ", cost: 250 },
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

// รายการเพื่อนจำลอง 4 คนในห้องสังสรรค์
const SIMULATED_CLASSMATES = [
  {
    id: "member_med",
    alias: "เด็กแพทย์สายลุย",
    icon: "fitness-outline",
    faculty: "แพทยศาสตร์",
    roleplay: "นักสืบโคนัน (พูดจาวิเคราะห์ สังเกตพฤติกรรมเพื่อนตลอดเวลา)",
    preAnswers: {
      q1: "ชุดปฐมพยาบาลเบื้องต้นและยารักษาโรค",
      q2: "ห้องผ่าตัดบนตึกชั้น 7 ประตูล็อคแน่นหนา",
    },
    realName: "นันทิภัทร โชคอนันต์ (หมอนัน)",
    realAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    realFaculty: "แพทยศาสตร์ ปี 3",
    instagram: "@nan.md_chula",
    lineId: "nan_med99",
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
    alias: "เด็กวิศวะสายแฮก",
    icon: "terminal-outline",
    faculty: "วิศวกรรมศาสตร์",
    roleplay: "วิศวกรซ่อมทุกอย่าง (เสนอวิธีดัดแปลงสิ่งของรอบตัวให้กลายเป็นอุปกรณ์)",
    preAnswers: {
      q1: "ไขควงมัลติทูลและพาวเวอร์แบงก์ 30000mAh",
      q2: "ช็อปวิศวะเครื่องกล มีเครื่องมือช่างและเหล็กกล้า",
    },
    realName: "ธนกฤต ศิริพงษ์ (กฤต)",
    realAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    realFaculty: "วิศวกรรมศาสตร์ (คอมพิวเตอร์) ปี 2",
    instagram: "@krit_engr",
    lineId: "krit_code",
    realBio: "วิศวะคอมฯ สนใจเรื่อง Smart City และระบบความปลอดภัยไซเบอร์",
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
    alias: "เด็กอักษรชวนคุย",
    icon: "headset-outline",
    faculty: "อักษรศาสตร์",
    roleplay: "กวีพเนจรผู้อารมณ์ดี (พูดจาสละสลวย เปรียบเปรยโลกในแง่ดี)",
    preAnswers: {
      q1: "สมุดบันทึกและปากกาหมึกซึมคู่ใจ",
      q2: "ดาดฟ้าตึกเทวาลัย ลมเย็นและมองเห็นวิวเมืองรอบด้าน",
    },
    realName: "วริศรา เจริญสุข (ใบเฟิร์น)",
    realAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    realFaculty: "อักษรศาสตร์ (ภาษาอังกฤษ) ปี 3",
    instagram: "@fern_arts.chula",
    lineId: "fern_indie",
    realBio: "เด็กอักษรเอกวรรณกรรม ชอบถ่ายรูปฟิล์มและดูภาพยนตร์อินดี้",
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
    alias: "เด็กสถาปัตย์ปั้นโมเดล",
    icon: "color-palette-outline",
    faculty: "สถาปัตยกรรมศาสตร์",
    roleplay: "เชฟกระทะเหล็ก (เน้นเรื่องเสบียงและคิดเมนูปรุงอาหารจากสิ่งรอบตัว)",
    preAnswers: {
      q1: "มีดพับอเนกประสงค์และไฟแช็ก",
      q2: "โรงอาหารใต้ตึกเรียน แหล่งรวมเสบียงและเตาแก๊ส",
    },
    realName: "จิรัฏฐ์ อนันตศิลป์ (กันต์)",
    realAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    realFaculty: "สถาปัตยกรรมศาสตร์ (สถาปัตย์หลัก) ปี 4",
    instagram: "@jiratt_arch",
    lineId: "jiratt_space",
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

// ข้อมูลกระดานลับเริ่มต้น (สไตล์ Instagram Notes)
const INITIAL_WHISPERS = [
  {
    id: "wh_1",
    authorFaculty: "เด็กแพทย์",
    authorIcon: "fitness-outline",
    content: "ใครบอกเด็กแพทย์อ่านแต่หนังสือ ตอนนี้อยากมีตี้เล่นบอร์ดเกมหรือไปนั่งฟังเพลงมาก มีใครว่างบ้าง",
    createdAt: "10 นาทีที่แล้ว",
    pops: 18,
    hasPopped: false,
    authorRealInfo: {
      name: "นันทิภัทร โชคอนันต์ (หมอนัน)",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      faculty: "แพทยศาสตร์ ปี 3",
      instagram: "@nan.md_chula",
      lineId: "nan_med99",
      bio: "ชอบบอร์ดเกมและวิ่งมาราธอน",
    },
  },
  {
    id: "wh_2",
    authorFaculty: "เด็กสถาปัตย์",
    authorIcon: "color-palette-outline",
    content: "โปรเจกต์ส่งพรุ่งนี้เช้า เพิ่งขึ้นโมเดลเสร็จไป 30% กาแฟแก้วที่ 4 ต้องเข้าแล้ว สู้ชีวิตมาก",
    createdAt: "25 นาทีที่แล้ว",
    pops: 34,
    hasPopped: true,
    authorRealInfo: {
      name: "จิรัฏฐ์ อนันตศิลป์ (กันต์)",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      faculty: "สถาปัตยกรรมศาสตร์ ปี 4",
      instagram: "@jiratt_arch",
      lineId: "jiratt_space",
      bio: "เด็กสถาปัตย์ชอบดื่มชาเขียวและถ่ายภาพ Street",
    },
  },
  {
    id: "wh_3",
    authorFaculty: "เด็กวิศวะ",
    authorIcon: "construct-outline",
    content: "แอบมองเด็กอักษรที่โรงอาหารกลางมาทั้งเทอม คุยในกลุ่มนี้เผื่อจะเจอคนที่แอบมอง",
    createdAt: "1 ชั่วโมงที่แล้ว",
    pops: 52,
    hasPopped: false,
    authorRealInfo: {
      name: "ธนกฤต ศิริพงษ์ (กฤต)",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
      faculty: "วิศวกรรมศาสตร์ ปี 2",
      instagram: "@krit_engr",
      lineId: "krit_code",
      bio: "วิศวะคอมฯ เขียนโค้ดหาเพื่อนใหม่",
    },
  },
  {
    id: "wh_4",
    authorFaculty: "เด็กบัญชี",
    authorIcon: "calculator-outline",
    content: "งบการเงินไม่ดุลสักที ใครคิดว่าบัญชีง่ายขอให้มาลองนั่งทำตอนตีสองครึ่ง",
    createdAt: "2 ชั่วโมงที่แล้ว",
    pops: 26,
    hasPopped: false,
    authorRealInfo: {
      name: "กานต์ธิดา เลิศวิริยะ (กานต์)",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      faculty: "พาณิชยศาสตร์และการบัญชี ปี 3",
      instagram: "@karn_acc",
      lineId: "karn_balance",
      bio: "ชอบแมวและชาบูปลอบใจงบดุล",
    },
  },
];

// รายการภารกิจรายวันเริ่มต้น 5 ข้อ
const INITIAL_DAILY_MISSIONS = [
  {
    id: "m_lounge",
    title: "เข้าร่วมห้องสังสรรค์ประจำวัน",
    description: "สุ่มกลุ่ม 5 คนเวลา 19:00 หรือจำลองเข้าห้อง",
    progress: 0,
    target: 1,
    points: 50,
    claimed: false,
    icon: "chatbubbles-outline",
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
  },
  {
    id: "m_bubble_pop",
    title: "กด Bubble ในกระดานลับ 2 ครั้ง",
    description: "ส่งกำลังใจให้โน้ตของเพื่อนต่างคณะ",
    progress: 0,
    target: 2,
    points: 20,
    claimed: false,
    icon: "sparkles-outline",
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
  },
  {
    id: "m_post_note",
    title: "โพสต์โน้ตสวมบทบาทลงกระดานลับ",
    description: "เลือกคณะแล้วเขียนโน้ตสั้นๆ สไตล์ IG Notes",
    progress: 0,
    target: 1,
    points: 25,
    claimed: false,
    icon: "duplicate-outline",
  },
];

// ห้องมืดเริ่มต้น
const INITIAL_DARK_ROOMS = [
  {
    id: "dark_default_1",
    partnerId: "member_arts",
    partnerAlias: "เด็กอักษรชวนคุย",
    partnerIcon: "headset-outline",
    partnerRealName: "วริศรา เจริญสุข (ใบเฟิร์น)",
    partnerRealAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    partnerRealFaculty: "อักษรศาสตร์ (ภาษาอังกฤษ) ปี 3",
    instagram: "@fern_arts.chula",
    lineId: "fern_indie",
    partnerBio: "ชอบดูดาว ถ่ายรูปฟิล์ม และอ่านวรรณกรรมอินดี้",
    lastMessage: "ยินดีที่ได้แมตช์กันนะ แอดไอจีมาคุยเรื่องเพลย์ลิสต์เพลงได้เลยนะ!",
    lastMessageTime: "เมื่อสักครู่",
    messages: [
      {
        id: "dm_1",
        senderId: "member_arts",
        text: "สวัสดีจ้า! ยินดีที่ได้แมตช์กันหลังห้องสังสรรค์นะ",
        createdAt: "20:00",
        isMe: false,
      },
      {
        id: "dm_2",
        senderId: "member_arts",
        text: "แอดไอจีมาคุยเรื่องเพลย์ลิสต์เพลงหรือชวนไปนั่งชิลที่คณะได้เลยนะ!",
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

  // โหมดเปิดใช้งาน Cross-Bubble
  const [isCrossBubbleMode, setIsCrossBubbleMode] = useState(false);

  // โปรไฟล์นามแฝงของผู้ใช้
  const [userAlias, setUserAlias] = useState(null);

  // ข้อมูลสถานะไฟ และแต้มสะสม
  const [streakDays, setStreakDays] = useState(3);
  const [isFlameActive, setIsFlameActive] = useState(true);
  const [bubblePoints, setBubblePoints] = useState(160);
  const [unlockedAvatars, setUnlockedAvatars] = useState(MASCOT_ICONS);

  // ภารกิจรายวัน
  const [dailyMissions, setDailyMissions] = useState(INITIAL_DAILY_MISSIONS);

  // กระดานลับ (Secret Board)
  const [whisperNotes, setWhisperNotes] = useState(INITIAL_WHISPERS);

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

        const storedWhispers = await AsyncStorage.getItem(CROSS_BUBBLE_WHISPER_KEY);
        if (storedWhispers) setWhisperNotes(JSON.parse(storedWhispers));

        const storedMissions = await AsyncStorage.getItem(CROSS_BUBBLE_MISSIONS_KEY);
        if (storedMissions) setDailyMissions(JSON.parse(storedMissions));

        const storedPoints = await AsyncStorage.getItem(CROSS_BUBBLE_POINTS_KEY);
        if (storedPoints) setBubblePoints(parseInt(storedPoints, 10));

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

  // ปลดล็อคอวาตารใหม่จากร้านค้า
  const unlockAvatar = useCallback((avatarId, cost) => {
    if (bubblePoints < cost) return false;
    setBubblePoints((prev) => {
      const next = prev - cost;
      AsyncStorage.setItem(CROSS_BUBBLE_POINTS_KEY, String(next));
      return next;
    });
    setUnlockedAvatars((prev) => {
      if (prev.includes(avatarId)) return prev;
      const next = [...prev, avatarId];
      AsyncStorage.setItem(CROSS_BUBBLE_UNLOCKED_AVATARS_KEY, JSON.stringify(next));
      return next;
    });
    return true;
  }, [bubblePoints]);

  // สลับโหมด Cross-Bubble
  const toggleCrossBubbleMode = useCallback(async (active) => {
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
  }, []);

  // เปลี่ยนไอคอนมาสคอต
  const changeMascot = useCallback(async (icon) => {
    setUserAlias((prev) => {
      const next = { ...prev, icon };
      AsyncStorage.setItem(CROSS_BUBBLE_ALIAS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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

  // สลับเข้าสู่ห้องสังสรรค์ในโหมดทดสอบ (Dev / Demo Mode) หรือเมื่อถึง 19:00
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
  }, []);

  // ส่งข้อมูล Pre-input คำถามนำ
  const submitPreAnswers = useCallback((answers) => {
    setUserPreAnswers(answers);
    setLoungeStage("mission_brief");
  }, []);

  // เริ่มต้นการแชท (Stage 1 - แนะนำตัว 5 นาที)
  const startStage1 = useCallback(() => {
    setLoungeStage("stage1");
    setStageSecondsLeft(300); // 5 นาที
    setUserVotedSkip(false);
    setSkipVotesCount(0);

    // ข้อความต้อนรับระบบ
    const sysMsg = {
      id: "sys_start",
      isSystem: true,
      text: "ยินดีต้อนรับสู่ห้องสังสรรค์ประจำวัน (19:00) สเตจที่ 1: แนะนำตัวและพูดคุยสอบถามข้อมูลเพื่อนร่วมกลุ่ม 5 คน (มีเวลา 5 นาที หรือกดโหวตข้ามเมื่อพร้อม)",
      createdAt: "19:00",
    };
    setLoungeMessages([sysMsg]);

    // จำลองเพื่อนส่งข้อความแนะนำตัวตามจังหวะ
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

    // อัปเดตภารกิจรายวัน: เข้าร่วมห้องสังสรรค์
    updateMissionProgress("m_lounge", 1);
  }, [updateMissionProgress]);

  // เริ่มต้นสเตจที่ 2 (ถกหัวข้อ 10 นาที)
  const startStage2 = useCallback(() => {
    setLoungeStage("stage2");
    setStageSecondsLeft(600); // 10 นาที
    setUserVotedSkip(false);
    setSkipVotesCount(0);

    const sysMsg = {
      id: `sys_stage2_${Date.now()}`,
      isSystem: true,
      text: `สเตจที่ 2 เริ่มต้นขึ้นแล้ว: ถกหัวข้อประจำวัน "${todayTopic.title}" (มีเวลา 10 นาที สามารถกดโหวตข้ามเพื่อเริ่มตอบคำถามควิซได้ทุกเมื่อ)`,
      createdAt: "19:05",
    };
    setLoungeMessages((prev) => [...prev, sysMsg]);

    // จำลองเพื่อนร่วมถกหัวข้อตามบทบาทโรลเพลย์
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

  // ส่งข้อความแชทในห้องสังสรรค์
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

    // จำลองเพื่อนตอบโต้แบบสุ่มตามบทบาทโรลเพลย์
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

  // ตัวนับเวลาถอยหลังของสเตจ
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

  // โหวตข้ามสเตจ
  const voteSkipStage = useCallback(() => {
    if (userVotedSkip) return;
    setUserVotedSkip(true);
    setSkipVotesCount(1);

    // จำลองเพื่อนในกลุ่มช่วยกดโหวตข้ามให้ครบ 5 คน
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

  // ส่งคำตอบควิซและตรวจคะแนน
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

    // อัปเดตภารกิจรายวัน: ทายโรลเพลย์ถูก
    if (score >= 25) {
      updateMissionProgress("m_quiz_guess", 1);
    }
  }, [updateMissionProgress]);

  // โหวตปิดห้องหลังจบสเตจควิซ
  const voteCloseRoom = useCallback(() => {
    if (userVotedClose) return;
    setUserVotedClose(true);
    setCloseVotesCount(1);

    // เพื่อนทุกคนโหวตปิดห้องพร้อมกัน
    setTimeout(() => setCloseVotesCount(3), 600);
    setTimeout(() => {
      setCloseVotesCount(5);
      setLoungeStage("revealed");
    }, 1400);
  }, [userVotedClose]);

  // แมตช์เพื่อนเพื่อเปิดแชทในห้องมืด
  const matchWithMember = useCallback((memberId) => {
    if (matchedMemberIds.includes(memberId)) return;
    setMatchedMemberIds((prev) => [...prev, memberId]);

    const member = SIMULATED_CLASSMATES.find((m) => m.id === memberId);
    if (!member) return;

    // สร้างห้องมืด 1-on-1 พร้อมเปิดเผยตัวตนจริงทันที
    const newDarkRoom = {
      id: `dark_${member.id}_${Date.now()}`,
      partnerId: member.id,
      partnerAlias: member.alias,
      partnerIcon: member.icon,
      partnerRealName: member.realName,
      partnerRealAvatar: member.realAvatar,
      partnerRealFaculty: member.realFaculty,
      instagram: member.instagram,
      lineId: member.lineId,
      partnerBio: member.realBio,
      lastMessage: "แมตช์สำเร็จแล้ว เริ่มต้นพูดคุยและนัดเจอกันได้เลย!",
      lastMessageTime: "เมื่อสักครู่",
      messages: [
        {
          id: `msg_m_${Date.now()}`,
          senderId: member.id,
          text: `สวัสดี! ยินดีที่ได้แมตช์กันจากห้องสังสรรค์นะ เราชื่อ ${member.realName} อยู่ ${member.realFaculty} ยินดีที่ได้รู้จักตัวจริงนะ!`,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        },
      ],
    };

    setDarkRooms((prev) => {
      const exists = prev.some((r) => r.partnerId === member.id);
      if (exists) return prev;
      const next = [newDarkRoom, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_DARK_ROOMS_KEY, JSON.stringify(next));
      return next;
    });
  }, [matchedMemberIds]);

  // รีเซ็ตเซสชันห้องสังสรรค์เพื่อเริ่มใหม่
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
    // สลับหัวข้อประจำวันถัดไป
    setTodayTopicIndex((prev) => (prev + 1) % DAILY_TOPICS.length);
  }, []);

  // ====================================================
  // ห้องมืด (Dark Room Controls)
  // ====================================================

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

    // อัปเดตภารกิจรายวัน: แชทกับเพื่อนในห้องมืด
    updateMissionProgress("m_darkroom", 1);
  }, [updateMissionProgress]);

  // ====================================================
  // กระดานลับ (Secret Board Controls)
  // ====================================================

  // กดปุ่ม Bubble ป๊อปเพิ่มคะแนนถูกใจ
  const popNoteBubble = useCallback((noteId) => {
    setWhisperNotes((prev) => {
      const next = prev.map((n) => {
        if (n.id === noteId) {
          const newHasPopped = !n.hasPopped;
          return {
            ...n,
            hasPopped: newHasPopped,
            pops: newHasPopped ? n.pops + 1 : n.pops - 1,
          };
        }
        return n;
      });
      AsyncStorage.setItem(CROSS_BUBBLE_WHISPER_KEY, JSON.stringify(next));
      return next;
    });

    // อัปเดตภารกิจรายวัน: กด Bubble 2 ครั้ง
    updateMissionProgress("m_bubble_pop", 1);
  }, [updateMissionProgress]);

  // โพสต์โน้ตใหม่บนกระดานลับ (สวมบทบาทคณะ)
  const postSecretNote = useCallback((facultyRole, content) => {
    if (!content.trim()) return;
    const newNote = {
      id: `wh_${Date.now()}`,
      authorFaculty: facultyRole || "เด็กนิรนาม",
      authorIcon: userAlias?.icon || "finger-print-outline",
      content: content.trim(),
      createdAt: "เมื่อสักครู่",
      pops: 1,
      hasPopped: true,
      authorRealInfo: {
        name: profile?.name || user?.name || "คุณ",
        avatar: profile?.imageUri || null,
        faculty: profile?.faculty || facultyRole,
        instagram: "@my_instagram",
        lineId: "my_line_id",
        bio: profile?.bio || "ผู้ใช้งาน Mindclick",
      },
    };

    setWhisperNotes((prev) => {
      const next = [newNote, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_WHISPER_KEY, JSON.stringify(next));
      return next;
    });

    // อัปเดตภารกิจรายวัน: โพสต์โน้ตสวมบทบาท
    updateMissionProgress("m_post_note", 1);
  }, [profile?.bio, profile?.faculty, profile?.imageUri, profile?.name, updateMissionProgress, user?.name, userAlias?.icon]);

  // ส่ง Direct Message จากกระดานลับไปยังห้องมืด
  const sendDirectFromNote = useCallback((note, messageText) => {
    if (!messageText.trim()) return;
    const partnerInfo = note.authorRealInfo || {
      name: note.authorFaculty,
      avatar: null,
      faculty: note.authorFaculty,
      instagram: "@friend_note",
      lineId: "friend_note",
      bio: "เพื่อนจากกระดานลับ",
    };

    const newDarkRoom = {
      id: `dark_note_${note.id}_${Date.now()}`,
      partnerId: note.id,
      partnerAlias: note.authorFaculty,
      partnerIcon: note.authorIcon,
      partnerRealName: partnerInfo.name,
      partnerRealAvatar: partnerInfo.avatar,
      partnerRealFaculty: partnerInfo.faculty,
      instagram: partnerInfo.instagram,
      lineId: partnerInfo.lineId,
      partnerBio: partnerInfo.bio,
      lastMessage: messageText.trim(),
      lastMessageTime: "เมื่อสักครู่",
      messages: [
        {
          id: `msg_ref_${Date.now()}`,
          senderId: "system",
          text: `ตอบกลับโน้ตกระดานลับ: "${note.content}"`,
          createdAt: "เมื่อสักครู่",
          isSystem: true,
        },
        {
          id: `msg_dm_${Date.now()}`,
          senderId: "me",
          text: messageText.trim(),
          createdAt: "เมื่อสักครู่",
          isMe: true,
        },
      ],
    };

    setDarkRooms((prev) => {
      const next = [newDarkRoom, ...prev];
      AsyncStorage.setItem(CROSS_BUBBLE_DARK_ROOMS_KEY, JSON.stringify(next));
      return next;
    });

    updateMissionProgress("m_darkroom", 1);
  }, [updateMissionProgress]);

  return (
    <CrossBubbleContext.Provider
      value={{
        isCrossBubbleMode,
        toggleCrossBubbleMode,
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
        whisperNotes,
        popNoteBubble,
        postSecretNote,
        sendDirectFromNote,
        darkRooms,
        activeDarkRoomId,
        setActiveDarkRoomId,
        sendDarkRoomMessage,
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
