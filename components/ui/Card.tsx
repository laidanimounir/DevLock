import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "./Badge";

interface ProjectCardProps {
  name: string;
  client: string;
  status: string;
  type: string;
  technologies?: string[];
  paymentStatus?: string;
  healthStatus?: "up" | "down" | "warning";
  onPress?: () => void;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: string;
}

export function ProjectCard({
  name,
  client,
  status,
  type,
  technologies = [],
  paymentStatus,
  healthStatus,
  onPress,
}: ProjectCardProps) {
  return (
    <TouchableOpacity
      className="bg-surface-card rounded-2xl p-5 border border-navy-600 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-11 h-11 rounded-xl bg-electric-500/20 items-center justify-center mr-3">
            <Ionicons name="folder-outline" size={22} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">{name}</Text>
            <Text className="text-muted text-xs mt-0.5">{client}</Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-2">
          {healthStatus && (
            <View
              className={`w-2 h-2 rounded-full ${
                healthStatus === "up"
                  ? "bg-success"
                  : healthStatus === "warning"
                  ? "bg-gold-500"
                  : "bg-red-500"
              }`}
            />
          )}
          <Badge variant="status">{status}</Badge>
        </View>
      </View>

      {technologies.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {technologies.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="tech">{tech}</Badge>
          ))}
          {technologies.length > 4 && (
            <Badge variant="tech">+{technologies.length - 4}</Badge>
          )}
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <Badge variant="status">{type}</Badge>
        {paymentStatus && <Badge variant="payment">{paymentStatus}</Badge>}
      </View>
    </TouchableOpacity>
  );
}

export function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  return (
    <View className="bg-surface-card rounded-2xl p-4 border border-navy-600">
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {trend && (
          <View className="flex-row items-center">
            <Ionicons
              name={trend.startsWith("+") ? "trending-up" : "trending-down"}
              size={14}
              color={trend.startsWith("+") ? "#10B981" : "#EF4444"}
            />
            <Text
              className={`text-xs ml-1 ${trend.startsWith("+") ? "text-success" : "text-red-400"}`}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-muted text-xs mt-1">{label}</Text>
    </View>
  );
}
