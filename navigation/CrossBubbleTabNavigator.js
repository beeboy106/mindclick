import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BlindLoungeScreen from "../screens/crossbubble/BlindLoungeScreen";
import OneOnOneScreen from "../screens/crossbubble/OneOnOneScreen";
import MissionsScreen from "../screens/crossbubble/MissionsScreen";
import WhisperWallScreen from "../screens/crossbubble/WhisperWallScreen";
import MyAliasScreen from "../screens/crossbubble/MyAliasScreen";

const Tab = createBottomTabNavigator();

export default function CrossBubbleTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#17171c",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1.5,
          borderTopColor: "#e2e8f0",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "BlindLoungeTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "DarkRoomTab") {
            iconName = focused ? "moon" : "moon-outline";
          } else if (route.name === "MissionsTab") {
            iconName = focused ? "flame" : "flame-outline";
          } else if (route.name === "WhisperWallTab") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "MyAliasTab") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={20} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="BlindLoungeTab"
        component={BlindLoungeScreen}
        options={{ tabBarLabel: "ห้องสังสรรค์" }}
      />
      <Tab.Screen
        name="DarkRoomTab"
        component={OneOnOneScreen}
        options={{ tabBarLabel: "ห้องมืด" }}
      />
      <Tab.Screen
        name="MissionsTab"
        component={MissionsScreen}
        options={{ tabBarLabel: "ภารกิจ" }}
      />
      <Tab.Screen
        name="WhisperWallTab"
        component={WhisperWallScreen}
        options={{ tabBarLabel: "กระดานลับ" }}
      />
      <Tab.Screen
        name="MyAliasTab"
        component={MyAliasScreen}
        options={{ tabBarLabel: "โปรไฟล์" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c7f65a",
    marginTop: 2,
  },
});
