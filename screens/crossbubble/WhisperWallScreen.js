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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

const FACULTY_TAGS = ["เด็กวิศวะ", "เด็กแพทย์", "เด็กอักษร", "เด็กบัญชี", "เด็กสถาปัตย์", "เด็กพยาบาล", "เด็กนิติ", "เด็กวิทยา"];

export default function WhisperWallScreen() {
  const { whisperPosts, addWhisperPost, toggleWhisperPop, userAlias } = useCrossBubble();
  const [whisperText, setWhisperText] = useState("");
  const [selectedTag, setSelectedTag] = useState(userAlias?.shortFaculty ? `เด็ก${userAlias.shortFaculty}` : "เด็กวิศวะ");

  const handlePost = () => {
    if (!whisperText.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณาพิมพ์ข้อความก่อนกระซิบ");
      return;
    }
    addWhisperPost(whisperText, selectedTag);
    setWhisperText("");
    Alert.alert("สำเร็จ", "ส่งเสียงกระซิบขึ้นบอร์ดแล้ว 🫧");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="message-flash" size={18} color="#c084fc" />
          </View>
          <View>
            <Text style={styles.headerTitle}>WHISPER WALL</Text>
            <Text style={styles.headerSubtitle}>กระดานกระซิบข้ามคณะแบบนิรนาม</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Whisper Composer Box */}
        <View style={styles.composerCard}>
          <Text style={styles.composerHeader}>แอบกระซิบอะไรบางอย่างถึงเพื่อนต่างคณะ...</Text>

          <TextInput
            style={styles.composerInput}
            placeholder="บ่นเรื่องเรียน ชวนคุย หรือระบายความในใจแบบไม่เปิดเผยตัวตน..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={280}
            value={whisperText}
            onChangeText={setWhisperText}
          />

          <View style={styles.tagSelectSection}>
            <Text style={styles.tagLabel}>สวมบทบาทเป็น:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
              {FACULTY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTag(tag)}
                  >
                    <Text style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.composerFooter}>
            <Text style={styles.charCount}>{whisperText.length}/280</Text>
            <TouchableOpacity
              style={[styles.postBtn, !whisperText.trim() && styles.postBtnDisabled]}
              disabled={!whisperText.trim()}
              activeOpacity={0.85}
              onPress={handlePost}
            >
              <Ionicons name="paper-plane" size={13} color="#090d16" />
              <Text style={styles.postBtnText}>กระซิบเลย</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Whispers Feed */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedTitle}>เสียงกระซิบล่าสุด</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>กำลังซุบซิบ</Text>
          </View>
        </View>

        {whisperPosts.map((item) => (
          <View key={item.id} style={styles.whisperCard}>
            <View style={styles.whisperHeaderRow}>
              <View style={styles.facultyBadge}>
                <Text style={styles.authorIcon}>{item.authorIcon}</Text>
                <Text style={styles.facultyBadgeText}>{item.authorFaculty}</Text>
              </View>
              <Text style={styles.timeText}>{item.createdAt}</Text>
            </View>

            <Text style={styles.whisperContent}>{item.content}</Text>

            <View style={styles.whisperFooter}>
              <TouchableOpacity
                style={[styles.popBtn, item.hasPopped && styles.popBtnActive]}
                activeOpacity={0.7}
                onPress={() => toggleWhisperPop(item.id)}
              >
                <MaterialCommunityIcons
                  name={item.hasPopped ? "circle-slice-8" : "circle-outline"}
                  size={16}
                  color={item.hasPopped ? "#a3e635" : "#94a3b8"}
                />
                <Text style={[styles.popText, item.hasPopped && styles.popTextActive]}>
                  {item.hasPopped ? "แตกฟองแล้ว 🫧" : "Bubble Pop"}
                </Text>
                <View style={styles.popCountBadge}>
                  <Text style={styles.popCountText}>{item.pops}</Text>
                </View>
              </TouchableOpacity>
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
    backgroundColor: "rgba(192, 132, 252, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c084fc",
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
  composerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#334155",
    marginBottom: 20,
  },
  composerHeader: {
    color: "#cbd5e1",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 8,
  },
  composerInput: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
  },
  tagSelectSection: {
    marginBottom: 10,
  },
  tagLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  tagsScroll: {
    gap: 6,
  },
  tagPill: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tagPillSelected: {
    backgroundColor: "rgba(192, 132, 252, 0.2)",
    borderColor: "#c084fc",
  },
  tagPillText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  tagPillTextSelected: {
    color: "#c084fc",
  },
  composerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 8,
  },
  charCount: {
    color: "#64748b",
    fontSize: 11,
  },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#a3e635",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  postBtnDisabled: {
    backgroundColor: "#334155",
  },
  postBtnText: {
    color: "#090d16",
    fontSize: 12,
    fontWeight: "900",
  },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  onlineText: {
    color: "#4ade80",
    fontSize: 10.5,
    fontWeight: "800",
  },
  whisperCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  whisperHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  facultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  authorIcon: {
    fontSize: 12,
  },
  facultyBadgeText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "800",
  },
  timeText: {
    color: "#64748b",
    fontSize: 10.5,
  },
  whisperContent: {
    color: "#e2e8f0",
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 12,
  },
  whisperFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 8,
  },
  popBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  popBtnActive: {
    borderColor: "#a3e635",
    backgroundColor: "rgba(163, 230, 53, 0.1)",
  },
  popText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  popTextActive: {
    color: "#a3e635",
  },
  popCountBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 2,
  },
  popCountText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "800",
  },
});
