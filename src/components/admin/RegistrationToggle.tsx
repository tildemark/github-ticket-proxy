"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePublicRegistration } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2 } from "lucide-react";

export function RegistrationToggle({ initialAllowed }: { initialAllowed: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      try {
        await togglePublicRegistration(!initialAllowed);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          {initialAllowed ? (
            <Unlock className="h-4 w-4 text-emerald-400" />
          ) : (
            <Lock className="h-4 w-4 text-amber-400" />
          )}
          <h4 className="text-sm font-semibold text-white">
            {initialAllowed ? "Public Registration Enabled" : "Strict Invite-Only Mode"}
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          {initialAllowed
            ? "Anyone with your portal link can sign up without an invitation."
            : "Registration is restricted. New users must receive an invite link from an admin."}
        </p>
      </div>

      <Button
        size="sm"
        variant={initialAllowed ? "destructive" : "default"}
        onClick={handleToggle}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : initialAllowed ? (
          "Switch to Invite-Only"
        ) : (
          "Enable Public Registration"
        )}
      </Button>
    </div>
  );
}
