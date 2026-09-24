import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// แผนที่รูปภาพอวาตารในเครื่อง
export const AVATAR_IMAGE_MAP = {
  avatar_1: require("../../assets/avatars/default_avatar_1.jpg"),
  avatar_2: require("../../assets/avatars/default_avatar_2.jpg"),
  avatar_3: require("../../assets/avatars/default_avatar_3.jpg"),
  avatar_4: require("../../assets/avatars/default_avatar_4.jpg"),
  shop_blueberry: require("../../assets/avatars/shop_avatar_blueberry.jpg"),
  shop_red_apple: require("../../assets/avatars/shop_avatar_red_apple.jpg"),
  shop_green_apple: require("../../assets/avatars/shop_avatar_green_apple.jpg"),
  shop_funny_cat: require("../../assets/avatars/shop_avatar_funny_cat.jpg"),
  shop_curious_cat: require("../../assets/avatars/shop_avatar_curious_cat.jpg"),
  shop_shrimp_chicken: require("../../assets/avatars/shop_avatar_shrimp_chicken.jpg"),
  shop_pink_shrimp_chicken: require("../../assets/avatars/shop_avatar_pink_shrimp_chicken.jpg"),
};

// รายการอวาตารเริ่มต้น 4 แบบ
export const DEFAULT_AVATARS = [
  {
    id: "avatar_1",
    name: "กรีนบับเบิ้ล (Green Chill)",
    source: AVATAR_IMAGE_MAP.avatar_1,
    color: "#22c55e",
  },
  {
    id: "avatar_2",
    name: "เยลโล่วสปาร์ค (Yellow Spark)",
    source: AVATAR_IMAGE_MAP.avatar_2,
    color: "#eab308",
  },
  {
    id: "avatar_3",
    name: "เพอร์เพิลฮาร์ท (Purple Heart)",
    source: AVATAR_IMAGE_MAP.avatar_3,
    color: "#a855f7",
  },
  {
    id: "avatar_4",
    name: "บลูเวฟ (Blue Wave)",
    source: AVATAR_IMAGE_MAP.avatar_4,
    color: "#38bdf8",
  },
];

export const DEFAULT_AVATAR_IDS = DEFAULT_AVATARS.map((a) => a.id);

/**
 * คอมโพเนนต์แสดงผลรูปโปรไฟล์ทรงสี่เหลี่ยมขอบมน (Rounded Rectangle) สำหรับโหมด Cross Bubble
 */
export default function CrossBubbleAvatar({
  avatarId,
  size = 40,
  borderRadius,
  borderWidth = 1.5,
  borderColor = "#17171c",
  backgroundColor = "#f1f5f9",
  iconColor = "#17171c",
  style,
}) {
  const resolvedRadius =
    typeof borderRadius === "number" ? borderRadius : Math.round(size * 0.26);

  // 1. ตรวจสอบว่าเป็นรูปภาพจาก Local Asset หรือไม่
  if (avatarId && AVATAR_IMAGE_MAP[avatarId]) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: resolvedRadius,
            borderWidth,
            borderColor,
            backgroundColor,
          },
          style,
        ]}
      >
        <Image
          source={AVATAR_IMAGE_MAP[avatarId]}
          style={[
            styles.image,
            {
              width: "100%",
              height: "100%",
              borderRadius: Math.max(0, resolvedRadius - borderWidth),
            },
          ]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // 2. ตรวจสอบว่าเป็น URL รูปภาพภายนอกหรือไม่ (เช่น รูปโปรไฟล์จริงเมื่อเปิดเผยตัวตน)
  if (
    typeof avatarId === "string" &&
    (avatarId.startsWith("http://") || avatarId.startsWith("https://"))
  ) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: resolvedRadius,
            borderWidth,
            borderColor,
            backgroundColor,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: avatarId }}
          style={[
            styles.image,
            {
              width: "100%",
              height: "100%",
              borderRadius: Math.max(0, resolvedRadius - borderWidth),
            },
          ]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // 3. Fallback เป็น Ionicons แสดงในกรอบสี่เหลี่ยมขอบมน
  const iconName =
    typeof avatarId === "string" && avatarId.trim() ? avatarId : "person";

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: resolvedRadius,
          borderWidth,
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      <Ionicons
        name={iconName}
        size={Math.round(size * 0.52)}
        color={iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
