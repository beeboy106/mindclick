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
import { colors, categoryColors } from "../lib/theme";
import { categories } from "../data/questions";
import { useData } from "../context/DataContext";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";

export default function ResultsScreen({ navigation }) {
  const { quizResponse, getMatchList } = useData();

  const completed = quizResponse.completedCategories || [];
  const matches = getMatchList();

  const handleOpenQuiz = () => {
    navigation.navigate("Quiz");
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
        {/* Page Header */}
        <View style={styles.headerSection}>
          <Text style={styles.eyebrow}>COMPATIBILITY RESULTS</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>แมตช์ของคุณ</Text>
            <TouchableOpacity
              style={styles.quizBtn}
              onPress={handleOpenQuiz}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={colors.ink} />
              <Text style={styles.quizBtnText}>
                {completed.length < categories.length
                  ? `ตอบเพิ่ม (${categories.length - completed.length})`
                  : "ทบทวนคำตอบ"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {matches.length > 0
              ? `พบ ${matches.length} คนจากคำตอบ ${completed.length} ด้าน`
              : "ยังไม่มีคนอื่นที่ตอบในด้านเดียวกับคุณ"}
          </Text>

          {/* Completed Category Tags */}
          <View style={styles.tagsContainer}>
            {completed.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              if (!cat) return null;
              const tone = categoryColors[cat.id];

              return (
                <View
                  key={cat.id}
                  style={[
                    styles.catBadge,
                    { borderLeftColor: tone.bg, borderLeftWidth: 4 },
                  ]}
                >
                  <Text style={styles.catBadgeText}>{cat.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Matches List or Empty State */}
        {matches.length > 0 ? (
          <View style={styles.matchesList}>
            {matches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                index={index}
                onPress={() =>
                  navigation.navigate("MatchDetail", { userId: match.id })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>คุณมาถึงก่อนใคร</Text>
            <Text style={styles.emptySubtitle}>
              {completed.length === 0
                ? "คุณยังไม่ได้ทำแบบทดสอบ เริ่มตอบคำถามเพื่อดูรายชื่อคนที่เข้ากันได้"
                : "เมื่อมีคนตอบคำถามด้านเดียวกับคุณ รายชื่อและเปอร์เซ็นต์ความเข้ากันได้จะปรากฏที่นี่"}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              activeOpacity={0.85}
              onPress={handleOpenQuiz}
            >
              <Ionicons name="sparkles" size={16} color={colors.white} />
              <Text style={styles.emptyActionBtnText}>
                {completed.length === 0 ? "เริ่มทำแบบทดสอบ" : "ตอบคำถามด้านอื่นเพิ่ม"}
              </Text>
            </TouchableOpacity>
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
  headerSection: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    paddingBottom: 16,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
  },
  quizBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  quizBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  catBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  matchesList: {
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.darkBorder,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActionBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 8,
  },
  emptyActionBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
});
