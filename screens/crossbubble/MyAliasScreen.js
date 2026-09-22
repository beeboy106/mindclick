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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

export default function MyAliasScreen() {
  const { userAlias, regenerateAlias, changeMascot, mascotOptions, toggleCrossBubbleMode } = useCrossBubble();
  const { user } = useAuth();
  const { profile } = useData();

  const realDisplayName = profile?.name || user?.name || "คุณ";

  const handleReroll = async () => {
    const newAlias = await regenerateAlias();
    Alert.alert("สุ่มฉายาใหม่สำเร็จ", `ฉายาของคุณตอนนี้คือ: "${newAlias.nickname}"`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="shield-account-outline" size={20} color="#a3e635" />
          </View>
          <View>
            <Text style={styles.headerTitle}>โปรไฟล์ลับ (MY ALIAS)</Text>
            <Text style={styles.headerSubtitle}>จัดการตัวตนนามแฝงและสัญลักษณ์ประจำตัว</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Big Persona Card */}
        <View style={styles.personaCard}>
          <View style={styles.mascotBigCircle}>
            <Ionicons
              name={userAlias?.icon || "finger-print-outline"}
              size={38}
              color="#a3e635"
            />
          </View>

          <Text style={styles.aliasNickname}>{userAlias?.nickname || "นิรนาม"}</Text>

          <View style={styles.facultyBadge}>
            <Ionicons name="school-outline" size={12} color="#38bdf8" />
            <Text style={styles.facultyBadgeText}>{userAlias?.faculty || "มหาวิทยาลัย"}</Text>
          </View>

          <View style={styles.maskedRealBox}>
            <Ionicons name="lock-closed" size={13} color="#94a3b8" />
            <Text style={styles.maskedRealText}>
              ตัวตนจริงที่ซ่อนอยู่: <Text style={styles.maskedRealName}>{realDisplayName}</Text>
            </Text>
          </View>

          {/* Reroll Alias Button */}
          <TouchableOpacity
            style={styles.rerollBtn}
            activeOpacity={0.8}
            onPress={handleReroll}
          >
            <Ionicons name="dice-outline" size={16} color="#090d16" />
            <Text style={styles.rerollBtnText}>สุ่มฉายาใหม่ (Re-roll)</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot Picker */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>เลือกสัญลักษณ์ประจำตัว</Text>
          <Text style={styles.sectionSubtitle}>ไอคอนจะแสดงแทนตัวตนในแชทกลุ่มลับและกระดานลับ</Text>

          <View style={styles.mascotGrid}>
            {mascotOptions.map((icon) => {
              const isSelected = userAlias?.icon === icon;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[styles.mascotChoiceBtn, isSelected && styles.mascotChoiceSelected]}
                  activeOpacity={0.7}
                  onPress={() => changeMascot(icon)}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={isSelected ? "#a3e635" : "#94a3b8"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Badges Collected */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>เกียรติยศในโหมดลับ (Badges)</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgeItem}>
              <View style={styles.badgeIconCircle}>
                <Ionicons name="sparkles" size={18} color="#a3e635" />
              </View>
              <Text style={styles.badgeName}>ผู้ทลายกรอบ</Text>
              <Text style={styles.badgeDesc}>สนทนาข้าม 3 คณะ</Text>
            </View>

            <View style={styles.badgeItem}>
              <View style={styles.badgeIconCircle}>
                <Ionicons name="moon" size={18} color="#38bdf8" />
              </View>
              <Text style={styles.badgeName}>Night Owl</Text>
              <Text style={styles.badgeDesc}>คุยช่วงเที่ยงคืน</Text>
            </View>

            <View style={styles.badgeItem}>
              <View style={styles.badgeIconCircle}>
                <Ionicons name="key" size={18} color="#c084fc" />
              </View>
              <Text style={styles.badgeName}>Mutual Master</Text>
              <Text style={styles.badgeDesc}>ปลดล็อกโปรไฟล์</Text>
            </View>
          </View>
        </View>

        {/* Return to Normal Mode Button */}
        <TouchableOpacity
          style={styles.exitToNormalBtn}
          activeOpacity={0.85}
          onPress={() => toggleCrossBubbleMode(false)}
        >
          <Ionicons name="log-out-outline" size={18} color="#f8fafc" />
          <Text style={styles.exitToNormalBtnText}>ออกจากโหมด Cross-Bubble กลับสู่โหมดปกติ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(163, 230, 53, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a3e635",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  personaCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#8b5cf6",
    marginBottom: 16,
  },
  mascotBigCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#a3e635",
    marginBottom: 12,
  },
  mascotBigEmoji: {
    fontSize: 38,
  },
  aliasNickname: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  facultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  facultyBadgeText: {
    color: "#38bdf8",
    fontSize: 11.5,
    fontWeight: "700",
  },
  maskedRealBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161f36",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  maskedRealText: {
    color: "#94a3b8",
    fontSize: 11,
  },
  maskedRealName: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  rerollBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#a3e635",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  rerollBtnText: {
    color: "#090d16",
    fontSize: 12.5,
    fontWeight: "900",
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 12,
  },
  mascotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mascotChoiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  mascotChoiceSelected: {
    borderColor: "#a3e635",
    backgroundColor: "rgba(163, 230, 53, 0.15)",
  },
  mascotChoiceEmoji: {
    fontSize: 20,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  badgeItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  badgeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeName: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 2,
  },
  badgeDesc: {
    color: "#64748b",
    fontSize: 9.5,
    textAlign: "center",
  },
  exitToNormalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#475569",
    marginTop: 8,
  },
  exitToNormalBtnText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },
});
