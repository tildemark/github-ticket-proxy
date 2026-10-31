import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { ClientProfileSettings } from "@/components/account/ClientProfileSettings";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCircle } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header userName={user.name || "User"} userRole={user.role} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Account Management
          </span>
        </div>

        {/* Page Title Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your credentials, update your profile details, and ensure account security.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Self-Service Profile & Password Form */}
        <ClientProfileSettings
          initialUser={{
            name: user.name,
            email: user.email || "",
            role: user.role,
            companyName: user.company?.name || null,
          }}
        />
      </main>
    </div>
  );
}
