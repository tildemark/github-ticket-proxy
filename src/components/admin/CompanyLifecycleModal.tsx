"use client";

import { useState } from "react";
import { toggleCompanyStatus, updateCompanyDetails } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Loader2,
  FileText,
  AlertTriangle,
  X,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CompanyLifecycleModalProps {
  company: {
    id: string;
    name: string;
    domain: string | null;
    isActive: boolean;
    suspensionReason: string | null;
    warrantyEndsAt: string | null; // ISO string
    notes: string | null;
  };
}

export function CompanyLifecycleModal({ company }: CompanyLifecycleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState(company.suspensionReason || "");
  const [warrantyDate, setWarrantyDate] = useState(
    company.warrantyEndsAt ? company.warrantyEndsAt.split("T")[0] : ""
  );
  const [notes, setNotes] = useState(company.notes || "");
  const router = useRouter();

  const isExpired = company.warrantyEndsAt
    ? new Date(company.warrantyEndsAt).getTime() < Date.now()
    : false;

  async function handleToggleStatus() {
    setIsSubmitting(true);
    try {
      await toggleCompanyStatus(company.id, company.isActive, suspensionReason);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update company status");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateCompanyDetails(company.id, {
        warrantyEndsAt: warrantyDate || null,
        notes: notes || null,
      });
      alert("Company warranty & notes saved successfully.");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Warranty Status Indicator Pill */}
        {company.warrantyEndsAt && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
              isExpired
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {isExpired ? "Warranty Expired" : `Warranty: ${new Date(company.warrantyEndsAt).toLocaleDateString()}`}
          </span>
        )}

        <Button
          size="sm"
          variant={company.isActive ? "outline" : "destructive"}
          onClick={() => setIsOpen(true)}
          className={`text-xs h-7 px-2.5 gap-1.5 ${
            company.isActive
              ? "border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
              : "bg-rose-600 hover:bg-rose-500 text-white"
          }`}
        >
          {company.isActive ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Manage Contract
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5" />
              Suspended (Manage)
            </>
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {company.name} &bull; Lifecycle Management
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Warranty expiration, suspension guard, and SLA notes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Status Box */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                company.isActive
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/20 border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  {company.isActive ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Support Contract Active
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Support Access Suspended
                    </>
                  )}
                </p>
                {!company.isActive && company.suspensionReason && (
                  <p className="text-[11px] text-rose-300/80">Reason: {company.suspensionReason}</p>
                )}
              </div>

              <Button
                size="sm"
                variant={company.isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
                disabled={isSubmitting}
                className="text-xs h-7 px-3"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : company.isActive ? (
                  "Suspend Company"
                ) : (
                  "Restore Access"
                )}
              </Button>
            </div>

            {/* Contract & Warranty Details Form */}
            <form onSubmit={handleSaveDetails} className="space-y-4 pt-1">
              {company.isActive && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Suspension Reason (if suspending)
                  </label>
                  <input
                    type="text"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="e.g. 1-Year Warranty ended / Contract renewal pending"
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  Warranty / Contract Expiration Date
                </label>
                <input
                  type="date"
                  value={warrantyDate}
                  onChange={(e) => setWarrantyDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  When passed, alerts support staff that warranty coverage has lapsed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  Support & Contract Notes (Internal)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. SLA level Gold; custom server warranty coverage until Q3."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Save Contract Details"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
