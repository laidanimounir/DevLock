import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { StatCard, ProjectCard } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonLoader } from "../../components/ui/LoadingSpinner";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), "EEEE, MMMM d");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const alerts = [
    { type: "domain" as const, message: "Domain expires in 15 days", project: "E-Commerce App", icon: "globe-outline" as const },
    { type: "invoice" as const, message: "Invoice overdue by 5 days", project: "Portfolio Site", icon: "receipt-outline" as const },
    { type: "client" as const, message: "No contact in 67 days", project: "Blog Platform", icon: "person-outline" as const },
  ];

  const projects = [
    {
      id: "1",
      name: "E-Commerce Mobile App",
      client: "ShopWave Inc.",
      status: "active",
      type: "mobile",
      technologies: ["React Native", "Supabase", "Stripe"],
      paymentStatus: "partial",
      healthStatus: "up" as const,
    },
    {
      id: "2",
      name: "Portfolio Website",
      client: "Sarah Design Studio",
      status: "active",
      type: "web",
      technologies: ["Next.js", "Tailwind CSS", "Vercel"],
      paymentStatus: "pending",
      healthStatus: "warning" as const,
    },
    {
      id: "3",
      name: "Blog Platform",
      client: "TechWrite Media",
      status: "maintenance",
      type: "web",
      technologies: ["Laravel", "MySQL", "Redis"],
      paymentStatus: "paid",
      healthStatus: "up" as const,
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 px-5 pt-16">
        <View className="mb-8">
          <View className="h-4 w-48 bg-navy-600 rounded-full mb-3" />
          <View className="h-8 w-56 bg-navy-600 rounded-full" />
        </View>
        <View className="flex-row flex-wrap -mx-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-1/2 px-2 mb-4">
              <SkeletonLoader lines={2} />
            </View>
          ))}
        </View>
        <SkeletonLoader lines={4} />
        <SkeletonLoader lines={4} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900">
      <ScrollView
        className="flex-1 px-5 pt-16"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-muted text-sm tracking-wider uppercase">
              {today}
            </Text>
            <Text className="text-white text-3xl font-bold mt-1">
              {greeting}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
          </View>
        </View>

        <View className="flex-row flex-wrap -mx-2 mb-8">
          <View className="w-1/2 px-2 mb-4">
            <StatCard
              label="Active Projects"
              value="3"
              icon="briefcase-outline"
              color="#3B82F6"
              trend="+2 this month"
            />
          </View>
          <View className="w-1/2 px-2 mb-4">
            <StatCard
              label="Monthly Income"
              value="$4,200"
              icon="cash-outline"
              color="#10B981"
              trend="+12% vs last"
            />
          </View>
          <View className="w-1/2 px-2 mb-4">
            <StatCard
              label="Pending Invoices"
              value="$1,800"
              icon="receipt-outline"
              color="#F59E0B"
              trend="2 overdue"
            />
          </View>
          <View className="w-1/2 px-2 mb-4">
            <StatCard
              label="Alerts"
              value="3"
              icon="warning-outline"
              color="#EF4444"
              trend="Needs attention"
            />
          </View>
        </View>

        {alerts.length > 0 && (
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">
              Alerts
            </Text>
            {alerts.map((alert, i) => (
              <TouchableOpacity
                key={i}
                className="flex-row items-center bg-warning/5 border border-warning/20 rounded-2xl p-4 mb-3"
              >
                <View className="w-10 h-10 rounded-xl bg-warning/10 items-center justify-center mr-3">
                  <Ionicons name={alert.icon} size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium">{alert.message}</Text>
                  <Text className="text-muted text-xs mt-0.5">{alert.project}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-semibold">Projects</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/projects")}>
              <Text className="text-electric-500 text-sm">See All</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add your first project to start managing your freelance work"
              actionLabel="Add Project"
              onAction={() => router.push("/project/add")}
            />
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.name}
                client={project.client}
                status={project.status}
                type={project.type}
                technologies={project.technologies}
                paymentStatus={project.paymentStatus}
                healthStatus={project.healthStatus}
                onPress={() => router.push(`/project/${project.id}`)}
              />
            ))
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-electric-500 items-center justify-center"
        style={{
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 12,
        }}
        onPress={() => router.push("/project/add")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
