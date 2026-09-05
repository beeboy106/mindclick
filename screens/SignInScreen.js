import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";

export default function SignInScreen() {
  const { signInWithGoogle, authError } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>
            Mind<Text style={styles.brandTitleAccent}>click</Text>
          </Text>
          <View style={styles.brandBadge}>
            <Ionicons name="sparkles" size={13} color={colors.ink} />
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.contentBox}>
          {/* Eyebrow */}
          <Text style={styles.eyebrow}>MEET THROUGH QUESTIONS</Text>

          {/* Headline */}
          <Text style={styles.headline}>
            เจอเพื่อนที่คลิก{"\n"}จากคำตอบที่ใช่
          </Text>

          {/* Decorative Lime Underline */}
          <View style={styles.limeLine} />

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            ตอบคำถามสั้นๆ แล้วค้นหาคนที่มีไลฟ์สไตล์และมุมมองใกล้กับคุณ
          </Text>

          <View style={styles.divider} />

          {/* Error notice if any */}
          {authError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.destructive} />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <View style={styles.googleLeft}>
                  {/* Google G logo simulation */}
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>
                    เข้าสู่ระบบด้วย Google
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.ink} />
              </>
            )}
          </TouchableOpacity>

          {/* Disclaimer Footer */}
          <Text style={styles.disclaimerText}>
            เมื่อดำเนินการต่อ คุณยอมรับ{" "}
            <Text style={styles.linkText}>ข้อกำหนดการใช้งาน</Text> และ{" "}
            <Text style={styles.linkText}>นโยบายความเป็นส่วนตัว</Text>
          </Text>
        </View>

        {/* Bottom-right decorative brand mark */}
        <View style={styles.floatingQBadge}>
          <Ionicons name="sparkles" size={22} color={colors.white} />
        </View>
      </View>
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
    gap: 6,
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
  brandBadge: {
    width: 24,
    height: 24,
    backgroundColor: "#bbf44a",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
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
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  googleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ea4335",
    justifyContent: "center",
    alignItems: "center",
  },
  googleG: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 13,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
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
