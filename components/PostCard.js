import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";

export default function PostCard({
  post,
  currentUserId,
  onToggleLike,
  onDelete,
  onAddComment,
  onPressAuthor,
  onPressImage,
}) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const isLiked = (post.likes || []).includes(currentUserId);
  const likesCount = (post.likes || []).length;
  const commentsCount = (post.comments || []).length;
  const isAuthor = post.authorId === currentUserId;

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
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <View style={styles.card}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          activeOpacity={onPressAuthor ? 0.75 : 1}
          onPress={() => onPressAuthor && onPressAuthor(post.authorId)}
          disabled={!onPressAuthor}
        >
          {post.authorAvatar && !avatarError ? (
            <Image
              source={{ uri: post.authorAvatar }}
              style={styles.avatar}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {post.authorName ? post.authorName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}

          <View style={styles.authorMeta}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              {onPressAuthor && (
                <Ionicons name="chevron-forward" size={12} color={colors.mutedForeground} />
              )}
            </View>
            <Text style={styles.createdAt}>{post.createdAt}</Text>
          </View>
        </TouchableOpacity>

        {isAuthor && (
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
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
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
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
          {/* List of comments */}
          {commentsCount > 0 && (
            <View style={styles.commentsList}>
              {post.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentAvatarMini}>
                    <Text style={styles.commentInitial}>
                      {comment.userName ? comment.userName.charAt(0).toUpperCase() : "?"}
                    </Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <View style={styles.commentTopRow}>
                      <Text style={styles.commentAuthorName}>{comment.userName}</Text>
                      <Text style={styles.commentTime}>{comment.createdAt}</Text>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Comment Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="เขียนความคิดเห็น..."
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    height: 220,
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
    marginTop: 4,
  },
  commentsList: {
    marginBottom: 12,
    gap: 10,
  },
  commentItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  commentAvatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e7ff",
    borderWidth: 1,
    borderColor: colors.darkBorder,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  commentInitial: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  commentTime: {
    fontSize: 10,
    color: colors.mutedForeground,
  },
  commentContent: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
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
});
