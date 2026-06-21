import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TABS = ["Overview", "Credentials", "Finance", "Files", "Health"] as const;

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
          <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
          <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5">
        <View className="mb-6">
          <View className="flex-row items-center space-x-3 mb-3">
            <View className="w-12 h-12 rounded-xl bg-electric-500/20 items-center justify-center">
              <Ionicons name="folder" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Project Name</Text>
              <Text className="text-muted text-sm">Client Name</Text>
            </View>
            <View className="bg-success/20 px-3 py-1 rounded-full">
              <Text className="text-success text-xs font-semibold">Active</Text>
            </View>
          </View>
        </View>

        <View className="flex-row mb-6 bg-surface-card rounded-2xl p-1 border border-navy-600">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 rounded-xl items-center ${
                tab === "Overview" ? "bg-navy-700" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  tab === "Overview" ? "text-electric-500" : "text-muted"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="space-y-4">
          <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
            <Text className="text-white font-semibold mb-3">Tech Stack</Text>
            <View className="flex-row flex-wrap gap-2">
              {["React Native", "TypeScript", "Supabase"].map((tech) => (
                <View key={tech} className="bg-navy-700 px-3 py-2 rounded-lg border border-navy-500">
                  <Text className="text-electric-400 text-xs">{tech}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
            <Text className="text-white font-semibold mb-3">Project Info</Text>
            <View className="space-y-3">
              <InfoRow icon="calendar-outline" label="Created" value="Jun 2026" />
              <InfoRow icon="time-outline" label="Last Contact" value="2 days ago" />
              <InfoRow icon="globe-outline" label="Domain" value="Expires Dec 2026" />
              <InfoRow icon="server-outline" label="Hosting" value="Expires Jan 2027" />
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon as any} size={16} color="#6B7280" style={{ marginRight: 10 }} />
      <Text className="text-muted text-sm flex-1">{label}</Text>
      <Text className="text-white text-sm">{value}</Text>
    </View>
  );
}
