"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function createCompany(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can register new companies.");
  }

  const name = formData.get("name") as string;
  const domain = (formData.get("domain") as string)?.trim().toLowerCase() || null;

  if (!name?.trim()) {
    throw new Error("Company name is required.");
  }

  const company = await prisma.company.create({
    data: {
      name: name.trim(),
      domain: domain || undefined,
    },
  });

  revalidatePath("/admin/companies");
  revalidatePath("/admin/invites");
  return { success: true, companyId: company.id };
}

export async function createInvitation(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized to issue invitations.");
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const companyId = (formData.get("companyId") as string) || null;
  const role = (formData.get("role") as "CLIENT" | "AGENT" | "ADMIN") || "CLIENT";

  if (!email) {
    throw new Error("Target invite email is required.");
  }

  // Generate random token
  const token = "inv_" + crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.invitation.create({
    data: {
      token,
      email,
      companyId,
      role,
      invitedById: user.id,
      expiresAt,
    },
    include: {
      company: true,
    },
  });

  revalidatePath("/admin/invites");
  return {
    success: true,
    inviteUrl: `/register?invite=${token}`,
    token,
  };
}

export async function togglePublicRegistration(allowed: boolean) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only administrators can update registration settings.");
  }

  await prisma.systemSetting.upsert({
    where: { id: "global" },
    update: { allowPublicRegistration: allowed },
    create: { id: "global", allowPublicRegistration: allowed },
  });

  revalidatePath("/admin/invites");
  revalidatePath("/register");
  return { success: true, allowed };
}

export async function registerWithInvite(formData: FormData) {
  const inviteToken = formData.get("inviteToken") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Check system setting for public registration if no invite token
  const settings = await prisma.systemSetting.findUnique({
    where: { id: "global" },
  });

  let invite = null;
  let email = (formData.get("email") as string)?.trim().toLowerCase();
  let role: "CLIENT" | "AGENT" | "ADMIN" = "CLIENT";
  let companyId: string | null = (formData.get("companyId") as string) || null;

  if (inviteToken) {
    invite = await prisma.invitation.findUnique({
      where: { token: inviteToken },
    });

    if (!invite) {
      throw new Error("Invalid invitation link.");
    }
    if (invite.usedAt) {
      throw new Error("This invitation has already been used.");
    }
    if (new Date() > invite.expiresAt) {
      throw new Error("This invitation link has expired.");
    }

    email = invite.email;
    role = invite.role;
    companyId = invite.companyId;
  } else {
    // No invite token - check if public registration is enabled
    if (!settings?.allowPublicRegistration) {
      throw new Error("Public registration is disabled. You need an invitation link to register.");
    }

    if (!email) {
      throw new Error("Email is required for registration.");
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name?.trim() || email.split("@")[0],
      email,
      password: passwordHash,
      role,
      companyId,
    },
  });

  if (invite) {
    await prisma.invitation.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
  }

  return { success: true, userEmail: newUser.email };
}
