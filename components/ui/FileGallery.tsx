import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "../ui/EmptyState";

interface FileItem {
  id: string;
  name: string;
  type: "image" | "pdf" | "other";
  url: string;
  description: string;
  createdAt: string;
  size?: string;
}

interface FileGalleryProps {
  files: FileItem[];
  onUpload?: () => void;
  onDelete?: (id: string) => void;
  onView?: (file: FileItem) => void;
}

export function FileGallery({ files, onUpload, onDelete, onView }: FileGalleryProps) {
  const images = files.filter((f) => f.type === "image");
  const documents = files.filter((f) => f.type === "pdf" || f.type === "other");

  return (
    <View>
      {files.length === 0 ? (
        <EmptyState
          icon="document-outline"
          title="No files attached"
          description="Upload screenshots, PDFs, and other files related to this project"
          actionLabel="Upload File"
          onAction={onUpload}
        />
      ) : (
        <View className="space-y-6">
          {images.length > 0 && (
            <View>
              <Text className="text-white font-semibold mb-3">Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  {images.map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      className="w-32"
                      onPress={() => onView?.(file)}
                    >
                      <View className="w-32 h-32 bg-surface-card rounded-2xl border border-navy-600 items-center justify-center overflow-hidden">
                        <Ionicons name="image-outline" size={36} color="#4B5563" />
                      </View>
                      <Text className="text-muted text-xs mt-2" numberOfLines={1}>
                        {file.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {documents.length > 0 && (
            <View>
              <Text className="text-white font-semibold mb-3">Documents</Text>
              {documents.map((file) => (
                <TouchableOpacity
                  key={file.id}
                  className="bg-surface-card rounded-2xl p-4 border border-navy-600 mb-3 flex-row items-center"
                  onPress={() => onView?.(file)}
                >
                  <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                    file.type === "pdf" ? "bg-red-500/15" : "bg-gold-500/15"
                  }`}>
                    <Ionicons
                      name={file.type === "pdf" ? "document-text-outline" : "document-outline"}
                      size={22}
                      color={file.type === "pdf" ? "#EF4444" : "#F59E0B"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium">{file.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-muted text-xs">{file.size || "Unknown size"}</Text>
                      <Text className="text-muted text-xs mx-2">·</Text>
                      <Text className="text-muted text-xs">{file.createdAt}</Text>
                    </View>
                  </View>
                  {onDelete && (
                    <TouchableOpacity
                      className="w-9 h-9 rounded-lg bg-red-500/10 items-center justify-center ml-2"
                      onPress={() => onDelete(file.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {files.length > 0 && onUpload && (
        <TouchableOpacity
          className="flex-row items-center justify-center bg-electric-500/10 border border-dashed border-electric-500/30 rounded-2xl p-4 mt-4"
          onPress={onUpload}
        >
          <Ionicons name="add-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
          <Text className="text-electric-500 font-semibold">Upload More Files</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
