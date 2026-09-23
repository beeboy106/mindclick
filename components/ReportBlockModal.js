import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";

const REPORT_REASONS = [
  { id: "harassment", label: "พฤติกรรมไม่เหมาะสม / คุกคาม", icon: "alert-circle-outline" },
  { id: "spam", label: "สแปม / โฆษณาหลอกลวง", icon: "mail-unread-outline" },
  { id: "hate_speech", label: "ใช้คำหยาบ / สร้างความเกลียดชัง", icon: "megaphone-outline" },
  { id: "impersonation", label: "ปลอมแปลงตัวตน / ข้อมูลเท็จ", icon: "person-remove-outline" },
  { id: "other", label: "อื่นๆ (ระบุรายละเอียด)", icon: "ellipsis-horizontal-circle-outline" },
];

export default function ReportBlockModal({
  visible,
  onClose,
  targetType = "user", // 'user' | 'post' | 'comment' | 'message'
  targetId,
  targetName = "ผู้ใช้งาน",
  onBlockUser,
  onReportSubmitted,
}) {
  const [mode, setMode] = useState("menu"); // 'menu' | 'report' | 'block_confirm'
  const [selectedReason, setSelectedReason] = useState(null);
  const [detailText, setDetailText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) return null;

  const handleClose = () => {
    setMode("menu");
    setSelectedReason(null);
    setDetailText("");
    setIsSubmitting(false);
    onClose();
  };

  const handleConfirmBlock = async () => {
    setIsSubmitting(true);
    try {
      if (onBlockUser && targetId) {
        await onBlockUser(targetId, targetName);
      }
      Alert.alert(
        "บล็อกผู้ใช้สำเร็จ",
        `คุณจะไม่เห็นเนื้อหา โพสต์ หรือข้อความจาก ${targetName} อีกต่อไป`,
        [{ text: "ตกลง", onPress: handleClose }]
      );
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบล็อกผู้ใช้ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert("กรุณาเลือกเหตุผล", "โปรดเลือกเหตุผลในการรายงานก่อนดำเนินการต่อ");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onReportSubmitted) {
        await onReportSubmitted({
          targetType,
          targetId,
          targetName,
          reason: selectedReason,
          details: detailText.trim(),
          reportedAt: new Date().toISOString(),
        });
      }
      Alert.alert(
        "ส่งรายงานสำเร็จ",
        "ทีมงานได้รับข้อมูลรายงานของคุณเรียบร้อยแล้ว และจะดำเนินการตรวจสอบตามมาตรฐานความปลอดภัยโดยเร็วที่สุด",
        [{ text: "ตกลง", onPress: handleClose }]
      );
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถส่งรายงานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <Ionicons
                  name={mode === "block_confirm" ? "hand-left" : "shield-alert"}
                  size={20}
                  color={mode === "block_confirm" ? colors.destructive : colors.ink}
                />
              </View>
              <Text style={styles.modalHeaderTitle}>
                {mode === "menu" && "การจัดการความปลอดภัย"}
                {mode === "report" && `รายงาน ${targetType === "user" ? "ผู้ใช้" : "เนื้อหา"}`}
                {mode === "block_confirm" && "ยืนยันการบล็อกผู้ใช้"}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Mode 1: Initial Menu */}
          {mode === "menu" && (
            <View style={styles.bodyContent}>
              <Text style={styles.menuSubtitle}>
                เป้าหมาย: <Text style={{ fontWeight: "900", color: colors.ink }}>{targetName}</Text>
              </Text>

              <TouchableOpacity
                style={styles.menuOptionBtn}
                activeOpacity={0.85}
                onPress={() => setMode("report")}
              >
                <View style={[styles.menuOptionIconBox, { backgroundColor: "#fff7ed" }]}>
                  <Ionicons name="flag-outline" size={20} color="#ea580c" />
                </View>
                <View style={styles.menuOptionTextBox}>
                  <Text style={styles.menuOptionTitle}>รายงานพฤติกรรมหรือเนื้อหา</Text>
                  <Text style={styles.menuOptionDesc}>แจ้งให้ทีมงานตรวจสอบการละเมิดกฎชุมชน</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>

              {targetType === "user" && (
                <TouchableOpacity
                  style={[styles.menuOptionBtn, styles.menuOptionBtnDanger]}
                  activeOpacity={0.85}
                  onPress={() => setMode("block_confirm")}
                >
                  <View style={[styles.menuOptionIconBox, { backgroundColor: "#fef2f2" }]}>
                    <Ionicons name="person-remove-outline" size={20} color={colors.destructive} />
                  </View>
                  <View style={styles.menuOptionTextBox}>
                    <Text style={[styles.menuOptionTitle, { color: colors.destructive }]}>
                      บล็อก {targetName}
                    </Text>
                    <Text style={styles.menuOptionDesc}>ซ่อนโพสต์ แชท และตัดการติดต่อทั้งหมด</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.destructive} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Mode 2: Report Reasons Form */}
          {mode === "report" && (
            <View style={styles.bodyContent}>
              <Text style={styles.formSubtitle}>โปรดเลือกเหตุผลที่ต้องการรายงาน:</Text>

              <View style={styles.reasonsList}>
                {REPORT_REASONS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.reasonItem, isSelected && styles.reasonItemActive]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedReason(r.id)}
                    >
                      <Ionicons
                        name={r.icon}
                        size={17}
                        color={isSelected ? colors.ink : colors.mutedForeground}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.reasonItemText,
                          isSelected && styles.reasonItemTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={colors.ink}
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={styles.detailInput}
                placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)..."
                placeholderTextColor={colors.mutedForeground}
                multiline={true}
                numberOfLines={3}
                value={detailText}
                onChangeText={setDetailText}
                maxLength={300}
              />

              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.8}
                  onPress={() => setMode("menu")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.secondaryBtnText}>ย้อนกลับ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primarySubmitBtn, isSubmitting && { opacity: 0.6 }]}
                  activeOpacity={0.85}
                  onPress={handleSubmitReport}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.ink} />
                  ) : (
                    <>
                      <Ionicons name="paper-plane-outline" size={16} color={colors.ink} style={{ marginRight: 6 }} />
                      <Text style={styles.primarySubmitBtnText}>ส่งรายงาน</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mode 3: Block Confirmation */}
          {mode === "block_confirm" && (
            <View style={styles.bodyContent}>
              <View style={styles.blockWarningBox}>
                <Ionicons name="warning-outline" size={28} color={colors.destructive} style={{ marginBottom: 8 }} />
                <Text style={styles.blockWarningTitle}>ต้องการบล็อกผู้ใช้นี้หรือไม่?</Text>
                <Text style={styles.blockWarningDesc}>
                  เมื่อบล็อกแล้ว คุณและ {targetName} จะไม่สามารถส่งข้อความหากัน เห็นโพสต์ หรือจับคู่กันได้อีกต่อไป
                </Text>
              </View>

              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.8}
                  onPress={() => setMode("menu")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.secondaryBtnText}>ยกเลิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dangerSubmitBtn, isSubmitting && { opacity: 0.6 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmBlock}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="person-remove" size={16} color={colors.white} style={{ marginRight: 6 }} />
                      <Text style={styles.dangerSubmitBtnText}>ยืนยันการบล็อก</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: colors.darkBorder,
    overflow: "hidden",
    ...shadows.neo,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  bodyContent: {
    padding: 16,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 12,
  },
  menuOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...shadows.neo,
  },
  menuOptionBtnDanger: {
    borderColor: colors.destructive,
  },
  menuOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuOptionTextBox: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  menuOptionDesc: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  formSubtitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 10,
  },
  reasonsList: {
    gap: 8,
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reasonItemActive: {
    backgroundColor: "#f0fdf4",
    borderColor: colors.darkBorder,
  },
  reasonItemText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  reasonItemTextActive: {
    color: colors.ink,
    fontWeight: "800",
  },
  detailInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    fontSize: 12.5,
    color: colors.ink,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  actionBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  primarySubmitBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 11,
    ...shadows.neo,
  },
  primarySubmitBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink,
  },
  dangerSubmitBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.destructive,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 11,
    ...shadows.neo,
  },
  dangerSubmitBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.white,
  },
  blockWarningBox: {
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  blockWarningTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.destructive,
    marginBottom: 6,
    textAlign: "center",
  },
  blockWarningDesc: {
    fontSize: 12,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 18,
  },
});
