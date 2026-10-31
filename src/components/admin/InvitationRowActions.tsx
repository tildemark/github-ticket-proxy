"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reinviteUser, revokeInvitation } from "@/actions/admin-users";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Copy, Check, Loader2 } from "lucide-react";

export function InvitationRowActions({
  invitationId,
  isExpired,
  isUsed,
  token,
}: {
  invitationId: string;
  isExpired: boolean;
  isUsed: boolean;
  token: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleReinvite() {
    startTransition(async () => {
      try {
        const res = await reinviteUser(invitationId);
        if (res?.inviteUrl) {
          const full = `${window.location.origin}${res.inviteUrl}`;
          await navigator.clipboard.writeText(full);
          alert("Invite refreshed with a new 7-day token! Link copied to clipboard.");
        }
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to re-invite.");
      }
    });
  }

  function handleRevoke() {
    if (confirm("Revoke and permanently delete this invitation?")) {
      startTransition(async () => {
        try {
          await revokeInvitation(invitationId);
          router.refresh();
        } catch (err: any) {
          alert(err.message || "Failed to revoke invitation.");
        }
      });
    }
  }

  function handleCopy() {
    const full = `${window.location.origin}/register?invite=${token}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      {!isUsed && !isExpired && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="text-xs h-7 px-2.5 gap-1 border-slate-700 hover:bg-slate-800"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy Link"}</span>
        </Button>
      )}

      {(isExpired || isUsed) && (
        <Button
          size="sm"
          variant="default"
          onClick={handleReinvite}
          disabled={isPending}
          className="text-xs h-7 px-2.5 gap-1 bg-amber-600 hover:bg-amber-500 text-white"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          <span>Re-Invite</span>
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={handleRevoke}
        disabled={isPending}
        className="text-xs h-7 px-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
        title="Revoke / Delete Invite"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
