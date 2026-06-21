import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      router.replace("/(tabs)/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-navy-900"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-2xl bg-electric-500 items-center justify-center mb-6 shadow-lg shadow-electric-500/30">
            <Text className="text-white text-4xl font-bold">N</Text>
          </View>
          <Text className="text-white text-3xl font-bold tracking-widest">
            NexVault
          </Text>
          <Text className="text-muted text-sm mt-2 tracking-wider">
            Developer Vault
          </Text>
        </View>

        <View className="space-y-4">
          {error !== "" && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <Text className="text-red-400 text-center text-sm">{error}</Text>
            </View>
          )}

          <View>
            <Text className="text-muted text-xs mb-2 ml-1 tracking-wider uppercase">
              Email
            </Text>
            <TextInput
              className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white text-base"
              placeholder="Enter your email"
              placeholderTextColor="#4B5563"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-muted text-xs mb-2 ml-1 tracking-wider uppercase">
              Password
            </Text>
            <View className="relative">
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white text-base pr-12"
                placeholder="Enter your password"
                placeholderTextColor="#4B5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-muted text-sm">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`bg-electric-500 rounded-xl py-4 items-center mt-4 shadow-lg shadow-electric-500/30 ${
              loading ? "opacity-70" : ""
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base tracking-wide">
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
