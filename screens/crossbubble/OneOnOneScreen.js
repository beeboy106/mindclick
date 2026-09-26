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
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";
import CrossBubbleAvatar from "../../components/crossbubble/CrossBubbleAvatar";

export default function OneOnOneScreen() {
  const {
    darkRooms,
    activeDarkRoomId,
    setActiveDarkRoomId,
    sendDarkRoomMessage,
    sendFriendRequest,
    getFriendPosts,
    toggleCrossBubbleMode,
    crossBubbleTheme: theme,
  } = useCrossBubble();

  const [inputMsg, setInputMsg] = useState("");
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);
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

  const handleAddFriend = () => {
    if (!currentRoom) return;
    sendFriendRequest(currentRoom.id);
  };

  // ดึงโพสต์ของเพื่อนคนนี้
  const friendPosts = currentRoom
    ? getFriendPosts(currentRoom.feedUserId, currentRoom.partnerRealName)
    : [];

  // ==========================================
  // VIEW 1: LOBBY VIEW (หน้ารวมแชทห้องมืด)
  // ==========================================
  if (!currentRoom) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.surface} translucent={true} />

        {/* Lobby Header */}
        <View style={[styles.topHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>ห้องมืด</Text>
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
          {/* Banner Explanation */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="moon" size={20} color="#17171c" />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>พื้นที่สนทนาแบบนิรนามเพื่อความสบายใจ</Text>
              <Text style={styles.infoDesc}>
                พูดคุยตัวต่อตัวแบบนิรนาม ไม่ต้องเคอะเขินกัน หากต้องการเชื่อมต่อเป็นเพื่อนในหน้าหลัก สามารถกดเมนูขีดสามขีดมุมบนขวาเพื่อกด "เพิ่มเพื่อน" ได้ตลอดเวลา
              </Text>
            </View>
          </View>

          {/* Rooms List */}
          <Text style={styles.sectionTitle}>
            รายการบทสนทนานิรนาม ({darkRooms.length})
          </Text>

          {darkRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>ยังไม่มีคู่สนทนาในห้องมืด</Text>
              <Text style={styles.emptyDesc}>
                เข้าร่วมห้องสังสรรค์เวลา 19:00 เพื่อทำภารกิจและจับคู่มาคุยต่อแบบตัวต่อตัว
              </Text>
            </View>
          ) : (
            darkRooms.map((room) => {
              const isAccepted = room.friendStatus === "accepted";

              return (
                <TouchableOpacity
                  key={room.id}
                  style={styles.roomCard}
                  activeOpacity={0.85}
                  onPress={() => setActiveDarkRoomId(room.id)}
                >
                  <View style={styles.roomAvatarBox}>
                    <CrossBubbleAvatar
                      avatarId={room.partnerIcon}
                      size={46}
                      borderRadius={12}
                      borderWidth={1.5}
                    />
                  </View>

                  <View style={styles.roomInfoCol}>
                    <View style={styles.roomNameRow}>
                      <Text style={styles.roomPartnerName}>{room.partnerAlias}</Text>
                      <Text style={styles.roomTimeText}>{room.lastMessageTime}</Text>
                    </View>

                    <View style={styles.roomSubRow}>
                      <Text style={styles.roomFacultyText}>แชทนิรนาม</Text>
                      {isAccepted ? (
                        <View style={styles.friendBadge}>
                          <Ionicons name="checkmark-circle" size={10} color="#15803d" />
                          <Text style={styles.friendBadgeText}>เป็นเพื่อนในหน้าหลักแล้ว</Text>
                        </View>
                      ) : (
                        <View style={styles.anonBadge}>
                          <Ionicons name="lock-closed" size={10} color="#64748b" />
                          <Text style={styles.anonBadgeText}>นิรนาม</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.roomLastMsg} numberOfLines={1}>
                      {room.lastMessage}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE 1-ON-1 ANONYMOUS CHAT
  // ==========================================
  const isAccepted = currentRoom.friendStatus === "accepted";
  const isPending = currentRoom.friendStatus === "pending";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvas }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.surface} translucent={true} />

      {/* Chat Top Bar with 3-bar Hamburger Menu at Top Right */}
      <View style={[styles.chatTopBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setActiveDarkRoomId(null)}
        >
          <Ionicons name="arrow-back" size={20} color="#17171c" />
        </TouchableOpacity>

        {/* Mascot Avatar Box (Always Anonymous in Dark Room) */}
        <View style={styles.chatHeaderAvatarBox}>
          <CrossBubbleAvatar
            avatarId={currentRoom.partnerIcon}
            size={36}
            borderRadius={10}
            borderWidth={1.5}
          />
        </View>

        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatPartnerName}>{currentRoom.partnerAlias}</Text>
          <Text style={styles.chatPartnerSub}>
            {isAccepted ? "เป็นเพื่อนในหน้าหลักแล้ว" : "ห้องมืด (แชทนิรนาม)"}
          </Text>
        </View>

        {/* 3-bar hamburger icon at top right */}
        <TouchableOpacity
          style={styles.menuBtn}
          activeOpacity={0.8}
          onPress={() => setShowMenuModal(true)}
        >
          <Ionicons name="menu" size={24} color="#17171c" />
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area (Clean and without cluttering profile banner) */}
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
                <Ionicons name="information-circle-outline" size={14} color="#64748b" />
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
            placeholder="ส่งข้อความแบบนิรนาม..."
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

      {/* MODAL 1: HAMBURGER MENU MODAL (ขีดสามขีดมุมบนขวา) */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.menuCard}>
            <View style={styles.menuHeaderRow}>
              <View>
                <Text style={styles.menuHeaderTitle}>ตัวเลือกการสนทนา</Text>
                <Text style={styles.menuHeaderAlias}>{currentRoom.partnerAlias}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Ionicons name="close" size={22} color="#17171c" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuDivider} />

            {/* Friend Action Section */}
            {!isAccepted ? (
              <View style={styles.menuActionBox}>
                <View style={styles.menuActionTextCol}>
                  <Text style={styles.menuActionPrompt}>
                    ต้องการทำความรู้จักตัวจริงและคุยต่อในแชทหน้าหลัก?
                  </Text>
                  <Text style={styles.menuActionHint}>
                    เมื่ออีกฝ่ายตอบรับ จะแสดงแชทของเพื่อนคนนี้ในหน้าแชทหลักให้ทันที
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.addFriendMenuBtn, isPending && styles.addFriendMenuBtnPending]}
                  activeOpacity={0.85}
                  disabled={isPending}
                  onPress={() => {
                    handleAddFriend();
                  }}
                >
                  {isPending ? (
                    <>
                      <ActivityIndicator size="small" color="#17171c" />
                      <Text style={styles.addFriendMenuBtnText}>ส่งคำขอแล้ว (รอเพื่อนตอบรับ...)</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={16} color="#17171c" />
                      <Text style={styles.addFriendMenuBtnText}>เพิ่มเพื่อน</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.menuAcceptedBox}>
                <View style={styles.acceptedHeaderRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                  <Text style={styles.acceptedTitleText}>เป็นเพื่อนกันแล้วในหน้าหลัก</Text>
                </View>
                <Text style={styles.acceptedDescText}>
                  เปิดห้องแชทของเพื่อนคนนี้ในหน้าแชทหลักให้เรียบร้อยแล้ว เมื่อกลับไปที่หน้าแชทหลักจะพบห้องแชทของเพื่อนที่เพิ่งเพิ่ม
                </Text>

                {/* View friend's posts button */}
                <TouchableOpacity
                  style={styles.viewPostsMenuBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowMenuModal(false);
                    setTimeout(() => setShowPostsModal(true), 250);
                  }}
                >
                  <Ionicons name="newspaper-outline" size={15} color="#17171c" />
                  <Text style={styles.viewPostsMenuBtnText}>ดูสิ่งที่เพื่อนคนนี้เคยโพสต์</Text>
                </TouchableOpacity>

                {/* Return to normal mode button straight to Feed & Chat */}
                <TouchableOpacity
                  style={styles.exitToFeedMenuBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowMenuModal(false);
                    toggleCrossBubbleMode(false, "FeedTab");
                  }}
                >
                  <Ionicons name="chatbubbles-outline" size={15} color="#17171c" />
                  <Text style={styles.exitToFeedMenuBtnText}>กลับสู่โหมดปกติ (ไปหน้า ฟีด & แชท)</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.menuNoticeBox}>
              <Ionicons name="shield-outline" size={14} color="#64748b" />
              <Text style={styles.menuNoticeText}>
                ในห้องมืดนี้การพูดคุยจะยังคงเป็นแบบนิรนามเพื่อความสบายใจสูงสุด
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 2: VIEW POSTS PREVIOUSLY SHARED BY THIS FRIEND */}
      <Modal
        visible={showPostsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPostsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  สิ่งที่เพื่อนคนนี้เคยโพสต์
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowPostsModal(false)}>
                <Ionicons name="close" size={22} color="#17171c" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {friendPosts.length === 0 ? (
                <View style={styles.emptyPostsBox}>
                  <Ionicons name="document-text-outline" size={36} color="#cbd5e1" />
                  <Text style={styles.emptyPostsText}>เพื่อนคนนี้ยังไม่มีโพสต์บนฟีด</Text>
                </View>
              ) : (
                friendPosts.map((post) => (
                  <View key={post.id} style={styles.friendPostCard}>
                    <View style={styles.postTopRow}>
                      <View style={styles.postTopicBadge}>
                        <Text style={styles.postTopicBadgeText}>
                          {post.topicId ? "กระทู้พูดคุย" : "ฟีดทั่วไป"}
                        </Text>
                      </View>
                      <Text style={styles.postDateText}>{post.createdAt}</Text>
                    </View>

                    <Text style={styles.postContentText}>{post.content}</Text>

                    {post.image && (
                      <Image source={{ uri: post.image }} style={styles.postImage} />
                    )}

                    <View style={styles.postFooterRow}>
                      <View style={styles.postStatItem}>
                        <Ionicons name="heart" size={14} color="#17171c" />
                        <Text style={styles.postStatText}>
                          {(post.likes || []).length} ถูกใจ
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 30 }} />
            </ScrollView>
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
  roomAvatarBox: {
    marginRight: 12,
  },
  roomAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 12,
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
  roomSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  roomFacultyText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
  },
  friendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  friendBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#15803d",
  },
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  anonBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#64748b",
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
  chatHeaderAvatarBox: {
    marginRight: 10,
  },
  chatHeaderAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
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
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 16,
  },
  menuCard: {
    width: 290,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#17171c",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  menuHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  menuHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
  },
  menuHeaderAlias: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  menuActionBox: {
    gap: 10,
  },
  menuActionTextCol: {
    gap: 3,
  },
  menuActionPrompt: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#17171c",
    lineHeight: 17,
  },
  menuActionHint: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
  },
  addFriendMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: "#17171c",
    gap: 6,
    marginTop: 4,
  },
  addFriendMenuBtnPending: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  addFriendMenuBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#17171c",
  },
  menuAcceptedBox: {
    gap: 8,
  },
  acceptedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  acceptedTitleText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#15803d",
  },
  acceptedDescText: {
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
  },
  viewPostsMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#17171c",
    borderRadius: 8,
    paddingVertical: 7,
    gap: 6,
    marginTop: 6,
  },
  viewPostsMenuBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#17171c",
  },
  exitToFeedMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    borderWidth: 1.5,
    borderColor: "#17171c",
    borderRadius: 8,
    paddingVertical: 7,
    gap: 6,
    marginTop: 6,
  },
  exitToFeedMenuBtnText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#17171c",
  },
  menuNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  menuNoticeText: {
    flex: 1,
    fontSize: 10.5,
    color: "#94a3b8",
    lineHeight: 14,
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17171c",
    marginTop: 2,
  },
  emptyPostsBox: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyPostsText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 8,
  },
  friendPostCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  postTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  postTopicBadge: {
    backgroundColor: "#c7f65a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  postTopicBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#17171c",
  },
  postDateText: {
    fontSize: 10.5,
    color: "#94a3b8",
  },
  postContentText: {
    fontSize: 13,
    color: "#17171c",
    lineHeight: 18,
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  postFooterRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  postStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postStatText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
});
