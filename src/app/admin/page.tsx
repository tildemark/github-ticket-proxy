import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TicketStatusBadge, TicketPriorityBadge, EscalationTierBadge } from "@/components/tickets/TicketBadges";
import { AdminTicketActions } from "@/components/admin/AdminTicketActions";
import { formatDuration, calculateResolutionDuration, calculateElapsed, getSLAStatus } from "@/lib/kpi";
import {
  ShieldAlert,
  GitPullRequest,
  Building2,
  MailCheck,
  UserCheck,
  Clock,
  ExternalLink,
  Plus,
  Users,
  Paperclip,
  Activity,
  CheckCircle2,
  Timer,
  Zap,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

interface AdminDashboardPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const user = await getCurrentUser();
  const { tab = "active", page = "1" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 10;

  // Filter definition
  let statusWhere: any = {};
  if (tab === "active") {
    statusWhere = { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"] } };
  } else if (tab === "waiting") {
    statusWhere = { status: "WAITING_ON_CLIENT" };
  } else if (tab === "resolved") {
    statusWhere = { status: { in: ["RESOLVED", "CLOSED"] } };
  } else {
    // "all"
    statusWhere = {};
  }

  const [
    allTicketsForKpis,
    filteredTickets,
    totalCount,
    activeCount,
    waitingCount,
    resolvedCount,
    companies,
    agents,
    systemSettings,
  ] = await Promise.all([
    prisma.ticket.findMany({
      select: {
        id: true,
        priority: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        firstResponseAt: true,
        githubIssueId: true,
      },
    }),
    prisma.ticket.findMany({
      where: statusWhere,
      include: {
        author: {
          select: { name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { name: true },
        },
        attachments: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where: statusWhere }),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"] } } }),
    prisma.ticket.count({ where: { status: "WAITING_ON_CLIENT" } }),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.company.findMany(),
    prisma.user.findMany({
      where: {
        role: { in: ["AGENT", "ADMIN"] },
        isActive: true,
      },
      select: { id: true, name: true, email: true },
    }),
    prisma.systemSetting.findUnique({
      where: { id: "global" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Calculate KPIs
  const resolvedTickets = allTicketsForKpis.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED");
  const escalatedCount = allTicketsForKpis.filter((t) => t.githubIssueId !== null).length;

  // Mean Time to Resolution (MTTR)
  let totalResolutionTimeMs = 0;
  let resolvedCountWithTime = 0;
  resolvedTickets.forEach((t) => {
    if (t.resolvedAt) {
      totalResolutionTimeMs += new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime();
      resolvedCountWithTime++;
    }
  });
  const avgMTTR = resolvedCountWithTime > 0 ? formatDuration(totalResolutionTimeMs / resolvedCountWithTime) : "N/A";

  // First Response Time (FRT)
  let totalFRTMs = 0;
  let frtCount = 0;
  allTicketsForKpis.forEach((t) => {
    if (t.firstResponseAt) {
      totalFRTMs += new Date(t.firstResponseAt).getTime() - new Date(t.createdAt).getTime();
      frtCount++;
    }
  });
  const avgFRT = frtCount > 0 ? formatDuration(totalFRTMs / frtCount) : "N/A";

  // SLA Compliance
  const slaBreaches = allTicketsForKpis.filter((t) => {
    const sla = getSLAStatus(t.priority, t.createdAt, t.resolvedAt);
    return sla.isBreached && t.status !== "RESOLVED" && t.status !== "CLOSED";
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Header userName={user.name || "Staff"} userRole={user.role} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Command Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-7 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25 text-[11px] font-mono font-medium">
                  <ShieldAlert className="h-3 w-3" />
                  Live Engineering Sync &bull; tildemark/trace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Support & Triage Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Track resolution SLA compliance, delegate ticket ownership across support tiers, and push verified bugs directly into private GitHub repositories.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link href="/admin/companies">
                <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs h-9 px-3.5 gap-1.5 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  Companies
                </Button>
              </Link>
              <Link href="/admin/invites">
                <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs h-9 px-3.5 gap-1.5 font-medium">
                  <MailCheck className="h-3.5 w-3.5 text-purple-400" />
                  Invitations
                </Button>
              </Link>
              <Link href="/admin/setup">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-3.5 gap-1.5 font-medium shadow-md shadow-emerald-600/20">
                  <Settings className="h-3.5 w-3.5" />
                  Backend Setup
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Resolution Time & Support KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/30 border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">MTTR (Avg Fix Time)</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{avgMTTR}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{resolvedTickets.length} resolved tickets</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Timer className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/30 border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Avg First Response</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{avgFRT}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Time to first triage note</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Zap className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/30 border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">GitHub Issues</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{escalatedCount}</p>
                <p className="text-[11px] text-purple-400/80 mt-0.5">Synced with tildemark/trace</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <GitPullRequest className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border backdrop-blur-sm transition-colors ${
            slaBreaches > 0
              ? "bg-rose-950/15 border-rose-500/30 shadow-lg shadow-rose-950/20"
              : "bg-slate-900/30 border-slate-800/80 hover:border-slate-700/80"
          }`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">SLA Breaches</p>
                <p className={`text-2xl font-bold mt-1 font-mono tracking-tight ${slaBreaches > 0 ? "text-rose-400" : "text-white"}`}>
                  {slaBreaches}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {slaBreaches > 0 ? "Exceeding target resolution" : "All tickets within SLA target"}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                slaBreaches > 0
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Ticket Queue */}
        <Card className="bg-slate-900/50 border-slate-800/80 shadow-2xl backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Cross-Company Triage & Delegation Queue</CardTitle>
                <CardDescription>
                  Assign tickets to agents, promote between L1/L2 tiers, and trigger one-click issue creation in <strong>tildemark/trace</strong>.
                </CardDescription>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                <Link
                  href="/admin?tab=active"
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    tab === "active"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  Active ({activeCount})
                </Link>
                <Link
                  href="/admin?tab=waiting"
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    tab === "waiting"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  Waiting on Client ({waitingCount})
                </Link>
                <Link
                  href="/admin?tab=resolved"
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    tab === "resolved"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  Resolved ({resolvedCount})
                </Link>
                <Link
                  href="/admin?tab=all"
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    tab === "all"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  All ({allTicketsForKpis.length})
                </Link>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 px-4">
                <CheckCircle2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No tickets found in this view</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {tab === "active"
                    ? "Great job! All active tickets have been addressed or resolved."
                    : "No tickets match the selected status filter."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredTickets.map((ticket) => {
                  const duration = calculateResolutionDuration(ticket.createdAt, ticket.resolvedAt);
                  const elapsed = calculateElapsed(ticket.createdAt);
                  const sla = getSLAStatus(ticket.priority, ticket.createdAt, ticket.resolvedAt);
                  const isSolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

                  return (
                    <div key={ticket.id} className="p-5 sm:px-6 hover:bg-slate-800/30 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                            <EscalationTierBadge tier={ticket.tier} />
                            
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

                            {/* Live Duration or Fixed Duration Chip */}
                            {isSolved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                Fixed in {duration || "<1m"}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
                                sla.isBreached
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}>
                                <Clock className="h-3 w-3" />
                                Open: {elapsed} {sla.isBreached && "(SLA Breached)"}
                              </span>
                            )}

                            {ticket.assignedTo && (
                              <span className="inline-flex items-center gap-1 text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                <UserCheck className="h-3 w-3" />
                                Assigned: {ticket.assignedTo.name || ticket.assignedTo.email}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-semibold text-white">
                            {ticket.subject}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                            {ticket.description}
                          </p>

                          {/* Attachments preview */}
                          {ticket.attachments.length > 0 && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Paperclip className="h-3 w-3" /> {ticket.attachments.length} attachment(s):
                              </span>
                              {ticket.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-400 hover:underline bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                                >
                                  {att.fileName}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-3 flex-wrap">
                          <Link href={`/tickets/${ticket.id}`}>
                            <Button size="sm" variant="outline" className="text-xs h-8 px-2.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                              View & Reply ({ticket._count.comments})
                            </Button>
                          </Link>

                          <AdminTicketActions
                            ticketId={ticket.id}
                            githubIssueId={ticket.githubIssueId}
                            githubIssueUrl={ticket.githubIssueUrl}
                            status={ticket.status}
                            tier={ticket.tier}
                            assignedToId={ticket.assignedToId}
                            agents={agents}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
                <div>
                  Showing Page <strong className="text-white">{currentPage}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong> ({totalCount} total tickets)
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin?tab=${tab}&page=${currentPage - 1}`}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors ${
                      currentPage <= 1
                        ? "pointer-events-none opacity-40 text-slate-600"
                        : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Link>
                  <Link
                    href={`/admin?tab=${tab}&page=${currentPage + 1}`}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors ${
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-40 text-slate-600"
                        : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
