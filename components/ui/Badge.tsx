import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BadgeVariant = "status" | "payment" | "tech" | "health";

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const variantBgs: Record<BadgeVariant, string> = {
  status: "bg-electric-500/15",
  payment: "bg-gold-500/15",
  tech: "bg-navy-700",
  health: "bg-success/15",
};

const variantTexts: Record<BadgeVariant, string> = {
  status: "text-electric-400",
  payment: "text-gold-400",
  tech: "text-muted-light",
  health: "text-success",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-success/15", text: "text-success" },
  paused: { bg: "bg-gold-500/15", text: "text-gold-400" },
  completed: { bg: "bg-electric-500/15", text: "text-electric-400" },
  maintenance: { bg: "bg-purple-500/15", text: "text-purple-400" },
  paid: { bg: "bg-success/15", text: "text-success" },
  pending: { bg: "bg-gold-500/15", text: "text-gold-400" },
  partial: { bg: "bg-electric-500/15", text: "text-electric-400" },
  overdue: { bg: "bg-red-500/15", text: "text-red-400" },
  up: { bg: "bg-success/15", text: "text-success" },
  down: { bg: "bg-red-500/15", text: "text-red-400" },
  warning: { bg: "bg-gold-500/15", text: "text-gold-400" },
};

export function Badge({ children, variant = "status", color, icon, onPress }: BadgeProps) {
  const lower = children.toLowerCase();
  const statusStyle = variant === "status" || variant === "payment" || variant === "health"
    ? statusColors[lower]
    : null;

  const bgClass = color || statusStyle?.bg || variantBgs[variant];
  const textClass = statusStyle?.text || variantTexts[variant];

  const content = (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${bgClass}`}>
      {icon && (
        <Ionicons
          name={icon}
          size={12}
          color={textClass.replace("text-", "").includes("white") ? "#FFFFFF" : undefined}
          style={{ marginRight: 4 }}
        />
      )}
      <Text className={`text-xs font-semibold capitalize ${textClass}`}>
        {children}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}
