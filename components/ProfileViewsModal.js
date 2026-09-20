import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { usePremium } from "../context/PremiumContext";
import PaywallModal from "./PaywallModal";

function formatTimeAgo(isoString) {
  if (!isoString) return "เมื่อสักครู่";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  if (diffDay === 1) return "เมื่อวานนี้";
  return `${diffDay} วันที่แล้ว`;
}

export default function ProfileViewsModal({ visible, onClose, onSelectUser }) {
  const {
    isPremium,
    isIncognito,
    profileViews,
    viewCount,
    togglePremiumMock,
    toggleIncognito,
    addMockProfileView,
  } = usePremium();

  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleOpenVisitor = (visitor) => {
    if (!isPremium) {
      setPaywallVisible(true);
      return;
    }
    if (onSelectUser && visitor.visitorId) {
      onClose();
      onSelectUser(visitor.visitorId);
    }
  };

  return (
    <>
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
              <Ionicons name="close" size={24} color={colors.ink} />
            </TouchableOpacity>

            <View style={styles.headerTitleBox}>
              <Text style={styles.eyebrowText}>PROFILE VISITORS</Text>
              <Text style={styles.mainTitleText}>ใครมาดูโปรไฟล์คุณบ้าง</Text>
            </View>

            <View
              style={[
                styles.statusPill,
                isPremium ? styles.statusPillPremium : styles.statusPillFree,
              ]}
            >
              <Text style={styles.statusPillText}>
                {isPremium ? "👑 PREMIUM" : "FREE"}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Counter Summary Banner */}
            <View
              style={[
                styles.counterCard,
                isPremium ? styles.counterCardGold : styles.counterCardTeaser,
              ]}
            >
              <View style={styles.counterIconCircle}>
                <Ionicons
                  name={isPremium ? "sparkles" : "eye"}
                  size={26}
                  color={colors.ink}
                />
              </View>
              <View style={styles.counterTextBox}>
                <Text style={styles.counterNumber}>
                  {viewCount} คน
                </Text>
                <Text style={styles.counterLabel}>
                  {isPremium
                    ? "แวะเข้ามาดูโปรไฟล์ของคุณในรอบ 30 วัน"
                    : "แอบเข้ามาดูโปรไฟล์คุณ! ปลดล็อกเพื่อดูตัวจริง"}
                </Text>
              </View>
            </View>

            {/* Incognito Notice Banner if Premium */}
            {isPremium && (
              <View style={styles.incognitoBanner}>
                <View style={styles.incognitoInfo}>
                  <Ionicons
                    name={isIncognito ? "glasses" : "eye-outline"}
                    size={20}
                    color={colors.ink}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.incognitoText}>
                    โหมดซ่อนตัว (Incognito):{" "}
                    <Text style={{ fontWeight: "900" }}>
                      {isIncognito ? "เปิดอยู่ (ส่องแบบไร้ร่องรอย)" : "ปิดอยู่ (เปิดเผยตัวตน)"}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.incognitoToggleBtn}
                  onPress={toggleIncognito}
                  activeOpacity={0.8}
                >
                  <Text style={styles.incognitoToggleBtnText}>
                    {isIncognito ? "ปิด" : "เปิด"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* List of Profile Views */}
            <Text style={styles.sectionHeader}>
              {isPremium ? "รายชื่อผู้เข้าชมล่าสุด (30 วัน)" : "ตัวอย่างผู้ที่แวะมาส่องคุณ"}
            </Text>

            {profileViews.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="telescope-outline" size={48} color={colors.mutedForeground} />
                <Text style={styles.emptyTitle}>ยังไม่มีประวัติการเข้าชม</Text>
                <Text style={styles.emptyDesc}>
                  ลองเพิ่มรูปภาพหรืออัปเดตคำตอบควิซ เพื่อเพิ่มโอกาสให้เพื่อนใหม่ค้นพบโปรไฟล์ของคุณ
                </Text>
              </View>
            ) : (
              <View style={styles.visitorsList}>
                {profileViews.map((visitor, index) => {
                  return (
                    <TouchableOpacity
                      key={visitor.visitorId || index}
                      style={[
                        styles.visitorCard,
                        !isPremium && styles.visitorCardBlurred,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleOpenVisitor(visitor)}
                    >
                      {/* Avatar */}
                      <View style={styles.avatarBox}>
                        {isPremium && visitor.visitorImage ? (
                          <Image
                            source={{ uri: visitor.visitorImage }}
                            style={styles.visitorAvatar}
                          />
                        ) : isPremium ? (
                          <View style={styles.visitorAvatarInitial}>
                            <Text style={styles.visitorAvatarInitialText}>
                              {(visitor.visitorName || "U").charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        ) : (
                          // Teaser Blurred Avatar
                          <View style={styles.teaserAvatar}>
                            <Ionicons name="lock-closed" size={18} color={colors.ink} />
                          </View>
                        )}
                      </View>

                      {/* Info Box */}
                      <View style={styles.visitorInfo}>
                        {isPremium ? (
                          <>
                            <Text style={styles.visitorName} numberOfLines={1}>
                              {visitor.visitorName}
                            </Text>
                            <Text style={styles.visitorTime}>
                              {formatTimeAgo(visitor.visitedAt)}
                            </Text>
                          </>
                        ) : (
                          <>
                            {/* Blurred Redacted Name Bar */}
                            <View style={styles.redactedBar} />
                            <Text style={styles.visitorTime}>
                              {formatTimeAgo(visitor.visitedAt)}
                            </Text>
                          </>
                        )}
                      </View>

                      {/* Match Badge */}
                      <View style={styles.matchPill}>
                        <Ionicons name="heart" size={12} color="#E11D48" style={{ marginRight: 4 }} />
                        <Text style={styles.matchPillText}>
                          {visitor.matchPercentage}%
                        </Text>
                      </View>

                      {/* Action Arrow / Lock Icon */}
                      <View style={styles.actionIconBox}>
                        <Ionicons
                          name={isPremium ? "chevron-forward" : "lock-closed"}
                          size={18}
                          color={colors.ink}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* If Free User, Show Big Paywall Teaser Button */}
            {!isPremium && (
              <View style={styles.teaserLockBox}>
                <View style={styles.teaserLockHeader}>
                  <Ionicons name="sparkles" size={24} color="#B45309" />
                  <Text style={styles.teaserLockTitle}>
                    อยากรู้ว่าใครที่เคมีตรงกับคุณกำลังแอบดูอยู่?
                  </Text>
                </View>
                <Text style={styles.teaserLockSubtitle}>
                  ปลดล็อก Mindclick Premium เพื่อดูรูปโปรไฟล์จริง ชื่อ และทักทายกลับได้ทันทีก่อนหมด 30 วัน
                </Text>
                <TouchableOpacity
                  style={styles.unlockBtn}
                  activeOpacity={0.88}
                  onPress={() => setPaywallVisible(true)}
                >
                  <Ionicons name="key" size={20} color={colors.ink} style={{ marginRight: 8 }} />
                  <Text style={styles.unlockBtnText}>
                    ปลดล็อกดูรายชื่อทั้งหมด (เริ่มต้น 66฿/ด.)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Developer Testing Bar */}
            <View style={styles.devBar}>
              <Text style={styles.devBarTitle}>🛠️ DEVELOPER SANDBOX</Text>
              <View style={styles.devBtnRow}>
                <TouchableOpacity
                  style={styles.devBtn}
                  onPress={() => togglePremiumMock()}
                >
                  <Text style={styles.devBtnText}>
                    {isPremium ? "สลับเป็น Free" : "สลับเป็น Premium"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devBtn}
                  onPress={addMockProfileView}
                >
                  <Text style={styles.devBtnText}>+ เพิ่ม 1 คนส่อง</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Embedded Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </>
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
    borderBottomWidth: 2.5,
    borderBottomColor: colors.ink,
    backgroundColor: colors.white,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  headerTitleBox: {
    alignItems: "center",
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
  },
  mainTitleText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  statusPillFree: {
    backgroundColor: "#E2E8F0",
  },
  statusPillPremium: {
    backgroundColor: "#FFE600",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.ink,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  counterCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    ...shadows.card,
  },
  counterCardGold: {
    backgroundColor: "#FEF08A",
  },
  counterCardTeaser: {
    backgroundColor: "#FFE4E6",
  },
  counterIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    ...shadows.button,
  },
  counterTextBox: {
    flex: 1,
  },
  counterNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 2,
    lineHeight: 18,
  },
  incognitoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#CFFAFE",
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    ...shadows.button,
  },
  incognitoInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  incognitoText: {
    fontSize: 12,
    color: colors.ink,
  },
  incognitoToggleBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  incognitoToggleBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.ink,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...shadows.button,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 18,
  },
  visitorsList: {
    marginBottom: 20,
  },
  visitorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...shadows.button,
  },
  visitorCardBlurred: {
    backgroundColor: "#FAF5FF",
  },
  avatarBox: {
    marginRight: 12,
  },
  visitorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  visitorAvatarInitial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: "#FDE047",
    alignItems: "center",
    justifyContent: "center",
  },
  visitorAvatarInitialText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
  },
  teaserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  redactedBar: {
    width: 100,
    height: 14,
    backgroundColor: "#CBD5E1",
    borderRadius: 4,
    marginBottom: 4,
  },
  visitorTime: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  matchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE4E6",
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  matchPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  actionIconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  teaserLockBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    ...shadows.card,
  },
  teaserLockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teaserLockTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
    marginLeft: 8,
    flex: 1,
  },
  teaserLockSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.ink,
    lineHeight: 18,
    marginBottom: 14,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE600",
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 14,
    ...shadows.button,
  },
  unlockBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.ink,
  },
  devBar: {
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  devBarTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.mutedForeground,
    marginBottom: 8,
    textAlign: "center",
  },
  devBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  devBtn: {
    flex: 0.48,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  devBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
});
