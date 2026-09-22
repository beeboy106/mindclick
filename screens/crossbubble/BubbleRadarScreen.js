import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

export default function BubbleRadarScreen() {
  const { radarData, userAlias } = useCrossBubble();

  const connectedCount = radarData.filter((r) => r.isConnected).length;
  const totalCount = radarData.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="radar" size={18} color="#38bdf8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>CROSS-FACULTY RADAR</Text>
            <Text style={styles.headerSubtitle}>เรดาร์ส่องฟองสบู่ข้ามคณะที่เคมีตรงกัน</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Radar Graphic Card */}
        <View style={styles.radarGraphicCard}>
          <View style={styles.radarHeaderRow}>
            <Text style={styles.radarCardTitle}>แผนที่ทลาย Social Bubble</Text>
            <View style={styles.livePulseBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.livePulseText}>ACTIVE SCAN</Text>
            </View>
          </View>

          {/* Concentric Radar Canvas Simulation */}
          <View style={styles.radarCanvas}>
            {/* Radar Orbits */}
            <View style={[styles.radarOrbit, { width: 220, height: 220, borderRadius: 110 }]} />
            <View style={[styles.radarOrbit, { width: 160, height: 160, borderRadius: 80 }]} />
            <View style={[styles.radarOrbit, { width: 100, height: 100, borderRadius: 50 }]} />

            {/* Center User Bubble */}
            <View style={styles.centerBubble}>
              <Text style={styles.centerIcon}>{userAlias?.icon || "🤖"}</Text>
              <Text style={styles.centerLabel}>คุณ ({userAlias?.shortFaculty || "ฉัน"})</Text>
            </View>

            {/* Orbiting Faculty Bubbles */}
            <View style={[styles.orbitBubble, { top: 18, left: 35, borderColor: "#f43f5e" }]}>
              <Text style={styles.orbitBubbleText}>พยาบาล 88%</Text>
            </View>
            <View style={[styles.orbitBubble, { top: 25, right: 30, borderColor: "#c084fc" }]}>
              <Text style={styles.orbitBubbleText}>อักษร 85%</Text>
            </View>
            <View style={[styles.orbitBubble, { bottom: 25, left: 30, borderColor: "#4ade80" }]}>
              <Text style={styles.orbitBubbleText}>บัญชี 79%</Text>
            </View>
            <View style={[styles.orbitBubble, { bottom: 20, right: 35, borderColor: "#fbbf24" }]}>
              <Text style={styles.orbitBubbleText}>สถาปัตย์ 76%</Text>
            </View>
          </View>

          <Text style={styles.radarCaption}>
            เรดาร์คำนวณจากผลลัพธ์คำตอบไลฟ์สไตล์ของนักศึกษาแต่ละคณะในสัปดาห์นี้
          </Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>CROSS-BUBBLE SCORE</Text>
            <Text style={styles.scoreValue}>
              {connectedCount} <Text style={styles.scoreUnit}>/ {totalCount} คณะ</Text>
            </Text>
            <Text style={styles.scoreDesc}>
              คุณได้เชื่อมต่อและพูดคุยกับเพื่อนไปแล้ว {connectedCount} คณะจากทั้งหมด {totalCount} คณะ
            </Text>
          </View>
          <View style={styles.trophyBox}>
            <Ionicons name="trophy" size={28} color="#a3e635" />
          </View>
        </View>

        {/* Faculty Breakdown List */}
        <Text style={styles.listSectionTitle}>คณะที่กำลังชนฟองสบู่กับคุณมากที่สุด:</Text>

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

              {/* Progress Bar */}
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
                  <Ionicons name="checkmark-circle" size={12} color="#a3e635" />
                  <Text style={styles.connectedText}>เจอกันแล้ว</Text>
                </View>
              ) : (
                <View style={styles.unconnectedPill}>
                  <Ionicons name="lock-closed" size={11} color="#64748b" />
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
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#38bdf8",
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
    paddingBottom: 30,
  },
  radarGraphicCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
    marginBottom: 16,
    alignItems: "center",
  },
  radarHeaderRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  radarCardTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  livePulseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38bdf8",
  },
  livePulseText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "900",
  },
  radarCanvas: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 8,
  },
  radarOrbit: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.8)",
    borderStyle: "dashed",
  },
  centerBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#a3e635",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  centerIcon: {
    fontSize: 20,
  },
  centerLabel: {
    color: "#a3e635",
    fontSize: 9.5,
    fontWeight: "800",
    marginTop: 2,
  },
  orbitBubble: {
    position: "absolute",
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    zIndex: 5,
  },
  orbitBubbleText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "800",
  },
  radarCaption: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161f36",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#8b5cf6",
    marginBottom: 20,
  },
  scoreLeft: {
    flex: 1,
    marginRight: 10,
  },
  scoreLabel: {
    color: "#c084fc",
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreValue: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  scoreUnit: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  scoreDesc: {
    color: "#94a3b8",
    fontSize: 11.5,
    lineHeight: 16,
  },
  trophyBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(163, 230, 53, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a3e635",
  },
  listSectionTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },
  facultyMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10,
  },
  rankNumBox: {
    width: 26,
    marginRight: 8,
  },
  rankNum: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900",
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
    color: "#f8fafc",
    fontSize: 12.5,
    fontWeight: "700",
  },
  matchRateText: {
    fontSize: 11.5,
    fontWeight: "900",
  },
  miniProgressTrack: {
    height: 4,
    backgroundColor: "#1e293b",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  studentsCountText: {
    color: "#64748b",
    fontSize: 10.5,
  },
  statusCol: {
    alignItems: "flex-end",
  },
  connectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(163, 230, 53, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a3e635",
  },
  connectedText: {
    color: "#a3e635",
    fontSize: 10,
    fontWeight: "800",
  },
  unconnectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unconnectedText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
  },
});
