import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { signIn, isLoading } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    const result = await signIn(email.trim(), password);

    if (result.error) {
      setError(result.error);
    } else {
      router.replace("/(tabs)/dashboard");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-navy-900"
    >
      <View className="flex-1 justify-center px-8">
        <Animated.View
          className="items-center mb-14"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: logoScale }],
          }}
        >
          <View className="relative mb-6">
            <View className="w-24 h-24 rounded-3xl bg-gradient-to-br from-electric-500 to-blue-600 items-center justify-center shadow-2xl shadow-electric-500/40">
              <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
            </View>
            <View className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gold-500 items-center justify-center shadow-lg shadow-gold-500/40">
              <Ionicons name="lock-closed" size={14} color="#0A0F1E" />
            </View>
          </View>

          <Text className="text-white text-4xl font-extrabold tracking-widest">
            NexVault
          </Text>
          <View className="flex-row items-center mt-2 space-x-2">
            <View className="w-5 h-px bg-electric-500" />
            <Text className="text-muted text-xs tracking-[0.3em] uppercase">
              Developer Vault
            </Text>
            <View className="w-5 h-px bg-electric-500" />
          </View>
        </Animated.View>

        <Animated.View
          className="space-y-5"
          style={{
            opacity: formFade,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {error !== "" && (
            <Animated.View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex-row items-center">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#EF4444"
                style={{ marginRight: 10 }}
              />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
            </Animated.View>
          )}

          <View>
            <Text className="text-muted text-[10px] mb-2 ml-2 tracking-[0.2em] uppercase font-semibold">
              Email Address
            </Text>
            <View className="bg-surface-card border border-navy-500 rounded-2xl px-5 py-4 flex-row items-center">
              <Ionicons
                name="mail-outline"
                size={18}
                color="#4B5563"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-white text-base"
                placeholder="developer@example.com"
                placeholderTextColor="#4B5563"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View>
            <Text className="text-muted text-[10px] mb-2 ml-2 tracking-[0.2em] uppercase font-semibold">
              Password
            </Text>
            <View className="bg-surface-card border border-navy-500 rounded-2xl px-5 py-4 flex-row items-center">
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#4B5563"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-white text-base"
                placeholder="Enter your password"
                placeholderTextColor="#4B5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#4B5563"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mt-6 ${
              isLoading ? "bg-electric-500/70" : "bg-electric-500"
            }`}
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 12,
            }}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <View className="flex-row items-center space-x-2">
                <Text className="text-white font-bold text-base tracking-wider">
                  Authenticating
                </Text>
                <Text className="text-white/60">...</Text>
              </View>
            ) : (
              <View className="flex-row items-center space-x-2">
                <Text className="text-white font-bold text-base tracking-wider">
                  Unlock Vault
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View className="items-center pb-10">
        <Text className="text-muted text-xs tracking-wider">
          Secure · Encrypted · Professional
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
