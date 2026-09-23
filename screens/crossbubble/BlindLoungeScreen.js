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

export default function BlindLoungeScreen() {
  const {
    loungeRooms,
    activeLoungeRoomId,
    setActiveLoungeRoomId,
    sendLoungeMessage,
    voteLoungePoll,
    requestMutualReveal,
    createNewRandomLoungeRoom,
    toggleCrossBubbleMode,
  } = useCrossBubble();

  const [inputMsg, setInputMsg] = useState("");
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const scrollViewRef = useRef(null);

  // Current active room
  const currentRoom =
    loungeRooms.find((r) => r.id === activeLoungeRoomId) || null;

  // Handle Send message in active room
  const handleSend = () => {
    if (!inputMsg.trim() || !currentRoom) return;
    sendLoungeMessage(inputMsg, currentRoom.id);
    setInputMsg("");
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Handle Random Matching new group
  const handleRandomMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      createNewRandomLoungeRoom();
      setIsMatching(false);
    }, 1500);
  };

  // ==========================================
  // VIEW 1: LOBBY VIEW (เมื่อยังไม่ได้เลือกห้อง)
  // ==========================================
  if (!currentRoom) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

        {/* Lobby Header */}
        <View style={styles.lobbyHeader}>
          <View style={styles.lobbyTitleRow}>
            <View>
              <Text style={styles.lobbyPreTitle}>UNDERGROUND LOUNGE</Text>
              <Text style={styles.lobbyTitle}>ห้องสังสรรค์</Text>
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
            พื้นที่รวมกลุ่มเพื่อน 4 คณะตามไลฟ์สไตล์ สุ่มเข้ากลุ่มใหม่หรือคุยต่อในห้องเก่าได้ตลอดเวลา
          </Text>
        </View>

        <ScrollView
          style={styles.lobbyScroll}
          contentContainerStyle={styles.lobbyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Card: สุ่มกลุ่มใหม่ */}
          <TouchableOpacity
            style={styles.randomMatchCard}
            activeOpacity={0.85}
            onPress={handleRandomMatch}
            disabled={isMatching}
          >
            <View style={styles.randomMatchIconBox}>
              <Ionicons name="sparkles" size={24} color="#818CF8" />
            </View>
            <View style={styles.randomMatchTextBox}>
              <Text style={styles.randomMatchTitle}>สุ่มกลุ่มสังสรรค์ใหม่</Text>
              <Text style={styles.randomMatchDesc}>
                จับคู่เพื่อน 4 คณะที่ไลฟ์สไตล์และความคิดตรงกันในสัปดาห์นี้
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#818CF8" />
          </TouchableOpacity>

          {/* Rooms List Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>ห้องที่คุณเข้าร่วม</Text>
            <Text style={styles.sectionBadge}>{loungeRooms.length} ห้อง</Text>
          </View>

          {loungeRooms.map((room) => {
            const facultySummary = room.faculties
              .map((f) => f.replace("คณะ", "").replace("ศาสตร์", ""))
              .join(" • ");
            const isFullIntimacy = (room.bubbleEnergy || 0) >= 100;

            return (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                activeOpacity={0.75}
                onPress={() => setActiveLoungeRoomId(room.id)}
              >
                <View style={styles.roomCardHeader}>
                  <View style={styles.roomThemeTag}>
                    <Ionicons name="chatbubbles-outline" size={12} color="#818CF8" />
                    <Text style={styles.roomThemeTagText} numberOfLines={1}>
                      {room.theme || "สังสรรค์ข้ามคณะ"}
                    </Text>
                  </View>
                  <View style={styles.roomStatusPill}>
                    {room.isActive ? (
                      <View style={styles.activeDot} />
                    ) : (
                      <Ionicons name="time-outline" size={11} color="#64748B" />
                    )}
                    <Text
                      style={[
                        styles.roomStatusText,
                        room.isActive && styles.roomStatusTextActive,
                      ]}
                    >
                      {room.isActive ? "กำลังคุย" : "ห้องในอดีต"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.roomTitleText}>{room.title}</Text>

                {/* Inline Faculties */}
                <Text style={styles.roomFacultiesText} numberOfLines={1}>
                  {facultySummary} ({room.memberCount || 4} คน)
                </Text>

                {/* Last Message Snippet */}
                {Boolean(room.lastMessage) && (
                  <View style={styles.lastMsgBox}>
                    <Text style={styles.lastMsgText} numberOfLines={1}>
                      {room.lastMessage}
                    </Text>
                    <Text style={styles.lastMsgTime}>{room.lastMessageTime}</Text>
                  </View>
                )}

                {/* Intimacy Bar Snippet */}
                <View style={styles.roomCardFooter}>
                  <View style={styles.intimacyMiniTrack}>
                    <View
                      style={[
                        styles.intimacyMiniFill,
                        {
                          width: `${room.bubbleEnergy || 0}%`,
                          backgroundColor: isFullIntimacy ? "#F59E0B" : "#818CF8",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.intimacyMiniText}>
                    ความสนิท: {room.bubbleEnergy || 0}%
                  </Text>
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
              <Text style={styles.matchingTitle}>กำลังค้นหาห้องสังสรรค์...</Text>
              <Text style={styles.matchingSubtitle}>
                สแกนหาเพื่อนต่างคณะที่ความสนใจและเคมีตรงกัน
              </Text>
              <View style={styles.matchingFacultyRow}>
                <Text style={styles.matchingFacultyChip}>วิศวะ</Text>
                <Text style={styles.matchingFacultyChip}>พยาบาล</Text>
                <Text style={styles.matchingFacultyChip}>อักษร</Text>
                <Text style={styles.matchingFacultyChip}>บัญชี</Text>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: CHAT VIEW (เมื่อกดเข้าห้องใดห้องหนึ่ง)
  // ==========================================
  const isEnergyFull = (currentRoom.bubbleEnergy || 0) >= 100;
  const facultyInlineText = `${currentRoom.faculties
    .map((fac) => fac.replace("คณะ", "").replace("ศาสตร์", ""))
    .join(" • ")} (${currentRoom.memberCount || 4} คน)`;
  const currentMessages = currentRoom.messages || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Flattened Modern Header with Back Button */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => setActiveLoungeRoomId(null)}
          >
            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.loungePreTitle}>ห้องสังสรรค์</Text>
            <Text style={styles.groupTitle} numberOfLines={1}>
              {currentRoom.title}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.exitModeBtn}
            activeOpacity={0.8}
            onPress={() => toggleCrossBubbleMode(false)}
          >
            <Ionicons name="log-out-outline" size={15} color="#94A3B8" />
            <Text style={styles.exitModeText}>ออก</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Inline Faculty & Member Text */}
        <View style={styles.inlineMetaRow}>
          <Ionicons name="sparkles" size={12} color="#818CF8" />
          <Text style={styles.inlineMetaText} numberOfLines={1}>
            {facultyInlineText}
          </Text>
        </View>
      </View>

      {/* Intimacy Progress Bar (Minimal 4px) */}
      <View style={styles.intimacyContainer}>
        <View style={styles.intimacyMetaRow}>
          <Text style={styles.intimacyLabel}>
            ความสนิทในห้อง: {currentRoom.bubbleEnergy || 0}%{" "}
            <Text style={styles.intimacySubHint}>
              (ชวนคุยอีกนิดเพื่อเปิดเผยตัวตนจริงร่วมกัน)
            </Text>
          </Text>
          {isEnergyFull && (
            <TouchableOpacity
              style={styles.quickRevealPill}
              activeOpacity={0.8}
              onPress={() => setShowRevealModal(true)}
            >
              <Ionicons name="sparkles" size={11} color="#FFFFFF" />
              <Text style={styles.quickRevealPillText}>เปิดเผยตัวตน</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.intimacyTrack}>
          <View
            style={[
              styles.intimacyFill,
              {
                width: `${currentRoom.bubbleEnergy || 0}%`,
                backgroundColor: isEnergyFull ? "#F59E0B" : "#818CF8",
              },
            ]}
          />
        </View>
      </View>

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
          {/* Icebreaker Question (Open System Message Bubble) */}
          {Boolean(currentRoom.activePoll) && (
            <View style={styles.icebreakerBubble}>
              <View style={styles.icebreakerHeader}>
                <View style={styles.icebreakerTag}>
                  <Ionicons name="bulb-outline" size={12} color="#F59E0B" />
                  <Text style={styles.icebreakerTagText}>หัวข้อเปิดบทสนทนาคืนนี้</Text>
                </View>
                <Text style={styles.icebreakerBonus}>+15% ความสนิท</Text>
              </View>

              <Text style={styles.icebreakerQuestion}>
                {currentRoom.activePoll.question}
              </Text>

              <View style={styles.pollOptionsContainer}>
                {currentRoom.activePoll.options.map((option, idx) => {
                  const isVoted = currentRoom.activePoll.userVotedIndex === idx;
                  const hasAnyVote = currentRoom.activePoll.userVotedIndex !== null;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.pollOptionRow,
                        isVoted && styles.pollOptionRowVoted,
                      ]}
                      activeOpacity={0.8}
                      disabled={hasAnyVote}
                      onPress={() =>
                        voteLoungePoll(currentRoom.activePoll.id, idx, currentRoom.id)
                      }
                    >
                      <View style={styles.pollOptionLeft}>
                        <View
                          style={[
                            styles.radioCircle,
                            isVoted && styles.radioCircleVoted,
                          ]}
                        >
                          {isVoted && <View style={styles.radioInnerDot} />}
                        </View>
                        <Text
                          style={[
                            styles.pollOptionLabel,
                            isVoted && styles.pollOptionLabelVoted,
                          ]}
                        >
                          {option.text}
                        </Text>
                      </View>
                      {hasAnyVote && (
                        <Text style={styles.pollVoteCount}>{option.votes} โหวต</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Messages Feed */}
          {currentMessages.map((msg) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.systemMessageContainer}>
                  <Text style={styles.systemMessageText}>{msg.text}</Text>
                </View>
              );
            }

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.isMe ? styles.messageRowMe : styles.messageRowOther,
                ]}
              >
                {!msg.isMe && (
                  <View style={styles.senderHeader}>
                    <Ionicons
                      name={msg.senderIcon || "finger-print-outline"}
                      size={11}
                      color="#818CF8"
                    />
                    <Text style={styles.senderAliasText}>{msg.senderAlias}</Text>
                  </View>
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
            );
          })}
        </ScrollView>

        {/* Input Bar: Capsule / Rounded-full */}
        <View style={styles.inputContainer}>
          <View style={styles.inputCapsule}>
            <TextInput
              style={styles.textInput}
              placeholder="พิมพ์ข้อความชวนคุยกับเพื่อนในห้อง..."
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

      {/* Mutual Reveal Modal */}
      <Modal
        visible={showRevealModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRevealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="sparkles" size={24} color="#818CF8" />
            </View>

            <Text style={styles.modalTitle}>
              เปิดเผยตัวตนจริงร่วมกัน (Mutual Reveal)
            </Text>
            <Text style={styles.modalSubtitle}>
              เมื่อสมาชิกทุกคนในห้องสังสรรค์ยินยอมร่วมกัน ระบบจะเปิดเผยโปรไฟล์จริงให้เห็นกันในห้องนี้
            </Text>

            {/* Consent Status */}
            <View style={styles.consentCard}>
              <View style={styles.consentRow}>
                <Text style={styles.consentTitle}>ระดับความยินยอม</Text>
                <Text style={styles.consentCount}>
                  {currentRoom.mutualRevealState?.consentCount || 0} จาก{" "}
                  {currentRoom.mutualRevealState?.totalRequired || 4} คน
                </Text>
              </View>
              <View style={styles.consentTrack}>
                <View
                  style={[
                    styles.consentFill,
                    {
                      width: `${
                        ((currentRoom.mutualRevealState?.consentCount || 0) /
                          (currentRoom.mutualRevealState?.totalRequired || 4)) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Consent Action */}
            {!currentRoom.mutualRevealState?.userHasConsented ? (
              <TouchableOpacity
                style={styles.consentActionBtn}
                activeOpacity={0.85}
                onPress={() => requestMutualReveal(currentRoom.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.consentActionText}>
                  ยินยอมเปิดเผยโปรไฟล์จริงในห้องนี้
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.consentedStatusBanner}>
                <Ionicons name="checkmark-done" size={16} color="#818CF8" />
                <Text style={styles.consentedStatusText}>
                  คุณยินยอมเรียบร้อยแล้ว กำลังรอเพื่อนคนอื่นยืนยัน
                </Text>
              </View>
            )}

            {/* Members List */}
            <Text style={styles.membersListHeader}>เพื่อนในห้องสังสรรค์:</Text>
            <ScrollView style={styles.membersScroll} showsVerticalScrollIndicator={false}>
              {currentRoom.members?.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  {currentRoom.mutualRevealState?.allConsented && member.realAvatar ? (
                    <Image source={{ uri: member.realAvatar }} style={styles.memberAvatarImg} />
                  ) : (
                    <View style={styles.memberAvatarCircle}>
                      <Text style={styles.memberAvatarInitial}>
                        {currentRoom.mutualRevealState?.allConsented
                          ? member.realName?.charAt(0)
                          : member.alias?.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberDisplayName}>
                      {currentRoom.mutualRevealState?.allConsented
                        ? member.realName
                        : member.alias}
                    </Text>
                    <Text style={styles.memberFacultyName}>{member.faculty}</Text>
                  </View>
                  <View
                    style={[
                      styles.consentBadge,
                      member.consented && styles.consentBadgeDone,
                    ]}
                  >
                    <Ionicons
                      name={member.consented ? "checkmark" : "time-outline"}
                      size={11}
                      color={member.consented ? "#818CF8" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.consentBadgeText,
                        member.consented && styles.consentBadgeTextDone,
                      ]}
                    >
                      {member.consented ? "ยินยอมแล้ว" : "รอยืนยัน"}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
              onPress={() => setShowRevealModal(false)}
            >
              <Text style={styles.modalCloseText}>ปิด</Text>
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
  roomCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  roomCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  roomThemeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
    maxWidth: "68%",
  },
  roomThemeTagText: {
    color: "#818CF8",
    fontSize: 10.5,
    fontWeight: "700",
  },
  roomStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#818CF8",
  },
  roomStatusText: {
    color: "#64748B",
    fontSize: 10.5,
    fontWeight: "600",
  },
  roomStatusTextActive: {
    color: "#818CF8",
    fontWeight: "700",
  },
  roomTitleText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  roomFacultiesText: {
    color: "#94A3B8",
    fontSize: 11.5,
    fontWeight: "500",
    marginBottom: 8,
  },
  lastMsgBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  lastMsgText: {
    color: "#CBD5E1",
    fontSize: 11,
    flex: 1,
  },
  lastMsgTime: {
    color: "#64748B",
    fontSize: 10,
  },
  roomCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  intimacyMiniTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#0F172A",
    borderRadius: 2,
    overflow: "hidden",
  },
  intimacyMiniFill: {
    height: "100%",
    borderRadius: 2,
  },
  intimacyMiniText: {
    color: "#94A3B8",
    fontSize: 10.5,
    fontWeight: "600",
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
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 10,
  },
  loungePreTitle: {
    color: "#818CF8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  groupTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
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
  inlineMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  inlineMetaText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  intimacyContainer: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  intimacyMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  intimacyLabel: {
    color: "#E2E8F0",
    fontSize: 11.5,
    fontWeight: "700",
    flex: 1,
  },
  intimacySubHint: {
    color: "#64748B",
    fontSize: 10.5,
    fontWeight: "400",
  },
  quickRevealPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6366F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 6,
  },
  quickRevealPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  intimacyTrack: {
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 2,
    overflow: "hidden",
  },
  intimacyFill: {
    height: "100%",
    borderRadius: 2,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  icebreakerBubble: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  icebreakerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  icebreakerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  icebreakerTagText: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "700",
  },
  icebreakerBonus: {
    color: "#818CF8",
    fontSize: 11,
    fontWeight: "600",
  },
  icebreakerQuestion: {
    color: "#F8FAFC",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 10,
  },
  pollOptionsContainer: {
    gap: 7,
  },
  pollOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  pollOptionRowVoted: {
    borderColor: "#818CF8",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  pollOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  radioCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
    borderColor: "#64748B",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleVoted: {
    borderColor: "#818CF8",
  },
  radioInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#818CF8",
  },
  pollOptionLabel: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  pollOptionLabelVoted: {
    color: "#F8FAFC",
    fontWeight: "700",
  },
  pollVoteCount: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  systemMessageContainer: {
    alignSelf: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 8,
    maxWidth: "92%",
    borderWidth: 1,
    borderColor: "#334155",
  },
  systemMessageText: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
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
  senderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
    marginLeft: 4,
  },
  senderAliasText: {
    color: "#818CF8",
    fontSize: 10.5,
    fontWeight: "700",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 15.5,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: "#94A3B8",
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 14,
  },
  consentCard: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  consentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  consentTitle: {
    color: "#818CF8",
    fontSize: 11.5,
    fontWeight: "700",
  },
  consentCount: {
    color: "#F8FAFC",
    fontSize: 11.5,
    fontWeight: "700",
  },
  consentTrack: {
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 2,
    overflow: "hidden",
  },
  consentFill: {
    height: "100%",
    backgroundColor: "#818CF8",
    borderRadius: 2,
  },
  consentActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#6366F1",
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 14,
  },
  consentActionText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  consentedStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6366F1",
    marginBottom: 14,
  },
  consentedStatusText: {
    color: "#818CF8",
    fontSize: 11.5,
    fontWeight: "600",
    flex: 1,
  },
  membersListHeader: {
    color: "#94A3B8",
    fontSize: 11.5,
    fontWeight: "700",
    marginBottom: 8,
  },
  membersScroll: {
    maxHeight: 180,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 6,
  },
  memberAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  memberAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  memberAvatarInitial: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
  },
  memberDetails: {
    flex: 1,
    marginLeft: 8,
  },
  memberDisplayName: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
  memberFacultyName: {
    color: "#64748B",
    fontSize: 10.5,
  },
  consentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#1E293B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consentBadgeDone: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  consentBadgeText: {
    color: "#64748B",
    fontSize: 9.5,
    fontWeight: "600",
  },
  consentBadgeTextDone: {
    color: "#818CF8",
  },
  modalCloseBtn: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  modalCloseText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
});
