import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { categories } from "../data/questions";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useDilemma } from "../context/DilemmaContext";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import DailyDilemmaModal from "../components/DailyDilemmaModal";
import BubbleUpgradeModal from "../components/BubbleUpgradeModal";
import { usePremium } from "../context/PremiumContext";

const categoryTheme = {
  lifestyle: { number: "01", bg: "#c7f65a", text: "#17171c" },
  personality: { number: "02", bg: "#3457ff", text: "#ffffff" },
  interaction: { number: "03", bg: "#ff5c5c", text: "#ffffff" },
  social: { number: "04", bg: "#17171c", text: "#ffffff" },
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const {
    quizResponse,
    profile,
    getMatchList,
    hasAcceptedPolicy,
    isProfileComplete,
    profileCompletion,
    refreshPool,
  } = useData();
  const {
    isBubbleUser,
    isPaid,
    isTrialActive,
    daysRemaining,
    hasShownWelcome,
    dismissWelcome,
  } = usePremium();

  const [bubbleModalVisible, setBubbleModalVisible] = useState(false);
  const [bubbleModalMode, setBubbleModalMode] = useState("paywall");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refreshPool) {
        await refreshPool();
      }
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [refreshPool]);

  const completed = quizResponse.completedCategories || [];
  const matches = getMatchList();

  const resolvedName = profile?.name || user?.name || "คุณ";
  const firstName = resolvedName.includes("@")
    ? resolvedName.split("@")[0]
    : resolvedName.split(" ")[0];

  const nextCategory = categories.find((c) => !completed.includes(c.id));
  const isCompletedAll = completed.length === categories.length;

  const [dilemmaModalVisible, setDilemmaModalVisible] = useState(false);
  const { streakCount, streakStatus, hasAnsweredToday, todayQuestion } = useDilemma();

  const handleStartQuiz = (categoryId = null) => {
    if (!isProfileComplete) {
      navigation.navigate("ProfileTab");
      return;
    }
    navigation.navigate("Quiz", { categoryId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <Header onProfilePress={() => navigation.navigate("ProfileTab")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingTitle}>สวัสดี {firstName}</Text>
            </View>

            {/* Streak Flame Badge (Visible when completed all or has streak) */}
            {(isCompletedAll || streakCount > 0) && (
              <TouchableOpacity
                style={[
                  styles.streakBadgeMini,
                  streakStatus === "active" && styles.streakBadgeActiveMini,
                  streakStatus === "warning" && styles.streakBadgeWarningMini,
                ]}
                activeOpacity={0.8}
                onPress={() => setDilemmaModalVisible(true)}
              >
                <Ionicons
                  name={streakStatus === "active" ? "flame" : streakStatus === "warning" ? "warning-outline" : "cloud-outline"}
                  size={15}
                  color={streakStatus === "active" ? colors.coral : streakStatus === "warning" ? "#d97706" : colors.mutedForeground}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.streakTextMini,
                    streakStatus === "active" && styles.streakTextActiveMini,
                  ]}
                >
                  {streakCount} วัน
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.greetingSubtitle}>
            {isCompletedAll
              ? "คุณตอบคำถามแมตช์ครบ 4 ด้านแล้ว! มาท้าทายคำถามประจำวันเพื่อรู้จักตัวเองยิ่งขึ้น"
              : "ไปต่อจากจุดที่ค้างไว้ แล้วดูว่าคำตอบของคุณพาไปเจอใครบ้าง"}
          </Text>

          {!isCompletedAll && (
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.blueBtn}
                activeOpacity={0.85}
                onPress={() => handleStartQuiz(nextCategory?.id)}
              >
                <Text style={styles.blueBtnText}>
                  {completed.length > 0 ? "ตอบคำถามต่อ" : "เริ่มตอบคำถาม"}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Next Move / Daily Campus Dilemma Card */}
        {isCompletedAll ? (
          <TouchableOpacity
            style={styles.dilemmaHeroCard}
            activeOpacity={0.9}
            onPress={() => setDilemmaModalVisible(true)}
          >
            <View style={styles.dilemmaHeroTop}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={styles.dilemmaTagBadge}>
                  <Text style={styles.dilemmaTagText}>ประเด็นขบคิดประจำวัน</Text>
                </View>
                {todayQuestion?.isAiGenerated && (
                  <View style={styles.dilemmaAiBadge}>
                    <Ionicons name="sparkles" size={10} color="#bef264" />
                    <Text style={styles.dilemmaAiBadgeText}>AI Gemini</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.dilemmaStreakPill,
                  streakStatus === "active" && styles.dilemmaStreakPillActive,
                  streakStatus === "warning" && styles.dilemmaStreakPillWarning,
                ]}
              >
                <Ionicons
                  name={streakStatus === "active" ? "flame" : streakStatus === "warning" ? "warning-outline" : "cloud-outline"}
                  size={16}
                  color={streakStatus === "active" ? colors.coral : streakStatus === "warning" ? "#d97706" : colors.mutedForeground}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.dilemmaStreakNumber,
                    streakStatus === "active" && styles.dilemmaStreakNumberActive,
                  ]}
                >
                  {streakCount} วัน
                </Text>
              </View>
            </View>

            <Text style={styles.dilemmaHeadline}>
              {hasAnsweredToday
                ? "คุณรักษาสตรีคไฟของวันนี้แล้ว!"
                : todayQuestion?.title || "คำถามประจำวันพร้อมให้คุณตอบแล้ว"}
            </Text>

            <View style={styles.dilemmaLine} />

            <Text style={styles.dilemmaSub} numberOfLines={2}>
              {hasAnsweredToday
                ? "แตะเพื่อดูบทวิเคราะห์ตัวตนของคุณ หรือทบทวนสถิติของเพื่อน"
                : todayQuestion?.situation || "ตอบคำถามประจำวันสะท้อนตัวตนเพื่อเก็บสตรีคไฟไม่ให้ดับ"}
            </Text>

            <View style={styles.dilemmaActionRow}>
              <Text style={styles.dilemmaActionText}>
                {hasAnsweredToday ? "ดูผลและบทวิเคราะห์ตัวตน" : "เริ่มตอบคำถามวันนี้"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextMoveCard}
            activeOpacity={0.9}
            onPress={() => {
              if (!isProfileComplete) {
                navigation.navigate("ProfileTab");
              } else {
                handleStartQuiz(nextCategory?.id);
              }
            }}
          >
            <View style={styles.nextMoveTop}>
              <Text style={styles.nextMoveLabel}>ขั้นตอนถัดไป</Text>
              <Ionicons name="arrow-forward" size={28} color={colors.ink} />
            </View>

            <Text style={styles.nextMoveHeadline}>
              {!isProfileComplete
                ? "เติมโปรไฟล์ให้คนอื่นรู้จักคุณ"
                : `ตอบ${nextCategory?.name}ต่อ`}
            </Text>

            <View style={styles.nextMoveLine} />

            <Text style={styles.nextMoveSub}>
              {!isProfileComplete
                ? "เพิ่ม bio หรือช่องทางติดต่ออย่างน้อย 1 รายการ"
                : `เหลืออีก ${categories.length - completed.length} ด้าน`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Quiz Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>ความคืบหน้าของคุณ</Text>
            </View>
            <Text style={styles.fractionText}>
              {completed.length}/{categories.length}
            </Text>
          </View>

          {/* 4 Category List Items (Matching Image 2) */}
          <View style={styles.categoryList}>
            {categories.map((cat) => {
              const theme = categoryTheme[cat.id];
              const isDone = completed.includes(cat.id);

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catItem}
                  activeOpacity={0.8}
                  onPress={() => handleStartQuiz(cat.id)}
                >
                  <View style={styles.catLeftRow}>
                    {/* Number box e.g. 01, 02 */}
                    <View
                      style={[
                        styles.catNumberBox,
                        { backgroundColor: theme.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catNumberText,
                          { color: theme.text },
                        ]}
                      >
                        {theme.number}
                      </Text>
                    </View>

                    <View style={styles.catTextCol}>
                      <View style={styles.catTitleRow}>
                        <Text style={styles.catName}>{cat.name}</Text>
                        {isDone && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.primary}
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </View>
                      <Text style={styles.catDesc} numberOfLines={1}>
                        {cat.description}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Manage Profile Link Button */}
          <TouchableOpacity
            style={styles.manageProfileBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ProfileTab")}
          >
            <View style={styles.manageProfileLeft}>
              <Ionicons name="person-outline" size={16} color={colors.ink} />
              <Text style={styles.manageProfileText}>จัดการโปรไฟล์</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* Top Matches Section */}
        <View style={styles.matchesSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>คนที่น่าจะคลิกกับคุณ</Text>
            </View>
            {matches.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate("ResultsTab")}
              >
                <Text style={styles.seeAllText}>ดูทั้งหมด ({matches.length})</Text>
              </TouchableOpacity>
            )}
          </View>

          {matches.length > 0 ? (
            matches.slice(0, 3).map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                index={index}
                onPress={() =>
                  navigation.navigate("MatchDetail", { userId: match.id })
                }
              />
            ))
          ) : (
            <View style={styles.emptyDashedBox}>
              <Ionicons name="sparkles" size={32} color={colors.primary} />
              <Text style={styles.emptyDashedTitle}>ยังไม่มีแมตช์ให้แสดง</Text>
              <Text style={styles.emptyDashedSub}>
                ตอบคำถามอย่างน้อยหนึ่งด้าน เพื่อเริ่มค้นหาคนที่มีคำตอบคล้ายคุณ
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Daily Campus Dilemma Full Modal */}
      <DailyDilemmaModal
        visible={dilemmaModalVisible}
        onClose={() => setDilemmaModalVisible(false)}
      />

      {/* Bubble User Upgrade Modal (Welcome on first login / Paywall) */}
      <BubbleUpgradeModal
        visible={bubbleModalVisible || (!hasShownWelcome && Boolean(hasAcceptedPolicy))}
        onClose={() => {
          if (!hasShownWelcome) {
            dismissWelcome();
          }
          setBubbleModalVisible(false);
        }}
        mode={!hasShownWelcome && Boolean(hasAcceptedPolicy) ? "welcome" : bubbleModalMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  container: {
    flex: 1,
    backgroundColor: "#fafbfc",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  streakBadgeMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: "#f3f4f6",
  },
  streakBadgeActiveMini: {
    backgroundColor: "#fff7ed",
    borderColor: "#ea580c",
  },
  streakBadgeWarningMini: {
    backgroundColor: "#fefce8",
    borderColor: "#eab308",
  },
  streakFlameIconMini: {
    fontSize: 14,
  },
  streakTextMini: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.mutedForeground,
  },
  streakTextActiveMini: {
    color: "#c2410c",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 6,
  },
  greetingTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: colors.mutedForeground,
    marginTop: 6,
    lineHeight: 22,
  },
  heroActions: {
    marginTop: 16,
  },
  blueBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  blueBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
  nextMoveCard: {
    backgroundColor: "#ff5252",
    borderRadius: 8,
    padding: 20,
    marginBottom: 28,
  },
  dilemmaHeroCard: {
    backgroundColor: "#17171c",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    padding: 20,
    marginBottom: 28,
    ...shadows.neo,
  },
  dilemmaHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dilemmaTagBadge: {
    backgroundColor: "#bbf44a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  dilemmaTagText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: 0.5,
  },
  dilemmaAiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(190, 242, 100, 0.15)",
    borderWidth: 1,
    borderColor: "#bef264",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dilemmaAiBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#bef264",
  },
  dilemmaStreakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dilemmaStreakPillActive: {
    backgroundColor: "#ea580c",
    borderColor: "#f97316",
  },
  dilemmaStreakPillWarning: {
    backgroundColor: "#ca8a04",
    borderColor: "#eab308",
  },
  dilemmaStreakIcon: {
    fontSize: 12,
  },
  dilemmaStreakNumber: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.white,
  },
  dilemmaStreakNumberActive: {
    color: colors.white,
  },
  dilemmaHeadline: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    marginTop: 4,
    lineHeight: 28,
  },
  dilemmaLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 12,
  },
  dilemmaSub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 18,
    marginBottom: 16,
  },
  dilemmaActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dilemmaActionText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 13,
  },
  nextMoveTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextMoveLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: 1,
  },
  nextMoveHeadline: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 12,
    lineHeight: 32,
  },
  nextMoveLine: {
    height: 1,
    backgroundColor: "rgba(23, 23, 28, 0.25)",
    marginVertical: 14,
  },
  nextMoveSub: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  progressSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 2,
  },
  fractionText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    fontFamily: "monospace",
  },
  categoryList: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: "hidden",
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  catLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  catNumberBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  catNumberText: {
    fontWeight: "900",
    fontSize: 13,
  },
  catTextCol: {
    flex: 1,
  },
  catTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  catName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  catDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  manageProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 10,
  },
  manageProfileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageProfileText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  matchesSection: {
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  emptyDashedBox: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
  },
  emptyDashedTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDashedSub: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
});
