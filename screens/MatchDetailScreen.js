import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, categoryColors, shadows } from "../lib/theme";
import { categories } from "../data/questions";
import { calculateCategoryMatch } from "../lib/getMatch";
import { useData } from "../context/DataContext";
import FavoriteButton from "../components/FavoriteButton";
import GalleryViewer from "../components/GalleryViewer";

export default function MatchDetailScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const { getUserById, quizResponse } = useData();

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const targetUser = getUserById(userId);

  if (!targetUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>ไม่พบข้อมูลผู้ใช้</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>ย้อนกลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // สร้าง Map คำตอบของผู้ใช้ปัจจุบัน
  const currentAnswersMap = new Map();
  (quizResponse.categoryAnswers || []).forEach((ca) => {
    currentAnswersMap.set(ca.categoryId, ca);
  });

  // คำนวณความเข้ากันได้รายหมวดหมู่
  let totalMatchScore = 0;
  let commonCount = 0;

  const categoryBreakdown = categories.map((cat) => {
    const mine = currentAnswersMap.get(cat.id);
    const theirs = (targetUser.categoryAnswers || []).find(
      (ca) => ca.categoryId === cat.id
    );

    const isCommon = Boolean(mine && theirs);
    const percent = isCommon ? calculateCategoryMatch(mine, theirs) : 0;

    if (isCommon) {
      totalMatchScore += percent;
      commonCount++;
    }

    return {
      category: cat,
      isCommon,
      percent,
    };
  });

  const overallPercent =
    commonCount > 0 ? Math.round(totalMatchScore / commonCount) : 0;

  const handleOpenSocial = (platform, username) => {
    if (!username) return;
    let url = "";
    if (platform === "instagram") url = `https://instagram.com/${username}`;
    if (platform === "facebook") url = `https://facebook.com/${username}`;
    if (platform === "tiktok") url = `https://tiktok.com/@${username}`;
    if (platform === "line") url = `https://line.me/ti/p/~${username}`;

    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open link:", err)
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>รายละเอียดคู่แมตช์</Text>

        <FavoriteButton userId={targetUser.id} size="sm" />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {targetUser.image ? (
              <Image source={{ uri: targetUser.image }} style={styles.heroAvatar} />
            ) : (
              <View style={[styles.heroAvatar, styles.heroAvatarFallback]}>
                <Text style={styles.heroAvatarInitial}>
                  {targetUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreNumber}>{overallPercent}%</Text>
              <Text style={styles.scoreLabel}>COMPATIBILITY</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Text style={styles.heroName}>{targetUser.name}</Text>
            {targetUser.isRealUser && (
              <View style={styles.realBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={styles.realBadgeText}>ผู้ใช้จริง</Text>
              </View>
            )}
          </View>
          {targetUser.bio ? (
            <Text style={styles.heroBio}>{targetUser.bio}</Text>
          ) : null}

          {/* Social Links */}
          {targetUser.socialLinks &&
            Object.values(targetUser.socialLinks).some(Boolean) && (
              <View style={styles.socialRow}>
                {targetUser.socialLinks.instagram && (
                  <TouchableOpacity
                    style={styles.socialBadge}
                    onPress={() =>
                      handleOpenSocial("instagram", targetUser.socialLinks.instagram)
                    }
                  >
                    <Ionicons name="logo-instagram" size={16} color={colors.ink} />
                    <Text style={styles.socialText}>
                      @{targetUser.socialLinks.instagram}
                    </Text>
                  </TouchableOpacity>
                )}

                {targetUser.socialLinks.facebook && (
                  <TouchableOpacity
                    style={styles.socialBadge}
                    onPress={() =>
                      handleOpenSocial("facebook", targetUser.socialLinks.facebook)
                    }
                  >
                    <Ionicons name="logo-facebook" size={16} color={colors.ink} />
                    <Text style={styles.socialText}>
                      {targetUser.socialLinks.facebook}
                    </Text>
                  </TouchableOpacity>
                )}

                {targetUser.socialLinks.line && (
                  <TouchableOpacity
                    style={styles.socialBadge}
                    onPress={() =>
                      handleOpenSocial("line", targetUser.socialLinks.line)
                    }
                  >
                    <Ionicons name="chatbubble-ellipses" size={16} color={colors.ink} />
                    <Text style={styles.socialText}>
                      Line: {targetUser.socialLinks.line}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>BREAKDOWN</Text>
            <Text style={styles.sectionTitle}>ความเข้ากันได้แต่ละด้าน</Text>
          </View>

          <View style={styles.breakdownList}>
            {categoryBreakdown.map(({ category, isCommon, percent }) => {
              const tone = categoryColors[category.id];

              return (
                <View key={category.id} style={styles.breakdownCard}>
                  <View style={styles.breakdownCardHeader}>
                    <View style={styles.catLeft}>
                      <Text style={styles.breakdownIcon}>{category.icon}</Text>
                      <Text style={styles.breakdownName}>{category.name}</Text>
                    </View>

                    <Text
                      style={[
                        styles.breakdownPercent,
                        { color: isCommon ? colors.primary : colors.mutedForeground },
                      ]}
                    >
                      {isCommon ? `${percent}%` : "ยังไม่ตอบ"}
                    </Text>
                  </View>

                  <View style={styles.breakdownTrack}>
                    <View
                      style={[
                        styles.breakdownFill,
                        {
                          width: `${isCommon ? percent : 0}%`,
                          backgroundColor: tone.bg,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Gallery Images */}
        {targetUser.galleryImages && targetUser.galleryImages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>GALLERY</Text>
              <Text style={styles.sectionTitle}>
                รูปภาพ ({targetUser.galleryImages.length})
              </Text>
            </View>

            <View style={styles.galleryGrid}>
              {targetUser.galleryImages.map((img) => (
                <TouchableOpacity
                  key={img.id}
                  style={styles.galleryThumbWrapper}
                  activeOpacity={0.85}
                  onPress={() => setSelectedPhoto(img.url)}
                >
                  <Image source={{ uri: img.url }} style={styles.galleryThumb} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Image Fullscreen Viewer */}
      <GalleryViewer
        visible={Boolean(selectedPhoto)}
        imageUrl={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
  },
  iconBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 20,
    marginBottom: 24,
    ...shadows.neo,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: colors.darkBorder,
  },
  heroAvatarFallback: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroAvatarInitial: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.primary,
    lineHeight: 48,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink,
  },
  realBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  realBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  heroBio: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 22,
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  socialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.muted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  socialText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    paddingBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 2,
  },
  breakdownList: {
    gap: 12,
  },
  breakdownCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 14,
  },
  breakdownCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownIcon: {
    fontSize: 16,
  },
  breakdownName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  breakdownPercent: {
    fontSize: 16,
    fontWeight: "900",
  },
  breakdownTrack: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    overflow: "hidden",
  },
  breakdownFill: {
    height: 8,
    borderRadius: 4,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryThumbWrapper: {
    width: "31%",
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    overflow: "hidden",
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: "800",
  },
});
