"use client";

import { useState } from "react";
import { createProject, toggleProjectStatus } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Plus,
  Loader2,
  X,
  Cpu,
  Code,
  Wrench,
  ShoppingBag,
  Calendar,
  GitBranch,
  ShieldCheck,
  PowerOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectManagerModalProps {
  companyId: string;
  companyName: string;
  projects: {
    id: string;
    name: string;
    type: "SOFTWARE" | "HARDWARE" | "SERVICE" | "PURCHASE";
    description: string | null;
    isActive: boolean;
    warrantyEndsAt: string | null;
    githubRepoOwner: string | null;
    githubRepoName: string | null;
  }[];
}

export function ProjectManagerModal({ companyId, companyName, projects }: ProjectManagerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectType, setProjectType] = useState<"SOFTWARE" | "HARDWARE" | "SERVICE" | "PURCHASE">("SOFTWARE");
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("companyId", companyId);
    formData.set("type", projectType);

    try {
      await createProject(formData);
      setIsAdding(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(projectId: string, currentStatus: boolean) {
    if (confirm(`Are you sure you want to ${currentStatus ? "suspend" : "activate"} this project?`)) {
      try {
        await toggleProjectStatus(projectId, currentStatus);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to update project status");
      }
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 h-7 px-2.5"
      >
        <FolderKanban className="h-3 w-3" />
        Projects ({projects.length})
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {companyName} &bull; Subscribed Projects & Hardware
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Manage software suites, hardware installations, solar systems, and procurement contracts
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAdding(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Project List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Active Subscriptions & Systems ({projects.length})
                </h4>
                {!isAdding && (
                  <Button
                    size="sm"
                    onClick={() => setIsAdding(true)}
                    className="text-xs h-7 px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Plus className="h-3 w-3" /> Add Project / System
                  </Button>
                )}
              </div>

              {projects.length === 0 && !isAdding ? (
                <div className="text-center py-8 px-4 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-500 text-xs">
                  No projects configured for {companyName} yet. Add a software app, hardware purchase, or solar system to route tickets specifically.
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((proj) => {
                    const isWarrantyExpired = proj.warrantyEndsAt
                      ? new Date(proj.warrantyEndsAt).getTime() < Date.now()
                      : false;

                    return (
                      <div
                        key={proj.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          proj.isActive
                            ? "bg-slate-950/60 border-slate-800"
                            : "bg-rose-950/10 border-rose-500/20 opacity-70"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                proj.type === "HARDWARE"
                                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                  : proj.type === "PURCHASE"
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                  : proj.type === "SERVICE"
                                  ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                  : "bg-sky-500/10 text-sky-300 border-sky-500/30"
                              }`}
                            >
                              {proj.type === "HARDWARE" && <Cpu className="h-2.5 w-2.5" />}
                              {proj.type === "SOFTWARE" && <Code className="h-2.5 w-2.5" />}
                              {proj.type === "SERVICE" && <Wrench className="h-2.5 w-2.5" />}
                              {proj.type === "PURCHASE" && <ShoppingBag className="h-2.5 w-2.5" />}
                              {proj.type}
                            </span>
                            <span className="font-semibold text-sm text-white">{proj.name}</span>
                            {!proj.isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-medium border border-rose-500/25">
                                Suspended
                              </span>
                            )}
                          </div>

                          {proj.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{proj.description}</p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                            {proj.warrantyEndsAt && (
                              <span className={`flex items-center gap-1 ${isWarrantyExpired ? "text-rose-400 font-medium" : ""}`}>
                                <Calendar className="h-3 w-3" />
                                Warranty: {new Date(proj.warrantyEndsAt).toLocaleDateString()}
                                {isWarrantyExpired && " (Expired)"}
                              </span>
                            )}

                            {proj.githubRepoName && (
                              <span className="flex items-center gap-1 text-purple-400 font-mono">
                                <GitBranch className="h-3 w-3" />
                                {proj.githubRepoOwner}/{proj.githubRepoName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant={proj.isActive ? "outline" : "default"}
                            onClick={() => handleToggle(proj.id, proj.isActive)}
                            className="text-xs h-7 px-2.5 border-slate-700 text-slate-300 hover:text-white"
                          >
                            <PowerOff className="h-3 w-3 mr-1" />
                            {proj.isActive ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Project Form */}
            {isAdding && (
              <form onSubmit={handleCreate} className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/15 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-indigo-400" /> Add New Project / Hardware System
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Project / System Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Solar System Inverter Setup / Trace Mobile"
                      className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Classification Type
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value as any)}
                      className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="SOFTWARE">Software (Web, Mobile, Backend)</option>
                      <option value="HARDWARE">Hardware (Server racks, Solar systems, IoT)</option>
                      <option value="PURCHASE">Procurement / Hardware Purchase</option>
                      <option value="SERVICE">Service Agreement / Ongoing SLA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Description & System Specs
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="e.g. 10kW Hybrid Solar Inverter with Lithium Battery Bank"
                    className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-indigo-400" />
                      Warranty / Contract Expiration Date
                    </label>
                    <input
                      type="date"
                      name="warrantyEndsAt"
                      className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {projectType === "SOFTWARE" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-purple-400" />
                        Custom GitHub Repo (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="githubRepoOwner"
                          placeholder="owner (e.g. tildemark)"
                          className="w-1/2 h-8 rounded-lg border border-slate-800 bg-slate-950 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                        <input
                          type="text"
                          name="githubRepoName"
                          placeholder="repo (e.g. trace)"
                          className="w-1/2 h-8 rounded-lg border border-slate-800 bg-slate-950 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4"
                  >
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                    Save Project
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
