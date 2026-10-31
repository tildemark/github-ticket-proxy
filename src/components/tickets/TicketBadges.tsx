import { Badge } from "@/components/ui/badge";

export function TicketStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/25">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
          Open
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          In Progress
        </span>
      );
    case "WAITING_ON_CLIENT":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-950/20">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
          Waiting on You
        </span>
      );
    case "RESOLVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          Resolved
        </span>
      );
    case "CLOSED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
          {status}
        </span>
      );
  }
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "URGENT":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
          Urgent
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-orange-500/15 text-orange-300 border border-orange-500/30">
          High
        </span>
      );
    case "MEDIUM":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60">
          Med
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase bg-slate-800/40 text-slate-400 border border-slate-800">
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
          {priority}
        </span>
      );
  }
}

export function EscalationTierBadge({ tier }: { tier: string }) {
  switch (tier) {
    case "ENGINEERING_ESCALATED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-200 border border-purple-500/35 shadow-sm">
          Engineering Escalated
        </span>
      );
    case "L2_SENIOR":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          L2 Senior
        </span>
      );
    case "L1_SUPPORT":
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
          L1 Support
        </span>
      );
  }
}
