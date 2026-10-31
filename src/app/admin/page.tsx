import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/TicketBadges";
import { AdminTicketActions } from "@/components/admin/AdminTicketActions";
import {
  ShieldAlert,
  GitPullRequest,
  Building2,
  MailCheck,
  UserCheck,
  Clock,
  ExternalLink,
  Plus,
  Settings,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  // All tickets across all companies for Agents & Admins
  const [tickets, companies, invitations, systemSettings] = await Promise.all([
    prisma.ticket.findMany({
      include: {
        author: {
          select: { name: true, email: true },
        },
        company: {
          select: { name: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
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

  const escalatedCount = tickets.filter((t) => t.githubIssueId !== null).length;
  const unassignedEscalation = tickets.filter((t) => t.githubIssueId === null).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Header userName={user.name || "Staff"} userRole={user.role} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Navigation Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-950 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase">
                <ShieldAlert className="h-3.5 w-3.5" />
                Engineering Triage Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Support Staff & Ticket Management
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Cross-company ticket queue, GitHub escalation engine, and client invitation management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/companies">
              <Button size="default" variant="outline" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 font-semibold gap-1.5">
                <Building2 className="h-4 w-4" />
                Company Client Directory
              </Button>
            </Link>
            <Link href="/admin/invites">
              <Button size="default" className="bg-purple-600 hover:bg-purple-500 font-semibold gap-1.5">
                <MailCheck className="h-4 w-4" />
                Manage Invitations
              </Button>
            </Link>
          </div>
        </div>

        {/* System & Triage Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Global Tickets</p>
                <p className="text-2xl font-bold text-white mt-1">{tickets.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-400 font-medium">GitHub Escalated</p>
                <p className="text-2xl font-bold text-white mt-1">{escalatedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <GitPullRequest className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-400 font-medium">Active Companies</p>
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
                <p className="text-xs uppercase tracking-wider text-emerald-400 font-medium">Registration Mode</p>
                <p className="text-sm font-bold text-white mt-2">
                  {systemSettings?.allowPublicRegistration ? "Open / Public" : "Strict Invite-Only"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Ticket Queue */}
        <Card className="bg-slate-900/50 border-slate-800/80 shadow-2xl backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-lg">Cross-Company Triage Queue</CardTitle>
            <CardDescription>
              Support tickets submitted across all client organizations. Escalate issues to your private GitHub repo without exposing links to clients.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/60">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-5 sm:px-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TicketStatusBadge status={ticket.status} />
                        <TicketPriorityBadge priority={ticket.priority} />
                        
                        {ticket.company && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
                            <Building2 className="h-3 w-3" />
                            {ticket.company.name}
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-mono">
                          #{ticket.id.slice(-6)}
                        </span>

                        <span className="text-xs text-slate-400">
                          by <strong className="text-slate-300">{ticket.author.name || ticket.author.email}</strong>
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white">
                        {ticket.subject}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <AdminTicketActions
                        ticketId={ticket.id}
                        githubIssueId={ticket.githubIssueId}
                        githubIssueUrl={ticket.githubIssueUrl}
                        status={ticket.status}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
