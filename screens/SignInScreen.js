import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
import { MINDCLICK_LOGO_URI } from "../lib/brandAssets";

export default function SignInScreen() {
  const { signInWithGoogle, signInWithDemo, signInWithPsuEmail, authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [psuEmail, setPsuEmail] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const handlePsuEmailSignIn = async () => {
    setLocalError("");
    const clean = psuEmail.trim().toLowerCase();
    if (!clean) {
      setLocalError("กรุณากรอกอีเมลมหาวิทยาลัย");
      return;
    }
    if (!clean.endsWith("@psu.ac.th")) {
      setLocalError("ต้องเป็นอีเมลมหาวิทยาลัยที่ลงท้ายด้วย @psu.ac.th เท่านั้น");
      return;
    }

    try {
      setLoading(true);
      const ok = await signInWithPsuEmail(clean);
      if (!ok) {
        setLocalError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (e) {
      setLocalError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError("");
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <Image
            source={{ uri: MINDCLICK_LOGO_URI }}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>
            Mind<Text style={styles.brandTitleAccent}>click</Text>
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.contentBox}>
          {/* Brand Logo Hero */}
          <View style={styles.heroLogoWrapper}>
            <View style={styles.heroLogoBadge}>
              <Image
                source={{ uri: MINDCLICK_LOGO_URI }}
                style={styles.heroLogoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            เจอเพื่อนที่คลิก{"\n"}จากคำตอบที่ใช่
          </Text>

          {/* Decorative Lime Underline */}
          <View style={styles.limeLine} />

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            เชื่อมต่อด้วยบัญชี Google เพื่อเริ่มต้นค้นหาเพื่อนและแชทกับคนที่คลิกกัน
          </Text>

          {/* Error notice if any */}
          {(authError || localError) ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.destructive} />
              <Text style={styles.errorText}>{localError || authError}</Text>
            </View>
          ) : null}

          {/* Google Sign-In Main Button */}
          <TouchableOpacity
            style={styles.googleButtonMain}
            activeOpacity={0.88}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.ink} size="small" />
            ) : (
              <View style={styles.googleMainInner}>
                <View style={styles.googleIconCircle}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.googleButtonMainText}>
                    เข้าสู่ระบบด้วย Google
                  </Text>
                  <Text style={styles.googleButtonMainSub}>
                    เชื่อมต่อด้วยบัญชี Google ใดก็ได้
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.ink} />
              </View>
            )}
          </TouchableOpacity>

          {/* Disclaimer Footer */}
          <Text style={styles.disclaimerText}>
            เมื่อดำเนินการต่อ คุณยอมรับ{" "}
            <Text
              style={styles.linkText}
              onPress={() => setShowPolicyModal(true)}
            >
              ข้อกำหนดการใช้งาน
            </Text>{" "}
            และ{" "}
            <Text
              style={styles.linkText}
              onPress={() => setShowPolicyModal(true)}
            >
              นโยบายความเป็นส่วนตัว
            </Text>
          </Text>
        </View>

        {/* Bottom-right decorative brand mark */}
        <View style={styles.floatingQBadge}>
          <Ionicons name="sparkles" size={22} color={colors.white} />
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        mode="view"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  brandTitleAccent: {
    color: colors.primary,
  },
  heroLogoWrapper: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroLogoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    padding: 8,
  },
  heroLogoImage: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: "center",
    position: "relative",
  },
  contentBox: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 8,
  },
  headline: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.ink,
    lineHeight: 48,
    letterSpacing: -1,
  },
  limeLine: {
    width: 44,
    height: 4,
    backgroundColor: "#bbf44a",
    marginTop: 12,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedForeground,
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#17171c",
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffebeb",
    borderWidth: 1,
    borderColor: colors.destructive,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.destructive,
    fontWeight: "600",
    flex: 1,
  },
  psuEmailCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  psuCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  psuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  psuCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  psuCardSub: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    height: "100%",
  },
  psuSubmitBtn: {
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  psuSubmitBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.7,
  },
  psuSubmitBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  googleButtonMain: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...shadows.neo,
  },
  googleMainInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleButtonMainText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
  },
  googleButtonMainSub: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "600",
    marginTop: 2,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  googleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ea4335",
    justifyContent: "center",
    alignItems: "center",
  },
  googleG: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 14,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  googleButtonSub: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginBottom: 6,
  },
  demoButtonText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.mutedForeground,
    lineHeight: 18,
    textAlign: "center",
  },
  linkText: {
    textDecorationLine: "underline",
    fontWeight: "700",
    color: colors.ink,
  },
  floatingQBadge: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingQText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
  },
});
