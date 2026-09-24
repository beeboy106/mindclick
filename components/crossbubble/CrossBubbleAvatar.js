import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AVATAR_ASSETS } from "../../lib/avatarAssets";

// แผนที่รูปภาพอวาตารในเครื่อง (Data URIs เพื่อรองรับ Expo Snack และ Expo Go ได้ 100%)
export const AVATAR_IMAGE_MAP = {
  avatar_1: AVATAR_ASSETS.avatar_1,
  avatar_2: AVATAR_ASSETS.avatar_2,
  avatar_3: AVATAR_ASSETS.avatar_3,
  avatar_4: AVATAR_ASSETS.avatar_4,
  shop_blueberry: AVATAR_ASSETS.shop_blueberry,
  shop_red_apple: AVATAR_ASSETS.shop_red_apple,
  shop_green_apple: AVATAR_ASSETS.shop_green_apple,
  shop_funny_cat: AVATAR_ASSETS.shop_funny_cat,
  shop_curious_cat: AVATAR_ASSETS.shop_curious_cat,
  shop_shrimp_chicken: AVATAR_ASSETS.shop_shrimp_chicken,
  shop_pink_shrimp_chicken: AVATAR_ASSETS.shop_pink_shrimp_chicken,
  shop_cyber_flame: AVATAR_ASSETS.shop_cyber_flame,
  shop_soul_flame: AVATAR_ASSETS.shop_soul_flame,
};

// รายการอวาตารเริ่มต้น 4 แบบ
export const DEFAULT_AVATARS = [
  {
    id: "avatar_1",
    name: "กรีนบับเบิ้ล (Green Chill)",
    source: { uri: AVATAR_IMAGE_MAP.avatar_1 },
    color: "#22c55e",
  },
  {
    id: "avatar_2",
    name: "เยลโล่วสปาร์ค (Yellow Spark)",
    source: { uri: AVATAR_IMAGE_MAP.avatar_2 },
    color: "#eab308",
  },
  {
    id: "avatar_3",
    name: "เพอร์เพิลฮาร์ท (Purple Heart)",
    source: { uri: AVATAR_IMAGE_MAP.avatar_3 },
    color: "#a855f7",
  },
  {
    id: "avatar_4",
    name: "บลูเวฟ (Blue Wave)",
    source: { uri: AVATAR_IMAGE_MAP.avatar_4 },
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
          source={
            typeof AVATAR_IMAGE_MAP[avatarId] === "string"
              ? { uri: AVATAR_IMAGE_MAP[avatarId] }
              : AVATAR_IMAGE_MAP[avatarId]
          }
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
