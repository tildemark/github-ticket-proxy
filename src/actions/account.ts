"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateClientProfile(formData: FormData) {
  const user = await getCurrentUser();
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    throw new Error("Name cannot be empty.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changeClientPassword(formData: FormData) {
  const user = await getCurrentUser();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required.");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.password) {
    throw new Error("Account does not have a local password set.");
  }

  const isValid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}
