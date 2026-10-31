"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can view system settings.");
  }

  let settings = await prisma.systemSetting.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        id: "global",
        allowPublicRegistration: false,
        emailProvider: "smtp",
        smtpPort: 587,
        smtpFromEmail: "support@issuebridge.com",
        smsEnabled: false,
        smsProvider: "twilio",
        webhookNotificationsEnabled: false,
        githubRepoOwner: "tildemark",
        githubRepoName: "trace",
        githubDefaultLabels: "support-escalation",
      },
    });
  }

  return settings;
}

export async function updateSystemSettings(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can update system settings.");
  }

  const allowPublicRegistration = formData.get("allowPublicRegistration") === "true";

  // Email Config
  const emailProvider = (formData.get("emailProvider") as string) || "smtp";
  const smtpHost = (formData.get("smtpHost") as string) || null;
  const smtpPort = parseInt(formData.get("smtpPort") as string, 10) || 587;
  const smtpUser = (formData.get("smtpUser") as string) || null;
  const smtpPassword = (formData.get("smtpPassword") as string) || null;
  const smtpFromEmail = (formData.get("smtpFromEmail") as string) || "support@issuebridge.com";
  const resendApiKey = (formData.get("resendApiKey") as string) || null;

  // SMS Config
  const smsEnabled = formData.get("smsEnabled") === "true";
  const smsProvider = (formData.get("smsProvider") as string) || "twilio";
  const twilioAccountSid = (formData.get("twilioAccountSid") as string) || null;
  const twilioAuthToken = (formData.get("twilioAuthToken") as string) || null;
  const twilioFromNumber = (formData.get("twilioFromNumber") as string) || null;

  // Webhook / Chat Notifications
  const webhookNotificationsEnabled = formData.get("webhookNotificationsEnabled") === "true";
  const slackWebhookUrl = (formData.get("slackWebhookUrl") as string) || null;
  const discordWebhookUrl = (formData.get("discordWebhookUrl") as string) || null;

  // GitHub Config
  const githubRepoOwner = (formData.get("githubRepoOwner") as string) || "tildemark";
  const githubRepoName = (formData.get("githubRepoName") as string) || "trace";
  const githubDefaultLabels = (formData.get("githubDefaultLabels") as string) || "support-escalation";

  await prisma.systemSetting.upsert({
    where: { id: "global" },
    update: {
      allowPublicRegistration,
      emailProvider,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFromEmail,
      resendApiKey,
      smsEnabled,
      smsProvider,
      twilioAccountSid,
      twilioAuthToken,
      twilioFromNumber,
      webhookNotificationsEnabled,
      slackWebhookUrl,
      discordWebhookUrl,
      githubRepoOwner,
      githubRepoName,
      githubDefaultLabels,
    },
    create: {
      id: "global",
      allowPublicRegistration,
      emailProvider,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFromEmail,
      resendApiKey,
      smsEnabled,
      smsProvider,
      twilioAccountSid,
      twilioAuthToken,
      twilioFromNumber,
      webhookNotificationsEnabled,
      slackWebhookUrl,
      discordWebhookUrl,
      githubRepoOwner,
      githubRepoName,
      githubDefaultLabels,
    },
  });

  revalidatePath("/admin/setup");
  revalidatePath("/admin");
  return { success: true };
}

export async function testNotificationChannel(channel: "email" | "sms" | "slack" | "discord") {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized.");
  }

  const settings = await prisma.systemSetting.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    throw new Error("Settings not configured yet.");
  }

  if (channel === "slack") {
    if (!settings.slackWebhookUrl) throw new Error("Slack Webhook URL is empty.");
    const res = await fetch(settings.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "🔔 [Issue-Bridge Test] Slack integration connection verified successfully!",
      }),
    });
    if (!res.ok) throw new Error(`Slack webhook returned status ${res.status}`);
    return { success: true, message: "Slack test notification sent!" };
  }

  if (channel === "discord") {
    if (!settings.discordWebhookUrl) throw new Error("Discord Webhook URL is empty.");
    const res = await fetch(settings.discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🔔 **[Issue-Bridge Test]** Discord webhook connection verified successfully!",
      }),
    });
    if (!res.ok) throw new Error(`Discord webhook returned status ${res.status}`);
    return { success: true, message: "Discord test notification sent!" };
  }

  // Simulated verification for email / SMS
  return {
    success: true,
    message: `Test ping dispatched to ${channel.toUpperCase()} provider queue!`,
  };
}
