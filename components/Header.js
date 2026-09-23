import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { usePremium } from "../context/PremiumContext";

export default function Header({ rightComponent, onProfilePress }) {
  const { user } = useAuth();
  const { profile } = useData();
  const { isBubbleUser } = usePremium();
  const [imgError, setImgError] = useState(false);

  const displayImage = profile?.image || user?.image || null;
  const displayName = profile?.name || user?.name || "ผู้ใช้งาน";

  useEffect(() => {
    setImgError(false);
  }, [displayImage]);

  return (
    <View style={styles.container}>
      {/* Brand Logo */}
      <View style={styles.logoRow}>
        <Text style={styles.brandTitle}>
          Mind<Text style={styles.brandTitleAccent}>click</Text>
        </Text>
        <View style={styles.brandBadge}>
          <MaterialCommunityIcons name="cursor-default-click" size={15} color={colors.ink} />
        </View>
      </View>

      {/* User Info / Right Component */}
      <View style={styles.right}>
        {rightComponent ? (
          rightComponent
        ) : user ? (
          <TouchableOpacity
            style={[
              styles.userProfileBtn,
              isBubbleUser && styles.userProfileBtnBubble,
            ]}
            activeOpacity={0.8}
            onPress={onProfilePress}
          >
            <View style={[styles.headerAvatarBox, isBubbleUser && styles.headerAvatarBoxBubble]}>
              {!imgError && displayImage ? (
                <Image
                  source={{ uri: displayImage }}
                  style={styles.avatarImage}
                  onError={() => setImgError(true)}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userNameText} numberOfLines={1}>
              {displayName}
            </Text>
            {isBubbleUser && (
              <MaterialCommunityIcons name="chart-bubble" size={13} color="#0284c7" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  brandTitleAccent: {
    color: colors.primary,
  },
  brandBadge: {
    width: 24,
    height: 24,
    backgroundColor: "#bbf44a", // Mindclick Lime Accent
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  userProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  userNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    maxWidth: 130,
  },
  userProfileBtnBubble: {
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
  },
  headerAvatarBox: {
    position: "relative",
  },
  headerAvatarBoxBubble: {
    padding: 1.5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#0284c7",
  },
});
