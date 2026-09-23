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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

export default function BlindLoungeScreen() {
  const {
    currentLounge,
    loungeMessages,
    sendLoungeMessage,
    voteLoungePoll,
    bubbleEnergy,
    mutualRevealState,
    requestMutualReveal,
    toggleCrossBubbleMode,
  } = useCrossBubble();

  const [inputMsg, setInputMsg] = useState("");
  const [showRevealModal, setShowRevealModal] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    sendLoungeMessage(inputMsg);
    setInputMsg("");
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const isEnergyFull = bubbleEnergy >= 100;
  const facultyInlineText = `${currentLounge.faculties
    .map((fac) => fac.replace("คณะ", "").replace("ศาสตร์", ""))
    .join(" • ")} (${currentLounge.memberCount} คน)`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Flattened Modern Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.loungePreTitle}>ห้องสังสรรค์</Text>
            <Text style={styles.groupTitle} numberOfLines={1}>
              {currentLounge.title}
            </Text>
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
            ความสนิทในห้อง: {bubbleEnergy}%{" "}
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
                width: `${bubbleEnergy}%`,
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
          {Boolean(currentLounge.activePoll) && (
            <View style={styles.icebreakerBubble}>
              <View style={styles.icebreakerHeader}>
                <View style={styles.icebreakerTag}>
                  <Ionicons name="bulb-outline" size={12} color="#F59E0B" />
                  <Text style={styles.icebreakerTagText}>หัวข้อเปิดบทสนทนาคืนนี้</Text>
                </View>
                <Text style={styles.icebreakerBonus}>+15% ความสนิท</Text>
              </View>

              <Text style={styles.icebreakerQuestion}>
                {currentLounge.activePoll.question}
              </Text>

              <View style={styles.pollOptionsContainer}>
                {currentLounge.activePoll.options.map((option, idx) => {
                  const isVoted = currentLounge.activePoll.userVotedIndex === idx;
                  const hasAnyVote = currentLounge.activePoll.userVotedIndex !== null;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.pollOptionRow,
                        isVoted && styles.pollOptionRowVoted,
                      ]}
                      activeOpacity={0.8}
                      disabled={hasAnyVote}
                      onPress={() => voteLoungePoll(currentLounge.activePoll.id, idx)}
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
          {loungeMessages.map((msg) => {
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
                  {mutualRevealState.consentCount} จาก {mutualRevealState.totalRequired} คน
                </Text>
              </View>
              <View style={styles.consentTrack}>
                <View
                  style={[
                    styles.consentFill,
                    {
                      width: `${(mutualRevealState.consentCount / mutualRevealState.totalRequired) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Consent Action */}
            {!mutualRevealState.userHasConsented ? (
              <TouchableOpacity
                style={styles.consentActionBtn}
                activeOpacity={0.85}
                onPress={requestMutualReveal}
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
            <Text style={styles.membersListHeader}>เพื่อนในห้องสังสรรค์สัปดาห์นี้:</Text>
            <ScrollView style={styles.membersScroll} showsVerticalScrollIndicator={false}>
              {currentLounge.members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  {mutualRevealState.allConsented && member.realAvatar ? (
                    <Image source={{ uri: member.realAvatar }} style={styles.memberAvatarImg} />
                  ) : (
                    <View style={styles.memberAvatarCircle}>
                      <Text style={styles.memberAvatarInitial}>
                        {mutualRevealState.allConsented
                          ? member.realName.charAt(0)
                          : member.alias.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberDisplayName}>
                      {mutualRevealState.allConsented ? member.realName : member.alias}
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
    justifyContent: "space-between",
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
