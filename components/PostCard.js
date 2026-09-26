import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import ReportBlockModal from "./ReportBlockModal";
import ResponsiveMedia from "./ResponsiveMedia";

// ข้อมูลสีสำหรับแต่ละกระทู้ (ไม่มีไอคอน/อิโมจิ)
const TOPIC_CONFIG = {
  movies_series: { label: "หนัง&ซีรีย์", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  hobbies: { label: "งานอดิเรก", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  news: { label: "ข่าวสาร", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
  boardgames: { label: "บอร์ดเกม", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
};

export default function PostCard({
  post,
  currentUserId,
  currentUserProfile,
  currentUserIsBubbleUser,
  onToggleLike,
  onDelete,
  onAddComment,
  onPressAuthor,
  onPressImage,
  onSelectTopic,
}) {
  const { blockUser, submitReport } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { rootId, targetId, userName }
  const [showComments, setShowComments] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [reportModalConfig, setReportModalConfig] = useState({
    visible: false,
    targetType: "post",
    targetId: null,
    targetName: "",
  });
  const inputRef = useRef(null);

  const isLiked = (post.likes || []).includes(currentUserId);
  const likesCount = (post.likes || []).length;
  const commentsCount = (post.comments || []).length;
  const isAuthor = post.authorId === currentUserId;
  const topicConfig = post.topicId ? TOPIC_CONFIG[post.topicId] : null;

  // ตรวจสอบสถานะผู้ใช้ฟองสบู่ (ถ้าเป็นโพสต์ของตนเอง ให้ตรวจจากสถานะปัจจุบันของผู้ใช้)
  const authorIsBubble =
    isAuthor
      ? Boolean(currentUserIsBubbleUser)
      : Boolean(post.authorIsBubbleUser || post.isBubbleUser);

  // โปรไฟล์ผู้โพสต์ (หากเป็นโพสต์ของตนเอง ให้ใช้โปรไฟล์ที่ตั้งไว้ล่าสุดเสมอ)
  const authorDisplayName =
    isAuthor && currentUserProfile?.name
      ? currentUserProfile.name
      : post.authorName || "ผู้ใช้งาน";
  const authorDisplayAvatar =
    isAuthor && currentUserProfile?.image !== undefined
      ? currentUserProfile.image
      : post.authorAvatar || null;

  // ฟังก์ชันช่วยเหลือสำหรับแสดงชื่อและรูปคอมเมนต์
  const getCommentAuthorInfo = (itemUserId, itemUserName, itemUserAvatar, itemIsBubble) => {
    const isCurrentUser = itemUserId === currentUserId;
    const name =
      isCurrentUser && currentUserProfile?.name
        ? currentUserProfile.name
        : itemUserName || "ผู้ใช้งาน";
    const avatar =
      isCurrentUser && currentUserProfile?.image !== undefined
        ? currentUserProfile.image
        : itemUserAvatar || null;
    const isBubble = isCurrentUser ? Boolean(currentUserIsBubbleUser) : Boolean(itemIsBubble);
    return { name, avatar, isBubble };
  };

  const handleDelete = () => {
    Alert.alert(
      "ลบโพสต์",
      "คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: () => onDelete(post.id),
        },
      ]
    );
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText, replyingTo);
    setCommentText("");
    setReplyingTo(null);
  };

  // จัดระเบียบคอมเมนต์เป็น Root Comments และ Replies (สไตล์ Facebook)
  const commentList = post.comments || [];
  const rootComments = [];
  const repliesMap = {};

  const commentMap = new Map();
  commentList.forEach((c) => commentMap.set(c.id, c));

  commentList.forEach((c) => {
    let parentId = c.parentId;
    if (!parentId && c.replyTo?.commentId) {
      const target = commentMap.get(c.replyTo.commentId);
      if (target) {
        parentId = target.parentId || target.id;
      }
    }

    if (parentId && commentMap.has(parentId)) {
      if (!repliesMap[parentId]) {
        repliesMap[parentId] = [];
      }
      repliesMap[parentId].push(c);
    } else {
      rootComments.push(c);
    }
  });

  return (
    <View style={styles.card}>
      {/* Topic Badge if post belongs to a forum topic (#ชื่อกระทู้ คลีนๆ ไม่มีอิโมจิ) */}
      {Boolean(topicConfig) && (
        <TouchableOpacity
          style={[
            styles.topicBadge,
            { backgroundColor: topicConfig.bg, borderColor: topicConfig.border },
          ]}
          activeOpacity={onSelectTopic ? 0.75 : 1}
          onPress={() => onSelectTopic && onSelectTopic(post.topicId)}
          disabled={!onSelectTopic}
        >
          <Text style={[styles.topicBadgeHash, { color: topicConfig.color }]}>#</Text>
          <Text style={[styles.topicBadgeText, { color: topicConfig.color }]}>
            {topicConfig.label}
          </Text>
        </TouchableOpacity>
      )}

      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          activeOpacity={onPressAuthor ? 0.75 : 1}
          onPress={() => onPressAuthor && onPressAuthor(post.authorId)}
          disabled={!onPressAuthor}
        >
          <View
            style={[
              styles.authorAvatarWrapper,
              authorIsBubble && styles.bubbleAvatarWrapper,
            ]}
          >
            {authorDisplayAvatar && !avatarError ? (
              <Image
                source={{ uri: authorDisplayAvatar }}
                style={styles.avatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {authorDisplayName ? authorDisplayName.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
            )}
            {authorIsBubble && (
              <View style={styles.bubbleAvatarMiniBadge}>
                <MaterialCommunityIcons name="chart-bubble" size={10} color={colors.white} />
              </View>
            )}
          </View>

          <View style={styles.authorMeta}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={styles.authorName}>{authorDisplayName}</Text>
              {authorIsBubble && (
                <View style={styles.bubbleTagBadge}>
                  <MaterialCommunityIcons name="chart-bubble" size={12} color="#0284c7" />
                  <Text style={styles.bubbleTagText}>ฟองสบู่</Text>
                </View>
              )}
              {onPressAuthor && (
                <Ionicons name="chevron-forward" size={12} color={colors.mutedForeground} />
              )}
            </View>
            <Text style={styles.createdAt}>{post.createdAt}</Text>
          </View>
        </TouchableOpacity>

        {isAuthor ? (
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.7}
            onPress={() =>
              setReportModalConfig({
                visible: true,
                targetType: "post",
                targetId: post.id,
                targetName: authorDisplayName,
              })
            }
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      <View style={styles.body}>
        <Text style={styles.postText}>{post.content}</Text>

        {Boolean(post.image) && (
          <TouchableOpacity
            style={styles.imageWrapper}
            activeOpacity={onPressImage ? 0.9 : 1}
            onPress={() => onPressImage && onPressImage(post.image)}
            disabled={!onPressImage}
          >
            <ResponsiveMedia
              uri={post.image}
              style={styles.postImage}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Interaction Buttons (Like & Comment) */}
      <View style={styles.interactionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.75}
          onPress={() => onToggleLike(post.id)}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={18}
            color={isLiked ? colors.coral : colors.primary}
          />
          <Text
            style={[
              styles.actionBtnText,
              { color: isLiked ? colors.coral : colors.primary, fontWeight: "800" },
            ]}
          >
            {isLiked ? "ถูกใจแล้ว" : "ถูกใจ"}
          </Text>
          <Text style={styles.countText}>
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.75}
          onPress={() => setShowComments(!showComments)}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={17}
            color={colors.mutedForeground}
          />
          <Text style={styles.countText}>
            {commentsCount} ความคิดเห็น
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          {/* List of comments (สไตล์ Facebook: Root comments + Nested Replies) */}
          {commentsCount > 0 && (
            <View style={styles.commentsList}>
              {rootComments.map((root) => {
                const rootReplies = repliesMap[root.id] || [];
                const { name: rootDisplayName, avatar: rootDisplayAvatar, isBubble: rootIsBubble } =
                  getCommentAuthorInfo(root.userId, root.userName, root.userAvatar, root.isBubbleUser);

                return (
                  <View key={root.id} style={styles.commentThreadWrapper}>
                    {/* Root Comment Row */}
                    <View style={styles.commentRow}>
                      <View style={[styles.commentAvatar, rootIsBubble && styles.commentAvatarBubble]}>
                        {rootDisplayAvatar ? (
                          <Image source={{ uri: rootDisplayAvatar }} style={styles.avatarImg} />
                        ) : (
                          <Text style={styles.avatarInitial}>
                            {rootDisplayName ? rootDisplayName.charAt(0).toUpperCase() : "?"}
                          </Text>
                        )}
                      </View>
                      <View style={styles.commentMainCol}>
                        <View style={styles.commentBubble}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Text style={styles.commentAuthorName}>{rootDisplayName}</Text>
                            {rootIsBubble && (
                              <MaterialCommunityIcons name="chart-bubble" size={11} color="#0284c7" />
                            )}
                          </View>
                          <Text style={styles.commentContent}>{root.content}</Text>
                        </View>
                        {/* Meta Action Row: Time • Reply • Report */}
                        <View style={styles.commentMetaRow}>
                          <Text style={styles.commentTime}>{root.createdAt}</Text>
                          <Text style={styles.commentDot}>•</Text>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                              setReplyingTo({
                                rootId: root.id,
                                targetId: root.id,
                                userName: rootDisplayName || "ผู้ใช้",
                              });
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }}
                          >
                            <Text style={styles.replyActionText}>ตอบกลับ</Text>
                          </TouchableOpacity>
                          {root.userId !== currentUserId && (
                            <>
                              <Text style={styles.commentDot}>•</Text>
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() =>
                                  setReportModalConfig({
                                    visible: true,
                                    targetType: "comment",
                                    targetId: root.id,
                                    targetName: rootDisplayName,
                                  })
                                }
                              >
                                <Text style={styles.reportActionText}>รายงาน</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Nested Replies with Left Connector Line (Facebook Style) */}
                    {rootReplies.length > 0 && (
                      <View style={styles.repliesThreadContainer}>
                        {rootReplies.map((reply) => {
                          const { name: replyDisplayName, avatar: replyDisplayAvatar, isBubble: replyIsBubble } =
                            getCommentAuthorInfo(
                              reply.userId,
                              reply.userName,
                              reply.userAvatar,
                              reply.isBubbleUser
                            );

                          return (
                            <View key={reply.id} style={styles.replyRow}>
                              <View style={[styles.replyAvatar, replyIsBubble && styles.commentAvatarBubble]}>
                                {replyDisplayAvatar ? (
                                  <Image
                                    source={{ uri: replyDisplayAvatar }}
                                    style={styles.replyAvatarImg}
                                  />
                                ) : (
                                  <Text style={styles.replyAvatarInitial}>
                                    {replyDisplayName
                                      ? replyDisplayName.charAt(0).toUpperCase()
                                      : "?"}
                                  </Text>
                                )}
                              </View>
                              <View style={styles.commentMainCol}>
                                <View style={styles.replyBubble}>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Text style={styles.commentAuthorName}>{replyDisplayName}</Text>
                                    {replyIsBubble && (
                                      <MaterialCommunityIcons name="chart-bubble" size={11} color="#0284c7" />
                                    )}
                                  </View>
                                  <Text style={styles.commentContent}>
                                    {reply.replyTo?.userName &&
                                      reply.replyTo.userName !== replyDisplayName && (
                                        <Text style={styles.replyMentionText}>
                                          @{reply.replyTo.userName}{" "}
                                        </Text>
                                      )}
                                    {reply.content}
                                  </Text>
                                </View>
                                {/* Reply Meta Action Row */}
                                <View style={styles.commentMetaRow}>
                                  <Text style={styles.commentTime}>{reply.createdAt}</Text>
                                  <Text style={styles.commentDot}>•</Text>
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                      setReplyingTo({
                                        rootId: root.id,
                                        targetId: reply.id,
                                        userName: replyDisplayName || "ผู้ใช้",
                                      });
                                      if (inputRef.current) {
                                        inputRef.current.focus();
                                      }
                                    }}
                                  >
                                    <Text style={styles.replyActionText}>ตอบกลับ</Text>
                                  </TouchableOpacity>
                                  {reply.userId !== currentUserId && (
                                    <>
                                      <Text style={styles.commentDot}>•</Text>
                                      <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() =>
                                          setReportModalConfig({
                                            visible: true,
                                            targetType: "comment",
                                            targetId: reply.id,
                                            targetName: replyDisplayName,
                                          })
                                        }
                                      >
                                        <Text style={styles.reportActionText}>รายงาน</Text>
                                      </TouchableOpacity>
                                    </>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Replying Status Bar */}
          {Boolean(replyingTo) && (
            <View style={styles.replyingBar}>
              <View style={styles.replyingBarLeft}>
                <Ionicons name="return-down-forward" size={13} color={colors.primary} />
                <Text style={styles.replyingBarText} numberOfLines={1}>
                  กำลังตอบกลับ <Text style={styles.replyingBarUser}>@{replyingTo.userName}</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelReplyBtn}
                onPress={() => setReplyingTo(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}

          {/* Comment Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.commentInput}
              placeholder={replyingTo ? `ตอบกลับ @${replyingTo.userName}...` : "เขียนความคิดเห็น..."}
              placeholderTextColor="#9ca3af"
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleSendComment}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !commentText.trim() && styles.sendBtnDisabled,
              ]}
              disabled={!commentText.trim()}
              onPress={handleSendComment}
              activeOpacity={0.85}
            >
              <Text style={styles.sendBtnText}>ส่ง</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Report and Block Modal */}
      <ReportBlockModal
        visible={reportModalConfig.visible}
        onClose={() =>
          setReportModalConfig((prev) => ({ ...prev, visible: false }))
        }
        targetType={reportModalConfig.targetType}
        targetId={reportModalConfig.targetId}
        targetName={reportModalConfig.targetName}
        onBlockUser={async (targetId, targetName) => {
          if (blockUser) {
            const authorToBlock =
              reportModalConfig.targetType === "post" ? post.authorId : targetId;
            await blockUser(authorToBlock, targetName);
          }
        }}
        onReportSubmitted={async (reportData) => {
          if (submitReport) {
            await submitReport({
              ...reportData,
              postId: post.id,
              postContent: post.content,
            });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topicBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  topicBadgeHash: {
    fontSize: 12,
    fontWeight: "900",
  },
  topicBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    marginBottom: 16,
    padding: 16,
    ...shadows.neo,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  authorAvatarWrapper: {
    position: "relative",
  },
  bubbleAvatarWrapper: {
    padding: 2,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#0284c7",
    backgroundColor: "#e0f2fe",
  },
  bubbleAvatarMiniBadge: {
    position: "absolute",
    bottom: -2,
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
  bubbleTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    gap: 3,
  },
  bubbleTagText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0284c7",
  },
  commentAvatarBubble: {
    borderColor: "#0284c7",
    borderWidth: 2,
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  createdAt: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    fontWeight: "500",
  },
  imageWrapper: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
  },
  postImage: {
    width: "100%",
    backgroundColor: "#f3f4f6",
  },
  interactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
  },
  countText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  commentsSection: {
    marginTop: 6,
  },
  commentsList: {
    marginBottom: 12,
    gap: 12,
  },
  commentThreadWrapper: {
    gap: 6,
  },
  commentRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e7ff",
    borderWidth: 1,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  avatarInitial: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  commentMainCol: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  replyBubble: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 2,
  },
  commentContent: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  replyMentionText: {
    fontWeight: "800",
    color: colors.primary,
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
    marginLeft: 6,
  },
  commentTime: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  commentDot: {
    fontSize: 10,
    color: "#94a3b8",
  },
  replyActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  repliesThreadContainer: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#cbd5e1",
    paddingLeft: 12,
    marginTop: 4,
    gap: 10,
  },
  replyRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e0e7ff",
    borderWidth: 1,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    overflow: "hidden",
  },
  replyAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
  },
  replyAvatarInitial: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  replyingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  replyingBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  replyingBarText: {
    fontSize: 12,
    color: colors.ink,
  },
  replyingBarUser: {
    fontWeight: "800",
    color: colors.primary,
  },
  cancelReplyBtn: {
    padding: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: colors.darkBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.ink,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  sendBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13,
  },
  reportActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
});
