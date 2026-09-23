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
import { useCrossBubble } from "../../context/CrossBubbleContext";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

export default function MyAliasScreen() {
  const {
    userAlias,
    regenerateAlias,
    changeMascot,
    mascotOptions,
    toggleCrossBubbleMode,
  } = useCrossBubble();
  const { user } = useAuth();
  const { profile } = useData();

  const realDisplayName = profile?.name || user?.name || "คุณ";

  const handleReroll = async () => {
    const newAlias = await regenerateAlias();
    Alert.alert("สุ่มฉายาใหม่สำเร็จ", `ฉายาของคุณตอนนี้คือ: "${newAlias.nickname}"`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#818CF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>โปรไฟล์ลับ</Text>
            <Text style={styles.headerSubtitle}>จัดการตัวตนนามแฝงและสัญลักษณ์ประจำตัว</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Persona Card */}
        <View style={styles.personaCard}>
          <View style={styles.mascotBigCircle}>
            <Ionicons
              name={userAlias?.icon || "finger-print-outline"}
              size={36}
              color="#818CF8"
            />
          </View>

          <Text style={styles.aliasNickname}>{userAlias?.nickname || "นิรนาม"}</Text>

          <View style={styles.facultyBadge}>
            <Ionicons name="school-outline" size={12} color="#818CF8" />
            <Text style={styles.facultyBadgeText}>
              {userAlias?.faculty || "มหาวิทยาลัย"}
            </Text>
          </View>

          <View style={styles.maskedRealBox}>
            <Ionicons name="lock-closed-outline" size={13} color="#94A3B8" />
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
            <Ionicons name="dice-outline" size={15} color="#FFFFFF" />
            <Text style={styles.rerollBtnText}>สุ่มฉายาใหม่ (Re-roll)</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot Picker */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>เลือกสัญลักษณ์ประจำตัว</Text>
          <Text style={styles.sectionSubtitle}>
            ไอคอนจะแสดงแทนตัวตนในห้องสังสรรค์และกระดานลับ
          </Text>

          <View style={styles.mascotGrid}>
            {mascotOptions.map((icon) => {
              const isSelected = userAlias?.icon === icon;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.mascotChoiceBtn,
                    isSelected && styles.mascotChoiceSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => changeMascot(icon)}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={isSelected ? "#818CF8" : "#64748B"}
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
                <Ionicons name="sparkles-outline" size={18} color="#818CF8" />
              </View>
              <Text style={styles.badgeName}>ผู้ทลายกรอบ</Text>
              <Text style={styles.badgeDesc}>สนทนาข้าม 3 คณะ</Text>
            </View>

            <View style={styles.badgeItem}>
              <View style={styles.badgeIconCircle}>
                <Ionicons name="moon-outline" size={18} color="#38BDF8" />
              </View>
              <Text style={styles.badgeName}>Night Owl</Text>
              <Text style={styles.badgeDesc}>คุยช่วงดึก</Text>
            </View>

            <View style={styles.badgeItem}>
              <View style={styles.badgeIconCircle}>
                <Ionicons name="key-outline" size={18} color="#F59E0B" />
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
          <Ionicons name="log-out-outline" size={16} color="#94A3B8" />
          <Text style={styles.exitToNormalBtnText}>ออกจากโหมดลับ กลับสู่โหมดปกติ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
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
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  personaCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  mascotBigCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#818CF8",
    marginBottom: 12,
  },
  aliasNickname: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  facultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  facultyBadgeText: {
    color: "#818CF8",
    fontSize: 11.5,
    fontWeight: "600",
  },
  maskedRealBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  maskedRealText: {
    color: "#94A3B8",
    fontSize: 11,
  },
  maskedRealName: {
    color: "#F8FAFC",
    fontWeight: "700",
  },
  rerollBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  rerollBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  sectionSubtitle: {
    color: "#64748B",
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
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  mascotChoiceSelected: {
    borderColor: "#818CF8",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  badgeItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  badgeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 6,
  },
  badgeName: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  badgeDesc: {
    color: "#64748B",
    fontSize: 9.5,
    textAlign: "center",
  },
  exitToNormalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1E293B",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 4,
  },
  exitToNormalBtnText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
});
