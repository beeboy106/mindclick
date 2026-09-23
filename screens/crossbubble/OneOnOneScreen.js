import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

export default function OneOnOneScreen() {
  const {
    oneOnOneRooms,
    activeOneOnOneRoomId,
    setActiveOneOnOneRoomId,
    sendOneOnOneMessage,
    requestOneOnOneReveal,
    createNewOneOnOneRoom,
    toggleCrossBubbleMode,
  } = useCrossBubble();

  const [inputMsg, setInputMsg] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const scrollViewRef = useRef(null);

  const currentRoom =
    oneOnOneRooms.find((r) => r.id === activeOneOnOneRoomId) || null;

  const handleSend = () => {
    if (!inputMsg.trim() || !currentRoom) return;
    sendOneOnOneMessage(currentRoom.id, inputMsg);
    setInputMsg("");
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleRandomMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      createNewOneOnOneRoom();
      setIsMatching(false);
    }, 1500);
  };

  // ==========================================
  // VIEW 1: LOBBY VIEW (หน้ารวมแชท 1 on 1)
  // ==========================================
  if (!currentRoom) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

        {/* Lobby Header */}
        <View style={styles.lobbyHeader}>
          <View style={styles.lobbyTitleRow}>
            <View>
              <Text style={styles.lobbyPreTitle}>ANONYMOUS 1 ON 1</Text>
              <Text style={styles.lobbyTitle}>สุ่มคุย 1 on 1</Text>
            </View>
            <TouchableOpacity
              style={styles.exitModeBtn}
              activeOpacity={0.8}
              onPress={() => toggleCrossBubbleMode(false)}
            >
              <Ionicons name="log-out-outline" size={15} color="#94A3B8" />
              <Text style={styles.exitModeText}>กลับโหมดปกติ</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.lobbySubtitle}>
            สุ่มจับคู่สนทนาตัวต่อตัวแบบนิรนามกับเพื่อนต่างคณะ เปิดเผยโปรไฟล์จริงได้เมื่อทั้งคู่พร้อม
          </Text>
        </View>

        <ScrollView
          style={styles.lobbyScroll}
          contentContainerStyle={styles.lobbyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Card: สุ่มคู่สนทนาใหม่ */}
          <TouchableOpacity
            style={styles.randomMatchCard}
            activeOpacity={0.85}
            onPress={handleRandomMatch}
            disabled={isMatching}
          >
            <View style={styles.randomMatchIconBox}>
              <Ionicons name="shuffle" size={24} color="#818CF8" />
            </View>
            <View style={styles.randomMatchTextBox}>
              <Text style={styles.randomMatchTitle}>สุ่มคู่สนทนาใหม่</Text>
              <Text style={styles.randomMatchDesc}>
                ค้นหาเพื่อนต่างคณะที่กำลังออนไลน์เพื่อเปิดบทสนทนาตัวต่อตัว
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#818CF8" />
          </TouchableOpacity>

          {/* Conversations List Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>บทสนทนาของคุณ</Text>
            <Text style={styles.sectionBadge}>{oneOnOneRooms.length} คน</Text>
          </View>

          {oneOnOneRooms.map((room) => {
            const displayName = room.isRevealed
              ? room.partnerRealName
              : room.partnerAlias;

            return (
              <TouchableOpacity
                key={room.id}
                style={styles.chatCard}
                activeOpacity={0.75}
                onPress={() => setActiveOneOnOneRoomId(room.id)}
              >
                {/* Partner Avatar / Icon Circle */}
                {room.isRevealed && room.partnerRealAvatar ? (
                  <Image
                    source={{ uri: room.partnerRealAvatar }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Ionicons
                      name={room.partnerIcon || "finger-print-outline"}
                      size={20}
                      color="#818CF8"
                    />
                  </View>
                )}

                <View style={styles.chatCardDetails}>
                  <View style={styles.chatCardTopRow}>
                    <Text style={styles.chatPartnerName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text style={styles.chatTimeText}>{room.lastMessageTime}</Text>
                  </View>

                  <View style={styles.chatCardMetaRow}>
                    <View style={styles.facultyTagPill}>
                      <Text style={styles.facultyTagText}>{room.partnerFaculty}</Text>
                    </View>
                    {room.isRevealed ? (
                      <View style={styles.revealedTag}>
                        <Ionicons name="sparkles" size={10} color="#818CF8" />
                        <Text style={styles.revealedTagText}>เปิดเผยตัวตนแล้ว</Text>
                      </View>
                    ) : (
                      <View style={styles.anonymousTag}>
                        <Ionicons name="lock-closed" size={10} color="#64748B" />
                        <Text style={styles.anonymousTagText}>นิรนาม</Text>
                      </View>
                    )}
                  </View>

                  {Boolean(room.lastMessage) && (
                    <Text style={styles.lastMsgSnippet} numberOfLines={1}>
                      {room.lastMessage}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Matching Loading Modal */}
        <Modal visible={isMatching} transparent={true} animationType="fade">
          <View style={styles.matchingOverlay}>
            <View style={styles.matchingCard}>
              <ActivityIndicator size="large" color="#818CF8" />
              <Text style={styles.matchingTitle}>กำลังสแกนหาคู่สนทนา...</Text>
              <Text style={styles.matchingSubtitle}>
                ระบบกำลังเชื่อมต่อเพื่อนต่างคณะที่กำลังว่างอยู่ในขณะนี้
              </Text>
              <View style={styles.matchingFacultyRow}>
                <Text style={styles.matchingFacultyChip}>แพทย์</Text>
                <Text style={styles.matchingFacultyChip}>อักษร</Text>
                <Text style={styles.matchingFacultyChip}>สถาปัตย์</Text>
                <Text style={styles.matchingFacultyChip}>นิติ</Text>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: CHAT VIEW (หน้าคุย 1 on 1)
  // ==========================================
  const displayName = currentRoom.isRevealed
    ? currentRoom.partnerRealName
    : currentRoom.partnerAlias;
  const messages = currentRoom.messages || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Top Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => setActiveOneOnOneRoomId(null)}
        >
          <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
        </TouchableOpacity>

        {/* Partner Info */}
        {currentRoom.isRevealed && currentRoom.partnerRealAvatar ? (
          <Image
            source={{ uri: currentRoom.partnerRealAvatar }}
            style={styles.chatHeaderAvatar}
          />
        ) : (
          <View style={styles.chatHeaderAvatarCircle}>
            <Ionicons
              name={currentRoom.partnerIcon || "finger-print-outline"}
              size={18}
              color="#818CF8"
            />
          </View>
        )}

        <View style={styles.chatHeaderDetails}>
          <Text style={styles.chatHeaderName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.chatHeaderFaculty}>
            {currentRoom.partnerFaculty} • {currentRoom.isRevealed ? "โปรไฟล์จริง" : "นิรนาม"}
          </Text>
        </View>

        {/* Instant Reveal Toggle Button */}
        <TouchableOpacity
          style={[
            styles.revealActionBtn,
            currentRoom.isRevealed && styles.revealActionBtnDone,
          ]}
          activeOpacity={0.8}
          onPress={() => requestOneOnOneReveal(currentRoom.id)}
        >
          <Ionicons
            name={currentRoom.isRevealed ? "sparkles" : "key-outline"}
            size={12}
            color={currentRoom.isRevealed ? "#818CF8" : "#F8FAFC"}
          />
          <Text
            style={[
              styles.revealActionText,
              currentRoom.isRevealed && styles.revealActionTextDone,
            ]}
          >
            {currentRoom.isRevealed ? "เปิดเผยแล้ว" : "ขอเปิดตัวตน"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Bio Banner if Revealed */}
      {currentRoom.isRevealed && (
        <View style={styles.bioBanner}>
          <Ionicons name="sparkles" size={13} color="#818CF8" />
          <Text style={styles.bioBannerText} numberOfLines={2}>
            {currentRoom.partnerRealBio || "ยินดีที่ได้รู้จักกันแบบเปิดเผยตัวตนจริง!"}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.systemNoticeBox}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#818CF8" />
            <Text style={styles.systemNoticeText}>
              การสนทนา 1 on 1 แบบนิรนาม ปลอดภัย สามารถกด "ขอเปิดตัวตน" เพื่อแลกเปลี่ยนโปรไฟล์จริงได้ตลอดเวลา
            </Text>
          </View>

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.isMe ? styles.messageRowMe : styles.messageRowOther,
              ]}
            >
              {!msg.isMe && (
                <Text style={styles.senderAliasText}>{msg.senderAlias}</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.isMe ? styles.messageTextMe : styles.messageTextOther,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              <Text style={styles.messageTimestamp}>{msg.createdAt}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputCapsule}>
            <TextInput
              style={styles.textInput}
              placeholder="พิมพ์ข้อความคุยตัวต่อตัว..."
              placeholderTextColor="#64748B"
              value={inputMsg}
              onChangeText={setInputMsg}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputMsg.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!inputMsg.trim()}
              activeOpacity={0.8}
              onPress={handleSend}
            >
              <Ionicons
                name="arrow-up"
                size={16}
                color={inputMsg.trim() ? "#FFFFFF" : "#64748B"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  // Lobby Styles
  lobbyHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  lobbyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  lobbyPreTitle: {
    color: "#818CF8",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lobbyTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
  },
  lobbySubtitle: {
    color: "#94A3B8",
    fontSize: 11.5,
    lineHeight: 16,
  },
  exitModeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  exitModeText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  lobbyScroll: {
    flex: 1,
  },
  lobbyContent: {
    padding: 16,
    paddingBottom: 30,
  },
  randomMatchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#818CF8",
    marginBottom: 20,
    gap: 12,
  },
  randomMatchIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  randomMatchTextBox: {
    flex: 1,
  },
  randomMatchTitle: {
    color: "#F8FAFC",
    fontSize: 14.5,
    fontWeight: "800",
    marginBottom: 3,
  },
  randomMatchDesc: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeading: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionBadge: {
    color: "#64748B",
    fontSize: 11.5,
    fontWeight: "700",
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#818CF8",
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  chatCardDetails: {
    flex: 1,
  },
  chatCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  chatPartnerName: {
    color: "#F8FAFC",
    fontSize: 13.5,
    fontWeight: "800",
    flex: 1,
    marginRight: 6,
  },
  chatTimeText: {
    color: "#64748B",
    fontSize: 10.5,
  },
  chatCardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  facultyTagPill: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  facultyTagText: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "700",
  },
  revealedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  revealedTagText: {
    color: "#818CF8",
    fontSize: 9.5,
    fontWeight: "700",
  },
  anonymousTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0F172A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  anonymousTagText: {
    color: "#64748B",
    fontSize: 9.5,
    fontWeight: "600",
  },
  lastMsgSnippet: {
    color: "#CBD5E1",
    fontSize: 11.5,
  },
  matchingOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  matchingCard: {
    width: "100%",
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  matchingTitle: {
    color: "#F8FAFC",
    fontSize: 15.5,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 4,
  },
  matchingSubtitle: {
    color: "#94A3B8",
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
  },
  matchingFacultyRow: {
    flexDirection: "row",
    gap: 6,
  },
  matchingFacultyChip: {
    backgroundColor: "#0F172A",
    color: "#818CF8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#334155",
  },

  // Chat Screen Styles
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  chatHeaderAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#818CF8",
    marginRight: 10,
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  chatHeaderDetails: {
    flex: 1,
    marginRight: 8,
  },
  chatHeaderName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  chatHeaderFaculty: {
    color: "#94A3B8",
    fontSize: 10.5,
  },
  revealActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6366F1",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  revealActionBtnDone: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    borderWidth: 1,
    borderColor: "#818CF8",
  },
  revealActionText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  revealActionTextDone: {
    color: "#818CF8",
  },
  bioBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  bioBannerText: {
    color: "#818CF8",
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  systemNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  systemNoticeText: {
    color: "#94A3B8",
    fontSize: 10.5,
    lineHeight: 15,
    flex: 1,
  },
  messageRow: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  messageRowMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  messageRowOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderAliasText: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: "#6366F1",
    borderBottomRightRadius: 3,
  },
  messageBubbleOther: {
    backgroundColor: "#1E293B",
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: "#334155",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTextMe: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  messageTextOther: {
    color: "#F8FAFC",
  },
  messageTimestamp: {
    color: "#64748B",
    fontSize: 9.5,
    marginTop: 2,
    marginHorizontal: 4,
  },
  inputContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#0F172A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  textInput: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  sendButtonDisabled: {
    backgroundColor: "#334155",
  },
});
