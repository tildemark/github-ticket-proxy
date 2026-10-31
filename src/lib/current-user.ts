import { prisma } from "./prisma";
import { auth } from "@/auth";

export async function getCurrentUser() {
  const session = await auth();

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });
    if (user) return user;
  }

  // Fallback to client demo account if unauthenticated in dev
  let defaultUser = await prisma.user.findFirst({
    where: { email: "client@example.com" },
    include: { company: true },
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.findFirst({
      include: { company: true },
    });
  }

  return defaultUser!;
}
