import React, { useState } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";

// Shows an entire image while bounding very tall portrait photos on larger screens.
export default function ResponsiveMedia({
  uri,
  style,
  fallbackAspectRatio = 4 / 3,
  maxHeightRatio = 0.62,
  maxHeight = 640,
  onError,
}) {
  const { height: windowHeight } = useWindowDimensions();
  const [frameWidth, setFrameWidth] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(fallbackAspectRatio);
  const naturalHeight = frameWidth ? frameWidth / aspectRatio : 220;
  const frameHeight = Math.min(naturalHeight, windowHeight * maxHeightRatio, maxHeight);

  return (
    <View
      style={[styles.frame, style, { height: frameHeight }]}
      onLayout={(event) => setFrameWidth(event.nativeEvent.layout.width)}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="contain"
        onLoad={(event) => {
          const { width, height } = event.nativeEvent.source || {};
          if (width > 0 && height > 0) setAspectRatio(width / height);
        }}
        onError={onError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
