import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";

const TABS = ["Overview", "Credentials", "Finance", "Files", "Health"];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");

  const project = {
    id: id || "1",
    name: "E-Commerce Mobile App",
    client: "ShopWave Inc.",
    status: "active",
    type: "mobile",
    technologies: ["React Native", "TypeScript", "Supabase", "Stripe", "Expo"],
    notes: "Main e-commerce app with product catalog, cart, checkout flow. Client is responsive and pays on time.",
    contractValue: 12000,
    paidAmount: 6000,
    paymentStatus: "partial",
    domainExpiry: "2026-12-15",
    hostingExpiry: "2027-01-20",
    lastContact: "2026-06-18",
    createdAt: "2026-01-10",
  };

  const clientInfo = {
    phone: "+1 (555) 123-4567",
    whatsapp: "+1 (555) 123-4567",
    email: "contact@shopwave.com",
    preferredContact: "whatsapp",
    personalNotes: "John is the CTO. Prefers WhatsApp for quick questions. Best time to reach: 10am-2pm EST. Very technical, appreciates detailed updates.",
    lastContact: "2026-06-18",
  };

  const credentials = [
    { service: "Supabase", email: "admin@shopwave.com", url: "supabase.com" },
    { service: "GitHub", email: "dev@shopwave.com", url: "github.com" },
    { service: "Vercel", email: "deploy@shopwave.com", url: "vercel.com" },
    { service: "Stripe", email: "billing@shopwave.com", url: "stripe.com" },
  ];

  const invoices = [
    { id: "1", amount: 4000, status: "paid", dueDate: "2026-03-01", paidDate: "2026-02-28" },
    { id: "2", amount: 4000, status: "paid", dueDate: "2026-05-01", paidDate: "2026-04-29" },
    { id: "3", amount: 4000, status: "pending", dueDate: "2026-07-01" },
  ];

  const healthChecks = [
    { service: "Production API", status: "up", responseTime: 145, lastCheck: "2 hours ago" },
    { service: "Staging API", status: "up", responseTime: 210, lastCheck: "2 hours ago" },
    { service: "Database", status: "warning", responseTime: 850, lastCheck: "1 hour ago" },
  ];

  const openLink = (url: string, type: "phone" | "whatsapp" | "email") => {
    switch (type) {
      case "phone":
        Linking.openURL(`tel:${url}`);
        break;
      case "whatsapp":
        Linking.openURL(`https://wa.me/${url.replace(/\D/g, "")}`);
        break;
      case "email":
        Linking.openURL(`mailto:${url}`);
        break;
    }
  };

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
          <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600"
          onPress={() => router.push(`/project/add`)}
        >
          <Ionicons name="create-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 mb-4">
          <View className="flex-row items-start mb-4">
            <View className="w-14 h-14 rounded-2xl bg-electric-500/20 items-center justify-center mr-4">
              <Ionicons name="folder" size={26} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{project.name}</Text>
              <Text className="text-muted text-sm">{project.client}</Text>
            </View>
            <Badge variant="status">{project.status}</Badge>
          </View>
        </View>

        <View className="px-5 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row bg-surface-card rounded-2xl p-1 border border-navy-600">
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={`px-5 py-3 rounded-xl ${activeTab === tab ? "bg-navy-700" : ""}`}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text className={`text-sm font-semibold ${activeTab === tab ? "text-electric-500" : "text-muted"}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="px-5 pb-24">
          {activeTab === "Overview" && (
            <View className="space-y-4">
              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-3">Technology Stack</Text>
                <View className="flex-row flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="tech">{tech}</Badge>
                  ))}
                </View>
              </View>

              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-3">Notes</Text>
                <Text className="text-muted text-sm leading-5">{project.notes}</Text>
              </View>

              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-3">Important Dates</Text>
                <View className="space-y-3">
                  <InfoRow icon="calendar-outline" label="Created" value={project.createdAt} />
                  <InfoRow icon="time-outline" label="Last Contact" value={project.lastContact} />
                  <InfoRow icon="globe-outline" label="Domain Expiry" value={project.domainExpiry} />
                  <InfoRow icon="server-outline" label="Hosting Expiry" value={project.hostingExpiry} />
                </View>
              </View>

              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-3">Client Contact</Text>
                <View className="space-y-3 mb-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                      <Text className="text-muted text-sm">{clientInfo.phone}</Text>
                    </View>
                    <TouchableOpacity
                      className="bg-electric-500/20 px-3 py-1.5 rounded-lg"
                      onPress={() => openLink(clientInfo.phone, "phone")}
                    >
                      <Text className="text-electric-500 text-xs font-semibold">Call</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="logo-whatsapp" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                      <Text className="text-muted text-sm">{clientInfo.whatsapp}</Text>
                    </View>
                    <TouchableOpacity
                      className="bg-green-500/20 px-3 py-1.5 rounded-lg"
                      onPress={() => openLink(clientInfo.whatsapp, "whatsapp")}
                    >
                      <Text className="text-green-400 text-xs font-semibold">Chat</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="mail-outline" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                      <Text className="text-muted text-sm">{clientInfo.email}</Text>
                    </View>
                    <TouchableOpacity
                      className="bg-gold-500/20 px-3 py-1.5 rounded-lg"
                      onPress={() => openLink(clientInfo.email, "email")}
                    >
                      <Text className="text-gold-400 text-xs font-semibold">Email</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="border-t border-navy-600 pt-3">
                  <Text className="text-muted text-xs mb-1 uppercase tracking-wider">Personal Notes</Text>
                  <Text className="text-muted-light text-sm leading-5">{clientInfo.personalNotes}</Text>
                </View>

                <TouchableOpacity className="flex-row items-center mt-4 bg-navy-700 rounded-xl px-4 py-3 border border-navy-500">
                  <Ionicons name="time-outline" size={16} color="#3B82F6" style={{ marginRight: 8 }} />
                  <Text className="text-electric-500 text-sm">Update Last Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === "Credentials" && (
            <View className="space-y-3">
              {credentials.length === 0 ? (
                <EmptyState
                  icon="key-outline"
                  title="No credentials"
                  description="Add service credentials for this project"
                  actionLabel="Add Credential"
                />
              ) : (
                credentials.map((cred, i) => (
                  <View key={i} className="bg-surface-card rounded-2xl p-4 border border-navy-600">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-xl bg-electric-500/20 items-center justify-center mr-3">
                          <Ionicons name="server-outline" size={20} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold">{cred.service}</Text>
                          <Text className="text-muted text-xs">{cred.email}</Text>
                        </View>
                      </View>
                      <View className="flex-row space-x-2">
                        <TouchableOpacity className="w-9 h-9 rounded-lg bg-navy-700 items-center justify-center border border-navy-500">
                          <Ionicons name="copy-outline" size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-9 h-9 rounded-lg bg-navy-700 items-center justify-center border border-navy-500">
                          <Ionicons name="eye-outline" size={16} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity className="flex-row items-center justify-center bg-electric-500/10 border border-dashed border-electric-500/30 rounded-2xl p-4">
                <Ionicons name="add-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text className="text-electric-500 font-semibold">Add Credential</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "Finance" && (
            <View className="space-y-4">
              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-4">Financial Overview</Text>
                <View className="flex-row mb-4">
                  <View className="flex-1">
                    <Text className="text-muted text-xs">Contract Value</Text>
                    <Text className="text-white text-xl font-bold">${project.contractValue.toLocaleString()}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted text-xs">Paid</Text>
                    <Text className="text-success text-xl font-bold">${project.paidAmount.toLocaleString()}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted text-xs">Remaining</Text>
                    <Text className="text-gold-500 text-xl font-bold">${(project.contractValue - project.paidAmount).toLocaleString()}</Text>
                  </View>
                </View>
                <View className="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-electric-500 rounded-full"
                    style={{ width: `${(project.paidAmount / project.contractValue) * 100}%` }}
                  />
                </View>
              </View>

              <Text className="text-white font-semibold mt-2">Invoices</Text>
              {invoices.map((inv) => (
                <View key={inv.id} className="bg-surface-card rounded-2xl p-4 border border-navy-600">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-white font-semibold">${inv.amount.toLocaleString()}</Text>
                      <Text className="text-muted text-xs mt-1">Due: {inv.dueDate}</Text>
                      {inv.paidDate && <Text className="text-success text-xs">Paid: {inv.paidDate}</Text>}
                    </View>
                    <View className="items-end">
                      <Badge variant="payment">{inv.status}</Badge>
                      {inv.status === "pending" && (
                        <TouchableOpacity className="mt-2 bg-success/20 px-3 py-1 rounded-lg">
                          <Text className="text-success text-xs">Mark Paid</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity className="flex-row items-center justify-center bg-electric-500/10 border border-dashed border-electric-500/30 rounded-2xl p-4">
                <Ionicons name="add-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text className="text-electric-500 font-semibold">Add Invoice</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "Files" && (
            <View>
              <EmptyState
                icon="document-outline"
                title="No files attached"
                description="Upload screenshots, PDFs, and other files related to this project"
                actionLabel="Upload File"
              />
            </View>
          )}

          {activeTab === "Health" && (
            <View className="space-y-3">
              {healthChecks.map((check, i) => (
                <View key={i} className="bg-surface-card rounded-2xl p-4 border border-navy-600">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className={`w-3 h-3 rounded-full mr-3 ${
                        check.status === "up" ? "bg-success" : check.status === "warning" ? "bg-gold-500" : "bg-red-500"
                      }`} />
                      <View>
                        <Text className="text-white font-semibold">{check.service}</Text>
                        <Text className="text-muted text-xs">{check.lastCheck}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Badge variant="health">{check.status}</Badge>
                      <Text className="text-muted text-xs mt-1">{check.responseTime}ms</Text>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity className="flex-row items-center justify-center bg-electric-500/10 border border-dashed border-electric-500/30 rounded-2xl p-4">
                <Ionicons name="add-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text className="text-electric-500 font-semibold">Run Health Check</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon as any} size={16} color="#6B7280" style={{ marginRight: 10 }} />
      <Text className="text-muted text-sm flex-1">{label}</Text>
      <Text className="text-white text-sm">{value}</Text>
    </View>
  );
}
