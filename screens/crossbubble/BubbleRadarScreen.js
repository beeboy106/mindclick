import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

export default function BubbleRadarScreen() {
  const { radarData, userAlias, toggleCrossBubbleMode } = useCrossBubble();

  const connectedCount = radarData.filter((r) => r.isConnected).length;
  const totalCount = radarData.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="radio-outline" size={18} color="#818CF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>เรดาร์คณะ</Text>
            <Text style={styles.headerSubtitle}>วิเคราะห์ความเข้ากันได้ของไลฟ์สไตล์ต่างคณะ</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.exitBtn}
          activeOpacity={0.8}
          onPress={() => toggleCrossBubbleMode(false)}
        >
          <Ionicons name="log-out-outline" size={15} color="#94A3B8" />
          <Text style={styles.exitBtnText}>กลับสู่โหมดปกติ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Radar Graphic Card (Social Orbit) */}
        <View style={styles.radarGraphicCard}>
          <View style={styles.radarHeaderRow}>
            <Text style={styles.radarCardTitle}>แผนที่ทลายกรอบคณะ</Text>
            <View style={styles.livePulseBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.livePulseText}>กำลังสแกน</Text>
            </View>
          </View>

          {/* Concentric Social Orbit Canvas */}
          <View style={styles.radarCanvas}>
            {/* Concentric Rings */}
            <View style={[styles.radarOrbit, { width: 250, height: 250, borderRadius: 125 }]} />
            <View style={[styles.radarOrbit, { width: 175, height: 175, borderRadius: 87.5 }]} />
            <View style={[styles.radarOrbit, { width: 105, height: 105, borderRadius: 52.5 }]} />

            {/* Center User Bubble */}
            <View style={styles.centerBubble}>
              <Ionicons
                name={userAlias?.icon || "finger-print-outline"}
                size={22}
                color="#818CF8"
              />
              <Text style={styles.centerLabel} numberOfLines={1}>
                คุณ ({userAlias?.shortFaculty || "ฉัน"})
              </Text>
            </View>

            {/* Orbiting Faculty Bubbles (Stacked 2-line layout to prevent text overflow) */}
            <View style={[styles.orbitBubble, { top: 16, left: 14, borderColor: "#FB7185" }]}>
              <Text style={styles.orbitFacultyText} numberOfLines={1}>พยาบาล</Text>
              <Text style={[styles.orbitPercentText, { color: "#FB7185" }]}>88%</Text>
            </View>

            <View style={[styles.orbitBubble, { top: 20, right: 14, borderColor: "#818CF8" }]}>
              <Text style={styles.orbitFacultyText} numberOfLines={1}>อักษร</Text>
              <Text style={[styles.orbitPercentText, { color: "#818CF8" }]}>85%</Text>
            </View>

            <View style={[styles.orbitBubble, { bottom: 20, left: 14, borderColor: "#38BDF8" }]}>
              <Text style={styles.orbitFacultyText} numberOfLines={1}>บัญชี</Text>
              <Text style={[styles.orbitPercentText, { color: "#38BDF8" }]}>79%</Text>
            </View>

            <View style={[styles.orbitBubble, { bottom: 16, right: 14, borderColor: "#F59E0B" }]}>
              <Text style={styles.orbitFacultyText} numberOfLines={1}>สถาปัตย์</Text>
              <Text style={[styles.orbitPercentText, { color: "#F59E0B" }]}>76%</Text>
            </View>
          </View>

          <Text style={styles.radarCaption}>
            เรดาร์คำนวณจากผลลัพธ์คำตอบไลฟ์สไตล์ของนักศึกษาแต่ละคณะในสัปดาห์นี้
          </Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>สถิติการทลายกรอบสังคม</Text>
            <Text style={styles.scoreValue}>
              {connectedCount} <Text style={styles.scoreUnit}>/ {totalCount} คณะ</Text>
            </Text>
            <Text style={styles.scoreDesc}>
              คุณได้เปิดบทสนทนากับเพื่อนไปแล้ว {connectedCount} คณะจากทั้งหมด {totalCount} คณะ
            </Text>
          </View>
          <View style={styles.trophyBox}>
            <Ionicons name="trophy-outline" size={26} color="#F59E0B" />
          </View>
        </View>

        {/* Faculty Breakdown List */}
        <Text style={styles.listSectionTitle}>คณะที่ความสนใจตรงกับคุณมากที่สุด:</Text>

        {radarData.map((item, index) => (
          <View key={item.faculty} style={styles.facultyMatchRow}>
            <View style={styles.rankNumBox}>
              <Text style={styles.rankNum}>0{index + 1}</Text>
            </View>

            <View style={styles.facultyInfoCol}>
              <View style={styles.facultyNameRow}>
                <Text style={styles.facultyNameText}>{item.faculty}</Text>
                <Text style={[styles.matchRateText, { color: item.color }]}>
                  {item.matchRate}% MATCH
                </Text>
              </View>

              {/* Minimal Progress Bar (4px) */}
              <View style={styles.miniProgressTrack}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${item.matchRate}%`, backgroundColor: item.color },
                  ]}
                />
              </View>

              <Text style={styles.studentsCountText}>
                {item.studentsCount} คนในคณะนี้มีสไตล์ดนตรีและความคิดตรงกับคุณ
              </Text>
            </View>

            <View style={styles.statusCol}>
              {item.isConnected ? (
                <View style={styles.connectedPill}>
                  <Ionicons name="checkmark-circle" size={11} color="#818CF8" />
                  <Text style={styles.connectedText}>เจอกันแล้ว</Text>
                </View>
              ) : (
                <View style={styles.unconnectedPill}>
                  <Ionicons name="lock-closed-outline" size={11} color="#64748B" />
                  <Text style={styles.unconnectedText}>ยังไม่เจอ</Text>
                </View>
              )}
            </View>
          </View>
        ))}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 4,
  },
  exitBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
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
    paddingBottom: 30,
  },
  radarGraphicCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
    alignItems: "center",
  },
  radarHeaderRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  radarCardTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  livePulseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#818CF8",
  },
  livePulseText: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "800",
  },
  radarCanvas: {
    width: 270,
    height: 270,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 6,
  },
  radarOrbit: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  centerBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#818CF8",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    paddingHorizontal: 4,
  },
  centerLabel: {
    color: "#818CF8",
    fontSize: 9.5,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  orbitBubble: {
    position: "absolute",
    backgroundColor: "#0F172A",
    minWidth: 58,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    zIndex: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitFacultyText: {
    color: "#F8FAFC",
    fontSize: 9.5,
    fontWeight: "700",
    textAlign: "center",
  },
  orbitPercentText: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
    textAlign: "center",
  },
  radarCaption: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  scoreLeft: {
    flex: 1,
    marginRight: 10,
  },
  scoreLabel: {
    color: "#818CF8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  scoreValue: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  scoreUnit: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
  scoreDesc: {
    color: "#94A3B8",
    fontSize: 11.5,
    lineHeight: 16,
  },
  trophyBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  listSectionTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },
  facultyMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
  },
  rankNumBox: {
    width: 24,
    marginRight: 8,
  },
  rankNum: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  facultyInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  facultyNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  facultyNameText: {
    color: "#F8FAFC",
    fontSize: 12.5,
    fontWeight: "700",
  },
  matchRateText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  miniProgressTrack: {
    height: 4,
    backgroundColor: "#0F172A",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  studentsCountText: {
    color: "#64748B",
    fontSize: 10.5,
  },
  statusCol: {
    alignItems: "flex-end",
  },
  connectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#818CF8",
  },
  connectedText: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "700",
  },
  unconnectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  unconnectedText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "600",
  },
});
