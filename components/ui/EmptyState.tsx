import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "folder-open-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-20 h-20 rounded-full bg-navy-700 items-center justify-center mb-6 border border-navy-600">
        <Ionicons name={icon} size={36} color="#4B5563" />
      </View>
      <Text className="text-white text-lg font-semibold mb-2">{title}</Text>
      <Text className="text-muted text-sm text-center leading-5 mb-6">
        {description}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="bg-electric-500 rounded-xl px-6 py-3"
          onPress={onAction}
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
