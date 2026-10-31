import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ShieldCheck, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RegisterPageProps {
  searchParams: Promise<{ invite?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { invite: inviteToken } = await searchParams;

  const [settings, invite] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: "global" } }),
    inviteToken
      ? prisma.invitation.findUnique({
          where: { token: inviteToken },
          include: { company: true },
        })
      : null,
  ]);

  const publicAllowed = settings?.allowPublicRegistration ?? false;
  const isInviteValid = invite && !invite.usedAt && new Date() <= invite.expiresAt;

  // Access check: If not allowed publicly and no valid invite token, block registration
  if (!publicAllowed && !isInviteValid) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 relative selection:bg-emerald-500/30">
        <Card className="max-w-md w-full bg-slate-900/80 border-slate-800 shadow-2xl text-center p-6 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl text-white">Invitations Only</CardTitle>
            <CardDescription className="text-slate-400">
              Registration on Issue-Bridge is currently restricted. You need a valid invitation link sent by a support administrator to create an account.
            </CardDescription>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link href="/login">
              <Button className="w-full gap-2">
                Already have an account? Sign In <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 relative selection:bg-emerald-500/30 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-xl shadow-emerald-500/20">
          <div className="h-full w-full bg-slate-950 rounded-[15px] flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Create Your Account
        </h2>
        <p className="text-sm text-slate-400">
          {invite?.company
            ? `Joining ${invite.company.name} Support Workspace`
            : "Register to submit and track support tickets"}
        </p>
      </div>

      <RegisterForm
        inviteToken={inviteToken}
        initialEmail={invite?.email}
        companyName={invite?.company?.name}
        assignedRole={invite?.role}
      />
    </div>
  );
}
