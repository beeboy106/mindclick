import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

export default function OneOnOneScreen() {
  const {
    darkRooms,
    activeDarkRoomId,
    setActiveDarkRoomId,
    sendDarkRoomMessage,
    toggleCrossBubbleMode,
  } = useCrossBubble();

  const [inputMsg, setInputMsg] = useState("");
  const scrollViewRef = useRef(null);

  const currentRoom = darkRooms.find((r) => r.id === activeDarkRoomId) || null;

  useEffect(() => {
    if (currentRoom) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentRoom?.messages, currentRoom]);

  const handleSend = () => {
    if (!inputMsg.trim() || !currentRoom) return;
    sendDarkRoomMessage(currentRoom.id, inputMsg);
    setInputMsg("");
  };

  const handleCopyContact = (type, val) => {
    Alert.alert("คัดลอกสำเร็จ", `${type}: ${val} (นำไปค้นหาและเพิ่มเพื่อนในแอปพลิเคชันได้ทันที)`);
  };

  // ==========================================
  // VIEW 1: LOBBY VIEW (หน้ารวมแชทห้องมืด)
  // ==========================================
  if (!currentRoom) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        {/* Lobby Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>PRIVATE MATCH ROOM</Text>
            <Text style={styles.headerTitle}>ห้องมืด</Text>
          </View>
          <TouchableOpacity
            style={styles.exitBtn}
            activeOpacity={0.8}
            onPress={() => toggleCrossBubbleMode(false)}
          >
            <Ionicons name="log-out-outline" size={15} color="#64748b" />
            <Text style={styles.exitBtnText}>โหมดปกติ</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Explanation */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="moon" size={20} color="#17171c" />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>พื้นที่สานต่อมิตรภาพ 1-on-1</Text>
              <Text style={styles.infoDesc}>
                พูดคุยส่วนตัวกับเพื่อนที่แมตช์ได้จากห้องสังสรรค์หรือตอบกลับจากกระดานลับ เปิดเผยโปรไฟล์จริงและคอนแทกต์ทันทีเพื่อต่อยอดสู่โลกจริง
              </Text>
            </View>
          </View>

          {/* Rooms List */}
          <Text style={styles.sectionTitle}>
            รายการบทสนทนา ({darkRooms.length})
          </Text>

          {darkRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>ยังไม่มีคู่สนทนาในห้องมืด</Text>
              <Text style={styles.emptyDesc}>
                เข้าร่วมห้องสังสรรค์เวลา 19:00 เพื่อสุ่มกลุ่ม ตอบควิซ และกดแมตช์เพื่อน หรือตอบกลับโน้ตในกระดานลับ
              </Text>
            </View>
          ) : (
            darkRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                activeOpacity={0.85}
                onPress={() => setActiveDarkRoomId(room.id)}
              >
                {room.partnerRealAvatar ? (
                  <Image source={{ uri: room.partnerRealAvatar }} style={styles.roomAvatar} />
                ) : (
                  <View style={styles.roomAvatarFallback}>
                    <Ionicons name={room.partnerIcon || "person"} size={22} color="#17171c" />
                  </View>
                )}

                <View style={styles.roomInfoCol}>
                  <View style={styles.roomNameRow}>
                    <Text style={styles.roomPartnerName}>{room.partnerRealName}</Text>
                    <Text style={styles.roomTimeText}>{room.lastMessageTime}</Text>
                  </View>
                  <Text style={styles.roomFacultyText}>{room.partnerRealFaculty}</Text>
                  <Text style={styles.roomLastMsg} numberOfLines={1}>
                    {room.lastMessage}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE 1-ON-1 CHAT
  // ==========================================
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

      {/* Chat Top Bar */}
      <View style={styles.chatTopBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setActiveDarkRoomId(null)}
        >
          <Ionicons name="arrow-back" size={20} color="#17171c" />
        </TouchableOpacity>

        {currentRoom.partnerRealAvatar ? (
          <Image source={{ uri: currentRoom.partnerRealAvatar }} style={styles.chatHeaderAvatar} />
        ) : (
          <View style={styles.chatHeaderAvatarFallback}>
            <Ionicons name={currentRoom.partnerIcon || "person"} size={16} color="#17171c" />
          </View>
        )}

        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatPartnerName}>{currentRoom.partnerRealName}</Text>
          <Text style={styles.chatPartnerSub}>{currentRoom.partnerRealFaculty}</Text>
        </View>
      </View>

      {/* Disclosed Real Profile & Social Handles Card */}
      <View style={styles.realProfileCard}>
        <View style={styles.profileBadgeRow}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#17171c" />
            <Text style={styles.verifiedBadgeText}>VERIFIED MATCH</Text>
          </View>
          <Text style={styles.profileBioText} numberOfLines={1}>
            {currentRoom.partnerBio || "ยินดีที่ได้รู้จักนะ"}
          </Text>
        </View>

        <View style={styles.contactsRow}>
          {currentRoom.instagram && (
            <TouchableOpacity
              style={styles.contactChip}
              activeOpacity={0.8}
              onPress={() => handleCopyContact("Instagram", currentRoom.instagram)}
            >
              <Ionicons name="logo-instagram" size={13} color="#17171c" />
              <Text style={styles.contactChipText}>{currentRoom.instagram}</Text>
              <Ionicons name="copy-outline" size={11} color="#64748b" />
            </TouchableOpacity>
          )}

          {currentRoom.lineId && (
            <TouchableOpacity
              style={styles.contactChip}
              activeOpacity={0.8}
              onPress={() => handleCopyContact("Line ID", currentRoom.lineId)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={13} color="#17171c" />
              <Text style={styles.contactChipText}>Line: {currentRoom.lineId}</Text>
              <Ionicons name="copy-outline" size={11} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {currentRoom.messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <View key={msg.id} style={styles.sysMsgContainer}>
                <Ionicons name="git-branch-outline" size={14} color="#64748b" />
                <Text style={styles.sysMsgText}>{msg.text}</Text>
              </View>
            );
          }

          const isMe = msg.isMe;

          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}
            >
              <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                <Text style={[styles.msgBodyText, isMe && styles.msgBodyTextMe]}>
                  {msg.text}
                </Text>
                <Text style={[styles.msgTimeText, isMe && styles.msgTimeTextMe]}>
                  {msg.createdAt}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            value={inputMsg}
            onChangeText={setInputMsg}
            placeholder={`ส่งข้อความหา ${currentRoom.partnerRealName}...`}
            placeholderTextColor="#94a3b8"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendBtn}
            activeOpacity={0.8}
            onPress={handleSend}
          >
            <Ionicons name="send" size={16} color="#17171c" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
  },
  infoDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17171c",
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#17171c",
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 10,
  },
  roomAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  roomAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roomInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  roomNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomPartnerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
  },
  roomTimeText: {
    fontSize: 10.5,
    color: "#94a3b8",
  },
  roomFacultyText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  roomLastMsg: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  chatTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  chatHeaderAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatPartnerName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#17171c",
  },
  chatPartnerSub: {
    fontSize: 11.5,
    color: "#64748b",
  },
  realProfileCard: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  profileBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#17171c",
    letterSpacing: 0.5,
  },
  profileBioText: {
    flex: 1,
    fontSize: 11,
    color: "#64748b",
  },
  contactsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  contactChip: {
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
  contactChipText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#17171c",
  },
  chatScroll: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  chatContent: {
    padding: 16,
  },
  sysMsgContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sysMsgText: {
    flex: 1,
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
  },
  msgRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  msgRowLeft: {
    justifyContent: "flex-start",
  },
  msgRowRight: {
    justifyContent: "flex-end",
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleOther: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  msgBubbleMe: {
    backgroundColor: "#17171c",
  },
  msgBodyText: {
    fontSize: 13.5,
    color: "#17171c",
    lineHeight: 18,
  },
  msgBodyTextMe: {
    color: "#ffffff",
  },
  msgTimeText: {
    fontSize: 9.5,
    color: "#94a3b8",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  msgTimeTextMe: {
    color: "#94a3b8",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5,
    color: "#17171c",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
  },
});
