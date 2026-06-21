import { supabase } from "./supabase";
import { logActivity } from "./activityLog";

export interface Invoice {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
}

export async function getInvoices(projectId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createInvoice(input: {
  project_id: string;
  amount: number;
  due_date?: string;
  notes?: string;
}): Promise<Invoice> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      project_id: input.project_id,
      amount: input.amount,
      due_date: input.due_date || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity("add_invoice", input.project_id);
  return data;
}

export async function markInvoicePaid(id: string, projectId: string): Promise<void> {
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", id);

  if (error) throw error;
  await logActivity("mark_invoice_paid", projectId);
}
