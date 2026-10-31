"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserStatus } from "@/actions/admin-users";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck, Loader2 } from "lucide-react";

export function UserAccessButton({
  userId,
  isActive,
  userName,
}: {
  userId: string;
  isActive: boolean;
  userName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    const actionLabel = isActive ? "Revoke" : "Restore";
    if (confirm(`Are you sure you want to ${actionLabel.toLowerCase()} access for ${userName}?`)) {
      startTransition(async () => {
        try {
          await toggleUserStatus(userId, isActive);
          router.refresh();
        } catch (err: any) {
          alert(err.message || "Failed to update user access.");
        }
      });
    }
  }

  return (
    <Button
      size="sm"
      variant={isActive ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs h-7 px-2.5 gap-1.5 ${
        isActive
          ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
          : "bg-emerald-600 hover:bg-emerald-500 text-white"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isActive ? (
        <>
          <UserX className="h-3.5 w-3.5" />
          Revoke Access
        </>
      ) : (
        <>
          <UserCheck className="h-3.5 w-3.5" />
          Restore Access
        </>
      )}
    </Button>
  );
}
