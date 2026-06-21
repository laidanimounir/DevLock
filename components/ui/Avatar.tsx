import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  uri?: string;
}

const sizeMap = {
  sm: { box: "w-8 h-8 rounded-lg", icon: 16, text: "text-xs" },
  md: { box: "w-11 h-11 rounded-xl", icon: 22, text: "text-base" },
  lg: { box: "w-16 h-16 rounded-2xl", icon: 32, text: "text-xl" },
};

export function Avatar({ name, size = "md", uri }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const s = sizeMap[size];

  return (
    <View className={`${s.box} bg-electric-500/20 items-center justify-center`}>
      {uri ? (
        <View className="w-full h-full rounded-xl bg-electric-500" />
      ) : (
        <View className="flex-row items-center">
          <Text className={`${s.text} text-electric-500 font-bold`}>{initial}</Text>
          <Ionicons name="folder-outline" size={s.icon} color="#3B82F6" style={{ marginLeft: 2 }} />
        </View>
      )}
    </View>
  );
}
