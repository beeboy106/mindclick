import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, categoryColors, shadows } from "../lib/theme";
import { categories, answerOptions, shuffleArray } from "../data/questions";
import { useData } from "../context/DataContext";

export default function QuizScreen({ route, navigation }) {
  const { categoryId: initialCategoryId } = route.params || {};
  const { quizResponse, saveCategoryAnswers, isProfileComplete } = useData();

  const completedCategories = quizResponse.completedCategories || [];

  const [step, setStep] = useState("select-category"); // "select-category" | "answering" | "complete"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // หากข้อมูลโปรไฟล์ยังไม่ครบถ้วน จะเด้งไปหน้าโปรไฟล์ให้ทันที
  useEffect(() => {
    if (!isProfileComplete) {
      navigation.replace("Main", { screen: "ProfileTab" });
    }
  }, [isProfileComplete, navigation]);

  // เริ่มต้นหมวดหมู่หากส่ง param มา (เฉพาะเมื่อโปรไฟล์สมบูรณ์แล้ว)
  useEffect(() => {
    if (!isProfileComplete) return;
    if (initialCategoryId) {
      startCategoryQuiz(initialCategoryId);
    }
  }, [initialCategoryId, isProfileComplete]);

  const startCategoryQuiz = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    setSelectedCategory(cat);
    const shuffled = shuffleArray(cat.questions);
    setQuestions(shuffled);
    setAnswers(Array(10).fill(null));
    setCurrentIndex(0);
    setStep("answering");
  };

  const handleSelectAnswer = async (value) => {
    if (isSaving || isTransitioning) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
    setIsTransitioning(true);

    setTimeout(async () => {
      // เลื่อนไปข้อถัดไป หรือ บันทึกเมื่อถึงข้อสุดท้าย
      if (currentIndex < 9) {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      } else {
        // ครบ 10 ข้อแล้ว บันทึกข้อมูล
        setIsSaving(true);
        const questionOrder = questions.map((q) => q.id);
        await saveCategoryAnswers(selectedCategory.id, newAnswers, questionOrder);
        setIsSaving(false);
        setIsTransitioning(false);
        setStep("complete");
      }
    }, 180);
  };

  const handleBack = () => {
    if (step === "answering") {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        setStep("select-category");
      }
    } else {
      navigation.goBack();
    }
  };

  const currentCatTone = selectedCategory
    ? categoryColors[selectedCategory.id]
    : { bg: colors.primary, text: colors.white };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>
          {step === "answering"
            ? selectedCategory?.name
            : step === "complete"
            ? "ทำแบบทดสอบสำเร็จ"
            : "เลือกหมวดหมู่คำถาม"}
        </Text>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={22} color={colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar (during answering) */}
      {step === "answering" && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${((currentIndex + 1) / 10) * 100}%`,
                backgroundColor: currentCatTone.bg,
              },
            ]}
          />
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: Select Category */}
        {step === "select-category" && (
          <View>
            <Text style={styles.pageTitle}>เลือกด้านที่คุณต้องการตอบ</Text>
            <Text style={styles.pageSubtitle}>
              แต่ละด้านมี 10 คำถามเพื่อวัดระดับความเข้ากันได้
            </Text>

            <View style={styles.categoriesList}>
              {categories.map((cat) => {
                const isCompleted = completedCategories.includes(cat.id);
                const tone = categoryColors[cat.id];

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChoiceCard,
                      isCompleted && { borderLeftColor: tone.bg, borderLeftWidth: 6 },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => startCategoryQuiz(cat.id)}
                  >
                    <View style={styles.choiceHeader}>
                      <View style={[styles.choiceIconBadge, { backgroundColor: tone.bg }]}>
                        <Ionicons name={cat.icon} size={20} color={tone.text} />
                      </View>
                      {isCompleted ? (
                        <View style={styles.completedTag}>
                          <Ionicons name="checkmark" size={14} color={colors.white} />
                          <Text style={styles.completedTagText}>ตอบแล้ว</Text>
                        </View>
                      ) : (
                        <View style={styles.startTag}>
                          <Text style={styles.startTagText}>เริ่มตอบ</Text>
                          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
                        </View>
                      )}
                    </View>

                    <Text style={styles.choiceName}>{cat.name}</Text>
                    <Text style={styles.choiceDesc}>{cat.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {completedCategories.length > 0 && (
              <View style={styles.viewResultsFooter}>
                <Text style={styles.viewResultsCountText}>
                  ตอบแล้ว{" "}
                  <Text style={styles.viewResultsCountBold}>
                    {completedCategories.length}
                  </Text>{" "}
                  จาก 4 ด้าน
                </Text>
                <TouchableOpacity
                  style={styles.viewResultsBtn}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("Main", { screen: "ResultsTab" })
                  }
                >
                  <Text style={styles.viewResultsBtnText}>ดูผลการจับคู่</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: Answering questions */}
        {step === "answering" && questions.length > 0 && (
          <View style={styles.quizWrapper}>
            <View style={styles.questionMetaRow}>
              <Text style={styles.questionCounter}>
                คำถามข้อที่ {String(currentIndex + 1).padStart(2, "0")}/10
              </Text>
              <View
                style={[
                  styles.catMiniBadge,
                  { backgroundColor: currentCatTone.bg },
                ]}
              >
                <Ionicons
                  name={selectedCategory?.icon}
                  size={12}
                  color={currentCatTone.text}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.catMiniBadgeText,
                    { color: currentCatTone.text },
                  ]}
                >
                  {selectedCategory?.name?.replace("ด้าน", "") || selectedCategory?.name}
                </Text>
              </View>
            </View>

            {/* Question Card */}
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>
                "{questions[currentIndex]?.question}"
              </Text>
            </View>

            {/* Answer Options */}
            <View style={styles.answersContainer}>
              {[...answerOptions].reverse().map((opt, optIndex) => {
                const isSelected = answers[currentIndex] === opt.value;
                const letter = String.fromCharCode(65 + optIndex);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    disabled={isSaving || isTransitioning}
                    style={[
                      styles.answerBtn,
                      isSelected ? styles.answerBtnSelected : null,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectAnswer(opt.value)}
                  >
                    <View
                      style={[
                        styles.letterBox,
                        isSelected && styles.letterBoxSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.letterText,
                          isSelected && styles.letterTextSelected,
                        ]}
                      >
                        {letter}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.answerLabel,
                        isSelected ? styles.answerLabelSelected : null,
                      ]}
                    >
                      {opt.label}
                    </Text>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Navigation Bottom Controls */}
            <View style={styles.navRow}>
              {currentIndex > 0 ? (
                <TouchableOpacity
                  style={styles.navBtn}
                  disabled={isSaving || isTransitioning}
                  onPress={() => setCurrentIndex(currentIndex - 1)}
                >
                  <Ionicons name="arrow-back" size={16} color={colors.ink} />
                  <Text style={styles.navBtnText}>ข้อก่อนหน้า</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
            </View>
          </View>
        )}

        {/* STEP 3: Category Complete */}
        {step === "complete" && (() => {
          const remaining = categories.filter(
            (c) => !completedCategories.includes(c.id)
          );
          return (
            <View style={styles.completeWrapper}>
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-sharp" size={44} color={colors.white} />
              </View>
              <Text style={styles.completeTitle}>
                ตอบ{selectedCategory?.name}ครบแล้ว
              </Text>
              <Text style={styles.completeSubtitle}>
                ตอนนี้คุณตอบแล้ว {completedCategories.length} ด้าน
                {remaining.length > 0
                  ? ` และเหลืออีก ${remaining.length} ด้าน`
                  : " และครบทุกด้านแล้ว"}
              </Text>

              <View style={styles.completedPillsContainer}>
                {completedCategories.map((catId) => {
                  const catItem = categories.find((c) => c.id === catId);
                  const tone = categoryColors[catId];
                  return (
                    <View key={catId} style={styles.completedPill}>
                      <View
                        style={[
                          styles.completedPillDot,
                          { backgroundColor: tone ? tone.bg : colors.primary },
                        ]}
                      />
                      <Text style={styles.completedPillText}>
                        {catItem?.name || catId}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.completeActions}>
                {remaining.length > 0 && (
                  <TouchableOpacity
                    style={styles.completeSecondaryBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedCategory(null);
                      setStep("select-category");
                    }}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color={colors.ink}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.completeSecondaryBtnText}>
                      เลือกด้านอื่น
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.completePrimaryBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    navigation.navigate("Main", { screen: "ResultsTab" });
                  }}
                >
                  <Text style={styles.completePrimaryBtnText}>
                    ดูผลการจับคู่
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  topBar: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.border,
  },
  progressBarFill: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 20,
    lineHeight: 20,
  },
  categoriesList: {
    gap: 14,
  },
  categoryChoiceCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 16,
    ...shadows.neo,
  },
  choiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  choiceIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  completedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  completedTagText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  startTag: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  startTagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  choiceName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 4,
  },
  choiceDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  viewResultsFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewResultsCountText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  viewResultsCountBold: {
    fontWeight: "900",
    color: colors.ink,
  },
  viewResultsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    ...shadows.neo,
  },
  viewResultsBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  quizWrapper: {
    paddingTop: 10,
  },
  questionMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  questionCounter: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.mutedForeground,
  },
  catMiniBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  catMiniBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  questionCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    padding: 24,
    minHeight: 140,
    justifyContent: "center",
    marginBottom: 24,
    ...shadows.neo,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 30,
    textAlign: "center",
  },
  answersContainer: {
    gap: 12,
    marginBottom: 20,
  },
  answerBtn: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    ...shadows.neo,
  },
  answerBtnSelected: {
    borderColor: colors.primary,
    borderWidth: 2.5,
    backgroundColor: "#f0f3ff",
  },
  letterBox: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: colors.card,
  },
  letterBoxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  letterText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.mutedForeground,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  letterTextSelected: {
    color: colors.white,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    flex: 1,
  },
  answerLabelSelected: {
    color: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.mutedForeground,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  completeWrapper: {
    alignItems: "center",
    paddingTop: 30,
  },
  completeBadge: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    marginBottom: 20,
    ...shadows.neo,
  },
  completeTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 8,
    textAlign: "center",
  },
  completeSubtitle: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  completedPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 28,
  },
  completedPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: colors.card,
  },
  completedPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  completedPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  completeActions: {
    width: "100%",
    gap: 12,
  },
  completePrimaryBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 8,
    ...shadows.neo,
  },
  completePrimaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  completeSecondaryBtn: {
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  completeSecondaryBtnText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
});
