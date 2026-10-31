import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { ArrowLeft } from "lucide-react";

export default async function NewTicketPage() {
  const user = await getCurrentUser();

  const [companies, projects] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    user.companyId
      ? prisma.project.findMany({
          where: { companyId: user.companyId, isActive: true },
          select: { id: true, name: true, type: true, warrantyEndsAt: true },
          orderBy: { name: "asc" },
        })
      : prisma.project.findMany({
          where: { isActive: true },
          select: { id: true, name: true, type: true, companyId: true, warrantyEndsAt: true },
          orderBy: { name: "asc" },
        }),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header userName={user.name || "Client"} userRole={user.role} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>

        <CreateTicketForm
          userRole={user.role}
          userCompany={user.company}
          companies={companies}
          projects={projects as any}
        />
      </main>
    </div>
  );
}
