import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { getActivityLog } from "../../lib/activityLog";
import { LoadingSpinner, EmptyState } from "../../components/ui/LoadingSpinner";

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  login: { label: "Signed in", icon: "log-in-outline", color: "#10B981" },
  logout: { label: "Signed out", icon: "log-out-outline", color: "#6B7280" },
  view_password: { label: "Viewed password", icon: "eye-outline", color: "#F59E0B" },
  add_project: { label: "Added project", icon: "add-circle-outline", color: "#3B82F6" },
  edit_project: { label: "Edited project", icon: "create-outline", color: "#3B82F6" },
  delete_project: { label: "Deleted project", icon: "trash-outline", color: "#EF4444" },
  add_credential: { label: "Added credential", icon: "key-outline", color: "#8B5CF6" },
  view_credential: { label: "Viewed credential", icon: "eye-outline", color: "#F59E0B" },
  delete_credential: { label: "Deleted credential", icon: "trash-outline", color: "#EF4444" },
  add_invoice: { label: "Added invoice", icon: "receipt-outline", color: "#10B981" },
  mark_invoice_paid: { label: "Marked invoice paid", icon: "checkmark-circle-outline", color: "#10B981" },
  upload_file: { label: "Uploaded file", icon: "cloud-upload-outline", color: "#3B82F6" },
  delete_file: { label: "Deleted file", icon: "trash-outline", color: "#EF4444" },
  export_backup: { label: "Exported backup", icon: "download-outline", color: "#3B82F6" },
  import_backup: { label: "Imported backup", icon: "cloud-download-outline", color: "#3B82F6" },
  change_pin: { label: "Changed PIN", icon: "lock-closed-outline", color: "#F59E0B" },
};

export default function ActivityLogScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getActivityLog(100);
    setLogs(data);
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-5 pt-14 pb-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600 mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Activity Log</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {loading ? (
          <LoadingSpinner message="Loading activity log..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No activity yet"
            description="Your actions will be logged here for security"
          />
        ) : (
          logs.map((log, i) => {
            const action = ACTION_LABELS[log.action] || {
              label: log.action,
              icon: "ellipse-outline",
              color: "#6B7280",
            };

            return (
              <View key={log.id || i} className="mb-4">
                <View className="flex-row">
                  <View className="items-center mr-3">
                    <View className="w-9 h-9 rounded-full bg-surface-card items-center justify-center border border-navy-600">
                      <Ionicons name={action.icon as any} size={16} color={action.color} />
                    </View>
                    {i < logs.length - 1 && (
                      <View className="w-px flex-1 bg-navy-600 mt-1" />
                    )}
                  </View>
                  <View className="flex-1 pb-4">
                    <Text className="text-white text-sm">{action.label}</Text>
                    <View className="flex-row items-center mt-1 space-x-2">
                      <Text className="text-muted text-xs">
                        {format(new Date(log.created_at), "MMM d, yyyy · h:mm a")}
                      </Text>
                      {log.device && (
                        <>
                          <Text className="text-muted text-xs">·</Text>
                          <Text className="text-muted text-xs">{log.device}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
