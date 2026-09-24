import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useDilemma } from "../context/DilemmaContext";

export default function DailyDilemmaModal({ visible, onClose }) {
  const {
    todayQuestion,
    streakCount,
    streakStatus,
    hasAnsweredToday,
    todayAnswer,
    answerDilemma,
  } = useDilemma();

  const [selectedChoiceId, setSelectedChoiceId] = useState(todayAnswer);

  const currentAnswerId = todayAnswer || selectedChoiceId;
  const isAnswered = hasAnsweredToday || Boolean(selectedChoiceId);

  const selectedChoice = todayQuestion?.choices?.find(
    (c) => c.id === currentAnswerId
  );

  const handleSelectChoice = async (choiceId) => {
    if (isAnswered) return;
    setSelectedChoiceId(choiceId);
    await answerDilemma(choiceId);
  };

  if (!todayQuestion) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={colors.ink} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.mainTitleText}>คำถามประจำวันสะท้อนตัวตน</Text>
          </View>

          {/* Streak Flame Badge */}
          <View
            style={[
              styles.streakBadge,
              streakStatus === "active" && styles.streakBadgeActive,
              streakStatus === "warning" && styles.streakBadgeWarning,
              streakStatus === "extinguished" && styles.streakBadgeExtinguished,
            ]}
          >
            <Ionicons
              name={
                streakStatus === "active"
                  ? "flame"
                  : streakStatus === "warning"
                  ? "warning-outline"
                  : "snow-outline"
              }
              size={16}
              color={
                streakStatus === "active"
                  ? "#ea580c"
                  : streakStatus === "warning"
                  ? "#d97706"
                  : "#64748b"
              }
            />
            <Text
              style={[
                styles.streakText,
                streakStatus === "active" && styles.streakTextActive,
              ]}
            >
              {streakCount} วัน
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Situation Card */}
          <View style={styles.situationCard}>
            <View style={styles.tagRow}>
              <View style={styles.categoryTag}>
                <Ionicons name="school-outline" size={13} color={colors.primary} />
                <Text style={styles.categoryTagText}>{todayQuestion.tag}</Text>
              </View>

              <Text style={styles.dailyMark}>คำถามประจำวันนี้</Text>
            </View>

            <Text style={styles.dilemmaHeadline}>{todayQuestion.title}</Text>
            <View style={styles.dividerLine} />
            <Text style={styles.situationDesc}>{todayQuestion.situation}</Text>
          </View>

          {/* Prompt Message */}
          <Text style={styles.choosePromptText}>
            {isAnswered
              ? "คำตอบที่คุณเลือกและผลสะท้อนตัวตน:"
              : "ถ้าเป็นคุณ คุณจะตัดสินใจอย่างไร? (เลือก 1 ข้อ)"}
          </Text>

          {/* Choices List */}
          <View style={styles.choicesList}>
            {todayQuestion.choices.map((choice) => {
              const isSelected = choice.id === currentAnswerId;

              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceCard,
                    isSelected && styles.choiceCardSelected,
                    isAnswered && !isSelected && styles.choiceCardDimmed,
                  ]}
                  activeOpacity={0.85}
                  disabled={isAnswered}
                  onPress={() => handleSelectChoice(choice.id)}
                >
                  <View style={styles.choiceTopRow}>
                    <View
                      style={[
                        styles.choiceIconBadge,
                        isSelected && styles.choiceIconBadgeSelected,
                      ]}
                    >
                      <Ionicons
                        name={choice.icon || "radio-button-on"}
                        size={18}
                        color={isSelected ? colors.white : colors.primary}
                      />
                    </View>

                    <Text
                      style={[
                        styles.choiceText,
                        isSelected && styles.choiceTextSelected,
                      ]}
                    >
                      {choice.text}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                        style={styles.checkIcon}
                      />
                    )}
                  </View>

                  {/* Social Stats Poll Bar (Visible after answering) */}
                  {isAnswered && (
                    <View style={styles.pollStatsRow}>
                      <View style={styles.pollTrack}>
                        <View
                          style={[
                            styles.pollFill,
                            {
                              width: `${choice.statsPercent}%`,
                              backgroundColor: isSelected
                                ? colors.primary
                                : "#cbd5e1",
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.pollPercentText,
                          isSelected && styles.pollPercentSelected,
                        ]}
                      >
                        {choice.statsPercent}% ของเพื่อนในมหาลัย
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Identity Reflection Result Section */}
          {isAnswered && selectedChoice?.reflection && (
            <View style={styles.reflectionSection}>
              <View style={styles.reflectionCard}>
                <View style={styles.reflectionHeader}>
                  <View style={styles.sparkleIconBox}>
                    <Ionicons name="sparkles" size={18} color="#bbf44a" />
                  </View>
                  <Text style={styles.reflectionHeaderTitle}>
                    บทวิเคราะห์ตัวตน
                  </Text>
                </View>

                <Text style={styles.traitHeadline}>
                  "{selectedChoice.reflection.trait}"
                </Text>

                <Text style={styles.traitDesc}>
                  {selectedChoice.reflection.description}
                </Text>
              </View>

              {/* Streak Flame Celebration Box */}
              <View style={styles.streakCelebrationBox}>
                <Ionicons name="flame" size={32} color="#ea580c" />
                <View style={styles.streakCelebrationTextCol}>
                  <Text style={styles.streakCelebrationTitle}>
                    รักษาสตรีคไฟสำเร็จ! ({streakCount} วันติดต่อกัน)
                  </Text>
                  <Text style={styles.streakCelebrationSub}>
                    คุณได้รู้จักตัวตนลึกซึ้งขึ้นอีกขั้น กลับมาตอบสถานการณ์ใหม่ในวันพรุ่งนี้นะ!
                  </Text>
                </View>
              </View>

              {/* Done Button */}
              <TouchableOpacity
                style={styles.doneBtn}
                activeOpacity={0.85}
                onPress={onClose}
              >
                <Text style={styles.doneBtnText}>กลับสู่หน้าแรก</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    backgroundColor: colors.card,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleBox: {
    alignItems: "center",
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  mainTitleText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  streakBadgeActive: {
    backgroundColor: "#fff7ed",
    borderColor: "#f97316",
  },
  streakBadgeWarning: {
    backgroundColor: "#fefce8",
    borderColor: "#eab308",
  },
  streakBadgeExtinguished: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  streakFlameIcon: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.mutedForeground,
  },
  streakTextActive: {
    color: "#ea580c",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fafbfc",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  situationCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 18,
    marginBottom: 20,
    ...shadows.neo,
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  dailyMark: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  dilemmaHeadline: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    lineHeight: 26,
    marginBottom: 10,
  },
  dividerLine: {
    height: 3,
    width: 36,
    backgroundColor: "#bbf44a",
    marginBottom: 12,
  },
  situationDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
    fontWeight: "500",
  },
  choosePromptText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 12,
  },
  choicesList: {
    gap: 12,
    marginBottom: 20,
  },
  choiceCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    padding: 14,
  },
  choiceCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#f5f7ff",
    ...shadows.neo,
  },
  choiceCardDimmed: {
    opacity: 0.75,
  },
  choiceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  choiceIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  choiceIconBadgeSelected: {
    backgroundColor: colors.primary,
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    fontWeight: "700",
    lineHeight: 20,
  },
  choiceTextSelected: {
    color: colors.primary,
    fontWeight: "800",
  },
  checkIcon: {
    marginLeft: 4,
  },
  pollStatsRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  pollTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  pollFill: {
    height: "100%",
    borderRadius: 3,
  },
  pollPercentText: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  pollPercentSelected: {
    color: colors.primary,
    fontWeight: "800",
  },
  reflectionSection: {
    gap: 14,
    marginTop: 4,
  },
  reflectionCard: {
    backgroundColor: "#17171c",
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    ...shadows.neo,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sparkleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(187, 244, 74, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  reflectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#bbf44a",
    letterSpacing: 1,
  },
  traitHeadline: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.white,
    marginBottom: 8,
    lineHeight: 22,
  },
  traitDesc: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
  },
  streakCelebrationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ea580c",
    padding: 14,
    gap: 12,
  },
  flameBigIcon: {
    fontSize: 32,
  },
  streakCelebrationTextCol: {
    flex: 1,
  },
  streakCelebrationTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#9a3412",
    marginBottom: 2,
  },
  streakCelebrationSub: {
    fontSize: 12,
    color: "#c2410c",
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    ...shadows.neo,
  },
  doneBtnText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 15,
  },
});
