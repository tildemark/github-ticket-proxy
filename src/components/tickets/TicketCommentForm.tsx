"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/actions/tickets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, Lock, Eye } from "lucide-react";

export function TicketCommentForm({
  ticketId,
  isStaff = false,
}: {
  ticketId: string;
  isStaff?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isInternal, setIsInternal] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("isInternal", isInternal ? "true" : "false");

    startTransition(async () => {
      try {
        await addComment(formData);
        form.reset();
        setIsInternal(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to post comment");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="ticketId" value={ticketId} />

      {/* Internal Note vs Public Reply switch for Staff */}
      {isStaff && (
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setIsInternal(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              !isInternal
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Public Reply (Visible to Client)
          </button>
          <button
            type="button"
            onClick={() => setIsInternal(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              isInternal
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Internal Agent Note (Hidden from Client)
          </button>
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          {isInternal ? (
            <span className="text-amber-400 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" /> Add Private Internal Note (Dev / Support Only)
            </span>
          ) : (
            "Add Reply / Message"
          )}
        </label>
        <Textarea
          id="content"
          name="content"
          required
          rows={4}
          placeholder={
            isInternal
              ? "Leave a note for other agents or engineering (clients will never see this)..."
              : "Type your reply to the customer..."
          }
          className={`resize-y ${isInternal ? "border-amber-500/40 focus-visible:ring-amber-500/80 bg-amber-950/10" : ""}`}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            name="attachments"
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.log,.json"
            className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className={`gap-2 shrink-0 ${
            isInternal
              ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
              : ""
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : isInternal ? (
            <>
              <Lock className="h-4 w-4" />
              Save Internal Note
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Reply
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
