import "./lib/snackPolyfill";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
