"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerWithInvite } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, Building2, CheckCircle2 } from "lucide-react";

export function RegisterForm({
  inviteToken,
  initialEmail,
  companyName,
  assignedRole,
}: {
  inviteToken?: string;
  initialEmail?: string;
  companyName?: string;
  assignedRole?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await registerWithInvite(formData);
        setIsSuccess(true);
      } catch (err: any) {
        setError(err.message || "Registration failed");
      }
    });
  }

  if (isSuccess) {
    return (
      <Card className="max-w-md w-full bg-slate-900/80 border-slate-800 shadow-2xl p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl text-white">Registration Complete!</CardTitle>
        <p className="text-sm text-slate-300">
          Your account has been created. You can now sign in using your email and password.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button className="w-full gap-2">
              Proceed to Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full bg-slate-900/80 border-slate-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Account Setup</CardTitle>
        <CardDescription>
          {companyName ? (
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <Building2 className="h-3.5 w-3.5" /> Company: {companyName}
            </span>
          ) : (
            "Complete your profile to access tickets"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-3 mb-4 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {inviteToken && <input type="hidden" name="inviteToken" value={inviteToken} />}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <Input name="name" required placeholder="Jane Doe" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <Input
              name="email"
              type="email"
              required
              readOnly={Boolean(initialEmail)}
              defaultValue={initialEmail || ""}
              placeholder="jane@company.com"
              className={initialEmail ? "bg-slate-950/60 text-slate-400 cursor-not-allowed" : ""}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Set Password *
            </label>
            <Input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
