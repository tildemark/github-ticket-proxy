import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAccessButton } from "@/components/admin/UserAccessButton";
import { ResetPasswordModal } from "@/components/admin/ResetPasswordModal";
import { CompanyLifecycleModal } from "@/components/admin/CompanyLifecycleModal";
import { Building2, Users, ArrowLeft, Mail, Ticket, Plus, ShieldCheck, UserX, KeyRound, Calendar } from "lucide-react";

export default async function AdminCompaniesPage() {
  const user = await getCurrentUser();

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      users: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { tickets: true },
      },
    },
  });

  const totalClients = companies.reduce((acc, c) => acc + c.users.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Header userName={user.name || "Staff"} userRole={user.role} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Triage Console
            </Button>
          </Link>
          <Link href="/admin/invites">
            <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-500 text-white">
              <Mail className="h-4 w-4" />
              Invite New Client to Company
            </Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Registered Companies</p>
                <p className="text-2xl font-bold text-white mt-1">{companies.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Building2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-400 font-medium">Total Client Accounts</p>
                <p className="text-2xl font-bold text-white mt-1">{totalClients}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-400 font-medium">Access Control</p>
                <p className="text-sm font-semibold text-white mt-2">Active Revocation Guard</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Directories */}
        <div className="space-y-6">
          {companies.map((company) => (
            <Card key={company.id} className="bg-slate-900/60 border-slate-800 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/80 bg-slate-950/40 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-400" />
                      <CardTitle className="text-lg text-white font-bold tracking-tight">
                        {company.name}
                      </CardTitle>
                      {company.domain && (
                        <span className="text-xs font-mono text-slate-500">@{company.domain}</span>
                      )}
                    </div>
                    <CardDescription>
                      {company.users.length} members &bull; {company._count.tickets} total tickets
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <CompanyLifecycleModal
                      company={{
                        id: company.id,
                        name: company.name,
                        domain: company.domain,
                        isActive: (company as any).isActive ?? true,
                        suspensionReason: (company as any).suspensionReason || null,
                        warrantyEndsAt: (company as any).warrantyEndsAt
                          ? new Date((company as any).warrantyEndsAt).toISOString()
                          : null,
                        notes: (company as any).notes || null,
                      }}
                    />

                    <Link href={`/admin/invites?companyId=${company.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 h-7 px-2.5">
                        <Plus className="h-3 w-3" />
                        Invite Member
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {company.users.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No client members added yet. Send an invitation to get started.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {company.users.map((clientUser) => {
                      const active = clientUser.isActive ?? true;

                      return (
                        <div
                          key={clientUser.id}
                          className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                                active
                                  ? "bg-slate-800 text-slate-200"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {clientUser.name ? clientUser.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-white">
                                  {clientUser.name || "Client"}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                  {clientUser.role}
                                </span>
                                {!active && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-medium">
                                    Access Suspended
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{clientUser.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="text-xs text-slate-500 hidden sm:inline">
                              Joined {new Date(clientUser.createdAt).toLocaleDateString()}
                            </span>

                            <ResetPasswordModal
                              userId={clientUser.id}
                              userName={clientUser.name || "Client"}
                              userEmail={clientUser.email || ""}
                            />

                            <UserAccessButton
                              userId={clientUser.id}
                              isActive={active}
                              userName={clientUser.name || clientUser.email || "this user"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
