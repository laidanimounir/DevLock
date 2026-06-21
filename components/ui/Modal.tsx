import { View, Text, TouchableOpacity, Modal as RNModal, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
}

export function Modal({ visible, onClose, title, children, height = SCREEN_HEIGHT * 0.5 }: ModalProps) {
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1">
        <Animated.View
          className="absolute inset-0 bg-black/60"
          style={{ opacity: overlayOpacity }}
        >
          <TouchableOpacity className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-surface-card rounded-t-3xl border border-navy-600"
          style={{
            height,
            transform: [{ translateY }],
          }}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-navy-500" />
          </View>

          {title && (
            <View className="flex-row items-center justify-between px-6 py-3 border-b border-navy-600">
              <Text className="text-white text-lg font-semibold">{title}</Text>
              <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-navy-700 items-center justify-center">
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-1 px-6">{children}</View>
        </Animated.View>
      </View>
    </RNModal>
  );
}
