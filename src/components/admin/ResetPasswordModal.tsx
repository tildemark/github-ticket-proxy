"use client";

import { useState } from "react";
import { resetUserPassword } from "@/actions/admin-users";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, Check, Copy, X } from "lucide-react";

interface ResetPasswordModalProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function ResetPasswordModal({ userId, userName, userEmail }: ResetPasswordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customPassword, setCustomPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultPassword, setResultPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    setIsSubmitting(true);
    try {
      const res = await resetUserPassword(userId, customPassword || undefined);
      setResultPassword(res.temporaryPassword);
    } catch (err: any) {
      alert(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopy() {
    if (resultPassword) {
      navigator.clipboard.writeText(resultPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setResultPassword(null);
    setCustomPassword("");
    setCopied(false);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs h-7 px-2.5 gap-1.5 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
      >
        <KeyRound className="h-3.5 w-3.5 text-amber-400" />
        Reset Password
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                Reset Account Password
              </h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Reset the credentials for <strong className="text-white">{userName}</strong> ({userEmail}).
            </p>

            {resultPassword ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <p className="text-xs text-emerald-300 font-medium">
                    Password successfully reset! Share this temporary password with the user:
                  </p>
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-mono text-sm font-semibold text-white tracking-wider">
                      {resultPassword}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      className="text-xs h-7 px-2 gap-1 text-slate-300 hover:text-white"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Custom Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Leave empty to auto-generate secure password"
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    If left blank, a random password will be generated for you to copy.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-3.5 w-3.5" />
                        Reset & Generate Credentials
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
