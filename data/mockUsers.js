// Mock Users Data for FriendQ Matching Simulation

export const mockUsers = [
  {
    id: "user_mock_1",
    name: "ฟ้าใส ธนภัทร",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    gender: "female",
    bio: "ชอบฟังเพลงยุค 90s ดื่มกาแฟดริป และเที่ยวธรรมชาติวันหยุด วันว่างๆ ชอบอ่านหนังสือพัฒนาตัวเอง ☕🌿",
    socialLinks: {
      instagram: "fahsay.vibes",
      line: "fahsay_99",
      tiktok: "fahsay_daily",
    },
    galleryImages: [
      { id: "g1_1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80", order: 0 },
      { id: "g1_2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", order: 1 },
      { id: "g1_3", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80", order: 2 },
    ],
    completedCategories: ["lifestyle", "personality", "interaction", "social"],
    categoryAnswers: [
      {
        categoryId: "lifestyle",
        questionOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        answers: [2, 2, 2, 2, 1, 2, 2, 1, 2, 2],
      },
      {
        categoryId: "personality",
        questionOrder: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        answers: [1, 2, 2, 1, 2, 2, 2, 2, 2, 1],
      },
      {
        categoryId: "interaction",
        questionOrder: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        answers: [0, 0, 0, 1, 0, 0, 0, 0, 2, 2],
      },
      {
        categoryId: "social",
        questionOrder: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        answers: [2, 0, 2, 2, 2, 2, 1, 1, 0, 2],
      },
    ],
  },
  {
    id: "user_mock_2",
    name: "นนท์ วรเมธ",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    gender: "male",
    bio: "Software Engineer สายกิจกรรม ชอบวิ่งมาราธอน แคมป์ปิ้ง และเล่นบอร์ดเกม สนใจเรื่อง Tech & Startup",
    socialLinks: {
      instagram: "nont.dev",
      facebook: "Nont Worameth",
      line: "nont_tech",
    },
    galleryImages: [
      { id: "g2_1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80", order: 0 },
      { id: "g2_2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80", order: 1 },
    ],
    completedCategories: ["lifestyle", "personality", "interaction", "social"],
    categoryAnswers: [
      {
        categoryId: "lifestyle",
        questionOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        answers: [2, 2, 2, 1, 1, 2, 2, 0, 2, 2],
      },
      {
        categoryId: "personality",
        questionOrder: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        answers: [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
      },
      {
        categoryId: "interaction",
        questionOrder: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        answers: [1, 0, 0, 0, 0, 0, 1, 1, 2, 2],
      },
      {
        categoryId: "social",
        questionOrder: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        answers: [2, 0, 1, 2, 2, 2, 0, 1, 0, 2],
      },
    ],
  },
  {
    id: "user_mock_3",
    name: "แพรว ชนิตา",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    gender: "female",
    bio: "Graphic Designer & Cat lover 🐱 ชื่นชอบศิลปะ งานคราฟต์ และนิทรรศการ เข้ากับคนง่ายแต่มีมุม Introvert",
    socialLinks: {
      instagram: "praew.craft",
      line: "praewcat",
    },
    galleryImages: [
      { id: "g3_1", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80", order: 0 },
      { id: "g3_2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", order: 1 },
      { id: "g3_3", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80", order: 2 },
    ],
    completedCategories: ["lifestyle", "personality", "interaction", "social"],
    categoryAnswers: [
      {
        categoryId: "lifestyle",
        questionOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        answers: [0, 1, 1, 2, 2, 1, 2, 2, 1, 2],
      },
      {
        categoryId: "personality",
        questionOrder: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        answers: [2, 1, 1, 1, 2, 2, 2, 2, 2, 1],
      },
      {
        categoryId: "interaction",
        questionOrder: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        answers: [1, 1, 1, 1, 1, 1, 1, 0, 2, 2],
      },
      {
        categoryId: "social",
        questionOrder: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        answers: [2, 1, 2, 1, 2, 1, 2, 2, 1, 1],
      },
    ],
  },
  {
    id: "user_mock_4",
    name: "มิกซ์ กานต์",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    gender: "male",
    bio: "นักดนตรีอิสระ ชอบเล่นกีตาร์ ท่องเที่ยวแบ็คแพ็ค และค้นพบเพลงใหม่ๆ ใช้ชีวิตเรียบง่าย มองโลกในแง่ดี 🎸",
    socialLinks: {
      instagram: "mix.guitar",
      tiktok: "mixmusic_th",
    },
    galleryImages: [
      { id: "g4_1", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80", order: 0 },
    ],
    completedCategories: ["lifestyle", "personality", "interaction", "social"],
    categoryAnswers: [
      {
        categoryId: "lifestyle",
        questionOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        answers: [0, 1, 1, 2, 2, 1, 2, 1, 2, 1],
      },
      {
        categoryId: "personality",
        questionOrder: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        answers: [1, 2, 1, 1, 2, 2, 1, 2, 1, 0],
      },
      {
        categoryId: "interaction",
        questionOrder: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        answers: [0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
      },
      {
        categoryId: "social",
        questionOrder: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        answers: [2, 0, 1, 2, 2, 2, 0, 0, 0, 2],
      },
    ],
  },
  {
    id: "user_mock_5",
    name: "รินลดา วงศ์สุวรรณ",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    gender: "female",
    bio: "นักการตลาดดิจิทัล ชอบกินของอร่อย ทำขนมเบเกอรี่ และดูซีรีส์เกาหลี คุยสนุก เป็นมิตรกับทุกคน 🧁🍰",
    socialLinks: {
      instagram: "rinlada.bakes",
      facebook: "Rinlada Wongsuwan",
      line: "rinlada_w",
    },
    galleryImages: [
      { id: "g5_1", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", order: 0 },
      { id: "g5_2", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80", order: 1 },
    ],
    completedCategories: ["lifestyle", "personality", "interaction", "social"],
    categoryAnswers: [
      {
        categoryId: "lifestyle",
        questionOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        answers: [1, 2, 2, 2, 2, 2, 2, 0, 2, 2],
      },
      {
        categoryId: "personality",
        questionOrder: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        answers: [1, 2, 2, 2, 1, 1, 2, 2, 2, 2],
      },
      {
        categoryId: "interaction",
        questionOrder: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        answers: [1, 0, 1, 1, 1, 0, 1, 0, 2, 2],
      },
      {
        categoryId: "social",
        questionOrder: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        answers: [2, 1, 2, 2, 2, 2, 1, 1, 1, 2],
      },
    ],
  },
];
