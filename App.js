import "./lib/snackPolyfill";
import React from "react";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { FeedProvider } from "./context/FeedContext";
import { DilemmaProvider } from "./context/DilemmaContext";
import { PremiumProvider } from "./context/PremiumContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <AuthProvider>
        <DataProvider>
          <FeedProvider>
            <DilemmaProvider>
              <PremiumProvider>
                <StatusBar style="dark" />
                <AppNavigator />
              </PremiumProvider>
            </DilemmaProvider>
          </FeedProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
