import { Platform } from "react-native";

// Polyfill ONLY for Expo Snack Web runtime where Bridgeless mode is enabled without native TurboModules
if (Platform.OS === "web" && typeof globalThis !== "undefined") {
  globalThis["RN$Bridgeless"] = false;
  globalThis["RN$TurboInterop"] = true;
  globalThis["RN$UnifiedNativeModuleProxy"] = true;

  const mockPlatformConstants = {
    isTesting: false,
    isDisableAnimations: false,
    reactNativeVersion: { major: 0, minor: 81, patch: 5, prerelease: null },
    Version: 34,
    Release: "14",
    Serial: "unknown",
    Fingerprint: "generic",
    Model: "Web",
    ServerHost: "localhost:8081",
    uiMode: "normal",
    Brand: "Generic",
    Manufacturer: "Generic",
    forceTouchAvailable: false,
    osVersion: "14.0",
    systemName: "Web",
    interfaceOrientation: "portrait",
  };

  const prevTurboProxy = globalThis.__turboModuleProxy;
  globalThis.__turboModuleProxy = function (name) {
    if (name === "PlatformConstants") {
      return mockPlatformConstants;
    }
    return prevTurboProxy ? prevTurboProxy(name) : null;
  };
}
