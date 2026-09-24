import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// กำหนดค่าการแสดงผลการแจ้งเตือนเมื่อแอปเปิดอยู่ (Foreground Notification)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ขอสิทธิ์การแจ้งเตือนจากระบบปฏิบัติการ (iOS / Android) และตั้งค่า Channel สำหรับ Android
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") {
    return false;
  }

  let isGranted = false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    isGranted = finalStatus === "granted";

    // ตั้งค่า Notification Channel สำหรับ Android 8.0+
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Mindclick การแจ้งเตือนทั่วไป",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6366f1",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("chats", {
        name: "ข้อความแชท",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: "#22c55e",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("matches", {
        name: "คู่แมตช์ใหม่",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#ec4899",
        sound: "default",
      });
    }
  } catch (err) {
    console.warn("Notification permission warning:", err);
  }

  return isGranted;
}

// ฟังก์ชันส่งการแจ้งเตือนเข้าเครื่อง (Local System Notification)
export async function sendLocalNotification({
  title,
  body,
  data = {},
  channelId = "default",
  isDndActive = false,
}) {
  // หากเปิดโหมดห้ามรบกวน (Do Not Disturb): ไม่ส่งแจ้งเตือนเข้าเครื่องเด็ดขาด
  if (isDndActive) {
    return null;
  }

  if (Platform.OS === "web") {
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: null, // trigger: null หมายถึงยิงแจ้งเตือนเข้าเครื่องทันที
    });
    return notificationId;
  } catch (err) {
    console.warn("Error sending local notification:", err);
    return null;
  }
}

// ส่งการแจ้งเตือนเมื่อมีข้อความแชทใหม่เข้ามา
export async function sendChatNotification({
  senderName,
  messageText,
  friendId,
  isDndActive = false,
}) {
  if (isDndActive) return null;

  return sendLocalNotification({
    title: senderName || "มีข้อความใหม่",
    body: messageText || "ส่งข้อความถึงคุณ",
    data: { type: "chat", friendId },
    channelId: "chats",
    isDndActive,
  });
}

// ส่งการแจ้งเตือนเมื่อพบการแมตช์ใหม่
export async function sendMatchNotification({
  matchName,
  compatibilityPercent = 90,
  isDndActive = false,
}) {
  if (isDndActive) return null;

  return sendLocalNotification({
    title: "พบผู้ใช้ที่มีเคมีความคิดตรงกัน",
    body: `คุณมีความเข้ากันได้ ${compatibilityPercent}% กับ ${matchName}`,
    data: { type: "match" },
    channelId: "matches",
    isDndActive,
  });
}

// ฟังก์ชันสำหรับทดสอบยิง Noti เข้าเครื่อง
export async function sendTestNotification(isDndActive = false) {
  if (isDndActive) {
    return {
      success: false,
      reason: "dnd_active",
      message: "ไม่สามารถส่งแจ้งเตือนได้เนื่องจากเปิดโหมดห้ามรบกวนอยู่",
    };
  }

  const granted = await registerForPushNotificationsAsync();
  if (!granted) {
    return {
      success: false,
      reason: "permission_denied",
      message: "ยังไม่ได้รับอนุญาตให้ส่งการแจ้งเตือนจากระบบ",
    };
  }

  const id = await sendLocalNotification({
    title: "Mindclick ระบบแจ้งเตือน",
    body: "การแจ้งเตือนของเครื่องทำงานสมบูรณ์แล้ว",
    data: { test: true },
    channelId: "default",
    isDndActive,
  });

  return {
    success: Boolean(id),
    id,
    message: id ? "ส่งการแจ้งเตือนเข้าเครื่องเรียบร้อยแล้ว" : "เกิดข้อผิดพลาดในการส่ง",
  };
}
