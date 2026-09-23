import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCrossBubble, TOPIC_CATEGORIES } from "../../context/CrossBubbleContext";

export default function BlindLoungeScreen() {
  const navigation = useNavigation();
  const {
    loungeStage,
    todayTopic,
    userPreAnswers,
    userMission,
    loungeMessages,
    stageSecondsLeft,
    userVotedSkip,
    skipVotesCount,
    loungeMembers,
    quizSubmitted,
    quizScore,
    quizDetails,
    userVotedClose,
    closeVotesCount,
    matchedMemberIds,
    enterLoungeDevMode,
    submitPreAnswers,
    startStage1,
    startStage2,
    sendLoungeMessage,
    voteSkipStage,
    submitQuizAnswers,
    voteCloseRoom,
    matchWithMember,
    resetLoungeSession,
    toggleCrossBubbleMode,
  } = useCrossBubble();

  // Local state for Pre-Input
  const [ans1, setAns1] = useState("");
  const [ans2, setAns2] = useState("");

  // Local state for chat message input
  const [inputMsg, setInputMsg] = useState("");
  const scrollViewRef = useRef(null);

  // Local state for Quiz answers: { [memberId]: { itemAnswer: "", roleplayGuess: "" } }
  const [quizForm, setQuizForm] = useState({});

  // Auto scroll chat to bottom
  useEffect(() => {
    if (loungeStage === "stage1" || loungeStage === "stage2") {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [loungeMessages, loungeStage]);

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    sendLoungeMessage(inputMsg);
    setInputMsg("");
  };

  const handlePreSubmit = () => {
    if (!ans1.trim() || !ans2.trim()) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน", "คำตอบของคุณจะถูกนำไปใช้เป็นโจทย์ภารกิจของเพื่อนในกลุ่ม");
      return;
    }
    submitPreAnswers({ q1: ans1.trim(), q2: ans2.trim() });
  };

  const handleQuizSubmit = () => {
    submitQuizAnswers(quizForm);
  };

  // Available roleplay choices for quiz selection
  const ROLEPLAY_CHOICES = [
    "นักสืบโคนัน",
    "วิศวกรซ่อมทุกอย่าง",
    "กวีพเนจรผู้อารมณ์ดี",
    "เชฟกระทะเหล็ก",
    "ซีอีโอผู้เฉียบคม",
    "ประธานรุ่นไฟแรง",
  ];

  // ====================================================
  // VIEW 1: COUNTDOWN / LOBBY (เวลาก่อน 19:00 น.)
  // ====================================================
  if (loungeStage === "countdown") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        {/* Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>CAMPUS SOCIAL LOUNGE</Text>
            <Text style={styles.headerTitle}>ห้องสังสรรค์</Text>
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
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Schedule Banner */}
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleClockCircle}>
              <Ionicons name="time" size={28} color="#17171c" />
            </View>
            <Text style={styles.schedulePre}>DAILY 19:00 MATCHING</Text>
            <Text style={styles.scheduleTitle}>ระบบสุ่มกลุ่ม 5 คนทุก 19:00 น.</Text>
            <Text style={styles.scheduleDesc}>
              ระบบจะจัดกลุ่มเพื่อน 5 คนจากต่างคณะ พร้อมหัวข้อและภารกิจลับ เพื่อให้ทุกคนได้เปิดใจพูดคุยกันอย่างเป็นธรรมชาติ
            </Text>

            {/* Countdown Display */}
            <View style={styles.countdownBox}>
              <View style={styles.timeDigitCol}>
                <Text style={styles.timeDigit}>19</Text>
                <Text style={styles.timeDigitLabel}>ชั่วโมง</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeDigitCol}>
                <Text style={styles.timeDigit}>00</Text>
                <Text style={styles.timeDigitLabel}>นาที</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeDigitCol}>
                <Text style={styles.timeDigit}>00</Text>
                <Text style={styles.timeDigitLabel}>วินาที</Text>
              </View>
            </View>
          </View>

          {/* Today's Topic Preview Card */}
          <View style={styles.topicCard}>
            <View style={styles.topicBadgeRow}>
              <View style={styles.categoryBadge}>
                <Ionicons name="bulb-outline" size={12} color="#17171c" />
                <Text style={styles.categoryBadgeText}>{todayTopic.category}</Text>
              </View>
              <Text style={styles.topicDate}>หัวข้อประจำวัน</Text>
            </View>
            <Text style={styles.topicTitle}>{todayTopic.title}</Text>
            <Text style={styles.topicDesc}>{todayTopic.description}</Text>

            <View style={styles.topicAspectsRow}>
              <View style={styles.aspectPill}>
                <Text style={styles.aspectPillText}>1. ความชอบ</Text>
              </View>
              <View style={styles.aspectPill}>
                <Text style={styles.aspectPillText}>2. ข้อถกเถียง</Text>
              </View>
              <View style={[styles.aspectPill, styles.aspectPillActive]}>
                <Text style={styles.aspectPillTextActive}>3. สถานการณ์สมมติ</Text>
              </View>
            </View>
          </View>

          {/* Dev/Demo Simulation Action Button */}
          <TouchableOpacity
            style={styles.devSimBtn}
            activeOpacity={0.85}
            onPress={enterLoungeDevMode}
          >
            <View style={styles.devSimIconCircle}>
              <Ionicons name="play" size={18} color="#17171c" />
            </View>
            <View style={styles.devSimTextCol}>
              <Text style={styles.devSimTitle}>จำลองเข้าห้องทันที (Dev/Demo Mode)</Text>
              <Text style={styles.devSimDesc}>ทดสอบ Use Flow ทั้ง 2 สเตจ ควิซ และการแมตช์ได้ตลอดเวลา</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#17171c" />
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ====================================================
  // VIEW 2: PRE-INPUT (กรอกข้อมูลก่อนเข้าห้อง)
  // ====================================================
  if (loungeStage === "pre_input") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={resetLoungeSession}
          >
            <Ionicons name="arrow-back" size={20} color="#17171c" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>STEP 1 OF 3</Text>
            <Text style={styles.headerTitle}>เตรียมข้อมูลภารกิจ</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#17171c" />
            <Text style={styles.infoBannerText}>
              กรุณาตอบคำถาม 2 ข้อนี้สั้นๆ ข้อมูลของคุณจะถูกใช้เป็นเฉลยในภารกิจลับของเพื่อนร่วมกลุ่มหลังจบการสนทนา
            </Text>
          </View>

          <View style={styles.inputGroupCard}>
            <Text style={styles.inputLabel}>
              คำถามข้อที่ 1 ({todayTopic.category})
            </Text>
            <Text style={styles.questionPromptText}>
              {todayTopic.preQuestions[0].question}
            </Text>
            <TextInput
              style={styles.textInput}
              value={ans1}
              onChangeText={setAns1}
              placeholder={todayTopic.preQuestions[0].placeholder}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroupCard}>
            <Text style={styles.inputLabel}>
              คำถามข้อที่ 2 ({todayTopic.category})
            </Text>
            <Text style={styles.questionPromptText}>
              {todayTopic.preQuestions[1].question}
            </Text>
            <TextInput
              style={styles.textInput}
              value={ans2}
              onChangeText={setAns2}
              placeholder={todayTopic.preQuestions[1].placeholder}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            activeOpacity={0.85}
            onPress={handlePreSubmit}
          >
            <Text style={styles.primaryActionBtnText}>รับภารกิจและเริ่มแชท</Text>
            <Ionicons name="arrow-forward" size={18} color="#17171c" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ====================================================
  // VIEW 3: MISSION BRIEF (แสดงภารกิจลับและบทบาทโรลเพลย์)
  // ====================================================
  if (loungeStage === "mission_brief") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>STEP 2 OF 3</Text>
            <Text style={styles.headerTitle}>ภารกิจลับของคุณ</Text>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Mission Card */}
          <View style={styles.missionBriefCard}>
            <View style={styles.briefBadge}>
              <Ionicons name="shield-outline" size={14} color="#17171c" />
              <Text style={styles.briefBadgeText}>SECRET ASSIGNMENT</Text>
            </View>

            <Text style={styles.missionBriefTitle}>{userMission.secretTask}</Text>
            <Text style={styles.missionBriefSub}>
              ในระหว่างการคุยสเตจที่ 1 และ 2 คุณต้องพยายามสอบถามข้อมูลนี้จากเพื่อนอย่างน้อย 2 คนโดยไม่ให้เพื่อนรู้ตัว
            </Text>

            <View style={styles.roleplayBox}>
              <View style={styles.roleplayIconCircle}>
                <Ionicons name="person-outline" size={20} color="#17171c" />
              </View>
              <View style={styles.roleplayTextCol}>
                <Text style={styles.roleplayLabel}>บทบาทโรลเพลย์ประจำตัวคุณ</Text>
                <Text style={styles.roleplayName}>{userMission.roleplayTitle}</Text>
                <Text style={styles.roleplayDesc}>{userMission.roleplayInstruction}</Text>
              </View>
            </View>
          </View>

          {/* Stages Info Card */}
          <View style={styles.stagesInfoCard}>
            <Text style={styles.stagesInfoTitle}>ขั้นตอนการสนทนาในห้อง</Text>
            <View style={styles.stageStepRow}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepTitle}>สเตจแนะนำตัว (5 นาที)</Text>
                <Text style={styles.stepDesc}>แนะนำตัว พูดคุย และสืบข้อมูลตามภารกิจลับ</Text>
              </View>
            </View>
            <View style={styles.stageStepRow}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepTitle}>สเตจถกหัวข้อ (10 นาที)</Text>
                <Text style={styles.stepDesc}>แลกเปลี่ยนมุมมองหัวข้อประจำวัน พร้อมสังเกตบทบาทเพื่อน</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            activeOpacity={0.85}
            onPress={startStage1}
          >
            <Text style={styles.primaryActionBtnText}>เข้าสู่ห้องแชทสเตจ 1</Text>
            <Ionicons name="chatbubbles" size={18} color="#17171c" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ====================================================
  // VIEW 4 & 5: CHAT ROOM (STAGE 1 & STAGE 2)
  // ====================================================
  if (loungeStage === "stage1" || loungeStage === "stage2") {
    const isStage1 = loungeStage === "stage1";

    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        {/* Chat Stage Top Bar */}
        <View style={styles.chatTopBar}>
          <View style={styles.chatTopInfo}>
            <View style={styles.stageIndicatorRow}>
              <View style={styles.stagePill}>
                <Text style={styles.stagePillText}>
                  {isStage1 ? "สเตจ 1: แนะนำตัว" : "สเตจ 2: ถกหัวข้อ"}
                </Text>
              </View>
              <View style={styles.timerBadge}>
                <Ionicons name="timer-outline" size={14} color="#17171c" />
                <Text style={styles.timerText}>{formatTimer(stageSecondsLeft)}</Text>
              </View>
            </View>
            <Text style={styles.chatTopicTitle} numberOfLines={1}>
              {isStage1 ? "แนะนำตัวและสืบข้อมูลภารกิจลับ" : todayTopic.title}
            </Text>
          </View>

          {/* Vote Skip Button */}
          <TouchableOpacity
            style={[styles.voteSkipBtn, userVotedSkip && styles.voteSkipBtnActive]}
            activeOpacity={0.85}
            onPress={voteSkipStage}
          >
            <Ionicons
              name={userVotedSkip ? "checkmark-circle" : "arrow-forward-circle-outline"}
              size={16}
              color="#17171c"
            />
            <Text style={styles.voteSkipText}>
              {userVotedSkip ? `โหวตแล้ว (${skipVotesCount}/5)` : `โหวตข้าม (${skipVotesCount}/5)`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Member Avatars Row */}
        <View style={styles.membersAvatarBar}>
          <Text style={styles.membersBarLabel}>สมาชิก 5 คน:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loungeMembers.map((m) => (
              <View key={m.id} style={styles.miniMemberChip}>
                <Ionicons name={m.icon} size={14} color="#17171c" />
                <Text style={styles.miniMemberAlias}>{m.alias}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Messages Scroll Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {loungeMessages.map((msg) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.sysMsgContainer}>
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
                {!isMe && (
                  <View style={styles.msgAvatarCircle}>
                    <Ionicons name={msg.senderIcon || "person-outline"} size={16} color="#17171c" />
                  </View>
                )}
                <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                  {!isMe && <Text style={styles.msgSenderAlias}>{msg.senderAlias}</Text>}
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
              placeholder="พิมพ์ข้อความในกลุ่มสังสรรค์..."
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

  // ====================================================
  // VIEW 6: QUIZ VIEW (ตอบคำถามภารกิจและทายโรลเพลย์)
  // ====================================================
  if (loungeStage === "quiz") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>STEP 3 OF 3</Text>
            <Text style={styles.headerTitle}>แบบทดสอบภารกิจ</Text>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBanner}>
            <Ionicons name="help-circle-outline" size={18} color="#17171c" />
            <Text style={styles.infoBannerText}>
              ตอบคำถามจากข้อมูลที่ได้ยินมาในสเตจแนะนำตัว และทายว่าเพื่อนแต่ละคนสวมบทบาทโรลเพลย์อะไร
            </Text>
          </View>

          {loungeMembers.map((member) => {
            const currentAns = quizForm[member.id] || {};

            return (
              <View key={member.id} style={styles.quizCard}>
                <View style={styles.quizMemberHeader}>
                  <View style={styles.quizMemberIcon}>
                    <Ionicons name={member.icon} size={18} color="#17171c" />
                  </View>
                  <View>
                    <Text style={styles.quizMemberAlias}>{member.alias}</Text>
                    <Text style={styles.quizMemberFaculty}>{member.faculty}</Text>
                  </View>
                </View>

                {/* Question 1: Item Answer */}
                <Text style={styles.quizQuestionLabel}>
                  1. เพื่อนคนนี้พกไอเท็มหรือตอบอะไรเกี่ยวกับหัวข้อ?
                </Text>
                <TextInput
                  style={styles.quizInput}
                  value={currentAns.itemAnswer || ""}
                  onChangeText={(val) =>
                    setQuizForm((prev) => ({
                      ...prev,
                      [member.id]: { ...prev[member.id], itemAnswer: val },
                    }))
                  }
                  placeholder={`คำตอบของ ${member.alias}...`}
                  placeholderTextColor="#94a3b8"
                />

                {/* Question 2: Roleplay Guess */}
                <Text style={styles.quizQuestionLabel}>
                  2. คุณคิดว่าเพื่อนคนนี้สวมบทบาทโรลเพลย์อะไร?
                </Text>
                <View style={styles.roleplayPickerGrid}>
                  {ROLEPLAY_CHOICES.map((role) => {
                    const isSelected = currentAns.roleplayGuess === role;

                    return (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleplayOptionBtn,
                          isSelected && styles.roleplayOptionBtnSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          setQuizForm((prev) => ({
                            ...prev,
                            [member.id]: { ...prev[member.id], roleplayGuess: role },
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.roleplayOptionText,
                            isSelected && styles.roleplayOptionTextSelected,
                          ]}
                        >
                          {role}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.primaryActionBtn}
            activeOpacity={0.85}
            onPress={handleQuizSubmit}
          >
            <Text style={styles.primaryActionBtnText}>ส่งคำตอบและตรวจคะแนน</Text>
            <Ionicons name="checkmark-done" size={18} color="#17171c" />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ====================================================
  // VIEW 7: VOTE CLOSE (โหวตปิดห้อง)
  // ====================================================
  if (loungeStage === "vote_close") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>SESSION COMPLETED</Text>
            <Text style={styles.headerTitle}>คะแนนการตอบควิซ</Text>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreCardPre}>คะแนนรวมของคุณ</Text>
            <Text style={styles.scoreValue}>{quizScore} / 200 PTS</Text>
            <Text style={styles.scoreDesc}>
              {quizScore >= 100
                ? "ยอดเยี่ยมมาก คุณเป็นนักสืบและผู้ฟังที่ดีเยี่ยม!"
                : "ทำได้ดีมาก ทุกคนเริ่มเปิดใจและได้รู้จักกันมากขึ้นแล้ว"}
            </Text>
          </View>

          {/* Details breakdown */}
          <Text style={styles.sectionTitle}>ผลการตอบควิซเพื่อนในกลุ่ม</Text>
          {quizDetails.map((detail) => (
            <View key={detail.memberId} style={styles.quizDetailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailAlias}>{detail.memberAlias}</Text>
                <Text style={styles.detailPoints}>+{detail.points} PTS</Text>
              </View>
              <Text style={styles.detailLine}>
                คำตอบจริง: {detail.actualItem}
              </Text>
              <Text style={styles.detailLine}>
                บทบาทจริง: {detail.actualRole}
              </Text>
            </View>
          ))}

          {/* Vote to close button */}
          <View style={styles.closeVoteContainer}>
            <Text style={styles.closeVotePrompt}>
              กดโหวตปิดห้องเพื่อเปิดเผยตัวตนจริงของทุกคน และเลือกเพื่อนเพื่อคุยต่อในห้องมืด
            </Text>
            <TouchableOpacity
              style={[styles.primaryActionBtn, userVotedClose && styles.primaryActionBtnActive]}
              activeOpacity={0.85}
              onPress={voteCloseRoom}
            >
              <Text style={styles.primaryActionBtnText}>
                {userVotedClose
                  ? `โหวตปิดห้องแล้ว (${closeVotesCount}/5 คน)`
                  : `โหวตปิดแชท (${closeVotesCount}/5 คน)`}
              </Text>
              <Ionicons name="lock-closed-outline" size={18} color="#17171c" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ====================================================
  // VIEW 8: REVEALED (เฉลยภารกิจและทักคุยแบบนิรนามในห้องมืด)
  // ====================================================
  if (loungeStage === "revealed") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>SESSION SUMMARY</Text>
            <Text style={styles.headerTitle}>เฉลยภารกิจลับ</Text>
          </View>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={resetLoungeSession}
          >
            <Ionicons name="refresh" size={15} color="#64748b" />
            <Text style={styles.exitBtnText}>เริ่มรอบใหม่</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.revealedBanner}>
            <Ionicons name="shield-checkmark" size={24} color="#17171c" />
            <Text style={styles.revealedBannerTitle}>จบเซสชันห้องสังสรรค์แล้ว</Text>
            <Text style={styles.revealedBannerSub}>
              บทบาทโรลเพลย์และคำตอบของทุกคนถูกเฉลยแล้ว คุณสามารถกดทักคุย 1-on-1 แบบนิรนามในห้องมืดได้ทันที โดยตัวตนจริงจะเปิดเผยเมื่อทั้งคู่กดเพิ่มเพื่อนในแชท
            </Text>
          </View>

          {/* Member Anonymous Cards */}
          {loungeMembers.map((member) => {
            const isMatched = matchedMemberIds.includes(member.id);

            return (
              <View key={member.id} style={styles.memberRevealCard}>
                <View style={styles.revealCardTop}>
                  <View style={styles.revealAvatarCircle}>
                    <Ionicons name={member.icon} size={28} color="#17171c" />
                  </View>
                  <View style={styles.revealInfoCol}>
                    <Text style={styles.revealRealName}>{member.alias}</Text>
                    <Text style={styles.revealFaculty}>{member.faculty}</Text>
                    <View style={styles.anonymousBadge}>
                      <Ionicons name="lock-closed" size={10} color="#64748b" />
                      <Text style={styles.anonymousBadgeText}>โหมดนิรนาม</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.revealBioBox}>
                  <Text style={styles.roleplaySummaryLabel}>บทบาทโรลเพลย์จริง:</Text>
                  <Text style={styles.revealBioText}>{member.roleplay}</Text>
                  <Text style={[styles.roleplaySummaryLabel, { marginTop: 6 }]}>คำตอบของโจทย์:</Text>
                  <Text style={styles.revealBioText}>{member.preAnswers.q1}</Text>
                </View>

                {/* Match Action Button */}
                <TouchableOpacity
                  style={[styles.matchBtn, isMatched && styles.matchBtnMatched]}
                  activeOpacity={0.85}
                  onPress={() => {
                    matchWithMember(member.id);
                    navigation.navigate("DarkRoomTab");
                  }}
                >
                  <Ionicons
                    name={isMatched ? "chatbubbles" : "chatbubble-ellipses"}
                    size={16}
                    color="#17171c"
                  />
                  <Text style={styles.matchBtnText}>
                    {isMatched ? "เปิดห้องมืดแล้ว (ไปคุยต่อ)" : "ทักคุย 1-on-1 ในห้องมืด (แบบนิรนาม)"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
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
  scheduleCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleClockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  schedulePre: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 1,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17171c",
    marginTop: 4,
  },
  scheduleDesc: {
    fontSize: 12.5,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  countdownBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17171c",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  timeDigitCol: {
    alignItems: "center",
    width: 48,
  },
  timeDigit: {
    fontSize: 20,
    fontWeight: "900",
    color: "#c7f65a",
  },
  timeDigitLabel: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: "600",
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "900",
    color: "#94a3b8",
    marginHorizontal: 4,
  },
  topicCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 18,
    marginBottom: 16,
  },
  topicBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
  topicDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17171c",
    lineHeight: 22,
  },
  topicDesc: {
    fontSize: 12.5,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 18,
  },
  topicAspectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  aspectPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aspectPillActive: {
    backgroundColor: "#17171c",
  },
  aspectPillText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748b",
  },
  aspectPillTextActive: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#c7f65a",
  },
  devSimBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#17171c",
  },
  devSimIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  devSimTextCol: {
    flex: 1,
  },
  devSimTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
  },
  devSimDesc: {
    fontSize: 11.5,
    color: "#17171c",
    marginTop: 2,
    opacity: 0.85,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: "#17171c",
    lineHeight: 18,
  },
  inputGroupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  questionPromptText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17171c",
    marginVertical: 8,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: "#17171c",
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#17171c",
    marginTop: 10,
    gap: 8,
  },
  primaryActionBtnActive: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17171c",
  },
  missionBriefCard: {
    backgroundColor: "#17171c",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  briefBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 4,
  },
  briefBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#17171c",
    letterSpacing: 0.8,
  },
  missionBriefTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 24,
  },
  missionBriefSub: {
    fontSize: 12.5,
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 18,
  },
  roleplayBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#262626",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  roleplayIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roleplayTextCol: {
    flex: 1,
  },
  roleplayLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#c7f65a",
  },
  roleplayName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 2,
  },
  roleplayDesc: {
    fontSize: 11.5,
    color: "#94a3b8",
    marginTop: 4,
    lineHeight: 16,
  },
  stagesInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 16,
  },
  stagesInfoTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#17171c",
    marginBottom: 12,
  },
  stageStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#17171c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#c7f65a",
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#17171c",
  },
  stepDesc: {
    fontSize: 11,
    color: "#64748b",
  },
  chatTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  chatTopInfo: {
    flex: 1,
    marginRight: 10,
  },
  stageIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stagePill: {
    backgroundColor: "#17171c",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stagePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#c7f65a",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  timerText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
  chatTopicTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#17171c",
    marginTop: 4,
  },
  voteSkipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c7f65a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  voteSkipBtnActive: {
    backgroundColor: "#e2e8f0",
  },
  voteSkipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
  membersAvatarBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  membersBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginRight: 8,
  },
  miniMemberChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 6,
    gap: 4,
  },
  miniMemberAlias: {
    fontSize: 10.5,
    fontWeight: "600",
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
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  sysMsgText: {
    fontSize: 11.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },
  msgRow: {
    flexDirection: "row",
    marginVertical: 6,
  },
  msgRowLeft: {
    justifyContent: "flex-start",
  },
  msgRowRight: {
    justifyContent: "flex-end",
  },
  msgAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
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
  msgSenderAlias: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 2,
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
  quizCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 16,
  },
  quizMemberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  quizMemberIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  quizMemberAlias: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#17171c",
  },
  quizMemberFaculty: {
    fontSize: 11,
    color: "#64748b",
  },
  quizQuestionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#17171c",
    marginTop: 6,
    marginBottom: 6,
  },
  quizInput: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: "#17171c",
    marginBottom: 8,
  },
  roleplayPickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  roleplayOptionBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  roleplayOptionBtnSelected: {
    backgroundColor: "#c7f65a",
    borderColor: "#17171c",
  },
  roleplayOptionText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  roleplayOptionTextSelected: {
    color: "#17171c",
    fontWeight: "800",
  },
  scoreCard: {
    backgroundColor: "#17171c",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreCardPre: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#c7f65a",
    marginVertical: 6,
  },
  scoreDesc: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17171c",
    marginBottom: 10,
  },
  quizDetailCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailAlias: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#17171c",
  },
  detailPoints: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803d",
  },
  detailLine: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 2,
  },
  closeVoteContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  closeVotePrompt: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 16,
  },
  revealedBanner: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    marginBottom: 16,
  },
  revealedBannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17171c",
    marginTop: 8,
  },
  revealedBannerSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  memberRevealCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 14,
  },
  revealCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  revealAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#c7f65a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  revealInfoCol: {
    flex: 1,
  },
  revealRealName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17171c",
  },
  revealFaculty: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 1,
  },
  revealAlias: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 1,
  },
  revealBioBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  revealBioText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
  },
  revealContactRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactText: {
    fontSize: 11.5,
    color: "#64748b",
    fontWeight: "600",
  },
  matchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7f65a",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  matchBtnMatched: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  matchBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17171c",
  },
  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    alignSelf: "flex-start",
    gap: 3,
  },
  anonymousBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#64748b",
  },
  roleplaySummaryLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17171c",
  },
});
