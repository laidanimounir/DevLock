import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-electric-500",
  secondary: "bg-navy-700 border border-navy-500",
  danger: "bg-red-500",
  ghost: "bg-transparent",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  danger: "text-white",
  ghost: "text-electric-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-4 rounded-lg",
  md: "py-3 px-6 rounded-xl",
  lg: "py-4 px-8 rounded-2xl",
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${disabled || loading ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={variant === "primary" && !disabled ? {
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      } : undefined}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "ghost" ? "#3B82F6" : "#FFFFFF"} />
      ) : (
        <View className="flex-row items-center">
          {icon && (
            <Ionicons
              name={icon}
              size={size === "sm" ? 16 : 18}
              color={variant === "ghost" ? "#3B82F6" : "#FFFFFF"}
              style={{ marginRight: children ? 8 : 0 }}
            />
          )}
          <Text className={`${variantTextStyles[variant]} ${sizeTextStyles[size]} font-semibold tracking-wide`}>
            {children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
