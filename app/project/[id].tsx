import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState, LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { getProject, updateProject } from "../../lib/projects";
import {
  getCredentials,
  createCredential,
  deleteCredential,
  decryptCredentialPassword,
  decryptCredentialNotes,
  type Credential,
} from "../../lib/credentials";
import { getInvoices, createInvoice, markInvoicePaid, type Invoice } from "../../lib/invoices";
import { getClient, upsertClient, type Client } from "../../lib/clients";
import { generatePassword, getPasswordStrength } from "../../lib/passwordGenerator";

const TABS = ["Overview", "Credentials", "Finance", "Files", "Health"];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState<any>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  // credential viewing
  const [viewedPassword, setViewedPassword] = useState<Record<string, string>>({});
  const [viewedNotes, setViewedNotes] = useState<Record<string, string>>({});
  const [viewingPassId, setViewingPassId] = useState<string | null>(null);

  // add credential modal
  const [showCredModal, setShowCredModal] = useState(false);
  const [credService, setCredService] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credUrl, setCredUrl] = useState("");
  const [credPlan, setCredPlan] = useState("");
  const [credNotes, setCredNotes] = useState("");
  const [credSaving, setCredSaving] = useState(false);

  // add invoice modal
  const [showInvModal, setShowInvModal] = useState(false);
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invNotes, setInvNotes] = useState("");
  const [invSaving, setInvSaving] = useState(false);

  // notes editing
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState("");

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [proj, creds, invs, cli] = await Promise.all([
        getProject(id),
        getCredentials(id),
        getInvoices(id),
        getClient(id),
      ]);
      setProject(proj);
      setCredentials(creds);
      setInvoices(invs);
      setClient(cli);
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleViewPassword = async (cred: Credential) => {
    if (viewedPassword[cred.id]) {
      setViewedPassword((prev) => {
        const next = { ...prev };
        delete next[cred.id];
        return next;
      });
      return;
    }
    setViewingPassId(cred.id);
    try {
      const decrypted = await decryptCredentialPassword(cred);
      setViewedPassword((prev) => ({ ...prev, [cred.id]: decrypted }));
    } catch {
      Alert.alert("Error", "Failed to decrypt password");
    } finally {
      setViewingPassId(null);
    }
  };

  const handleCopyPassword = async (cred: Credential) => {
    let pass = viewedPassword[cred.id];
    if (!pass) {
      setViewingPassId(cred.id);
      try {
        pass = await decryptCredentialPassword(cred);
        setViewedPassword((prev) => ({ ...prev, [cred.id]: pass }));
      } catch {
        Alert.alert("Error", "Failed to decrypt password");
        setViewingPassId(null);
        return;
      } finally {
        setViewingPassId(null);
      }
    }
    try {
      if (Platform.OS === "web") {
        await (navigator as any).clipboard?.writeText(pass);
      }
      Alert.alert("Copied", "Password copied to clipboard");
    } catch {
      Alert.alert("Copied", pass);
    }
  };

  const handleAddCredential = async () => {
    if (!credService.trim() || !credPassword.trim()) {
      Alert.alert("Error", "Service name and password are required");
      return;
    }
    setCredSaving(true);
    try {
      await createCredential({
        project_id: id!,
        service: credService.trim(),
        email: credEmail.trim() || undefined,
        password: credPassword,
        url: credUrl.trim() || undefined,
        plan: credPlan.trim() || undefined,
        notes: credNotes.trim() || undefined,
      });
      setShowCredModal(false);
      setCredService("");
      setCredEmail("");
      setCredPassword("");
      setCredUrl("");
      setCredPlan("");
      setCredNotes("");
      await loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add credential");
    } finally {
      setCredSaving(false);
    }
  };

  const handleDeleteCredential = (credId: string) => {
    Alert.alert("Delete Credential", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCredential(credId, id!);
            loadData();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const handleAddInvoice = async () => {
    if (!invAmount.trim()) {
      Alert.alert("Error", "Amount is required");
      return;
    }
    setInvSaving(true);
    try {
      await createInvoice({
        project_id: id!,
        amount: parseFloat(invAmount),
        due_date: invDueDate || undefined,
        notes: invNotes.trim() || undefined,
      });
      setShowInvModal(false);
      setInvAmount("");
      setInvDueDate("");
      setInvNotes("");
      await loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add invoice");
    } finally {
      setInvSaving(false);
    }
  };

  const handleMarkPaid = async (invId: string) => {
    try {
      await markInvoicePaid(invId, id!);
      await loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleOpenLink = (url: string, type: "phone" | "whatsapp" | "email") => {
    if (type === "phone") Linking.openURL(`tel:${url}`);
    else if (type === "whatsapp") Linking.openURL(`https://wa.me/${url.replace(/\D/g, "")}`);
    else if (type === "email") Linking.openURL(`mailto:${url}`);
  };

  const handleUpdateNotes = async () => {
    try {
      await updateProject(id!, { notes: editNotesText });
      setProject((prev: any) => ({ ...prev, notes: editNotesText }));
      setEditingNotes(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const genPass = () => {
    const pass = generatePassword({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true });
    setCredPassword(pass);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading project..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!project) return <ErrorState message="Project not found" />;

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
          <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-xl bg-surface-card items-center justify-center border border-navy-600">
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
              <Text className="text-white text-xl font-bold">{project.project_name}</Text>
              <Text className="text-muted text-sm">{project.client_name}</Text>
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
                  <Text className={`text-sm font-semibold ${activeTab === tab ? "text-electric-500" : "text-muted"}`}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="px-5 pb-24">
          {activeTab === "Overview" && (
            <View className="space-y-4">
              {(project.technologies || []).length > 0 && (
                <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                  <Text className="text-white font-semibold mb-3">Technology Stack</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(project.technologies || []).map((tech: string) => (
                      <Badge key={tech} variant="tech">{tech}</Badge>
                    ))}
                  </View>
                </View>
              )}

              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white font-semibold">Notes</Text>
                  <TouchableOpacity onPress={() => {
                    setEditNotesText(project.notes || "");
                    setEditingNotes(true);
                  }}>
                    <Ionicons name="create-outline" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                {editingNotes ? (
                  <View>
                    <TextInput
                      className="bg-navy-700 border border-navy-500 rounded-xl px-4 py-3 text-white text-sm mb-3 min-h-[80px]"
                      value={editNotesText}
                      onChangeText={setEditNotesText}
                      multiline
                      textAlignVertical="top"
                    />
                    <View className="flex-row space-x-3">
                      <TouchableOpacity className="flex-1 bg-navy-600 rounded-xl py-2 items-center" onPress={() => setEditingNotes(false)}>
                        <Text className="text-muted text-sm">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-electric-500 rounded-xl py-2 items-center" onPress={handleUpdateNotes}>
                        <Text className="text-white text-sm font-semibold">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text className="text-muted text-sm leading-5">{project.notes || "No notes yet"}</Text>
                )}
              </View>

              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-3">Important Dates</Text>
                <InfoRow icon="calendar-outline" label="Created" value={project.created_at?.split("T")[0] || "—"} />
                <InfoRow icon="time-outline" label="Last Contact" value={project.last_contact || "—"} />
                <InfoRow icon="globe-outline" label="Domain Expiry" value={project.domain_expiry || "—"} />
                <InfoRow icon="server-outline" label="Hosting Expiry" value={project.hosting_expiry || "—"} />
              </View>

              <View className="bg-surface-card rounded-2xl p-5 border border-navy-600">
                <Text className="text-white font-semibold mb-3">Client Contact</Text>
                {client ? (
                  <View className="space-y-3">
                    {client.phone && (
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="call-outline" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                          <Text className="text-muted text-sm">{client.phone}</Text>
                        </View>
                        <TouchableOpacity className="bg-electric-500/20 px-3 py-1.5 rounded-lg" onPress={() => handleOpenLink(client.phone!, "phone")}>
                          <Text className="text-electric-500 text-xs font-semibold">Call</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {client.whatsapp && (
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="logo-whatsapp" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                          <Text className="text-muted text-sm">{client.whatsapp}</Text>
                        </View>
                        <TouchableOpacity className="bg-green-500/20 px-3 py-1.5 rounded-lg" onPress={() => handleOpenLink(client.whatsapp!, "whatsapp")}>
                          <Text className="text-green-400 text-xs font-semibold">Chat</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {client.email && (
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="mail-outline" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                          <Text className="text-muted text-sm">{client.email}</Text>
                        </View>
                        <TouchableOpacity className="bg-gold-500/20 px-3 py-1.5 rounded-lg" onPress={() => handleOpenLink(client.email!, "email")}>
                          <Text className="text-gold-400 text-xs font-semibold">Email</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {client.personal_notes && (
                      <View className="border-t border-navy-600 pt-3">
                        <Text className="text-muted text-xs mb-1 uppercase tracking-wider">Personal Notes</Text>
                        <Text className="text-muted-light text-sm leading-5">{client.personal_notes}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text className="text-muted text-sm">No client info added yet</Text>
                )}
              </View>
            </View>
          )}

          {activeTab === "Credentials" && (
            <View className="space-y-3">
              {credentials.length === 0 ? (
                <EmptyState icon="key-outline" title="No credentials" description="Add service credentials for this project" />
              ) : (
                credentials.map((cred) => {
                  const passVisible = !!viewedPassword[cred.id];
                  const strength = passVisible ? getPasswordStrength(viewedPassword[cred.id]) : null;
                  return (
                    <View key={cred.id} className="bg-surface-card rounded-2xl p-4 border border-navy-600">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 rounded-xl bg-electric-500/20 items-center justify-center mr-3">
                            <Ionicons name="server-outline" size={20} color="#3B82F6" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-semibold">{cred.service}</Text>
                            {cred.email && <Text className="text-muted text-xs">{cred.email}</Text>}
                          </View>
                        </View>
                        <View className="flex-row space-x-2">
                          <TouchableOpacity className="w-9 h-9 rounded-lg bg-navy-700 items-center justify-center border border-navy-500" onPress={() => handleCopyPassword(cred)}>
                            <Ionicons name="copy-outline" size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity className="w-9 h-9 rounded-lg bg-navy-700 items-center justify-center border border-navy-500" onPress={() => handleViewPassword(cred)}>
                            {viewingPassId === cred.id ? (
                              <ActivityIndicator size="small" color="#6B7280" />
                            ) : (
                              <Ionicons name={passVisible ? "eye-off-outline" : "eye-outline"} size={16} color="#6B7280" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity className="w-9 h-9 rounded-lg bg-red-500/10 items-center justify-center" onPress={() => handleDeleteCredential(cred.id)}>
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {passVisible && (
                        <View className="bg-navy-700 rounded-xl p-3 mt-2">
                          <Text className="text-muted text-[10px] uppercase tracking-wider mb-1">Password (decrypted)</Text>
                          <Text className="text-white font-mono text-sm select-all">{viewedPassword[cred.id]}</Text>
                          {strength && (
                            <View className="flex-row items-center mt-2">
                              <View className="h-1 flex-1 bg-navy-600 rounded-full overflow-hidden">
                                <View
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(strength.score * 25, 100)}%`,
                                    backgroundColor: strength.color,
                                  }}
                                />
                              </View>
                              <Text className="text-xs ml-2" style={{ color: strength.color }}>{strength.label}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {cred.url && (
                        <Text className="text-electric-500 text-xs mt-2" onPress={() => Linking.openURL(cred.url!)}>
                          {cred.url}
                        </Text>
                      )}
                      {cred.plan && <Text className="text-muted text-xs mt-1">Plan: {cred.plan}</Text>}
                    </View>
                  );
                })
              )}

              <TouchableOpacity className="flex-row items-center justify-center bg-electric-500/10 border border-dashed border-electric-500/30 rounded-2xl p-4" onPress={() => setShowCredModal(true)}>
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
                    <Text className="text-muted text-xs">Contract</Text>
                    <Text className="text-white text-xl font-bold">${(Number(project.contract_value) || 0).toLocaleString()}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted text-xs">Paid</Text>
                    <Text className="text-success text-xl font-bold">${(Number(project.paid_amount) || 0).toLocaleString()}</Text>
                  </View>
                </View>
                <View className="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-electric-500 rounded-full"
                    style={{ width: `${project.contract_value > 0 ? ((Number(project.paid_amount) || 0) / Number(project.contract_value)) * 100 : 0}%` }}
                  />
                </View>
              </View>

              <Text className="text-white font-semibold mt-2">Invoices</Text>
              {invoices.length === 0 ? (
                <EmptyState icon="receipt-outline" title="No invoices" description="Add invoices to track payments" />
              ) : (
                invoices.map((inv) => (
                  <View key={inv.id} className="bg-surface-card rounded-2xl p-4 border border-navy-600">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-white font-semibold">${Number(inv.amount).toLocaleString()}</Text>
                        {inv.due_date && <Text className="text-muted text-xs mt-1">Due: {inv.due_date}</Text>}
                        {inv.paid_date && <Text className="text-success text-xs">Paid: {inv.paid_date}</Text>}
                        {inv.notes && <Text className="text-muted text-xs mt-1">{inv.notes}</Text>}
                      </View>
                      <View className="items-end">
                        <Badge variant="payment">{inv.status}</Badge>
                        {inv.status !== "paid" && (
                          <TouchableOpacity className="mt-2 bg-success/20 px-3 py-1 rounded-lg" onPress={() => handleMarkPaid(inv.id)}>
                            <Text className="text-success text-xs">Mark Paid</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity className="flex-row items-center justify-center bg-electric-500/10 border border-dashed border-electric-500/30 rounded-2xl p-4" onPress={() => setShowInvModal(true)}>
                <Ionicons name="add-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text className="text-electric-500 font-semibold">Add Invoice</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "Files" && (
            <EmptyState icon="document-outline" title="No files attached" description="Upload screenshots and PDFs related to this project" />
          )}

          {activeTab === "Health" && (
            <EmptyState icon="pulse-outline" title="No health checks" description="Health monitoring data will appear here" />
          )}
        </View>
      </ScrollView>

      {/* Add Credential Modal */}
      <Modal visible={showCredModal} onClose={() => setShowCredModal(false)} title="Add Credential" height={500}>
        <ScrollView className="space-y-4 pt-2">
          <Input label="Service Name" placeholder="Supabase, Firebase, cPanel..." value={credService} onChangeText={setCredService} />
          <Input label="Email / Username" placeholder="user@example.com" value={credEmail} onChangeText={setCredEmail} keyboardType="email-address" />
          <View>
            <Text className="text-muted text-[10px] mb-2 ml-2 tracking-[0.2em] uppercase font-semibold">Password</Text>
            <View className="flex-row items-center space-x-2">
              <View className="flex-1">
                <Input placeholder="Enter or generate" value={credPassword} onChangeText={setCredPassword} variant="password" />
              </View>
              <TouchableOpacity className="bg-electric-500/20 rounded-xl p-3" onPress={genPass}>
                <Ionicons name="dice-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {credPassword.length > 0 && (
              <View className="mt-2">
                <View className="h-1 bg-navy-600 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(getPasswordStrength(credPassword).score * 25, 100)}%`, backgroundColor: getPasswordStrength(credPassword).color }}
                  />
                </View>
                <Text className="text-xs mt-1" style={{ color: getPasswordStrength(credPassword).color }}>
                  {getPasswordStrength(credPassword).label}
                </Text>
              </View>
            )}
          </View>
          <Input label="URL / Dashboard" placeholder="https://..." value={credUrl} onChangeText={setCredUrl} />
          <Input label="Plan Type" placeholder="Free, Pro, Enterprise..." value={credPlan} onChangeText={setCredPlan} />
          <Input label="Secret Notes" placeholder="Additional notes..." value={credNotes} onChangeText={setCredNotes} />
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${credSaving ? "bg-electric-500/50" : "bg-electric-500"}`}
            onPress={handleAddCredential}
            disabled={credSaving}
          >
            {credSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold">Save Credential</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Add Invoice Modal */}
      <Modal visible={showInvModal} onClose={() => setShowInvModal(false)} title="Add Invoice" height={350}>
        <View className="space-y-4 pt-2">
          <Input label="Amount ($)" placeholder="0.00" value={invAmount} onChangeText={setInvAmount} keyboardType="decimal-pad" />
          <Input label="Due Date" placeholder="YYYY-MM-DD" value={invDueDate} onChangeText={setInvDueDate} />
          <Input label="Notes" placeholder="Invoice notes..." value={invNotes} onChangeText={setInvNotes} />
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${invSaving ? "bg-electric-500/50" : "bg-electric-500"}`}
            onPress={handleAddInvoice}
            disabled={invSaving}
          >
            {invSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold">Save Invoice</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-1.5">
      <Ionicons name={icon as any} size={16} color="#6B7280" style={{ marginRight: 10 }} />
      <Text className="text-muted text-sm flex-1">{label}</Text>
      <Text className="text-white text-sm">{value}</Text>
    </View>
  );
}
