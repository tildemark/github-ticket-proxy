import Link from "next/link";
import { ShieldCheck, Plus, Lock, LogOut, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({
  userName,
  userRole,
}: {
  userName?: string;
  userRole?: "CLIENT" | "AGENT" | "ADMIN";
}) {
  const isAdminOrAgent = userRole === "ADMIN" || userRole === "AGENT";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Issue-Bridge</span>
              <span
                className={`text-[10px] ml-2 px-1.5 py-0.5 rounded font-mono border font-semibold ${
                  userRole === "ADMIN"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    : userRole === "AGENT"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {userRole || "CLIENT"} PORTAL
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              Client Tickets
            </Link>
            <Link
              href="/dashboard/new"
              className="text-sm font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              Submit Ticket
            </Link>

            {isAdminOrAgent && (
              <Link
                href="/admin"
                className="text-sm font-medium text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors flex items-center gap-1.5 ml-2"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin & Triage Console
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 pl-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-inner ${
                userRole === "ADMIN"
                  ? "bg-purple-600"
                  : userRole === "AGENT"
                  ? "bg-amber-600"
                  : "bg-emerald-600"
              }`}
            >
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-medium text-slate-200">{userName || "User"}</p>
              <p className="text-slate-500 text-[10px] uppercase font-mono">{userRole || "CLIENT"}</p>
            </div>
          </div>

          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white gap-1 px-2.5">
              <LogOut className="h-3.5 w-3.5" />
              <span>Switch User</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
