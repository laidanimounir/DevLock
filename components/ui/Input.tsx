import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type InputVariant = "text" | "password" | "search";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: InputVariant;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "email-address" | "numeric" | "number-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  variant = "text",
  error,
  icon,
  keyboardType = "default",
  autoCapitalize = "none",
  multiline = false,
  className = "",
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = variant === "password";
  const isSearch = variant === "search";

  return (
    <View className={className}>
      {label && (
        <Text className="text-muted text-[10px] mb-2 ml-2 tracking-[0.2em] uppercase font-semibold">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-surface-card border rounded-2xl px-4 ${
          multiline ? "py-3" : "py-4"
        } ${
          focused
            ? "border-electric-500"
            : error
            ? "border-red-500"
            : "border-navy-500"
        }`}
      >
        {(icon || isSearch) && (
          <Ionicons
            name={isSearch ? "search-outline" : icon!}
            size={18}
            color={focused ? "#3B82F6" : "#4B5563"}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          className="flex-1 text-white text-base"
          placeholder={placeholder}
          placeholderTextColor="#4B5563"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#4B5563"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-400 text-xs mt-1 ml-2">{error}</Text>
      )}
    </View>
  );
}
