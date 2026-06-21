import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const STEPS = ["Basic Info", "Technologies", "Financial", "Dates", "Notes"];
const PROJECT_TYPES = ["mobile", "web", "mixed", "other"] as const;
const STATUSES = ["active", "paused", "completed", "maintenance"] as const;

const TECH_OPTIONS = [
  "React Native", "React", "Next.js", "Vue", "Angular", "Node.js",
  "Python", "Django", "Flask", "FastAPI", "Laravel", "PHP",
  "Supabase", "Firebase", "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "TypeScript", "JavaScript", "Dart", "Flutter", "Swift", "Kotlin",
  "AWS", "Vercel", "Netlify", "Docker", "Kubernetes",
];

export default function AddProjectScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [type, setType] = useState<string>("web");
  const [status, setStatus] = useState<string>("active");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [domainExpiry, setDomainExpiry] = useState("");
  const [hostingExpiry, setHostingExpiry] = useState("");
  const [notes, setNotes] = useState("");

  const canNext = () => {
    switch (step) {
      case 0: return name.trim() !== "" && client.trim() !== "";
      case 1: return true;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">New Project</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 mb-6">
        <View className="flex-row mb-2">
          {STEPS.map((s, i) => (
            <View key={s} className="flex-1 items-center">
              <View className={`w-8 h-1 rounded-full mb-1 ${i <= step ? "bg-electric-500" : "bg-navy-600"}`} />
              <Text className={`text-[8px] ${i <= step ? "text-electric-500" : "text-muted"}`}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {step === 0 && (
          <View className="space-y-4">
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Project Name</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white"
                placeholder="My Awesome Project"
                placeholderTextColor="#4B5563"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Client Name</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white"
                placeholder="Client or company name"
                placeholderTextColor="#4B5563"
                value={client}
                onChangeText={setClient}
              />
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Project Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {PROJECT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    className={`px-4 py-3 rounded-xl border ${
                      type === t ? "bg-electric-500/20 border-electric-500" : "bg-surface-card border-navy-500"
                    }`}
                    onPress={() => setType(t)}
                  >
                    <Text className={`text-sm font-medium capitalize ${type === t ? "text-electric-500" : "text-muted"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    className={`px-4 py-3 rounded-xl border ${
                      status === s ? "bg-electric-500/20 border-electric-500" : "bg-surface-card border-navy-500"
                    }`}
                    onPress={() => setStatus(s)}
                  >
                    <Text className={`text-sm font-medium capitalize ${status === s ? "text-electric-500" : "text-muted"}`}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View className="space-y-4">
            <Text className="text-white font-semibold mb-2">Select Technologies</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {TECH_OPTIONS.map((tech) => {
                const selected = technologies.includes(tech);
                return (
                  <TouchableOpacity
                    key={tech}
                    className={`px-3 py-2 rounded-lg border ${
                      selected ? "bg-electric-500/20 border-electric-500" : "bg-surface-card border-navy-500"
                    }`}
                    onPress={() => {
                      if (selected) {
                        setTechnologies(technologies.filter((t) => t !== tech));
                      } else {
                        setTechnologies([...technologies, tech]);
                      }
                    }}
                  >
                    <Text className={`text-xs ${selected ? "text-electric-500" : "text-muted"}`}>
                      {tech}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row space-x-3">
              <TextInput
                className="flex-1 bg-surface-card border border-navy-500 rounded-xl px-4 py-3 text-white text-sm"
                placeholder="Add custom technology..."
                placeholderTextColor="#4B5563"
                value={customTech}
                onChangeText={setCustomTech}
              />
              <TouchableOpacity
                className="bg-electric-500 rounded-xl px-4 items-center justify-center"
                onPress={() => {
                  if (customTech.trim()) {
                    setTechnologies([...technologies, customTech.trim()]);
                    setCustomTech("");
                  }
                }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="space-y-4">
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Contract Value ($)</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white"
                placeholder="0.00"
                placeholderTextColor="#4B5563"
                keyboardType="decimal-pad"
                value={contractValue}
                onChangeText={setContractValue}
              />
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Amount Paid ($)</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white"
                placeholder="0.00"
                placeholderTextColor="#4B5563"
                keyboardType="decimal-pad"
                value={paidAmount}
                onChangeText={setPaidAmount}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="space-y-4">
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Domain Expiry</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#4B5563"
                value={domainExpiry}
                onChangeText={setDomainExpiry}
              />
            </View>
            <View>
              <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Hosting Expiry</Text>
              <TextInput
                className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#4B5563"
                value={hostingExpiry}
                onChangeText={setHostingExpiry}
              />
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="text-muted text-xs mb-2 ml-1 uppercase tracking-wider">Notes</Text>
            <TextInput
              className="bg-surface-card border border-navy-500 rounded-xl px-4 py-4 text-white min-h-[120px]"
              placeholder="Any notes about this project..."
              placeholderTextColor="#4B5563"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      <View className="px-5 py-4 flex-row space-x-3 bg-navy-900 border-t border-navy-700">
        {step > 0 && (
          <TouchableOpacity
            className="flex-1 bg-navy-700 rounded-xl py-4 items-center border border-navy-500"
            onPress={() => setStep(step - 1)}
          >
            <Text className="text-muted font-semibold">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`flex-1 rounded-xl py-4 items-center ${
            canNext() ? "bg-electric-500" : "bg-electric-500/30"
          }`}
          onPress={() => {
            if (step < 4) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={!canNext()}
        >
          <Text className="text-white font-bold">
            {step === 4 ? "Create Project" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
