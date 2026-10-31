"use client";

import { useState } from "react";
import { updateSystemSettings, testNotificationChannel } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Mail,
  MessageSquare,
  Smartphone,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Send,
  Zap,
  Globe,
  Sliders,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SystemSettingsFormProps {
  initialSettings: any;
}

export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState<"email" | "sms" | "webhooks" | "github" | "general">("email");

  // Controlled form states
  const [emailProvider, setEmailProvider] = useState(initialSettings?.emailProvider || "smtp");
  const [smsEnabled, setSmsEnabled] = useState(initialSettings?.smsEnabled || false);
  const [webhookEnabled, setWebhookEnabled] = useState(initialSettings?.webhookNotificationsEnabled || false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(initialSettings?.allowPublicRegistration || false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("emailProvider", emailProvider);
    formData.set("smsEnabled", smsEnabled ? "true" : "false");
    formData.set("webhookNotificationsEnabled", webhookEnabled ? "true" : "false");
    formData.set("allowPublicRegistration", allowPublicRegistration ? "true" : "false");

    try {
      await updateSystemSettings(formData);
      setStatusMessage("System configuration saved successfully!");
      router.refresh();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTest(channel: "email" | "sms" | "slack" | "discord") {
    setTestingChannel(channel);
    try {
      const res = await testNotificationChannel(channel);
      alert(res.message);
    } catch (err: any) {
      alert(`Test failed: ${err.message}`);
    } finally {
      setTestingChannel(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === "email"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Mail className="h-4 w-4 text-emerald-400" />
          Email & SMTP
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sms")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === "sms"
              ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Smartphone className="h-4 w-4 text-purple-400" />
          SMS & Twilio
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("webhooks")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === "webhooks"
              ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Zap className="h-4 w-4 text-sky-400" />
          Slack & Discord Webhooks
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("github")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === "github"
              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <GitBranch className="h-4 w-4 text-indigo-400" />
          GitHub Defaults
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === "general"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Globe className="h-4 w-4 text-amber-400" />
          General & Security
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: EMAIL */}
        {activeTab === "email" && (
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    Email Gateway & Dispatcher
                  </CardTitle>
                  <CardDescription>
                    Configure SMTP or API services to deliver ticket alerts, agent replies, and customer status updates.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest("email")}
                  disabled={testingChannel === "email"}
                  className="text-xs h-8 border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white gap-1.5"
                >
                  {testingChannel === "email" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 text-emerald-400" />
                  )}
                  Send Test Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Provider
                  </label>
                  <select
                    value={emailProvider}
                    onChange={(e) => setEmailProvider(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="oci">Oracle Cloud Infrastructure (OCI Email Delivery)</option>
                    <option value="smtp">Custom SMTP Server</option>
                    <option value="resend">Resend (API Key)</option>
                    <option value="sendgrid">SendGrid (API Key)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Sender Approved From Address
                  </label>
                  <input
                    type="email"
                    name="smtpFromEmail"
                    defaultValue={initialSettings?.smtpFromEmail || "support@issuebridge.com"}
                    placeholder="support@yourverifieddomain.com"
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {emailProvider === "oci" && (
                <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-950/15 text-xs text-amber-200/90 leading-relaxed space-y-1">
                  <p className="font-semibold text-amber-200 flex items-center gap-1.5">
                    💡 OCI Email Delivery Setup Tip:
                  </p>
                  <p>
                    1. <strong>Hostname</strong>: <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-amber-300">smtp.email.&#123;region&#125;.oci.oraclecloud.com</code> (e.g. <code className="font-mono text-amber-300">smtp.email.us-ashburn-1.oci.oraclecloud.com</code>).<br />
                    2. <strong>Port</strong>: Recommended <code className="font-mono text-amber-300">587</code> (STARTTLS) or <code className="font-mono text-amber-300">25</code>.<br />
                    3. <strong>Username & Password</strong>: Generate via <em>OCI Console &rarr; Identity &rarr; Users &rarr; User Details &rarr; SMTP Credentials</em> (Username is an OCID, password is a generated key).<br />
                    4. <strong>Approved Sender</strong>: Ensure the <em>Sender From Address</em> above matches an Approved Sender configured in your OCI Email Delivery compartment.
                  </p>
                </div>
              )}

              {emailProvider === "smtp" || emailProvider === "oci" ? (
                <div className="space-y-4 pt-2 border-t border-slate-800/60">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        SMTP Hostname {emailProvider === "oci" && "(OCI Endpoint)"}
                      </label>
                      <input
                        type="text"
                        name="smtpHost"
                        defaultValue={initialSettings?.smtpHost || (emailProvider === "oci" ? "smtp.email.us-ashburn-1.oci.oraclecloud.com" : "")}
                        placeholder={emailProvider === "oci" ? "smtp.email.{region}.oci.oraclecloud.com" : "smtp.mailgun.org"}
                        className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        name="smtpPort"
                        defaultValue={initialSettings?.smtpPort || 587}
                        className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        SMTP Username {emailProvider === "oci" && "(OCI User OCID)"}
                      </label>
                      <input
                        type="text"
                        name="smtpUser"
                        defaultValue={initialSettings?.smtpUser || ""}
                        placeholder={emailProvider === "oci" ? "ocid1.user.oc1..aaaaaa..." : "postmaster@domain.com"}
                        className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        SMTP Password {emailProvider === "oci" && "(OCI Generated Key)"}
                      </label>
                      <input
                        type="password"
                        name="smtpPassword"
                        defaultValue={initialSettings?.smtpPassword || ""}
                        placeholder="••••••••••••••••"
                        className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/60">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {emailProvider === "resend" ? "Resend API Key" : "SendGrid API Key"}
                  </label>
                  <input
                    type="password"
                    name="resendApiKey"
                    defaultValue={initialSettings?.resendApiKey || ""}
                    placeholder="re_123456789..."
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: SMS & TWILIO */}
        {activeTab === "sms" && (
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-400" />
                    SMS Alerts & Escalation Dispatcher
                  </CardTitle>
                  <CardDescription>
                    Trigger immediate SMS alerts to on-call support engineers when URGENT tickets or SLA breaches occur.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest("sms")}
                  disabled={testingChannel === "sms"}
                  className="text-xs h-8 border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white gap-1.5"
                >
                  {testingChannel === "sms" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 text-purple-400" />
                  )}
                  Send Test SMS
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div>
                  <p className="text-xs font-medium text-slate-200">Enable Urgent SMS Notifications</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send text message pings for tickets marked with URGENT priority</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="h-4 w-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {smsEnabled && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Twilio Account SID
                      </label>
                      <input
                        type="text"
                        name="twilioAccountSid"
                        defaultValue={initialSettings?.twilioAccountSid || ""}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Twilio Auth Token
                      </label>
                      <input
                        type="password"
                        name="twilioAuthToken"
                        defaultValue={initialSettings?.twilioAuthToken || ""}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Twilio Sender Phone Number
                    </label>
                    <input
                      type="text"
                      name="twilioFromNumber"
                      defaultValue={initialSettings?.twilioFromNumber || ""}
                      placeholder="+1 (555) 000-1234"
                      className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: WEBHOOKS (SLACK / DISCORD) */}
        {activeTab === "webhooks" && (
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-sky-400" />
                Team Chat Webhook Notifications
              </CardTitle>
              <CardDescription>
                Push real-time alerts into your engineering or customer support channels when new tickets arrive.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div>
                  <p className="text-xs font-medium text-slate-200">Broadcast Ticket Events to Chat Channels</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Posts formatted messages on ticket creation and escalation</p>
                </div>
                <input
                  type="checkbox"
                  checked={webhookEnabled}
                  onChange={(e) => setWebhookEnabled(e.target.checked)}
                  className="h-4 w-4 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              {webhookEnabled && (
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Slack Incoming Webhook URL
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTest("slack")}
                        disabled={testingChannel === "slack"}
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {testingChannel === "slack" && <Loader2 className="h-3 w-3 animate-spin" />}
                        Test Slack Ping
                      </button>
                    </div>
                    <input
                      type="url"
                      name="slackWebhookUrl"
                      defaultValue={initialSettings?.slackWebhookUrl || ""}
                      placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                      className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Discord Channel Webhook URL
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTest("discord")}
                        disabled={testingChannel === "discord"}
                        className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {testingChannel === "discord" && <Loader2 className="h-3 w-3 animate-spin" />}
                        Test Discord Ping
                      </button>
                    </div>
                    <input
                      type="url"
                      name="discordWebhookUrl"
                      defaultValue={initialSettings?.discordWebhookUrl || ""}
                      placeholder="https://discord.com/api/webhooks/00000000/XXXXXX"
                      className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 4: GITHUB DEFAULTS */}
        {activeTab === "github" && (
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-indigo-400" />
                GitHub Repository Escalation Settings
              </CardTitle>
              <CardDescription>
                Configure the destination repository where issues are automatically created on one-click escalation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Repo Owner / Organization
                  </label>
                  <input
                    type="text"
                    name="githubRepoOwner"
                    defaultValue={initialSettings?.githubRepoOwner || "tildemark"}
                    placeholder="e.g. tildemark"
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Repo Name
                  </label>
                  <input
                    type="text"
                    name="githubRepoName"
                    defaultValue={initialSettings?.githubRepoName || "trace"}
                    placeholder="e.g. trace"
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Default Labels (Comma Separated)
                </label>
                <input
                  type="text"
                  name="githubDefaultLabels"
                  defaultValue={initialSettings?.githubDefaultLabels || "support-escalation, triage"}
                  placeholder="support-escalation, triage, customer-issue"
                  className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: GENERAL & SECURITY */}
        {activeTab === "general" && (
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                Registration & Security Policies
              </CardTitle>
              <CardDescription>
                Control user registration access and authentication modes across companies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div>
                  <p className="text-xs font-medium text-slate-200">Allow Public Registration</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    If disabled, new users can only create accounts via Admin Invitations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowPublicRegistration}
                  onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                  className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 px-5 gap-1.5 shadow-md shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Save System Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
