// Service จัดการคำถามประจำวัน Daily Campus Dilemma และคำนวณสถานะสตรีคไฟ (Streak Flame)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { campusDilemmas } from "../data/dilemmaQuestions";
import { getGeminiApiKey } from "./geminiService";

const AI_DILEMMA_STORAGE_PREFIX = "@mindclick_ai_dilemma_";

/**
 * คืนค่าสตริงวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * คำนวณความต่างของจำนวนวันระหว่างวันที่สองวัน (Date Diff in Days)
 */
export function getDaysDifference(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * ดึงคำถาม Daily Campus Dilemma สำหรับวันที่ระบุ
 * คัดเลือกแบบ Deterministic โดยใช้ผลรวมตัวเลขของวันที่ เพื่อให้ผู้ใช้ทุกคนได้คำถามเดียวกันในวันนั้น
 */
export function getDilemmaForDate(dateString = getTodayDateString()) {
  const parts = dateString.split("-").map((n) => parseInt(n, 10) || 0);
  const dayHash = parts[0] * 365 + parts[1] * 31 + parts[2];
  const index = Math.abs(dayHash) % campusDilemmas.length;
  return campusDilemmas[index];
}

/**
 * ตรวจสอบว่าคำถามที่เตรียมไว้ทั้งหมด (ทั้ง 5 ข้อใน campusDilemmas) ถูกตอบไปครบแล้วหรือไม่
 */
export function arePrePreparedDilemmasExhausted(historyAnswers = {}) {
  if (!historyAnswers || typeof historyAnswers !== "object") return false;
  const answeredQuestionIds = Object.values(historyAnswers)
    .map((item) => item?.questionId)
    .filter(Boolean);
  const unAnswered = campusDilemmas.filter(
    (d) => !answeredQuestionIds.includes(d.id)
  );
  return unAnswered.length === 0;
}

/**
 * ค้นหาคำถามที่เตรียมไว้ข้อถัดไปที่ผู้ใช้ยังไม่เคยตอบ
 */
export function getNextPrePreparedDilemma(historyAnswers = {}) {
  if (!historyAnswers || typeof historyAnswers !== "object") {
    return campusDilemmas[0] || null;
  }
  const answeredQuestionIds = Object.values(historyAnswers)
    .map((item) => item?.questionId)
    .filter(Boolean);
  const available = campusDilemmas.filter(
    (d) => !answeredQuestionIds.includes(d.id)
  );
  if (available.length > 0) {
    return available[0];
  }
  return null;
}

/**
 * คลังคำถามสำรองกรณีฉุกเฉิน (Procedural Fallback) เมื่อเชื่อมต่อ AI ไม่ได้
 */
function getAiDilemmaFallback(dateString) {
  const fallbackList = [
    {
      id: `dilemma_fallback_intern_${dateString}`,
      category: "academic",
      tag: "การฝึกงาน & อนาคต",
      title: "บริษัทในฝันชื่อดังแต่ไม่มีเบี้ยเลี้ยง vs บริษัททั่วไปที่ให้ค่าตอบแทนสูง",
      situation:
        "คุณผ่านการคัดเลือกฝึกงานจากบริษัทชั้นนำที่เป็นที่รู้จักในวงการแต่ไม่มีเบี้ยเลี้ยงและต้องออกค่าใช้จ่ายเองทั้งหมด ในขณะเดียวกันมีบริษัททั่วไปที่ให้เบี้ยเลี้ยงวันละ 600 บาท แต่อาจไม่ช่วยส่งเสริมเรซูเม่มากนัก...",
      choices: [
        {
          id: "c_fb1_a",
          text: "เลือกบริษัทชื่อดังเพื่อประสบการณ์และต่อยอดเรซูเม่ระยะยาว",
          icon: "trophy",
          statsPercent: 42,
          reflection: {
            trait: "ผู้มุ่งมั่นในเป้าหมายระยะยาว (Ambitious Visionary)",
            description:
              "คุณยอมทุ่มเทและเสียสละความสบายระยะสั้นเพื่ออนาคตที่ยิ่งใหญ่กว่า มีความทะเยอทะยานและชัดเจนในเส้นทางอาชีพ",
          },
        },
        {
          id: "c_fb1_b",
          text: "เลือกบริษัทที่ให้เบี้ยเลี้ยงเพื่อแบ่งเบาภาระทางการเงินและพึ่งพาตนเอง",
          icon: "wallet",
          statsPercent: 36,
          reflection: {
            trait: "คนรอบคอบและเห็นคุณค่าของความเป็นจริง (Pragmatic Realist)",
            description:
              "คุณให้ความสำคัญกับความเป็นจริงและการดูแลตัวเอง ไม่ปล่อยให้ความฝันลอยๆ มาสร้างภาระทางการเงินให้คนข้างหลัง",
          },
        },
        {
          id: "c_fb1_c",
          text: "พยายามเจรจาขอรับค่าตอบแทนบางส่วนกับบริษัทชื่อดังก่อนตัดสินใจ",
          icon: "scale",
          statsPercent: 22,
          reflection: {
            trait: "นักเจรจาต่อรองผู้มีความมั่นใจ (Assertive Negotiator)",
            description:
              "คุณไม่ยอมจำนนต่อทางเลือกสองทางที่จำกัด แต่กล้าหาญที่จะสื่อสารคุณค่าของตนเองเพื่อหาจุดกึ่งกลางที่ดีที่สุด",
          },
        },
      ],
      isAiGenerated: true,
    },
    {
      id: `dilemma_fallback_leader_${dateString}`,
      category: "social",
      tag: "กิจกรรม & ภาวะผู้นำ",
      title: "ได้รับเลือกเป็นประธานค่ายอาสา แต่อาจกระทบโปรเจกต์วิจัยจบ",
      situation:
        "รุ่นพี่และเพื่อนร่วมรุ่นต่างลงคะแนนเสนอชื่อให้คุณเป็นประธานค่ายอาสาพัฒนาชนบทประจำปีซึ่งเป็นงานเกียรติยศ แต่เทอมนี้คุณมีวิชาโปรเจกต์วิจัยจบที่มีน้ำหนักเกรดสูงมาก...",
      choices: [
        {
          id: "c_fb2_a",
          text: "ตอบรับตำแหน่งประธานค่าย และบริหารเวลาอย่างเข้มงวดเพื่อทำทั้งสองอย่าง",
          icon: "flame",
          statsPercent: 35,
          reflection: {
            trait: "ผู้ท้าทายขีดจำกัดตนเอง (Resilient High-Achiever)",
            description:
              "คุณเป็นคนมีความมุ่งมั่นสูง เชื่อมั่นในศักยภาพของตนเองและพร้อมเหนื่อยเป็นสองเท่าเพื่อสร้างประโยชน์ให้ผู้อื่น",
          },
        },
        {
          id: "c_fb2_b",
          text: "ปฏิเสธตำแหน่งและขอเป็นเพียงทีมงานฝ่าย เพื่อโฟกัสกับโปรเจกต์เรียนจบเป็นหลัก",
          icon: "book",
          statsPercent: 45,
          reflection: {
            trait: "ผู้มีสมาธิและจัดลำดับความสำคัญชัดเจน (Focused Prioritizer)",
            description:
              "คุณรู้ว่าสิ่งใดสำคัญที่สุดต่ออนาคตการศึกษา ไม่ไขว้เขวไปตามแรงกดดันทางสังคม เป็นคนตัดสินใจอย่างรอบคอบ",
          },
        },
        {
          id: "c_fb2_c",
          text: "เสนอแนวคิดประธานคู่ (Co-President) เพื่อกระจายความรับผิดชอบร่วมกับเพื่อน",
          icon: "people",
          statsPercent: 20,
          reflection: {
            trait: "นักทำงานเป็นทีมเชิงระบบ (Collaborative Strategist)",
            description:
              "คุณมองเห็นพลังของการทำงานร่วมกัน รู้วิธีแบ่งเบาภาระและสร้างระบบที่ยั่งยืนโดยไม่ต้องแบกรับปัญหาไว้คนเดียว",
          },
        },
      ],
      isAiGenerated: true,
    },
  ];

  const parts = dateString.split("-").map((n) => parseInt(n, 10) || 0);
  const hash = parts[0] * 31 + parts[1] * 12 + parts[2];
  return fallbackList[Math.abs(hash) % fallbackList.length];
}

/**
 * เจนคำถาม Daily Campus Dilemma ด้วย Google Gemini AI
 */
export async function generateDailyDilemmaWithAi({
  dateString = getTodayDateString(),
  historyAnswers = {},
}) {
  const apiKey = getGeminiApiKey();

  const answeredTitles = campusDilemmas
    .map((d) => `- ${d.title}`)
    .join("\n");

  const promptText = `คุณเป็นผู้เชี่ยวชาญด้านจิตวิทยาและการให้คำปรึกษาแก่นักศึกษามหาวิทยาลัย และเป็น Game Master ของแอปพลิเคชัน Mindclick
จงสร้างโจทย์ "คำถามประจำวันสะท้อนตัวตน" (Daily Campus Dilemma) สำหรับนักศึกษามหาวิทยาลัย ประจำวันที่ ${dateString}

โจทย์ต้องเป็นสถานการณ์จำลองในชีวิตนักศึกษาที่กลืนไม่เข้าคายไม่ออก (Dilemma) ซึ่งไม่มีคำตอบที่ถูกหรือผิดชัดเจน แต่สะท้อนมุมมอง ค่านิยม และบุคลิกภาพที่แตกต่างกันของผู้เลือก

ข้อจำกัดสำคัญ:
1. ห้ามซ้ำหรือมีเนื้อหาใกล้เคียงกับหัวข้อเดิมเหล่านี้:
${answeredTitles}
2. สร้าง 3 ทางเลือก (choices) ที่หลากหลายและสมเหตุสมผล:
   - ทางเลือก A, B, C ต้องสะท้อนตัวตนคนละมิติ
   - แต่ละทางเลือกต้องมี:
     - id: "c_ai_a", "c_ai_b", "c_ai_c"
     - text: ข้อความการตัดสินใจกระชับ ชัดเจน (ความยาว 1-2 บรรทัด)
     - icon: ชื่อไอคอน Ionicons ที่ถูกต้อง (เช่น "heart", "shield-checkmark", "flash", "bulb", "compass", "book", "time", "trophy", "star", "scale", "chatbubble-ellipses", "wallet")
     - statsPercent: ตัวเลขสถิติเพื่อนที่เลือก ร้อยละโดยรวมของทั้ง 3 ตัวเลือกต้องรวมกันได้ 100 พอดี (เช่น 45, 35, 20)
     - reflection:
       - trait: ชื่อจุดเด่นของบุคลิกภาพภาษาไทย พร้อมวงเล็บภาษาอังกฤษ เช่น "ผู้มุ่งมั่นในเป้าหมายระยะยาว (Ambitious Visionary)"
       - description: คำอธิบายสะท้อนตัวตนในเชิงบวก ให้กำลังใจ และเข้าใจมนุษย์ (ความยาว 2-3 บรรทัด)
3. กฎเหล็ก ZERO EMOJI POLICY: ห้ามมีอีโมจิหรือสัญลักษณ์หน้ายิ้มใดๆ ในข้อความโดยเด็ดขาด
4. ส่งผลลัพธ์เป็น JSON ตามโครงสร้างนี้เท่านั้น:
{
  "id": "dilemma_ai_${dateString}",
  "category": "lifestyle",
  "tag": "หมวดหมู่ภาษาไทยสั้นๆ",
  "title": "ชื่อหัวข้อคำถามสั้นๆ",
  "situation": "คำอธิบายสถานการณ์ 2-3 ประโยค...",
  "choices": [
    {
      "id": "c_ai_a",
      "text": "ข้อความทางเลือกที่ 1",
      "icon": "trophy",
      "statsPercent": 40,
      "reflection": {
        "trait": "ชื่อคุณลักษณะ (English Trait)",
        "description": "คำอธิบาย..."
      }
    },
    {
      "id": "c_ai_b",
      "text": "ข้อความทางเลือกที่ 2",
      "icon": "shield-checkmark",
      "statsPercent": 35,
      "reflection": {
        "trait": "ชื่อคุณลักษณะ (English Trait)",
        "description": "คำอธิบาย..."
      }
    },
    {
      "id": "c_ai_c",
      "text": "ข้อความทางเลือกที่ 3",
      "icon": "scale",
      "statsPercent": 25,
      "reflection": {
        "trait": "ชื่อคุณลักษณะ (English Trait)",
        "description": "คำอธิบาย..."
      }
    }
  ]
}`;

  if (apiKey && apiKey.length > 10) {
    const models = ["gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-3.6-flash"];

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9500);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (
              parsed?.title &&
              Array.isArray(parsed?.choices) &&
              parsed.choices.length === 3
            ) {
              const sum = parsed.choices.reduce(
                (acc, c) => acc + (parseInt(c.statsPercent, 10) || 0),
                0
              );
              if (sum !== 100) {
                parsed.choices[0].statsPercent = 40;
                parsed.choices[1].statsPercent = 35;
                parsed.choices[2].statsPercent = 25;
              }
              return {
                ...parsed,
                id: parsed.id || `dilemma_ai_${dateString}`,
                isAiGenerated: true,
                aiModel: model,
              };
            }
          }
        }
      } catch (err) {
        console.warn(`Gemini dilemma generation warning with model ${model}:`, err?.message || err);
      }
    }
  }

  return getAiDilemmaFallback(dateString);
}

/**
 * ดึงหรือสร้างคำถาม Daily Campus Dilemma สำหรับวันที่ระบุ
 * หากคำถามที่เตรียมไว้หมด จะเรียกใช้ Google Gemini AI เจนคำถามใหม่โดยอัตโนมัติ
 */
export async function getOrGenerateDilemmaForDate(
  dateString = getTodayDateString(),
  historyAnswers = {},
  userId = "guest"
) {
  try {
    const cacheKey = `${AI_DILEMMA_STORAGE_PREFIX}${userId}_${dateString}`;

    // 1. ตรวจสอบว่าเคยตอบคำถามของวันนี้ไปแล้วหรือไม่
    const todayAnswerEntry = historyAnswers[dateString];
    if (todayAnswerEntry?.questionId) {
      const prePrepared = campusDilemmas.find(
        (d) => d.id === todayAnswerEntry.questionId
      );
      if (prePrepared) return prePrepared;

      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // 2. ตรวจสอบว่ามีคำถาม AI ที่ถูกบันทึกไว้ในแคชของวันนี้แล้วหรือไม่
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 3. ตรวจสอบว่าคำถามที่เตรียมไว้ถูกตอบครบหมดแล้วหรือไม่
    const isExhausted = arePrePreparedDilemmasExhausted(historyAnswers);

    if (isExhausted) {
      // คำถามที่เตรียมไว้หมดแล้ว: ใช้ AI เจนคำถามใหม่
      const aiDilemma = await generateDailyDilemmaWithAi({
        dateString,
        historyAnswers,
      });

      await AsyncStorage.setItem(cacheKey, JSON.stringify(aiDilemma));
      return aiDilemma;
    }

    // 4. หากยังไม่หมด ให้ดึงคำถามที่เตรียมไว้ที่ยังไม่เคยตอบ
    const nextPre = getNextPrePreparedDilemma(historyAnswers);
    if (nextPre) {
      return nextPre;
    }

    return getDilemmaForDate(dateString);
  } catch (err) {
    console.error("Error in getOrGenerateDilemmaForDate:", err);
    return getDilemmaForDate(dateString);
  }
}

/**
 * คำนวณสถานะสตรีคไฟ (Streak Flame Evaluation)
 * @param {string|null} lastAnswerDate - วันที่ตอบครั้งล่าสุด (YYYY-MM-DD)
 * @param {number} currentStreak - จำนวนวันสตรีคปัจจุบัน
 * @returns { streak: number, status: 'active' | 'warning' | 'extinguished', hasAnsweredToday: boolean }
 */
export function evaluateStreak(lastAnswerDate, currentStreak = 0) {
  const today = getTodayDateString();

  // กรณีไม่เคยตอบมาก่อน
  if (!lastAnswerDate) {
    return {
      streak: 0,
      status: "extinguished",
      hasAnsweredToday: false,
    };
  }

  // กรณีตอบไปแล้วในวันนี้
  if (lastAnswerDate === today) {
    return {
      streak: Math.max(currentStreak, 1),
      status: "active",
      hasAnsweredToday: true,
    };
  }

  const daysPassed = getDaysDifference(lastAnswerDate, today);

  if (daysPassed === 1) {
    // ขาดไป 1 วัน: สตรีคยังคงอยู่ ไฟยังติดเพื่อรอตอบคำถามของวันนี้
    return {
      streak: currentStreak,
      status: "active",
      hasAnsweredToday: false,
    };
  } else if (daysPassed === 2) {
    // ขาดไป 2 วัน: ไฟเตือนกำลังจะดับ (Warning) รีบตอบก่อนไฟดับ
    return {
      streak: currentStreak,
      status: "warning",
      hasAnsweredToday: false,
    };
  } else {
    // ขาดเกิน 2 วัน: ไฟดับสนิท รีเซ็ตสตรีคเป็น 0
    return {
      streak: 0,
      status: "extinguished",
      hasAnsweredToday: false,
    };
  }
}
