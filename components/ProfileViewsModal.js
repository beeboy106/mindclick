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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { usePremium } from "../context/PremiumContext";
import { useFeed } from "../context/FeedContext";
import { getRandomIcebreaker } from "../lib/mindInsight";
import BubbleUpgradeModal from "./BubbleUpgradeModal";
import ChatModal from "./ChatModal";

function formatTimeAgo(isoString) {
  if (!isoString) return "เมื่อสักครู่";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHour < 24) return `${diffHour} ชม. ที่แล้ว`;
  if (diffDay === 1) return "เมื่อวานนี้";
  return `${diffDay} วันที่แล้ว`;
}

function getShortInsightName(tag) {
  if (!tag) return "เคมีตรงกัน";
  if (tag.includes("ดนตรี") || tag.includes("คอนเสิร์ต")) return "ดนตรี";
  if (tag.includes("เที่ยว") || tag.includes("วันหยุด")) return "ท่องเที่ยว";
  if (tag.includes("ท้าทาย") || tag.includes("ใหม่")) return "ชอบลองสิ่งใหม่";
  if (tag.includes("เปิดบทสนทนา") || tag.includes("พูดคุย")) return "คุยถูกคอ";
  if (tag.includes("เข้าสังคม") || tag.includes("สังคม")) return "ไลฟ์สไตล์";
  return tag.length > 10 ? tag.slice(0, 8) + "..." : tag;
}

export default function ProfileViewsModal({ visible, onClose, onSelectUser }) {
  const {
    isBubbleUser,
    isIncognito,
    profileViews,
    viewCount,
    hasSparkVisitor,
    topSparkVisitor,
    sparkVisitorsCount,
    togglePremiumMock,
    toggleIncognito,
    addMockProfileView,
    checkAndTriggerWarning,
    peekPasses,
    usePeekPass,
    isVisitorUnlocked,
  } = usePremium();
  const { startChatWithUser } = useFeed();

  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'spark'
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [icebreakerModalVisible, setIcebreakerModalVisible] = useState(false);
  const [activeVisitor, setActiveVisitor] = useState(null);
  const [icebreakerText, setIcebreakerText] = useState("");
  const [wavedUsers, setWavedUsers] = useState({});
  const [chatVisible, setChatVisible] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);

  // ตรวจสอบการแจ้งเตือนสิทธิ์ 3 วันสุดท้ายในครั้งแรกของวันที่เข้าใช้ฟีเจอร์
  React.useEffect(() => {
    if (visible && isBubbleUser) {
      checkAndTriggerWarning("profile_views").then((res) => {
        if (res?.shouldWarn) {
          setWarningVisible(true);
        }
      });
    }
  }, [visible, isBubbleUser, checkAndTriggerWarning]);

  const handleOpenVisitor = (visitor) => {
    const canView = isBubbleUser || (isVisitorUnlocked && isVisitorUnlocked(visitor.visitorId));
    if (canView) {
      if (onSelectUser && visitor.visitorId) {
        onClose();
        onSelectUser(visitor.visitorId);
      }
      return;
    }

    if ((peekPasses || 0) > 0) {
      Alert.alert(
        "ใช้ตั๋วส่องโปรไฟล์",
        `คุณมีตั๋วส่องโปรไฟล์คงเหลือ ${peekPasses} ใบ (ได้จากการแลกแต้มภารกิจ)\nต้องการใช้ 1 ใบเพื่อเปิดดูโปรไฟล์ของ "${visitor.visitorName}" หรือไม่?`,
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ใช้ตั๋ว 1 ใบ",
            onPress: async () => {
              const ok = await usePeekPass(visitor.visitorId);
              if (ok && onSelectUser && visitor.visitorId) {
                onClose();
                onSelectUser(visitor.visitorId);
              }
            },
          },
        ]
      );
      return;
    }

    setPaywallVisible(true);
  };

  const handleQuickWave = (visitor) => {
    const canView = isBubbleUser || (isVisitorUnlocked && isVisitorUnlocked(visitor.visitorId));
    if (canView) {
      const topic = visitor.sharedInsights?.[0];
      const starter = getRandomIcebreaker(topic, visitor.visitorName);
      setActiveVisitor(visitor);
      setIcebreakerText(starter);
      setWavedUsers((prev) => ({ ...prev, [visitor.visitorId]: true }));
      setIcebreakerModalVisible(true);
      return;
    }

    if ((peekPasses || 0) > 0) {
      Alert.alert(
        "ใช้ตั๋วส่องโปรไฟล์",
        `คุณมีตั๋วส่องโปรไฟล์คงเหลือ ${peekPasses} ใบ ต้องการใช้ 1 ใบเพื่อส่งทักทาย "${visitor.visitorName}" หรือไม่?`,
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ใช้ตั๋ว 1 ใบ",
            onPress: async () => {
              const ok = await usePeekPass(visitor.visitorId);
              if (ok) {
                const topic = visitor.sharedInsights?.[0];
                const starter = getRandomIcebreaker(topic, visitor.visitorName);
                setActiveVisitor(visitor);
                setIcebreakerText(starter);
                setWavedUsers((prev) => ({ ...prev, [visitor.visitorId]: true }));
                setIcebreakerModalVisible(true);
              }
            },
          },
        ]
      );
      return;
    }

    setPaywallVisible(true);
  };

  const handleOpenChat = async (visitor) => {
    const canView = isBubbleUser || (isVisitorUnlocked && isVisitorUnlocked(visitor.visitorId));
    if (canView) {
      const targetObj = {
        id: visitor.visitorId,
        name: visitor.visitorName,
        image: visitor.visitorImage,
      };
      await startChatWithUser(targetObj);
      setChatTargetUser(targetObj);
      setChatVisible(true);
      return;
    }

    if ((peekPasses || 0) > 0) {
      Alert.alert(
        "ใช้ตั๋วส่องโปรไฟล์",
        `คุณมีตั๋วส่องโปรไฟล์คงเหลือ ${peekPasses} ใบ ต้องการใช้ 1 ใบเพื่อเปิดแชทกับ "${visitor.visitorName}" หรือไม่?`,
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ใช้ตั๋ว 1 ใบ",
            onPress: async () => {
              const ok = await usePeekPass(visitor.visitorId);
              if (ok) {
                const targetObj = {
                  id: visitor.visitorId,
                  name: visitor.visitorName,
                  image: visitor.visitorImage,
                };
                await startChatWithUser(targetObj);
                setChatTargetUser(targetObj);
                setChatVisible(true);
              }
            },
          },
        ]
      );
      return;
    }

    setPaywallVisible(true);
  };

  const filteredVisitors =
    activeFilter === "spark"
      ? profileViews.filter(
          (v) => v.isSpark || (v.matchPercentage && v.matchPercentage >= 80)
        )
      : profileViews;

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
              style={styles.backBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={24} color="#0f172a" />
            </TouchableOpacity>

            <View style={styles.headerTitleBox}>
              <Text style={styles.mainTitleText}>ประวัติการดูโปรไฟล์</Text>
            </View>

            <View
              style={[
                styles.statusPill,
                isBubbleUser ? styles.statusPillBubble : styles.statusPillFree,
              ]}
            >
              {isBubbleUser ? (
                <>
                  <MaterialCommunityIcons
                    name="chart-bubble"
                    size={13}
                    color="#0284c7"
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.statusPillBubbleText}>ฟองสบู่</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="lock-closed"
                    size={11}
                    color="#64748b"
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.statusPillFreeText}>ทั่วไป</Text>
                </>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Clean Summary Stats Bar */}
            <View style={styles.statsSummaryBar}>
              <View style={styles.statSummaryItem}>
                <Text style={styles.statSummaryNumber}>{viewCount}</Text>
                <Text style={styles.statSummaryLabel}>คนส่อง 30 วัน</Text>
              </View>
              <View style={styles.statSummaryDivider} />
              <View style={styles.statSummaryItem}>
                <View style={styles.sparkStatNumRow}>
                  <Ionicons name="flame" size={14} color="#ea580c" style={{ marginRight: 2 }} />
                  <Text style={[styles.statSummaryNumber, { color: "#ea580c" }]}>{sparkVisitorsCount}</Text>
                </View>
                <Text style={styles.statSummaryLabel}>Spark (&gt;80%)</Text>
              </View>
              {!isBubbleUser && (
                <>
                  <View style={styles.statSummaryDivider} />
                  <View style={styles.statSummaryItem}>
                    <Text style={[styles.statSummaryNumber, { color: "#0284c7" }]}>{peekPasses || 0}</Text>
                    <Text style={styles.statSummaryLabel}>ตั๋วคงเหลือ</Text>
                  </View>
                </>
              )}
            </View>

            {/* Incognito Mode Row */}
            <View style={styles.incognitoRow}>
              <View style={styles.incognitoLeft}>
                <View style={styles.incognitoIconCircle}>
                  <Ionicons
                    name={isIncognito && isBubbleUser ? "glasses" : "eye-outline"}
                    size={16}
                    color="#475569"
                  />
                </View>
                <View style={styles.incognitoTextGroup}>
                  <Text style={styles.incognitoTitle}>โหมดซ่อนตัว (Incognito)</Text>
                  <Text style={styles.incognitoSubtitle}>
                    {isBubbleUser
                      ? isIncognito
                        ? "เปิดอยู่: ส่องโปรไฟล์ได้โดยไม่บันทึกประวัติ"
                        : "ปิดอยู่: ชื่อคุณจะแสดงในประวัติของคนที่คุณส่อง"
                      : "ส่องแบบไม่ระบุตัวตน (สิทธิ์ผู้ใช้ฟองสบู่)"}
                  </Text>
                </View>
              </View>

              {isBubbleUser ? (
                <TouchableOpacity
                  style={[
                    styles.incognitoSwitchPill,
                    isIncognito && styles.incognitoSwitchPillActive,
                  ]}
                  onPress={toggleIncognito}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.incognitoSwitchText,
                      isIncognito && styles.incognitoSwitchTextActive,
                    ]}
                  >
                    {isIncognito ? "เปิด" : "ปิด"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.incognitoLockPill}
                  onPress={() => setPaywallVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="lock-closed" size={11} color="#64748b" style={{ marginRight: 3 }} />
                  <Text style={styles.incognitoLockText}>ปลดล็อก</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Mutual Spark Notice Banner */}
            {hasSparkVisitor && (
              <>
                {isBubbleUser ? (
                  <View style={styles.sparkBannerSoft}>
                    <View style={styles.sparkBannerIconBox}>
                      <Ionicons name="flame" size={16} color="#ea580c" />
                    </View>
                    <Text style={styles.sparkBannerText}>
                      พบผู้เข้าชมเคมีตรงกันเกิน 80% ({sparkVisitorsCount} คน) ส่งคำทักทายได้ทันที
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.sparkTeaserBannerSoft}
                    activeOpacity={0.85}
                    onPress={() => setPaywallVisible(true)}
                  >
                    <View style={styles.sparkBannerIconBox}>
                      <Ionicons name="flame" size={16} color="#ea580c" />
                    </View>
                    <View style={styles.sparkTeaserTextGroup}>
                      <Text style={styles.sparkTeaserTitle}>
                        มีคนเคมีตรงกับคุณถึง {topSparkVisitor?.matchPercentage || 85}% แอบมาส่อง
                      </Text>
                      <Text style={styles.sparkTeaserSub}>
                        ปลดล็อกสิทธิ์ผู้ใช้ฟองสบู่เพื่อดูตัวจริง
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Filter Tabs */}
            <View style={styles.filterTabsRow}>
              <TouchableOpacity
                style={[
                  styles.filterTabPill,
                  activeFilter === "all" && styles.filterTabPillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter("all")}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === "all" && styles.filterTabTextActive,
                  ]}
                >
                  ทั้งหมด ({profileViews.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabPill,
                  activeFilter === "spark" && styles.filterTabPillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter("spark")}
              >
                <Ionicons
                  name="flame"
                  size={12}
                  color={activeFilter === "spark" ? "#ffffff" : "#ea580c"}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === "spark" && styles.filterTabTextActive,
                  ]}
                >
                  เคมีตรงกัน ({sparkVisitorsCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Visitors List Section */}
            {filteredVisitors.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="telescope-outline" size={32} color="#64748b" />
                </View>
                <Text style={styles.emptyTitle}>
                  {activeFilter === "spark"
                    ? "ยังไม่มีผู้เข้าชมในกลุ่มเคมีตรงกันเกิน 80%"
                    : "ยังไม่มีประวัติการเข้าชม"}
                </Text>
                <Text style={styles.emptyDesc}>
                  ลองตอบคำถามควิซเพิ่มเติม หรือแชร์เรื่องราวในฟีด เพื่อให้เพื่อนที่มีไลฟ์สไตล์ตรงกันค้นพบโปรไฟล์ของคุณ
                </Text>
              </View>
            ) : (
              <View style={styles.visitorsList}>
                {filteredVisitors.map((visitor, index) => {
                  const isSpark = visitor.isSpark || (visitor.matchPercentage && visitor.matchPercentage >= 80);
                  const isWaved = wavedUsers[visitor.visitorId];
                  const canView = isBubbleUser || (isVisitorUnlocked && isVisitorUnlocked(visitor.visitorId));

                  return (
                    <TouchableOpacity
                      key={visitor.visitorId || index}
                      style={[
                        styles.visitorRowCard,
                        isSpark && canView && styles.visitorRowCardSpark,
                        !canView && styles.visitorRowCardLocked,
                      ]}
                      activeOpacity={0.82}
                      onPress={() => handleOpenVisitor(visitor)}
                    >
                      {/* Left: Avatar */}
                      <View style={styles.avatarWrapper}>
                        {canView && visitor.visitorImage ? (
                          <Image
                            source={{ uri: visitor.visitorImage }}
                            style={styles.avatarImg}
                          />
                        ) : canView ? (
                          <View style={styles.avatarFallback}>
                            <Text style={styles.avatarFallbackText}>
                              {(visitor.visitorName || "U").charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.avatarLocked}>
                            <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                          </View>
                        )}
                        {isSpark && (
                          <View style={styles.flameMiniBadge}>
                            <Ionicons name="flame" size={10} color="#ffffff" />
                          </View>
                        )}
                      </View>

                      {/* Center: Info + Mini Insight Icons */}
                      <View style={styles.visitorCenterCol}>
                        <View style={styles.nameLine}>
                          <Text style={styles.visitorNameText} numberOfLines={1}>
                            {canView ? visitor.visitorName : `เพื่อนจาก${visitor.visitorFaculty || "ต่างคณะ"}`}
                          </Text>
                          <View style={[styles.matchTag, isSpark ? styles.matchTagSpark : styles.matchTagNormal]}>
                            {isSpark && <Ionicons name="flame" size={9} color="#ea580c" style={{ marginRight: 2 }} />}
                            <Text style={[styles.matchTagText, isSpark && styles.matchTagTextSpark]}>
                              {visitor.matchPercentage}%
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.visitorMetaText} numberOfLines={1}>
                          {canView
                            ? `${visitor.visitorFaculty || "คณะวิทยาศาสตร์"} • ${formatTimeAgo(visitor.visitedAt)}`
                            : `แอบส่องเมื่อ ${formatTimeAgo(visitor.visitedAt)}`}
                        </Text>

                        {/* TikTok style small icons */}
                        <View style={styles.miniInsightsRow}>
                          {canView ? (
                            (visitor.sharedInsights || []).slice(0, 2).map((ins, i) => (
                              <View key={i} style={styles.miniInsightBadge}>
                                <Ionicons
                                  name={ins.icon || "sparkles-outline"}
                                  size={11}
                                  color="#475569"
                                  style={{ marginRight: 3 }}
                                />
                                <Text style={styles.miniInsightText}>{getShortInsightName(ins.tag)}</Text>
                              </View>
                            ))
                          ) : (
                            <View style={styles.miniInsightBadgeLocked}>
                              <Ionicons name="lock-closed" size={10} color="#94a3b8" style={{ marginRight: 3 }} />
                              <Text style={styles.miniInsightTextLocked}>ควิซตรงกัน</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Right: Actions */}
                      <View style={styles.actionColRight}>
                        {canView ? (
                          <View style={styles.actionButtonsCluster}>
                            <TouchableOpacity
                              style={[
                                styles.waveSmallBtn,
                                isWaved && styles.waveSmallBtnActive,
                              ]}
                              activeOpacity={0.8}
                              onPress={() => handleQuickWave(visitor)}
                            >
                              <Ionicons
                                name={isWaved ? "checkmark" : "hand-right-outline"}
                                size={12}
                                color={isWaved ? "#059669" : "#0f172a"}
                                style={{ marginRight: 3 }}
                              />
                              <Text
                                style={[
                                  styles.waveSmallBtnText,
                                  isWaved && styles.waveSmallBtnTextActive,
                                ]}
                              >
                                {isWaved ? "ทักแล้ว" : "ทักทาย"}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.chatIconSmallBtn}
                              activeOpacity={0.8}
                              onPress={() => handleOpenChat(visitor)}
                            >
                              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#0f172a" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.unlockPillBtn}>
                            <Ionicons name="key-outline" size={12} color="#0284c7" style={{ marginRight: 3 }} />
                            <Text style={styles.unlockPillBtnText}>
                              {(peekPasses || 0) > 0 ? "ใช้ตั๋ว" : "ดู"}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Bottom Teaser Paywall Banner (for Free Users) */}
            {!isBubbleUser && (
              <View style={styles.teaserLockBox}>
                <View style={styles.teaserLockHeader}>
                  <View style={styles.teaserLockIconCircle}>
                    <MaterialCommunityIcons name="chart-bubble" size={18} color="#0284c7" />
                  </View>
                  <Text style={styles.teaserLockTitle}>
                    อยากรู้ว่าใครที่เคมีตรงกันแอบส่องอยู่?
                  </Text>
                </View>
                <Text style={styles.teaserLockSubtitle}>
                  ปลดล็อกสิทธิ์ผู้ใช้ฟองสบู่เพื่อดูรูปจริง ชื่อ คณะ และจุดร่วมควิซที่ตอบตรงกันทั้งหมด พร้อมส่งข้อความทักทายได้ทันที
                </Text>
                <TouchableOpacity
                  style={styles.unlockBtn}
                  activeOpacity={0.85}
                  onPress={() => setPaywallVisible(true)}
                >
                  <Ionicons name="sparkles" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.unlockBtnText}>
                    ทดลองสิทธิ์ผู้ใช้ฟองสบู่ฟรี 7 วัน
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Developer Sandbox */}
            <View style={styles.devBar}>
              <Text style={styles.devBarTitle}>พื้นที่ควบคุมการทดสอบ</Text>
              <View style={styles.devBtnRow}>
                <TouchableOpacity
                  style={styles.devBtn}
                  onPress={() => togglePremiumMock()}
                >
                  <Text style={styles.devBtnText}>
                    {isBubbleUser ? "สลับเป็น Free" : "สลับเป็น Bubble User"}
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

            <View style={{ height: 30 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Embedded Paywall Modal */}
      <BubbleUpgradeModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        mode="paywall"
        featureReason="profile_views"
      />

      {/* Embedded Warning Modal */}
      <BubbleUpgradeModal
        visible={warningVisible}
        onClose={() => setWarningVisible(false)}
        mode="warning"
      />

      {/* Embedded Chat Modal */}
      <ChatModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        initialFriendId={chatTargetUser?.id}
        initialFriendData={chatTargetUser}
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
                <Ionicons name="hand-right" size={24} color={colors.ink} />
              </View>
              <Text style={styles.icebreakerTitle}>ส่งสัญญาณทักทายแล้ว</Text>
              <Text style={styles.icebreakerSub}>
                เคมีตรงกันขนาดนี้ เริ่มต้นชวนคุยด้วยประเด็นนี้ได้เลย:
              </Text>
            </View>

            {/* Conversation Starter Bubble */}
            <View style={styles.quoteBubble}>
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color={colors.primary}
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.quoteText}>"{icebreakerText}"</Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.directChatBtn}
              activeOpacity={0.88}
              onPress={async () => {
                if (activeVisitor) {
                  setIcebreakerModalVisible(false);
                  const targetObj = {
                    id: activeVisitor.visitorId,
                    name: activeVisitor.visitorName,
                    image: activeVisitor.visitorImage,
                  };
                  await startChatWithUser(targetObj, icebreakerText);
                  setChatTargetUser(targetObj);
                  setChatVisible(true);
                }
              }}
            >
              <Ionicons name="chatbubbles" size={17} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.directChatBtnText}>ทักแชทคนนี้ทันที (เปิดคุยเลย)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyStarterBtn}
              activeOpacity={0.85}
              onPress={() => {
                Alert.alert(
                  "คัดลอกสำเร็จ",
                  "นำประโยคนี้ไปทักทายในแชทหรือโซเชียลมีเดียได้เลย"
                );
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
              <Ionicons name="person-outline" size={16} color={colors.ink} style={{ marginRight: 6 }} />
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
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },
  mainTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillBubble: {
    backgroundColor: "#e0f2fe",
    borderColor: "#bae6fd",
  },
  statusPillBubbleText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0284c7",
  },
  statusPillFree: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  statusPillFreeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748b",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  statsSummaryBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  statSummaryNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 1,
  },
  statSummaryLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748b",
  },
  sparkStatNumRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statSummaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 8,
  },
  incognitoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 12,
  },
  incognitoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  incognitoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  incognitoTextGroup: {
    flex: 1,
  },
  incognitoTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 1,
  },
  incognitoSubtitle: {
    fontSize: 10.5,
    color: "#64748b",
    lineHeight: 14,
  },
  incognitoSwitchPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  incognitoSwitchPillActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#7dd3fc",
  },
  incognitoSwitchText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  incognitoSwitchTextActive: {
    color: "#0284c7",
  },
  incognitoLockPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  incognitoLockText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  sparkBannerSoft: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  sparkBannerIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sparkBannerText: {
    fontSize: 11.5,
    color: "#9f1239",
    flex: 1,
    lineHeight: 16,
    fontWeight: "500",
  },
  sparkTeaserBannerSoft: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  sparkTeaserTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  sparkTeaserTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#9f1239",
    marginBottom: 1,
  },
  sparkTeaserSub: {
    fontSize: 10.5,
    color: "#be123c",
  },
  filterTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterTabPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterTabPillActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
  },
  filterTabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 11.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  visitorsList: {
    gap: 8,
  },
  visitorRowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  visitorRowCardSpark: {
    backgroundColor: "#ffffff",
    borderColor: "#fecdd3",
  },
  visitorRowCardLocked: {
    backgroundColor: "#fafafa",
    borderColor: "#f1f5f9",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 10,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  avatarLocked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  flameMiniBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ea580c",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  visitorCenterCol: {
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  visitorNameText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
    maxWidth: 140,
  },
  matchTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  matchTagNormal: {
    backgroundColor: "#f1f5f9",
  },
  matchTagSpark: {
    backgroundColor: "#ffedd5",
  },
  matchTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  matchTagTextSpark: {
    color: "#ea580c",
  },
  visitorMetaText: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  miniInsightsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  miniInsightBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniInsightText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  miniInsightBadgeLocked: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniInsightTextLocked: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
  },
  actionColRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  actionButtonsCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  waveSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  waveSmallBtnActive: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  waveSmallBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  waveSmallBtnTextActive: {
    color: "#059669",
  },
  chatIconSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  unlockPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  unlockPillBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284c7",
  },
  teaserLockBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  teaserLockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teaserLockIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  teaserLockTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  teaserLockSubtitle: {
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
    marginBottom: 12,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    borderRadius: 10,
    paddingVertical: 10,
  },
  unlockBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  devBar: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  devBarTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 6,
    textAlign: "center",
  },
  devBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  devBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  devBtnText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#475569",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icebreakerCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  icebreakerHeader: {
    alignItems: "center",
    marginBottom: 14,
  },
  waveIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icebreakerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  icebreakerSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },
  quoteBubble: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  quoteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 19,
    fontStyle: "italic",
  },
  directChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    marginBottom: 8,
  },
  directChatBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  copyStarterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 9,
    marginBottom: 8,
  },
  copyStarterBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0f172a",
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 9,
    marginBottom: 8,
  },
  viewProfileBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  closeIcebreakerBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  closeIcebreakerBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
});
