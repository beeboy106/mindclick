// Mind-Insight & Campus Faculty Helpers for Mindclick
// วิเคราะห์จุดเชื่อมโยงทางความคิด และสร้างประโยคเปิดบทสนทนา (Icebreaker)

export const CAMPUS_FACULTIES = [
  "คณะวิศวกรรมศาสตร์",
  "คณะวิทยาศาสตร์",
  "คณะแพทยศาสตร์",
  "คณะพยาบาลศาสตร์",
  "คณะบริหารธุรกิจ / บัญชี",
  "คณะศิลปศาสตร์ / มนุษยศาสตร์",
  "คณะนิเทศศาสตร์",
  "คณะนิติศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์",
  "คณะศึกษาศาสตร์ / ครุศาสตร์",
  "คณะเภสัชศาสตร์",
  "คณะเศรษฐศาสตร์",
  "อื่นๆ",
];

// ฐานข้อมูลหัวข้อจุดร่วมสำหรับจับคู่ Mind-Insight
const INSIGHT_TOPICS = [
  {
    category: "lifestyle",
    qIds: [4, 5],
    icon: "headset-outline",
    color: "#67E8F9",
    tag: "🎶 รสนิยมดนตรี & คอนเสิร์ตตรงกัน",
    icebreakers: [
      "เห็นชอบฟังเพลงและไปคอนเสิร์ตเหมือนกันเลย ช่วงนี้มีศิลปินหรือเพลย์ลิสต์ไหนที่ฟังวนซ้ำๆ บ่อยสุดมั้ย?",
      "บังเอิญชอบแนวเพลงคล้ายกันเลย ปกติชอบไปดูคอนเสิร์ตวงไหนเป็นพิเศษหรือเปล่า?",
    ],
  },
  {
    category: "lifestyle",
    qIds: [7, 9],
    icon: "compass-outline",
    color: "#86EFAC",
    tag: "🌿 สายเที่ยวพักผ่อน & ตะลุยวันหยุด",
    icebreakers: [
      "เห็นชอบเที่ยวและทำกิจกรรมวันหยุดคล้ายกันเลย ถ้ามีเวลาว่าง 1 วันชอบไปนั่งชิลที่ไหนแถวมหาลัย?",
      "สายเที่ยวธรรมชาติเหมือนกันเลย วันหยุดยาวรอบนี้มีแพลนไปเที่ยวที่ไหนบ้างมั้ย?",
    ],
  },
  {
    category: "personality",
    qIds: [12, 13],
    icon: "sparkles-outline",
    color: "#FDE047",
    tag: "⚡ ชอบความท้าทาย & ประสบการณ์ใหม่",
    icebreakers: [
      "เห็นค่านิยมชอบลองอะไรใหม่ๆ ตรงกันเลย ช่วงนี้กำลังอินกับกิจกรรมหรือโปรเจกต์อะไรอยู่เหรอ?",
      "ชอบหาประสบการณ์ใหม่ๆ เหมือนกันเลย มีอะไรที่อยากลองทำก่อนเรียนจบมั้ย?",
    ],
  },
  {
    category: "interaction",
    qIds: [21, 22, 23],
    icon: "chatbubbles-outline",
    color: "#F472B6",
    tag: "💬 สไตล์การเปิดบทสนทนาที่เข้ากันได้",
    icebreakers: [
      "เห็นสไตล์การพูดคุยและสร้างเพื่อนใหม่คล้ายกันมาก เลยอยากแวะมาทักทาย ทำความรู้จักกันไว้!",
      "ทักทายครับ/ค่ะ เห็นมุมมองเรื่องเพื่อนตรงกัน ยินดีที่ได้รู้จักนะ!",
    ],
  },
  {
    category: "social",
    qIds: [31, 32, 33],
    icon: "planet-outline",
    color: "#C084FC",
    tag: "☕ ไลฟ์สไตล์การเข้าสังคมในโทนเดียวกัน",
    icebreakers: [
      "เห็นสไตล์การใช้ชีวิตในมหาลัยคล้ายกันมาก คณะที่เรียนช่วงนี้เรียนหนักหรือมีกิจกรรมอะไรบ้างมั้ย?",
      "เห็นเคมีความคิดเรื่องสังคมตรงกัน เลยอยากแวะมาทักทายเพื่อนต่างคณะ!",
    ],
  },
];

/**
 * คำนวณจุดเชื่อมโยง (Why They Clicked) จากคำตอบควิซของผู้ใช้สองคน
 */
export function getSharedInsights(userCategoryAnswers, visitorCategoryAnswers) {
  if (!userCategoryAnswers || !visitorCategoryAnswers) {
    // ถ้าไม่มีคำตอบ ให้สุ่มประเด็นเริ่มต้นที่น่าสนใจ
    return [INSIGHT_TOPICS[0], INSIGHT_TOPICS[1]];
  }

  const matched = [];

  for (const topic of INSIGHT_TOPICS) {
    const userCat = userCategoryAnswers.find((c) => c.categoryId === topic.category);
    const visCat = visitorCategoryAnswers.find((c) => c.categoryId === topic.category);

    if (userCat?.answers && visCat?.answers) {
      // ตรวจสอบว่าในหัวข้อนี้ มีข้อที่ตอบตรงกันหรือไม่
      const hasMatch = topic.qIds.some((qId) => {
        // หา index ของคำถาม
        const qIndex = qId % 10 === 0 ? 9 : (qId % 10) - 1;
        const ansA = userCat.answers[qIndex];
        const ansB = visCat.answers[qIndex];
        return ansA !== undefined && ansA === ansB;
      });

      if (hasMatch) {
        matched.push(topic);
      }
    }
  }

  // ถ้าเจอมากกว่า 2 หัวข้อ ให้หยิบ 2 ข้อแรก ถ้าไม่เจอให้ใช้ค่าเริ่มต้นที่เข้ากันได้
  if (matched.length > 0) {
    return matched.slice(0, 2);
  }

  return [INSIGHT_TOPICS[0]];
}

/**
 * สุ่มประโยคเปิดบทสนทนา (Icebreaker Starter)
 */
export function getRandomIcebreaker(topic, visitorName) {
  if (!topic || !topic.icebreakers || topic.icebreakers.length === 0) {
    return `สวัสดีครับ/ค่ะ ${visitorName || "เพื่อนใหม่"} เห็นเคมีเข้ากันได้ดีมาก ยินดีที่ได้รู้จักนะ!`;
  }
  const list = topic.icebreakers;
  const picked = list[Math.floor(Math.random() * list.length)];
  return picked;
}

/**
 * ดึงรายการประโยคเปิดบทสนทนาหลายๆ ตัวเลือกเพื่อแนะนำในห้องแชท (Icebreaker Prompts)
 */
export function getIcebreakerList(topics, name) {
  const result = [];
  const safeName = name ? `${name}` : "เพื่อนใหม่";
  if (Array.isArray(topics) && topics.length > 0) {
    topics.forEach((t) => {
      if (t.icebreakers && t.icebreakers.length > 0) {
        result.push(...t.icebreakers);
      }
    });
  }
  if (result.length < 3) {
    result.push(`สวัสดีครับ/ค่ะ ${safeName} เห็นผลแมตช์เราเคมีตรงกันหลายข้อมาก ยินดีที่ได้รู้จักนะ! ✨`);
    result.push(`ทักทายครับ/ค่ะ ${safeName} เห็นในควิซเราตอบตรงกันหลายด้านเลย แวะมาชวนคุยแลกเปลี่ยนกัน! 💬`);
    result.push(`สวัสดี ${safeName} วันนี้เป็นยังไงบ้าง สัปดาห์นี้เรียนหรือทำโปรเจกต์อะไรอยู่เหรอ? ☕`);
  }
  return result.slice(0, 4);
}
