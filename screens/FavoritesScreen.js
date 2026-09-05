import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section (Matching Image 4) */}
        <View style={styles.headerSection}>
          <Text style={styles.eyebrow}>SAVED PEOPLE</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>รายการโปรด</Text>
            <Text style={styles.countText}>{favoriteUsers.length} คน</Text>
          </View>
          <View style={styles.divider} />
        </View>

        {/* Favorites List or Empty State */}
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
                      <View style={styles.avatarFallback}>
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
                    <View style={styles.viewProfileRow}>
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
                    size={18}
                    color={colors.destructive}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          /* Empty State Box (Matching Image 4) */
          <View style={styles.emptyDashedBox}>
            <Ionicons name="heart-outline" size={44} color="#ff5c5c" />
            <Text style={styles.emptyTitle}>ยังไม่มีรายการโปรด</Text>
            <Text style={styles.emptySubtitle}>
              เก็บคนที่คุณอยากกลับมาดูอีกครั้งได้จากหน้ารายละเอียดแมตช์
            </Text>

            <TouchableOpacity
              style={styles.blueBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ResultsTab")}
            >
              <Text style={styles.blueBtnText}>ไปดูแมตช์</Text>
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
    backgroundColor: "#fafbfc",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.ink,
  },
  countText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 14,
  },
  listContainer: {
    gap: 12,
  },
  userCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
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
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  viewProfileRow: {
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
    padding: 14,
  },
  emptyDashedBox: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 24,
  },
  blueBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  blueBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },
});
