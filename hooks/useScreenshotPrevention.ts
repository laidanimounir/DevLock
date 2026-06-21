import { useEffect } from "react";
import { Platform, NativeModules } from "react-native";

export function useScreenshotPrevention() {
  useEffect(() => {
    if (Platform.OS === "android") {
      try {
        const Activity = NativeModules.PlatformConstants?.Activity;
        // Prevent screenshots via FLAG_SECURE is handled natively
      } catch {
        // Not available in Expo managed workflow
      }
    }

    if (Platform.OS === "ios") {
      // iOS screenshot prevention requires native modules
      // In Expo managed, we rely on expo-screen-capture (if needed)
    }
  }, []);
}

export function useBackgroundProtection() {
  return {
    hideContent: () => {
      // Called when app goes to background
    },
    showContent: () => {
      // Called when app comes to foreground
    },
  };
}
