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
import { CrossBubbleProvider } from "./context/CrossBubbleContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <AuthProvider>
        <DataProvider>
          <FeedProvider>
            <DilemmaProvider>
              <PremiumProvider>
                <CrossBubbleProvider>
                  <StatusBar style="dark" />
                  <AppNavigator />
                </CrossBubbleProvider>
              </PremiumProvider>
            </DilemmaProvider>
          </FeedProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
