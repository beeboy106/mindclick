import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  StatusBar,
  Easing,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MINDCLICK_LOGO_URI } from "../lib/brandAssets";

export default function SplashScreen({ isReady = true, onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hasDismissed = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const tryDismiss = () => {
    if (hasDismissed.current) return;
    hasDismissed.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      if (onFinishRef.current) {
        onFinishRef.current();
      }
    });
  };

  useEffect(() => {
    // 1. Entrance animation: Logo fade and scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => {
      // 2. Tagline and subtitle fade in
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }).start();

      // 3. Subtle breathing pulse on logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      ).start();
    });

    // แสดงผลอย่างน้อย 1.8 วินาทีแล้วเปลี่ยนเข้าสู่แอปพลิเคชันโดยอัตโนมัติ
    const timer = setTimeout(() => {
      tryDismiss();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={tryDismiss}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fc" />

      <Animated.View
        style={[
          styles.innerContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Logo Card with subtle glow/shadow */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          <Image
            source={{ uri: MINDCLICK_LOGO_URI }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: contentFadeAnim,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.titleMind}>Mind</Text>
            <Text style={styles.titleClick}>click</Text>
          </View>

          <Text style={styles.tagline}>
            เชื่อมโยงความคิด ทลายกำแพง Social Bubble
          </Text>

          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>PSU COMMUNITY</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Footer Info & Loading Indicator */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            opacity: contentFadeAnim,
          },
        ]}
      >
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
        <Text style={styles.versionText}>มหาวิทยาลัยสงขลานครินทร์</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginBottom: 24,
    padding: 12,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  titleMind: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  titleClick: {
    fontSize: 32,
    fontWeight: "900",
    color: "#3457ff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  badgePill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284c7",
    letterSpacing: 0.8,
  },
  footerContainer: {
    position: "absolute",
    bottom: 48,
    alignItems: "center",
  },
  loadingBar: {
    width: 60,
    height: 3,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 10,
  },
  loadingProgress: {
    width: "60%",
    height: "100%",
    backgroundColor: "#3457ff",
    borderRadius: 2,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
});
