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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
    badgeBg: "#f1f5f9",
  },
  {
    id: "semester",
    title: "1 ภาคเรียน (4 เดือน)",
    price: "199 บาท",
    subtext: "เฉลี่ย ~50 บาท / เดือน (ประหยัด 37%)",
    tag: "แนะนำสำหรับนักศึกษา",
    isPopular: true,
    badgeBg: "#bbf44a",
  },
  {
    id: "annual",
    title: "1 ปีการศึกษา (12 เดือน)",
    price: "499 บาท",
    subtext: "เฉลี่ย ~41 บาท / เดือน (ประหยัด 47%)",
    tag: "คุ้มค่าสูงสุด",
    isPopular: false,
    badgeBg: "#67e8f9",
  },
];

// ตารางเปรียบเทียบสิทธิประโยชน์ (ผู้ใช้ทั่วไป vs ผู้ใช้ฟองสบู่)
const PERK_COMPARISON = [
  {
    title: "ดูประวัติคนมาส่องโปรไฟล์ 30 วัน",
    free: "เซนเซอร์รูปและชื่อ",
    bubble: "เห็นรูป คณะ และ Mind-Insight ครบ",
    icon: "eye-outline",
  },
  {
    title: "โหมดสังสรรค์ลับ Cross-Bubble",
    free: "ไม่สามารถเข้าได้",
    bubble: "สุ่มกลุ่ม 5 คนทุกวันเวลา 19:00 น.",
    icon: "planet-outline",
  },
  {
    title: "การแชร์เรื่องราวและโพสต์บนฟีด",
    free: "จำกัด 2 โพสต์ / วัน",
    bubble: "โพสต์ได้ไม่จำกัดตลอดทั้งวัน",
    icon: "chatbubble-ellipses-outline",
  },
  {
    title: "กรอบและสัญลักษณ์ฟองสบู่พิเศษ",
    free: "ไม่มีสัญลักษณ์",
    bubble: "แสดงกรอบสีฟ้าและไอคอนฟองสบู่",
    icon: "shield-checkmark-outline",
  },
  {
    title: "โหมดซ่อนตัว (Incognito Mode)",
    free: "ไม่รองรับ",
    bubble: "ส่องโปรไฟล์ผู้อื่นได้แบบไร้ร่องรอย",
    icon: "glasses-outline",
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

  // กำหนดเนื้อหาและการนำเสนอตามโหมด
  const getModeConfig = () => {
    if (mode === "welcome") {
      return {
        badgeText: "สิทธิ์พิเศษสำหรับสมาชิกใหม่",
        badgeBg: "#bbf44a",
        badgeColor: colors.ink,
        badgeIcon: "sparkles",
        headline: "ยินดีต้อนรับสู่ Mindclick",
        subheadline: "คุณได้รับสิทธิ์ทดลองเป็น 'ผู้ใช้ฟองสบู่' ฟรี 7 วันแรก พร้อมใช้งานทุกฟังก์ชันระดับพรีเมียมได้ทันที",
        heroBg: "#f0fdf4",
        heroBorder: "#86efac",
        heroIcon: "gift-outline",
        heroIconColor: "#059669",
        heroIconBg: "#dcfce7",
      };
    }

    if (mode === "warning") {
      return {
        badgeText: `เหลือเวลาอีก ${daysRemaining} วันสุดท้าย`,
        badgeBg: "#fed7aa",
        badgeColor: "#9a3412",
        badgeIcon: "hourglass-outline",
        headline: "สิทธิ์ทดลองใช้ใกล้สิ้นสุด",
        subheadline: `สิทธิ์ผู้ใช้ฟองสบู่ของคุณจะหมดอายุในอีก ${daysRemaining} วัน อัปเกรดวันนี้เพื่อใช้งานห้องสังสรรค์ ส่องประวัติโปรไฟล์ และโพสต์ฟีดต่อเนื่องแบบไม่สะดุด`,
        heroBg: "#fff7ed",
        heroBorder: "#fb923c",
        heroIcon: "time-outline",
        heroIconColor: "#ea580c",
        heroIconBg: "#ffedd5",
      };
    }

    // mode === 'paywall'
    let reasonTitle = "ปลดล็อกสิทธิ์ 'ผู้ใช้ฟองสบู่'";
    let reasonText = "อัปเกรดเพื่อประสบการณ์การเชื่อมต่อเพื่อนใหม่ที่ไร้ขีดจำกัด";
    let iconName = "planet-outline";

    if (featureReason === "crossbubble") {
      reasonTitle = "ห้องสังสรรค์ลับ CrossBubble";
      reasonText = "สุ่มเพื่อน 5 คนทุกวันเวลา 19:00 น. พร้อมหัวข้อพูดคุยลับและภารกิจพิเศษ (เฉพาะผู้ใช้ฟองสบู่)";
      iconName = "planet";
    } else if (featureReason === "post_limit") {
      reasonTitle = "โพสต์บนฟีดได้ไม่จำกัด";
      reasonText = "คุณใช้โควต้าโพสต์ครบ 2 ครั้งของวันนี้แล้ว อัปเกรดเพื่อแชร์เรื่องราว แนะนำหนัง และชวนคุยได้ไม่จำกัด";
      iconName = "chatbubbles";
    } else if (featureReason === "profile_views") {
      reasonTitle = "ดูประวัติคนมาส่องโปรไฟล์ 30 วัน";
      reasonText = "เปิดเผยชื่อจริง ภาพชัด คณะ และบทวิเคราะห์ Mind-Insight ของทุกคนที่แวะมาดูคุณ";
      iconName = "eye";
    }

    return {
      badgeText: "ฟีเจอร์เฉพาะผู้ใช้ฟองสบู่",
      badgeBg: "#e0f2fe",
      badgeColor: "#0369a1",
      badgeIcon: "lock-open-outline",
      headline: reasonTitle,
      subheadline: reasonText,
      heroBg: "#f0f9ff",
      heroBorder: "#38bdf8",
      heroIcon: iconName,
      heroIconColor: colors.primary,
      heroIconBg: "#e0e7ff",
    };
  };

  const config = getModeConfig();

  if (mode === "welcome") {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleStartTrial}
      >
        <View style={styles.welcomeOverlay}>
          <TouchableOpacity
            style={styles.welcomeBackdropTouch}
            activeOpacity={1}
            onPress={handleStartTrial}
          />
          <View style={styles.welcomeCard}>
            {/* Top Close Button */}
            <TouchableOpacity
              style={styles.welcomeCloseBtn}
              onPress={handleStartTrial}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>

            {/* Header Badge */}
            <View style={styles.welcomeBadge}>
              <Ionicons name="sparkles" size={13} color="#15803d" style={{ marginRight: 5 }} />
              <Text style={styles.welcomeBadgeText}>แจ้งสิทธิ์พิเศษสำหรับคุณ</Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.welcomeTitle}>คุณได้รับสิทธิ์ผู้ใช้ฟองสบู่ฟรี 7 วัน</Text>
            <Text style={styles.welcomeSubtitle}>
              เพื่อต้อนรับสู่ Mindclick คุณได้รับสิทธิ์ใช้งานฟังก์ชันพิเศษฟรี 7 วันแรกเรียบร้อยแล้ว โดยทุกคนจะได้รับสิทธิ์นี้ทันทีโดยไม่ต้องกดรับหรือผูกบัตรใดๆ
            </Text>

            {/* Perks List */}
            <View style={styles.welcomePerksList}>
              <View style={styles.welcomePerkItem}>
                <View style={styles.welcomePerkIcon}>
                  <Ionicons name="planet" size={18} color="#0284c7" />
                </View>
                <View style={styles.welcomePerkTextCol}>
                  <Text style={styles.welcomePerkTitle}>ห้องสังสรรค์ลับและห้องมืด (Cross-Bubble)</Text>
                  <Text style={styles.welcomePerkDesc}>สุ่มคุยกลุ่ม 5 คนทุก 19:00 น. แลกเปลี่ยนมุมมองต่างคณะ</Text>
                </View>
              </View>

              <View style={styles.welcomePerkItem}>
                <View style={styles.welcomePerkIcon}>
                  <Ionicons name="eye" size={18} color="#0284c7" />
                </View>
                <View style={styles.welcomePerkTextCol}>
                  <Text style={styles.welcomePerkTitle}>ดูคนมาส่องโปรไฟล์ 30 วัน</Text>
                  <Text style={styles.welcomePerkDesc}>เห็นชื่อจริง ภาพชัด และจุดที่ตอบตรงกัน</Text>
                </View>
              </View>

              <View style={styles.welcomePerkItem}>
                <View style={styles.welcomePerkIcon}>
                  <Ionicons name="chatbubbles" size={18} color="#0284c7" />
                </View>
                <View style={styles.welcomePerkTextCol}>
                  <Text style={styles.welcomePerkTitle}>โพสต์เรื่องราวบนฟีดได้ไม่จำกัด</Text>
                  <Text style={styles.welcomePerkDesc}>แชร์เรื่องราว รีวิวหนัง และคุยได้ไม่จำกัดโควต้า</Text>
                </View>
              </View>
            </View>

            {/* Status Pill */}
            <View style={styles.welcomeStatusBox}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.welcomeStatusText}>สถานะ: เปิดใช้งานแล้ว (เหลือเวลา 7 วัน)</Text>
            </View>

            {/* Confirm CTA Button */}
            <TouchableOpacity
              style={styles.welcomeActionBtn}
              activeOpacity={0.88}
              onPress={handleStartTrial}
            >
              <Text style={styles.welcomeActionBtnText}>รับทราบและเริ่มใช้งาน</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.ink} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={22} color={colors.ink} />
          </TouchableOpacity>

          <View style={[styles.headerPill, { backgroundColor: config.badgeBg }]}>
            <Ionicons
              name={config.badgeIcon}
              size={13}
              color={config.badgeColor}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.headerPillText, { color: config.badgeColor }]}>
              {config.badgeText}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner Card */}
          <View style={[styles.heroCard, { backgroundColor: config.heroBg, borderColor: config.heroBorder }]}>
            <View style={[styles.heroIconBox, { backgroundColor: config.heroIconBg }]}>
              <Ionicons name={config.heroIcon} size={30} color={config.heroIconColor} />
            </View>
            <Text style={styles.heroTitle}>{config.headline}</Text>
            <Text style={styles.heroSubtitle}>{config.subheadline}</Text>

            {/* Mode-Specific Interactive Elements */}
            {mode === "welcome" && (
              <View style={styles.trialRoadmap}>
                <View style={styles.roadmapStep}>
                  <View style={styles.roadmapDotActive}>
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  </View>
                  <Text style={styles.roadmapStepTitle}>วันที่ 1</Text>
                  <Text style={styles.roadmapStepSub}>ปลดล็อกครบ</Text>
                </View>

                <View style={styles.roadmapLineActive} />

                <View style={styles.roadmapStep}>
                  <View style={styles.roadmapDotWarning}>
                    <Ionicons name="time-outline" size={12} color={colors.white} />
                  </View>
                  <Text style={styles.roadmapStepTitle}>วันที่ 5</Text>
                  <Text style={styles.roadmapStepSub}>เตือน 3 วันท้าย</Text>
                </View>

                <View style={styles.roadmapLine} />

                <View style={styles.roadmapStep}>
                  <View style={styles.roadmapDot}>
                    <Ionicons name="gift-outline" size={12} color={colors.mutedForeground} />
                  </View>
                  <Text style={styles.roadmapStepTitle}>วันที่ 7</Text>
                  <Text style={styles.roadmapStepSub}>ทดลองครบ 7 วัน</Text>
                </View>
              </View>
            )}

            {mode === "warning" && (
              <View style={styles.countdownBox}>
                <View style={styles.countdownTrack}>
                  <View
                    style={[
                      styles.countdownFill,
                      { width: `${Math.max(10, Math.min(100, ((7 - daysRemaining) / 7) * 100))}%` },
                    ]}
                  />
                </View>
                <View style={styles.countdownRow}>
                  <Text style={styles.countdownTextLeft}>เริ่มทดลองใช้วันแรก</Text>
                  <Text style={styles.countdownTextHighlight}>เหลืออีก {daysRemaining} วัน</Text>
                  <Text style={styles.countdownTextRight}>ครบ 7 วัน</Text>
                </View>
              </View>
            )}
          </View>

          {/* Perks Comparison Matrix */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>สิทธิประโยชน์เปรียบเทียบ</Text>
              <View style={styles.bubbleTag}>
                <MaterialCommunityIcons name="chart-bubble" size={12} color="#0284c7" />
                <Text style={styles.bubbleTagText}>ผู้ใช้ฟองสบู่</Text>
              </View>
            </View>

            <View style={styles.comparisonTable}>
              {PERK_COMPARISON.map((perk, index) => (
                <View
                  key={index}
                  style={[
                    styles.comparisonRow,
                    index % 2 === 1 && styles.comparisonRowAlt,
                  ]}
                >
                  <View style={styles.comparisonIconBox}>
                    <Ionicons name={perk.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.comparisonContent}>
                    <Text style={styles.comparisonTitle}>{perk.title}</Text>
                    <View style={styles.comparisonSubRow}>
                      <View style={styles.perkBadgeBubble}>
                        <Ionicons name="checkmark-circle" size={13} color="#059669" style={{ marginRight: 3 }} />
                        <Text style={styles.perkBadgeBubbleText}>{perk.bubble}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing Plans Section (Hidden only in Welcome mode if user prefers one-tap start) */}
          {mode === "welcome" ? (
            <View style={styles.welcomeActionCard}>
              <View style={styles.welcomePerkHighlight}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text style={styles.welcomePerkHighlightText}>
                  ไม่ต้องกรอกบัตรเครดิต • ไม่มีข้อผูกมัด • ใช้งานได้ฟรีทันที
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryCtaBtn}
                activeOpacity={0.88}
                onPress={handleStartTrial}
              >
                <Text style={styles.primaryCtaText}>เริ่มทดลองใช้ฟรี 7 วัน</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.ink} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>เลือกแพ็กเกจราคานักศึกษา</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>ลดสูงสุด 47%</Text>
                </View>
              </View>

              <View style={styles.plansList}>
                {PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardActive,
                        plan.isPopular && styles.planCardPopular,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedPlan(plan.id)}
                    >
                      {plan.tag && (
                        <View style={[styles.planRibbon, { backgroundColor: plan.badgeBg }]}>
                          <Text style={styles.planRibbonText}>{plan.tag}</Text>
                        </View>
                      )}

                      <View style={styles.planContentRow}>
                        {/* Radio Selector */}
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                          {isSelected && (
                            <View style={styles.radioInnerDot} />
                          )}
                        </View>

                        <View style={styles.planInfo}>
                          <Text style={[styles.planTitleText, isSelected && styles.planTitleTextActive]}>
                            {plan.title}
                          </Text>
                          <Text style={styles.planSubtextText}>{plan.subtext}</Text>
                        </View>

                        <View style={styles.planPriceBox}>
                          <Text style={[styles.planPriceText, isSelected && styles.planPriceTextActive]}>
                            {plan.price}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Checkout Action Button */}
              <TouchableOpacity
                style={[
                  styles.primaryCtaBtn,
                  isProcessing && { opacity: 0.6 },
                ]}
                activeOpacity={0.88}
                onPress={handleSimulatePurchase}
                disabled={isProcessing}
              >
                <Ionicons name="shield-checkmark" size={18} color={colors.ink} />
                <Text style={styles.primaryCtaText}>
                  {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันการสมัคร (จำลอง)"}
                </Text>
              </TouchableOpacity>

              {mode === "warning" && (
                <TouchableOpacity
                  style={styles.secondaryTextBtn}
                  activeOpacity={0.8}
                  onPress={onClose}
                >
                  <Text style={styles.secondaryTextBtnText}>
                    ใช้งานต่อในระยะเวลาที่เหลือ ({daysRemaining} วัน)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Trust Badges */}
              <View style={styles.trustBadgesRow}>
                <View style={styles.trustItem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedForeground} />
                  <Text style={styles.trustText}>ปลอดภัย 100%</Text>
                </View>
                <Text style={styles.trustDivider}>•</Text>
                <View style={styles.trustItem}>
                  <Ionicons name="school-outline" size={14} color={colors.mutedForeground} />
                  <Text style={styles.trustText}>ราคานักศึกษา</Text>
                </View>
                <Text style={styles.trustDivider}>•</Text>
                <View style={styles.trustItem}>
                  <Ionicons name="refresh-outline" size={14} color={colors.mutedForeground} />
                  <Text style={styles.trustText}>ยกเลิกได้ตลอดเวลา</Text>
                </View>
              </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.darkBorder,
    backgroundColor: "#ffffff",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  headerPillText: {
    fontSize: 12,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  heroCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    ...shadows.neo,
  },
  heroIconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    marginBottom: 14,
    ...shadows.neo,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  trialRoadmap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  roadmapStep: {
    alignItems: "center",
    width: 76,
  },
  roadmapDotActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#059669",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  roadmapDotWarning: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ea580c",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  roadmapDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  roadmapStepTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
  roadmapStepSub: {
    fontSize: 9.5,
    fontWeight: "600",
    color: colors.mutedForeground,
    textAlign: "center",
  },
  roadmapLineActive: {
    flex: 1,
    height: 3,
    backgroundColor: "#059669",
    marginBottom: 20,
  },
  roadmapLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#cbd5e1",
    marginBottom: 20,
  },
  countdownBox: {
    width: "100%",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  countdownTrack: {
    height: 10,
    backgroundColor: "#fed7aa",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    overflow: "hidden",
    marginBottom: 8,
  },
  countdownFill: {
    height: "100%",
    backgroundColor: "#ea580c",
    borderRadius: 4,
  },
  countdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countdownTextLeft: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  countdownTextHighlight: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ea580c",
  },
  countdownTextRight: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  section: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  bubbleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0284c7",
    gap: 4,
  },
  bubbleTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
  },
  discountBadge: {
    backgroundColor: "#bbf44a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  comparisonTable: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    overflow: "hidden",
    ...shadows.neo,
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  comparisonRowAlt: {
    backgroundColor: "#fafafc",
  },
  comparisonIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    marginRight: 10,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },
  comparisonSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  perkBadgeBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  perkBadgeBubbleText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#065f46",
  },
  welcomeActionCard: {
    gap: 12,
    marginTop: 4,
  },
  welcomePerkHighlight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  welcomePerkHighlightText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  primaryCtaBtn: {
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    ...shadows.neo,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
  },
  plansList: {
    gap: 10,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    position: "relative",
  },
  planCardActive: {
    borderColor: colors.darkBorder,
    backgroundColor: "#fdfefe",
    ...shadows.neo,
  },
  planCardPopular: {
    borderColor: colors.darkBorder,
  },
  planRibbon: {
    position: "absolute",
    top: -10,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    zIndex: 1,
  },
  planRibbonText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.ink,
  },
  planContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: colors.darkBorder,
    backgroundColor: "#bbf44a",
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ink,
  },
  planInfo: {
    flex: 1,
  },
  planTitleText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  planTitleTextActive: {
    color: colors.ink,
  },
  planSubtextText: {
    fontSize: 11.5,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  planPriceBox: {
    paddingLeft: 8,
  },
  planPriceText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  planPriceTextActive: {
    color: colors.primary,
  },
  secondaryTextBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  secondaryTextBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  trustBadgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  trustDivider: {
    fontSize: 10,
    color: "#cbd5e1",
  },
  welcomeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  welcomeCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    padding: 20,
    ...shadows.neo,
  },
  welcomeCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  welcomeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderWidth: 1.5,
    borderColor: "#86efac",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  welcomeBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#15803d",
  },
  welcomeTitle: {
    fontSize: 17.5,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 6,
    paddingRight: 24,
  },
  welcomeSubtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    color: colors.mutedForeground,
    lineHeight: 18,
    marginBottom: 16,
  },
  welcomePerksList: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  welcomePerkItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomePerkIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#e0f2fe",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  welcomePerkTextCol: {
    flex: 1,
  },
  welcomePerkTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 1,
  },
  welcomePerkDesc: {
    fontSize: 11,
    color: colors.mutedForeground,
    lineHeight: 15,
  },
  welcomeStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  welcomeStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  welcomeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    paddingVertical: 13,
    ...shadows.neo,
  },
  welcomeActionBtnText: {
    fontSize: 14.5,
    fontWeight: "900",
    color: colors.ink,
  },
});
