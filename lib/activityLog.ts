import { supabase } from "./supabase";
import { Platform } from "react-native";

export type ActivityAction =
  | "view_password"
  | "add_project"
  | "edit_project"
  | "delete_project"
  | "add_credential"
  | "view_credential"
  | "delete_credential"
  | "add_invoice"
  | "mark_invoice_paid"
  | "upload_file"
  | "delete_file"
  | "export_backup"
  | "import_backup"
  | "change_pin"
  | "login"
  | "logout";

export async function logActivity(
  action: ActivityAction,
  projectId?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const device = Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web";

    await supabase.from("activity_log").insert({
      user_id: user.id,
      action,
      project_id: projectId || null,
      device,
    });
  } catch {
    // Silently fail - logging should never block the user
  }
}

export async function getActivityLog(limit = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    return data || [];
  } catch {
    return [];
  }
}
