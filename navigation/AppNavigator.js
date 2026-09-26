import "../lib/snackPolyfill";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../lib/theme";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useFeed } from "../context/FeedContext";
import { useCrossBubble } from "../context/CrossBubbleContext";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
import SplashScreen from "../components/SplashScreen";

// Screens
import SignInScreen from "../screens/SignInScreen";
import HomeScreen from "../screens/HomeScreen";
import ResultsScreen from "../screens/ResultsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FeedScreen from "../screens/FeedScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QuizScreen from "../screens/QuizScreen";
import MatchDetailScreen from "../screens/MatchDetailScreen";
import PublicProfileScreen from "../screens/PublicProfileScreen";
import CrossBubbleTabNavigator from "./CrossBubbleTabNavigator";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// แท็บเมนูด้านล่าง 5 แท็บหลัก
function MainTabNavigator({ navigation }) {
  const insets = useSafeAreaInsets();
  const { totalUnreadCount } = useFeed();
  const { targetMainTab } = useCrossBubble();

  React.useEffect(() => {
    if (targetMainTab && targetMainTab !== "HomeTab") {
      navigation.navigate(targetMainTab);
    }
  }, [targetMainTab, navigation]);

  const defaultInitialTab = targetMainTab || "HomeTab";

  return (
    <Tab.Navigator
      key={targetMainTab || "main_tabs"}
      initialRouteName={defaultInitialTab}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1.5,
          borderTopColor: colors.darkBorder,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "800",
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ResultsTab") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "FeedTab") {
            iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
          } else if (route.name === "FavoritesTab") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: "หน้าแรก" }}
      />
      <Tab.Screen
        name="ResultsTab"
        component={ResultsScreen}
        options={{ tabBarLabel: "แมตช์" }}
      />
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{
          tabBarLabel: "ฟีด & แชท",
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.coral,
            color: colors.white,
            fontSize: 9.5,
            fontWeight: "900",
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            lineHeight: 15,
            top: 1,
            paddingHorizontal: 3,
          },
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{ tabBarLabel: "รายการโปรด" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "โปรไฟล์" }}
      />
    </Tab.Navigator>
  );
}

// Navigation แม่แบบ Root Stack
export default function AppNavigator() {
  const { user, isLoading, signOut } = useAuth();
  const { hasAcceptedPolicy, acceptPolicy, isLoadingData } = useData();
  const { isCrossBubbleMode } = useCrossBubble();

  const [splashFinished, setSplashFinished] = useState(false);

  // รับประกันว่าจะเข้าสู่แอปพลิเคชันอย่างแน่นอนภายใน 2.2 วินาที แม้ในสภาพแวดล้อมที่ช้า
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setSplashFinished(true);
    }, 2200);
    return () => clearTimeout(fallbackTimer);
  }, []);

  // แสดงหน้าจอโลโก้ (Splash Screen) ก่อนเข้าสู่แอปพลิเคชัน
  if (!splashFinished) {
    return (
      <SplashScreen
        isReady={!isLoading}
        onFinish={() => setSplashFinished(true)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // เมื่อเข้าสู่ระบบแล้ว
          <Stack.Group>
            {isCrossBubbleMode ? (
              <Stack.Screen
                name="CrossBubbleMain"
                component={CrossBubbleTabNavigator}
                options={{ animation: "fade_from_bottom", animationDuration: 260 }}
              />
            ) : (
              <Stack.Screen
                name="Main"
                component={MainTabNavigator}
                options={{ animation: "fade_from_bottom", animationDuration: 220 }}
              />
            )}
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{
                presentation: "fullScreenModal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="MatchDetail"
              component={MatchDetailScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="PublicProfile"
              component={PublicProfileScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
          </Stack.Group>
        ) : (
          // เมื่อยังไม่ได้เข้าสู่ระบบ
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{
              animationTypeForReplace: "pop",
            }}
          />
        )}
      </Stack.Navigator>

      {/* บังคับอ่านและกดยินยอมนโยบายเมื่อล็อกอินเข้าสู่ระบบ */}
      {Boolean(user && !isLoadingData && !hasAcceptedPolicy) && (
        <PrivacyPolicyModal
          visible={!hasAcceptedPolicy}
          onAccept={acceptPolicy}
          onDecline={signOut}
          mode="consent"
        />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
