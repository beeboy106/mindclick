import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PrivacyPolicyModal({
  visible = false,
  onAccept,
  onDecline,
  onClose,
  mode = "consent", // "consent" | "view"
}) {
  const isConsentMode = mode === "consent";

  const handleDeclinePress = () => {
    Alert.alert(
      "ยืนยันการปฏิเสธ",
      "หากท่านปฏิเสธนโยบายการจัดเก็บข้อมูล ท่านจะไม่สามารถใช้งานระบบจับคู่ของ Mindclick ได้ และระบบจะทำการออกจากระบบ ท่านต้องการออกจากระบบใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ออกจากระบบ",
          style: "destructive",
          onPress: () => {
            if (onDecline) onDecline();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={isConsentMode ? handleDeclinePress : onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeContainer} edges={["top", "bottom", "left", "right"]}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconBox}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={24}
                  color={colors.ink}
                />
              </View>
              <View style={styles.headerTitleBox}>
                <Text style={styles.headerTitle}>นโยบายความเป็นส่วนตัว</Text>
                <Text style={styles.headerSubtitle}>
                  การจัดเก็บและคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </Text>
              </View>
              {!isConsentMode && (
                <TouchableOpacity
                  style={styles.closeIconBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color={colors.ink} />
                </TouchableOpacity>
              )}
            </View>

            {/* Scrollable Policy Body */}
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Introduction Badge */}
              <View style={styles.introBadge}>
                <Text style={styles.introBadgeText}>
                  ยินดีต้อนรับสู่ Mindclick 👋 เพื่อความโปร่งใสและสร้างความมั่นใจในการใช้งาน กรุณาทำความเข้าใจนโยบายการคุ้มครองข้อมูลด้านล่างนี้
                </Text>
              </View>

              {/* Section 1 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="folder-open-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>1. ข้อมูลที่เราจัดเก็บ</Text>
                </View>
                <Text style={styles.sectionText}>
                  เพื่อการทำงานของระบบแอป Mindclick เราจัดเก็บข้อมูลที่จำเป็นดังต่อไปนี้:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • <Text style={styles.boldText}>ข้อมูลบัญชีและโปรไฟล์:</Text> ชื่อแสดงผล, ที่อยู่อีเมล, รูปภาพโปรไฟล์, เพศ, ข้อความแนะนำตัว (Bio) และลิงก์โซเชียลมีเดีย
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={styles.boldText}>ข้อมูลแบบทดสอบ:</Text> คำตอบควิซทั้ง 4 ด้าน (ไลฟ์สไตล์, บุคลิกภาพ, การปฏิสัมพันธ์, สังคม) และลำดับคำถาม
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={styles.boldText}>ข้อมูลการจับคู่:</Text> รายชื่อเพื่อนที่คุณกดบันทึกเป็นรายการโปรด (Favorites)
                  </Text>
                </View>
              </View>

              {/* Section 2 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="compass-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    2. วัตถุประสงค์ในการประมวลผลข้อมูล
                  </Text>
                </View>
                <Text style={styles.sectionText}>
                  ข้อมูลของคุณจะถูกนำไปใช้ตามวัตถุประสงค์ที่ชัดเจนเท่านั้น:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • คำนวณและประมวลผลเปอร์เซ็นต์ความเข้ากันได้ (Matching Percentage) ร่วมกับคำตอบของผู้ใช้อื่น
                  </Text>
                  <Text style={styles.bulletItem}>
                    • แสดงผลการเปรียบเทียบมุมมองและคำถามที่เห็นตรงกันในหน้ารายละเอียดคู่แมตช์
                  </Text>
                  <Text style={styles.bulletItem}>
                    • จดจำสถานะการตอบควิซและซิงค์ข้อมูลให้คุณใช้งานได้อย่างต่อเนื่อง
                  </Text>
                </View>
              </View>

              {/* Section 3 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    3. การเปิดเผยและการแชร์ข้อมูล
                  </Text>
                </View>
                <Text style={styles.sectionText}>
                  ข้อมูลโปรไฟล์สาธารณะ (ชื่อ, รูปภาพ, ข้อมูลแนะนำตัว, ช่องทางติดต่อที่ท่านระบุ) และเปอร์เซ็นต์ความเข้ากันได้ จะแสดงต่อผู้ใช้งานรายอื่นในระบบ Mindclick เพื่อประโยชน์ในการทำความรู้จักและสร้างมิตรภาพ
                </Text>
                <View style={styles.highlightBox}>
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color="#15803d"
                  />
                  <Text style={styles.highlightText}>
                    Mindclick จะไม่มีการจำหน่าย แลกเปลี่ยน หรือส่งต่อข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกหรือผู้โฆษณาโดยเด็ดขาด
                  </Text>
                </View>
              </View>

              {/* Section 4 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    4. สิทธิ์และการควบคุมข้อมูลของคุณ
                  </Text>
                </View>
                <Text style={styles.sectionText}>
                  ท่านเป็นเจ้าของข้อมูลและมีสิทธิ์ควบคุมข้อมูลของตนเองอย่างเต็มที่:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • สามารถแก้ไขข้อมูลโปรไฟล์ รูปภาพ และโซเชียลมีเดียได้ตลอดเวลา
                  </Text>
                  <Text style={styles.bulletItem}>
                    • สามารถกด "รีเซ็ตควิซ" เพื่อล้างประวัติคำตอบทั้งหมดได้ทันทีที่หน้าโปรไฟล์
                  </Text>
                  <Text style={styles.bulletItem}>
                    • สามารถออกจากระบบ (Sign Out) หรือลบข้อมูลบัญชีของตนเองได้ตลอดเวลา
                  </Text>
                </View>
              </View>

              {isConsentMode && (
                <View style={styles.consentNoticeBox}>
                  <Ionicons
                    name="checkbox-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.consentNoticeText}>
                    การกด "ยินยอมและเริ่มต้นใช้งาน" ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงยินยอมให้นำข้อมูลไปประมวลผลตามนโยบายนี้
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Actions Footer */}
            <View style={styles.footer}>
              {isConsentMode ? (
                <View style={styles.consentBtnRow}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={handleDeclinePress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.declineBtnText}>ปฏิเสธ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={onAccept}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.acceptBtnText}>
                      ยินยอมและเริ่มต้นใช้งาน
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.closeBtnText}>ปิดหน้าต่าง</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 23, 28, 0.65)",
    justifyContent: "center",
  },
  safeContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    maxHeight: "92%",
    ...shadows.neo,
    overflow: "hidden",
    display: "flex",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    backgroundColor: colors.card,
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#bbf44a", // Mindclick Lime Accent
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.ink,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginTop: 1,
  },
  closeIconBtn: {
    padding: 6,
  },
  scrollBody: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  introBadge: {
    backgroundColor: "#f4fde6",
    borderWidth: 1,
    borderColor: "#c7f65a",
    borderRadius: 12,
    padding: 12,
  },
  introBadgeText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 20,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fafafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  sectionText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 6,
  },
  bulletList: {
    gap: 6,
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 12.5,
    color: "#4b5563",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "700",
    color: colors.ink,
  },
  highlightBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 12,
    color: "#166534",
    lineHeight: 18,
    fontWeight: "600",
  },
  consentNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    padding: 12,
  },
  consentNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 18,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
    backgroundColor: colors.card,
  },
  consentBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  declineBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.mutedForeground,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    paddingVertical: 13,
    paddingHorizontal: 16,
    ...shadows.neo,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  closeBtn: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    paddingVertical: 12,
    alignItems: "center",
    ...shadows.neo,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
});
