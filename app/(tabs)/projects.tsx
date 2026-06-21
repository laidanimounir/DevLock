import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProjectCard } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/LoadingSpinner";
import { getProjects } from "../../lib/projects";
import type { Database } from "../../types/database";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const FILTER_OPTIONS = {
  status: ["all", "active", "paused", "completed", "maintenance"],
  type: ["all", "mobile", "web", "mixed", "other"],
  payment: ["all", "paid", "partial", "pending"],
};

const SORT_OPTIONS = [
  { key: "date", label: "Date" },
  { key: "name", label: "Name" },
  { key: "income", label: "Income" },
];

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.technologies || []).some((t: string) =>
        t.toLowerCase().includes(search.toLowerCase())
      );
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType = typeFilter === "all" || p.type === typeFilter;
    const matchPayment =
      paymentFilter === "all" || p.payment_status === paymentFilter;
    return matchSearch && matchStatus && matchType && matchPayment;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.project_name.localeCompare(b.project_name);
    if (sortBy === "income")
      return (Number(b.contract_value) || 0) - (Number(a.contract_value) || 0);
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  const hasActiveFilters =
    statusFilter !== "all" || typeFilter !== "all" || paymentFilter !== "all";

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-5 pt-16 pb-4">
        <Text className="text-white text-3xl font-bold mb-4">Projects</Text>

        <View className="flex-row items-center bg-surface-card border border-navy-500 rounded-2xl px-4 py-3 mb-4">
          <Ionicons name="search-outline" size={18} color="#4B5563" style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-white text-base"
            placeholder="Search projects, clients, tech..."
            placeholderTextColor="#4B5563"
            value={search}
            onChangeText={setSearch}
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center space-x-3 mb-2">
          <TouchableOpacity
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              showFilters ? "bg-electric-500/20 border-electric-500" : "bg-surface-card border-navy-500"
            }`}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={showFilters ? "#3B82F6" : "#6B7280"}
              style={{ marginRight: 6 }}
            />
            <Text className={showFilters ? "text-electric-500 text-sm" : "text-muted text-sm"}>
              Filters{hasActiveFilters ? " *" : ""}
            </Text>
          </TouchableOpacity>

          <View className="flex-row ml-auto">
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                className={`px-3 py-2 rounded-xl ${sortBy === opt.key ? "bg-electric-500" : ""}`}
                onPress={() => setSortBy(opt.key)}
              >
                <Text
                  className={`text-xs font-semibold ${sortBy === opt.key ? "text-white" : "text-muted"}`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showFilters && (
          <View className="bg-surface-card rounded-2xl p-4 mb-4 border border-navy-600 space-y-4">
            <View>
              <Text className="text-muted text-xs mb-2 uppercase tracking-wider">Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {FILTER_OPTIONS.status.map((s) => (
                  <TouchableOpacity
                    key={s}
                    className={`px-3 py-2 rounded-lg border ${statusFilter === s ? "bg-electric-500/20 border-electric-500" : "border-navy-500"}`}
                    onPress={() => setStatusFilter(s)}
                  >
                    <Text className={`text-xs capitalize ${statusFilter === s ? "text-electric-500" : "text-muted"}`}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 uppercase tracking-wider">Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {FILTER_OPTIONS.type.map((t) => (
                  <TouchableOpacity
                    key={t}
                    className={`px-3 py-2 rounded-lg border ${typeFilter === t ? "bg-electric-500/20 border-electric-500" : "border-navy-500"}`}
                    onPress={() => setTypeFilter(t)}
                  >
                    <Text className={`text-xs capitalize ${typeFilter === t ? "text-electric-500" : "text-muted"}`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 uppercase tracking-wider">Payment</Text>
              <View className="flex-row flex-wrap gap-2">
                {FILTER_OPTIONS.payment.map((p) => (
                  <TouchableOpacity
                    key={p}
                    className={`px-3 py-2 rounded-lg border ${paymentFilter === p ? "bg-electric-500/20 border-electric-500" : "border-navy-500"}`}
                    onPress={() => setPaymentFilter(p)}
                  >
                    <Text className={`text-xs capitalize ${paymentFilter === p ? "text-electric-500" : "text-muted"}`}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-5">
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-muted text-sm mt-4">Loading projects...</Text>
          </View>
        ) : error ? (
          <ErrorState message={error} onRetry={loadProjects} />
        ) : sorted.length === 0 ? (
          <EmptyState
            title={search ? "No projects found" : "No projects yet"}
            description={
              search
                ? "Try adjusting your search or filters"
                : "Add your first project to get started"
            }
            actionLabel={search ? undefined : "Add Project"}
            onAction={search ? undefined : () => router.push("/project/add")}
          />
        ) : (
          sorted.map((project) => (
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
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
