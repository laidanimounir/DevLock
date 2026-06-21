import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

export default function DashboardScreen() {
  const today = format(new Date(), "EEEE, MMMM d");

  const stats = [
    {
      label: "Active Projects",
      value: "0",
      icon: "briefcase-outline" as const,
      color: "#3B82F6",
    },
    {
      label: "Monthly Income",
      value: "$0",
      icon: "cash-outline" as const,
      color: "#10B981",
    },
    {
      label: "Pending Invoices",
      value: "0",
      icon: "receipt-outline" as const,
      color: "#F59E0B",
    },
    {
      label: "Alerts",
      value: "0",
      icon: "warning-outline" as const,
      color: "#EF4444",
    },
  ];

  return (
    <View className="flex-1 bg-navy-900">
      <ScrollView className="flex-1 px-5 pt-16">
        <View className="mb-8">
          <Text className="text-muted text-sm tracking-wider uppercase">
            {today}
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">
            Good evening
          </Text>
        </View>

        <View className="flex-row flex-wrap -mx-2 mb-8">
          {stats.map((stat, i) => (
            <View key={i} className="w-1/2 px-2 mb-4">
              <View className="bg-surface-card rounded-2xl p-4 border border-navy-600">
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                  </View>
                </View>
                <Text className="text-white text-2xl font-bold">
                  {stat.value}
                </Text>
                <Text className="text-muted text-xs mt-1">{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mb-4">
          <Text className="text-white text-lg font-semibold mb-4">
            Recent Projects
          </Text>
          <View className="bg-surface-card rounded-2xl border border-navy-600 p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-navy-700 items-center justify-center mb-4">
              <Ionicons name="folder-open-outline" size={32} color="#4B5563" />
            </View>
            <Text className="text-muted text-base mb-2">No projects yet</Text>
            <Text className="text-muted-light text-sm text-center">
              Add your first project to start managing your freelance work
            </Text>
            <TouchableOpacity className="mt-6 bg-electric-500 rounded-xl px-6 py-3 shadow-lg shadow-electric-500/30">
              <Text className="text-white font-semibold">Add Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-electric-500 items-center justify-center shadow-lg shadow-electric-500/40">
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
