"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("Unauthorized to create projects.");
  }

  const name = (formData.get("name") as string)?.trim();
  const companyId = formData.get("companyId") as string;
  const type = (formData.get("type") as "SOFTWARE" | "HARDWARE" | "SERVICE" | "PURCHASE") || "SOFTWARE";
  const description = (formData.get("description") as string)?.trim() || null;
  const warrantyEndsAtRaw = formData.get("warrantyEndsAt") as string;
  const githubRepoOwner = (formData.get("githubRepoOwner") as string)?.trim() || null;
  const githubRepoName = (formData.get("githubRepoName") as string)?.trim() || null;

  if (!name || !companyId) {
    throw new Error("Project name and client company are required.");
  }

  const project = await prisma.project.create({
    data: {
      name,
      companyId,
      type,
      description,
      warrantyEndsAt: warrantyEndsAtRaw ? new Date(warrantyEndsAtRaw) : null,
      githubRepoOwner: type === "SOFTWARE" ? githubRepoOwner : null,
      githubRepoName: type === "SOFTWARE" ? githubRepoName : null,
      isActive: true,
    },
  });

  revalidatePath("/admin/companies");
  revalidatePath("/dashboard/new");
  return { success: true, project };
}

export async function toggleProjectStatus(projectId: string, currentStatus: boolean) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only administrators can suspend or archive projects.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin/companies");
  revalidatePath("/dashboard/new");
  return { success: true, newStatus: !currentStatus };
}

export async function getCompanyProjects(companyId: string) {
  const user = await getCurrentUser();

  // If client, ensure they can only query their own company
  if (user.role === "CLIENT" && user.companyId !== companyId) {
    throw new Error("Unauthorized.");
  }

  return prisma.project.findMany({
    where: {
      companyId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });
}
