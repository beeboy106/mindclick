import "./lib/snackPolyfill";
import React from "react";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { DilemmaProvider } from "./context/DilemmaContext";
import { PremiumProvider } from "./context/PremiumContext";
import { FeedProvider } from "./context/FeedContext";
import { CrossBubbleProvider } from "./context/CrossBubbleContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <AuthProvider>
        <DataProvider>
          <DilemmaProvider>
            <PremiumProvider>
              <FeedProvider>
                <CrossBubbleProvider>
                  <StatusBar style="dark" />
                  <AppNavigator />
                </CrossBubbleProvider>
              </FeedProvider>
            </PremiumProvider>
          </DilemmaProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
