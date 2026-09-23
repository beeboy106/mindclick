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

const FACULTY_TAGS = [
  "เด็กวิศวะ",
  "เด็กแพทย์",
  "เด็กอักษร",
  "เด็กบัญชี",
  "เด็กสถาปัตย์",
  "เด็กพยาบาล",
  "เด็กนิติ",
  "เด็กวิทยา",
];

export default function WhisperWallScreen() {
  const { whisperPosts, addWhisperPost, toggleWhisperPop, userAlias } = useCrossBubble();
  const [whisperText, setWhisperText] = useState("");
  const [selectedTag, setSelectedTag] = useState(
    userAlias?.shortFaculty ? `เด็ก${userAlias.shortFaculty}` : "เด็กวิศวะ"
  );

  const handlePost = () => {
    if (!whisperText.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณาพิมพ์ข้อความก่อนส่ง");
      return;
    }
    addWhisperPost(whisperText, selectedTag);
    setWhisperText("");
    Alert.alert("สำเร็จ", "ส่งข้อความขึ้นกระดานลับเรียบร้อยแล้ว");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#818CF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>กระดานลับ</Text>
            <Text style={styles.headerSubtitle}>พื้นที่ฝากข้อความนิรนามข้ามคณะ</Text>
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
          <Text style={styles.composerHeader}>ฝากข้อความถึงเพื่อนต่างคณะ...</Text>

          <TextInput
            style={styles.composerInput}
            placeholder="บ่นเรื่องเรียน ชวนคุย หรือระบายความในใจแบบนิรนาม..."
            placeholderTextColor="#64748B"
            multiline
            maxLength={280}
            value={whisperText}
            onChangeText={setWhisperText}
          />

          <View style={styles.tagSelectSection}>
            <Text style={styles.tagLabel}>ส่งในนาม:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScroll}
            >
              {FACULTY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagPillText,
                        isSelected && styles.tagPillTextSelected,
                      ]}
                    >
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
              <Ionicons
                name="paper-plane"
                size={13}
                color={whisperText.trim() ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.postBtnText,
                  !whisperText.trim() && styles.postBtnTextDisabled,
                ]}
              >
                โพสต์
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Whispers Feed */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedTitle}>ข้อความลับล่าสุด</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.dotIndicator} />
            <Text style={styles.onlineText}>กำลังเคลื่อนไหว</Text>
          </View>
        </View>

        {whisperPosts.map((item) => (
          <View key={item.id} style={styles.whisperCard}>
            <View style={styles.whisperHeaderRow}>
              <View style={styles.facultyBadge}>
                <Ionicons
                  name={item.authorIcon || "chatbubble-ellipses-outline"}
                  size={12}
                  color="#818CF8"
                />
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
                <Ionicons
                  name={item.hasPopped ? "radio-button-on" : "ellipse-outline"}
                  size={14}
                  color={item.hasPopped ? "#F59E0B" : "#94A3B8"}
                />
                <Text style={[styles.popText, item.hasPopped && styles.popTextActive]}>
                  Bubble Pop
                </Text>
                <View
                  style={[
                    styles.popCountBadge,
                    item.hasPopped && styles.popCountBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.popCountText,
                      item.hasPopped && styles.popCountTextActive,
                    ]}
                  >
                    {item.pops}
                  </Text>
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
    paddingBottom: 30,
  },
  composerCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  composerHeader: {
    color: "#F8FAFC",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 8,
  },
  composerInput: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    minHeight: 68,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
  },
  tagSelectSection: {
    marginBottom: 10,
  },
  tagLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  tagsScroll: {
    gap: 6,
  },
  tagPill: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tagPillSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: "#818CF8",
  },
  tagPillText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  tagPillTextSelected: {
    color: "#818CF8",
    fontWeight: "700",
  },
  composerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 8,
  },
  charCount: {
    color: "#64748B",
    fontSize: 11,
  },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6366F1",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  postBtnDisabled: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  postBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  postBtnTextDisabled: {
    color: "#64748B",
  },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  onlineBadge: {
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
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#818CF8",
  },
  onlineText: {
    color: "#818CF8",
    fontSize: 10.5,
    fontWeight: "700",
  },
  whisperCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
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
    gap: 5,
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  facultyBadgeText: {
    color: "#818CF8",
    fontSize: 11,
    fontWeight: "700",
  },
  timeText: {
    color: "#64748B",
    fontSize: 10.5,
  },
  whisperContent: {
    color: "#E2E8F0",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  whisperFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 8,
  },
  popBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  popBtnActive: {
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  popText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  popTextActive: {
    color: "#F59E0B",
    fontWeight: "700",
  },
  popCountBadge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 2,
  },
  popCountBadgeActive: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },
  popCountText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
  },
  popCountTextActive: {
    color: "#F59E0B",
  },
});
