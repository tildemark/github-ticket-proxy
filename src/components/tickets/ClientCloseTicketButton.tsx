"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { closeTicketByClient } from "@/actions/tickets";
import { useRouter } from "next/navigation";

interface ClientCloseTicketButtonProps {
  ticketId: string;
  status: string;
}

export function ClientCloseTicketButton({ ticketId, status }: ClientCloseTicketButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (status === "CLOSED") {
    return null;
  }

  const handleClose = async () => {
    setIsSubmitting(true);
    try {
      await closeTicketByClient(ticketId, reason);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to close ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        Close Ticket
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Close this ticket?
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If your issue has been resolved or you no longer require assistance, you can close this ticket. You can leave a brief note for our support team below.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Resolution Note (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Issue resolved on our end, thanks!"
                rows={2}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm & Close Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
