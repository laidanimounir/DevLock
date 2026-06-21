import { View, Text, TextInput, TouchableOpacity, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { recoverMasterKey } from "../../lib/shamir";

export default function ShamirRecoveryScreen() {
  const [share1, setShare1] = useState("");
  const [share2, setShare2] = useState("");
  const [error, setError] = useState("");
  const [recovered, setRecovered] = useState(false);
  const [masterKey, setMasterKey] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRecover = () => {
    setError("");

    if (!share1.trim() || !share2.trim()) {
      setError("Please enter both recovery shares");
      return;
    }

    try {
      const key = recoverMasterKey(share1.trim(), share2.trim());
      setMasterKey(key);
      setRecovered(true);
    } catch {
      setError("Invalid recovery shares. Please check and try again.");
    }
  };

  return (
    <Animated.View
      className="flex-1 bg-navy-900 px-8 justify-center"
      style={{ opacity: fadeAnim }}
    >
      <TouchableOpacity
        className="absolute top-14 left-5 w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {!recovered ? (
        <View>
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-2xl bg-gold-500/20 items-center justify-center mb-6">
              <Ionicons name="key-outline" size={40} color="#F59E0B" />
            </View>
            <Text className="text-white text-2xl font-bold mb-2">
              Recover Master Key
            </Text>
            <Text className="text-muted text-sm text-center leading-5">
              Enter two of your three recovery shares to restore your master encryption key. You need 2 out of 3 shares.
            </Text>
          </View>

          {error !== "" && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 10 }} />
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          )}

          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Recovery Share 1</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white text-sm font-mono"
                placeholder="Paste recovery share 1"
                placeholderTextColor="#4B5563"
                value={share1}
                onChangeText={setShare1}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Recovery Share 2</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white text-sm font-mono"
                placeholder="Paste recovery share 2"
                placeholderTextColor="#4B5563"
                value={share2}
                onChangeText={setShare2}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-electric-500 rounded-2xl py-4 items-center"
            onPress={handleRecover}
          >
            <Text className="text-white font-bold text-base tracking-wider">
              Recover Key
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-success/20 items-center justify-center mb-8">
            <Ionicons name="checkmark-circle" size={56} color="#10B981" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            Key Recovered
          </Text>
          <Text className="text-muted text-sm text-center mb-8">
            Your master encryption key has been successfully recovered. Keep it safe.
          </Text>
          <View className="bg-surface-card rounded-2xl p-4 border border-navy-600 w-full mb-6">
            <Text className="text-muted text-xs mb-1 uppercase tracking-wider">Master Key</Text>
            <Text className="text-white text-sm font-mono" selectable>
              {masterKey}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-electric-500 rounded-2xl py-4 w-full items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}
