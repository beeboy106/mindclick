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
import { colors, shadows } from "../lib/theme";
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
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  if (diffDay === 1) return "เมื่อวานนี้";
  return `${diffDay} วันที่แล้ว`;
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
    if (!isBubbleUser) {
      setPaywallVisible(true);
      return;
    }
    if (onSelectUser && visitor.visitorId) {
      onClose();
      onSelectUser(visitor.visitorId);
    }
  };

  const handleQuickWave = (visitor) => {
    if (!isBubbleUser) {
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

  const handleOpenChat = async (visitor) => {
    if (!isBubbleUser) {
      setPaywallVisible(true);
      return;
    }
    const targetObj = {
      id: visitor.visitorId,
      name: visitor.visitorName,
      image: visitor.visitorImage,
    };
    await startChatWithUser(targetObj);
    setChatTargetUser(targetObj);
    setChatVisible(true);
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
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>

            <View style={styles.headerTitleBox}>
              <Text style={styles.eyebrowText}>MIND-INSIGHT VISITORS</Text>
              <Text style={styles.mainTitleText}>ประวัติการส่องโปรไฟล์</Text>
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
                    size={14}
                    color="#0284c7"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.statusPillBubbleText}>ผู้ใช้ฟองสบู่</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color={colors.mutedForeground}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.statusPillFreeText}>ผู้ใช้ทั่วไป</Text>
                </>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 2-Column Summary Metric Cards */}
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconCircleBlue}>
                  <Ionicons name="eye-outline" size={22} color="#0284c7" />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricNumber}>{viewCount} คน</Text>
                  <Text style={styles.metricLabel}>คนส่องโปรไฟล์ 30 วัน</Text>
                </View>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconCircleCoral}>
                  <Ionicons name="flame" size={22} color="#ea580c" />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricNumber}>{sparkVisitorsCount} คน</Text>
                  <Text style={styles.metricLabel}>เคมีตรงกัน Spark (>80%)</Text>
                </View>
              </View>
            </View>

            {/* Incognito Mode Banner */}
            <View style={styles.incognitoBanner}>
              <View style={styles.incognitoLeft}>
                <View style={styles.incognitoIconBox}>
                  <Ionicons
                    name={isIncognito && isBubbleUser ? "glasses" : "eye-outline"}
                    size={20}
                    color={colors.ink}
                  />
                </View>
                <View style={styles.incognitoTextBox}>
                  <Text style={styles.incognitoTitle}>โหมดซ่อนตัว (Incognito Mode)</Text>
                  <Text style={styles.incognitoDesc}>
                    {isBubbleUser
                      ? isIncognito
                        ? "เปิดอยู่: ส่องโปรไฟล์ผู้อื่นได้แบบไร้ร่องรอย ไม่บันทึกในประวัติ"
                        : "ปิดอยู่: เมื่อคุณส่องโปรไฟล์ใคร ชื่อของคุณจะแสดงในประวัติของเขา"
                      : "ส่องแบบไร้ร่องรอย (สิทธิพิเศษเฉพาะผู้ใช้ฟองสบู่)"}
                  </Text>
                </View>
              </View>

              {isBubbleUser ? (
                <TouchableOpacity
                  style={[
                    styles.incognitoToggleBtn,
                    isIncognito && styles.incognitoToggleBtnActive,
                  ]}
                  onPress={toggleIncognito}
                  activeOpacity={0.82}
                >
                  <Ionicons
                    name={isIncognito ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={colors.ink}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.incognitoToggleBtnText}>
                    {isIncognito ? "เปิด" : "ปิด"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.incognitoLockBtn}
                  onPress={() => setPaywallVisible(true)}
                  activeOpacity={0.82}
                >
                  <Ionicons name="lock-closed" size={13} color={colors.ink} style={{ marginRight: 4 }} />
                  <Text style={styles.incognitoLockBtnText}>ปลดล็อก</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Mutual Spark Teaser / Notice Banner */}
            {hasSparkVisitor && (
              <>
                {isBubbleUser ? (
                  <View style={styles.sparkActiveBanner}>
                    <View style={styles.sparkFlameBadge}>
                      <Ionicons name="flame" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.sparkActiveText}>
                      พบสัญญาณ <Text style={{ fontWeight: "900" }}>Mutual Spark ({sparkVisitorsCount} คน)</Text> เคมีเข้ากันได้เกิน 80%! สามารถส่งสัญญาณทักทายด้วย Mind-Insight ได้ทันที
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.sparkTeaserBanner}
                    activeOpacity={0.88}
                    onPress={() => setPaywallVisible(true)}
                  >
                    <View style={styles.sparkFlameCircle}>
                      <Ionicons name="flame" size={24} color="#ffffff" />
                    </View>
                    <View style={styles.sparkTextBox}>
                      <View style={styles.sparkHeaderRow}>
                        <Text style={styles.sparkEyebrow}>MUTUAL SPARK DETECTED</Text>
                      </View>
                      <Text style={styles.sparkTitle}>
                        มีคนเคมีตรงกับคุณถึง {topSparkVisitor?.matchPercentage || 85}% แอบมาส่อง!
                      </Text>
                      <Text style={styles.sparkSubtitle}>
                        ปลดล็อกสิทธิ์ผู้ใช้ฟองสบู่ เพื่อดูตัวจริงและทักทายกลับทันที
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={colors.ink} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === "all" && styles.filterChipActive,
                ]}
                activeOpacity={0.82}
                onPress={() => setActiveFilter("all")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === "all" && styles.filterChipTextActive,
                  ]}
                >
                  ทั้งหมด ({profileViews.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === "spark" && styles.filterChipActive,
                ]}
                activeOpacity={0.82}
                onPress={() => setActiveFilter("spark")}
              >
                <Ionicons
                  name="flame"
                  size={14}
                  color={activeFilter === "spark" ? colors.white : "#ea580c"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === "spark" && styles.filterChipTextActive,
                  ]}
                >
                  เคมีตรงกัน Spark ({sparkVisitorsCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Visitors List Section */}
            {filteredVisitors.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="telescope-outline" size={36} color={colors.ink} />
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

                  return (
                    <TouchableOpacity
                      key={visitor.visitorId || index}
                      style={[
                        styles.visitorCard,
                        isSpark && isBubbleUser && styles.visitorCardSpark,
                        !isBubbleUser && styles.visitorCardBlurred,
                      ]}
                      activeOpacity={0.88}
                      onPress={() => handleOpenVisitor(visitor)}
                    >
                      {/* Top Row: Avatar + Info + Match Badge */}
                      <View style={styles.cardTopRow}>
                        {/* Avatar Box */}
                        <View style={styles.avatarBox}>
                          {isBubbleUser && visitor.visitorImage ? (
                            <Image
                              source={{ uri: visitor.visitorImage }}
                              style={styles.visitorAvatar}
                            />
                          ) : isBubbleUser ? (
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
                              <Ionicons name="flame" size={11} color="#ffffff" />
                            </View>
                          )}
                        </View>

                        {/* Info Box */}
                        <View style={styles.visitorInfo}>
                          {isBubbleUser ? (
                            <>
                              <View style={styles.nameRow}>
                                <Text style={styles.visitorName} numberOfLines={1}>
                                  {visitor.visitorName}
                                </Text>
                                {isSpark && (
                                  <View style={styles.sparkBadgePill}>
                                    <Text style={styles.sparkBadgePillText}>SPARK</Text>
                                  </View>
                                )}
                              </View>
                              <View style={styles.facultyPill}>
                                <Ionicons
                                  name="school-outline"
                                  size={12}
                                  color={colors.ink}
                                  style={{ marginRight: 4 }}
                                />
                                <Text style={styles.facultyPillText}>
                                  {visitor.visitorFaculty || "คณะวิทยาศาสตร์"}
                                </Text>
                              </View>
                            </>
                          ) : (
                            <>
                              <View style={styles.teaserNameRow}>
                                <Ionicons name="lock-closed" size={12} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                                <Text style={styles.teaserNameText} numberOfLines={1}>
                                  เพื่อนจาก{visitor.visitorFaculty || "ต่างคณะ"}
                                </Text>
                              </View>
                              <View style={styles.facultyPill}>
                                <Text style={styles.facultyPillText}>
                                  แอบส่องเมื่อ {formatTimeAgo(visitor.visitedAt)}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>

                        {/* Match & Time Column */}
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
                              color={isSpark ? "#ea580c" : "#e11d48"}
                              style={{ marginRight: 3 }}
                            />
                            <Text
                              style={[
                                styles.matchPillText,
                                isSpark && styles.matchPillTextSpark,
                              ]}
                            >
                              {visitor.matchPercentage}%
                            </Text>
                          </View>
                          {isBubbleUser && (
                            <Text style={styles.visitorTime}>
                              {formatTimeAgo(visitor.visitedAt)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Middle Row: Shared Mind-Insights */}
                      <View style={styles.mindInsightRow}>
                        {isBubbleUser ? (
                          <>
                            <Text style={styles.mindInsightLabel}>จุดร่วมที่ตอบตรงกัน:</Text>
                            <View style={styles.insightsList}>
                              {(visitor.sharedInsights || []).map((ins, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.insightChip,
                                    { backgroundColor: ins.color || "#fef08a" },
                                  ]}
                                >
                                  <Ionicons
                                    name={ins.icon || "sparkles"}
                                    size={12}
                                    color={colors.ink}
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text style={styles.insightChipText}>{ins.tag}</Text>
                                </View>
                              ))}
                            </View>
                          </>
                        ) : (
                          <View style={styles.freeInsightTeaser}>
                            <Ionicons name="sparkles" size={13} color="#b45309" style={{ marginRight: 6 }} />
                            <Text style={styles.freeInsightTeaserText}>
                              ตอบคำถามควิซตรงกันในหมวดไลฟ์สไตล์ (ล็อก)
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Bottom Action Row */}
                      {isBubbleUser ? (
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
                              name={isWaved ? "checkmark-circle" : "hand-right-outline"}
                              size={14}
                              color={colors.ink}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.waveBtnText}>
                              {isWaved ? "ทักแล้ว (ดูหัวข้อชวนคุย)" : "ทักทายด้วย Mind-Insight"}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.chatMiniBtn}
                            activeOpacity={0.82}
                            onPress={() => handleOpenChat(visitor)}
                          >
                            <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.ink} style={{ marginRight: 4 }} />
                            <Text style={styles.chatMiniBtnText}>เปิดแชท</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.teaserCardFooter}>
                          <Ionicons name="key-outline" size={13} color="#0284c7" style={{ marginRight: 6 }} />
                          <Text style={styles.teaserCardFooterText}>
                            แตะเพื่อปลดล็อกดูตัวจริงและจุดเชื่อมโยง
                          </Text>
                        </View>
                      )}
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
                    <Ionicons name="sparkles" size={20} color="#0284c7" />
                  </View>
                  <Text style={styles.teaserLockTitle}>
                    อยากรู้ว่าใครที่เคมีตรงกับคุณกำลังแอบส่องอยู่?
                  </Text>
                </View>
                <Text style={styles.teaserLockSubtitle}>
                  ปลดล็อกสิทธิ์ผู้ใช้ฟองสบู่ เพื่อดูรูปจริง ชื่อ คณะ และจุดร่วมที่ตอบตรงกันทั้งหมด พร้อมส่งข้อความทักทายได้ทันที
                </Text>
                <TouchableOpacity
                  style={styles.unlockBtn}
                  activeOpacity={0.88}
                  onPress={() => setPaywallVisible(true)}
                >
                  <MaterialCommunityIcons name="chart-bubble" size={18} color={colors.ink} style={{ marginRight: 6 }} />
                  <Text style={styles.unlockBtnText}>
                    ปลดล็อกสิทธิ์ผู้ใช้ฟองสบู่ (ทดลองฟรี 7 วัน)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Developer Sandbox */}
            <View style={styles.devBar}>
              <Text style={styles.devBarTitle}>DEVELOPER SANDBOX</Text>
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
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.neo,
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  statusPillBubble: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0284c7",
  },
  statusPillBubbleText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0284c7",
  },
  statusPillFree: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  statusPillFreeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedForeground,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.neo,
  },
  metricIconCircleBlue: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  metricIconCircleCoral: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#ffedd5",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  metricContent: {
    flex: 1,
  },
  metricNumber: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.mutedForeground,
    lineHeight: 14,
  },
  incognitoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    ...shadows.neo,
  },
  incognitoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  incognitoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  incognitoTextBox: {
    flex: 1,
  },
  incognitoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  incognitoDesc: {
    fontSize: 10.5,
    color: colors.mutedForeground,
    lineHeight: 14,
  },
  incognitoToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  incognitoToggleBtnActive: {
    backgroundColor: "#bbf44a",
  },
  incognitoToggleBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  incognitoLockBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef08a",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  incognitoLockBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  sparkActiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 2,
    borderColor: "#e11d48",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    ...shadows.neo,
  },
  sparkFlameBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sparkActiveText: {
    fontSize: 12,
    color: colors.ink,
    flex: 1,
    lineHeight: 17,
  },
  sparkTeaserBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 2,
    borderColor: "#e11d48",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    ...shadows.neo,
  },
  sparkFlameCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e11d48",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sparkTextBox: {
    flex: 1,
  },
  sparkHeaderRow: {
    marginBottom: 2,
  },
  sparkEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: "#e11d48",
    letterSpacing: 0.5,
  },
  sparkTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  sparkSubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: colors.ink,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    ...shadows.neo,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 4,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  visitorsList: {
    gap: 12,
  },
  visitorCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    padding: 14,
    ...shadows.neo,
  },
  visitorCardSpark: {
    backgroundColor: "#fffdf9",
    borderColor: "#e11d48",
  },
  visitorCardBlurred: {
    backgroundColor: "#fafafc",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarBox: {
    position: "relative",
    marginRight: 10,
  },
  visitorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  visitorAvatarInitial: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: "#fef08a",
    alignItems: "center",
    justifyContent: "center",
  },
  visitorAvatarInitialText: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.ink,
  },
  teaserAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  flameAvatarBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ea580c",
    borderWidth: 1.5,
    borderColor: colors.white,
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
    fontSize: 14,
    fontWeight: "900",
    color: colors.ink,
    marginRight: 6,
  },
  sparkBadgePill: {
    backgroundColor: "#fff1f2",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e11d48",
  },
  sparkBadgePillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#e11d48",
  },
  facultyPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  facultyPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  teaserNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  teaserNameText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  matchColumn: {
    alignItems: "flex-end",
  },
  matchPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  matchPillNormal: {
    backgroundColor: "#fce7f3",
  },
  matchPillSpark: {
    backgroundColor: "#ffedd5",
    borderColor: "#ea580c",
  },
  matchPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  matchPillTextSpark: {
    color: "#ea580c",
  },
  visitorTime: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  mindInsightRow: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 8,
    marginTop: 2,
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
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
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
    color: "#b45309",
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  waveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bbf44a",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...shadows.neo,
  },
  waveBtnActive: {
    backgroundColor: "#86efac",
  },
  waveBtnText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: colors.ink,
  },
  chatMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...shadows.neo,
  },
  chatMiniBtnText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: colors.ink,
  },
  teaserCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 6,
    paddingVertical: 6,
    marginTop: 8,
  },
  teaserCardFooterText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
  },
  teaserLockBox: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    marginBottom: 10,
    ...shadows.neo,
  },
  teaserLockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  teaserLockIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  teaserLockTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: colors.ink,
    flex: 1,
  },
  teaserLockSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 18,
    marginBottom: 14,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 12,
    ...shadows.neo,
  },
  unlockBtnText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: colors.ink,
  },
  devBar: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.darkBorder,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  devBarTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.mutedForeground,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  devBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  devBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  devBtnText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: colors.ink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icebreakerCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: colors.darkBorder,
    padding: 20,
    ...shadows.neo,
  },
  icebreakerHeader: {
    alignItems: "center",
    marginBottom: 14,
  },
  waveIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...shadows.neo,
  },
  icebreakerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 4,
  },
  icebreakerSub: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 17,
  },
  quoteBubble: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 20,
    fontStyle: "italic",
  },
  directChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 8,
    ...shadows.neo,
  },
  directChatBtnText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: colors.white,
  },
  copyStarterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bbf44a",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 8,
    ...shadows.neo,
  },
  copyStarterBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink,
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  viewProfileBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.ink,
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
