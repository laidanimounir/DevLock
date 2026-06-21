import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  AppState,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuthStore } from "../../store/authStore";

const PIN_LENGTH = 6;
const PIN_KEY = "nexvault_app_pin";
const AUTO_LOCK_MS = 5 * 60 * 1000;

export default function PINVerifyScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const { setPINVerified, signOut } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lastActiveRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    tryBiometrics();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current.match(/active/) && nextState.match(/inactive|background/)) {
        lastActiveRef.current = Date.now();
      }
      if (nextState === "active" && appStateRef.current.match(/inactive|background/)) {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= AUTO_LOCK_MS) {
          setPINVerified(false);
        }
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  const tryBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock NexVault",
          fallbackLabel: "Use PIN",
        });
        if (result.success) {
          setPINVerified(true);
          router.replace("/(tabs)/dashboard");
        }
      }
    } catch {
      // Biometrics failed, fall back to PIN
    }
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

  const handleNumberPress = async (num: string) => {
    if (locked) return;

    const newPin = pin + num;
    if (newPin.length < PIN_LENGTH) {
      setPin(newPin);
    } else {
      setPin(newPin);
      await verifyPin(newPin);
    }
  };

  const handleDelete = () => {
    if (locked) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError("");
    }
  };

  const verifyPin = async (enteredPin: string) => {
    try {
      const storedPin = await SecureStore.getItemAsync(PIN_KEY);

      if (enteredPin === storedPin) {
        setPINVerified(true);
        router.replace("/(tabs)/dashboard");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
        shake();
        setPin("");

        if (newAttempts >= 3) {
          setLocked(true);
          setLockTimer(30);

          const interval = setInterval(() => {
            setLockTimer((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setLocked(false);
                setAttempts(0);
                setError("");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch {
      setError("Failed to verify PIN");
      setPin("");
    }
  };

  const renderDots = (filled: number) => {
    return (
      <View className="flex-row space-x-4 mb-10">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            className={`w-5 h-5 rounded-full border-2 ${
              i < filled
                ? "bg-electric-500 border-electric-500 shadow-lg shadow-electric-500/30"
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
      ["", "0", "delete"],
    ];

    return (
      <View className="w-full max-w-xs">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center mb-3 space-x-6">
            {row.map((key) => {
              if (key === "") {
                return <View key="empty" className="w-16 h-16" />;
              }
              if (key === "delete") {
                return (
                  <TouchableOpacity
                    key={key}
                    className="w-16 h-16 rounded-full items-center justify-center"
                    onPress={handleDelete}
                    disabled={pin.length === 0 || locked}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={22}
                      color={pin.length === 0 || locked ? "#1F2B3D" : "#6B7280"}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  className={`w-16 h-16 rounded-full items-center justify-center ${
                    locked ? "opacity-30" : ""
                  }`}
                  onPress={() => handleNumberPress(key)}
                  disabled={locked}
                  activeOpacity={0.7}
                >
                  <View className="w-16 h-16 rounded-full bg-surface-card border border-navy-600 items-center justify-center">
                    <Text className="text-white text-2xl font-semibold">{key}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      className="flex-1 bg-navy-900 px-8 justify-center items-center"
      style={{ opacity: fadeAnim }}
    >
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-electric-500 items-center justify-center mb-6 shadow-lg shadow-electric-500/30">
          <Ionicons name="lock-closed" size={36} color="#FFFFFF" />
        </View>
        <Text className="text-white text-xl font-bold mb-2">
          {locked ? "Too Many Attempts" : "Enter PIN"}
        </Text>
        <Text className="text-muted text-sm text-center leading-5">
          {locked
            ? `Please wait ${lockTimer} seconds before trying again`
            : "Enter your 6-digit PIN to unlock the vault"}
        </Text>
      </View>

      <Animated.View
        className="items-center"
        style={{ transform: [{ translateX: shakeAnim }] }}
      >
        {error !== "" && (
          <Text className="text-red-400 text-sm mb-4">{error}</Text>
        )}

        {renderDots(pin.length)}
        {renderNumpad()}
      </Animated.View>

      <TouchableOpacity
        className="mt-12 items-center"
        onPress={() => {
          signOut();
          router.replace("/(auth)/login");
        }}
      >
        <Text className="text-muted text-sm tracking-wider">Sign Out</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
