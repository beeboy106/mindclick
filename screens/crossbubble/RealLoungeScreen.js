import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useFeed } from "../../context/FeedContext";
import { useCrossBubble } from "../../context/CrossBubbleContext";
import CrossBubbleAvatar from "../../components/crossbubble/CrossBubbleAvatar";
import { evaluateAllQuizAnswers } from "../../lib/geminiService";
import {
  getRealLoungeState,
  joinRealLounge,
  leaveRealLounge,
  requestRealLoungeConnection,
  saveRealLoungePreAnswers,
  saveRealLoungeQuizResult,
  sendRealLoungeMessage,
  updateSupabasePresence,
} from "../../lib/supabaseApi";

const emptyAnswers = { q1: "", q2: "" };

export default function RealLoungeScreen() {
  const { user, isDemoMode } = useAuth();
  const { profile } = useData();
  const { startChatWithUser } = useFeed();
  const { userAlias, crossBubbleTheme: theme } = useCrossBubble();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState(emptyAnswers);
  const [quizForm, setQuizForm] = useState({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const token = user?.firebaseIdToken;
  const connectedFriendRef = useRef(null);

  const myMember = state?.members?.find((member) => member.profile_id === state?.viewerProfileId);
  const roomId = state?.room?.id;
  const isWaiting = state?.room?.status === "waiting";
  const isPaired = state?.members?.length === 2;
  const partner = state?.members?.find((member) => member.profile_id !== state?.viewerProfileId);
  const myAlias = userAlias?.nickname || "ผู้ไม่ประสงค์ออกนาม";
  const myFaculty = userAlias?.faculty || profile?.faculty || "ไม่ระบุคณะ";
  const myAvatar = userAlias?.icon || "avatar_1";

  useEffect(() => {
    const revealed = state?.isMutualConnection ? partner?.connectionProfile : null;
    if (!revealed?.legacy_user_id || connectedFriendRef.current === revealed.legacy_user_id) return;
    connectedFriendRef.current = revealed.legacy_user_id;
    // A friendship is created only after both room members opted in on the
    // server. The real lounge itself remains the anonymous dark-room thread.
    const createFriend = startChatWithUser?.({
      id: revealed.legacy_user_id,
      name: revealed.display_name,
      avatar: revealed.avatar_url,
      faculty: revealed.faculty,
      status: "online",
    }, "สวัสดี");
    createFriend?.catch(() => {
      connectedFriendRef.current = null;
    });
  }, [partner?.connectionProfile, startChatWithUser, state?.isMutualConnection]);

  const applyState = useCallback((nextState) => {
    if (!nextState) return;
    setState({ ...nextState, viewerProfileId: nextState.viewerProfileId || null });
    const me = nextState.members?.find((member) => member.profile_id === nextState.viewerProfileId);
    if (me?.pre_answers) setAnswers({ ...emptyAnswers, ...me.pre_answers });
  }, []);

  // The API deliberately does not trust a profile id sent by the app.  The
  // token decides who "me" is; this field is only attached locally for UI.
  const fetchState = useCallback(async (silent = false) => {
    if (!token || !roomId) return;
    if (!silent) setRefreshing(true);
    try {
      const result = await getRealLoungeState(token, roomId);
      applyState({ ...result.state, viewerProfileId: state?.viewerProfileId });
    } catch (error) {
      if (!silent) Alert.alert("อัปเดตห้องไม่สำเร็จ", error.message || "ลองใหม่อีกครั้ง");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [applyState, roomId, state?.viewerProfileId, token]);

  useEffect(() => {
    if (!roomId || !token) return undefined;
    // This is room-only synchronization, not global presence polling. It lets
    // a waiting user transition as soon as a second verified user joins.
    const timer = setInterval(() => fetchState(true), 5000);
    return () => clearInterval(timer);
  }, [fetchState, roomId, token]);

  const join = async () => {
    if (isDemoMode) {
      Alert.alert("ใช้บัญชีจริงก่อน", "ห้องจริงต้องยืนยันตัวตนเพื่อให้จับคู่ผู้ใช้ที่ออนไลน์อยู่ได้");
      return;
    }
    if (!token) {
      Alert.alert("ยังไม่พบการเข้าสู่ระบบ", "กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง");
      return;
    }
    setLoading(true);
    try {
      await updateSupabasePresence(token, "online");
      const result = await joinRealLounge(token, { alias: myAlias, faculty: myFaculty, avatarId: myAvatar });
      applyState(result.state);
    } catch (error) {
      Alert.alert("เข้าห้องจริงไม่สำเร็จ", error.message || "ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || !token || !roomId) return;
    setMessage("");
    try {
      const result = await sendRealLoungeMessage(token, roomId, text);
      applyState({ ...result.state, viewerProfileId: state.viewerProfileId });
    } catch (error) {
      setMessage(text);
      Alert.alert("ส่งข้อความไม่สำเร็จ", error.message || "ลองใหม่อีกครั้ง");
    }
  };

  const submitAnswers = async () => {
    if (!answers.q1.trim() || !answers.q2.trim() || !token || !roomId) {
      Alert.alert("ตอบให้ครบก่อน", "กรุณากรอกคำตอบทั้งสองข้อ");
      return;
    }
    setSubmittingAnswers(true);
    try {
      const result = await saveRealLoungePreAnswers(token, roomId, answers.q1, answers.q2);
      applyState({ ...result.state, viewerProfileId: state.viewerProfileId });
    } catch (error) {
      Alert.alert("บันทึกคำตอบไม่สำเร็จ", error.message || "ลองใหม่อีกครั้ง");
    } finally {
      setSubmittingAnswers(false);
    }
  };

  const canStartQuiz = Boolean(partner?.pre_answers?.q1 && partner?.pre_answers?.q2 && myMember?.pre_answers?.q1 && myMember?.pre_answers?.q2);
  const quizMembers = useMemo(() => partner ? [{
    id: partner.profile_id,
    alias: partner.alias,
    // evaluateAllQuizAnswers treats this as the second fact to infer.
    roleplay: partner.pre_answers?.q2 || "ไม่ได้ระบุ",
    preAnswers: partner.pre_answers,
    chatLinesStage1: (state?.messages || []).filter((item) => item.profile_id === partner.profile_id).map((item) => item.content),
    chatLinesStage2: [],
  }] : [], [partner, state?.messages]);

  const submitQuiz = async () => {
    if (!token || !roomId || !partner || !quizForm[partner.profile_id]?.itemAnswer?.trim() || !quizForm[partner.profile_id]?.roleplayGuess?.trim()) {
      Alert.alert("ตอบให้ครบก่อน", "ตอบสิ่งที่เพื่อนตอบไว้ทั้งสองข้อก่อนให้ AI ตรวจ");
      return;
    }
    setSubmittingQuiz(true);
    try {
      const result = await evaluateAllQuizAnswers(quizForm, quizMembers);
      const saved = await saveRealLoungeQuizResult(token, roomId, result, quizForm);
      applyState({ ...saved.state, viewerProfileId: state.viewerProfileId });
    } catch (error) {
      Alert.alert("ตรวจคำตอบไม่สำเร็จ", error.message || "ลองใหม่อีกครั้ง");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const connect = async () => {
    if (!token || !roomId) return;
    try {
      const result = await requestRealLoungeConnection(token, roomId);
      applyState({ ...result.state, viewerProfileId: state.viewerProfileId });
    } catch (error) {
      Alert.alert("ส่งคำขอไม่สำเร็จ", error.message || "ลองใหม่อีกครั้ง");
    }
  };

  const leave = () => {
    Alert.alert("ออกจากห้องจริง", "หากยังรอจับคู่ ระบบจะยกเลิกคิวนี้", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากห้อง", style: "destructive", onPress: async () => {
          try {
            await leaveRealLounge(token, roomId);
            setState(null);
          } catch (error) {
            Alert.alert("ออกจากห้องไม่สำเร็จ", error.message || "ลองใหม่อีกครั้ง");
          }
        },
      },
    ]);
  };

  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.welcomeContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
        <Ionicons name="people" size={34} color={theme.ink} />
      </View>
      <Text style={[styles.heroTitle, { color: theme.ink }]}>ห้องจริง</Text>
      <Text style={[styles.heroText, { color: theme.muted }]}>จับคู่ผู้ใช้จริงที่กำลังออนไลน์ 2 คนแบบนามแฝงและคณะ ไม่มีช่วงเวลาเปิดห้อง</Text>
      <View style={[styles.notice, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.noticeTitle, { color: theme.ink }]}>กติกาเพื่อความเป็นส่วนตัว</Text>
        <Text style={[styles.noticeText, { color: theme.muted }]}>เริ่มด้วยชื่อแฝงและคณะเท่านั้น จากนั้นคุย ทำภารกิจให้ AI ตรวจ และกดเชื่อมต่อได้เมื่อทั้งสองฝ่ายยินยอม</Text>
      </View>
      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.accent }]} onPress={join} disabled={loading}>
        {loading ? <ActivityIndicator color={theme.ink} /> : <><Ionicons name="shuffle" size={18} color={theme.ink} /><Text style={[styles.primaryButtonText, { color: theme.ink }]}>สุ่มเข้าห้องจริง</Text></>}
      </TouchableOpacity>
    </ScrollView>
  );

  if (!state) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: theme.canvas }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.surface} />
      <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.headerTitle, { color: theme.ink }]}>Cross Bubble</Text><Text style={[styles.headerCaption, { color: theme.muted }]}>ห้องจริง</Text></View>
      {renderWelcome()}
    </SafeAreaView>;
  }

  const myQuiz = Array.isArray(myMember?.quiz_details)
    ? myMember.quiz_details[0]
    : myMember?.quiz_details?.details?.[0];
  const requestedConnection = Boolean(myMember?.wants_connection);
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.canvas }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.surface} />
      <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View><Text style={[styles.headerTitle, { color: theme.ink }]}>ห้องจริง</Text><Text style={[styles.headerCaption, { color: theme.muted }]}>{isWaiting ? "กำลังรอคนที่สอง" : "ห้องมืดสำหรับคู่ของคุณ"}</Text></View>
        <TouchableOpacity onPress={() => fetchState()} style={[styles.iconButton, { borderColor: theme.border }]}>{refreshing ? <ActivityIndicator size="small" color={theme.ink} /> : <Ionicons name="refresh" size={19} color={theme.ink} />}</TouchableOpacity>
      </View>
      {isWaiting ? <View style={styles.waiting}><ActivityIndicator size="large" color={theme.accent} /><Text style={[styles.waitTitle, { color: theme.ink }]}>กำลังหาผู้ใช้ออนไลน์อีก 1 คน</Text><Text style={[styles.waitText, { color: theme.muted }]}>คุณอยู่ในคิวแล้ว ระบบจะจับคู่เมื่อมีคนที่สองเข้ามา</Text><TouchableOpacity onPress={leave} style={[styles.secondaryButton, { borderColor: theme.border }]}><Text style={[styles.secondaryText, { color: theme.ink }]}>ออกจากคิว</Text></TouchableOpacity></View> : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.roomContent}>
            <View style={[styles.memberPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.panelTitle, { color: theme.ink }]}>คู่สนทนาในห้องมืด</Text>
              {state.members.map((member) => <View style={styles.memberRow} key={member.profile_id}><CrossBubbleAvatar avatarId={member.avatar_id} size={38} borderColor={theme.border} /><View style={styles.memberText}><Text style={[styles.memberAlias, { color: theme.ink }]}>{member.alias}{member.profile_id === state.viewerProfileId ? " (คุณ)" : ""}</Text><Text style={[styles.memberFaculty, { color: theme.muted }]}>{member.faculty || "ไม่ระบุคณะ"}</Text></View></View>)}
            </View>
            <View style={[styles.taskCard, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
              <Text style={[styles.panelTitle, { color: theme.ink }]}>ภารกิจ: รู้จักกันจากคำตอบจริง</Text>
              <Text style={[styles.noticeText, { color: theme.muted }]}>ตอบ 2 ข้อ แล้วคุยเพื่อหาเบาะแส เมื่อทั้งคู่พร้อม AI จะตรวจคำตอบที่คุณทายจากคำตอบจริงของเพื่อน</Text>
              <TextInput value={answers.q1} onChangeText={(q1) => setAnswers((prev) => ({ ...prev, q1 }))} placeholder="สิ่งหนึ่งที่ขาดไม่ได้เวลาไปเรียน" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.border, backgroundColor: theme.surface }]} editable={!myMember?.pre_answers} />
              <TextInput value={answers.q2} onChangeText={(q2) => setAnswers((prev) => ({ ...prev, q2 }))} placeholder="ถ้ามีเวลาว่าง คุณมักเลือกทำอะไร" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.border, backgroundColor: theme.surface }]} editable={!myMember?.pre_answers} />
              {!myMember?.pre_answers && <TouchableOpacity onPress={submitAnswers} disabled={submittingAnswers} style={[styles.smallPrimary, { backgroundColor: theme.accent }]}><Text style={[styles.smallPrimaryText, { color: theme.ink }]}>{submittingAnswers ? "กำลังบันทึก..." : "ล็อกคำตอบของฉัน"}</Text></TouchableOpacity>}
            </View>
            <View style={[styles.messagePanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.panelTitle, { color: theme.ink }]}>คุยกัน</Text>
              {(state.messages || []).length === 0 && <Text style={[styles.emptyText, { color: theme.muted }]}>เริ่มทักและถามคำใบ้จากกันได้เลย</Text>}
              {(state.messages || []).map((item) => { const mine = item.profile_id === state.viewerProfileId; return <View key={item.id} style={[styles.bubble, mine ? { alignSelf: "flex-end", backgroundColor: theme.accentSoft } : { alignSelf: "flex-start", backgroundColor: theme.canvas, borderColor: theme.border, borderWidth: 1 }]}><Text style={[styles.bubbleAlias, { color: theme.muted }]}>{mine ? "คุณ" : item.sender_alias}</Text><Text style={[styles.bubbleText, { color: theme.ink }]}>{item.content}</Text></View>; })}
            </View>
            {canStartQuiz && !myMember?.quiz_details && <View style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.panelTitle, { color: theme.ink }]}>ให้ AI ตรวจคำตอบ</Text><Text style={[styles.noticeText, { color: theme.muted }]}>ทายคำตอบของ {partner?.alias} จากสิ่งที่คุยกัน</Text><TextInput placeholder="ทายคำตอบข้อแรก" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.border }]} value={quizForm[partner?.profile_id]?.itemAnswer || ""} onChangeText={(itemAnswer) => setQuizForm({ [partner?.profile_id]: { ...(quizForm[partner?.profile_id] || {}), itemAnswer } })} /><TextInput placeholder="ทายคำตอบข้อที่สอง" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.border }]} value={quizForm[partner?.profile_id]?.roleplayGuess || ""} onChangeText={(roleplayGuess) => setQuizForm({ [partner?.profile_id]: { ...(quizForm[partner?.profile_id] || {}), roleplayGuess } })} /><TouchableOpacity onPress={submitQuiz} disabled={submittingQuiz} style={[styles.smallPrimary, { backgroundColor: theme.accent }]}><Text style={[styles.smallPrimaryText, { color: theme.ink }]}>{submittingQuiz ? "AI กำลังตรวจ..." : "ส่งให้ AI ตรวจ"}</Text></TouchableOpacity></View>}
            {myQuiz && <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.score, { color: theme.ink }]}>{`คะแนน ${myMember?.quiz_score || 0}/50`}</Text><Text style={[styles.noticeText, { color: theme.muted }]}>{myQuiz.reasoning}</Text><Text style={[styles.noticeText, { color: theme.muted }]}>{myQuiz.feedback}</Text></View>}
            <View style={[styles.connectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.panelTitle, { color: theme.ink }]}>ไปต่อหลังจบเกม</Text>{state.isMutualConnection ? <Text style={[styles.noticeText, { color: theme.muted }]}>ทั้งคู่ยินยอมเชื่อมต่อแล้ว คุณคุยต่อในห้องมืดนี้ได้ และเปิดเผยตัวตนแก่กันตามความสมัครใจ</Text> : <><Text style={[styles.noticeText, { color: theme.muted }]}>หากอยากคุยต่อหรือเพิ่มเป็นเพื่อน กดยินยอมได้ อีกฝ่ายต้องกดยินยอมเช่นกันจึงจะเปิดเผยโปรไฟล์</Text><TouchableOpacity disabled={requestedConnection} onPress={connect} style={[styles.secondaryButton, { borderColor: theme.border }]}><Text style={[styles.secondaryText, { color: theme.ink }]}>{requestedConnection ? "ส่งคำขอแล้ว รออีกฝ่าย" : "ยินยอมเชื่อมต่อ"}</Text></TouchableOpacity></>}</View>
          </ScrollView>
          <View style={[styles.composer, { backgroundColor: theme.surface, borderColor: theme.border }]}><TextInput value={message} onChangeText={setMessage} placeholder="พิมพ์ข้อความในห้องมืด" placeholderTextColor={theme.muted} style={[styles.composerInput, { color: theme.ink }]} /><TouchableOpacity onPress={sendMessage} style={[styles.sendButton, { backgroundColor: theme.accent }]}><Ionicons name="send" size={17} color={theme.ink} /></TouchableOpacity></View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, flex: { flex: 1 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1 }, headerTitle: { fontSize: 20, fontWeight: "900" }, headerCaption: { fontSize: 11, marginTop: 2, fontWeight: "700" }, iconButton: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" }, welcomeContent: { flexGrow: 1, justifyContent: "center", padding: 24, alignItems: "center" }, heroIcon: { width: 74, height: 74, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" }, heroTitle: { fontSize: 25, fontWeight: "900", marginTop: 18 }, heroText: { textAlign: "center", lineHeight: 20, marginTop: 7, fontSize: 13.5 }, notice: { width: "100%", borderWidth: 1, borderRadius: 14, padding: 15, marginTop: 24 }, noticeTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 }, noticeText: { fontSize: 12, lineHeight: 18 }, primaryButton: { flexDirection: "row", gap: 8, width: "100%", borderRadius: 12, justifyContent: "center", alignItems: "center", paddingVertical: 14, marginTop: 16 }, primaryButtonText: { fontWeight: "900", fontSize: 14 }, waiting: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 }, waitTitle: { fontSize: 17, fontWeight: "900", marginTop: 18, textAlign: "center" }, waitText: { fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 7 }, secondaryButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: "flex-start", marginTop: 12 }, secondaryText: { fontSize: 12, fontWeight: "800" }, roomContent: { padding: 14, paddingBottom: 18 }, memberPanel: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }, panelTitle: { fontSize: 14, fontWeight: "900", marginBottom: 9 }, memberRow: { flexDirection: "row", alignItems: "center", marginTop: 7 }, memberText: { marginLeft: 10 }, memberAlias: { fontSize: 13, fontWeight: "800" }, memberFaculty: { fontSize: 11, marginTop: 2 }, taskCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }, input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, fontSize: 12.5, marginTop: 8 }, smallPrimary: { paddingVertical: 10, borderRadius: 10, alignItems: "center", marginTop: 10 }, smallPrimaryText: { fontWeight: "900", fontSize: 12.5 }, messagePanel: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }, emptyText: { textAlign: "center", fontSize: 12, paddingVertical: 12 }, bubble: { maxWidth: "85%", borderRadius: 12, padding: 10, marginTop: 7 }, bubbleAlias: { fontSize: 10, fontWeight: "800", marginBottom: 2 }, bubbleText: { fontSize: 13, lineHeight: 18 }, resultCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, gap: 5 }, score: { fontSize: 19, fontWeight: "900" }, connectionCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 6 }, composer: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 9 }, composerInput: { flex: 1, fontSize: 13, paddingVertical: 8, paddingHorizontal: 10 }, sendButton: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
