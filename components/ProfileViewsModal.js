import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { usePremium } from "../context/PremiumContext";
import { getRandomIcebreaker } from "../lib/mindInsight";
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
    hasSparkVisitor,
    topSparkVisitor,
    sparkVisitorsCount,
    togglePremiumMock,
    toggleIncognito,
    addMockProfileView,
  } = usePremium();

  const [paywallVisible, setPaywallVisible] = useState(false);
  const [icebreakerModalVisible, setIcebreakerModalVisible] = useState(false);
  const [activeVisitor, setActiveVisitor] = useState(null);
  const [icebreakerText, setIcebreakerText] = useState("");
  const [wavedUsers, setWavedUsers] = useState({});

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

  const handleQuickWave = (visitor) => {
    if (!isPremium) {
      setPaywallVisible(true);
      return;
    }

    const topic = visitor.sharedInsights?.[0];
    const starter = getRandomIcebreaker(topic, visitor.visitorName);
    setActiveVisitor(visitor);
    setIcebreakerText(starter);
    setWavedUsers((prev) => ({ ...prev, [visitor.visitorId]: true }));
    setIcebreakerModalVisible(true);
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
            {/* Mutual Spark Teaser Banner for Free Users */}
            {!isPremium && hasSparkVisitor && (
              <TouchableOpacity
                style={styles.sparkTeaserBanner}
                activeOpacity={0.88}
                onPress={() => setPaywallVisible(true)}
              >
                <View style={styles.sparkFlameCircle}>
                  <Ionicons name="flame" size={26} color="#FFF" />
                </View>
                <View style={styles.sparkTextBox}>
                  <View style={styles.sparkHeaderRow}>
                    <Text style={styles.sparkEyebrow}>🔥 MUTUAL SPARK DETECTED!</Text>
                  </View>
                  <Text style={styles.sparkTitle}>
                    มีคนเคมีตรงกับคุณถึง {topSparkVisitor?.matchPercentage}% แอบมาส่อง!
                  </Text>
                  <Text style={styles.sparkSubtitle}>
                    ปลดล็อก Mindclick Premium เพื่อดูตัวจริงและทักทายกลับทันที
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.ink} />
              </TouchableOpacity>
            )}

            {/* Mutual Spark Notice for Premium Users */}
            {isPremium && hasSparkVisitor && (
              <View style={styles.sparkActiveBanner}>
                <Ionicons name="flame" size={22} color="#E11D48" style={{ marginRight: 8 }} />
                <Text style={styles.sparkActiveText}>
                  🔥 พบสัญญาณ <Text style={{ fontWeight: "900" }}>Mutual Spark ({sparkVisitorsCount} คน)</Text> ที่เคมีเข้ากันได้เกิน 80%!
                </Text>
              </View>
            )}

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

            {/* Section Title */}
            <Text style={styles.sectionHeader}>
              {isPremium ? "รายชื่อผู้เข้าชมล่าสุด (พร้อม MIND-INSIGHT)" : "ตัวอย่างผู้ที่แวะมาส่องคุณ"}
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
                  const isSpark = visitor.isSpark || visitor.matchPercentage >= 80;
                  const isWaved = wavedUsers[visitor.visitorId];

                  return (
                    <TouchableOpacity
                      key={visitor.visitorId || index}
                      style={[
                        styles.visitorCard,
                        isSpark && isPremium && styles.visitorCardSpark,
                        !isPremium && styles.visitorCardBlurred,
                      ]}
                      activeOpacity={0.88}
                      onPress={() => handleOpenVisitor(visitor)}
                    >
                      {/* Top Row: Avatar + Name/Redacted + Match Badge */}
                      <View style={styles.cardTopRow}>
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
                            <View style={styles.teaserAvatar}>
                              <Ionicons name="lock-closed" size={18} color={colors.ink} />
                            </View>
                          )}
                          {isSpark && (
                            <View style={styles.flameAvatarBadge}>
                              <Ionicons name="flame" size={12} color="#FFF" />
                            </View>
                          )}
                        </View>

                        {/* Info Box */}
                        <View style={styles.visitorInfo}>
                          {isPremium ? (
                            <>
                              <View style={styles.nameRow}>
                                <Text style={styles.visitorName} numberOfLines={1}>
                                  {visitor.visitorName}
                                </Text>
                                {isSpark && (
                                  <View style={styles.sparkBadgePill}>
                                    <Text style={styles.sparkBadgePillText}>SPARK 🔥</Text>
                                  </View>
                                )}
                              </View>
                              {/* Faculty Chip */}
                              <View style={styles.facultyPill}>
                                <Ionicons name="school" size={11} color={colors.ink} style={{ marginRight: 4 }} />
                                <Text style={styles.facultyPillText}>
                                  {visitor.visitorFaculty || "คณะวิทยาศาสตร์"}
                                </Text>
                              </View>
                            </>
                          ) : (
                            <>
                              <View style={styles.redactedBar} />
                              {/* Free Teaser Faculty */}
                              <View style={styles.facultyPill}>
                                <Ionicons name="school" size={11} color={colors.ink} style={{ marginRight: 4 }} />
                                <Text style={styles.facultyPillText}>
                                  เพื่อนจาก{visitor.visitorFaculty || "ต่างคณะ"}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>

                        {/* Match & Time */}
                        <View style={styles.matchColumn}>
                          <View
                            style={[
                              styles.matchPill,
                              isSpark ? styles.matchPillSpark : styles.matchPillNormal,
                            ]}
                          >
                            <Ionicons
                              name={isSpark ? "flame" : "heart"}
                              size={12}
                              color={isSpark ? "#E11D48" : "#E11D48"}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.matchPillText}>
                              {visitor.matchPercentage}%
                            </Text>
                          </View>
                          <Text style={styles.visitorTime}>
                            {formatTimeAgo(visitor.visitedAt)}
                          </Text>
                        </View>
                      </View>

                      {/* Middle Row: Why They Clicked (Mind-Insight) */}
                      <View style={styles.mindInsightRow}>
                        {isPremium ? (
                          <>
                            <Text style={styles.mindInsightLabel}>💡 จุดร่วมที่ตอบตรงกัน:</Text>
                            <View style={styles.insightsList}>
                              {(visitor.sharedInsights || []).map((ins, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.insightChip,
                                    { backgroundColor: ins.color || "#FEF08A" },
                                  ]}
                                >
                                  <Ionicons
                                    name={ins.icon || "sparkles"}
                                    size={13}
                                    color={colors.ink}
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text style={styles.insightChipText}>{ins.tag}</Text>
                                </View>
                              ))}
                            </View>
                          </>
                        ) : (
                          // Teaser for Free Users
                          <View style={styles.freeInsightTeaser}>
                            <Ionicons name="sparkles" size={13} color="#B45309" style={{ marginRight: 4 }} />
                            <Text style={styles.freeInsightTeaserText}>
                              สนใจคุณเพราะ: ตอบคำถามควิซตรงกันในหมวดไลฟ์สไตล์ 🔒
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Bottom Action Row if Spark & Premium */}
                      {isPremium && isSpark && (
                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.waveBtn,
                              isWaved && styles.waveBtnActive,
                            ]}
                            activeOpacity={0.82}
                            onPress={() => handleQuickWave(visitor)}
                          >
                            <Ionicons
                              name={isWaved ? "checkmark-circle" : "hand-left"}
                              size={15}
                              color={colors.ink}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.waveBtnText}>
                              {isWaved ? "ส่งทักทายแล้ว (เปิดดูหัวข้อคุย)" : "👋 ส่งสัญญาณทักทาย (Quick Wave)"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
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
                  ปลดล็อก Mindclick Premium เพื่อดูรูปโปรไฟล์จริง ชื่อ คณะที่เรียน และจุดร่วมที่ตอบตรงกันทั้งหมด
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
                  <Text style={styles.devBtnText}>+ จำลองคนส่อง (Mind-Insight)</Text>
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

      {/* Icebreaker Starter Modal */}
      <Modal
        visible={icebreakerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIcebreakerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.icebreakerCard}>
            <View style={styles.icebreakerHeader}>
              <View style={styles.waveIconCircle}>
                <Text style={{ fontSize: 24 }}>👋</Text>
              </View>
              <Text style={styles.icebreakerTitle}>ส่งสัญญาณทักทายแล้ว!</Text>
              <Text style={styles.icebreakerSub}>
                เคมีตรงกันขนาดนี้ เริ่มต้นชวนคุยด้วยประเด็นนี้ได้เลย:
              </Text>
            </View>

            {/* Conversation Starter Bubble */}
            <View style={styles.quoteBubble}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.quoteText}>"{icebreakerText}"</Text>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.copyStarterBtn}
              activeOpacity={0.85}
              onPress={() => {
                Alert.alert("คัดลอกสำเร็จ", "นำประโยคนี้ไปทักทายในแชทหรือ Instagram/Line ได้เลย!");
              }}
            >
              <Ionicons name="copy-outline" size={16} color={colors.ink} style={{ marginRight: 6 }} />
              <Text style={styles.copyStarterBtnText}>คัดลอกประโยคทักทาย</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewProfileBtn}
              activeOpacity={0.85}
              onPress={() => {
                setIcebreakerModalVisible(false);
                if (activeVisitor?.visitorId) {
                  handleOpenVisitor(activeVisitor);
                }
              }}
            >
              <Ionicons name="person-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.viewProfileBtnText}>เปิดดูโปรไฟล์และช่องทางติดต่อ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeIcebreakerBtn}
              onPress={() => setIcebreakerModalVisible(false)}
            >
              <Text style={styles.closeIcebreakerBtnText}>ปิดหน้าต่าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sparkTeaserBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE4E6",
    borderWidth: 2.5,
    borderColor: "#E11D48",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    ...shadows.card,
  },
  sparkFlameCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E11D48",
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...shadows.button,
  },
  sparkTextBox: {
    flex: 1,
  },
  sparkHeaderRow: {
    marginBottom: 2,
  },
  sparkEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: "#E11D48",
    letterSpacing: 0.5,
  },
  sparkTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  sparkSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  sparkActiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    borderWidth: 2,
    borderColor: "#E11D48",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    ...shadows.button,
  },
  sparkActiveText: {
    fontSize: 12,
    color: colors.ink,
    flex: 1,
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
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    ...shadows.button,
  },
  visitorCardSpark: {
    backgroundColor: "#FFFBEB",
    borderColor: "#E11D48",
    borderWidth: 2.5,
    ...shadows.card,
  },
  visitorCardBlurred: {
    backgroundColor: "#FAF5FF",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarBox: {
    position: "relative",
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
  flameAvatarBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E11D48",
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  visitorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  visitorName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginRight: 6,
  },
  sparkBadgePill: {
    backgroundColor: "#FFE4E6",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E11D48",
  },
  sparkBadgePillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#E11D48",
  },
  facultyPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  facultyPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink,
  },
  redactedBar: {
    width: 90,
    height: 13,
    backgroundColor: "#CBD5E1",
    borderRadius: 4,
    marginBottom: 4,
  },
  matchColumn: {
    alignItems: "flex-end",
  },
  matchPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  matchPillNormal: {
    backgroundColor: "#FFE4E6",
  },
  matchPillSpark: {
    backgroundColor: "#FECDD3",
    borderWidth: 2,
  },
  matchPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  visitorTime: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  mindInsightRow: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    padding: 8,
  },
  mindInsightLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.mutedForeground,
    marginBottom: 6,
  },
  insightsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  insightChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  insightChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.ink,
  },
  freeInsightTeaser: {
    flexDirection: "row",
    alignItems: "center",
  },
  freeInsightTeaserText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B45309",
  },
  cardActionsRow: {
    marginTop: 10,
  },
  waveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE600",
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingVertical: 8,
    ...shadows.button,
  },
  waveBtnActive: {
    backgroundColor: "#86EFAC",
  },
  waveBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.ink,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icebreakerCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.ink,
    padding: 20,
    ...shadows.card,
  },
  icebreakerHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  waveIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FEF08A",
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...shadows.button,
  },
  icebreakerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 4,
  },
  icebreakerSub: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
    textAlign: "center",
  },
  quoteBubble: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 20,
    fontStyle: "italic",
  },
  copyStarterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE600",
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    ...shadows.button,
  },
  copyStarterBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.ink,
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    ...shadows.button,
  },
  viewProfileBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  closeIcebreakerBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  closeIcebreakerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
});
