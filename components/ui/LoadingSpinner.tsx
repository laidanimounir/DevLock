import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
}

export function LoadingSpinner({ message, fullScreen = false, size = "large" }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <View className="items-center">
          <View className="w-14 h-14 rounded-2xl bg-electric-500/20 items-center justify-center mb-4">
            <ActivityIndicator size={size} color="#3B82F6" />
          </View>
          {message && (
            <Text className="text-muted text-sm tracking-wider">{message}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color="#3B82F6" />
      {message && (
        <Text className="text-muted text-xs mt-3 tracking-wider">{message}</Text>
      )}
    </View>
  );
}

export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <View className="bg-surface-card rounded-2xl p-5 border border-navy-600 space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          className="h-4 rounded-full bg-navy-500/50"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </View>
  );
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
        <Text className="text-red-400 text-2xl">!</Text>
      </View>
      <Text className="text-white font-semibold mb-2">Error</Text>
      <Text className="text-muted text-sm text-center mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          className="bg-electric-500 rounded-xl px-6 py-3"
          onPress={onRetry}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

