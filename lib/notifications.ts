import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addDays, isBefore, parseISO, format } from "date-fns";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleInvoiceReminder(
  invoiceId: string,
  projectName: string,
  amount: number,
  dueDate: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const due = parseISO(dueDate);
  const reminderDate = addDays(due, -3);
  const now = new Date();

  if (isBefore(reminderDate, now)) return null;

  const triggerDate = Platform.OS === "ios"
    ? ({ type: "date" as const, date: reminderDate })
    : ({ type: "date" as const, date: reminderDate });

  if (!triggerDate.date) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Invoice Due Soon",
      body: `$${amount.toLocaleString()} for "${projectName}" is due on ${format(due, "MMM d, yyyy")}`,
      data: { invoiceId, projectName, type: "invoice_reminder" },
      sound: true,
    },
    trigger: triggerDate as any,
  });

  return id;
}

export async function scheduleOverdueCheck(invoices: Array<{ id: string; projectName: string; amount: number; dueDate: string; status: string }>) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const invoice of invoices) {
    if (invoice.status === "pending") {
      await scheduleInvoiceReminder(
        invoice.id,
        invoice.projectName,
        invoice.amount,
        invoice.dueDate
      );
    }
  }
}

export async function scheduleExpiryReminder(
  type: "domain" | "hosting",
  projectName: string,
  expiryDate: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const expiry = parseISO(expiryDate);
  const reminderDate = addDays(expiry, -30);
  const now = new Date();

  if (isBefore(reminderDate, now)) return null;

  const triggerDate = { type: "date" as const, date: reminderDate } as const;
  if (!triggerDate.date) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${type === "domain" ? "Domain" : "Hosting"} Expiring Soon`,
      body: `${projectName} ${type} expires on ${format(expiry, "MMM d, yyyy")}. Renew before it's too late.`,
      data: { projectName, type: `${type}_expiry` },
      sound: true,
    },
    trigger: triggerDate as any,
  });

  return id;
}

export async function sendImmediateNotification(title: string, body: string, data?: Record<string, string>) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null,
  });
}
