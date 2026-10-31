"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { createGitHubIssue } from "@/lib/github";
import { revalidatePath } from "next/cache";

export async function escalateToGitHub(ticketId: string) {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Only support staff can escalate to GitHub.");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      author: true,
      company: true,
      comments: {
        where: { isInternal: false },
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  if (ticket.githubIssueId) {
    return {
      success: true,
      issueId: ticket.githubIssueId,
      url: ticket.githubIssueUrl,
    };
  }

  // Format real GitHub issue body
  const issueMarkdown = [
    `### 🌉 Issue-Bridge Support Escalation`,
    ``,
    `- **Internal Ticket ID:** \`#${ticket.id}\``,
    `- **Client Company:** ${ticket.company ? ticket.company.name : "Direct User"}`,
    `- **Client Submitter:** ${ticket.author.name || ticket.author.email}`,
    `- **Priority:** \`${ticket.priority}\``,
    `- **Escalated By:** ${user.name} (${user.role})`,
    ``,
    `---`,
    `#### Bug / Feature Description`,
    `${ticket.description}`,
    ``,
    ticket.comments.length > 0
      ? `#### Public Conversation Context (${ticket.comments.length} replies)\n` +
        ticket.comments
          .map((c) => `> **${c.author.name}:**\n> ${c.content.replace(/\n/g, "\n> ")}`)
          .join("\n\n")
      : "",
  ].join("\n");

  const ghIssue = await createGitHubIssue({
    title: `[Ticket #${ticket.id.slice(-6)}] ${ticket.subject}`,
    body: issueMarkdown,
    labels: ["support-escalation", `priority:${ticket.priority.toLowerCase()}`],
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      githubIssueId: ghIssue.issueNumber,
      githubIssueUrl: ghIssue.issueUrl,
      tier: "ENGINEERING_ESCALATED",
      status: "IN_PROGRESS",
      escalatedAt: new Date(),
    },
  });

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: `[GitHub Escalation] Created real issue in private repository: #${ghIssue.issueNumber} (${ghIssue.issueUrl}). Escalation tier changed to Engineering.`,
      isInternal: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true, issueId: ghIssue.issueNumber, url: ghIssue.issueUrl };
}

export async function escalateTier(ticketId: string, newTier: "L1_SUPPORT" | "L2_SENIOR" | "ENGINEERING_ESCALATED") {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized.");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { tier: newTier },
  });

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: `[Escalation Tier] Changed to ${newTier.replace(/_/g, " ")} by ${user.name}.`,
      isInternal: true,
    },
  });

  revalidatePath("/admin");
  return { success: true, newTier };
}

export async function assignTicket(ticketId: string, agentId: string | null) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized.");
  }

  const assignedUser = agentId
    ? await prisma.user.findUnique({ where: { id: agentId } })
    : null;

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: agentId },
  });

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: agentId
        ? `[Assignment] Delegated to ${assignedUser?.name || assignedUser?.email} by ${user.name}.`
        : `[Assignment] Unassigned by ${user.name}.`,
      isInternal: true,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: any) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized.");
  }

  const resolvedAt = status === "RESOLVED" || status === "CLOSED" ? new Date() : null;

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status,
      ...(status === "RESOLVED" || status === "CLOSED"
        ? { resolvedAt: new Date() }
        : { resolvedAt: null }),
    },
  });

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: `[Status Change] Ticket status set to ${status.replace(/_/g, " ")} by ${user.name}.`,
      isInternal: true,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}
