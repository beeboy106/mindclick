import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, categoryColors, shadows } from "../lib/theme";
import { categories } from "../data/questions";
import { calculateCategoryMatch } from "../lib/getMatch";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { usePremium } from "../context/PremiumContext";
import FavoriteButton from "../components/FavoriteButton";
import ResponsiveMedia from "../components/ResponsiveMedia";

export default function MatchDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { userId, isPreview: paramPreview } = route.params || {};
  const { user } = useAuth();
  const { profile, getUserById, quizResponse } = useData();
  const { recordProfileView } = usePremium();

  const [avatarError, setAvatarError] = useState(false);

  // ตรวจสอบว่าเป็นโหมดพรีวิวโปรไฟล์ตนเองหรือไม่
  const isPreview = Boolean(paramPreview || (user?.id && userId === user?.id));

  // ดึงข้อมูลผู้ใช้ (หากเป็นพรีวิว ให้ใช้โปรไฟล์ของผู้ใช้ปัจจุบัน)
  const targetUser = isPreview
    ? {
        id: user?.id,
        name: profile?.name || user?.name || "คุณ (โปรไฟล์สาธารณะ)",
        image: profile?.image || user?.image || null,
        bio: profile?.bio || "ยังไม่ได้ระบุประวัติส่วนตัว",
        gender: profile?.gender,
        faculty: profile?.faculty || "มหาวิทยาลัย",
        socialLinks: profile?.socialLinks || {},
        galleryImages: profile?.galleryImages || [],
        categoryAnswers: quizResponse?.categoryAnswers || [],
        completedCategories: quizResponse?.completedCategories || [],
        isRealUser: true,
      }
    : getUserById(userId);

  useEffect(() => {
    // บันทึกประวัติการเข้าชมเฉพาะเมื่อดูโปรไฟล์คนอื่น (ไม่ใช่ดูโปรไฟล์ตัวเอง)
    if (userId && !isPreview) {
      recordProfileView(userId);
    }
  }, [userId, isPreview, recordProfileView]);

  if (!targetUser) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>ไม่พบข้อมูลผู้ใช้</Text>
          <TouchableOpacity
            style={styles.notFoundBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.notFoundBackBtnText}>ย้อนกลับ</Text>
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

  // บทวิเคราะห์เคมีความเข้ากัน 3 ระดับตามแบบ FriendQ
  const chemistrySummary =
    overallPercent >= 70
      ? "คำตอบของคุณสองคนใกล้กันมาก มีโอกาสคุยกันได้ลื่นและเข้าใจมุมมองของกันและกัน"
      : overallPercent >= 40
      ? "มีทั้งจุดที่คิดคล้ายกันและต่างกันพอดี น่าจะมีเรื่องให้แลกเปลี่ยนกันเยอะ"
      : "มุมมองค่อนข้างต่างกัน ซึ่งอาจเปิดบทสนทนาและประสบการณ์ใหม่ๆ ให้กันได้";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link "กลับไปหน้าแมตช์" */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color={colors.mutedForeground} style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>กลับไปหน้าแมตช์</Text>
        </TouchableOpacity>

        {/* Main FriendQ Match Card */}
        <View style={styles.matchCard}>
          {/* Hero Profile Photo / Fallback */}
          <View style={styles.heroBox}>
            {!avatarError && targetUser.image ? (
              <ResponsiveMedia
                uri={targetUser.image}
                style={styles.heroImage}
                fallbackAspectRatio={4 / 5}
                maxHeightRatio={0.58}
                maxHeight={520}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.heroFallback}>
                <Text style={styles.heroFallbackText}>
                  {(targetUser.name || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {!isPreview && (
              <View style={styles.heroFavBtn}>
                <FavoriteButton userId={targetUser.id} size="md" />
              </View>
            )}
          </View>

          {/* Details Content Box */}
          <View style={styles.contentBox}>
            {/* Header: Name & Match Score */}
            <View style={styles.headerInfoRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.eyebrow}>MATCH DETAIL</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {targetUser.name}
                </Text>
                <Text style={styles.userSubtitle}>
                  มีคำตอบร่วมกัน {commonCount} จาก {categories.length} ด้าน
                </Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>เข้ากัน</Text>
                <Text style={styles.scoreValue}>
                  {overallPercent}%
                </Text>
              </View>
            </View>

            {/* About / Bio Section */}
            {Boolean(targetUser.bio && targetUser.bio.trim()) && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutEyebrow}>ABOUT</Text>
                <Text style={styles.aboutText}>{targetUser.bio}</Text>
              </View>
            )}

            {/* สิ่งที่เราคล้ายกัน Section */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>สิ่งที่เราคล้ายกัน</Text>
              <View style={styles.categoryList}>
                {categoryBreakdown.map(({ category, isCommon, percent }) => {
                  const tone = categoryColors[category.id] || {
                    bg: colors.primary,
                    text: colors.white,
                  };
                  return (
                    <View
                      key={category.id}
                      style={[
                        styles.categoryRow,
                        !isCommon && styles.categoryRowDimmed,
                      ]}
                    >
                      <View style={[styles.catColorBar, { backgroundColor: tone.bg }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categorySub}>
                          {isCommon ? category.nameEN : "ยังไม่มีคำตอบร่วมกัน"}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.categoryPercent,
                          { color: isCommon ? colors.ink : colors.mutedForeground },
                        ]}
                      >
                        {isCommon ? `${percent}%` : "—"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Chemistry Summary & Action Button */}
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryText}>{chemistrySummary}</Text>

              {isPreview ? (
                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  activeOpacity={0.88}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="create-outline" size={18} color={colors.ink} style={{ marginRight: 8 }} />
                  <Text style={styles.viewProfileBtnText}>ย้อนกลับไปแก้ไขโปรไฟล์</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate("PublicProfile", {
                      userId: targetUser.id,
                      user: targetUser,
                    })
                  }
                >
                  <Text style={styles.viewProfileBtnText}>
                    ดูโปรไฟล์ของ {targetUser.name}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.ink} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    overflow: "hidden",
    ...shadows.neo,
  },
  heroBox: {
    width: "100%",
    backgroundColor: colors.muted,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
  },
  heroFallback: {
    width: "100%",
    height: 360,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroFallbackText: {
    fontSize: 72,
    fontWeight: "900",
    color: colors.white,
  },
  heroFavBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
  },
  contentBox: {
    padding: 20,
  },
  headerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
    lineHeight: 34,
  },
  userSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: "600",
    marginTop: 6,
  },
  scoreCol: {
    alignItems: "flex-end",
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.primary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  aboutSection: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.ink,
    fontWeight: "500",
    marginTop: 4,
  },
  categoriesSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 14,
  },
  categoryList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryRowDimmed: {
    opacity: 0.45,
  },
  catColorBar: {
    width: 8,
    height: 36,
    marginRight: 12,
    borderRadius: 2,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  categorySub: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "600",
    marginTop: 2,
  },
  categoryPercent: {
    fontSize: 20,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginLeft: 10,
  },
  summaryFooter: {
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
    paddingTop: 20,
    marginTop: 6,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  viewProfileBtn: {
    backgroundColor: "#bbf44a",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    marginTop: 18,
    borderRadius: 8,
    ...shadows.neo,
  },
  viewProfileBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 16,
  },
  notFoundBackBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  notFoundBackBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },
});
