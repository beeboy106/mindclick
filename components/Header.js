import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors, shadows } from "../lib/theme";
import { useAuth } from "../context/AuthContext";

export default function Header({ title, rightComponent }) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>Q</Text>
        </View>
        <Text style={styles.brandTitle}>Friend<Text style={styles.brandAccent}>Q</Text></Text>
      </View>

      <View style={styles.right}>
        {rightComponent ? (
          rightComponent
        ) : (
          user?.image && (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          )
        )}
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
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    ...shadows.neo,
  },
  logoBadgeText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: colors.coral,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
});
