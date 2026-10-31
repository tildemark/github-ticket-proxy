"use client";

import { Suspense, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  function fillDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
  }

  return (
    <Card className="sm:mx-auto sm:w-full sm:max-w-md bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-xl relative z-10">
      <CardHeader className="pb-4">
        <CardTitle className="text-base text-slate-200">Account Credentials</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              "Sign In with Email"
            )}
          </Button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Quick Switch Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("admin@issuebridge.com")}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-center transition-colors font-medium cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("agent@issuebridge.com")}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-center transition-colors font-medium cursor-pointer"
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("client@example.com")}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-center transition-colors font-medium cursor-pointer"
            >
              Client (Acme)
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-mono">
              Or Continue With
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("facebook", { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800"
          >
            <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-slate-950/80 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10 mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-xl shadow-emerald-500/20">
          <div className="h-full w-full bg-slate-950 rounded-[15px] flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Sign In to Issue-Bridge
        </h2>
        <p className="text-sm text-slate-400">
          Access your company support portal or internal engineering triage gateway
        </p>
      </div>

      <Suspense fallback={<div className="text-slate-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
