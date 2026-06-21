import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getFinancialStats } from "../../lib/projects";
import { EmptyState } from "../../components/ui/EmptyState";

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    monthlyIncome: number[];
    months: string[];
    projectBreakdown: Array<{ name: string; earned: number; pending: number; color: string }>;
  } | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const stats = await getFinancialStats();
      setData(stats);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const maxIncome = data?.monthlyIncome.length
    ? Math.max(...data.monthlyIncome, 1)
    : 1;

  const totalEarned =
    data?.projectBreakdown.reduce((sum, p) => sum + p.earned, 0) || 0;
  const totalPending =
    data?.projectBreakdown.reduce((sum, p) => sum + p.pending, 0) || 0;

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-muted text-sm mt-4">Loading statistics...</Text>
      </View>
    );
  }

  if (!data || (data.monthlyIncome.length === 0 && data.projectBreakdown.length === 0)) {
    return (
      <View className="flex-1 bg-navy-900">
        <Text className="text-white text-3xl font-bold px-5 pt-16 mb-6">Finance</Text>
        <EmptyState
          icon="stats-chart-outline"
          title="No financial data yet"
          description="Add projects and invoices to see your financial insights"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900">
      <ScrollView className="flex-1 px-5 pt-16">
        <Text className="text-white text-3xl font-bold mb-6">Finance</Text>

        <View className="flex-row mb-6 space-x-3">
          <View className="flex-1 bg-surface-card rounded-2xl p-5 border border-navy-600">
            <View className="w-10 h-10 rounded-xl bg-success/15 items-center justify-center mb-3">
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <Text className="text-white text-2xl font-bold">${totalEarned.toLocaleString()}</Text>
            <Text className="text-muted text-xs mt-1">Total Earned</Text>
          </View>
          <View className="flex-1 bg-surface-card rounded-2xl p-5 border border-navy-600">
            <View className="w-10 h-10 rounded-xl bg-gold-500/15 items-center justify-center mb-3">
              <Ionicons name="hourglass-outline" size={20} color="#F59E0B" />
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
            {data.months.map((month, i) => (
              <View key={i} className="items-center flex-1">
                <Text className="text-white text-xs font-semibold mb-1">
                  ${(data.monthlyIncome[i] / 1000).toFixed(1)}k
                </Text>
                <View
                  className="w-8 bg-electric-500 rounded-t-lg"
                  style={{
                    height: data.monthlyIncome[i] > 0 ? Math.max(4, Math.round((data.monthlyIncome[i] / maxIncome) * 120)) : 2,
                    opacity: 0.6 + (i / data.months.length) * 0.4,
                  }}
                />
                <Text className="text-muted text-[10px] mt-2">{month}</Text>
              </View>
            ))}
          </View>
        </View>

        {data.projectBreakdown.length > 0 && (
          <View className="bg-surface-card rounded-2xl p-5 border border-navy-600 mb-6">
            <Text className="text-white font-semibold mb-4">Per Project Breakdown</Text>
            {data.projectBreakdown.map((project, i) => {
              const total = project.earned + project.pending;
              const pct = total > 0 ? (project.earned / total) * 100 : 0;
              return (
                <View key={i} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }} />
                      <Text className="text-white text-sm">{project.name}</Text>
                    </View>
                    <Text className="text-muted text-xs">
                      ${project.earned.toLocaleString()} / ${total.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: project.color }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
