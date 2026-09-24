import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useFeed } from "../context/FeedContext";
import FavoriteButton from "../components/FavoriteButton";
import GalleryViewer from "../components/GalleryViewer";
import ChatModal from "../components/ChatModal";

const genderMeta = {
  male: {
    label: "ชาย",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    iconName: "male",
  },
  female: {
    label: "หญิง",
    color: "#db2777",
    bgColor: "#fdf2f8",
    borderColor: "#fbcfe8",
    iconName: "female",
  },
  other: {
    label: "อื่นๆ",
    color: "#9333ea",
    bgColor: "#faf5ff",
    borderColor: "#e9d5ff",
    iconName: "ellipse-outline",
  },
  prefer_not_to_say: {
    label: "ไม่ระบุ",
    color: "#525252",
    bgColor: "#f5f5f5",
    borderColor: "#e5e5e5",
    iconName: "remove-circle-outline",
  },
};

export default function PublicProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { userId, user: initialUser } = route.params || {};
  const { user: authUser } = useAuth();
  const { profile: myProfile, getUserById } = useData();
  const { startChatWithUser } = useFeed();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const isOwnProfile = Boolean(authUser?.id && userId === authUser?.id);

  // ดึงข้อมูลผู้ใช้ (หากเป็นโปรไฟล์ตนเองให้ใช้ข้อมูลจาก Context ปัจจุบัน)
  const targetUser = isOwnProfile
    ? {
        id: authUser?.id,
        name: myProfile?.name || authUser?.name || "คุณ",
        image: myProfile?.image || authUser?.image || null,
        bio: myProfile?.bio || "",
        gender: myProfile?.gender,
        faculty: myProfile?.faculty || "",
        socialLinks: myProfile?.socialLinks || {},
        galleryImages: myProfile?.galleryImages || [],
        isRealUser: true,
      }
    : initialUser || getUserById(userId);

  if (!targetUser) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.notFoundBox}>
          <Ionicons name="person-outline" size={48} color={colors.mutedForeground} />
          <Text style={styles.notFoundText}>ไม่พบข้อมูลโปรไฟล์ผู้ใช้</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>ย้อนกลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const genderInfo = targetUser.gender ? genderMeta[targetUser.gender] : null;

  // เตรียมรายการโซเชียลมีเดีย
  const socialList = [
    {
      key: "instagram",
      label: "Instagram",
      value: targetUser.socialLinks?.instagram,
      brandBg: "#E1306C",
      icon: "logo-instagram",
      getUrl: (v) => (v.startsWith("http") ? v : `https://instagram.com/${v.replace("@", "")}`),
    },
    {
      key: "facebook",
      label: "Facebook",
      value: targetUser.socialLinks?.facebook,
      brandBg: "#1877F2",
      icon: "logo-facebook",
      getUrl: (v) => (v.startsWith("http") ? v : `https://facebook.com/${v}`),
    },
    {
      key: "tiktok",
      label: "TikTok",
      value: targetUser.socialLinks?.tiktok,
      brandBg: "#111111",
      icon: "logo-tiktok",
      getUrl: (v) => (v.startsWith("http") ? v : `https://tiktok.com/@${v.replace("@", "")}`),
    },
    {
      key: "line",
      label: "LINE",
      value: targetUser.socialLinks?.line,
      brandBg: "#06C755",
      icon: "chatbubble-ellipses",
      getUrl: (v) => (v.startsWith("http") ? v : `https://line.me/ti/p/~${v}`),
    },
  ].filter((item) => Boolean(item.value && item.value.trim()));

  const handleOpenSocialUrl = async (item) => {
    if (!item.value) return;
    const url = item.getUrl(item.value.trim());
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("ไม่สามารถเปิดลิงก์ได้", `ไม่พบแอปพลิเคชันที่รองรับ: ${url}`);
      }
    } catch (err) {
      console.warn("Cannot open social url:", err);
      Alert.alert("ไม่สามารถเปิดลิงก์", `เกิดข้อผิดพลาดในการเปิด ${item.label}`);
    }
  };

  const handleStartChat = async () => {
    if (isOwnProfile) return;
    await startChatWithUser(targetUser);
    setChatVisible(true);
  };

  const galleryImages = targetUser.galleryImages || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarEyebrow}>PUBLIC PROFILE</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {targetUser.name}
          </Text>
        </View>

        {!isOwnProfile ? (
          <FavoriteButton userId={targetUser.id} size="sm" />
        ) : (
          <View style={styles.ownProfileBadge}>
            <Text style={styles.ownProfileBadgeText}>คุณ</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isOwnProfile ? 40 : 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Hero Photo (4:5 Aspect Ratio) */}
        <View style={styles.heroWrapper}>
          {!avatarError && targetUser.image ? (
            <Image
              source={{ uri: targetUser.image }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Text style={styles.heroFallbackText}>
                {(targetUser.name || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Floating Favorite Button on Image */}
          {!isOwnProfile && (
            <View style={styles.heroFavBadge}>
              <FavoriteButton userId={targetUser.id} size="md" />
            </View>
          )}
        </View>

        {/* Identity & Bio Card */}
        <View style={styles.profileInfoCard}>
          <View style={styles.nameHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrowMeet}>MEET</Text>
              <Text style={styles.profileName}>{targetUser.name}</Text>
            </View>
            {targetUser.isRealUser && (
              <View style={styles.realUserTag}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.realUserTagText}>ผู้ใช้จริง</Text>
              </View>
            )}
          </View>

          {/* Gender Badge */}
          {genderInfo && (
            <View
              style={[
                styles.genderBadge,
                {
                  backgroundColor: genderInfo.bgColor,
                  borderColor: genderInfo.borderColor,
                },
              ]}
            >
              <Ionicons
                name={genderInfo.iconName}
                size={14}
                color={genderInfo.color}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.genderBadgeText, { color: genderInfo.color }]}>
                {genderInfo.label}
              </Text>
            </View>
          )}

          {/* Bio Section */}
          {Boolean(targetUser.bio && targetUser.bio.trim()) ? (
            <View style={styles.bioContainer}>
              <Text style={styles.bioEyebrow}>ABOUT</Text>
              <Text style={styles.bioText}>{targetUser.bio}</Text>
            </View>
          ) : (
            <View style={styles.bioEmptyContainer}>
              <Text style={styles.bioEmptyText}>ผู้ใช้นี้ยังไม่ได้ระบุคำแนะนำตัว</Text>
            </View>
          )}
        </View>

        {/* Social Media Channels Section */}
        {socialList.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>ช่องทางติดต่อ</Text>
            <View style={styles.socialListContainer}>
              {socialList.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.socialChannelRow}
                  activeOpacity={0.8}
                  onPress={() => handleOpenSocialUrl(item)}
                >
                  <View style={[styles.socialIconBox, { backgroundColor: item.brandBg }]}>
                    <Ionicons name={item.icon} size={20} color={colors.white} />
                  </View>
                  <View style={styles.socialTextBox}>
                    <Text style={styles.socialLabelText}>{item.label}</Text>
                    <Text style={styles.socialValueText} numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Moments Gallery ("ช่วงเวลาของฉัน") */}
        {galleryImages.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.galleryHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>ช่วงเวลาของฉัน</Text>
              <View style={styles.mediaCountBadge}>
                <Text style={styles.mediaCountText}>{galleryImages.length} MEDIA</Text>
              </View>
            </View>

            <View style={styles.galleryGrid}>
              {galleryImages.map((img, idx) => {
                const imgUri = typeof img === "string" ? img : img?.url;
                if (!imgUri) return null;

                return (
                  <TouchableOpacity
                    key={img?.id || `pub_g_${idx}`}
                    style={styles.galleryThumbWrapper}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPhoto(imgUri)}
                  >
                    <Image
                      source={{ uri: imgUri }}
                      style={styles.galleryThumbImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar for Initiating Chat */}
      {!isOwnProfile && (
        <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <TouchableOpacity
            style={styles.startChatBtn}
            activeOpacity={0.88}
            onPress={handleStartChat}
          >
            <Ionicons name="chatbubbles" size={20} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.startChatBtnText}>เริ่มแชทกับ {targetUser.name}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen Photo Viewer */}
      <GalleryViewer
        visible={Boolean(selectedPhoto)}
        imageUrl={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {/* Embedded Chat Modal */}
      <ChatModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        initialFriendId={targetUser.id}
        initialFriendData={targetUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkBorder,
  },
  topBarBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  topBarEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
  },
  ownProfileBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownProfileBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 18,
  },
  heroWrapper: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: colors.darkBorder,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
    ...shadows.neo,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroFallbackText: {
    color: colors.white,
    fontSize: 90,
    fontWeight: "900",
  },
  heroFavBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
  },
  profileInfoCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 18,
    marginBottom: 16,
    ...shadows.neo,
  },
  nameHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eyebrowMeet: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink,
  },
  realUserTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  realUserTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  genderBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  genderBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  bioContainer: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
  },
  bioEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bioText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
    lineHeight: 22,
  },
  bioEmptyContainer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bioEmptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 18,
    marginBottom: 16,
    ...shadows.neo,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 12,
  },
  socialListContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  socialChannelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  socialIconBox: {
    width: 38,
    height: 38,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  socialTextBox: {
    flex: 1,
  },
  socialLabelText: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  socialValueText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  galleryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mediaCountBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.mutedForeground,
    letterSpacing: 0.5,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryThumbWrapper: {
    width: "31.5%",
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    overflow: "hidden",
  },
  galleryThumbImage: {
    width: "100%",
    height: "100%",
  },
  bottomStickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1.5,
    borderTopColor: colors.darkBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.neo,
  },
  startChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...shadows.neo,
  },
  startChatBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  notFoundBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },
});
