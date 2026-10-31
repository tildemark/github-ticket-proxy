"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/actions/tickets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

export function TicketCommentForm({ ticketId }: { ticketId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await addComment(formData);
        form.reset();
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to post comment");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <label htmlFor="content" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Add Reply / Additional Information
        </label>
        <Textarea
          id="content"
          name="content"
          required
          rows={4}
          placeholder="Type your reply to the support team here..."
          className="resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Your reply is sent directly to assigned agents and engineering triage.
        </p>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
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
