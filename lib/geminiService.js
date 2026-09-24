// lib/geminiService.js
// ระบบบริการปัญญาประดิษฐ์ Google Gemini และเครื่องมือประเมินผลเชิงความหมาย (Semantic Evaluator)
// สำหรับฟีเจอร์ห้องสังสรรค์ข้ามฟองสบู่ (Cross-Bubble Mystery Lounge)
// หมายเหตุ: ปฏิบัติตามกฎ ZERO EMOJI POLICY อย่างเคร่งครัด ไม่มีอีโมจิในโค้ดหรือข้อความ

let customApiKey = null;

/**
 * กำหนดค่า API Key ด้วยตนเอง (สำหรับการตั้งค่าเพิ่มเติมผ่าน UI หรือโหมดนักพัฒนา)
 */
export function setCustomGeminiApiKey(key) {
  customApiKey = key ? key.trim() : null;
}

/**
 * ดึงค่า API Key ที่ใช้งานอยู่
 */
export function getGeminiApiKey() {
  if (customApiKey && customApiKey.length > 0) {
    return customApiKey;
  }
  // ดึงจาก Expo Environment Variable
  if (typeof process !== "undefined" && process.env && process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim();
  }
  return "";
}

/**
 * ตรวจสอบว่าระบบมี Gemini API Key ที่พร้อมใช้งานหรือไม่
 */
export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10 && !key.includes("your_"));
}

/**
 * คลังคำสำคัญและหมวดหมู่สำหรับระบบตรวจคำตอบอัจฉริยะแบบ Fallback (Thai Semantic Fallback Engine)
 */
const CLASSMATE_SEMANTIC_KNOWLEDGE = {
  member_med: {
    targetItem: "ชุดปฐมพยาบาลเบื้องต้นและยารักษาโรค",
    coreKeywords: [
      "ปฐมพยาบาล",
      "ยา",
      "ทำแผล",
      "พลาสเตอร์",
      "ผ้าพันแผล",
      "อุปกรณ์แพทย์",
      "กล่องยา",
      "เบต้าดีน",
      "แอลกอฮอล์",
      "พารา",
      "ชุดทำแผล",
      "เวชภัณฑ์",
      "ยารักษาโรค",
    ],
    roleKeywords: ["นักสืบโคนัน", "นักสืบ", "โคนัน"],
    goodFeedbacks: [
      "ยอดเยี่ยมมาก คุณจับสังเกตได้ว่าเพื่อนมีความรู้ด้านการแพทย์และเตรียมยาพร้อมช่วยเหลือเสมอ",
      "สังเกตได้แม่นยำ เพื่อนพูดถึงการทำแผลและความปลอดภัยในสถานการณ์ฉุกเฉินอย่างชัดเจน",
    ],
    partialFeedbacks: [
      "คุณจับประเด็นการดูแลสุขภาพได้ดี แม้ชื่อสิ่งของจะไม่ตรงทั้งหมดแต่เข้าใจทิศทางของเพื่อน",
      "ถือว่าสังเกตได้ใกล้เคียง เพื่อนมีความเป็นห่วงเรื่องการบาดเจ็บและพกอุปกรณ์ดูแลเพื่อนๆ",
    ],
  },
  member_eng: {
    targetItem: "ไขควงมัลติทูลและพาวเวอร์แบงก์ 30000mAh",
    coreKeywords: [
      "ไขควง",
      "มัลติทูล",
      "พาวเวอร์แบงก์",
      "แบตสำรอง",
      "เครื่องมือ",
      "คีม",
      "สายไฟ",
      "อุปกรณ์ช่าง",
      "แบตเตอรี่",
      "เครื่องมือช่าง",
      "multitool",
      "powerbank",
      "สายชาร์จ",
    ],
    roleKeywords: ["วิศวกรซ่อมทุกอย่าง", "วิศวกร", "ซ่อม"],
    goodFeedbacks: [
      "เฉียบคมมาก คุณสังเกตเห็นทักษะการดัดแปลงอุปกรณ์และเครื่องมือช่างที่เพื่อนเตรียมมาได้อย่างถูกต้อง",
      "วิเคราะห์ได้ตรงเป้า เพื่อนแสดงออกชัดเจนว่าจะใช้อุปกรณ์อิเล็กทรอนิกส์และเครื่องมือเพื่อแก้ปัญหา",
    ],
    partialFeedbacks: [
      "ถือว่าจับทางได้ดี คุณมองเห็นว่าเพื่อนเน้นเรื่องเทคโนโลยีและการแก้ไขระบบทางกายภาพ",
      "คำตอบมีความใกล้เคียง เพื่อนพูดถึงเรื่องพลังงานและเครื่องมือดัดแปลงของรอบตัว",
    ],
  },
  member_arts: {
    targetItem: "สมุดบันทึกและปากกาหมึกซึมคู่ใจ",
    coreKeywords: [
      "สมุด",
      "บันทึก",
      "ปากกา",
      "หมึกซึม",
      "สมุดบันทึก",
      "ไดอารี่",
      "กระดาษ",
      "จด",
      "กลอน",
      "หนังสือ",
      "เครื่องเขียน",
    ],
    roleKeywords: ["กวีพเนจรผู้อารมณ์ดี", "กวี", "กวีพเนจร"],
    goodFeedbacks: [
      "ยอดเยี่ยมมาก คุณรับรู้ถึงจิตวิญญาณแห่งการบันทึกและความสุนทรีย์ของเพื่อนได้อย่างลึกซึ้ง",
      "จับสังเกตได้แม่นยำ เพื่อนพูดจาด้วยสำนวนสละสลวยและตั้งใจจดบันทึกเรื่องราวของกลุ่ม",
    ],
    partialFeedbacks: [
      "มองเห็นภาพรวมได้ดี คุณสัมผัสได้ถึงความเป็นสายศิลป์และการสื่อสารของเพื่อน",
      "คำตอบมีความสอดคล้องกับบุคลิกที่ชอบจดจำเรื่องราวรอบตัวของเพื่อนคนนี้",
    ],
  },
  member_arch: {
    targetItem: "มีดพับอเนกประสงค์และไฟแช็ก",
    coreKeywords: [
      "มีด",
      "มีดพับ",
      "ไฟแช็ก",
      "คัตเตอร์",
      "ของมีคม",
      "ไฟ",
      "จุดไฟ",
      "อุปกรณ์ตัด",
      "เสบียง",
      "ของกิน",
      "อาหาร",
      "เตาแก๊ส",
    ],
    roleKeywords: ["เชฟกระทะเหล็ก", "เชฟ", "ทำอาหาร"],
    goodFeedbacks: [
      "เก่งมาก คุณสังเกตเห็นทั้งอุปกรณ์ตัดและไฟแช็กที่เพื่อนเตรียมไว้สำหรับเอาชีวิตรอดและทำอาหาร",
      "ตรงเป้าหมาย เพื่อนเน้นย้ำเรื่องเสบียงและวิธีจุดไฟทำอาหารในโรงอาหารอย่างชัดเจน",
    ],
    partialFeedbacks: [
      "จับจุดเรื่องเสบียงและการอยู่รอดได้ดี สอดคล้องกับแนวคิดของเพื่อนร่วมกลุ่ม",
      "ถือว่าใกล้เคียง เพื่อนเน้นความพร้อมในการสร้างสรรค์และเตรียมอาหารให้ทุกคน",
    ],
  },
};

/**
 * ประเมินคำตอบด้วยระบบจำลองแบบอัจฉริยะ (Local Semantic Evaluator Fallback)
 * ใช้งานเมื่อไม่มีการเชื่อมต่ออินเทอร์เน็ต ไม่มี API Key หรือเซิร์ฟเวอร์ภายนอกขัดข้อง
 */
export function evaluateSemanticFallback({
  memberId,
  memberAlias,
  actualRole,
  actualItem,
  chatClues = [],
  userItemAnswer = "",
  userRoleGuess = "",
}) {
  const knowledge = CLASSMATE_SEMANTIC_KNOWLEDGE[memberId] || {
    targetItem: actualItem,
    coreKeywords: [actualItem],
    roleKeywords: [actualRole],
    goodFeedbacks: ["คุณสามารถจับสังเกตเบาะแสของเพื่อนได้ดี"],
    partialFeedbacks: ["คำตอบของคุณมีส่วนที่สอดคล้องกับข้อมูลของเพื่อน"],
  };

  const cleanItemAnswer = (userItemAnswer || "").trim().toLowerCase();
  const cleanRoleGuess = (userRoleGuess || "").trim();

  // 1. ตรวจสอบการทายบทบาทโรลเพลย์ (25 คะแนน)
  let roleScore = 0;
  let isRoleCorrect = false;

  const matchedRoleKeyword = knowledge.roleKeywords.some((kw) =>
    cleanRoleGuess.toLowerCase().includes(kw.toLowerCase()) || actualRole.toLowerCase().includes(cleanRoleGuess.toLowerCase())
  );

  if (cleanRoleGuess.length > 0 && (cleanRoleGuess === actualRole || matchedRoleKeyword)) {
    roleScore = 25;
    isRoleCorrect = true;
  }

  // 2. ตรวจสอบสิ่งที่พกมา/คำตอบทางตรรกะ (25 คะแนน)
  let itemScore = 0;
  let isItemCorrect = false;

  if (cleanItemAnswer.length > 0) {
    // นับจำนวนคำสำคัญที่พบ
    const matchedCount = knowledge.coreKeywords.filter((kw) =>
      cleanItemAnswer.includes(kw.toLowerCase())
    ).length;

    const hasElaborateReasoning = cleanItemAnswer.length >= 15;

    if (matchedCount >= 2) {
      itemScore = 25;
      isItemCorrect = true;
    } else if (matchedCount === 1) {
      itemScore = hasElaborateReasoning ? 25 : 20;
      isItemCorrect = true;
    } else if (hasElaborateReasoning) {
      // ตรวจสอบความสอดคล้องกับบทพูดในแชท (Chat Clues)
      const matchesClue = (chatClues || []).some((clue) => {
        const words = clue.split(/\s+/);
        return words.some((w) => w.length >= 3 && cleanItemAnswer.includes(w.toLowerCase()));
      });

      if (matchesClue) {
        itemScore = 18;
        isItemCorrect = true;
      } else {
        itemScore = 10;
        isItemCorrect = false;
      }
    } else {
      itemScore = 5;
      isItemCorrect = false;
    }
  }

  const totalPoints = roleScore + itemScore;

  let accuracyLevel = "MISSED";
  if (totalPoints >= 45) {
    accuracyLevel = "EXCELLENT";
  } else if (totalPoints >= 30) {
    accuracyLevel = "GOOD";
  } else if (totalPoints >= 15) {
    accuracyLevel = "PARTIAL";
  }

  const feedbackList = isItemCorrect ? knowledge.goodFeedbacks : knowledge.partialFeedbacks;
  const feedback = feedbackList[Math.floor(Math.random() * feedbackList.length)];

  let reasoning = "";
  if (isRoleCorrect && isItemCorrect) {
    reasoning = `คุณสามารถระบุบทบาท ${actualRole} ได้ถูกต้องแม่นยำ และจับสังเกตสิ่งที่เพื่อนพกมา (${knowledge.targetItem}) ได้อย่างครบถ้วนตามเบาะแสในแชท`;
  } else if (isItemCorrect) {
    reasoning = `คุณจับจุดสิ่งที่เพื่อนพกมา (${knowledge.targetItem}) ได้อย่างถูกต้อง แต่ทายบทบาทสับสนไปเล็กน้อย`;
  } else if (isRoleCorrect) {
    reasoning = `คุณทายบทบาท ${actualRole} ได้ถูกต้อง แต่สิ่งที่เพื่อนพกมาจริงคือ ${knowledge.targetItem}`;
  } else {
    reasoning = `ยังไม่ตรงกับข้อมูลจริง เพื่อนสวมบทบาท ${actualRole} และพก ${knowledge.targetItem}`;
  }

  return {
    itemScore,
    isItemCorrect,
    roleScore,
    isRoleCorrect,
    totalPoints,
    accuracyLevel,
    reasoning,
    feedback,
    isAiEvaluated: false,
    evaluatorEngine: "Rule-Based Semantic Heuristics (Local Fallback)",
  };
}

/**
 * ประเมินคำตอบเดี่ยวโดยส่งไปยัง Google Gemini API (หรือตัดเข้า Fallback ทันทีเมื่อเกิดข้อผิดพลาด)
 */
export async function evaluateAnswerWithGemini({
  memberId,
  memberAlias,
  actualRole,
  actualItem,
  chatClues = [],
  userItemAnswer = "",
  userRoleGuess = "",
}) {
  const apiKey = getGeminiApiKey();

  // หากไม่มี API Key ให้ใช้ระบบ Fallback ทันที
  if (!apiKey || apiKey.length < 10) {
    return evaluateSemanticFallback({
      memberId,
      memberAlias,
      actualRole,
      actualItem,
      chatClues,
      userItemAnswer,
      userRoleGuess,
    });
  }

  const promptText = `
คุณเป็น AI Game Master ตรวจข้อสอบภารกิจสืบสวนในเกม Mindclick ห้องสังสรรค์นิรนาม
จงประเมินคำตอบของผู้เล่นที่ตอบเกี่ยวกับเพื่อนร่วมกลุ่มชื่อ "${memberAlias}"

ข้อมูลความจริง (Ground Truth):
- บทบาทโรลเพลย์จริง: ${actualRole}
- สิ่งที่พกมาหรือคำตอบจริง: ${actualItem}
- เบาะแสที่เพื่อนเคยพูดในแชท: ${chatClues.join(" | ")}

คำตอบที่ผู้เล่นพิมพ์ส่งมา:
- สิ่งที่คิดว่าเพื่อนพกมา/ตอบ และเหตุผล: "${userItemAnswer || "ไม่ได้ระบุ"}"
- บทบาทโรลเพลย์ที่ผู้เล่นทาย: "${userRoleGuess || "ไม่ได้ระบุ"}"

เกณฑ์การประเมิน:
1. ห้ามหักคะแนนจากการสะกดคำผิด คำตกหล่น หรือการใช้ภาษาพูด ภาษาแสลง ตราบใดที่สาระสำคัญสื่อถึงสิ่งเดียวกัน
2. ส่วนที่ 1 สิ่งที่พกมา (itemScore 0 - 25 คะแนน):
   - หากตรงเป๊ะหรือความหมายตรงกัน ให้ 25 คะแนน (isItemCorrect = true)
   - หากใกล้เคียงหรืออ้างอิงเบาะแสในแชทได้อย่างสมเหตุสมผล ให้ 15 - 24 คะแนน (isItemCorrect = true)
   - หากไม่ตรงเลยแต่อธิบายมีเหตุผล ให้ 5 - 14 คะแนน (isItemCorrect = false)
   - หากว่างหรือไม่เกี่ยวข้อง ให้ 0 คะแนน (isItemCorrect = false)
3. ส่วนที่ 2 บทบาทโรลเพลย์ (roleScore 0 - 25 คะแนน):
   - หากตรงกับบทบาทจริง (${actualRole}) ให้ 25 คะแนน (isRoleCorrect = true)
   - หากไม่ถูก ให้ 0 คะแนน (isRoleCorrect = false)
4. กำหนด accuracyLevel: "EXCELLENT" (40-50 คะแนน), "GOOD" (25-39 คะแนน), "PARTIAL" (15-24 คะแนน), "MISSED" (0-14 คะแนน)
5. เขียน reasoning (อธิบายว่าทำไมถึงให้คะแนนนี้) และ feedback (คำแนะนำการสังเกตเชิงบวก) เป็นภาษาไทยกระชับ สุภาพ
6. กฎสำคัญ: ห้ามใส่อีโมจิใดๆ ในข้อความโดยเด็ดขาด

ส่งคำตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "itemScore": 25,
  "isItemCorrect": true,
  "roleScore": 25,
  "isRoleCorrect": true,
  "totalPoints": 50,
  "accuracyLevel": "EXCELLENT",
  "reasoning": "คำอธิบายเหตุผล",
  "feedback": "คำแนะนำเชิงบวก"
}
`;

  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawJsonText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(rawJsonText);

        const itemScore = Math.min(25, Math.max(0, parseInt(parsed.itemScore, 10) || 0));
        const roleScore = Math.min(25, Math.max(0, parseInt(parsed.roleScore, 10) || 0));
        const totalPoints = itemScore + roleScore;

        return {
          itemScore,
          isItemCorrect: Boolean(parsed.isItemCorrect ?? itemScore >= 15),
          roleScore,
          isRoleCorrect: Boolean(parsed.isRoleCorrect ?? roleScore >= 20),
          totalPoints,
          accuracyLevel: parsed.accuracyLevel || (totalPoints >= 40 ? "EXCELLENT" : "GOOD"),
          reasoning: parsed.reasoning || "ประเมินผลสำเร็จจากข้อมูลการสนทนา",
          feedback: parsed.feedback || "ยอดเยี่ยมมาก คุณเป็นผู้ฟังและนักสืบที่ดี",
          isAiEvaluated: true,
          evaluatorEngine: `Google Gemini AI (${model})`,
        };
      }
    } catch (err) {
      // หากเกิดปัญหาการเชื่อมต่อหรือ Timeout ให้วนทดสอบโมเดลถัดไปหรือตัดเข้า Fallback
      console.warn(`Gemini evaluation error with model ${model}:`, err?.message || err);
    }
  }

  // หากลองทุกโมเดลแล้วไม่สำเร็จ ให้ตัดเข้า Fallback โดยอัตโนมัติ
  return evaluateSemanticFallback({
    memberId,
    memberAlias,
    actualRole,
    actualItem,
    chatClues,
    userItemAnswer,
    userRoleGuess,
  });
}

/**
 * ประเมินคำตอบควิซของสมาชิกทุกคนพร้อมกัน
 */
export async function evaluateAllQuizAnswers(quizForm, loungeMembers) {
  const memberEvaluations = await Promise.all(
    loungeMembers.map(async (member) => {
      const userAns = quizForm[member.id] || {};
      const chatClues = [
        ...(member.chatLinesStage1 || []),
        ...(member.chatLinesStage2 || []),
      ];

      const result = await evaluateAnswerWithGemini({
        memberId: member.id,
        memberAlias: member.alias,
        actualRole: member.roleplay,
        actualItem: member.preAnswers?.q1 || "",
        chatClues,
        userItemAnswer: userAns.itemAnswer || "",
        userRoleGuess: userAns.roleplayGuess || "",
      });

      return {
        memberId: member.id,
        memberAlias: member.alias,
        actualRole: member.roleplay,
        actualItem: member.preAnswers?.q1 || "ไม่ได้ระบุ",
        userRoleGuess: userAns.roleplayGuess || "ไม่ได้ระบุ",
        userItemAnswer: userAns.itemAnswer || "ไม่ได้ระบุ",
        isRoleCorrect: result.isRoleCorrect,
        isItemCorrect: result.isItemCorrect,
        points: result.totalPoints,
        itemScore: result.itemScore,
        roleScore: result.roleScore,
        accuracyLevel: result.accuracyLevel,
        reasoning: result.reasoning,
        feedback: result.feedback,
        isAiEvaluated: result.isAiEvaluated,
        evaluatorEngine: result.evaluatorEngine,
      };
    })
  );

  const totalScore = memberEvaluations.reduce((sum, item) => sum + item.points, 0);

  return {
    totalScore,
    details: memberEvaluations,
    evaluatedWithAi: memberEvaluations.some((m) => m.isAiEvaluated),
  };
}

/**
 * ข้อความกระตุ้นบทสนทนาจาก AI Game Master ประจำรอบ
 */
export const AI_GAME_MASTER_EVENTS = {
  stage1: [
    {
      id: "ai_event_s1_1",
      speaker: "AI Game Master",
      title: "ประกาศภารกิจพิเศษสเตจแนะนำตัว",
      text: "ระบบตรวจพบว่าสมาชิกแต่ละคนมีความลับและอุปกรณ์สำคัญติดตัว ลองชวนเพื่อนคุยและตั้งคำถามเพื่อสืบหาเบาะแสก่อนเวลาหมด",
    },
  ],
  stage2: [
    {
      id: "ai_event_s2_1",
      speaker: "AI Game Master",
      title: "เหตุการณ์จำลองฉุกเฉิน",
      text: "สถานการณ์จำลองเริ่มเข้มข้นขึ้น ทางออกหลักถูกจำกัดเวลา ทุกคนลองหารือกันว่าใครมีอุปกรณ์หรือความรู้ที่สามารถนำมาผสมผสานเพื่อเอาตัวรอดได้",
    },
  ],
};
