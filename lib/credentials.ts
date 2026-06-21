import { supabase } from "./supabase";
import { logActivity } from "./activityLog";
import { encryptCredential, decryptCredential, generateEncryptionKey } from "./crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const MASTER_KEY_STORE = "nexvault_master_key";

const webStorage: Record<string, string> = {};

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return webStorage[key] || null;
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    webStorage[key] = value;
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // fail silently
  }
}

async function getMasterKey(): Promise<string> {
  const existing = await secureGet(MASTER_KEY_STORE);
  if (existing) return existing;

  const newKey = generateEncryptionKey();
  await secureSet(MASTER_KEY_STORE, newKey);
  return newKey;
}

export interface Credential {
  id: string;
  user_id: string;
  project_id: string;
  service: string;
  email: string | null;
  password_enc: string;
  iv: string;
  url: string | null;
  plan: string | null;
  extra_enc: string | null;
  extra_iv: string | null;
  created_at: string;
}

export interface CredentialInput {
  project_id: string;
  service: string;
  email?: string;
  password: string;
  url?: string;
  plan?: string;
  notes?: string;
}

export async function getCredentials(projectId: string): Promise<Credential[]> {
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCredential(input: CredentialInput): Promise<Credential> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("You must be signed in to add credentials");
  }

  const masterKey = await getMasterKey();

  const { encrypted: passwordEnc, iv: passwordIv } = encryptCredential(
    input.password,
    masterKey
  );

  let extraEnc: string | null = null;
  let extraIv: string | null = null;

  if (input.notes && input.notes.trim()) {
    const encrypted = encryptCredential(input.notes.trim(), masterKey);
    extraEnc = encrypted.encrypted;
    extraIv = encrypted.iv;
  }

  const row = {
    user_id: user.id,
    project_id: input.project_id,
    service: input.service,
    email: input.email || null,
    password_enc: passwordEnc,
    iv: passwordIv,
    url: input.url || null,
    plan: input.plan || null,
    extra_enc: extraEnc,
    extra_iv: extraIv,
  };

  const { data, error } = await supabase
    .from("credentials")
    .insert([row])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save credential: ${error.message}`);
  }

  await logActivity("add_credential", input.project_id);
  return data;
}

export async function decryptCredentialPassword(cred: Credential): Promise<string> {
  const masterKey = await getMasterKey();
  await logActivity("view_credential", cred.project_id);
  return decryptCredential(cred.password_enc, masterKey, cred.iv);
}

export async function decryptCredentialNotes(cred: Credential): Promise<string | null> {
  if (!cred.extra_enc || !cred.extra_iv) return null;
  const masterKey = await getMasterKey();
  return decryptCredential(cred.extra_enc, masterKey, cred.extra_iv);
}

export async function deleteCredential(id: string, projectId: string): Promise<void> {
  const { error } = await supabase
    .from("credentials")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete credential: ${error.message}`);
  await logActivity("delete_credential", projectId);
}
