"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const user = await getCurrentUser();
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const priority = (formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "MEDIUM";

  if (!subject || !description) {
    throw new Error("Subject and description are required.");
  }

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
      tier: "L1_SUPPORT",
      source: "WEB",
      authorId: user.id,
      companyId: assignedCompanyId || undefined,
    },
  });

  // Handle uploaded attachments/screenshots
  const files = formData.getAll("attachments") as File[];
  for (const file of files) {
    if (file && file.size > 0 && file.name) {
      const uploadRes = await uploadFile(file);
      await prisma.attachment.create({
        data: {
          fileName: uploadRes.fileName,
          fileUrl: uploadRes.fileUrl,
          fileType: uploadRes.fileType,
          fileSize: uploadRes.fileSize,
          ticketId: ticket.id,
        },
      });
    }
  }

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

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const hasAccess =
    ticket.authorId === user.id ||
    (user.companyId && ticket.companyId === user.companyId) ||
    user.role === "ADMIN" ||
    user.role === "AGENT";

  if (!hasAccess && user.role === "CLIENT") {
    throw new Error("Unauthorized access to ticket.");
  }

  const isStaff = user.role === "ADMIN" || user.role === "AGENT";
  const isInternal = isStaff && formData.get("isInternal") === "true";

  const comment = await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      content: content.trim(),
      isInternal,
    },
  });

  // Handle uploaded attachments on reply
  const files = formData.getAll("attachments") as File[];
  for (const file of files) {
    if (file && file.size > 0 && file.name) {
      const uploadRes = await uploadFile(file);
      await prisma.attachment.create({
        data: {
          fileName: uploadRes.fileName,
          fileUrl: uploadRes.fileUrl,
          fileType: uploadRes.fileType,
          fileSize: uploadRes.fileSize,
          ticketId,
          commentId: comment.id,
        },
      });
    }
  }

  // Record firstResponseAt if this is the first staff response
  if (isStaff && !ticket.firstResponseAt) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { firstResponseAt: new Date() },
    });
  }

  // Auto-transition status: if client replied, set back to IN_PROGRESS
  if (user.role === "CLIENT" && ticket.status === "WAITING_ON_CLIENT") {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    });
  } else {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });
  }

  revalidatePath(`/tickets/${ticketId}`);
  return { success: true };
}

/**
 * Allow clients to close their own tickets (e.g. issue resolved on their end)
 */
export async function closeTicketByClient(ticketId: string, reason?: string) {
  const user = await getCurrentUser();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  // Security check: client must own the ticket or belong to the ticket's company
  if (user.role === "CLIENT") {
    const isOwner = ticket.authorId === user.id;
    const isSameCompany = user.companyId && ticket.companyId === user.companyId;
    if (!isOwner && !isSameCompany) {
      throw new Error("Unauthorized to close this ticket.");
    }
  }

  if (ticket.status === "CLOSED") {
    return { success: true };
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
      resolvedAt: ticket.resolvedAt || new Date(),
      updatedAt: new Date(),
    },
  });

  // Post a resolution audit log
  await prisma.comment.create({
    data: {
      content: reason
        ? `[Closed by Customer] ${reason}`
        : `[Closed by Customer] Marked as resolved and closed by ${user.name || user.email}.`,
      ticketId,
      authorId: user.id,
      isInternal: false, // Visible to both client and staff
    },
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Auto-close tickets that have been inactive in WAITING_ON_CLIENT for N days
 * Default: 5 days
 */
export async function autoCloseStaleTickets(daysThreshold = 5) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  const staleTickets = await prisma.ticket.findMany({
    where: {
      status: "WAITING_ON_CLIENT",
      updatedAt: { lte: cutoffDate },
    },
    select: { id: true, subject: true },
  });

  let closedCount = 0;
  for (const t of staleTickets) {
    await prisma.ticket.update({
      where: { id: t.id },
      data: {
        status: "CLOSED",
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Find system or admin user to attribute the automated comment
    const systemUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (systemUser) {
      await prisma.comment.create({
        data: {
          content: `[Auto-Closed] This ticket was automatically closed after ${daysThreshold} days with no customer response. If you still require assistance, please create a new ticket or contact support.`,
          ticketId: t.id,
          authorId: systemUser.id,
          isInternal: false,
        },
      });
    }
    closedCount++;
  }

  if (closedCount > 0) {
    revalidatePath("/dashboard");
    revalidatePath("/admin");
  }

  return { closedCount };
}

