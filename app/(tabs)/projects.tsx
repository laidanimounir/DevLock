import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProjectCard } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";

const MOCK_PROJECTS = [
  { id: "1", name: "E-Commerce Mobile App", client: "ShopWave Inc.", status: "active", type: "mobile", technologies: ["React Native", "Supabase", "Stripe"], paymentStatus: "partial", healthStatus: "up" as const },
  { id: "2", name: "Portfolio Website", client: "Sarah Design Studio", status: "active", type: "web", technologies: ["Next.js", "Tailwind CSS"], paymentStatus: "pending", healthStatus: "warning" as const },
  { id: "3", name: "Blog Platform", client: "TechWrite Media", status: "maintenance", type: "web", technologies: ["Laravel", "MySQL"], paymentStatus: "paid", healthStatus: "up" as const },
  { id: "4", name: "Delivery Tracker", client: "QuickShip LLC", status: "paused", type: "mixed", technologies: ["Flutter", "Firebase"], paymentStatus: "partial", healthStatus: "down" as const },
  { id: "5", name: "Analytics Dashboard", client: "DataFlow Corp", status: "completed", type: "web", technologies: ["React", "Python", "AWS"], paymentStatus: "paid", healthStatus: "up" as const },
];

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType = typeFilter === "all" || p.type === typeFilter;
    const matchPayment = paymentFilter === "all" || p.paymentStatus === paymentFilter;

    return matchSearch && matchStatus && matchType && matchPayment;
  });

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || paymentFilter !== "all";

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
                className={`px-3 py-2 rounded-xl ${
                  sortBy === opt.key ? "bg-electric-500" : ""
                }`}
                onPress={() => setSortBy(opt.key)}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === opt.key ? "text-white" : "text-muted"
                  }`}
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
                    className={`px-3 py-2 rounded-lg border ${
                      statusFilter === s ? "bg-electric-500/20 border-electric-500" : "border-navy-500"
                    }`}
                    onPress={() => setStatusFilter(s)}
                  >
                    <Text className={`text-xs capitalize ${statusFilter === s ? "text-electric-500" : "text-muted"}`}>
                      {s}
                    </Text>
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
                    className={`px-3 py-2 rounded-lg border ${
                      typeFilter === t ? "bg-electric-500/20 border-electric-500" : "border-navy-500"
                    }`}
                    onPress={() => setTypeFilter(t)}
                  >
                    <Text className={`text-xs capitalize ${typeFilter === t ? "text-electric-500" : "text-muted"}`}>
                      {t}
                    </Text>
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
                    className={`px-3 py-2 rounded-lg border ${
                      paymentFilter === p ? "bg-electric-500/20 border-electric-500" : "border-navy-500"
                    }`}
                    onPress={() => setPaymentFilter(p)}
                  >
                    <Text className={`text-xs capitalize ${paymentFilter === p ? "text-electric-500" : "text-muted"}`}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-5">
        {filtered.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={search ? "Try adjusting your search or filters" : "Add your first project to get started"}
            actionLabel={search ? undefined : "Add Project"}
            onAction={search ? undefined : () => router.push("/project/add")}
          />
        ) : (
          filtered.map((project) => (
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
