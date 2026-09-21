import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { usePremium } from "../context/PremiumContext";
import Header from "../components/Header";
import GalleryViewer from "../components/GalleryViewer";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
import ProfileViewsModal from "../components/ProfileViewsModal";
import PaywallModal from "../components/PaywallModal";
import { CAMPUS_FACULTIES } from "../lib/mindInsight";
import { uploadImageToCloudinary } from "../lib/cloudinary";

const genderOptions = [
  { value: "male", label: "ชาย", icon: "male" },
  { value: "female", label: "หญิง", icon: "female" },
  { value: "other", label: "อื่นๆ", icon: "transgender" },
  { value: "prefer_not_to_say", label: "ไม่ระบุ", icon: "help-circle-outline" },
];

function GalleryThumbItem({ img, onSelect, onRemove }) {
  const [loadError, setLoadError] = useState(false);

  return (
    <View style={styles.galleryThumbWrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelect}
        style={styles.galleryThumbBtn}
      >
        {!loadError ? (
          <Image
            source={{ uri: img.url }}
            style={styles.galleryThumb}
            resizeMode="cover"
            onError={() => setLoadError(true)}
          />
        ) : (
          <View style={styles.galleryThumbError}>
            <Ionicons name="image-outline" size={22} color={colors.mutedForeground} />
            <Text style={styles.galleryThumbErrorText} numberOfLines={1}>
              ไฟล์หมดอายุ
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removePhotoBtn}
        onPress={onRemove}
      >
        <Ionicons name="close" size={12} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const {
    profile,
    updateProfile,
    addGalleryImage,
    removeGalleryImage,
    resetQuizData,
  } = useData();

  const {
    isPremium,
    isIncognito,
    viewCount,
    togglePremiumMock,
    toggleIncognito,
    addMockProfileView,
  } = usePremium();

  const [viewsModalVisible, setViewsModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const [displayName, setDisplayName] = useState(profile?.name || user?.name || "");
  const [gender, setGender] = useState(profile.gender || "prefer_not_to_say");
  const [faculty, setFaculty] = useState(profile.faculty || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUri, setAvatarUri] = useState(profile.image || user?.image || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: profile.socialLinks?.instagram || "",
    facebook: profile.socialLinks?.facebook || "",
    line: profile.socialLinks?.line || "",
    tiktok: profile.socialLinks?.tiktok || "",
  });

  const isInitialLoadedRef = useRef(false);
  const currentUserIdRef = useRef(user?.id);

  // ซิงค์ฟิลด์ข้อมูลโปรไฟล์เฉพาะเมื่อสลับบัญชีผู้ใช้ หรือ โหลดข้อมูลครั้งแรกเท่านั้น
  useEffect(() => {
    // หากมีการสลับผู้ใช้ (User ID เปลี่ยน) ให้รีเซ็ตสถานะเพื่อให้โหลดค่าใหม่
    if (user?.id !== currentUserIdRef.current) {
      currentUserIdRef.current = user?.id;
      isInitialLoadedRef.current = false;
    }

    // ทำงานเฉพาะเมื่อยังไม่เคยโหลดค่าเริ่มต้น หรือเมื่อสลับผู้ใช้
    if (!isInitialLoadedRef.current && (profile?.name || profile?.bio || profile?.image || profile?.email || profile?.faculty || user?.name)) {
      isInitialLoadedRef.current = true;
      setDisplayName(profile?.name || user?.name || "");
      setGender(profile?.gender || "prefer_not_to_say");
      setFaculty(profile?.faculty || "");
      setBio(profile?.bio || "");
      setAvatarUri(profile?.image || user?.image || null);
      setSocialLinks({
        instagram: profile?.socialLinks?.instagram || "",
        facebook: profile?.socialLinks?.facebook || "",
        line: profile?.socialLinks?.line || "",
        tiktok: profile?.socialLinks?.tiktok || "",
      });
    }
  }, [profile, user]);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUri, profile?.image, user?.image]);

  const profileReady = Boolean(
    profile?.bio ||
      (profile?.gender && profile.gender !== "prefer_not_to_say") ||
      Object.values(profile?.socialLinks || {}).some(Boolean)
  );

  const handlePickAvatar = async () => {
    try {
      // บน iOS จำเป็นต้องขอสิทธิ์ แต่บน Android ระบบ Photo Picker ทำงานได้ทันทีโดยไม่ต้องขอสิทธิ์
      // และการละเว้น permission dialog บน Android ช่วยให้ทำงานในหน้าต่างลอย (Floating / Pop-up view) ได้อย่างสมบูรณ์
      if (Platform.OS === "ios") {
        try {
          const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            const permissionResult =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
              Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตให้เข้าถึงคลังรูปภาพในตั้งค่าของอุปกรณ์");
              return;
            }
          }
        } catch (permErr) {
          console.warn("iOS permission error:", permErr);
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false, // ปิด crop ทั้งหมดเพื่อรองรับหน้าต่างลอย / Samsung Pop-up view
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        try {
          setIsUploadingAvatar(true);
          // อัปโหลดขึ้น Cloudinary รับ HTTPS CDN URL
          const cdnUrl = await uploadImageToCloudinary(asset.uri, { folder: "mindclick/avatars" });
          setAvatarError(false);
          setAvatarUri(cdnUrl);
          // บันทึกรูปโปรไฟล์ใหม่พร้อมรักษาสิ่งที่กำลังพิมพ์อยู่ไว้ด้วย
          await updateProfile({
            image: cdnUrl,
            name: displayName || profile?.name || user?.name || "ผู้ใช้งาน",
            gender,
            faculty,
            bio,
            socialLinks,
          });
          Alert.alert("สำเร็จ", "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
        } catch (uploadErr) {
          console.error("handlePickAvatar upload error:", uploadErr);
          Alert.alert("อัปโหลดไม่สำเร็จ", uploadErr.message || "ไม่สามารถอัปโหลดรูปภาพขึ้น Cloud ได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (e) {
      console.warn("handlePickAvatar error:", e);
      Alert.alert(
        "ไม่สามารถเปิดคลังภาพได้",
        `เกิดข้อผิดพลาด: ${e.message || e}`
      );
    }
  };

  const handleAddGalleryPhoto = async () => {
    try {
      if (profile.galleryImages.length >= 9) {
        Alert.alert("แจ้งเตือน", "สามารถเพิ่มรูปภาพได้สูงสุด 9 รูป");
        return;
      }

      if (Platform.OS === "ios") {
        try {
          const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            const permissionResult =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
              Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตให้เข้าถึงคลังรูปภาพในตั้งค่าของอุปกรณ์");
              return;
            }
          }
        } catch (permErr) {
          console.warn("iOS permission error:", permErr);
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false, // ปิด crop ทั้งหมดเพื่อรองรับหน้าต่างลอย / Samsung Pop-up view
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        try {
          setIsUploadingGallery(true);
          // อัปโหลดขึ้น Cloudinary รับ HTTPS CDN URL
          const cdnUrl = await uploadImageToCloudinary(asset.uri, { folder: "mindclick/gallery" });
          // บันทึกรูปภาพแกลเลอรีพร้อมรักษาสิ่งที่กำลังพิมพ์อยู่ไว้ด้วย
          await addGalleryImage(cdnUrl, {
            name: displayName || profile?.name || user?.name || "ผู้ใช้งาน",
            gender,
            faculty,
            bio,
            socialLinks,
          });
        } catch (uploadErr) {
          console.error("handleAddGalleryPhoto upload error:", uploadErr);
          Alert.alert("อัปโหลดไม่สำเร็จ", uploadErr.message || "ไม่สามารถอัปโหลดรูปภาพขึ้น Cloud ได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
          setIsUploadingGallery(false);
        }
      }
    } catch (e) {
      console.warn("handleAddGalleryPhoto error:", e);
      Alert.alert(
        "ไม่สามารถเปิดคลังภาพได้",
        `เกิดข้อผิดพลาด: ${e.message || e}`
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      name: displayName || profile?.name || user?.name || "ผู้ใช้งาน",
      gender,
      faculty,
      bio,
      socialLinks,
      image: avatarUri || profile?.image || user?.image || null,
    });
    setIsSaving(false);
    Alert.alert("สำเร็จ", "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
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
            {!avatarError && (avatarUri || profile?.image || user?.image) ? (
              <Image
                source={{ uri: avatarUri || profile?.image || user?.image }}
                style={styles.avatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarDefault}>
                <Text style={styles.avatarDefaultInitial}>
                  {(displayName || profile?.name || user?.name || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isUploadingAvatar && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
            >
              <Ionicons name="pencil" size={14} color={colors.white} />
            </TouchableOpacity>
            {isPremium && (
              <View style={styles.goldCrownBadge}>
                <Ionicons name="sparkles" size={11} color={colors.ink} />
                <Text style={styles.goldCrownBadgeText}>GOLD</Text>
              </View>
            )}
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

        {/* Profile Views Entry Banner (Freemium & Teaser) */}
        <TouchableOpacity
          style={[
            styles.viewsEntryBanner,
            isPremium ? styles.viewsEntryBannerGold : styles.viewsEntryBannerTeaser,
          ]}
          activeOpacity={0.88}
          onPress={() => setViewsModalVisible(true)}
        >
          <View
            style={[
              styles.viewsEntryIconBox,
              isPremium ? styles.iconGold : styles.iconRose,
            ]}
          >
            <Ionicons
              name={isPremium ? "sparkles" : "eye"}
              size={22}
              color={colors.ink}
            />
          </View>
          <View style={styles.viewsEntryTextBox}>
            <View style={styles.viewsEntryTitleRow}>
              <Text style={styles.viewsEntryTitle}>ใครมาดูโปรไฟล์คุณบ้าง</Text>
              <View
                style={[
                  styles.viewsCountPill,
                  isPremium ? styles.pillGold : styles.pillRose,
                ]}
              >
                <Text style={styles.viewsCountPillText}>{viewCount} คน</Text>
              </View>
            </View>
            <Text style={styles.viewsEntrySubtitle} numberOfLines={1}>
              {isPremium
                ? "👑 สมาชิก Premium: แตะดูรายชื่อย้อนหลัง 30 วัน"
                : "👀 มีคนแอบสนใจคุณ! แตะเพื่อดูตัวอย่างและปลดล็อก"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.ink} />
        </TouchableOpacity>

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

        {/* Form: Faculty (Campus Matching & Cross-Bubble) */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="school-outline" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>คณะ / สาขาวิชา (Faculty)</Text>
          </View>
          <Text style={styles.fieldHelperText}>
            ช่วยทลาย Social Bubble และค้นหาเพื่อนต่างคณะที่เคมีความคิดตรงกัน
          </Text>

          <View style={styles.facultyChipsContainer}>
            {CAMPUS_FACULTIES.map((fac) => {
              const isSelected = faculty === fac;
              return (
                <TouchableOpacity
                  key={fac}
                  style={[
                    styles.facultyChip,
                    isSelected && styles.facultyChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setFaculty(isSelected ? "" : fac)}
                >
                  <Text
                    style={[
                      styles.facultyChipText,
                      isSelected && styles.facultyChipTextSelected,
                    ]}
                  >
                    {fac}
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
              <GalleryThumbItem
                key={img.id}
                img={img}
                onSelect={() => setSelectedPhoto(img.url)}
                onRemove={() =>
                  removeGalleryImage(img.id, {
                    name: displayName || profile?.name || user?.name || "ผู้ใช้งาน",
                    gender,
                    bio,
                    socialLinks,
                  })
                }
              />
            ))}

            {isUploadingGallery && (
              <View style={[styles.galleryThumbWrapper, styles.galleryUploadingCard]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.galleryUploadingText}>กำลังส่งรูป...</Text>
              </View>
            )}

            {profile.galleryImages.length < 9 && (
              <TouchableOpacity
                style={styles.addThumbBtn}
                activeOpacity={0.8}
                onPress={handleAddGalleryPhoto}
                disabled={isUploadingGallery}
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

        {/* Membership & Developer Sandbox Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <View style={styles.membershipBadge}>
              <Ionicons
                name={isPremium ? "ribbon" : "shield-outline"}
                size={16}
                color={colors.ink}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.membershipBadgeText}>
                {isPremium ? "MINDCLICK GOLD / PREMIUM" : "MINDCLICK FREE"}
              </Text>
            </View>
            {!isPremium ? (
              <TouchableOpacity
                style={styles.upgradeMiniBtn}
                onPress={() => setPaywallVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.upgradeMiniBtnText}>อัปเกรด 👑</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ใช้งานอยู่</Text>
              </View>
            )}
          </View>

          {isPremium && (
            <View style={styles.incognitoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.incognitoTitle}>โหมดซ่อนตัว (Incognito Mode)</Text>
                <Text style={styles.incognitoSub}>
                  {isIncognito
                    ? "เปิดอยู่: ส่องโปรไฟล์คนอื่นได้โดยไม่ทิ้งประวัติ"
                    : "ปิดอยู่: คนอื่นจะเห็นว่าคุณมาดูโปรไฟล์"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.incognitoToggleSwitch,
                  isIncognito && styles.incognitoToggleSwitchActive,
                ]}
                onPress={toggleIncognito}
              >
                <Text style={styles.incognitoToggleSwitchText}>
                  {isIncognito ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dev Mode Sandbox Actions */}
          <View style={styles.sandboxDevBox}>
            <Text style={styles.sandboxTitle}>🛠️ SANDBOX ควบคุมการทดสอบ (DEV MODE)</Text>
            <View style={styles.sandboxBtnRow}>
              <TouchableOpacity
                style={styles.sandboxBtn}
                onPress={() => togglePremiumMock()}
              >
                <Text style={styles.sandboxBtnText}>
                  {isPremium ? "สลับเป็น Free" : "สลับเป็น Premium"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sandboxBtn}
                onPress={addMockProfileView}
              >
                <Text style={styles.sandboxBtnText}>+ จำลองคนมาดู</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Privacy Policy Link */}
        <TouchableOpacity
          style={styles.policyBtn}
          activeOpacity={0.8}
          onPress={() => setShowPolicyModal(true)}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.mutedForeground}
          />
          <Text style={styles.policyText}>
            นโยบายความเป็นส่วนตัว (PDPA Notice)
          </Text>
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

      <PrivacyPolicyModal
        visible={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        mode="view"
      />

      <ProfileViewsModal
        visible={viewsModalVisible}
        onClose={() => setViewsModalVisible(false)}
        onSelectUser={(uid) => {
          navigation.navigate("MatchDetail", { userId: uid });
        }}
      />

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  container: {
    flex: 1,
    backgroundColor: "#fafbfc",
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
  avatarDefaultInitial: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.white,
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
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 45,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryUploadingCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  galleryUploadingText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
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
    backgroundColor: "#f1f5f9",
  },
  galleryThumbBtn: {
    width: "100%",
    height: "100%",
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  galleryThumbError: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 4,
  },
  galleryThumbErrorText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 2,
    textAlign: "center",
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
  policyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.mutedForeground,
    textDecorationLine: "underline",
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
  goldCrownBadge: {
    position: "absolute",
    top: -8,
    right: -4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE600",
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  goldCrownBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.ink,
    marginLeft: 2,
  },
  viewsEntryBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  viewsEntryBannerGold: {
    backgroundColor: "#FEF08A",
  },
  viewsEntryBannerTeaser: {
    backgroundColor: "#FFE4E6",
  },
  viewsEntryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconGold: {
    backgroundColor: colors.white,
  },
  iconRose: {
    backgroundColor: colors.white,
  },
  viewsEntryTextBox: {
    flex: 1,
  },
  viewsEntryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  viewsEntryTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.ink,
    marginRight: 8,
  },
  viewsCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  pillGold: {
    backgroundColor: "#FFE600",
  },
  pillRose: {
    backgroundColor: "#FDA4AF",
  },
  viewsCountPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.ink,
  },
  viewsEntrySubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  membershipCard: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  membershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  membershipBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  upgradeMiniBtn: {
    backgroundColor: "#FFE600",
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  upgradeMiniBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  activePill: {
    backgroundColor: "#BBF7D0",
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  incognitoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  incognitoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  incognitoSub: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  incognitoToggleSwitch: {
    width: 48,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  incognitoToggleSwitchActive: {
    backgroundColor: "#67E8F9",
  },
  incognitoToggleSwitchText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
  },
  sandboxDevBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.ink,
    borderRadius: 8,
    padding: 12,
  },
  sandboxTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#B45309",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sandboxBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sandboxBtn: {
    flex: 0.48,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  sandboxBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
  fieldHelperText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.mutedForeground,
    marginBottom: 12,
    lineHeight: 16,
  },
  facultyChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  facultyChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  facultyChipSelected: {
    backgroundColor: "#FFE600",
    borderWidth: 2,
    borderColor: colors.ink,
  },
  facultyChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  facultyChipTextSelected: {
    fontWeight: "900",
    color: colors.ink,
  },
});
