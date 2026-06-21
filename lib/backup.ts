import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { encryptAES256, generateIV, generateEncryptionKey } from "./crypto";
import { supabase } from "./supabase";

const BACKUP_KEY_STORE = "nexvault_backup_key";

interface BackupData {
  version: string;
  timestamp: string;
  projects: any[];
  credentials: any[];
  clients: any[];
  invoices: any[];
  attachments: any[];
  healthChecks: any[];
  activityLog: any[];
}

export async function exportEncryptedBackup(): Promise<{ encrypted: string; iv: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [projects, credentials, clients, invoices, attachments, healthChecks, activityLog] =
    await Promise.all([
      supabase.from("projects").select("*").eq("user_id", user.id),
      supabase.from("credentials").select("*").eq("user_id", user.id),
      supabase.from("clients").select("*").eq("user_id", user.id),
      supabase.from("invoices").select("*").eq("user_id", user.id),
      supabase.from("attachments").select("*").eq("user_id", user.id),
      supabase.from("health_checks").select("*").eq("user_id", user.id),
      supabase.from("activity_log").select("*").eq("user_id", user.id),
    ]);

  const backupData: BackupData = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    projects: projects.data || [],
    credentials: credentials.data || [],
    clients: clients.data || [],
    invoices: invoices.data || [],
    attachments: attachments.data || [],
    healthChecks: healthChecks.data || [],
    activityLog: activityLog.data || [],
  };

  const jsonString = JSON.stringify(backupData);

  let backupKey = await SecureStore.getItemAsync(BACKUP_KEY_STORE);
  if (!backupKey) {
    backupKey = generateEncryptionKey();
    await SecureStore.setItemAsync(BACKUP_KEY_STORE, backupKey);
  }

  const iv = generateIV();
  const encrypted = encryptAES256(jsonString, backupKey, iv);

  const backupFilePath = `${FileSystem.documentDirectory}nexvault-backup-${Date.now()}.enc`;
  await FileSystem.writeAsStringAsync(backupFilePath, JSON.stringify({ encrypted, iv }), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return { encrypted, iv };
}

export async function importEncryptedBackup(backup: {
  encrypted: string;
  iv: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let backupKey = await SecureStore.getItemAsync(BACKUP_KEY_STORE);
  if (!backupKey) {
    throw new Error("No backup key found. Cannot decrypt backup.");
  }

  const decrypted = encryptAES256(backup.encrypted, backupKey, backup.iv);
  const backupData: BackupData = JSON.parse(decrypted);

  const userId = user.id;

  if (backupData.projects.length > 0) {
    await supabase.from("projects").upsert(
      backupData.projects.map((p: any) => ({ ...p, user_id: userId }))
    );
  }
  if (backupData.credentials.length > 0) {
    await supabase.from("credentials").upsert(
      backupData.credentials.map((c: any) => ({ ...c, user_id: userId }))
    );
  }
  if (backupData.clients.length > 0) {
    await supabase.from("clients").upsert(
      backupData.clients.map((c: any) => ({ ...c, user_id: userId }))
    );
  }
  if (backupData.invoices.length > 0) {
    await supabase.from("invoices").upsert(
      backupData.invoices.map((i: any) => ({ ...i, user_id: userId }))
    );
  }
}
