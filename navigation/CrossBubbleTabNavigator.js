import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BlindLoungeScreen from "../screens/crossbubble/BlindLoungeScreen";
import WhisperWallScreen from "../screens/crossbubble/WhisperWallScreen";
import BubbleRadarScreen from "../screens/crossbubble/BubbleRadarScreen";
import MyAliasScreen from "../screens/crossbubble/MyAliasScreen";

const Tab = createBottomTabNavigator();

export default function CrossBubbleTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#a3e635",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#090d16",
          borderTopWidth: 1.5,
          borderTopColor: "#1e293b",
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

          if (route.name === "BlindLoungeTab") {
            iconName = focused ? "cafe" : "cafe-outline";
          } else if (route.name === "WhisperWallTab") {
            iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
          } else if (route.name === "BubbleRadarTab") {
            iconName = focused ? "planet" : "planet-outline";
          } else if (route.name === "MyAliasTab") {
            iconName = focused ? "finger-print" : "finger-print-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="BlindLoungeTab"
        component={BlindLoungeScreen}
        options={{ tabBarLabel: "เลานจ์กลุ่ม" }}
      />
      <Tab.Screen
        name="WhisperWallTab"
        component={WhisperWallScreen}
        options={{ tabBarLabel: "กระดานกระซิบ" }}
      />
      <Tab.Screen
        name="BubbleRadarTab"
        component={BubbleRadarScreen}
        options={{ tabBarLabel: "เรดาร์คณะ" }}
      />
      <Tab.Screen
        name="MyAliasTab"
        component={MyAliasScreen}
        options={{ tabBarLabel: "ตัวตนลับ" }}
      />
    </Tab.Navigator>
  );
}
