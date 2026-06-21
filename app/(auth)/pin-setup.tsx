import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const PIN_LENGTH = 6;
const PIN_KEY = "nexvault_app_pin";

export default function PINSetupScreen() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create" | "confirm" | "success">("create");
  const [error, setError] = useState("");
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometrics();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricSupported(compatible && enrolled);
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleNumberPress = (num: string) => {
    if (step === "success") return;

    const currentPin = step === "create" ? pin : confirmPin;
    const setter = step === "create" ? setPin : setConfirmPin;

    if (currentPin.length < PIN_LENGTH) {
      const newPin = currentPin + num;
      setter(newPin);

      if (newPin.length === PIN_LENGTH) {
        if (step === "create") {
          setTimeout(() => {
            setStep("confirm");
          }, 300);
        } else {
          setTimeout(() => {
            handleConfirm(newPin);
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === "success") return;

    const currentPin = step === "create" ? pin : confirmPin;
    const setter = step === "create" ? setPin : setConfirmPin;

    if (currentPin.length > 0) {
      setter(currentPin.slice(0, -1));
      setError("");
    }
  };

  const handleConfirm = async (enteredPin: string) => {
    if (enteredPin !== pin) {
      setError("PINs don't match. Try again.");
      shake();
      setConfirmPin("");
      setStep("create");
      setPin("");
      return;
    }

    try {
      await SecureStore.setItemAsync(PIN_KEY, pin);
      setStep("success");

      setTimeout(() => {
        router.replace("/(tabs)/dashboard");
      }, 1500);
    } catch {
      setError("Failed to save PIN. Please try again.");
    }
  };

  const renderDots = (count: number, filled: number) => {
    return (
      <View className="flex-row space-x-4 mb-8">
        {Array.from({ length: count }).map((_, i) => (
          <View
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < filled
                ? "bg-electric-500 border-electric-500"
                : "border-navy-500"
            }`}
          />
        ))}
      </View>
    );
  };

  const renderNumpad = () => {
    const rows = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["biometric", "0", "delete"],
    ];

    return (
      <View className="w-full max-w-xs">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center mb-3 space-x-4">
            {row.map((key) => {
              if (key === "biometric" && biometricSupported) {
                return (
                  <TouchableOpacity
                    key={key}
                    className="w-20 h-20 rounded-full items-center justify-center"
                    onPress={async () => {
                      const result = await LocalAuthentication.authenticateAsync({
                        promptMessage: "Authenticate to set up PIN",
                      });
                      if (result.success) {
                        setUseBiometrics(true);
                      }
                    }}
                  >
                    <Ionicons
                      name={useBiometrics ? "finger-print" : "finger-print-outline"}
                      size={28}
                      color={useBiometrics ? "#3B82F6" : "#4B5563"}
                    />
                  </TouchableOpacity>
                );
              }
              if (key === "biometric") {
                return <View key={key} className="w-20 h-20" />;
              }
              if (key === "delete") {
                const currentPin = step === "create" ? pin : confirmPin;
                return (
                  <TouchableOpacity
                    key={key}
                    className="w-20 h-20 rounded-full items-center justify-center"
                    onPress={handleDelete}
                    disabled={currentPin.length === 0}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={24}
                      color={currentPin.length === 0 ? "#1F2B3D" : "#6B7280"}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  className="w-20 h-20 rounded-full bg-surface-card border border-navy-600 items-center justify-center"
                  onPress={() => handleNumberPress(key)}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-2xl font-semibold">{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  if (step === "success") {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center px-8">
        <Animated.View className="items-center" style={{ opacity: fadeAnim }}>
          <View className="w-24 h-24 rounded-full bg-success/20 items-center justify-center mb-8">
            <Ionicons name="lock-closed" size={48} color="#10B981" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            PIN Created
          </Text>
          <Text className="text-muted text-sm text-center">
            Your vault is now secure with three layers of protection
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View
      className="flex-1 bg-navy-900 px-8 justify-center items-center"
      style={{ opacity: fadeAnim }}
    >
      <View className="items-center mb-10">
        <View className="w-16 h-16 rounded-2xl bg-gold-500/20 items-center justify-center mb-6">
          <Ionicons name="lock-closed-outline" size={32} color="#F59E0B" />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">
          {step === "create" ? "Create PIN" : "Confirm PIN"}
        </Text>
        <Text className="text-muted text-sm text-center leading-5">
          {step === "create"
            ? "Create a 6-digit PIN to secure your vault locally. This never leaves your device."
            : "Re-enter your PIN to confirm"}
        </Text>
      </View>

      <Animated.View
        className="items-center"
        style={{ transform: [{ translateX: shakeAnim }] }}
      >
        {error !== "" && (
          <Text className="text-red-400 text-sm mb-4">{error}</Text>
        )}

        {renderDots(PIN_LENGTH, step === "create" ? pin.length : confirmPin.length)}
        {renderNumpad()}

        {biometricSupported && (
          <TouchableOpacity
            className="flex-row items-center mt-6 space-x-2"
            onPress={() => setUseBiometrics(!useBiometrics)}
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                useBiometrics ? "bg-electric-500 border-electric-500" : "border-navy-500"
              }`}
            >
              {useBiometrics && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
            </View>
            <Text className="text-muted text-sm">Use biometric unlock</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}
