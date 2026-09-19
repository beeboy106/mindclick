// Service จัดการคำถามประจำวัน Daily Campus Dilemma และคำนวณสถานะสตรีคไฟ (Streak Flame)
import { campusDilemmas } from "../data/dilemmaQuestions";

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
