"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { escalateToGitHub, updateTicketStatus } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { GitPullRequest, CheckCircle, Clock, ExternalLink, Loader2 } from "lucide-react";

export function AdminTicketActions({
  ticketId,
  githubIssueId,
  githubIssueUrl,
  status,
}: {
  ticketId: string;
  githubIssueId: number | null;
  githubIssueUrl: string | null;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleEscalate() {
    startTransition(async () => {
      try {
        await escalateToGitHub(ticketId);
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
      {githubIssueId ? (
        <a
          href={githubIssueUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono font-medium hover:bg-purple-500/20 transition-colors"
        >
          <GitPullRequest className="h-3.5 w-3.5 text-purple-400" />
          <span>GitHub Issue #{githubIssueId}</span>
          <ExternalLink className="h-3 w-3 text-purple-400" />
        </a>
      ) : (
        <Button
          size="sm"
          onClick={handleEscalate}
          disabled={isPending}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <GitPullRequest className="h-3.5 w-3.5" />
          )}
          Escalate to GitHub
        </Button>
      )}

      {status !== "RESOLVED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange("RESOLVED")}
          disabled={isPending}
          className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Mark Resolved
        </Button>
      )}

      {status === "RESOLVED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange("IN_PROGRESS")}
          disabled={isPending}
          className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Reopen Ticket
        </Button>
      )}
    </div>
  );
}
