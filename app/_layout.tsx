import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await new Promise((r) => setTimeout(r, 1200));
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <View className="items-center">
          <View className="w-16 h-16 rounded-2xl bg-electric-500 items-center justify-center mb-6 shadow-lg shadow-electric-500/30">
            <Text className="text-white text-3xl font-bold">N</Text>
          </View>
          <Text className="text-white text-2xl font-bold tracking-widest">
            NexVault
          </Text>
          <Text className="text-muted text-sm mt-2">Developer Vault</Text>
          <ActivityIndicator
            size="small"
            color="#3B82F6"
            className="mt-8"
          />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0F1E" },
          animation: "slide_from_right",
        }}
      />
    </GestureHandlerRootView>
  );
}
