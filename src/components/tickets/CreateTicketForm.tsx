"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTicket } from "@/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Loader2, Building2, Paperclip, UploadCloud } from "lucide-react";

export function CreateTicketForm({
  userRole,
  userCompany,
  companies,
}: {
  userRole: "CLIENT" | "AGENT" | "ADMIN";
  userCompany?: { id: string; name: string } | null;
  companies: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await createTicket(formData);
        if (result?.ticketId) {
          router.push(`/tickets/${result.ticketId}`);
        } else {
          router.push("/dashboard");
        }
      } catch (err: any) {
        alert(err.message || "Failed to create ticket");
      }
    });
  }

  const isStaff = userRole === "ADMIN" || userRole === "AGENT";

  return (
    <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
      <CardHeader className="border-b border-slate-800/80 pb-5">
        <CardTitle className="text-xl sm:text-2xl font-bold text-white">
          Create a Support Ticket
        </CardTitle>
        <CardDescription>
          {isStaff ? (
            <span className="text-purple-300">
              Staff Portal: Create a ticket on behalf of a specific client company.
            </span>
          ) : userCompany ? (
            <span className="text-indigo-300 flex items-center gap-1.5 mt-0.5">
              <Building2 className="h-3.5 w-3.5" /> Submitting for {userCompany.name}
            </span>
          ) : (
            "Submit details about the issue you are experiencing."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Company Selector (Staff only) */}
          {isStaff && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <label
                htmlFor="companyId"
                className="block text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5" />
                Select Target Client Company *
              </label>
              <select
                id="companyId"
                name="companyId"
                required
                className="flex h-10 w-full rounded-lg border border-purple-500/30 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all cursor-pointer"
              >
                <option value="">-- Choose Client Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                This ticket will only be visible to members of the selected company and support staff.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
            >
              Subject / Summary *
            </label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="e.g. Webhook signature verification fails with custom headers"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
            >
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="MEDIUM"
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 transition-all cursor-pointer"
            >
              <option value="LOW">Low (Minor inquiry, documentation)</option>
              <option value="MEDIUM">Medium (General issue or request)</option>
              <option value="HIGH">High (Impacted functionality)</option>
              <option value="URGENT">Urgent (Production critical outage)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
            >
              Description & Reproduction Steps *
            </label>
            <Textarea
              id="description"
              name="description"
              required
              rows={6}
              placeholder="Please provide steps to reproduce, relevant error logs, request IDs, or unexpected behavior..."
            />
          </div>

          {/* Screenshot / File Attachments upload */}
          <div className="space-y-2">
            <label
              htmlFor="attachments"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <Paperclip className="h-3.5 w-3.5 text-emerald-400" />
              Upload Screenshots & Error Logs (Optional)
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-950 transition-colors">
              <UploadCloud className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                id="attachments"
                name="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.log,.json"
                className="text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Attach error screenshots, terminal outputs, or PDF reports (PNG, JPG, PDF, TXT, LOG).
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Ticket & Uploading Files...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
