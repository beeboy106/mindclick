import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { usePremium } from "../context/PremiumContext";

// แพ็กเกจราคานักศึกษา
const PLANS = [
  {
    id: "monthly",
    title: "1 เดือน",
    price: "79 บาท",
    subtext: "79 บาท / เดือน",
    tag: null,
    isPopular: false,
  },
  {
    id: "semester",
    title: "1 ภาคเรียน (4 เดือน)",
    price: "199 บาท",
    subtext: "ประหยัด 37% (~50 บาท/เดือน)",
    tag: "แนะนำสำหรับนักศึกษา",
    isPopular: true,
  },
  {
    id: "annual",
    title: "1 ปี (12 เดือน)",
    price: "499 บาท",
    subtext: "ประหยัด 47% (~41 บาท/เดือน)",
    tag: "คุ้มค่าสูงสุด",
    isPopular: false,
  },
];

// 3 สิทธิประโยชน์หลักของผู้ใช้ฟองสบู่ (Zero Emoji Policy)
const BUBBLE_PERKS = [
  {
    icon: "eye-outline",
    color: "#FFE600",
    title: "ดูประวัติคนส่องโปรไฟล์พร้อม Mind-Insight",
    desc: "เห็นชื่อ รูป คณะ และจุดร่วมความคิดที่ตอบตรงกัน พร้อมโหมดซ่อนตัวเพื่อแอบดูได้แบบไร้ร่องรอย",
  },
  {
    icon: "planet-outline",
    color: "#67E8F9",
    title: "ปลดล็อกโหมด Cross-Bubble",
    desc: "ทะลุขอบเขตคอมมูนิตี้เดิม เข้าสู่ห้องสังสรรค์ลับเวลา 19:00 และค้นหาเพื่อนต่างคณะ",
  },
  {
    icon: "chatbubble-ellipses-outline",
    color: "#86EFAC",
    title: "โพสต์บนฟีดได้ไม่จำกัด",
    desc: "แชร์ความคิด แนะนำหนัง หรือชวนเล่นบอร์ดเกมได้ตลอดทั้งวัน (ผู้ใช้ทั่วไปจำกัด 2 ครั้ง/วัน)",
  },
];

export default function BubbleUpgradeModal({
  visible,
  onClose,
  mode = "paywall", // 'welcome' | 'warning' | 'paywall'
  featureReason = "", // 'crossbubble' | 'post_limit' | 'profile_views' | ''
}) {
  const { upgradeToBubble, dismissWelcome, daysRemaining } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState("semester");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!visible) return null;

  const handleSimulatePurchase = async () => {
    setIsProcessing(true);
    try {
      await upgradeToBubble(selectedPlan);
      Alert.alert(
        "ยินดีต้อนรับสู่ผู้ใช้ฟองสบู่",
        "คุณได้ปลดล็อกสิทธิ์ผู้ใช้ฟองสบู่เรียบร้อยแล้ว สามารถเข้าถึงโหมด CrossBubble, ดูคนส่องโปรไฟล์ และโพสต์ได้ไม่จำกัดทันที",
        [{ text: "ตกลง", onPress: onClose }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดำเนินการชำระเงินจำลองได้");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartTrial = async () => {
    await dismissWelcome();
    onClose();
  };

  // กำหนดข้อความส่วนหัวตามโหมด
  const getHeaderInfo = () => {
    if (mode === "welcome") {
      return {
        badge: "สิทธิ์พิเศษสำหรับสมาชิกใหม่",
        title: "ยินดีต้อนรับสู่ Mindclick",
        subtitle: "คุณได้รับสิทธิ์ทดลองเป็น 'ผู้ใช้ฟองสบู่' เต็มรูปแบบฟรี 7 วัน พร้อมใช้งานทุกฟีเจอร์พรีเมียม",
        accentColor: "#bbf44a",
      };
    }
    if (mode === "warning") {
      return {
        badge: "แจ้งเตือนสิทธิ์การใช้งาน",
        title: "สิทธิ์ทดลองใช้ใกล้สิ้นสุด",
        subtitle: `เหลือเวลาอีก ${daysRemaining} วัน สำหรับสิทธิ์ผู้ใช้ฟองสบู่ อัปเกรดตอนนี้เพื่อใช้งานทุกฟีเจอร์ได้อย่างต่อเนื่อง`,
        accentColor: colors.coral,
      };
    }

    // mode === 'paywall'
    let reasonText = "สิทธิพิเศษสำหรับผู้ใช้ฟองสบู่ เพื่อประสบการณ์การค้นหาเพื่อนที่ไร้ขีดจำกัด";
    if (featureReason === "crossbubble") {
      reasonText = "โหมด CrossBubble และห้องสังสรรค์ลับ เป็นฟีเจอร์เฉพาะสำหรับผู้ใช้ฟองสบู่";
    } else if (featureReason === "post_limit") {
      reasonText = "คุณใช้โควต้าโพสต์ครบ 2 ครั้งของวันนี้แล้ว อัปเกรดเพื่อโพสต์ได้ไม่จำกัด";
    } else if (featureReason === "profile_views") {
      reasonText = "การดูประวัติผู้เข้าชมและบทวิเคราะห์ Mind-Insight เฉพาะผู้ใช้ฟองสบู่";
    }

    return {
      badge: "ฟีเจอร์เฉพาะผู้ใช้ฟองสบู่",
      title: "ปลดล็อกสิทธิ์ 'ผู้ใช้ฟองสบู่'",
      subtitle: reasonText,
      accentColor: colors.primary,
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={colors.ink} />
          </TouchableOpacity>
          <View style={[styles.headerBadge, { backgroundColor: headerInfo.accentColor }]}>
            <Text style={styles.headerBadgeText}>{headerInfo.badge}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconBox}>
              <Ionicons name="planet" size={32} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>{headerInfo.title}</Text>
            <Text style={styles.heroSubtitle}>{headerInfo.subtitle}</Text>
          </View>

          {/* Perks List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สิทธิประโยชน์ของผู้ใช้ฟองสบู่</Text>
            <View style={styles.perksList}>
              {BUBBLE_PERKS.map((perk, idx) => (
                <View key={idx} style={styles.perkCard}>
                  <View style={[styles.perkIconBox, { backgroundColor: perk.color }]}>
                    <Ionicons name={perk.icon} size={22} color={colors.ink} />
                  </View>
                  <View style={styles.perkContent}>
                    <Text style={styles.perkTitle}>{perk.title}</Text>
                    <Text style={styles.perkDesc}>{perk.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Action Area based on Mode */}
          {mode === "welcome" ? (
            <View style={styles.welcomeActionBox}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.88}
                onPress={handleStartTrial}
              >
                <Text style={styles.primaryActionText}>เริ่มทดลองใช้ฟรี 7 วัน</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.ink} />
              </TouchableOpacity>
              <Text style={styles.subActionNote}>
                ไม่ต้องผูกบัตรเครดิต เริ่มต้นทดลองใช้ได้ทันที
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>เลือกแพ็กเกจราคานักศึกษา</Text>
              <View style={styles.plansContainer}>
                {PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedPlan(plan.id)}
                    >
                      {plan.tag && (
                        <View style={styles.planTag}>
                          <Text style={styles.planTagText}>{plan.tag}</Text>
                        </View>
                      )}
                      <View style={styles.planTopRow}>
                        <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                          {plan.title}
                        </Text>
                        <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                          {plan.price}
                        </Text>
                      </View>
                      <Text style={styles.planSubtext}>{plan.subtext}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  isProcessing && { opacity: 0.6 },
                ]}
                activeOpacity={0.88}
                onPress={handleSimulatePurchase}
                disabled={isProcessing}
              >
                <Text style={styles.primaryActionText}>
                  {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันการสมัคร (จำลอง)"}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color={colors.ink} />
              </TouchableOpacity>

              {mode === "warning" && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={onClose}
                >
                  <Text style={styles.secondaryButtonText}>
                    ใช้งานต่อในระยะเวลาที่เหลือ
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    backgroundColor: "#ffffff",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    ...shadows.box,
  },
  heroIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 12,
  },
  perksList: {
    gap: 12,
  },
  perkCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 14,
    ...shadows.card,
  },
  perkIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  perkContent: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },
  perkDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 17,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 18,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 16,
    position: "relative",
  },
  planCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#f5f7ff",
    ...shadows.card,
  },
  planTag: {
    position: "absolute",
    top: -10,
    right: 14,
    backgroundColor: "#bbf44a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  planTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.ink,
  },
  planTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  planTitleSelected: {
    color: colors.primary,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  planPriceSelected: {
    color: colors.primary,
  },
  planSubtext: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  primaryActionButton: {
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    ...shadows.box,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  subActionNote: {
    textAlign: "center",
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 10,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  welcomeActionBox: {
    marginTop: 8,
  },
});
