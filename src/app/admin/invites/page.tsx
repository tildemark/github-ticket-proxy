import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegistrationToggle } from "@/components/admin/RegistrationToggle";
import { InviteAndCompanyForms } from "@/components/admin/InviteAndCompanyForms";
import { InvitationRowActions } from "@/components/admin/InvitationRowActions";
import { ArrowLeft, Mail, Building2, CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";

export default async function AdminInvitesPage() {
  const user = await getCurrentUser();

  const [companies, invitations, settings] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true, tickets: true },
        },
      },
    }),
    prisma.invitation.findMany({
      include: { company: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.systemSetting.findUnique({
      where: { id: "global" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Header userName={user.name || "Staff"} userRole={user.role} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Triage Console
            </Button>
          </Link>
        </div>

        {/* System Registration Mode Setting */}
        <RegistrationToggle
          initialAllowed={settings?.allowPublicRegistration ?? false}
        />

        {/* Creation Forms */}
        <InviteAndCompanyForms companies={companies} />

        {/* Existing Invitations List */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-base text-white">Pending & Used Invitations</CardTitle>
            <CardDescription>
              Track which invitations have been sent, redeemed by clients, or expired.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {invitations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No invitations issued yet. Use the form above to generate one.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {invitations.map((inv) => {
                  const isUsed = Boolean(inv.usedAt);
                  const isExpired = !isUsed && new Date() > inv.expiresAt;

                  return (
                    <div
                      key={inv.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {inv.email}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {inv.role}
                          </span>
                          {inv.company && (
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                              {inv.company.name}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 font-mono">
                          Token: {inv.token.slice(0, 16)}...
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {isUsed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Redeemed
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/30">
                            <XCircle className="h-3.5 w-3.5" />
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                            <Clock className="h-3.5 w-3.5" />
                            Valid (Expires {new Date(inv.expiresAt).toLocaleDateString()})
                          </span>
                        )}

                        <InvitationRowActions
                          invitationId={inv.id}
                          isExpired={isExpired}
                          isUsed={isUsed}
                          token={inv.token}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
