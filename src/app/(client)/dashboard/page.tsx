import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/TicketBadges";
import { Plus, MessageSquare, Clock, ArrowRight, LifeBuoy, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();

  // Multi-Company Scoping: If user is linked to a company, they see company-level tickets
  // Otherwise they see tickets they authored
  const ticketFilter = user.companyId
    ? { companyId: user.companyId }
    : { authorId: user.id };

  const tickets = await prisma.ticket.findMany({
    where: ticketFilter,
    include: {
      author: {
        select: { name: true, email: true },
      },
      company: {
        select: { name: true },
      },
      _count: {
        select: {
          comments: {
            where: { isInternal: false }, // Client only counts public replies
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const openCount = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "WAITING_ON_CLIENT"
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header
        userName={user.name || "Client"}
        userRole={user.role}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner with stats & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              {user.company ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  <Building2 className="h-3 w-3" />
                  {user.company.name}
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Company Support Portal & Tickets
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Track your open support requests and communicate directly with our engineering triage team.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link href="/dashboard/new">
              <Button size="lg" className="shadow-lg shadow-emerald-600/30 font-semibold gap-2">
                <Plus className="h-5 w-5" />
                Submit New Ticket
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Company Tickets</p>
                <p className="text-2xl font-bold text-white mt-1">{tickets.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <LifeBuoy className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400 font-medium">Active / In-Review</p>
                <p className="text-2xl font-bold text-white mt-1">{openCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-400 font-medium">Resolved Tickets</p>
                <p className="text-2xl font-bold text-white mt-1">{resolvedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Table / List */}
        <Card className="bg-slate-900/50 border-slate-800/80 shadow-2xl backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {user.company ? `${user.company.name} Tickets` : "My Submitted Tickets"}
                </CardTitle>
                <CardDescription>
                  Real-time updates on your requests. Internal developer notes and private trackers remain strictly confidential.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {tickets.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-4">
                  <LifeBuoy className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-white">No tickets submitted yet</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  When you encounter an issue or request an escalation, create a ticket and our team will get right on it.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/new">
                    <Button variant="default">
                      <Plus className="h-4 w-4 mr-1" /> Create Your First Ticket
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block group hover:bg-slate-800/40 transition-colors p-5 sm:px-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TicketStatusBadge status={ticket.status} />
                          <TicketPriorityBadge priority={ticket.priority} />
                          <span className="text-xs text-slate-500 font-mono">
                            #{ticket.id.slice(-6)}
                          </span>
                          {ticket.author.name && (
                            <span className="text-xs text-slate-400 font-medium">
                              by {ticket.author.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {ticket.subject}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 self-start sm:self-center shrink-0 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ticket._count.comments} replies</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-800/60 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
