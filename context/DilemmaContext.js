import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import {
  getTodayDateString,
  getDilemmaForDate,
  getOrGenerateDilemmaForDate,
  evaluateStreak,
} from "../lib/dilemmaService";

const DILEMMA_STORAGE_PREFIX = "@mindclick_dilemma_state_";

const DilemmaContext = createContext();

export function DilemmaProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const todayStr = getTodayDateString();
  const [todayQuestion, setTodayQuestion] = useState(() => getDilemmaForDate(todayStr));
  const [streakCount, setStreakCount] = useState(0);
  const [streakStatus, setStreakStatus] = useState("extinguished"); // 'active' | 'warning' | 'extinguished'
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [todayAnswer, setTodayAnswer] = useState(null); // choiceId
  const [historyAnswers, setHistoryAnswers] = useState({}); // { [dateStr]: { questionId, choiceId } }
  const [isLoading, setIsLoading] = useState(true);

  // โหลดข้อมูลสตรีคและคำตอบจาก AsyncStorage
  useEffect(() => {
    let isMounted = true;

    async function loadDilemmaState() {
      try {
        const key = `${DILEMMA_STORAGE_PREFIX}${userId}`;
        const stored = await AsyncStorage.getItem(key);

        let history = {};
        if (stored) {
          const parsed = JSON.parse(stored);
          history = parsed.historyAnswers || {};
          if (isMounted) {
            setHistoryAnswers(history);

            // ตรวจสอบคำตอบของวันนี้
            const todayEntry = history[todayStr];
            if (todayEntry) {
              setTodayAnswer(todayEntry.choiceId);
            } else {
              setTodayAnswer(null);
            }

            // ประเมินสถานะสตรีคไฟตามเวลาจริง
            const streakEvaluation = evaluateStreak(parsed.lastAnswerDate, parsed.streakCount || 0);
            setStreakCount(streakEvaluation.streak);
            setStreakStatus(streakEvaluation.status);
            setHasAnsweredToday(streakEvaluation.hasAnsweredToday);
          }
        } else {
          // ผู้ใช้ใหม่ เริ่มต้นที่สตรีค 0 ไฟดับ
          if (isMounted) {
            setStreakCount(0);
            setStreakStatus("extinguished");
            setHasAnsweredToday(false);
            setTodayAnswer(null);
            setHistoryAnswers({});
          }
        }

        // ดึงคำถามประจำวัน หรือสร้างคำถาม AI อัตโนมัติเมื่อคำถามที่เตรียมไว้หมด
        const currentQuestion = await getOrGenerateDilemmaForDate(
          todayStr,
          history,
          userId
        );
        if (isMounted && currentQuestion) {
          setTodayQuestion(currentQuestion);
        }
      } catch (err) {
        console.error("Error loading dilemma state:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDilemmaState();

    return () => {
      isMounted = false;
    };
  }, [userId, todayStr]);

  // ฟังก์ชันบันทึกคำตอบสำหรับคำถามวันนี้
  const answerDilemma = useCallback(
    async (choiceId) => {
      if (!choiceId || !todayQuestion) return;

      const newHistory = {
        ...historyAnswers,
        [todayStr]: {
          questionId: todayQuestion.id,
          choiceId: choiceId,
          answeredAt: new Date().toISOString(),
          isAiGenerated: !!todayQuestion.isAiGenerated,
        },
      };

      // คำนวณสตรีคใหม่
      let newStreak = streakCount;
      if (!hasAnsweredToday) {
        if (streakStatus === "active" || streakStatus === "warning") {
          newStreak = streakCount + 1;
        } else {
          // หากไฟดับอยู่ เริ่มต้นสะสมวันแรก
          newStreak = 1;
        }
      }

      const newStatus = "active";
      const newHasAnswered = true;

      setTodayAnswer(choiceId);
      setStreakCount(newStreak);
      setStreakStatus(newStatus);
      setHasAnsweredToday(newHasAnswered);
      setHistoryAnswers(newHistory);

      try {
        const stateToSave = {
          streakCount: newStreak,
          lastAnswerDate: todayStr,
          historyAnswers: newHistory,
        };
        await AsyncStorage.setItem(
          `${DILEMMA_STORAGE_PREFIX}${userId}`,
          JSON.stringify(stateToSave)
        );

        if (todayQuestion.isAiGenerated) {
          const aiCacheKey = `@mindclick_ai_dilemma_${userId}_${todayStr}`;
          await AsyncStorage.setItem(aiCacheKey, JSON.stringify(todayQuestion));
        }
      } catch (err) {
        console.error("Error saving dilemma answer:", err);
      }

      return {
        streak: newStreak,
        choiceId,
      };
    },
    [historyAnswers, todayStr, todayQuestion, hasAnsweredToday, streakCount, streakStatus, userId]
  );

  return (
    <DilemmaContext.Provider
      value={{
        todayQuestion,
        streakCount,
        streakStatus,
        hasAnsweredToday,
        todayAnswer,
        historyAnswers,
        isLoading,
        answerDilemma,
      }}
    >
      {children}
    </DilemmaContext.Provider>
  );
}

export function useDilemma() {
  const context = useContext(DilemmaContext);
  if (!context) {
    throw new Error("useDilemma must be used within a DilemmaProvider");
  }
  return context;
}
