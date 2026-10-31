import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/TicketBadges";
import { TicketCommentForm } from "@/components/tickets/TicketCommentForm";
import { ArrowLeft, Clock, User, ShieldCheck, MessageSquare, Building2 } from "lucide-react";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientTicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Multi-Company Scoping: Ticket is accessible if user authored it OR user belongs to the ticket's company
  const accessFilter = user.companyId
    ? {
        id,
        OR: [{ authorId: user.id }, { companyId: user.companyId }],
      }
    : {
        id,
        authorId: user.id,
      };

  const ticket = await prisma.ticket.findFirst({
    where: accessFilter,
    select: {
      id: true,
      subject: true,
      description: true,
      status: true,
      priority: true,
      source: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      comments: {
        where: {
          isInternal: false, // CRITICAL: NEVER leak internal notes to the client
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header userName={user.name || "Client"} userRole={user.role} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Tickets
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {/* Ticket Header Card */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
          <CardHeader className="border-b border-slate-800/80 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-2">
                  <span>TICKET ID</span>
                  <span className="text-emerald-400 font-semibold">#{ticket.id}</span>
                  {ticket.company && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-400 font-sans">{ticket.company.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {ticket.subject}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Original Request / Bug Description
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Thread */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Activity & Support Responses ({ticket.comments.length})
            </h3>
            <span className="text-xs text-slate-500">Live communication channel</span>
          </div>

          {ticket.comments.length === 0 ? (
            <Card className="bg-slate-900/40 border-slate-800/80 text-center py-10">
              <CardContent>
                <Clock className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">
                  No replies yet. A support agent is currently reviewing your ticket.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((comment) => {
                const isSupport = comment.author.role === "AGENT" || comment.author.role === "ADMIN";

                return (
                  <Card
                    key={comment.id}
                    className={`border transition-all ${
                      isSupport
                        ? "bg-slate-900/70 border-emerald-500/30 shadow-lg shadow-emerald-950/20"
                        : "bg-slate-900/40 border-slate-800"
                    }`}
                  >
                    <CardHeader className="py-3 px-5 border-b border-slate-800/60 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isSupport
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-700 text-slate-200"
                          }`}
                        >
                          {comment.author.name ? comment.author.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white">
                            {comment.author.name || "User"}
                          </span>
                          {isSupport && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                              Support Staff
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </CardHeader>

                    <CardContent className="py-4 px-5 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply Box */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6">
            <TicketCommentForm ticketId={ticket.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
