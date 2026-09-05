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
import { colors, shadows } from "../lib/theme";
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>Q</Text>
          </View>
          <Text style={styles.appName}>
            Friend<Text style={styles.appAccent}>Q</Text>
          </Text>
          <Text style={styles.tagline}>
            ค้นพบคนที่คิด รู้สึก และใช้ชีวิตในแบบที่เข้ากันได้กับคุณ
          </Text>
        </View>

        {/* Highlight Card */}
        <View style={styles.highlightCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>COMPATIBILITY QUIZ</Text>
            <Ionicons name="sparkles" size={18} color={colors.ink} />
          </View>
          <Text style={styles.cardTitle}>
            ตอบคำถาม 4 มิติ{"\n"}เพื่อค้นหาเพื่อนที่รู้ใจ
          </Text>
          <View style={styles.categoryRow}>
            <View style={[styles.miniBadge, { backgroundColor: colors.lime }]}>
              <Text style={styles.miniBadgeText}>🌟 ไลฟ์สไตล์</Text>
            </View>
            <View style={[styles.miniBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.miniBadgeText, { color: colors.white }]}>
                🎭 บุคลิกภาพ
              </Text>
            </View>
            <View style={[styles.miniBadge, { backgroundColor: colors.coral }]}>
              <Text style={[styles.miniBadgeText, { color: colors.white }]}>
                💕 ปฏิสัมพันธ์
              </Text>
            </View>
            <View style={[styles.miniBadge, { backgroundColor: colors.ink }]}>
              <Text style={[styles.miniBadgeText, { color: colors.white }]}>
                👥 การเข้าสังคม
              </Text>
            </View>
          </View>
        </View>

        {/* Error message if any */}
        {authError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.destructive} />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        {/* Google Sign-In Action */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <Ionicons name="logo-google" size={20} color={colors.ink} />
                </View>
                <Text style={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            เมื่อดำเนินการต่อ คุณยอมรับข้อกำหนดการใช้งาน{"\n"}และนโยบายความเป็นส่วนตัวของ FriendQ
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 32,
  },
  brandSection: {
    alignItems: "center",
    marginTop: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.darkBorder,
    marginBottom: 16,
    ...shadows.neo,
  },
  logoBadgeText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 34,
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -1,
  },
  appAccent: {
    color: colors.coral,
  },
  tagline: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 280,
  },
  highlightCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    padding: 20,
    ...shadows.neo,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    lineHeight: 30,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffebeb",
    borderWidth: 1.5,
    borderColor: colors.destructive,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: colors.destructive,
    fontWeight: "600",
    flex: 1,
  },
  actionSection: {
    gap: 16,
  },
  googleButton: {
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    ...shadows.neo,
  },
  googleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 18,
  },
});
