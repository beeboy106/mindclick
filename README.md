# Mindclick Mobile (React Native / Expo) 📱✨

แอปพลิเคชันค้นหาเพื่อนและสร้างมิตรภาพตามระดับความเข้ากันได้ของไลฟ์สไตล์ นิสัย และมุมมองทางสังคม พัฒนาด้วย **React Native (Expo SDK 54 / React 19)** ภาษา JavaScript (ES6+ 100%) รองรับทั้ง Android Native (Development Build / APK) และ Web Browser

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: React Native 0.81.5 + Expo SDK 54
- **Language**: JavaScript (ES6+ / JSX 100%)
- **Navigation**: React Navigation v7 (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`)
- **Authentication**:
  - **Android Native**: `@react-native-google-signin/google-signin` (Google Play Services พร้อม SHA-1 Key)
  - **Web**: Firebase Web SDK (`signInWithPopup` ผ่าน GoogleAuthProvider)
  - **Session Persistence**: `@react-native-async-storage/async-storage`
- **Database & Cloud**: Google Cloud Firestore (ผ่าน REST API & Firebase SDK)
- **Media & Photos**: `expo-image-picker` สำหรับเลือกรูปโปรไฟล์และแกลเลอรี
- **UI & Design**: Custom Neo-brutalism Design System (`lib/theme.js`) + `react-native-safe-area-context`

---

## 📁 โครงสร้างโปรเจกต์ (Folder Structure)

```text
friendq-mobile/
├── package.json               # Dependencies และ Scripts ของ Expo SDK 54
├── app.json                   # การตั้งค่า Expo, Plugins, Package Name (com.mindclick.app)
├── eas.json                   # การตั้งค่า Cloud Build ของ EAS (Development & Preview APK)
├── App.js                     # Root Component ห่อหุ้ม Providers (SafeArea, Auth, Data)
├── README.md                  # เอกสารคู่มือสำหรับนักพัฒนา
├── context/
│   ├── AuthContext.js         # ระบบเข้าสู่ระบบ Google สำหรับ Android Native และ Web
│   └── DataContext.js         # ข้อมูลโปรไฟล์, ควิซ, แมตช์, รายการโปรด, ซิงค์ Cloud Firestore
├── data/
│   ├── questions.js           # ชุดคำถาม 4 ด้าน (Lifestyle, Personality, Interaction, Social)
│   └── mockUsers.js           # ข้อมูลผู้ใช้เริ่มต้นสำหรับคำนวณการแมตช์
├── lib/
│   ├── firebase.js            # การเชื่อมต่อ Firebase Project (mindclick-f4bf4)
│   ├── getMatch.js            # อัลกอริทึมคำนวณเปอร์เซ็นต์ความเข้ากันได้ (Matching Percentage)
│   └── theme.js               # Design Tokens: ชุดสี, สไตล์ขอบ และเงา (Neo-brutalism)
├── navigation/
│   └── AppNavigator.js        # ตัวจัดการการเปลี่ยนหน้า (Stack & Bottom Tabs)
├── components/
│   ├── Header.js              # ส่วนหัวแอปแสดงแบรนด์ Mindclick และสถิติ
│   ├── MatchCard.js           # การ์ดแสดงผลข้อมูลคู่แมตช์ พร้อมแท็กและเปอร์เซ็นต์
│   ├── FavoriteButton.js      # ปุ่มกดหัวใจบันทึกรายการโปรด
│   └── GalleryViewer.js       # โมดอลเปิดดูรูปภาพในอัลบั้มแบบเต็มจอ
└── screens/
    ├── SignInScreen.js        # หน้าจอเข้าสู่ระบบด้วย Google
    ├── HomeScreen.js          # หน้าหลัก สรุปความคืบหน้าของควิซและหมวดหมู่
    ├── QuizScreen.js          # หน้าทำแบบทดสอบแยกตามหมวดหมู่
    ├── ResultsScreen.js       # หน้าแสดงรายการผู้ใช้ที่เข้ากันได้
    ├── MatchDetailScreen.js   # หน้ารายละเอียดโปรไฟล์คู่แมตช์และกราฟเปรียบเทียบ
    ├── FavoritesScreen.js     # หน้ารายชื่อเพื่อนที่บันทึกเป็นรายการโปรด
    └── ProfileScreen.js       # หน้าจัดการโปรไฟล์ ข้อมูลส่วนตัว โซเชียล และแกลเลอรีรูปภาพ
```

---

## 🚀 ขั้นตอนการติดตั้งและรันในเครื่อง (Setup & Running)

### 1. สิ่งที่ต้องติดตั้งในเครื่อง (Prerequisites)
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 LTS หรือ 20 LTS ขึ้นไป)
- [Git](https://git-scm.com/)

### 2. ติดตั้งโปรเจกต์
```bash
# Clone โปรเจกต์ลงเครื่อง
git clone https://github.com/beeboy106/mindclick.git

# เข้าโฟลเดอร์โปรเจกต์
cd mindclick/friendq-mobile

# ติดตั้ง Dependencies ทั้งหมด
npm install
```

### 3. วิธีการรันโปรเจกต์

#### A. รันเพื่อทดสอบบน Web Browser (สะดวกและรวดเร็วที่สุดสำหรับพัฒนา UI/Logic)
```bash
npx expo start --web
```
- รันได้ทันทีโดยไม่ต้องเชื่อมต่ออุปกรณ์ภายนอก สามารถทดสอบทำควิซ, แก้ไขโปรไฟล์, และคำนวณแมตช์ได้เต็มรูปแบบ

#### B. รันบน Android (Development Build)
> **หมายเหตุ**: โปรเจกต์นี้ใช้ Native Google Play Services จึงไม่สามารถใช้ Expo Go ทั่วไปได้ ต้องเปิดด้วยแอป **Development Build** หรือไฟล์ APK ที่ติดตั้งไว้ในเครื่อง
```bash
npx expo start --dev-client
```
- เปิดแอป Mindclick (Dev Client / APK) บนมือถือ แล้วเชื่อมต่อเข้ากับ Metro Server

---

## 🔑 การตั้งค่า Credentials สำคัญ (Important Configurations)

### 1. Firebase Project (`mindclick-f4bf4`)
- กำหนดค่าการเชื่อมต่อไว้ในไฟล์ `lib/firebase.js`
- **Firestore Collections**:
  - `users/{uid}/profile`: ข้อมูลโปรไฟล์ส่วนตัว
  - `users/{uid}/quiz`: คำตอบของแบบทดสอบ
  - `users/{uid}/favorites`: รายการโปรดที่บันทึกไว้

### 2. Google Sign-In & Google Cloud Console
- **Web Client ID**: กำหนดไว้ที่ `context/AuthContext.js`
  ```javascript
  const WEB_CLIENT_ID = "702542015984-unuf8133kals37q2s2pc81r4vugrep10.apps.googleusercontent.com";
  ```
- **Android SHA-1 Fingerprint**:
  - ลงทะเบียน SHA-1 ของ EAS Cloud Build ไว้ใน Firebase Console เรียบร้อยแล้ว (`09:3F:A1:D7:CC:D3:84:9C:E3:6A:D9:56:06:7E:F0:DA:B7:B5:F1:DD`)

---

## 📦 การสร้างไฟล์ APK ใหม่ (EAS Build)

หากต้องการคอมไพล์ไฟล์ `.apk` ใหม่:
```bash
# ติดตั้ง EAS CLI (ถ้ายังไม่มี)
npm install -g eas-cli

# เข้าสู่ระบบ Expo Account
eas login

# สั่งบิลด์ไฟล์ APK สำหรับ Android
eas build -p android --profile preview
```

