"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const user = await getCurrentUser();
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const priority = (formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "MEDIUM";

  if (!subject || !description) {
    throw new Error("Subject and description are required.");
  }

  // If user is AGENT or ADMIN, they can explicitly select the target company
  // If user is CLIENT, companyId is strictly bound to user.companyId
  let assignedCompanyId: string | null = user.companyId;

  if (user.role === "ADMIN" || user.role === "AGENT") {
    const selectedCompanyId = formData.get("companyId") as string;
    if (selectedCompanyId) {
      assignedCompanyId = selectedCompanyId;
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      subject,
      description,
      priority,
      status: "OPEN",
      source: "WEB",
      authorId: user.id,
      companyId: assignedCompanyId || undefined,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, ticketId: ticket.id };
}

export async function addComment(formData: FormData) {
  const user = await getCurrentUser();
  const ticketId = formData.get("ticketId") as string;
  const content = formData.get("content") as string;

  if (!ticketId || !content?.trim()) {
    throw new Error("Ticket ID and comment content are required.");
  }

  // Ensure client only comments on tickets owned by them or their company
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const hasAccess =
    ticket.authorId === user.id ||
    (user.companyId && ticket.companyId === user.companyId);

  if (!hasAccess && user.role === "CLIENT") {
    throw new Error("Unauthorized access to ticket.");
  }

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: content.trim(),
      isInternal: false, // Client comments are public to the ticket
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/tickets/${ticketId}`);
  return { success: true };
}
