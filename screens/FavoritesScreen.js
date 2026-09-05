import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useData } from "../context/DataContext";
import Header from "../components/Header";

export default function FavoritesScreen({ navigation }) {
  const { favorites, getUserById, toggleFavorite } = useData();

  const favoriteUsers = favorites
    .map((id) => getUserById(id))
    .filter(Boolean);

  const handleRemove = (user) => {
    Alert.alert(
      "นำออกจากรายการโปรด?",
      `คุณต้องการนำ ${user.name} ออกจากรายการโปรดใช่หรือไม่`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "นำออก",
          style: "destructive",
          onPress: () => toggleFavorite(user.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.eyebrow}>SAVED PROFILES</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>รายการโปรด</Text>
            <Text style={styles.countBadge}>{favoriteUsers.length} คน</Text>
          </View>
          <Text style={styles.subtitle}>
            รายชื่อคนที่คุณบันทึกไว้เพื่อกลับมาดูหรือติดต่ออีกครั้ง
          </Text>
        </View>

        {/* Favorite Users List */}
        {favoriteUsers.length > 0 ? (
          <View style={styles.listContainer}>
            {favoriteUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <TouchableOpacity
                  style={styles.cardMain}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("MatchDetail", { userId: user.id })
                  }
                >
                  <View style={styles.avatarWrapper}>
                    {user.image ? (
                      <Image
                        source={{ uri: user.image }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.avatarImage, styles.avatarFallback]}>
                        <Text style={styles.avatarInitial}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    {user.bio ? (
                      <Text style={styles.userBio} numberOfLines={1}>
                        {user.bio}
                      </Text>
                    ) : null}
                    <View style={styles.viewProfileBtn}>
                      <Text style={styles.viewProfileText}>ดูโปรไฟล์</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={12}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeBtn}
                  activeOpacity={0.8}
                  onPress={() => handleRemove(user)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.destructive}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={36} color={colors.coral} />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการโปรด</Text>
            <Text style={styles.emptySubtitle}>
              คุณสามารถกดปุ่มหัวใจในหน้ารายละเอียดแมตช์ เพื่อเก็บโปรไฟล์คนที่สนใจไว้ที่นี่
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ResultsTab")}
            >
              <Ionicons name="people" size={16} color={colors.white} />
              <Text style={styles.emptyActionBtnText}>ไปดูแมตช์ของคุณ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
    paddingBottom: 16,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
  },
  countBadge: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.mutedForeground,
    fontFamily: "monospace",
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 6,
  },
  listContainer: {
    gap: 12,
  },
  userCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.neo,
  },
  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 6,
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  removeBtn: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.darkBorder,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffebeb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActionBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 8,
  },
  emptyActionBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
});
