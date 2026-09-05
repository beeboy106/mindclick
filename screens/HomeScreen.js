import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, categoryColors, shadows } from "../lib/theme";
import { categories } from "../data/questions";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { quizResponse, profile, getMatchList } = useData();

  const completed = quizResponse.completedCategories || [];
  const matches = getMatchList();
  const topMatches = matches.slice(0, 2);

  const firstName = user?.name ? user.name.split(" ")[0] : "คุณ";
  const profileReady = Boolean(
    profile?.bio ||
      (profile?.gender && profile.gender !== "prefer_not_to_say") ||
      Object.values(profile?.socialLinks || {}).some(Boolean)
  );

  const nextCategory = categories.find((c) => !completed.includes(c.id));
  const isCompletedAll = completed.length === categories.length;

  const handleStartQuiz = (categoryId = null) => {
    navigation.navigate("Quiz", { categoryId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>YOUR FRIENDQ</Text>
          <Text style={styles.greetingTitle}>สวัสดี {firstName}</Text>
          <Text style={styles.greetingSubtitle}>
            ไปต่อจากจุดที่ค้างไว้ แล้วดูว่าคำตอบของคุณพาไปเจอใครบ้าง
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => handleStartQuiz(nextCategory?.id)}
            >
              <Text style={styles.primaryBtnText}>
                {completed.length > 0 ? "ตอบคำถามต่อ" : "เริ่มตอบคำถาม"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </TouchableOpacity>

            {completed.length > 0 && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("ResultsTab")}
              >
                <Text style={styles.secondaryBtnText}>ดูแมตช์ทั้งหมด</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Next Move Banner */}
        <TouchableOpacity
          style={styles.nextMoveCard}
          activeOpacity={0.9}
          onPress={() => {
            if (!profileReady) {
              navigation.navigate("ProfileTab");
            } else if (!isCompletedAll) {
              handleStartQuiz(nextCategory?.id);
            } else {
              navigation.navigate("ResultsTab");
            }
          }}
        >
          <View style={styles.nextMoveHeader}>
            <Text style={styles.nextMoveEyebrow}>NEXT MOVE</Text>
            <Ionicons name="arrow-forward" size={24} color={colors.ink} />
          </View>
          <Text style={styles.nextMoveTitle}>
            {!profileReady
              ? "เติมโปรไฟล์ให้คนอื่นรู้จักคุณ"
              : nextCategory
              ? `ตอบ${nextCategory.name}ต่อ`
              : "คุณตอบครบทุกด้านแล้ว!"}
          </Text>
          <Text style={styles.nextMoveFooter}>
            {!profileReady
              ? "แตะเพื่อเพิ่ม Bio หรือโซเชียลมีเดีย"
              : nextCategory
              ? `เหลืออีก ${categories.length - completed.length} ด้าน`
              : "ดูผลลัพธ์คนที่เข้ากับคุณได้เลย"}
          </Text>
        </TouchableOpacity>

        {/* Quiz Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>QUIZ PROGRESS</Text>
              <Text style={styles.sectionTitle}>ความคืบหน้าของคุณ</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {completed.length}/{categories.length}
              </Text>
            </View>
          </View>

          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isDone = completed.includes(cat.id);
              const tone = categoryColors[cat.id];

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catCard,
                    isDone ? { borderLeftColor: tone.bg, borderLeftWidth: 6 } : null,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleStartQuiz(cat.id)}
                >
                  <View style={styles.catCardTop}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    {isDone ? (
                      <View style={styles.doneBadge}>
                        <Ionicons name="checkmark" size={14} color={colors.white} />
                        <Text style={styles.doneBadgeText}>ตอบแล้ว</Text>
                      </View>
                    ) : (
                      <Text style={styles.notDoneText}>แตะเพื่อตอบ</Text>
                    )}
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catDesc} numberOfLines={2}>
                    {cat.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Top Matches Preview */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>COMPATIBILITY</Text>
                <Text style={styles.sectionTitle}>แมตช์ที่ตรงกับคุณมากที่สุด</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("ResultsTab")}
              >
                <Text style={styles.seeAllLink}>ดูทั้งหมด ({matches.length})</Text>
              </TouchableOpacity>
            </View>

            {topMatches.length > 0 ? (
              topMatches.map((match, index) => (
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
              <View style={styles.emptyMatchBox}>
                <Text style={styles.emptyMatchText}>
                  ยังไม่มีผู้ใช้อื่นที่ตอบหมวดหมู่เดียวกับคุณ
                </Text>
              </View>
            )}
          </View>
        )}
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 30,
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
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 8,
    ...shadows.neo,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 15,
  },
  nextMoveCard: {
    backgroundColor: colors.coral,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    padding: 18,
    marginBottom: 28,
    ...shadows.neo,
  },
  nextMoveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextMoveEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: 1,
  },
  nextMoveTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 8,
    lineHeight: 28,
  },
  nextMoveFooter: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(23, 23, 28, 0.2)",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    paddingBottom: 10,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.mutedForeground,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBadgeText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 15,
    fontFamily: "monospace",
  },
  categoryGrid: {
    gap: 12,
  },
  catCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 14,
    ...shadows.neo,
  },
  catCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catIcon: {
    fontSize: 22,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  doneBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  notDoneText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  catName: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 4,
  },
  catDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  emptyMatchBox: {
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyMatchText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
});
