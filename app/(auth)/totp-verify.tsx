import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function TOTPVerifyScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [factors, setFactors] = useState<any[]>([]);

  const { setTOTPVerified } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFactors();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data?.totp) {
      setFactors(data.totp);
    }
  };

  const handleCodeChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length <= 6) {
      setCode(numeric);
      if (numeric.length === 6) {
        setError("");
        handleVerify(numeric);
      }
    }
  };

  const handleVerify = async (verifyCode?: string) => {
    const codeToVerify = verifyCode || code;
    if (codeToVerify.length !== 6) return;

    setVerifying(true);
    setError("");

    try {
      const factor = factors[0];
      if (!factor) {
        setError("No TOTP factor found. Please set up 2FA first.");
        setVerifying(false);
        return;
      }

      const challenge = await supabase.auth.mfa.challenge({
        factorId: factor.id,
      });

      if (challenge.error) {
        setError(challenge.error.message);
        setVerifying(false);
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.data.id,
        code: codeToVerify,
      });

      if (verify.error) {
        setError("Invalid code. Please try again.");
        setCode("");
        setVerifying(false);
        return;
      }

      setTOTPVerified(true);
      router.replace("/(auth)/pin-verify");
    } catch (err: any) {
      setError(err?.message || "Verification failed");
      setCode("");
      setVerifying(false);
    }
  };

  return (
    <Animated.View
      className="flex-1 bg-navy-900 px-8 justify-center"
      style={{ opacity: fadeAnim }}
    >
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-electric-500/20 items-center justify-center mb-6">
          <Ionicons name="shield-checkmark-outline" size={40} color="#3B82F6" />
        </View>
        <Text className="text-white text-3xl font-bold mb-2">
          Two-Factor Auth
        </Text>
        <Text className="text-muted text-sm text-center leading-5">
          Enter the 6-digit code from your authenticator app to continue
        </Text>
      </View>

      {error !== "" && (
        <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex-row items-center">
          <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 10 }} />
          <Text className="text-red-400 text-sm flex-1">{error}</Text>
        </View>
      )}

      <View className="mb-10">
        <TextInput
          className="bg-surface-card border border-navy-500 rounded-2xl px-6 py-5 text-white text-3xl font-bold text-center tracking-[0.3em]"
          placeholder="000000"
          placeholderTextColor="#1F2B3D"
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
        <Text className="text-muted text-center text-xs mt-3 tracking-wider">
          Code auto-submits when complete
        </Text>
      </View>

      {verifying && (
        <View className="items-center">
          <Text className="text-muted text-sm">Verifying code...</Text>
        </View>
      )}

      <TouchableOpacity
        className="items-center mt-12"
        onPress={() => {
          router.back();
        }}
      >
        <Text className="text-electric-500 text-sm tracking-wider">
          Back to Login
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
