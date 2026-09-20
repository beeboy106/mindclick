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

const PLANS = [
  {
    id: "monthly",
    title: "1 เดือน",
    price: "149 บาท",
    subtext: "149 บาท / เดือน",
    tag: null,
    isPopular: false,
  },
  {
    id: "quarterly",
    title: "3 เดือน",
    price: "299 บาท",
    subtext: "ประหยัด 33% (~99 บาท/เดือน)",
    tag: "🔥 ยอดนิยม",
    isPopular: true,
  },
  {
    id: "annual",
    title: "1 ปี",
    price: "799 บาท",
    subtext: "ประหยัด 55% (~66 บาท/เดือน)",
    tag: "💎 คุ้มค่าสูงสุด",
    isPopular: false,
  },
];

const PERKS = [
  {
    icon: "eye-outline",
    color: "#FFE600",
    title: "Profile View History",
    desc: "ดูรายชื่อและรูปโปรไฟล์ชัดเจนของทุกคนที่แวะมาส่องคุณย้อนหลัง 30 วัน",
  },
  {
    icon: "glasses-outline",
    color: "#67E8F9",
    title: "Incognito Mode (โหมดซ่อนตัว)",
    desc: "เปิดใช้งานเพื่อแอบดูโปรไฟล์คนอื่นได้แบบไร้ร่องรอย ไม่ทิ้งประวัติ",
  },
  {
    icon: "filter-circle-outline",
    color: "#F472B6",
    title: "Advanced Match Filters",
    desc: "กรองคู่แมตช์ตามช่วงความเข้ากันได้ และหมวดหมู่ไลฟ์สไตล์เฉพาะเจาะจง",
  },
  {
    icon: "ribbon-outline",
    color: "#FBBF24",
    title: "Golden Neo-brutalism Crown",
    desc: "สัญลักษณ์มงกุฎทองคำสุดคูลประดับรอบรูปโปรไฟล์ให้โดดเด่น",
  },
];

export default function PaywallModal({ visible, onClose }) {
  const { togglePremiumMock } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");

  const handleSimulatePurchase = async () => {
    await togglePremiumMock(true);
    Alert.alert(
      "👑 ยินดีต้อนรับสู่ Premium!",
      "คุณได้ปลดล็อก Mindclick Premium เรียบร้อยแล้ว สามารถดูรายชื่อผู้เข้าชมและใช้งานทุกสิทธิ์ได้ทันที",
      [{ text: "ตกลง", onPress: onClose }]
    );
  };

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
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>MINDCLICK PLUS</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.crownCircle}>
              <Ionicons name="sparkles" size={32} color={colors.ink} />
            </View>
            <Text style={styles.heroEyebrow}>EXCLUSIVE ACCESS</Text>
            <Text style={styles.heroTitle}>MINDCLICK PREMIUM</Text>
            <Text style={styles.heroSubtitle}>
              รู้ทันคนที่แอบสนใจคุณ พร้อมปลดล็อกศักยภาพการแมตช์เพื่อนใหม่แบบเต็มรูปแบบ
            </Text>
          </View>

          {/* Perks List */}
          <Text style={styles.sectionHeader}>สิทธิพิเศษที่ได้รับ (YOUR PERKS)</Text>
          <View style={styles.perksList}>
            {PERKS.map((p, idx) => (
              <View key={idx} style={styles.perkCard}>
                <View style={[styles.perkIconBox, { backgroundColor: p.color }]}>
                  <Ionicons name={p.icon} size={22} color={colors.ink} />
                </View>
                <View style={styles.perkInfo}>
                  <Text style={styles.perkTitle}>{p.title}</Text>
                  <Text style={styles.perkDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing Plans */}
          <Text style={styles.sectionHeader}>เลือกแพ็กเกจที่เหมาะกับคุณ (SELECT PLAN)</Text>
          <View style={styles.plansContainer}>
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    plan.isPopular && styles.planCardPopular,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.tag && (
                    <View style={styles.planTag}>
                      <Text style={styles.planTagText}>{plan.tag}</Text>
                    </View>
                  )}
                  <View style={styles.planRow}>
                    <View style={styles.planRadioOuter}>
                      {isSelected && <View style={styles.planRadioInner} />}
                    </View>
                    <View style={styles.planDetails}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planSubtext}>{plan.subtext}</Text>
                    </View>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action CTA Button */}
          <TouchableOpacity
            style={styles.mainCtaBtn}
            activeOpacity={0.85}
            onPress={handleSimulatePurchase}
          >
            <Ionicons name="flash" size={20} color={colors.ink} style={{ marginRight: 6 }} />
            <Text style={styles.mainCtaText}>ทดลองเปิดใช้งาน Premium ทันที</Text>
          </TouchableOpacity>

          <Text style={styles.termsNote}>
            * สมาชิกสามารถยกเลิกหรือสลับสถานะเพื่อทดสอบระบบได้ตลอดเวลาผ่านหน้าโปรไฟล์
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    backgroundColor: colors.white,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  headerBadge: {
    backgroundColor: "#FFE600",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.ink,
    ...shadows.button,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#FEF08A",
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    ...shadows.card,
  },
  crownCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...shadows.button,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#B45309",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.ink,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  perksList: {
    marginBottom: 24,
  },
  perkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    ...shadows.button,
  },
  perkIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  perkDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.mutedForeground,
    lineHeight: 17,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    position: "relative",
    ...shadows.button,
  },
  planCardSelected: {
    backgroundColor: "#FDF4FF",
    borderColor: colors.ink,
    borderWidth: 3,
    ...shadows.card,
  },
  planCardPopular: {
    borderTopWidth: 3,
  },
  planTag: {
    position: "absolute",
    top: -11,
    right: 14,
    backgroundColor: "#F43F5E",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  planTagText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.white,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  planRadioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: colors.white,
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  planSubtext: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  mainCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE600",
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 16,
    ...shadows.card,
    marginBottom: 12,
  },
  mainCtaText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  termsNote: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 16,
  },
});
