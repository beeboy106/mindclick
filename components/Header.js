import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";

export default function Header({ rightComponent, onProfilePress }) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Brand Logo */}
      <View style={styles.logoRow}>
        <Text style={styles.brandTitle}>
          Mind<Text style={styles.brandTitleAccent}>click</Text>
        </Text>
        <View style={styles.brandBadge}>
          <Ionicons name="sparkles" size={13} color={colors.ink} />
        </View>
      </View>

      {/* User Info / Right Component */}
      <View style={styles.right}>
        {rightComponent ? (
          rightComponent
        ) : user ? (
          <TouchableOpacity
            style={styles.userProfileBtn}
            activeOpacity={0.8}
            onPress={onProfilePress}
          >
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
            )}
            <Text style={styles.userNameText} numberOfLines={1}>
              {user.name || "ผู้ใช้งาน"}
            </Text>
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
});
