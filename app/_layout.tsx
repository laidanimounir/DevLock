import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import "../global.css";
import { useAuthStore } from "../store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function SplashScreen() {
  return (
    <View className="flex-1 bg-navy-900 items-center justify-center">
      <View className="items-center">
        <View className="relative mb-6">
          <View className="w-20 h-20 rounded-3xl bg-electric-500 items-center justify-center shadow-2xl shadow-electric-500/40">
            <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
          </View>
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold-500 items-center justify-center shadow-lg shadow-gold-500/40">
            <Ionicons name="lock-closed" size={12} color="#0A0F1E" />
          </View>
        </View>
        <Text className="text-white text-3xl font-extrabold tracking-widest mb-2">
          NexVault
        </Text>
        <Text className="text-muted text-xs tracking-[0.3em] uppercase">
          Developer Vault
        </Text>
        <ActivityIndicator size="small" color="#3B82F6" className="mt-10" />
      </View>
    </View>
  );
}

function AppNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0F1E" },
        animation: "slide_from_right",
      }}
    />
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const init = async () => {
      await initialize();
      await new Promise((r) => setTimeout(r, 1500));
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <AppNavigator />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
