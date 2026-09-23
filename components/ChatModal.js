import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useFeed } from "../context/FeedContext";
import { useAuth } from "../context/AuthContext";
import ReportBlockModal from "./ReportBlockModal";
import { getIcebreakerList } from "../lib/mindInsight";

export default function ChatModal({
  visible,
  onClose,
  initialFriendId = null,
  initialFriendData = null,
  suggestedIcebreakers = [],
}) {
  const { friends, chats, sendMessage, markAsRead, startChatWithUser } = useFeed();
  const { blockedUserIds = [], blockUser, submitReport } = useAuth();

  // State: activeFriend (null = ดูหน้ารวมรายชื่อเพื่อน, object = อยู่ในห้องแชทเดี่ยว)
  const [activeFriend, setActiveFriend] = useState(null);
  const [inputText, setInputText] = useState("");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const flatListRef = useRef(null);

  // เมื่อเปิด Modal ถ้ามี initialFriendId ให้เปิดห้องแชทของคนนั้นทันที
  useEffect(() => {
    if (visible) {
      if (initialFriendId) {
        const found = friends.find((f) => f.id === initialFriendId);
        if (found) {
          setActiveFriend(found);
          markAsRead(found.id);
        } else if (initialFriendData) {
          // ถ้ายังไม่มีใน friends ให้เริ่มแชทและสร้าง record ทันที
          startChatWithUser(initialFriendData).then((createdFriend) => {
            if (createdFriend) {
              setActiveFriend(createdFriend);
            }
          });
        }
      }
    } else {
      setActiveFriend(null);
      setInputText("");
    }
  }, [visible, initialFriendId, initialFriendData, friends, markAsRead, startChatWithUser]);

  const handleSelectFriend = (friend) => {
    setActiveFriend(friend);
    markAsRead(friend.id);
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeFriend) return;
    sendMessage(activeFriend.id, inputText);
    setInputText("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const visibleFriends = (friends || []).filter(
    (f) => !blockedUserIds.includes(f.id)
  );
  const activeMessages = activeFriend ? chats[activeFriend.id] || [] : [];
  const prompts =
    suggestedIcebreakers && suggestedIcebreakers.length > 0
      ? suggestedIcebreakers
      : activeFriend
      ? getIcebreakerList(null, activeFriend.name)
      : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeContainer} edges={["top", "bottom", "left", "right"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCard}
          >
            {/* VIEW 1: ห้องแชท 1-on-1 */}
            {activeFriend ? (
              <View style={styles.chatRoomContainer}>
                {/* Chat Room Header */}
                <View style={styles.roomHeader}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setActiveFriend(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-back" size={22} color={colors.ink} />
                  </TouchableOpacity>

                  <View style={styles.friendInfoRow}>
                    <View style={styles.avatarBox}>
                      {activeFriend.avatar ? (
                        <Image
                          source={{ uri: activeFriend.avatar }}
                          style={styles.roomAvatar}
                        />
                      ) : (
                        <View style={styles.roomAvatarFallback}>
                          <Text style={styles.roomAvatarInitial}>
                            {activeFriend.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.statusDotSmall,
                          {
                            backgroundColor:
                              activeFriend.status === "online" ? "#22c55e" : "#9ca3af",
                          },
                        ]}
                      />
                    </View>
                    <View>
                      <Text style={styles.roomFriendName} numberOfLines={1}>
                        {activeFriend.name}
                      </Text>
                      <Text style={styles.roomStatusText}>
                        {activeFriend.status === "online"
                          ? "กำลังใช้งาน (Online)"
                          : "ออฟไลน์ (Offline)"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <TouchableOpacity
                      style={styles.headerActionBtn}
                      onPress={() => setReportModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color={colors.ink} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={onClose}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={22} color={colors.ink} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Messages List */}
                <FlatList
                  ref={flatListRef}
                  data={activeMessages}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.messagesList}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                  renderItem={({ item }) => {
                    const isMe = item.senderId !== activeFriend.id;
                    return (
                      <View
                        style={[
                          styles.messageRow,
                          isMe ? styles.messageRowMe : styles.messageRowThem,
                        ]}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            isMe ? styles.bubbleMe : styles.bubbleThem,
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              isMe ? styles.textMe : styles.textThem,
                            ]}
                          >
                            {item.text}
                          </Text>
                          <Text
                            style={[
                              styles.messageTime,
                              isMe ? styles.timeMe : styles.timeThem,
                            ]}
                          >
                            {item.createdAt}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyChat}>
                      <Ionicons
                        name="chatbubbles-outline"
                        size={40}
                        color={colors.mutedForeground}
                      />
                      <Text style={styles.emptyChatText}>
                        ยังไม่มีข้อความ เริ่มต้นคุยกับ {activeFriend.name} ได้เลย!
                      </Text>
                    </View>
                  }
                />

                {/* Icebreaker Suggestions when 0 or 1 message */}
                {activeMessages.length <= 1 && prompts.length > 0 && (
                  <View style={styles.icebreakerPromptSection}>
                    <View style={styles.icebreakerPromptHeader}>
                      <Ionicons name="sparkles" size={13} color={colors.primary} />
                      <Text style={styles.icebreakerPromptTitle}>
                        จุดร่วมที่ตอบตรงกัน (แตะข้อความเพื่อทัก):
                      </Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.icebreakerScroll}
                    >
                      {prompts.map((pText, pIdx) => (
                        <TouchableOpacity
                          key={pIdx}
                          style={styles.icebreakerChip}
                          activeOpacity={0.8}
                          onPress={() => setInputText(pText)}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.primary} />
                            <Text style={styles.icebreakerChipText}>{pText}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Input Bar */}
                <View style={styles.inputBar}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="พิมพ์ข้อความ..."
                    placeholderTextColor="#9ca3af"
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !inputText.trim() && styles.sendButtonDisabled,
                    ]}
                    disabled={!inputText.trim()}
                    onPress={handleSend}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="send" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* VIEW 2: รายชื่อคนที่เคยคุยด้วย (Chat List) */
              <View style={styles.listContainer}>
                {/* List Header */}
                <View style={styles.listHeader}>
                  <View style={styles.listHeaderTitleBox}>
                    <Ionicons name="chatbubbles" size={22} color={colors.primary} />
                    <Text style={styles.listHeaderTitle}>ข้อความแชท (Friends)</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={22} color={colors.ink} />
                  </TouchableOpacity>
                </View>

                {/* Friends List */}
                <FlatList
                  data={visibleFriends}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.friendsListContent}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.friendItem}
                      activeOpacity={0.8}
                      onPress={() => handleSelectFriend(item)}
                    >
                      <View style={styles.friendAvatarWrapper}>
                        {item.avatar ? (
                          <Image
                            source={{ uri: item.avatar }}
                            style={styles.friendAvatar}
                          />
                        ) : (
                          <View style={styles.friendAvatarFallback}>
                            <Text style={styles.friendInitial}>
                              {item.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                item.status === "online" ? "#22c55e" : "#9ca3af",
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.friendInfo}>
                        <View style={styles.friendTopRow}>
                          <Text style={styles.friendName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.friendTime}>{item.lastTime}</Text>
                        </View>
                        <View style={styles.friendBottomRow}>
                          <Text style={styles.lastMsg} numberOfLines={1}>
                            {item.lastMessage || "แตะเพื่อเริ่มบทสนทนา"}
                          </Text>
                          {Boolean(item.unread && item.unread > 0) && (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadText}>{item.unread}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>

      <ReportBlockModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetType="user"
        targetId={activeFriend?.id}
        targetName={activeFriend?.name || "ผู้ใช้งาน"}
        onBlockUser={async (targetId, targetName) => {
          if (blockUser && targetId) {
            await blockUser(targetId, targetName);
            setActiveFriend(null);
          }
        }}
        onReportSubmitted={async (reportData) => {
          if (submitReport) {
            await submitReport({
              ...reportData,
              context: "1-on-1 chat",
            });
          }
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 23, 28, 0.65)",
    justifyContent: "flex-end",
  },
  safeContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    height: "85%",
    overflow: "hidden",
    ...shadows.neo,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    backgroundColor: colors.card,
  },
  listHeaderTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  friendsListContent: {
    paddingVertical: 8,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  friendAvatarWrapper: {
    position: "relative",
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  friendAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  friendInitial: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  friendInfo: {
    flex: 1,
  },
  friendTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  friendTime: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  friendBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMsg: {
    fontSize: 13,
    color: colors.mutedForeground,
    flex: 1,
    paddingRight: 8,
  },
  unreadBadge: {
    backgroundColor: colors.coral,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  chatRoomContainer: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    backgroundColor: colors.card,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  friendInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarBox: {
    position: "relative",
  },
  roomAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  roomAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  roomAvatarInitial: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  statusDotSmall: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  roomFriendName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  roomStatusText: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  messagesList: {
    padding: 16,
    gap: 10,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowThem: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "#f1f5f9",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMe: {
    color: colors.white,
  },
  textThem: {
    color: colors.ink,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timeMe: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  timeThem: {
    color: colors.mutedForeground,
  },
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyChatText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
    backgroundColor: colors.card,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.ink,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  icebreakerPromptSection: {
    backgroundColor: "#FFFBEB",
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  icebreakerPromptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  icebreakerPromptTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
  },
  icebreakerScroll: {
    gap: 8,
    paddingRight: 12,
  },
  icebreakerChip: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadows.neoSm,
  },
  icebreakerChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
});
