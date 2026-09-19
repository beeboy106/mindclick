import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { categories } from "../data/questions";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";

const categoryTheme = {
  lifestyle: { number: "01", bg: "#c7f65a", text: "#17171c" },
  personality: { number: "02", bg: "#3457ff", text: "#ffffff" },
  interaction: { number: "03", bg: "#ff5c5c", text: "#ffffff" },
  social: { number: "04", bg: "#17171c", text: "#ffffff" },
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { quizResponse, profile, getMatchList } = useData();

  const completed = quizResponse.completedCategories || [];
  const matches = getMatchList();

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header onProfilePress={() => navigation.navigate("ProfileTab")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>YOUR MINDCLICK</Text>
          <Text style={styles.greetingTitle}>สวัสดี {firstName}</Text>
          <Text style={styles.greetingSubtitle}>
            ไปต่อจากจุดที่ค้างไว้ แล้วดูว่าคำตอบของคุณพาไปเจอใครบ้าง
          </Text>

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
        </View>

        {/* Next Move Red Card */}
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
          <View style={styles.nextMoveTop}>
            <Text style={styles.nextMoveLabel}>NEXT MOVE</Text>
            <Ionicons name="arrow-forward" size={28} color={colors.ink} />
          </View>

          <Text style={styles.nextMoveHeadline}>
            {!profileReady
              ? "เติมโปรไฟล์ให้คนอื่นรู้จักคุณ"
              : nextCategory
              ? `ตอบ${nextCategory.name}ต่อ`
              : "คุณตอบครบทุกด้านแล้ว"}
          </Text>

          <View style={styles.nextMoveLine} />

          <Text style={styles.nextMoveSub}>
            {!profileReady
              ? "เพิ่ม bio หรือช่องทางติดต่ออย่างน้อย 1 รายการ"
              : nextCategory
              ? `เหลืออีก ${categories.length - completed.length} ด้าน`
              : "อัปเดตคำตอบเมื่อมุมมองของคุณเปลี่ยนไป"}
          </Text>
        </TouchableOpacity>

        {/* Quiz Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>QUIZ PROGRESS</Text>
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
              <Text style={styles.sectionEyebrow}>TOP MATCHES</Text>
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
                ตอบคำถามอย่างน้อยหนึ่งด้าน แล้วระบบจะเริ่มค้นหาคนที่มีคำตอบคล้ายคุณ
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafbfc",
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
