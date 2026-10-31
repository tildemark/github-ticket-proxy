import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { getSystemSettings } from "@/actions/settings";
import { Header } from "@/components/layout/Header";
import { SystemSettingsForm } from "@/components/admin/SystemSettingsForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, ShieldCheck, Sliders } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminSetupPage() {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    redirect("/admin");
  }

  const settings = await getSystemSettings();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Header userName={user.name || "Admin"} userRole={user.role} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Operations Console
            </Button>
          </Link>
          <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            ADMINISTRATOR PRIVILEGED
          </span>
        </div>

        {/* Page Title Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-7 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-mono">
                  <Sliders className="h-3 w-3 text-emerald-400" />
                  Infrastructure & Dispatch
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Backend & Integrations Setup
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Configure your outbound email dispatchers, urgent SMS alerts via Twilio, Slack & Discord webhooks, and default GitHub repository targets.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Setup Form */}
        <SystemSettingsForm initialSettings={settings} />
      </main>
    </div>
  );
}
