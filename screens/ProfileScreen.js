import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Header from "../components/Header";
import GalleryViewer from "../components/GalleryViewer";

const genderOptions = [
  { value: "male", label: "ชาย", icon: "male" },
  { value: "female", label: "หญิง", icon: "female" },
  { value: "other", label: "อื่นๆ", icon: "transgender" },
  { value: "prefer_not_to_say", label: "ไม่ระบุ", icon: "help-circle-outline" },
];

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const {
    profile,
    updateProfile,
    addGalleryImage,
    removeGalleryImage,
    resetQuizData,
  } = useData();

  const [displayName, setDisplayName] = useState(profile?.name || user?.name || "");
  const [gender, setGender] = useState(profile.gender || "prefer_not_to_say");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUri, setAvatarUri] = useState(profile.image || user?.image || null);
  const [socialLinks, setSocialLinks] = useState({
    instagram: profile.socialLinks?.instagram || "",
    facebook: profile.socialLinks?.facebook || "",
    line: profile.socialLinks?.line || "",
    tiktok: profile.socialLinks?.tiktok || "",
  });

  // ซิงค์ฟิลด์ข้อมูลโปรไฟล์เมื่อสลับบัญชีผู้ใช้
  useEffect(() => {
    setDisplayName(profile?.name || user?.name || "");
    setGender(profile?.gender || "prefer_not_to_say");
    setBio(profile?.bio || "");
    setAvatarUri(profile?.image || user?.image || null);
    setSocialLinks({
      instagram: profile?.socialLinks?.instagram || "",
      facebook: profile?.socialLinks?.facebook || "",
      line: profile?.socialLinks?.line || "",
      tiktok: profile?.socialLinks?.tiktok || "",
    });
  }, [profile, user]);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const profileReady = Boolean(
    profile?.bio ||
      (profile?.gender && profile.gender !== "prefer_not_to_say") ||
      Object.values(profile?.socialLinks || {}).some(Boolean)
  );

  const handlePickAvatar = async () => {
    try {
      // ตรวจสอบสิทธิ์ก่อน ถ้ายังไม่มีจึงค่อยขอ เพื่อป้องกันปัญหา ActivityResult บน Android
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตให้เข้าถึงคลังรูปภาพในตั้งค่าของอุปกรณ์");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === "ios", // ปิดบน Android เพื่อป้องกัน ActivityResultLauncher ขัดข้องใน Multi-window/Samsung Pop-up
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const pickedUri = result.assets[0].uri;
        setAvatarUri(pickedUri);
        await updateProfile({ image: pickedUri });
        Alert.alert("สำเร็จ", "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
      }
    } catch (e) {
      console.warn("handlePickAvatar error:", e);
      Alert.alert(
        "ไม่สามารถเปิดคลังภาพได้",
        "กรุณาลองเปิดแอปแบบเต็มหน้าจอ (ไม่ใช่หน้าต่างลอย) หรือลองใหม่อีกครั้งครับ"
      );
    }
  };

  const handleAddGalleryPhoto = async () => {
    try {
      if (profile.galleryImages.length >= 9) {
        Alert.alert("แจ้งเตือน", "สามารถเพิ่มรูปภาพได้สูงสุด 9 รูป");
        return;
      }

      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตให้เข้าถึงคลังรูปภาพในตั้งค่าของอุปกรณ์");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const pickedUri = result.assets[0].uri;
        await addGalleryImage(pickedUri);
      }
    } catch (e) {
      console.warn("handleAddGalleryPhoto error:", e);
      Alert.alert(
        "ไม่สามารถเปิดคลังภาพได้",
        "กรุณาลองเปิดแอปแบบเต็มหน้าจอ (ไม่ใช่หน้าต่างลอย) หรือลองใหม่อีกครั้งครับ"
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      name: displayName || profile?.name || user?.name || "ผู้ใช้งาน",
      gender,
      bio,
      socialLinks,
      image: avatarUri || profile?.image || user?.image || null,
    });
    setIsSaving(false);
    Alert.alert("สำเร็จ", "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว");
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
        {/* Title Section (Matching Image 3) */}
        <View style={styles.titleSection}>
          <Text style={styles.eyebrow}>YOUR PROFILE</Text>
          <Text style={styles.headline}>เล่าให้คนที่ใช่รู้จักคุณ</Text>
          <View style={styles.titleDivider} />
        </View>

        {/* Pink Alert Banner (Shown if profile not filled yet) */}
        {!profileReady && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>
              กรุณากรอกข้อมูลโปรไฟล์ก่อนตอบคำถาม
            </Text>
            <Text style={styles.warningSub}>
              อัปโหลดรูปโปรไฟล์ และใส่ข้อมูลอย่างน้อย 1 อย่าง (เพศ, แนะนำตัว หรือช่องทางติดต่อ)
            </Text>
          </View>
        )}

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            {(avatarUri || profile?.image || user?.image) ? (
              <Image
                source={{ uri: avatarUri || profile?.image || user?.image }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarDefault}>
                <Ionicons name="person" size={54} color={colors.white} />
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={handlePickAvatar}
            >
              <Ionicons name="pencil" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.userNameRow}>
            <TextInput
              style={styles.userNameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="ใส่ชื่อของคุณ"
              placeholderTextColor={colors.mutedForeground}
            />
            <Ionicons name="pencil" size={14} color={colors.mutedForeground} />
          </View>
          <Text style={styles.userEmail}>{user?.email || profile?.email || "อีเมล Google"}</Text>

          <View style={styles.publicProfileLink}>
            <Ionicons name="open-outline" size={14} color={colors.primary} />
            <Text style={styles.publicProfileText}>ดูโปรไฟล์สาธารณะ</Text>
          </View>
        </View>

        {/* Form: Gender (Matching Image 3) */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>เพศ</Text>
          </View>

          <View style={styles.genderRow}>
            {genderOptions.map((opt) => {
              const isSelected = gender === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.genderPill,
                    isSelected ? styles.genderPillActive : null,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setGender(opt.value)}
                >
                  <Ionicons
                    name={opt.icon}
                    size={14}
                    color={isSelected ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.genderPillText,
                      isSelected ? styles.genderPillTextActive : null,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Form: Bio (Matching Image 3) */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>แนะนำตัว ({bio.length}/200)</Text>
          </View>

          <TextInput
            style={styles.bioInput}
            multiline
            numberOfLines={4}
            maxLength={200}
            placeholder="เขียนแนะนำตัวสั้นๆ ให้คนอื่นรู้จักคุณมากขึ้น..."
            placeholderTextColor={colors.mutedForeground}
            value={bio}
            onChangeText={setBio}
          />
        </View>

        {/* Form: Social Links (Matching Image 3) */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="link-outline" size={16} color={colors.coral} />
            <Text style={styles.sectionTitle}>ช่องทางติดต่อ</Text>
          </View>

          <View style={styles.socialList}>
            <View style={styles.socialField}>
              <Ionicons name="logo-instagram" size={18} color="#e1306c" />
              <TextInput
                style={styles.socialInput}
                placeholder="Instagram profile link หรือ username"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.instagram}
                onChangeText={(t) => setSocialLinks({ ...socialLinks, instagram: t })}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialField}>
              <Ionicons name="logo-facebook" size={18} color="#1877f2" />
              <TextInput
                style={styles.socialInput}
                placeholder="Facebook profile link หรือ username"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.facebook}
                onChangeText={(t) => setSocialLinks({ ...socialLinks, facebook: t })}
              />
            </View>

            <View style={styles.socialField}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#06c755" />
              <TextInput
                style={styles.socialInput}
                placeholder="Line ID"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.line}
                onChangeText={(t) => setSocialLinks({ ...socialLinks, line: t })}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialField}>
              <Ionicons name="logo-tiktok" size={18} color={colors.ink} />
              <TextInput
                style={styles.socialInput}
                placeholder="TikTok @username"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.tiktok}
                onChangeText={(t) => setSocialLinks({ ...socialLinks, tiktok: t })}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Form: Gallery Photos (Matching Image 3) */}
        <View style={styles.formCard}>
          <View style={styles.galleryHeader}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="images-outline" size={16} color={colors.coral} />
              <Text style={styles.sectionTitle}>รูปภาพ / วิดีโอ</Text>
            </View>
            <Text style={styles.fileCountText}>
              {profile.galleryImages.length}/9 ไฟล์
            </Text>
          </View>

          <View style={styles.galleryGrid}>
            {profile.galleryImages.map((img) => (
              <View key={img.id} style={styles.galleryThumbWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedPhoto(img.url)}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image source={{ uri: img.url }} style={styles.galleryThumb} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => removeGalleryImage(img.id)}
                >
                  <Ionicons name="close" size={12} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {profile.galleryImages.length < 9 && (
              <TouchableOpacity
                style={styles.addThumbBtn}
                activeOpacity={0.8}
                onPress={handleAddGalleryPhoto}
              >
                <Ionicons name="add" size={28} color={colors.primary} />
                <Text style={styles.addThumbText}>เพิ่มรูป</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>บันทึกโปรไฟล์</Text>
          )}
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={16} color={colors.destructive} />
          <Text style={styles.signOutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>

      <GalleryViewer
        visible={Boolean(selectedPhoto)}
        imageUrl={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
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
    paddingBottom: 50,
  },
  titleSection: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headline: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  titleDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 14,
  },
  warningBanner: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    padding: 14,
    borderRadius: 6,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#b91c1c",
    marginBottom: 4,
  },
  warningSub: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 18,
  },
  userCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarDefault: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  userNameInput: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 2,
    paddingHorizontal: 8,
    minWidth: 140,
  },
  userEmail: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 10,
  },
  publicProfileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  publicProfileText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    gap: 4,
  },
  genderPillActive: {
    borderColor: colors.primary,
    backgroundColor: "#eff6ff",
  },
  genderPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  genderPillTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },
  bioInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: colors.ink,
    minHeight: 85,
    textAlignVertical: "top",
  },
  socialList: {
    gap: 10,
  },
  socialField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  socialInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  fileCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryThumbWrapper: {
    width: "31%",
    aspectRatio: 1,
    position: "relative",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  addThumbBtn: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  addThumbText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fff5f5",
    gap: 6,
  },
  signOutText: {
    color: colors.destructive,
    fontSize: 14,
    fontWeight: "700",
  },
});
