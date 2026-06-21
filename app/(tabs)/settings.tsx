import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-navy-900 items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-surface-card items-center justify-center mb-6">
        <Ionicons name="settings-outline" size={40} color="#4B5563" />
      </View>
      <Text className="text-white text-xl font-semibold mb-2">Settings</Text>
      <Text className="text-muted text-center">
        App settings and security options
      </Text>
    </View>
  );
}
