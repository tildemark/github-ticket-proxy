"use client";

import { useState } from "react";
import { updateClientProfile, changeClientPassword } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Lock, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientProfileSettingsProps {
  initialUser: {
    name: string | null;
    email: string;
    role: string;
    companyName?: string | null;
  };
}

export function ClientProfileSettings({ initialUser }: ClientProfileSettingsProps) {
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const router = useRouter();

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      await updateClientProfile(formData);
      setProfileSuccess(true);
      router.refresh();
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await changeClientPassword(formData);
      setPasswordSuccess(true);
      form.reset();
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Profile Details */}
      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-400" />
            Personal Profile
          </CardTitle>
          <CardDescription>
            Update your public display name and account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialUser.name || ""}
                placeholder="Jane Doe"
                required
                className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={initialUser.email}
                disabled
                className="w-full h-9 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 text-xs text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your email is managed by your company administrator.
              </p>
            </div>

            {initialUser.companyName && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Associated Company
                </label>
                <input
                  type="text"
                  value={initialUser.companyName}
                  disabled
                  className="w-full h-9 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 text-xs text-indigo-400 font-medium cursor-not-allowed"
                />
              </div>
            )}

            {profileSuccess && (
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={profileSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-4 gap-1.5"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Change Password */}
      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your client portal access secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="••••••••••••"
                className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                placeholder="Re-type new password"
                className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            {passwordError && (
              <div className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={passwordSaving}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-8 px-4 gap-1.5"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-3.5 w-3.5" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
