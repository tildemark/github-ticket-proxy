"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  escalateToGitHub,
  escalateTier,
  assignTicket,
  updateTicketStatus,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  GitPullRequest,
  CheckCircle,
  ExternalLink,
  Loader2,
  TrendingUp,
  UserCheck,
  Clock,
  HelpCircle,
} from "lucide-react";

export function AdminTicketActions({
  ticketId,
  githubIssueId,
  githubIssueUrl,
  status,
  tier,
  assignedToId,
  agents = [],
}: {
  ticketId: string;
  githubIssueId: number | null;
  githubIssueUrl: string | null;
  status: string;
  tier: "L1_SUPPORT" | "L2_SENIOR" | "ENGINEERING_ESCALATED";
  assignedToId: string | null;
  agents: { id: string; name: string | null; email: string | null }[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleEscalateGitHub() {
    startTransition(async () => {
      try {
        const res = await escalateToGitHub(ticketId);
        alert(`Successfully created real GitHub issue #${res.issueId} on tildemark/trace!`);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to escalate to GitHub");
      }
    });
  }

  function handleTierChange(newTier: "L1_SUPPORT" | "L2_SENIOR" | "ENGINEERING_ESCALATED") {
    startTransition(async () => {
      try {
        await escalateTier(ticketId, newTier);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value || null;
    startTransition(async () => {
      try {
        await assignTicket(ticketId, val);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      try {
        await updateTicketStatus(ticketId, newStatus);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. Agent Delegation / Assignment */}
      <div className="flex items-center gap-1.5">
        <select
          value={assignedToId || ""}
          onChange={handleAssign}
          disabled={isPending}
          className="h-8 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <option value="">Unassigned</option>
          {agents.map((ag) => (
            <option key={ag.id} value={ag.id}>
              Assign: {ag.name || ag.email}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Escalation Tier Selector */}
      <div className="flex items-center gap-1">
        {tier === "L1_SUPPORT" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTierChange("L2_SENIOR")}
            disabled={isPending}
            className="text-xs h-8 px-2.5 text-amber-300 border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20 gap-1 font-medium"
          >
            <TrendingUp className="h-3 w-3" />
            Escalate to L2
          </Button>
        )}

        {tier === "L2_SENIOR" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTierChange("L1_SUPPORT")}
            disabled={isPending}
            className="text-xs h-8 px-2 text-slate-400 border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white"
          >
            Back to L1
          </Button>
        )}
      </div>

      {/* 3. GitHub Escalation to tildemark/trace */}
      {githubIssueId ? (
        <a
          href={githubIssueUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/25 text-xs font-mono font-medium hover:bg-purple-500/20 transition-colors shadow-sm"
        >
          <GitPullRequest className="h-3 w-3 text-purple-400" />
          <span>trace #{githubIssueId}</span>
          <ExternalLink className="h-3 w-3 text-purple-400/70" />
        </a>
      ) : (
        <Button
          size="sm"
          onClick={handleEscalateGitHub}
          disabled={isPending}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs h-8 shadow-sm shadow-purple-600/20 gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <GitPullRequest className="h-3.5 w-3.5" />
          )}
          Escalate to GitHub
        </Button>
      )}

      {/* 4. Ticket Status Workflow Controls */}
      {status !== "WAITING_ON_CLIENT" && status !== "RESOLVED" && status !== "CLOSED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange("WAITING_ON_CLIENT")}
          disabled={isPending}
          className="text-xs h-8 px-2.5 text-purple-300 border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/20 gap-1 font-medium"
        >
          <HelpCircle className="h-3 w-3" />
          Wait on Client
        </Button>
      )}

      {status !== "RESOLVED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange("RESOLVED")}
          disabled={isPending}
          className="text-xs h-8 px-2.5 text-emerald-300 border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 gap-1 font-medium"
        >
          <CheckCircle className="h-3 w-3" />
          Resolve
        </Button>
      )}

      {status === "RESOLVED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange("IN_PROGRESS")}
          disabled={isPending}
          className="text-xs h-8 px-2.5 text-slate-400 border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white gap-1"
        >
          <Clock className="h-3 w-3" />
          Reopen
        </Button>
      )}
    </div>
  );
}
