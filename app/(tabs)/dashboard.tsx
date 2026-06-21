import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { StatCard, ProjectCard } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { getDashboardStats } from "../../lib/projects";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalEarned: 0,
    totalPending: 0,
    overdueInvoices: 0,
    expiringDomains: 0,
    recentProjects: [] as any[],
  });

  const today = format(new Date(), "EEEE, MMMM d");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      // silently fail, show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 pt-16 px-5">
        <LoadingSpinner message="Loading dashboard..." fullScreen />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900">
      <ScrollView
        className="flex-1 px-5 pt-16"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-muted text-sm tracking-wider uppercase">{today}</Text>
            <Text className="text-white text-3xl font-bold mt-1">{greeting}</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap -mx-2 mb-8">
          <View className="w-1/2 px-2 mb-4">
            <StatCard label="Active Projects" value={String(stats.activeProjects)} icon="briefcase-outline" color="#3B82F6" />
          </View>
          <View className="w-1/2 px-2 mb-4">
            <StatCard label="Total Earned" value={`$${stats.totalEarned.toLocaleString()}`} icon="cash-outline" color="#10B981" />
          </View>
          <View className="w-1/2 px-2 mb-4">
            <StatCard label="Pending" value={`$${stats.totalPending.toLocaleString()}`} icon="receipt-outline" color="#F59E0B" />
          </View>
          <View className="w-1/2 px-2 mb-4">
            <StatCard label="Alerts" value={String(stats.overdueInvoices + stats.expiringDomains)} icon="warning-outline" color="#EF4444" />
          </View>
        </View>

        {(stats.overdueInvoices > 0 || stats.expiringDomains > 0) && (
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Alerts</Text>
            {stats.overdueInvoices > 0 && (
              <View className="flex-row items-center bg-warning/5 border border-warning/20 rounded-2xl p-4 mb-3">
                <Ionicons name="receipt-outline" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
                <Text className="text-white text-sm flex-1">{stats.overdueInvoices} overdue invoice(s)</Text>
              </View>
            )}
            {stats.expiringDomains > 0 && (
              <View className="flex-row items-center bg-warning/5 border border-warning/20 rounded-2xl p-4 mb-3">
                <Ionicons name="globe-outline" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
                <Text className="text-white text-sm flex-1">{stats.expiringDomains} domain(s) expiring soon</Text>
              </View>
            )}
          </View>
        )}

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-semibold">Projects</Text>
            {stats.recentProjects.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/(tabs)/projects")}>
                <Text className="text-electric-500 text-sm">See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {stats.recentProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add your first project to start managing your freelance work"
              actionLabel="Add Project"
              onAction={() => router.push("/project/add")}
            />
          ) : (
            stats.recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.project_name}
                client={project.client_name}
                status={project.status}
                type={project.type}
                technologies={project.technologies || []}
                paymentStatus={project.payment_status}
                onPress={() => router.push(`/project/${project.id}`)}
              />
            ))
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-electric-500 items-center justify-center"
        style={{ shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 12 }}
        onPress={() => router.push("/project/add")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
