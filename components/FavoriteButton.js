import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../lib/theme";
import { useData } from "../context/DataContext";

export default function FavoriteButton({ userId, size = "md", style }) {
  const { isFavorite, toggleFavorite } = useData();
  const [loading, setLoading] = useState(false);

  const favorited = isFavorite(userId);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    await toggleFavorite(userId);
    setLoading(false);
  };

  const isSmall = size === "sm";
  const btnSize = isSmall ? 36 : 44;
  const iconSize = isSmall ? 18 : 22;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={loading}
      style={[
        styles.button,
        {
          width: btnSize,
          height: btnSize,
          backgroundColor: favorited ? colors.coral : colors.card,
          borderColor: colors.darkBorder,
        },
        favorited ? shadows.neo : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={favorited ? colors.ink : colors.coral}
        />
      ) : (
        <Ionicons
          name={favorited ? "heart" : "heart-outline"}
          size={iconSize}
          color={favorited ? colors.white : colors.ink}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
});
