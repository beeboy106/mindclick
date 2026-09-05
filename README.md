# FriendQ Mobile (React Native / Expo)

โปรเจกต์ Mobile Application ของ FriendQ พัฒนาด้วย React Native (Expo SDK 52) ภาษา JavaScript ล้วน (JS/JSX 100%) รองรับการรันบนอุปกรณ์จริง (iOS/Android ผ่าน Expo Go) และบนเว็บเบราว์เซอร์ผ่าน [Snack Expo](https://snack.expo.dev) 100%

---

## โครงสร้างโปรเจกต์ (Folder Structure)

```text
friendq-mobile/
├── package.json               # Dependencies ของ Expo SDK 52 & React Navigation v6
├── app.json                   # Expo Application Configuration
├── App.js                     # Root Component ห่อหุ้ม Providers & Navigator
├── README.md                  # คู่มือการติดตั้งและใช้งาน
├── data/
│   ├── questions.js           # คำถาม 4 ด้าน (40 ข้อ) + ตัวเลือกคำตอบ
│   └── mockUsers.js           # ข้อมูลผู้ใช้จำลอง 5 คนสำหรับทดสอบระบบจับคู่
├── lib/
│   ├── getMatch.js            # ฟังก์ชันคำนวณ Compatibility Percentage
│   └── theme.js               # ดีไซน์โทเค็น สี และ Neo-brutalist Shadows
├── context/
│   ├── AuthContext.js         # จัดการ Session และ Google OAuth (พร้อม Demo Fallback)
│   └── DataContext.js         # Local Storage (Profile, Quiz, Gallery, Favorites)
├── components/
│   ├── Header.js              # ส่วนหัวแอปแสดงแบรนด์ FriendQ
│   ├── FavoriteButton.js      # ปุ่มกดหัวใจบันทึกรายการโปรด
│   ├── MatchCard.js           # การ์ดแสดงผลแมตช์ พร้อมแท็กหมวดหมู่และเปอร์เซ็นต์
│   └── GalleryViewer.js       # โมดอลเปิดดูรูปภาพขนาดเต็ม
├── navigation/
│   └── AppNavigator.js        # Root Stack & Bottom Tab Navigator (4 แท็บ)
└── screens/
    ├── SignInScreen.js        # หน้าจอเข้าสู่ระบบด้วย Google
    ├── HomeScreen.js          # หน้าแรก สรุปโปรเกรสและเริ่มทำควิซ
    ├── QuizScreen.js          # หน้าทำแบบทดสอบทีละข้อแบบ Full-screen
    ├── ResultsScreen.js       # หน้าแสดงรายการผู้ใช้ที่แมตช์กัน
    ├── MatchDetailScreen.js   # หน้ารายละเอียดคู่แมตช์และกราฟเปรียบเทียบคำตอบ
    ├── FavoritesScreen.js     # หน้ารายการโปรด
    └── ProfileScreen.js       # หน้าจัดการโปรไฟล์ โซเชียล และแกลเลอรีรูปภาพ
```

---

## วิธีการรันในเครื่อง (Local VS Code)

1. เปิด Terminal ในโฟลเดอร์ `friendq-mobile`:
   ```bash
   cd friendq-mobile
   ```

2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

3. เริ่มต้นเซิร์ฟเวอร์ Expo:
   ```bash
   npx expo start
   ```

4. สแกน QR Code ด้วยแอป **Expo Go** บนมือถือของคุณ (iOS ผ่านกล้อง / Android ผ่าน Expo Go) หรือกด `w` เพื่อเปิดบนเว็บเบราว์เซอร์

---

## วิธีการรันบน Snack Expo (snack.expo.dev)

1. เข้าไปที่ [https://snack.expo.dev](https://snack.expo.dev)
2. สร้างโครงสร้างโฟลเดอร์ตามแผนผังด้านบนในช่องด้านซ้ายมือของ Snack
3. คัดลอกเนื้อหาไฟล์ `.js` แต่ละไฟล์ไปวางตามโฟลเดอร์ที่กำหนด
4. ในแท็บ `package.json` บน Snack ให้เพิ่ม dependencies จาก `package.json` ของโปรเจกต์นี้
5. หน้าจอพรีวิว (iOS / Android / Web) จะคอมไพล์และรันแอปพลิเคชันให้ทดสอบได้ทันที

---

## การตั้งค่า Google OAuth (เมื่อต้องการใช้งานจริง)

เปิดไฟล์ `context/AuthContext.js` แล้วนำ Client IDs จาก [Google Cloud Console](https://console.cloud.google.com/) มาใส่ในส่วน `GOOGLE_CONFIG`:

```javascript
export const GOOGLE_CONFIG = {
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
};
```

> **หมายเหตุ**: หากยังไม่ได้กำหนด Client ID ระบบจะเข้าสู่ระบบแบบ Demo User ให้ทันทีอัตโนมัติ เพื่อให้สามารถทดสอบฟีเจอร์ควิซ, แมตช์, แกลเลอรี, และรายการโปรดบน Snack Expo ได้อย่างราบรื่นโดยไม่ติดขัด
