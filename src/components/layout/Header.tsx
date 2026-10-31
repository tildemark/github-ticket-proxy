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
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 p-[1.5px] shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-all">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Issue-Bridge
              </span>
              <span
                className={`text-[9px] ml-2 px-2 py-0.5 rounded-full font-mono font-medium tracking-wide border ${
                  userRole === "ADMIN"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    : userRole === "AGENT"
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                }`}
              >
                {userRole || "CLIENT"}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Client Tickets
            </Link>
            <Link
              href="/dashboard/new"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Submit Ticket
            </Link>

            {isAdminOrAgent && (
              <Link
                href="/admin"
                className="text-xs font-medium text-purple-300 hover:text-purple-200 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 transition-all flex items-center gap-1.5 ml-2 shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Staff Console
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/profile"
            className="flex items-center space-x-2.5 pl-2 border-l border-slate-800/80 group hover:opacity-85 transition-opacity"
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white shadow-inner ${
                userRole === "ADMIN"
                  ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                  : userRole === "AGENT"
                  ? "bg-gradient-to-tr from-amber-600 to-orange-500"
                  : "bg-gradient-to-tr from-emerald-600 to-teal-500"
              }`}
            >
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-medium text-slate-200 leading-tight group-hover:text-emerald-400 transition-colors">
                {userName || "User"}
              </p>
              <p className="text-slate-500 text-[10px] uppercase font-mono">{userRole || "CLIENT"}</p>
            </div>
          </Link>

          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white gap-1 px-2.5 h-8">
              <LogOut className="h-3.5 w-3.5" />
              <span>Switch User</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
