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
        tabBarActiveTintColor: "#818CF8",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderTopWidth: 1,
          borderTopColor: "#1E293B",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "BlindLoungeTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "WhisperWallTab") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "BubbleRadarTab") {
            iconName = focused ? "radio" : "radio-outline";
          } else if (route.name === "MyAliasTab") {
            iconName = focused ? "shield-checkmark" : "shield-checkmark-outline";
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="BlindLoungeTab"
        component={BlindLoungeScreen}
        options={{ tabBarLabel: "ห้องสังสรรค์" }}
      />
      <Tab.Screen
        name="WhisperWallTab"
        component={WhisperWallScreen}
        options={{ tabBarLabel: "กระดานลับ" }}
      />
      <Tab.Screen
        name="BubbleRadarTab"
        component={BubbleRadarScreen}
        options={{ tabBarLabel: "เรดาร์คณะ" }}
      />
      <Tab.Screen
        name="MyAliasTab"
        component={MyAliasScreen}
        options={{ tabBarLabel: "โปรไฟล์ลับ" }}
      />
    </Tab.Navigator>
  );
}
