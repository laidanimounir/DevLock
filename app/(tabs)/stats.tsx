import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const monthlyIncome = [3200, 4500, 2800, 5200, 3800, 4200];
const maxIncome = Math.max(...monthlyIncome);

const projects = [
  { name: "E-Commerce App", earned: 6000, pending: 6000, color: "#3B82F6" },
  { name: "Portfolio Site", earned: 2000, pending: 2000, color: "#10B981" },
  { name: "Blog Platform", earned: 3000, pending: 0, color: "#F59E0B" },
  { name: "Delivery Tracker", earned: 1500, pending: 3500, color: "#8B5CF6" },
];

const totalEarned = projects.reduce((sum, p) => sum + p.earned, 0);
const totalPending = projects.reduce((sum, p) => sum + p.pending, 0);

export default function StatsScreen() {
  return (
    <View className="flex-1 bg-navy-900">
      <ScrollView className="flex-1 px-5 pt-16">
        <Text className="text-white text-3xl font-bold mb-6">Finance</Text>

        <View className="flex-row mb-6 space-x-3">
          <View className="flex-1 bg-surface-card rounded-2xl p-5 border border-navy-600">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-success/15 items-center justify-center">
                <Ionicons name="trending-up" size={20} color="#10B981" />
              </View>
            </View>
            <Text className="text-white text-2xl font-bold">${totalEarned.toLocaleString()}</Text>
            <Text className="text-muted text-xs mt-1">Total Earned</Text>
          </View>
          <View className="flex-1 bg-surface-card rounded-2xl p-5 border border-navy-600">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-gold-500/15 items-center justify-center">
                <Ionicons name="hourglass-outline" size={20} color="#F59E0B" />
              </View>
            </View>
            <Text className="text-white text-2xl font-bold">${totalPending.toLocaleString()}</Text>
            <Text className="text-muted text-xs mt-1">Pending</Text>
          </View>
        </View>

        <View className="bg-surface-card rounded-2xl p-5 border border-navy-600 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-semibold">Monthly Income</Text>
            <Text className="text-muted text-xs">Last 6 months</Text>
          </View>

          <View className="flex-row items-end justify-between h-40">
            {MONTHS.map((month, i) => (
              <View key={month} className="items-center flex-1">
                <Text className="text-white text-xs font-semibold mb-1">
                  ${(monthlyIncome[i] / 1000).toFixed(1)}k
                </Text>
                <View
                  className="w-8 bg-electric-500 rounded-t-lg"
                  style={{
                    height: `${(monthlyIncome[i] / maxIncome) * 120}px`,
                    opacity: 0.6 + (i / MONTHS.length) * 0.4,
                  }}
                />
                <Text className="text-muted text-[10px] mt-2">{month}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-surface-card rounded-2xl p-5 border border-navy-600 mb-6">
          <Text className="text-white font-semibold mb-4">Per Project Breakdown</Text>
          {projects.map((project, i) => (
            <View key={i} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }} />
                  <Text className="text-white text-sm">{project.name}</Text>
                </View>
                <Text className="text-muted text-xs">
                  ${project.earned.toLocaleString()} / ${(project.earned + project.pending).toLocaleString()}
                </Text>
              </View>
              <View className="h-2 bg-navy-700 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${project.pending === 0 ? 100 : (project.earned / (project.earned + project.pending)) * 100}%`,
                    backgroundColor: project.color,
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
