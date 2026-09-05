import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Header from "../components/Header";
import GalleryViewer from "../components/GalleryViewer";

const genderOptions = [
  { value: "male", label: "ชาย", icon: "male-outline" },
  { value: "female", label: "หญิง", icon: "female-outline" },
  { value: "other", label: "อื่นๆ", icon: "transgender-outline" },
  { value: "prefer_not_to_say", label: "ไม่ระบุ", icon: "help-outline" },
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

  const [gender, setGender] = useState(profile.gender || "prefer_not_to_say");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUri, setAvatarUri] = useState(profile.image || user?.image || null);
  const [socialLinks, setSocialLinks] = useState({
    instagram: profile.socialLinks?.instagram || "",
    facebook: profile.socialLinks?.facebook || "",
    line: profile.socialLinks?.line || "",
    tiktok: profile.socialLinks?.tiktok || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // เลือกรูปโปรไฟล์ผ่าน expo-image-picker
  const handlePickAvatar = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "ต้องการสิทธิ์เข้าถึงรูปภาพ",
          "กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพเพื่อเปลี่ยนรูปโปรไฟล์"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setAvatarUri(pickedUri);
        await updateProfile({ image: pickedUri });
        Alert.alert("สำเร็จ", "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
      }
    } catch (e) {
      console.error("Error picking avatar:", e);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกรูปภาพได้");
    }
  };

  // เพิ่มรูปลง Gallery ผ่าน expo-image-picker
  const handleAddGalleryPhoto = async () => {
    try {
      if (profile.galleryImages.length >= 9) {
        Alert.alert("แจ้งเตือน", "สามารถเพิ่มรูปภาพได้สูงสุด 9 รูป");
        return;
      }

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "ต้องการสิทธิ์เข้าถึงรูปภาพ",
          "กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพเพื่อเพิ่มรูปในอัลบั้ม"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        const res = await addGalleryImage(pickedUri);
        if (!res.success) {
          Alert.alert("ข้อผิดพลาด", res.error);
        }
      }
    } catch (e) {
      console.error("Error adding gallery photo:", e);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเพิ่มรูปภาพได้");
    }
  };

  // ลบรูป Gallery
  const handleRemoveGalleryPhoto = (imageId) => {
    Alert.alert("ลบรูปภาพ?", "คุณต้องการลบรูปนี้ออกจากอัลบั้มใช่หรือไม่", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => removeGalleryImage(imageId),
      },
    ]);
  };

  // บันทึกการเปลี่ยนแปลงโปรไฟล์
  const handleSaveProfile = async () => {
    setIsSaving(true);
    const success = await updateProfile({
      gender,
      bio,
      socialLinks,
      image: avatarUri,
    });
    setIsSaving(false);

    if (success) {
      Alert.alert("สำเร็จ", "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว");
    } else {
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // รีเซ็ตควิซ
  const handleResetQuiz = () => {
    Alert.alert(
      "รีเซ็ตคำตอบควิซ?",
      "คุณต้องการล้างคำตอบควิซทั้งหมดเพื่อเริ่มทำใหม่ใช่หรือไม่",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "รีเซ็ต",
          style: "destructive",
          onPress: async () => {
            await resetQuizData();
            Alert.alert("สำเร็จ", "ล้างคำตอบควิซเรียบร้อยแล้ว");
          },
        },
      ]
    );
  };

  // ออกจากระบบ
  const handleSignOut = () => {
    Alert.alert("ออกจากระบบ?", "คุณต้องการออกจากระบบ FriendQ ใช่หรือไม่", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: signOut,
      },
    ]);
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
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBtn}
                activeOpacity={0.8}
                onPress={handlePickAvatar}
              >
                <Ionicons name="camera" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.userMeta}>
              <Text style={styles.profileName}>{user?.name || "ผู้ใช้งาน"}</Text>
              <Text style={styles.profileEmail}>
                {user?.email || "Google Account"}
              </Text>
              <View style={styles.authBadge}>
                <Ionicons name="logo-google" size={12} color={colors.ink} />
                <Text style={styles.authBadgeText}>Google Account</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form: Gender */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>เพศ</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((opt) => {
              const isSelected = gender === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.genderChip,
                    isSelected ? styles.genderChipSelected : null,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setGender(opt.value)}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={isSelected ? colors.white : colors.ink}
                  />
                  <Text
                    style={[
                      styles.genderChipText,
                      isSelected ? styles.genderChipTextSelected : null,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Form: Bio */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>เกี่ยวกับคุณ (Bio)</Text>
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </View>
          <TextInput
            style={styles.bioInput}
            multiline
            numberOfLines={4}
            maxLength={200}
            placeholder="เล่าสิ่งที่คุณชอบ สไตล์ของคุณ หรือกิจกรรมยามว่าง..."
            placeholderTextColor={colors.mutedForeground}
            value={bio}
            onChangeText={setBio}
          />
        </View>

        {/* Form: Social Media Links */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>ช่องทางติดต่อ (Social Media)</Text>
          <View style={styles.socialInputsList}>
            <View style={styles.socialInputBox}>
              <Ionicons name="logo-instagram" size={18} color={colors.ink} />
              <TextInput
                style={styles.socialInput}
                placeholder="Instagram username"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.instagram}
                onChangeText={(text) =>
                  setSocialLinks({ ...socialLinks, instagram: text })
                }
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialInputBox}>
              <Ionicons name="logo-facebook" size={18} color={colors.ink} />
              <TextInput
                style={styles.socialInput}
                placeholder="Facebook name / username"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.facebook}
                onChangeText={(text) =>
                  setSocialLinks({ ...socialLinks, facebook: text })
                }
              />
            </View>

            <View style={styles.socialInputBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.ink} />
              <TextInput
                style={styles.socialInput}
                placeholder="Line ID"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.line}
                onChangeText={(text) =>
                  setSocialLinks({ ...socialLinks, line: text })
                }
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialInputBox}>
              <Ionicons name="logo-tiktok" size={18} color={colors.ink} />
              <TextInput
                style={styles.socialInput}
                placeholder="TikTok @username"
                placeholderTextColor={colors.mutedForeground}
                value={socialLinks.tiktok}
                onChangeText={(text) =>
                  setSocialLinks({ ...socialLinks, tiktok: text })
                }
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Gallery Section */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>อัลบั้มรูปภาพ</Text>
            <Text style={styles.charCount}>
              {profile.galleryImages.length}/9 รูป
            </Text>
          </View>

          <View style={styles.galleryGrid}>
            {profile.galleryImages.map((img) => (
              <View key={img.id} style={styles.galleryThumbWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedPhoto(img.url)}
                  style={styles.galleryThumbClick}
                >
                  <Image source={{ uri: img.url }} style={styles.galleryThumb} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deletePhotoBtn}
                  onPress={() => handleRemoveGalleryPhoto(img.id)}
                >
                  <Ionicons name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {profile.galleryImages.length < 9 && (
              <TouchableOpacity
                style={styles.addPhotoBtn}
                activeOpacity={0.8}
                onPress={handleAddGalleryPhoto}
              >
                <Ionicons name="add" size={28} color={colors.primary} />
                <Text style={styles.addPhotoText}>เพิ่มรูป</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>บันทึกข้อมูลโปรไฟล์</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Danger Actions */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.8}
            onPress={handleResetQuiz}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.ink} />
            <Text style={styles.resetBtnText}>รีเซ็ตคำตอบควิซทั้งหมด</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            activeOpacity={0.8}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
            <Text style={styles.signOutBtnText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fullscreen Photo Viewer */}
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 20,
    marginBottom: 24,
    ...shadows.neo,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderWidth: 2,
    borderColor: colors.darkBorder,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
  },
  cameraBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    backgroundColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  userMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  authBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  authBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
  },
  section: {
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "700",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 4,
  },
  genderChipSelected: {
    backgroundColor: colors.ink,
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  genderChipTextSelected: {
    color: colors.white,
  },
  bioInput: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 14,
    fontSize: 14,
    color: colors.ink,
    minHeight: 90,
    textAlignVertical: "top",
    ...shadows.neo,
  },
  socialInputsList: {
    gap: 10,
  },
  socialInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  socialInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    fontWeight: "600",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  galleryThumbWrapper: {
    width: "31%",
    aspectRatio: 1,
    position: "relative",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  galleryThumbClick: {
    width: "100%",
    height: "100%",
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
  },
  deletePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.destructive,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoBtn: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 8,
    marginTop: 10,
    ...shadows.neo,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  dangerSection: {
    marginTop: 26,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    paddingTop: 18,
    gap: 12,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    gap: 8,
  },
  resetBtnText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    backgroundColor: "#fff0f0",
    borderWidth: 1.5,
    borderColor: colors.destructive,
    gap: 8,
  },
  signOutBtnText: {
    color: colors.destructive,
    fontSize: 14,
    fontWeight: "800",
  },
});
