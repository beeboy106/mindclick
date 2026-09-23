import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Animated,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

const FACULTY_PERSONAS = [
  "เด็กวิศวะ",
  "เด็กแพทย์",
  "เด็กอักษร",
  "เด็กบัญชี",
  "เด็กสถาปัตย์",
  "เด็กพยาบาล",
  "เด็กนิติ",
  "เด็กนิเทศ",
  "เด็กวิทยา",
  "เด็กเศรษฐศาสตร์",
];

// Interactive Bubble Pop Button with popping animation
function BubblePopButton({ item, onToggle }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const burstScale = useRef(new Animated.Value(0.8)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    burstScale.setValue(0.8);
    burstOpacity.setValue(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.25,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(burstScale, {
        toValue: 1.8,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(burstOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle();
  };

  return (
    <View style={styles.bubbleBtnWrapper}>
      <Animated.View
        style={[
          styles.burstRipple,
          {
            opacity: burstOpacity,
            transform: [{ scale: burstScale }],
          },
        ]}
        pointerEvents="none"
      />
      <TouchableOpacity
        style={[styles.popBtn, item.hasPopped && styles.popBtnActive]}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={item.hasPopped ? "radio-button-on" : "radio-button-off"}
            size={16}
            color={item.hasPopped ? "#17171c" : "#64748b"}
          />
        </Animated.View>
        <Text style={[styles.popCountText, item.hasPopped && styles.popCountTextActive]}>
          {item.pops}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function WhisperWallScreen() {
  const {
    whisperNotes,
    popNoteBubble,
    postSecretNote,
    sendDirectFromNote,
    toggleCrossBubbleMode,
  } = useCrossBubble();

  // Create Note Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(FACULTY_PERSONAS[0]);
  const [newNoteContent, setNewNoteContent] = useState("");

  // Reply Direct Message Modal State
  const [replyTargetNote, setReplyTargetNote] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) {
      Alert.alert("กรุณากรอกข้อความ", "พิมพ์ข้อความสั้นๆ สไตล์ IG Notes ก่อนโพสต์");
      return;
    }
    postSecretNote(selectedFaculty, newNoteContent.trim());
    setNewNoteContent("");
    setShowPostModal(false);
    Alert.alert("โพสต์สำเร็จ", `โน้ตของคุณในบทบาท "${selectedFaculty}" ถูกเผยแพร่บนกระดานลับแล้ว`);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !replyTargetNote) return;
    sendDirectFromNote(replyTargetNote, replyText.trim());
    setReplyText("");
    setReplyTargetNote(null);
    Alert.alert(
      "ส่งข้อความสำเร็จ",
      `ส่งข้อความตอบกลับถึง ${replyTargetNote.authorFaculty} เรียบร้อยแล้ว สามารถไปคุยต่อที่แท็บ 'ห้องมืด' ได้ทันที`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerSubtitle}>CAMPUS WHISPER NOTES</Text>
          <Text style={styles.headerTitle}>กระดานลับ</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.postBtnHeader}
            activeOpacity={0.85}
            onPress={() => setShowPostModal(true)}
          >
            <Ionicons name="add" size={18} color="#17171c" />
            <Text style={styles.postBtnHeaderText}>เขียนโน้ต</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exitBtn}
            activeOpacity={0.8}
            onPress={() => toggleCrossBubbleMode(false)}
          >
            <Ionicons name="log-out-outline" size={15} color="#64748b" />
            <Text style={styles.exitBtnText}>กลับสู่โหมดปกติ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Instagram Notes Style Horizontal Bar */}
        <Text style={styles.igNotesSectionTitle}>IG-STYLE CAMPUS NOTES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.igNotesBar}
        >
          {/* Add My Note Bubble */}
          <TouchableOpacity
            style={styles.igNoteAddWrapper}
            activeOpacity={0.8}
            onPress={() => setShowPostModal(true)}
          >
            <View style={styles.igAddCircle}>
              <Ionicons name="add" size={24} color="#17171c" />
            </View>
            <Text style={styles.igAddLabel}>แชร์โน้ต</Text>
          </TouchableOpacity>

          {/* Notes Avatars */}
          {whisperNotes.map((note) => (
            <TouchableOpacity
              key={`ig_${note.id}`}
              style={styles.igNoteItem}
              activeOpacity={0.85}
              onPress={() => setReplyTargetNote(note)}
            >
              {/* Floating speech bubble */}
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText} numberOfLines={2}>
                  {note.content}
                </Text>
                <View style={styles.speechBubbleTail} />
              </View>

              {/* Avatar circle */}
              <View style={styles.igAvatarCircle}>
                <Ionicons name={note.authorIcon || "person"} size={22} color="#17171c" />
              </View>
              <Text style={styles.igPersonaName} numberOfLines={1}>
                {note.authorFaculty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Feed of Notes */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedTitle}>กระดานข้อความทั้งหมด</Text>
          <Text style={styles.feedSubtitle}>สวมบทบาทเด็กคณะไหนก็ได้</Text>
        </View>

        {whisperNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteTopRow}>
              <View style={styles.noteAuthorBadge}>
                <Ionicons name={note.authorIcon || "person"} size={14} color="#17171c" />
                <Text style={styles.noteFacultyText}>{note.authorFaculty}</Text>
              </View>
              <Text style={styles.noteTimeText}>{note.createdAt}</Text>
            </View>

            <Text style={styles.noteBodyText}>{note.content}</Text>

            <View style={styles.noteBottomRow}>
              {/* Bubble Pop Button */}
              <BubblePopButton
                item={note}
                onToggle={() => popNoteBubble(note.id)}
              />

              {/* Direct Message Action */}
              <TouchableOpacity
                style={styles.dmBtn}
                activeOpacity={0.8}
                onPress={() => setReplyTargetNote(note)}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#17171c" />
                <Text style={styles.dmBtnText}>ตอบกลับ (DM ไปห้องมืด)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL 1: CREATE NOTE MODAL */}
      <Modal
        visible={showPostModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เขียนโน้ตกระดานลับ</Text>
              <TouchableOpacity onPress={() => setShowPostModal(false)}>
                <Ionicons name="close" size={22} color="#17171c" />
              </TouchableOpacity>
            </View>

            {/* Choose Faculty Persona */}
            <Text style={styles.fieldLabel}>เลือกบทบาทคณะที่คุณต้องการสวมบทบาท</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.personaChipsScroll}
            >
              {FACULTY_PERSONAS.map((fac) => {
                const isSelected = selectedFaculty === fac;

                return (
                  <TouchableOpacity
                    key={fac}
                    style={[styles.personaChip, isSelected && styles.personaChipActive]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedFaculty(fac)}
                  >
                    <Text
                      style={[
                        styles.personaChipText,
                        isSelected && styles.personaChipTextActive,
                      ]}
                    >
                      {fac}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Content Input */}
            <Text style={styles.fieldLabel}>ข้อความสั้นๆ สไตล์ IG Notes (สูงสุด 80 ตัวอักษร)</Text>
            <TextInput
              style={styles.noteInput}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              placeholder="แชร์สิ่งที่กำลังคิด อยากชวนคุย หรือเรื่องลับๆ ในมอ..."
              placeholderTextColor="#94a3b8"
              maxLength={80}
              multiline
            />
            <Text style={styles.charCountText}>{newNoteContent.length}/80</Text>

            {/* Post Button */}
            <TouchableOpacity
              style={styles.submitPostBtn}
              activeOpacity={0.85}
              onPress={handleCreateNote}
            >
              <Ionicons name="paper-plane" size={16} color="#17171c" />
              <Text style={styles.submitPostBtnText}>โพสต์โน้ตลงกระดาน</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: REPLY DIRECT MESSAGE MODAL */}
      <Modal
        visible={!!replyTargetNote}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReplyTargetNote(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                ส่งข้อความหา {replyTargetNote?.authorFaculty}
              </Text>
              <TouchableOpacity onPress={() => setReplyTargetNote(null)}>
                <Ionicons name="close" size={22} color="#17171c" />
              </TouchableOpacity>
            </View>

            {/* Note reference quote */}
            <View style={styles.quoteBox}>
              <Text style={styles.quoteFaculty}>
                อ้างอิงโน้ตของ {replyTargetNote?.authorFaculty}:
              </Text>
              <Text style={styles.quoteContent}>"{replyTargetNote?.content}"</Text>
            </View>

            <Text style={styles.fieldLabel}>ข้อความของคุณ (จะเปิดเป็นห้องแชทในห้องมืด)</Text>
            <TextInput
              style={styles.noteInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="พิมพ์ข้อความเปิดบทสนทนา..."
              placeholderTextColor="#94a3b8"
              multiline
            />

            <TouchableOpacity
              style={styles.submitPostBtn}
              activeOpacity={0.85}
              onPress={handleSendReply}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#17171c" />
              <Text style={styles.submitPostBtnText}>ส่งข้อความไปยังห้องมืด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postBtnHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  postBtnHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17171c",
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    gap: 4,
  },
  exitBtnText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingVertical: 16,
  },
  igNotesSectionTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  igNotesBar: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
    gap: 16,
    paddingBottom: 8,
  },
  igNoteAddWrapper: {
    alignItems: "center",
    width: 68,
  },
  igAddCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  igAddLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 6,
  },
  igNoteItem: {
    alignItems: "center",
    width: 80,
  },
  speechBubble: {
    backgroundColor: "#17171c",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
    width: 78,
    alignItems: "center",
    position: "relative",
  },
  speechBubbleText: {
    fontSize: 9.5,
    color: "#c7f65a",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 12,
  },
  speechBubbleTail: {
    position: "absolute",
    bottom: -4,
    width: 8,
    height: 8,
    backgroundColor: "#17171c",
    transform: [{ rotate: "45deg" }],
  },
  igAvatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#c7f65a",
    borderWidth: 2,
    borderColor: "#17171c",
    justifyContent: "center",
    alignItems: "center",
  },
  igPersonaName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#17171c",
    marginTop: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 16,
  },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17171c",
  },
  feedSubtitle: {
    fontSize: 11.5,
    color: "#64748b",
  },
  noteCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  noteTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  noteAuthorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  noteFacultyText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
  noteTimeText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  noteBodyText: {
    fontSize: 14,
    color: "#17171c",
    lineHeight: 20,
    marginBottom: 14,
  },
  noteBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  bubbleBtnWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  burstRipple: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#c7f65a",
  },
  popBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  popBtnActive: {
    backgroundColor: "#c7f65a",
    borderColor: "#17171c",
  },
  popCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  popCountTextActive: {
    color: "#17171c",
    fontWeight: "800",
  },
  dmBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  dmBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#17171c",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17171c",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
    marginTop: 6,
  },
  personaChipsScroll: {
    gap: 6,
    paddingBottom: 8,
  },
  personaChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  personaChipActive: {
    backgroundColor: "#c7f65a",
    borderColor: "#17171c",
  },
  personaChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  personaChipTextActive: {
    color: "#17171c",
    fontWeight: "800",
  },
  noteInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    fontSize: 13.5,
    color: "#17171c",
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCountText: {
    fontSize: 11,
    color: "#94a3b8",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  submitPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#17171c",
  },
  submitPostBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#17171c",
  },
  quoteBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#c7f65a",
    marginBottom: 12,
  },
  quoteFaculty: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  quoteContent: {
    fontSize: 12.5,
    color: "#17171c",
    marginTop: 2,
    fontStyle: "italic",
  },
});
