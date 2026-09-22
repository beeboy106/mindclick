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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCrossBubble } from "../../context/CrossBubbleContext";

export default function BlindLoungeScreen({ navigation }) {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" translucent={true} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.loungeBadge}>
            <Ionicons name="chatbubbles" size={13} color="#a3e635" />
            <Text style={styles.loungeBadgeText}>แชทกลุ่มลับ (BLIND LOUNGE)</Text>
          </View>
          <TouchableOpacity
            style={styles.exitModeBtn}
            activeOpacity={0.8}
            onPress={() => toggleCrossBubbleMode(false)}
          >
            <Ionicons name="log-out-outline" size={14} color="#cbd5e1" />
            <Text style={styles.exitModeText}>กลับโหมดปกติ</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.groupTitle}>{currentLounge.title}</Text>

        {/* Faculties chips in this lounge */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.facultiesScroll}
        >
          {currentLounge.faculties.map((fac, i) => (
            <View key={i} style={styles.facultyChip}>
              <Text style={styles.facultyChipText}>#{fac.replace("คณะ", "")}</Text>
            </View>
          ))}
          <View style={[styles.facultyChip, styles.memberCountChip]}>
            <Ionicons name="people" size={11} color="#38bdf8" />
            <Text style={styles.memberCountText}>{currentLounge.memberCount} คน</Text>
          </View>
        </ScrollView>
      </View>

      {/* Bubble Energy Progress Meter */}
      <View style={styles.energyMeterContainer}>
        <View style={styles.energyMetaRow}>
          <View style={styles.energyTitleRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={15} color="#a3e635" />
            <Text style={styles.energyTitle}>พลังกลุ่ม (Bubble Energy)</Text>
          </View>
          <Text style={styles.energyPercentText}>{bubbleEnergy}%</Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${bubbleEnergy}%`,
                backgroundColor: isEnergyFull ? "#a3e635" : "#8b5cf6",
              },
            ]}
          />
        </View>

        {isEnergyFull ? (
          <TouchableOpacity
            style={styles.unlockedRevealBtn}
            activeOpacity={0.85}
            onPress={() => setShowRevealModal(true)}
          >
            <Ionicons name="sparkles" size={14} color="#090d16" />
            <Text style={styles.unlockedRevealBtnText}>
              {mutualRevealState.allConsented
                ? "ดูโปรไฟล์จริงของทุกคนแล้ว (Mutual Reveal สำเร็จ)"
                : "พลังเต็ม 100%! แตะเพื่อขอเปิดเผยตัวตนจริงร่วมกัน (Mutual Reveal)"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.energyHintRow}>
            <Ionicons name="flash-outline" size={12} color="#a3e635" />
            <Text style={styles.energyHint}>
              ส่งข้อความ (+10%) หรือตอบโพล (+15%) เพื่อปลดล็อก Mutual Reveal
            </Text>
          </View>
        )}
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
          {/* Active Icebreaker Poll */}
          {Boolean(currentLounge.activePoll) && (
            <View style={styles.pollCard}>
              <View style={styles.pollHeaderRow}>
                <View style={styles.pollTag}>
                  <Text style={styles.pollTagText}>GAME • คำถามกระตุ้นบทสนทนา</Text>
                </View>
                <Text style={styles.pollBonusText}>+15% พลัง</Text>
              </View>

              <Text style={styles.pollQuestion}>
                {currentLounge.activePoll.question}
              </Text>

              <View style={styles.pollOptionsList}>
                {currentLounge.activePoll.options.map((option, idx) => {
                  const isVoted = currentLounge.activePoll.userVotedIndex === idx;
                  const hasAnyVote = currentLounge.activePoll.userVotedIndex !== null;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.pollOptionBtn,
                        isVoted && styles.pollOptionBtnVoted,
                      ]}
                      activeOpacity={0.8}
                      disabled={hasAnyVote}
                      onPress={() => voteLoungePoll(currentLounge.activePoll.id, idx)}
                    >
                      <View style={styles.pollOptionRow}>
                        <View
                          style={[
                            styles.pollRadio,
                            isVoted && styles.pollRadioVoted,
                          ]}
                        >
                          {isVoted && <View style={styles.pollRadioInner} />}
                        </View>
                        <Text
                          style={[
                            styles.pollOptionText,
                            isVoted && styles.pollOptionTextVoted,
                          ]}
                        >
                          {option.text}
                        </Text>
                      </View>
                      {hasAnyVote && (
                        <Text style={styles.pollVotesText}>{option.votes} โหวต</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Messages */}
          {loungeMessages.map((msg) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.systemMsgBox}>
                  <Text style={styles.systemMsgText}>{msg.text}</Text>
                </View>
              );
            }

            return (
              <View
                key={msg.id}
                style={[
                  styles.msgWrapper,
                  msg.isMe ? styles.msgWrapperMe : styles.msgWrapperOther,
                ]}
              >
                {!msg.isMe && (
                  <View style={styles.msgSenderRow}>
                    <Ionicons
                      name={msg.senderIcon || "finger-print-outline"}
                      size={11}
                      color="#a3e635"
                    />
                    <Text style={styles.msgSenderAlias}>{msg.senderAlias}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.msgBubble,
                    msg.isMe ? styles.msgBubbleMe : styles.msgBubbleOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      msg.isMe ? styles.msgTextMe : styles.msgTextOther,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text style={styles.msgTime}>{msg.createdAt}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="พิมพ์ข้อความในแชทกลุ่มลับ..."
            placeholderTextColor="#64748b"
            value={inputMsg}
            onChangeText={setInputMsg}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputMsg.trim() && styles.sendBtnDisabled,
            ]}
            disabled={!inputMsg.trim()}
            activeOpacity={0.8}
            onPress={handleSend}
          >
            <Ionicons name="arrow-up" size={18} color="#090d16" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Mutual Reveal Modal */}
      <Modal
        visible={showRevealModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRevealModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.revealModalCard}>
            <View style={styles.revealModalHeader}>
              <View style={styles.revealIconBox}>
                <Ionicons name="sparkles" size={24} color="#a3e635" />
              </View>
              <Text style={styles.revealModalTitle}>
                เปิดเผยตัวตนจริงร่วมกัน (Mutual Reveal)
              </Text>
              <Text style={styles.revealModalSub}>
                เมื่อสมาชิกทุกคนในเลานจ์ส่งความยินยอมร่วมกัน ระบบจะเปิดเผยโปรไฟล์จริงให้เห็นกันในห้องนี้
              </Text>
            </View>

            {/* Consent Progress */}
            <View style={styles.consentProgressBox}>
              <Text style={styles.consentCountText}>
                ความยินยอม: {mutualRevealState.consentCount}/{mutualRevealState.totalRequired} คน
              </Text>
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

            {/* Action Buttons */}
            {!mutualRevealState.userHasConsented ? (
              <TouchableOpacity
                style={styles.consentBtn}
                activeOpacity={0.85}
                onPress={requestMutualReveal}
              >
                <Ionicons name="checkmark-circle" size={18} color="#090d16" />
                <Text style={styles.consentBtnText}>
                  ฉันยินยอมเปิดเผยโปรไฟล์จริงในกลุ่มนี้
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.consentedNotice}>
                <Ionicons name="checkmark-done" size={18} color="#a3e635" />
                <Text style={styles.consentedNoticeText}>
                  คุณได้ให้ความยินยอมแล้ว! สมาชิกคนอื่นๆ กำลังกดยืนยัน
                </Text>
              </View>
            )}

            {/* Real Profiles List (Unlocked) */}
            <Text style={styles.previewProfilesHeader}>สมาชิกในกลุ่มประจำสัปดาห์นี้:</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {currentLounge.members.map((member) => (
                <View key={member.id} style={styles.memberRevealRow}>
                  {mutualRevealState.allConsented && member.realAvatar ? (
                    <Image source={{ uri: member.realAvatar }} style={styles.memberAvatar} />
                  ) : (
                    <View style={styles.memberAvatarFallback}>
                      <Text style={styles.memberAvatarInitial}>
                        {mutualRevealState.allConsented
                          ? member.realName.charAt(0)
                          : "?"}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.memberRealName}>
                      {mutualRevealState.allConsented
                        ? member.realName
                        : member.alias}
                    </Text>
                    <View style={styles.memberStatusRow}>
                      <Text style={styles.memberFaculty}>{member.faculty}</Text>
                      <View style={styles.memberStatusTag}>
                        <Ionicons
                          name={member.consented ? "checkmark-circle" : "time-outline"}
                          size={11}
                          color={member.consented ? "#a3e635" : "#94a3b8"}
                        />
                        <Text
                          style={[
                            styles.memberStatusTagText,
                            member.consented && styles.memberStatusTagTextConsented,
                          ]}
                        >
                          {member.consented ? "ยินยอมแล้ว" : "รอกดยืนยัน"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowRevealModal(false)}
            >
              <Text style={styles.closeModalBtnText}>ปิดหน้าต่าง</Text>
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
    backgroundColor: "#090d16",
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  loungeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  loungeBadgeText: {
    color: "#a3e635",
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  exitModeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  exitModeText: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "700",
  },
  groupTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  facultiesScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  facultyChip: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  facultyChipText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  memberCountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderColor: "#0284c7",
    backgroundColor: "rgba(2, 132, 199, 0.15)",
  },
  memberCountText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "800",
  },
  energyMeterContainer: {
    backgroundColor: "#131b2e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  energyMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  energyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  energyTitle: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "800",
  },
  energyPercentText: {
    color: "#a3e635",
    fontSize: 13,
    fontWeight: "900",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  energyHint: {
    color: "#94a3b8",
    fontSize: 10.5,
    marginTop: 6,
  },
  unlockedRevealBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#a3e635",
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 8,
  },
  unlockedRevealBtnText: {
    color: "#090d16",
    fontSize: 11,
    fontWeight: "900",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pollCard: {
    backgroundColor: "#161f36",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#8b5cf6",
    marginBottom: 16,
  },
  pollHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pollTag: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pollTagText: {
    color: "#c084fc",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  pollBonusText: {
    color: "#a3e635",
    fontSize: 11,
    fontWeight: "800",
  },
  pollQuestion: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },
  pollOptionsList: {
    gap: 8,
  },
  pollOptionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  pollOptionBtnVoted: {
    borderColor: "#a3e635",
    backgroundColor: "rgba(163, 230, 53, 0.1)",
  },
  pollOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  pollRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  pollRadioVoted: {
    borderColor: "#a3e635",
  },
  pollRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#a3e635",
  },
  pollOptionText: {
    color: "#cbd5e1",
    fontSize: 12.5,
    fontWeight: "600",
    flex: 1,
  },
  pollOptionTextVoted: {
    color: "#a3e635",
    fontWeight: "700",
  },
  pollVotesText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  systemMsgBox: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
    marginVertical: 8,
  },
  systemMsgText: {
    color: "#94a3b8",
    fontSize: 11.5,
    lineHeight: 17,
  },
  msgWrapper: {
    marginVertical: 6,
    maxWidth: "82%",
  },
  msgWrapperMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  msgWrapperOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  msgSenderAlias: {
    color: "#94a3b8",
    fontSize: 10.5,
    fontWeight: "700",
    marginBottom: 3,
    marginLeft: 4,
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  msgBubbleMe: {
    backgroundColor: "#8b5cf6",
    borderBottomRightRadius: 2,
  },
  msgBubbleOther: {
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#334155",
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  msgTextMe: {
    color: "#ffffff",
    fontWeight: "600",
  },
  msgTextOther: {
    color: "#f1f5f9",
  },
  msgTime: {
    color: "#64748b",
    fontSize: 9.5,
    marginTop: 2,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#a3e635",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#334155",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  revealModalCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#a3e635",
  },
  revealModalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  revealIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(163, 230, 53, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  revealModalTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  revealModalSub: {
    color: "#94a3b8",
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
  },
  consentProgressBox: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  consentCountText: {
    color: "#a3e635",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  consentTrack: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
  },
  consentFill: {
    height: "100%",
    backgroundColor: "#a3e635",
    borderRadius: 3,
  },
  consentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#a3e635",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  consentBtnText: {
    color: "#090d16",
    fontSize: 13,
    fontWeight: "900",
  },
  consentedNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(163, 230, 53, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#a3e635",
    marginBottom: 16,
  },
  consentedNoticeText: {
    color: "#a3e635",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  previewProfilesHeader: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
  },
  memberRevealRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  memberAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarInitial: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  memberRealName: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  memberFaculty: {
    color: "#94a3b8",
    fontSize: 11,
  },
  energyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  msgSenderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
    marginLeft: 4,
  },
  memberStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  memberStatusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0b0f17",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberStatusTagText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
  },
  memberStatusTagTextConsented: {
    color: "#a3e635",
  },
  closeModalBtn: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  closeModalBtnText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
});
