import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCrossBubble } from "../../context/CrossBubbleContext";
import CrossBubbleAvatar from "../../components/crossbubble/CrossBubbleAvatar";

export default function MissionsScreen() {
  const navigation = useNavigation();
  const {
    streakDays,
    isFlameActive,
    bubblePoints,
    dailyMissions,
    claimMissionReward,
    shopAvatars,
    unlockedAvatars,
    unlockAvatar,
    userAlias,
    changeMascot,
    toggleCrossBubbleMode,
    exchangePeekPass,
    exchangeTrialExtension,
    exchangeFlameShield,
    peekPasses,
  } = useCrossBubble();

  const handleClaim = (mission) => {
    claimMissionReward(mission.id);
    Alert.alert("รับรางวัลสำเร็จ", `คุณได้รับ +${mission.points} Bubble Points เรียบร้อยแล้ว`);
  };

  const handleUnlockAvatar = (item) => {
    if (unlockedAvatars.includes(item.id)) {
      // สวมใส่ทันที
      changeMascot(item.id);
      Alert.alert("สวมใส่อวาตารสำเร็จ", `คุณได้สวมใส่อวาตาร "${item.name}" เรียบร้อยแล้ว`);
      return;
    }

    if (bubblePoints < item.cost) {
      Alert.alert(
        "แต้มไม่เพียงพอ",
        `คุณมี ${bubblePoints} แต้ม แต่ต้องใช้ ${item.cost} แต้มเพื่อปลดล็อคอวาตาร "${item.name}" ทำภารกิจรายวันเพื่อสะสมแต้มเพิ่มได้เลย`
      );
      return;
    }

    Alert.alert(
      "ยืนยันการปลดล็อค",
      `ต้องการใช้ ${item.cost} แต้ม เพื่อปลดล็อคและสวมใส่อวาตาร "${item.name}" ทันทีหรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ปลดล็อค",
          onPress: () => {
            const success = unlockAvatar(item.id, item.cost);
            if (success) {
              Alert.alert("ปลดล็อคสำเร็จ", `ปลดล็อคและสวมใส่อวาตาร "${item.name}" ให้คุณเรียบร้อยแล้ว`);
            }
          },
        },
      ]
    );
  };

  const handleExchangePeekPass = () => {
    if (bubblePoints < 40) {
      Alert.alert(
        "แต้มไม่เพียงพอ",
        `คุณมี ${bubblePoints} แต้ม แต่ต้องใช้ 40 แต้มเพื่อแลกตั๋วส่องโปรไฟล์ 1 ใบ ทำภารกิจรายวันเพื่อสะสมแต้มเพิ่มได้เลย`
      );
      return;
    }

    Alert.alert(
      "ยืนยันการแลกตั๋ว",
      "ต้องการใช้ 40 Bubble Points เพื่อแลกตั๋วส่องโปรไฟล์ 1 ใบหรือไม่? (ใช้เปิดดูโปรไฟล์และ Shared Insights ของคนที่มาส่องคุณได้ทันทีในหน้าแจ้งเตือน)",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "แลกตั๋ว",
          onPress: () => {
            const ok = exchangePeekPass(40);
            if (ok) {
              Alert.alert(
                "แลกสิทธิ์สำเร็จ",
                "คุณได้รับตั๋วส่องโปรไฟล์ 1 ใบเรียบร้อยแล้ว นำไปใช้เปิดดูผู้มาส่องโปรไฟล์ในหน้าแจ้งเตือนได้ทันที"
              );
            }
          },
        },
      ]
    );
  };

  const handleExchangeTrial = () => {
    if (bubblePoints < 80) {
      Alert.alert(
        "แต้มไม่เพียงพอ",
        `คุณมี ${bubblePoints} แต้ม แต่ต้องใช้ 80 แต้มเพื่อขยายเวลาทดลองใช้งานผู้ใช้ฟองสบู่เพิ่ม 1 วัน`
      );
      return;
    }

    Alert.alert(
      "ยืนยันการขยายเวลา",
      "ต้องการใช้ 80 Bubble Points เพื่อขยายเวลาทดลองใช้งานผู้ใช้ฟองสบู่เพิ่ม 1 วันเต็มหรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ขยายเวลา",
          onPress: () => {
            const ok = exchangeTrialExtension(80);
            if (ok) {
              Alert.alert(
                "ขยายเวลาสำเร็จ",
                "เพิ่มวันทดลองใช้งานผู้ใช้ฟองสบู่ให้คุณอีก 1 วันเรียบร้อยแล้ว สามารถเข้าถึงฟังก์ชันพิเศษทั้งหมดได้อย่างต่อเนื่อง"
              );
            }
          },
        },
      ]
    );
  };

  const handleExchangeFlameShield = () => {
    if (bubblePoints < 50) {
      Alert.alert(
        "แต้มไม่เพียงพอ",
        `คุณมี ${bubblePoints} แต้ม แต่ต้องใช้ 50 แต้มเพื่อแลกเกราะพิทักษ์ไฟสตรีค`
      );
      return;
    }

    Alert.alert(
      "ยืนยันการแลกเกราะ",
      "ต้องการใช้ 50 Bubble Points เพื่อจุดไฟสตรีคและคุ้มครองไฟของคุณหรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "แลกเกราะ",
          onPress: () => {
            const ok = exchangeFlameShield(50);
            if (ok) {
              Alert.alert(
                "คุ้มครองไฟสำเร็จ",
                "ไฟสตรีคของคุณได้รับการเพิ่มและคุ้มครองสถานะไฟเรียบร้อยแล้ว"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>ภารกิจ & สถานะไฟ</Text>
        </View>
        <TouchableOpacity
          style={styles.exitBtn}
          activeOpacity={0.8}
          onPress={() => toggleCrossBubbleMode(false)}
        >
          <Ionicons name="log-out-outline" size={15} color="#64748b" />
          <Text style={styles.exitBtnText}>กลับสู่โหมดปกติ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Flame Status Card */}
        <View style={styles.flameCard}>
          <View style={styles.flameTopRow}>
            <View style={styles.flameIconCircle}>
              <Ionicons
                name="flame"
                size={26}
                color={isFlameActive ? "#17171c" : "#94a3b8"}
              />
            </View>
            <View style={styles.flameTextCol}>
              <Text style={styles.flameCardTitle}>
                {streakDays} วันต่อเนื่อง
              </Text>
            </View>
            <View style={[styles.flameBadge, isFlameActive && styles.flameBadgeActive]}>
              <Ionicons name="flash" size={12} color="#17171c" />
              <Text style={styles.flameBadgeText}>
                {isFlameActive ? "ไฟลุกโชน" : "ไฟมอด"}
              </Text>
            </View>
          </View>
          <View style={styles.flameDivider} />
          <View style={styles.flameNoticeRow}>
            <Ionicons name="information-circle-outline" size={14} color="#64748b" />
            <Text style={styles.flameNoticeText}>
              ทำภารกิจให้ครบทุกวันเพื่อรักษาสถานะไฟ หากหยุดทำภารกิจเกิน 2 วัน สถานะไฟจะดับลง
            </Text>
          </View>
        </View>

        {/* Bubble Points Summary */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsCol}>
            <Text style={styles.pointsLabel}>ยอดแต้มสะสมปัจจุบัน</Text>
            <Text style={styles.pointsValue}>{bubblePoints} PTS</Text>
          </View>
          <View style={styles.pointsIconCircle}>
            <Ionicons name="sparkles" size={20} color="#17171c" />
          </View>
        </View>

        {/* Daily Missions List Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ภารกิจประจำวัน</Text>
          <Text style={styles.sectionBadge}>รีเซ็ตทุก 19:00</Text>
        </View>

        {dailyMissions.map((item) => {
          const isDone = item.progress >= item.target;
          const progressPercent = Math.min(100, Math.round((item.progress / item.target) * 100));

          return (
            <View key={item.id} style={styles.missionCard}>
              <View style={styles.missionTopRow}>
                <View style={styles.missionIconBox}>
                  <Ionicons name={item.icon || "flag-outline"} size={18} color="#17171c" />
                </View>
                <View style={styles.missionInfoCol}>
                  <Text style={styles.missionTitle}>{item.title}</Text>
                  <Text style={styles.missionDesc}>{item.description}</Text>
                </View>
                <View style={styles.missionPointsTag}>
                  <Text style={styles.missionPointsText}>+{item.points} PTS</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {item.progress}/{item.target}
                </Text>
              </View>

              {/* Action Button */}
              {item.claimed ? (
                <View style={styles.claimedBadge}>
                  <Ionicons name="checkmark-circle" size={15} color="#15803d" />
                  <Text style={styles.claimedText}>รับรางวัลแล้ว</Text>
                </View>
              ) : isDone ? (
                <TouchableOpacity
                  style={styles.claimBtn}
                  activeOpacity={0.85}
                  onPress={() => handleClaim(item)}
                >
                  <Ionicons name="gift-outline" size={15} color="#17171c" />
                  <Text style={styles.claimBtnText}>กดรับรางวัล</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.goToMissionBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (item.targetTab) {
                      navigation.navigate(item.targetTab);
                    }
                  }}
                >
                  <Text style={styles.goToMissionBtnText}>ไปทำภารกิจ</Text>
                  <Ionicons name="arrow-forward" size={14} color="#17171c" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Points Perk Exchange Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>แลกสิทธิประโยชน์ด้วยแต้มสะสม</Text>
          <Text style={styles.sectionBadge}>ใช้งานได้จริง</Text>
        </View>

        {/* Perk 1: Profile Peek Pass */}
        <View style={styles.perkCard}>
          <View style={styles.perkTopRow}>
            <View style={styles.perkIconBox}>
              <Ionicons name="eye-outline" size={22} color="#17171c" />
            </View>
            <View style={styles.perkInfoCol}>
              <View style={styles.perkTitleRow}>
                <Text style={styles.perkTitle}>ตั๋วส่องโปรไฟล์ 1 ครั้ง</Text>
                <View style={styles.perkCostTag}>
                  <Text style={styles.perkCostText}>40 PTS</Text>
                </View>
              </View>
              <Text style={styles.perkDesc}>
                เปิดดูโปรไฟล์และ Shared Insights ของคนที่มาส่องคุณ 1 ครั้ง โดยไม่ต้องสมัครรายเดือน
              </Text>
              <Text style={styles.perkBalanceNotice}>
                ตั๋วที่คุณมีในครอบครอง: {peekPasses || 0} ใบ
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.perkActionBtn, bubblePoints < 40 && styles.perkActionBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleExchangePeekPass}
          >
            <Ionicons name="sparkles" size={15} color={bubblePoints >= 40 ? "#17171c" : "#94a3b8"} />
            <Text style={[styles.perkActionBtnText, bubblePoints < 40 && styles.perkActionBtnTextDisabled]}>
              {bubblePoints >= 40 ? "แลกตั๋วส่องโปรไฟล์ (40 PTS)" : "แต้มไม่พอ (ต้องการ 40 PTS)"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Perk 2: Extend Bubble Trial */}
        <View style={styles.perkCard}>
          <View style={styles.perkTopRow}>
            <View style={styles.perkIconBox}>
              <Ionicons name="hourglass-outline" size={22} color="#17171c" />
            </View>
            <View style={styles.perkInfoCol}>
              <View style={styles.perkTitleRow}>
                <Text style={styles.perkTitle}>ขยายเวลาผู้ใช้ฟองสบู่ +1 วัน</Text>
                <View style={styles.perkCostTag}>
                  <Text style={styles.perkCostText}>80 PTS</Text>
                </View>
              </View>
              <Text style={styles.perkDesc}>
                เพิ่มวันทดลองใช้งานฟีเจอร์พรีเมียมทั้งหมดต่ออีก 1 วันเต็ม เพื่อใช้งานต่อเนื่อง
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.perkActionBtn, bubblePoints < 80 && styles.perkActionBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleExchangeTrial}
          >
            <Ionicons name="time" size={15} color={bubblePoints >= 80 ? "#17171c" : "#94a3b8"} />
            <Text style={[styles.perkActionBtnText, bubblePoints < 80 && styles.perkActionBtnTextDisabled]}>
              {bubblePoints >= 80 ? "แลกวันใช้งาน (+1 วัน 80 PTS)" : "แต้มไม่พอ (ต้องการ 80 PTS)"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Perk 3: Flame Shield */}
        <View style={styles.perkCard}>
          <View style={styles.perkTopRow}>
            <View style={styles.perkIconBox}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#17171c" />
            </View>
            <View style={styles.perkInfoCol}>
              <View style={styles.perkTitleRow}>
                <Text style={styles.perkTitle}>เกราะพิทักษ์ไฟสตรีค</Text>
                <View style={styles.perkCostTag}>
                  <Text style={styles.perkCostText}>50 PTS</Text>
                </View>
              </View>
              <Text style={styles.perkDesc}>
                จุดไฟสตรีคของคุณให้ลุกโชนต่อเนื่อง และป้องกันไฟมอดหากหยุดทำภารกิจ
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.perkActionBtn, bubblePoints < 50 && styles.perkActionBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleExchangeFlameShield}
          >
            <Ionicons name="flame" size={15} color={bubblePoints >= 50 ? "#17171c" : "#94a3b8"} />
            <Text style={[styles.perkActionBtnText, bubblePoints < 50 && styles.perkActionBtnTextDisabled]}>
              {bubblePoints >= 50 ? "แลกเกราะพิทักษ์ไฟ (50 PTS)" : "แต้มไม่พอ (ต้องการ 50 PTS)"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Shop Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ร้านค้าปลดล็อคอวาตาร</Text>
          <Text style={styles.sectionBadge}>สะสมแต้มแลก</Text>
        </View>

        <View style={styles.shopGrid}>
          {shopAvatars.map((item) => {
            const isUnlocked = unlockedAvatars.includes(item.id);
            const isEquipped = userAlias?.icon === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.shopCard, isEquipped && styles.shopCardEquipped]}
                activeOpacity={0.85}
                onPress={() => handleUnlockAvatar(item)}
              >
                <View style={styles.shopAvatarWrapper}>
                  <CrossBubbleAvatar
                    avatarId={item.id}
                    size={46}
                    borderRadius={12}
                    borderWidth={isEquipped ? 2 : 1}
                    borderColor={isEquipped ? "#17171c" : "#e2e8f0"}
                  />
                </View>
                <Text style={styles.avatarName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.avatarDesc} numberOfLines={2}>
                  {item.desc || "อวาตารสุดพิเศษสำหรับตัวตนของคุณ"}
                </Text>

                <View
                  style={[
                    styles.avatarActionBtn,
                    isEquipped && styles.avatarBtnEquipped,
                    isUnlocked && !isEquipped && styles.avatarBtnUnlocked,
                  ]}
                >
                  {isEquipped ? (
                    <Text style={styles.avatarBtnTextEquipped}>ใช้งานอยู่</Text>
                  ) : isUnlocked ? (
                    <Text style={styles.avatarBtnTextUnlocked}>สวมใส่</Text>
                  ) : (
                    <Text style={styles.avatarBtnTextLock}>{item.cost} แต้ม</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17171c",
    marginTop: 2,
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    gap: 4,
  },
  exitBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 20,
  },
  flameCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 16,
  },
  flameTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flameIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  flameTextCol: {
    flex: 1,
  },
  flameCardPre: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  flameCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17171c",
    marginTop: 2,
  },
  flameBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    gap: 4,
  },
  flameBadgeActive: {
    backgroundColor: "#c7f65a",
  },
  flameBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#17171c",
  },
  flameDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  flameNoticeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  flameNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
  },
  pointsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#17171c",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  pointsCol: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#c7f65a",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  pointsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17171c",
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  missionCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 12,
  },
  missionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  missionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  missionInfoCol: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17171c",
  },
  missionDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  missionPointsTag: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginLeft: 8,
  },
  missionPointsText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#17171c",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#c7f65a",
  },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17171c",
  },
  claimedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  claimedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  goToMissionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  goToMissionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17171c",
  },
  pendingBadge: {
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  perkCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 12,
  },
  perkTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  perkIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  perkInfoCol: {
    flex: 1,
  },
  perkTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  perkTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
    flex: 1,
  },
  perkCostTag: {
    backgroundColor: "#c7f65a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  perkCostText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#17171c",
  },
  perkDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  perkBalanceNotice: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f766e",
    marginTop: 6,
  },
  perkActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  perkActionBtnDisabled: {
    backgroundColor: "#e2e8f0",
  },
  perkActionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17171c",
  },
  perkActionBtnTextDisabled: {
    color: "#94a3b8",
  },
  shopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shopCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  shopCardEquipped: {
    borderColor: "#c7f65a",
    borderWidth: 2,
    backgroundColor: "#fcfdf7",
  },
  shopAvatarWrapper: {
    marginBottom: 8,
  },
  avatarIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarIconBoxEquipped: {
    borderColor: "#c7f65a",
    borderWidth: 2.5,
    backgroundColor: "#f7fee7",
  },
  avatarName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17171c",
    marginBottom: 4,
  },
  avatarDesc: {
    fontSize: 10.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 10,
    height: 28,
  },
  avatarActionBtn: {
    width: "100%",
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#17171c",
    alignItems: "center",
  },
  avatarBtnUnlocked: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  avatarBtnEquipped: {
    backgroundColor: "#c7f65a",
  },
  avatarBtnTextLock: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  avatarBtnTextUnlocked: {
    fontSize: 11,
    fontWeight: "700",
    color: "#17171c",
  },
  avatarBtnTextEquipped: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
});
