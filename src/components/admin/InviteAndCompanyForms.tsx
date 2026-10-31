"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvitation, createCompany } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Building2, Copy, Check, Loader2, Link2, Plus } from "lucide-react";

export function InviteAndCompanyForms({
  companies,
}: {
  companies: { id: string; name: string; domain: string | null }[];
}) {
  const router = useRouter();
  const [isPendingInvite, startInviteTransition] = useTransition();
  const [isPendingCompany, startCompanyTransition] = useTransition();

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreateInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startInviteTransition(async () => {
      try {
        const result = await createInvitation(formData);
        if (result?.inviteUrl) {
          const fullUrl = `${window.location.origin}${result.inviteUrl}`;
          setGeneratedLink(fullUrl);
          form.reset();
          router.refresh();
        }
      } catch (err: any) {
        alert(err.message || "Failed to create invitation");
      }
    });
  }

  async function handleCreateCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startCompanyTransition(async () => {
      try {
        await createCompany(formData);
        form.reset();
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to create company");
      }
    });
  }

  function handleCopy() {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Invite Form */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-400" />
            Send Client or Agent Invitation
          </CardTitle>
          <CardDescription>
            Generate a secure invite token linked to a company and role.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Email Address *
              </label>
              <Input
                name="email"
                type="email"
                required
                placeholder="client.executive@company.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assign Company
                </label>
                <select
                  name="companyId"
                  className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="">No Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue="CLIENT"
                  className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="CLIENT">Client</option>
                  <option value="AGENT">Support Agent</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={isPendingInvite} className="w-full gap-2">
              {isPendingInvite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Invite...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Generate Invitation Link
                </>
              )}
            </Button>
          </form>

          {/* Newly Generated Invite Banner */}
          {generatedLink && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <p className="text-xs font-semibold text-emerald-400">
                Invitation Generated! Copy & send link to client:
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex-1 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 select-all font-mono"
                />
                <Button size="sm" onClick={handleCopy} className="gap-1 px-3">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Company Form */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-400" />
            Add New Client Company
          </CardTitle>
          <CardDescription>
            Register tenant companies to scope client tickets together.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <Input
                name="name"
                required
                placeholder="e.g. Wayne Enterprises"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Corporate Domain (Optional)
              </label>
              <Input
                name="domain"
                placeholder="e.g. wayneenterprises.com"
              />
            </div>

            <Button
              type="submit"
              disabled={isPendingCompany}
              variant="outline"
              className="w-full gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
            >
              {isPendingCompany ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Company...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Company
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
