"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

export async function escalateToGitHub(ticketId: string) {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Only support agents or administrators can escalate to GitHub.");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  // Simulate or assign proxy GitHub issue ID
  const simulatedIssueId = ticket.githubIssueId || Math.floor(100 + Math.random() * 900);
  const repoOwner = process.env.GITHUB_REPO_OWNER || "private-corp";
  const repoName = process.env.GITHUB_REPO_NAME || "core-api";
  const simulatedUrl = `https://github.com/${repoOwner}/${repoName}/issues/${simulatedIssueId}`;

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      githubIssueId: simulatedIssueId,
      githubIssueUrl: simulatedUrl,
      status: "IN_PROGRESS",
    },
  });

  // Record an internal comment so agents know this happened
  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: `[Internal Escalation] Linked to private GitHub repository issue #${simulatedIssueId} (${repoOwner}/${repoName}) by ${user.name}.`,
      isInternal: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true, issueId: simulatedIssueId, url: simulatedUrl };
}

export async function updateTicketStatus(ticketId: string, status: any) {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized.");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

export async function addAgentInternalComment(formData: FormData) {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized.");
  }

  const ticketId = formData.get("ticketId") as string;
  const content = formData.get("content") as string;
  const isInternal = formData.get("isInternal") === "true";

  if (!ticketId || !content?.trim()) {
    throw new Error("Ticket ID and comment are required.");
  }

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: content.trim(),
      isInternal,
    },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/tickets/${ticketId}`);
  return { success: true };
}
