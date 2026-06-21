import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../../store/authStore";
import { getActivityLog, type ActivityAction } from "../../lib/activityLog";
import { exportEncryptedBackup, importEncryptedBackup } from "../../lib/backup";
import { Badge } from "../../components/ui/Badge";

const APP_VERSION = "1.0.0";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, label, description, onPress, danger, rightElement }: SettingItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-navy-600"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
        danger ? "bg-red-500/15" : "bg-surface-card"
      }`}>
        <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#6B7280"} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>
          {label}
        </Text>
        {description && (
          <Text className="text-muted text-xs mt-0.5">{description}</Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={16} color="#4B5563" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    loadActivityCount();
  }, []);

  const loadActivityCount = async () => {
    const logs = await getActivityLog(100);
    setActivityCount(logs.length);
  };

  const handleExport = async () => {
    try {
      const backupData = await exportEncryptedBackup();
      Alert.alert(
        "Backup Created",
        `Encrypted backup exported successfully. ${JSON.stringify(backupData).length} bytes of data.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      Alert.alert("Export Failed", error.message || "Could not create backup");
    }
  };

  const handleImport = () => {
    Alert.alert(
      "Import Backup",
      "This will replace all current data with the backup. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            try {
              await importEncryptedBackup({} as any);
              Alert.alert("Success", "Backup imported successfully");
            } catch (error: any) {
              Alert.alert("Import Failed", error.message || "Could not import backup");
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? All local data will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-navy-900">
      <ScrollView className="flex-1 px-5 pt-16">
        <Text className="text-white text-3xl font-bold mb-6">Settings</Text>

        <View className="bg-surface-card rounded-2xl border border-navy-600 mb-6 overflow-hidden">
          <View className="px-5">
            <SettingItem
              icon="lock-closed-outline"
              label="Change PIN"
              description="Update your 6-digit security PIN"
              onPress={() => router.push("/(auth)/pin-setup")}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              label="Two-Factor Authentication"
              description="Manage TOTP authenticator setup"
              onPress={() => router.push("/(auth)/totp-setup")}
            />
            <SettingItem
              icon="finger-print-outline"
              label="Biometric Unlock"
              description="Use Face ID or fingerprint to unlock"
              onPress={() => {}}
              rightElement={
                <View className="w-10 h-6 rounded-full bg-electric-500/20 items-center justify-center">
                  <View className="w-4 h-4 rounded-full bg-electric-500 ml-3" />
                </View>
              }
            />
          </View>
        </View>

        <View className="bg-surface-card rounded-2xl border border-navy-600 mb-6 overflow-hidden">
          <View className="px-5">
            <SettingItem
              icon="document-text-outline"
              label="Activity Log"
              description={`${activityCount} recorded actions`}
              onPress={() => router.push("/settings/activity-log")}
              rightElement={<Badge variant="tech">{String(activityCount)}</Badge>}
            />
            <SettingItem
              icon="key-outline"
              label="Shamir Recovery"
              description="Recover master key using 2 of 3 shares"
              onPress={() => router.push("/(auth)/shamir-recovery")}
            />
          </View>
        </View>

        <View className="bg-surface-card rounded-2xl border border-navy-600 mb-6 overflow-hidden">
          <View className="px-5">
            <SettingItem
              icon="cloud-upload-outline"
              label="Export Backup"
              description="Create encrypted backup of all data"
              onPress={handleExport}
            />
            <SettingItem
              icon="cloud-download-outline"
              label="Import Backup"
              description="Restore from encrypted backup file"
              onPress={handleImport}
            />
          </View>
        </View>

        <View className="bg-surface-card rounded-2xl border border-navy-600 mb-6 overflow-hidden">
          <View className="px-5">
            <SettingItem
              icon="information-circle-outline"
              label="About NexVault"
              description={`Version ${APP_VERSION}`}
              onPress={() => {}}
            />
            <SettingItem
              icon="mail-outline"
              label={user?.email || "Not signed in"}
              description="Your account"
              onPress={() => {}}
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-500/10 border border-red-500/20 rounded-2xl py-4 items-center mb-24"
          onPress={handleSignOut}
        >
          <Text className="text-red-400 font-semibold">Sign Out & Clear Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
