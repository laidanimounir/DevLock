import { supabase } from "./supabase";

export interface Client {
  id: string;
  user_id: string;
  project_id: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  preferred_contact: string | null;
  personal_notes: string | null;
  created_at: string;
}

export async function getClient(projectId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertClient(input: {
  project_id: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  preferred_contact?: string;
  personal_notes?: string;
}): Promise<Client> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await getClient(input.project_id);

  if (existing) {
    const { data, error } = await supabase
      .from("clients")
      .update({
        phone: input.phone || null,
        whatsapp: input.whatsapp || null,
        email: input.email || null,
        preferred_contact: (input.preferred_contact as any) || null,
        personal_notes: input.personal_notes || null,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      project_id: input.project_id,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      preferred_contact: (input.preferred_contact as any) || null,
      personal_notes: input.personal_notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
