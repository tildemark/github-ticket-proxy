"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only administrators can suspend or restore account access.");
  }

  // Prevent admin from revoking their own account
  if (user.id === userId) {
    throw new Error("You cannot revoke your own administrator account.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin/companies");
  revalidatePath("/admin");
  return { success: true, newStatus: !currentStatus };
}

export async function reinviteUser(invitationId: string) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized to reissue invitations.");
  }

  const existing = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!existing) {
    throw new Error("Invitation not found.");
  }

  // Generate a fresh token and extend expiration by 7 days
  const newToken = "inv_" + crypto.randomBytes(24).toString("hex");
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const updated = await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      token: newToken,
      expiresAt: newExpiresAt,
      usedAt: null, // Reset if previously redeemed or expired
    },
  });

  revalidatePath("/admin/invites");
  return {
    success: true,
    newToken,
    inviteUrl: `/register?invite=${newToken}`,
  };
}

export async function revokeInvitation(invitationId: string) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized to revoke invitations.");
  }

  await prisma.invitation.delete({
    where: { id: invitationId },
  });

  revalidatePath("/admin/invites");
  return { success: true };
}

/**
 * Admin action to directly reset a user's password
 */
export async function resetUserPassword(userId: string, newPassword?: string) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only administrators can reset client passwords.");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!target) {
    throw new Error("User not found.");
  }

  // Generate a secure random password if not supplied
  const generatedPassword = newPassword?.trim() || "Pass-" + crypto.randomBytes(4).toString("hex") + "!9";
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  revalidatePath("/admin/companies");
  return {
    success: true,
    userEmail: target.email,
    temporaryPassword: generatedPassword,
  };
}

/**
 * Admin action to update user details (name, email, role, company)
 */
export async function updateUserDetails(
  userId: string,
  data: {
    name?: string;
    email?: string;
    role?: "CLIENT" | "AGENT" | "ADMIN";
    companyId?: string | null;
  }
) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only administrators can update account details.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name?.trim() || undefined,
      email: data.email?.trim() || undefined,
      role: data.role || undefined,
      companyId: data.companyId,
    },
  });

  revalidatePath("/admin/companies");
  return { success: true };
}

