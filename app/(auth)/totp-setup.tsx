import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import QRCode from "react-native-qrcode-svg";

export default function TOTPSetupScreen() {
  const [step, setStep] = useState<"loading" | "qrcode" | "verify" | "success">("loading");
  const [factorId, setFactorId] = useState("");
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (enrollError) {
        setError(enrollError.message);
        setStep("loading");
        return;
      }

      if (data?.totp?.qr_code) {
        setQrCodeUri(data.totp.qr_code);
        setFactorId(data.id);
        setStep("qrcode");
        animateIn();
      } else {
        setError("Failed to generate TOTP enrollment. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Enrollment failed");
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message);
        setVerifying(false);
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });

      if (verify.error) {
        setError("Invalid code. Please try again.");
        setVerifying(false);
        return;
      }

      setStep("success");
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        router.replace("/(auth)/pin-setup");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Verification failed");
      setVerifying(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length <= 6) {
      setCode(numeric);
      if (numeric.length === 6) {
        setError("");
      }
    }
  };

  if (step === "loading") {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <Text className="text-muted text-sm">Setting up two-factor authentication...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900 px-8 justify-center">
      <Animated.View
        className="items-center"
        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
      >
        {step === "qrcode" && (
          <>
            <View className="w-16 h-16 rounded-2xl bg-electric-500/20 items-center justify-center mb-8">
              <Ionicons name="qr-code-outline" size={32} color="#3B82F6" />
            </View>

            <Text className="text-white text-2xl font-bold mb-2">
              Two-Factor Authentication
            </Text>
            <Text className="text-muted text-sm text-center mb-8 leading-5">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Text>

            <View className="bg-white p-5 rounded-3xl mb-8 shadow-2xl">
              <QRCode value={qrCodeUri} size={200} backgroundColor="#FFFFFF" />
            </View>

            <Text className="text-muted text-xs mb-1 tracking-wider uppercase">
              Or enter code manually
            </Text>
            <Text className="text-white text-xs font-mono bg-surface-card px-4 py-2 rounded-lg mb-8">
              {qrCodeUri.split("secret=")[1]?.split("&")[0] || ""}
            </Text>

            <TouchableOpacity
              className="bg-electric-500 rounded-2xl py-4 w-full items-center"
              onPress={() => setStep("verify")}
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Text className="text-white font-bold text-base tracking-wider">
                I've Scanned the Code
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "verify" && (
          <>
            <View className="w-16 h-16 rounded-2xl bg-gold-500/20 items-center justify-center mb-8">
              <Ionicons name="key-outline" size={32} color="#F59E0B" />
            </View>

            <Text className="text-white text-2xl font-bold mb-2">
              Verify Code
            </Text>
            <Text className="text-muted text-sm text-center mb-8">
              Enter the 6-digit code from your authenticator app
            </Text>

            {error !== "" && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 w-full mb-6 flex-row items-center">
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 10 }} />
                <Text className="text-red-400 text-sm">{error}</Text>
              </View>
            )}

            <View className="mb-8">
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
            </View>

            <View className="flex-row space-x-4 w-full">
              <TouchableOpacity
                className="flex-1 bg-navy-700 rounded-2xl py-4 items-center border border-navy-500"
                onPress={() => {
                  setCode("");
                  setStep("qrcode");
                }}
              >
                <Text className="text-muted font-semibold">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-2xl py-4 items-center ${
                  verifying || code.length !== 6
                    ? "bg-electric-500/50"
                    : "bg-electric-500"
                }`}
                onPress={handleVerify}
                disabled={verifying || code.length !== 6}
              >
                <Text className="text-white font-bold">
                  {verifying ? "Verifying..." : "Verify"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === "success" && (
          <>
            <View className="w-24 h-24 rounded-full bg-success/20 items-center justify-center mb-8">
              <Ionicons name="checkmark-circle" size={56} color="#10B981" />
            </View>

            <Text className="text-white text-2xl font-bold mb-2">
              TOTP Enabled
            </Text>
            <Text className="text-muted text-sm text-center mb-2">
              Two-factor authentication is now active
            </Text>
            <Text className="text-gold-500 text-xs tracking-wider">
              Setting up PIN protection...
            </Text>
          </>
        )}
      </Animated.View>
    </View>
  );
}
