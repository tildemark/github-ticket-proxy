import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock, MessageSquare, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Issue-Bridge</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button size="sm">Go to Portal</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-20 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Lock className="h-3.5 w-3.5" />
            <span>Secure Support Proxy Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Connect Client Support to Private{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              GitHub Repositories
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Issue-Bridge acts as an isolated gateway. Clients track tickets and communicate seamlessly, while your internal engineering discussions and GitHub repo remain 100% private.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-base gap-2 shadow-xl shadow-emerald-500/25">
                Launch Client Portal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/new">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                Submit New Ticket
              </Button>
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <Lock className="h-5 w-5 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-white text-sm">Strict Data Isolation</h3>
              <p className="text-xs text-slate-400 mt-1">
                GitHub issue IDs, internal repos, and developer comments are completely hidden from client queries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <MessageSquare className="h-5 w-5 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-white text-sm">Two-Way Conversations</h3>
              <p className="text-xs text-slate-400 mt-1">
                Clients post real-time replies and get answers from designated support agents and engineers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <LifeBuoy className="h-5 w-5 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-white text-sm">Omnichannel Ready</h3>
              <p className="text-xs text-slate-400 mt-1">
                Built-in models for Web, Email, and Messaging bridges with priority-based ticket triaging.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
