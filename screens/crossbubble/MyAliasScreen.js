import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useNavigation } from "@react-navigation/native";
import CrossBubbleAvatar from "../../components/crossbubble/CrossBubbleAvatar";

export default function MyAliasScreen() {
  const navigation = useNavigation();
  const {
    userAlias,
    updateUserAliasName,
    changeMascot,
    regenerateAlias,
    unlockedAvatars,
    streakDays,
    isFlameActive,
    bubblePoints,
    toggleCrossBubbleMode,
    crossBubbleTheme: theme,
    crossBubbleThemeId,
    crossBubbleThemes,
    setCrossBubbleTheme,
  } = useCrossBubble();

  const { user } = useAuth();
  const { profile } = useData();

  const [aliasNameInput, setAliasNameInput] = useState(userAlias?.nickname || "");
  const [isEditing, setIsEditing] = useState(false);

  const realDisplayName = profile?.name || user?.name || "คุณ";

  const handleSaveName = () => {
    if (!aliasNameInput.trim()) {
      Alert.alert("กรุณากรอกชื่อ", "นามแฝงต้องมีอย่างน้อย 1 ตัวอักษร");
      return;
    }
    updateUserAliasName(aliasNameInput.trim());
    setIsEditing(false);
    Alert.alert("บันทึกสำเร็จ", `เปลี่ยนนามแฝงเป็น "${aliasNameInput.trim()}" เรียบร้อยแล้ว`);
  };

  const handleReroll = async () => {
    const newAlias = await regenerateAlias();
    setAliasNameInput(newAlias.nickname);
    Alert.alert("สุ่มฉายาใหม่สำเร็จ", `ฉายาของคุณตอนนี้คือ: "${newAlias.nickname}"`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.surface} translucent={true} />

      {/* Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>โปรไฟล์ & นามแฝง</Text>
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
        style={[styles.container, { backgroundColor: theme.canvas }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Persona Card */}
        <View style={styles.personaCard}>
          <View style={styles.mascotBigBox}>
            <CrossBubbleAvatar
              avatarId={userAlias?.icon || "avatar_1"}
              size={92}
              borderRadius={22}
              borderWidth={2}
            />
          </View>

          {/* Alias Name Field */}
          {isEditing ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.editNameInput}
                value={aliasNameInput}
                onChangeText={setAliasNameInput}
                placeholder="ตั้งชื่อนามแฝง..."
                placeholderTextColor="#94a3b8"
                autoFocus
              />
              <TouchableOpacity
                style={styles.saveNameBtn}
                activeOpacity={0.85}
                onPress={handleSaveName}
              >
                <Ionicons name="checkmark" size={16} color="#17171c" />
                <Text style={styles.saveNameBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameDisplayRow}>
              <Text style={styles.aliasNickname}>
                {userAlias?.nickname || "กำลังโหลด..."}
              </Text>
              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            <View style={styles.limeBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#17171c" />
              <Text style={styles.limeBadgeText}>ผู้ทลาย Social Bubble</Text>
            </View>
            <View style={styles.facultyBadge}>
              <Text style={styles.facultyBadgeText}>
                {userAlias?.faculty || profile?.faculty || "คณะทั่วไป"}
              </Text>
            </View>
          </View>

          {/* Reroll Button */}
          <TouchableOpacity
            style={styles.rerollBtn}
            activeOpacity={0.8}
            onPress={handleReroll}
          >
            <Ionicons name="dice-outline" size={16} color="#17171c" />
            <Text style={styles.rerollBtnText}>สุ่มฉายาและสไตล์ใหม่</Text>
          </TouchableOpacity>
        </View>

        {/* Stats & Flame Status Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <View style={styles.statIconRow}>
              <Ionicons
                name="flame"
                size={18}
                color={isFlameActive ? "#17171c" : "#94a3b8"}
              />
              <Text style={styles.statValue}>{streakDays} วัน</Text>
            </View>
            <Text style={styles.statLabel}>สถานะไฟต่อเนื่อง</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <View style={styles.statIconRow}>
              <Ionicons name="sparkles" size={18} color="#17171c" />
              <Text style={styles.statValue}>{bubblePoints} PTS</Text>
            </View>
            <Text style={styles.statLabel}>Bubble Points</Text>
          </View>
        </View>

        <View style={[styles.themeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.themeHeadingRow}>
            <View>
              <Text style={[styles.themeTitle, { color: theme.ink }]}>โทนสี Cross Bubble</Text>
              <Text style={[styles.themeSubtitle, { color: theme.muted }]}>ตั้งค่าเฉพาะโหมดนี้ ไม่ตาม Dark Mode ของเครื่อง</Text>
            </View>
            <Ionicons name="color-palette-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.themeGrid}>
            {Object.values(crossBubbleThemes).map((option) => {
              const selected = option.id === crossBubbleThemeId;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.themeOption,
                    { backgroundColor: option.canvas, borderColor: selected ? option.accent : option.border },
                    selected && { borderWidth: 2 },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setCrossBubbleTheme(option.id)}
                >
                  <View style={[styles.themeSwatch, { backgroundColor: option.accent }]} />
                  <Text style={[styles.themeOptionName, { color: option.ink }]}>{option.label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={16} color={option.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Avatar Selection Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>เลือกรูปอวาตารประจำตัว</Text>
          <Text style={styles.sectionCount}>({unlockedAvatars.length} แบบ)</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          แตะไอคอนเพื่อเปลี่ยนอวาตารที่คุณต้องการใช้แสดงในห้องสังสรรค์และห้องมืด
        </Text>

        <View style={styles.avatarsGrid}>
          {unlockedAvatars.map((iconName) => {
            const isSelected = userAlias?.icon === iconName;

            return (
              <TouchableOpacity
                key={iconName}
                style={[
                  styles.avatarChoiceBox,
                  isSelected && styles.avatarChoiceBoxSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => changeMascot(iconName)}
              >
                <CrossBubbleAvatar
                  avatarId={iconName}
                  size={46}
                  borderRadius={10}
                  borderWidth={isSelected ? 2 : 1}
                  borderColor={isSelected ? "#17171c" : "#e2e8f0"}
                />
                {isSelected && (
                  <View style={styles.selectedCheckBadge}>
                    <Ionicons name="checkmark" size={10} color="#17171c" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Mission Shop Banner link */}
        <TouchableOpacity
          style={styles.moreAvatarsBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("MissionsTab")}
        >
          <View style={styles.moreAvatarsIcon}>
            <Ionicons name="gift-outline" size={20} color="#17171c" />
          </View>
          <View style={styles.moreAvatarsTextCol}>
            <Text style={styles.moreAvatarsTitle}>ต้องการอวาตารระดับตำนานเพิ่ม?</Text>
            <Text style={styles.moreAvatarsDesc}>ทำภารกิจรายวันและสะสมแต้มเพื่อปลดล็อคในหน้าร้านค้า</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#17171c" />
        </TouchableOpacity>

        {/* Real Account Info Footer */}
        <View style={styles.realAccountCard}>
          <Text style={styles.realAccountLabel}>บัญชีมหาวิทยาลัยที่เชื่อมต่อ:</Text>
          <Text style={styles.realAccountName}>{realDisplayName}</Text>
          <Text style={styles.realAccountNotice}>
            ข้อมูลจริงของคุณจะถูกเปิดเผยเฉพาะกับเพื่อนที่คุณกดยืนยันแมตช์ในห้องมืดเท่านั้น
          </Text>
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
  personaCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  mascotBigBox: {
    marginBottom: 12,
  },
  mascotBigCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#c7f65a",
    borderWidth: 2,
    borderColor: "#17171c",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  nameDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aliasNickname: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17171c",
  },
  editIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    width: "100%",
  },
  editNameInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#17171c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#17171c",
  },
  saveNameBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#17171c",
    gap: 4,
  },
  saveNameBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17171c",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  limeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  limeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
  facultyBadge: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  facultyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  rerollBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  rerollBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#17171c",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 14,
    marginBottom: 20,
  },
  themeCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
  },
  themeHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  themeSubtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "500",
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeOption: {
    width: "48%",
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  themeSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeOptionName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#17171c",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17171c",
  },
  sectionCount: {
    fontSize: 13,
    color: "#64748b",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },
  avatarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  avatarChoiceBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarChoiceBoxSelected: {
    backgroundColor: "#ffffff",
    borderColor: "#17171c",
    borderWidth: 2,
  },
  selectedCheckBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#17171c",
  },
  moreAvatarsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 20,
  },
  moreAvatarsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moreAvatarsTextCol: {
    flex: 1,
  },
  moreAvatarsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17171c",
  },
  moreAvatarsDesc: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 2,
  },
  realAccountCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  realAccountLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94a3b8",
  },
  realAccountName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
    marginTop: 2,
  },
  realAccountNotice: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 16,
  },
});
