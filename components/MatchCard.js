import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, categoryColors, shadows } from "../lib/theme";
import { categories } from "../data/questions";
import FavoriteButton from "./FavoriteButton";

export default function MatchCard({ match, index, onPress }) {
  const rank = String(index + 1).padStart(2, "0");

  const matchedCatObjects = match.matchedCategories
    .map((catId) => categories.find((c) => c.id === catId))
    .filter(Boolean);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>

        <View style={styles.avatarContainer}>
          {match.image ? (
            <Image source={{ uri: match.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {match.name ? match.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {match.name}
            </Text>
            {match.isRealUser && (
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
            )}
          </View>
          <Text style={styles.metaText}>
            ตรงกัน {match.matchedCategories.length} ด้าน{match.isRealUser ? " • ผู้ใช้จริง" : ""}
          </Text>
        </View>

        <View style={styles.scoreCol}>
          <Text style={styles.percentageText}>{match.matchPercentage}%</Text>
          <Text style={styles.percentageLabel}>MATCH</Text>
        </View>

        <View style={styles.actionCol}>
          <FavoriteButton userId={match.id} size="sm" />
        </View>
      </View>

      {matchedCatObjects.length > 0 && (
        <View style={styles.tagsRow}>
          {matchedCatObjects.map((cat) => {
            const catTone = categoryColors[cat.id] || {
              bg: colors.muted,
              text: colors.ink,
              border: colors.border,
            };
            return (
              <View
                key={cat.id}
                style={[
                  styles.catTag,
                  { backgroundColor: catTone.bg, borderColor: colors.darkBorder },
                ]}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text
                  style={[styles.catTagText, { color: catTone.text }]}
                  numberOfLines={1}
                >
                  {cat.nameEN}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 14,
    marginBottom: 12,
    ...shadows.neo,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankBadge: {
    width: 28,
    height: 28,
    backgroundColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rankText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  scoreCol: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  percentageText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
    lineHeight: 26,
  },
  percentageLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 0.5,
  },
  actionCol: {
    justifyContent: "center",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  catTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    gap: 4,
  },
  catIcon: {
    fontSize: 11,
  },
  catTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
