import { supabase } from "./supabase";
import { logActivity } from "./activityLog";
import type { Database } from "../types/database";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(
  project: Omit<ProjectInsert, "user_id">
): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const insert: ProjectInsert = {
    ...project,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;

  await logActivity("add_project", data.id);
  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<ProjectInsert, "user_id" | "id">>
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id);

  if (error) throw error;

  await logActivity("edit_project", id);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  await logActivity("delete_project", id);
}

export async function getDashboardStats(): Promise<{
  totalProjects: number;
  activeProjects: number;
  totalEarned: number;
  totalPending: number;
  overdueInvoices: number;
  expiringDomains: number;
  recentProjects: Project[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const userId = user.id;
  const now = new Date().toISOString().split("T")[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId);

  const allProjects = projects || [];
  const allInvoices = invoices || [];

  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter((p) => p.status === "active").length;
  const totalEarned = allInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPending = allInvoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const overdueInvoices = allInvoices.filter(
    (i) => i.status === "pending" && i.due_date && i.due_date < now
  ).length;
  const expiringDomains = allProjects.filter(
    (p) => p.domain_expiry && p.domain_expiry < thirtyDaysFromNow && p.domain_expiry >= now
  ).length;
  const recentProjects = allProjects.slice(0, 5);

  return {
    totalProjects,
    activeProjects,
    totalEarned,
    totalPending,
    overdueInvoices,
    expiringDomains,
    recentProjects,
  };
}

export async function getFinancialStats(): Promise<{
  monthlyIncome: number[];
  months: string[];
  projectBreakdown: Array<{ name: string; earned: number; pending: number; color: string }>;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const months: string[] = [];
  const monthlyIncome: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthNames[d.getMonth()]);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];

    const { data } = await supabase
      .from("invoices")
      .select("amount")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .gte("paid_date", startOfMonth)
      .lte("paid_date", endOfMonth);

    monthlyIncome.push(
      (data || []).reduce((sum, i) => sum + Number(i.amount), 0)
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_name")
    .eq("user_id", user.id);

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
  const projectBreakdown: Array<{ name: string; earned: number; pending: number; color: string }> = [];

  if (projects) {
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];

      const { data: projInvoices } = await supabase
        .from("invoices")
        .select("amount, status")
        .eq("user_id", user.id)
        .eq("project_id", p.id);

      const earned = (projInvoices || [])
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
      const pending = (projInvoices || [])
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      projectBreakdown.push({
        name: p.project_name,
        earned,
        pending,
        color: colors[i % colors.length],
      });
    }
  }

  return { monthlyIncome, months, projectBreakdown };
}
