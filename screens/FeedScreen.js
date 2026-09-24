import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, shadows } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useFeed, FORUM_TOPICS } from "../context/FeedContext";
import { useCrossBubble } from "../context/CrossBubbleContext";
import PostCard from "../components/PostCard";
import ChatModal from "../components/ChatModal";
import GalleryViewer from "../components/GalleryViewer";
import BubbleUpgradeModal from "../components/BubbleUpgradeModal";
import { usePremium } from "../context/PremiumContext";
import { uploadImageToCloudinary } from "../lib/cloudinary";

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useData();
  const { isBubbleUser, checkAndTriggerWarning } = usePremium();
  const {
    posts,
    isLoading,
    userStatus,
    addPost,
    deletePost,
    toggleLike,
    addComment,
    friends,
    totalUnreadCount,
    dailyPostCount,
    dailyPostLimit,
    remainingPostsToday,
  } = useFeed();

  const [selectedTopic, setSelectedTopic] = useState("all");
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [upgradeModalMode, setUpgradeModalMode] = useState("paywall");
  const [upgradeReason, setUpgradeReason] = useState("");

  const { toggleCrossBubbleMode } = useCrossBubble();
  const scrollOffsetRef = useRef(0);
  const pullAnim = useRef(new Animated.Value(0)).current;
  const [pullDistanceState, setPullDistanceState] = useState(0);
  const [isReadyToRelease, setIsReadyToRelease] = useState(false);

  const PULL_THRESHOLD = 45;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isPullDown = gestureState.dy > 12;
        const isStrictlyVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.8;
        return scrollOffsetRef.current <= 0 && isPullDown && isStrictlyVertical;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          const distance = Math.min(85, Math.max(0, gestureState.dy * 0.6));
          pullAnim.setValue(distance);
          setPullDistanceState(distance);
          setIsReadyToRelease(distance >= PULL_THRESHOLD);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const distance = gestureState.dy * 0.6;
        if (distance >= PULL_THRESHOLD || gestureState.dy >= 60) {
          // หากไม่ใช่ผู้ใช้ฟองสบู่ จะไม่สามารถเข้าสู่โหมด Cross-Bubble ได้
          if (!isBubbleUser) {
            Animated.timing(pullAnim, {
              toValue: 0,
              duration: 180,
              useNativeDriver: false,
            }).start(() => {
              setPullDistanceState(0);
              setIsReadyToRelease(false);
              setUpgradeReason("crossbubble");
              setUpgradeModalMode("paywall");
              setUpgradeModalVisible(true);
            });
            return;
          }

          // ตรวจสอบการแจ้งเตือนสิทธิ์ช่วง 3 วันสุดท้าย
          checkAndTriggerWarning("crossbubble").then((warnRes) => {
            if (warnRes?.shouldWarn) {
              Animated.timing(pullAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: false,
              }).start(() => {
                setPullDistanceState(0);
                setIsReadyToRelease(false);
                setUpgradeModalMode("warning");
                setUpgradeModalVisible(true);
              });
              return;
            }

            // ดีดหน้าขึ้น แล้วเปลี่ยนเข้าสู่โหมด Cross-Bubble ทันที
            Animated.timing(pullAnim, {
              toValue: 0,
              duration: 180,
              useNativeDriver: false,
            }).start(() => {
              setPullDistanceState(0);
              setIsReadyToRelease(false);
              toggleCrossBubbleMode(true);
            });
          });
        } else {
          // ดีดกลับขึ้นไป
          Animated.spring(pullAnim, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: false,
          }).start(() => {
            setPullDistanceState(0);
            setIsReadyToRelease(false);
          });
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pullAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start(() => {
          setPullDistanceState(0);
          setIsReadyToRelease(false);
        });
      },
    })
  ).current;

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = Math.max(0, y);
  };

  const currentTopic =
    FORUM_TOPICS.find((t) => t.id === selectedTopic) || FORUM_TOPICS[0];

  // กรองโพสต์ตามกระทู้ที่เลือก
  const filteredPosts = posts.filter((post) => {
    if (selectedTopic === "all") return true;
    return post.topicId === selectedTopic;
  });

  // นำทางไปยังโปรไฟล์ของผู้โพสต์
  const handlePressAuthor = (authorId) => {
    if (!authorId) return;
    if (authorId === user?.id) {
      navigation.navigate("ProfileTab");
    } else {
      navigation.navigate("MatchDetail", { userId: authorId });
    }
  };

  // ข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
  const displayImage = profile?.image || user?.image || null;
  const displayName = profile?.name || user?.name || "ผู้ใช้งาน";

  // เลือกรูปภาพสำหรับโพสต์
  const handlePickImage = async () => {
    try {
      try {
        const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permResult && permResult.status !== "granted") {
          Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตให้เข้าถึงรูปภาพในตั้งค่าของอุปกรณ์");
          return;
        }
      } catch (permErr) {
        console.warn("Permission check error:", permErr);
      }

      const mediaTypesOption = ImagePicker.MediaTypeOptions?.Images || ["images"];
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypesOption,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPostImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn("handlePickImage error:", e);
      Alert.alert(
        "ไม่สามารถเปิดคลังภาพได้",
        "กรุณาลองแตะอีกครั้ง หรือตรวจสอบการอนุญาตเข้าถึงรูปภาพในตั้งค่าของอุปกรณ์"
      );
    }
  };

  // สร้างโพสต์ (รองรับการโพสต์ลงกระทู้ที่เลือก และจำกัดโควต้าผู้ใช้ปกติ 2 ครั้ง/วัน)
  const handleCreatePost = async () => {
    if (!postText.trim() && !postImage) {
      Alert.alert("แจ้งเตือน", "กรุณาพิมพ์ข้อความหรือเลือกรูปภาพก่อนโพสต์");
      return;
    }

    // ตรวจสอบโควต้าสำหรับผู้ใช้ทั่วไป
    if (!isBubbleUser && dailyPostCount >= (dailyPostLimit || 2)) {
      setUpgradeReason("post_limit");
      setUpgradeModalMode("paywall");
      setUpgradeModalVisible(true);
      return;
    }

    try {
      setIsPosting(true);
      let uploadedImageUrl = null;
      if (postImage) {
        // อัปโหลดรูปภาพขึ้น Cloudinary โฟลเดอร์ mindclick/feed ก่อนสร้างโพสต์
        uploadedImageUrl = await uploadImageToCloudinary(postImage, { folder: "mindclick/feed" });
      }
      await addPost({
        content: postText,
        image: uploadedImageUrl,
        topicId: selectedTopic === "all" ? null : selectedTopic,
        authorName: displayName,
        authorAvatar: displayImage,
      });
      setPostText("");
      setPostImage(null);
      Alert.alert(
        "สำเร็จ",
        selectedTopic === "all"
          ? "แชร์เรื่องราวลงในฟีดเรียบร้อยแล้ว"
          : `แชร์ลงในกระทู้ "${currentTopic.label}" เรียบร้อยแล้ว`
      );
    } catch (e) {
      console.error("handleCreatePost error:", e);
      if (e.code === "DAILY_LIMIT_REACHED" || e.message === "DAILY_LIMIT_REACHED") {
        setUpgradeReason("post_limit");
        setUpgradeModalMode("paywall");
        setUpgradeModalVisible(true);
      } else {
        Alert.alert("เกิดข้อผิดพลาด", e.message || "ไม่สามารถสร้างโพสต์ได้ กรุณาลองใหม่");
      }
    } finally {
      setIsPosting(false);
    }
  };

  // เปิดแชทกับเพื่อนที่ระบุ
  const handleOpenChatWith = (friendId) => {
    setSelectedFriendId(friendId);
    setChatModalVisible(true);
  };

  // เปิดหน้ารายชื่อแชททั้งหมด
  const handleOpenChatList = () => {
    setSelectedFriendId(null);
    setChatModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>
            Mind<Text style={styles.brandTitleAccent}>click</Text>
          </Text>
          <View style={styles.brandBadge}>
            <MaterialCommunityIcons name="cursor-default-click" size={15} color={colors.ink} />
          </View>
        </View>

        {/* Right Header Controls */}
        <View style={styles.headerRightControls}>
          {/* Cross Bubble Switch Button: กรอบสี่เหลี่ยมเขียวมะนาว ชื่อสีขาว */}
          <TouchableOpacity
            style={styles.crossBubbleHeaderBtn}
            activeOpacity={0.8}
            onPress={() => toggleCrossBubbleMode(true)}
          >
            <Ionicons name="moon" size={13} color="#a3e635" />
            <Text style={styles.crossBubbleHeaderBtnText}>Cross Bubble</Text>
          </TouchableOpacity>

          {/* Chat Notification Button */}
          <TouchableOpacity
            style={styles.chatIconBtn}
            activeOpacity={0.8}
            onPress={handleOpenChatList}
          >
            <Ionicons name="chatbubbles-outline" size={22} color={colors.ink} />
            {totalUnreadCount > 0 && userStatus !== "busy" && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>{totalUnreadCount}</Text>
              </View>
            )}
            {userStatus === "busy" && (
              <View style={styles.dndBadgeIcon}>
                <Ionicons name="notifications-off" size={9} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* PanResponder Touch Receiver Area */}
      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        {/* Pull-down Vanish Drawer (Lime to Black Gradient) */}
        <Animated.View
          style={[
            styles.pullDrawerContainer,
            {
              height: pullAnim,
            },
          ]}
        >
          {/* Vertical Lime Green to Deep Black Gradient */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {[
              "#a3e635",
              "#84cc16",
              "#65a30d",
              "#4d7c0f",
              "#365314",
              "#1e3110",
              "#142211",
              "#0e1919",
              "#090f19",
              "#090d16",
            ].map((c, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: c }} />
            ))}
          </View>

          {/* Drawer Content with Instructions */}
          <View style={styles.pullDrawerContent}>
            <View
              style={[
                styles.pullDrawerBadge,
                isReadyToRelease && styles.pullDrawerBadgeReady,
              ]}
            >
              <Ionicons
                name={isReadyToRelease ? "sparkles" : "arrow-down"}
                size={16}
                color={isReadyToRelease ? "#a3e635" : "#090d16"}
              />
            </View>

            <View style={styles.pullDrawerTextCol}>
              <Text style={styles.pullDrawerTitle}>
                {isReadyToRelease
                  ? "ปล่อยนิ้วเพื่อเข้าสู่โหมด Cross-Bubble"
                  : "ดึงลงเพื่อเข้าสู่โหมด Cross-Bubble"}
              </Text>
              <Text style={styles.pullDrawerDesc}>
                {isReadyToRelease
                  ? "ปล่อยเพื่อเข้าสู่ห้องสังสรรค์ลับและโหมดข้ามคณะทันที"
                  : "ดึงหน้าจอลงอีกนิดเพื่อเปิดใช้งานโหมดลับข้ามคณะ"}
              </Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          overScrollMode="never"
          bounces={false}
        >
          {/* SECTION 1: Friends Online / Chat Quick Access Bar */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsSectionHeader}>
            <Text style={styles.sectionTitle}>เพื่อนที่เคยคุยด้วย</Text>
            <TouchableOpacity onPress={handleOpenChatList}>
              <Text style={styles.seeAllText}>เปิดแชททั้งหมด</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsScroll}
          >
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendBubble}
                activeOpacity={0.8}
                onPress={() => handleOpenChatWith(friend.id)}
              >
                <View
                  style={[
                    styles.friendBubbleAvatarWrapper,
                    friend.isBubbleUser && styles.friendBubbleAvatarWrapperBubble,
                  ]}
                >
                  {friend.avatar ? (
                    <Image
                      source={{ uri: friend.avatar }}
                      style={styles.friendBubbleAvatar}
                    />
                  ) : (
                    <View style={styles.friendBubbleAvatarFallback}>
                      <Text style={styles.friendBubbleInitial}>
                        {friend.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {friend.isBubbleUser && (
                    <View style={styles.friendBubbleMiniBadge}>
                      <MaterialCommunityIcons name="chart-bubble" size={10} color={colors.white} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.friendStatusIndicator,
                      {
                        backgroundColor:
                          friend.status === "online"
                            ? "#22c55e"
                            : friend.status === "busy"
                            ? "#ef4444"
                            : "#9ca3af",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.friendBubbleName} numberOfLines={1}>
                  {friend.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SECTION 3: Post Creator Card (Matching Top Box from Reference) */}
        <View style={styles.createCard}>
          <View style={styles.createCardHeaderRow}>
            <Text style={styles.createCardHeader}>
              {selectedTopic === "all"
                ? "แชร์เรื่องราวของคุณ"
                : `แชร์ในกระทู้: ${currentTopic.label}`}
            </Text>
            {selectedTopic !== "all" && (
              <TouchableOpacity
                style={styles.resetTopicBtn}
                activeOpacity={0.7}
                onPress={() => setSelectedTopic("all")}
              >
                <Text style={styles.resetTopicBtnText}>สลับไปฟีดปกติ</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.createInputRow}>
            {displayImage && !avatarError ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.inputAvatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.inputAvatarFallback}>
                <Text style={styles.inputAvatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.postTextInput}
              placeholder={
                selectedTopic !== "all" && currentTopic.placeholder
                  ? currentTopic.placeholder
                  : "แชร์อะไรกับเพื่อนของคุณ..."
              }
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={1000}
              value={postText}
              onChangeText={setPostText}
            />
          </View>

          {/* Attached Image Preview */}
          {Boolean(postImage) && (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: postImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setPostImage(null)}
              >
                <Ionicons name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.createActionsRow}>
            <TouchableOpacity
              style={styles.photoAttachBtn}
              activeOpacity={0.8}
              onPress={handlePickImage}
            >
              <Ionicons name="image-outline" size={20} color={colors.primary} />
              <Text style={styles.photoAttachText}>
                {postImage ? "เปลี่ยนรูป" : "แนบรูปภาพ"}
              </Text>
            </TouchableOpacity>

            <View style={styles.rightCreateControls}>
              <Text style={styles.charCount}>{postText.length}/1000</Text>
              <TouchableOpacity
                style={[
                  styles.postSubmitBtn,
                  (!postText.trim() && !postImage) || isPosting
                    ? styles.postSubmitBtnDisabled
                    : null,
                ]}
                disabled={(!postText.trim() && !postImage) || isPosting}
                activeOpacity={0.85}
                onPress={handleCreatePost}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.postSubmitBtnText}>โพสต์</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION: Forum Topic Choice Chips (ไม่มีไอคอน/อิโมจิ เพื่อความคลีนและเป็นมืออาชีพ) */}
        <View style={styles.topicsSection}>
          <View style={styles.topicsSectionHeader}>
            <Text style={styles.topicsTitle}>กระทู้พูดคุย</Text>
            <Text style={styles.topicsHint}>แตะเพื่อเลือกกระทู้</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicsScroll}
          >
            {FORUM_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.id;
              const topicPostCount = posts.filter((p) =>
                topic.id === "all" ? true : p.topicId === topic.id
              ).length;

              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicChip,
                    isSelected && styles.topicChipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTopic(topic.id)}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      isSelected && styles.topicChipTextActive,
                    ]}
                  >
                    {topic.label}
                  </Text>
                  <View
                    style={[
                      styles.topicCountBadge,
                      isSelected && styles.topicCountBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.topicCountText,
                        isSelected && styles.topicCountTextActive,
                      ]}
                    >
                      {topicPostCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SECTION 4: Feed List Header */}
        <View style={styles.feedHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.feedSectionTitle}>
              {selectedTopic === "all"
                ? "เรื่องราวล่าสุดในฟีด"
                : `กระทู้: ${currentTopic.label}`}
            </Text>
            {selectedTopic !== "all" && Boolean(currentTopic.description) && (
              <Text style={styles.feedSectionSubtitle}>
                {currentTopic.description}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert("รีเฟรช", "อัปเดตข้อมูลโพสต์ล่าสุดแล้ว");
            }}
          >
            <Ionicons name="refresh" size={14} color={colors.ink} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Ionicons
              name={selectedTopic === "all" ? "newspaper-outline" : "chatbubbles-outline"}
              size={48}
              color={colors.mutedForeground}
            />
            <Text style={styles.emptyFeedText}>
              {selectedTopic === "all"
                ? "ยังไม่มีเรื่องราวใหม่ในฟีด"
                : `ยังไม่มีโพสต์ในกระทู้ ${currentTopic.label}`}
            </Text>
            <Text style={styles.emptyFeedSubtext}>
              {selectedTopic === "all"
                ? "เป็นคนแรกที่เริ่มแชร์เรื่องราวให้กับเพื่อนๆ"
                : "เป็นคนแรกที่เริ่มเปิดประเด็นในกระทู้นี้เลย"}
            </Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id || "guest"}
              currentUserProfile={profile}
              currentUserIsBubbleUser={isBubbleUser}
              onToggleLike={toggleLike}
              onDelete={deletePost}
              onAddComment={addComment}
              onPressAuthor={handlePressAuthor}
              onPressImage={(imgUri) => setSelectedPhoto(imgUri)}
              onSelectTopic={(tId) => setSelectedTopic(tId)}
            />
          ))
        )}
      </ScrollView>
      </View>

      {/* Fullscreen Photo Viewer */}
      <GalleryViewer
        visible={Boolean(selectedPhoto)}
        imageUrl={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {/* Chat Modal */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        initialFriendId={selectedFriendId}
      />

      {/* Bubble User Upgrade Modal */}
      <BubbleUpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
        mode={upgradeModalMode}
        featureReason={upgradeReason}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  headerRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  crossBubbleHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#090d16",
    borderWidth: 1.5,
    borderColor: "#a3e635",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 4,
  },
  crossBubbleHeaderBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  pullDrawerContainer: {
    width: "100%",
    backgroundColor: "#090d16",
    justifyContent: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1e293b",
    overflow: "hidden",
  },
  pullDrawerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  pullDrawerBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#a3e635",
    alignItems: "center",
    justifyContent: "center",
  },
  pullDrawerBadgeReady: {
    backgroundColor: "#090d16",
    borderWidth: 1.5,
    borderColor: "#a3e635",
  },
  pullDrawerTextCol: {
    flex: 1,
  },
  pullDrawerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  pullDrawerDesc: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  chatIconBtn: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeCount: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.coral,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900",
  },
  dndBadgeIcon: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: "#fafbfc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    marginBottom: 20,
    overflow: "hidden",
    ...shadows.neo,
  },
  userCardCover: {
    height: 56,
    backgroundColor: "#e0e7ff",
  },
  userCardAvatarRow: {
    alignItems: "center",
    marginTop: -36,
  },
  userAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.card,
  },
  userAvatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarInitial: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
  },
  userCardInfo: {
    padding: 16,
    alignItems: "center",
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 2,
  },
  userEmailText: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  statusPillActiveGreen: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  statusPillActiveRed: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },
  statusPillActiveGray: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  statusTextActive: {
    color: colors.ink,
  },
  metaPillsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  metaPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaPillTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  metaPillSubtitle: {
    fontSize: 10,
    color: colors.mutedForeground,
  },
  friendsSection: {
    marginBottom: 20,
  },
  friendsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  friendsScroll: {
    gap: 14,
    paddingVertical: 4,
  },
  friendBubble: {
    alignItems: "center",
    width: 58,
  },
  friendBubbleAvatarWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  friendBubbleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  friendBubbleAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  friendBubbleInitial: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  friendStatusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  friendBubbleName: {
    fontSize: 11,
    color: colors.ink,
    fontWeight: "600",
    textAlign: "center",
  },
  createCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    padding: 16,
    marginBottom: 20,
    ...shadows.neo,
  },
  createCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  createCardHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  resetTopicBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resetTopicBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  createInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  inputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  inputAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  inputAvatarInitial: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  postTextInput: {
    flex: 1,
    minHeight: 70,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: "#f9fafb",
    textAlignVertical: "top",
  },
  imagePreviewWrapper: {
    position: "relative",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  imagePreview: {
    width: "100%",
    height: 180,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  createActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  photoAttachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  photoAttachText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  rightCreateControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  charCount: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  postSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  postSubmitBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  postSubmitBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13,
  },
  topicsSection: {
    marginBottom: 18,
  },
  topicsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  topicsHint: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  topicsScroll: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...shadows.neo,
  },
  topicChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.darkBorder,
  },
  topicChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  topicChipTextActive: {
    color: colors.white,
  },
  topicCountBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  topicCountBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  topicCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
  topicCountTextActive: {
    color: colors.white,
  },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  feedSectionSubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyFeed: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 8,
  },
  emptyFeedText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  emptyFeedSubtext: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  friendBubbleAvatarWrapperBubble: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#0284c7",
    backgroundColor: "#e0f2fe",
  },
  friendBubbleMiniBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#0284c7",
    borderWidth: 1.5,
    borderColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
});
