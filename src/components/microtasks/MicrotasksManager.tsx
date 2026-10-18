import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { tasksQuery, profilesQuery } from "@/lib/queries";
import {
  createNewMicrotask,
  claimExistingMicrotask,
  completeExistingMicrotask,
} from "@/lib/supabaseSync";
import { useAuth } from "@/lib/auth";
import type { Microtask } from "@/lib/mockData";
import { toast } from "sonner";
import {
  Plus,
  CheckCircle2,
  Clock,
  Award,
  ShieldCheck,
  Filter,
  ExternalLink,
  Upload,
  FileText,
  File,
  X,
  AlertCircle,
  Sparkles,
  Link2,
  Check,
} from "lucide-react";

interface MicrotasksManagerProps {
  // If set, limits or highlights tasks for this specific profile ID (e.g. on alumni/$id or student profile)
  profileId?: string;
  // Specific role context
  rolePerspective?: "student" | "alumni" | "faculty";
  // Display style
  compact?: boolean;
  title?: string;
  description?: string;
}

export function MicrotasksManager({
  profileId,
  rolePerspective,
  compact = false,
  title = "Microtasks & Proof-of-Work Ledger",
  description = "Targeted tasks worth binary points (0 or 1). Complete a deliverable or audit to earn 1 verified credibility point.",
}: MicrotasksManagerProps) {
  const { user, currentRole } = useAuth();
  const queryClient = useQueryClient();

  const tasksQueryResult = useQuery(tasksQuery);
  const profilesQueryResult = useQuery(profilesQuery);

  const tasks = tasksQueryResult.data ?? [];
  const profiles = profilesQueryResult.data ?? [];

  const effectiveRole = rolePerspective || currentRole || "student";
  const currentUserId = user?.id || (effectiveRole === "student" ? "student-user" : "alumni-user");

  // Filter state
  const [activeTab, setActiveTab] = useState<"available" | "mine" | "completed">("available");
  const [searchQuery, setSearchQuery] = useState("");

  // Post task modal state (for alumni / faculty to give work)
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Code & Architecture Review");
  const [newTurnaround, setNewTurnaround] = useState("1-2 hours");
  const [isPosting, setIsPosting] = useState(false);

  // Submit proof modal state (for students to upload Google Drive link or file)
  const [activeSubmitTaskId, setActiveSubmitTaskId] = useState<string | null>(null);
  const [submissionType, setSubmissionType] = useState<"drive" | "file">("drive");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate binary credibility points earned by the current user / profile
  const userCompletedTasks = useMemo(() => {
    const targetId = profileId || currentUserId;
    return tasks.filter(
      (t) =>
        t.status === "completed" &&
        (t.claimed_by === targetId || (targetId === "student-user" && t.claimed_by?.startsWith("student")))
    );
  }, [tasks, profileId, currentUserId]);

  const earnedBinaryPoints = userCompletedTasks.length; // 1 point per completed task

  // Filtered tasks logic
  const filteredTasks = useMemo(() => {
    let list = tasks;

    // If locked to a specific profile's given tasks (e.g. on alumni/$id)
    if (profileId) {
      list = list.filter((t) => t.posted_by === profileId || t.claimed_by === profileId);
    }

    // Apply tab filters
    if (activeTab === "available") {
      list = list.filter((t) => t.status === "open");
    } else if (activeTab === "mine") {
      list = list.filter(
        (t) =>
          (t.claimed_by && (t.claimed_by === currentUserId || t.claimed_by === profileId)) ||
          (t.posted_by && (t.posted_by === currentUserId || t.posted_by === profileId))
      );
    } else if (activeTab === "completed") {
      list = list.filter((t) => t.status === "completed");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) =>
        [t.title, t.description ?? ""].join(" ").toLowerCase().includes(q)
      );
    }

    return list;
  }, [tasks, profileId, activeTab, currentUserId, searchQuery]);

  // Handler: Alumnus gives a task
  const handleGiveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsPosting(true);
    try {
      const fullDesc = `${newDescription.trim()}\n\n[Category: ${newCategory} · Expected Turnaround: ${newTurnaround} · Binary Value: 1 Point]`;
      await createNewMicrotask({
        title: newTitle.trim(),
        description: fullDesc,
        hours: 1, // Fixed 1 point
        posted_by: profileId || user?.id || "current-alumnus",
      });

      toast.success("✓ Microtask assigned! Worth 1 binary point upon deliverable verification.");
      setIsGiveModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err: any) {
      toast.error(`Could not post microtask: ${err.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  // Handler: Student claims a task
  const handleClaim = async (taskId: string) => {
    try {
      await claimExistingMicrotask(taskId, currentUserId);
      toast.success("Task claimed! Proceed to submit your work when ready.");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err: any) {
      toast.error(`Error claiming task: ${err.message}`);
    }
  };

  // Handler: Student submits work (Google Drive link OR file upload)
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitTaskId) return;

    if (submissionType === "drive" && !submissionUrl.trim()) {
      toast.error("Please provide your Google Drive link or public deliverable URL.");
      return;
    }

    if (submissionType === "file" && !submissionFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        submission_url: submissionType === "drive" ? submissionUrl.trim() : undefined,
        submission_file_name:
          submissionType === "file" && submissionFile ? submissionFile.name : undefined,
        submission_file_size:
          submissionType === "file" && submissionFile
            ? `${Math.round(submissionFile.size / 1024)} KB`
            : undefined,
        submission_note: submissionNote.trim() || undefined,
      };

      await completeExistingMicrotask(activeSubmitTaskId, submissionData);

      toast.success("✓ Proof-of-work submitted! +1 credibility point credited to your record.");
      setActiveSubmitTaskId(null);
      setSubmissionUrl("");
      setSubmissionFile(null);
      setSubmissionNote("");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err: any) {
      toast.error(`Error submitting deliverable: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTaskForSubmission = tasks.find((t) => t.id === activeSubmitTaskId);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow text-accent">Microtask Register</span>
            <span className="border border-accent/30 bg-accent/10 px-2 py-0.2 font-mono text-[10px] text-accent font-semibold uppercase">
              Binary Points (1 & 0)
            </span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mt-1 text-foreground">
            {title}
          </h3>
          <p className="text-xs text-ink-soft max-w-2xl mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Binary Score Badge */}
          <div className="border border-rule bg-paper px-3 py-1.5 font-mono text-xs flex items-center gap-2">
            <Award className="h-4 w-4 text-accent" />
            <span>
              Credibility: <strong>+{earnedBinaryPoints}</strong> pt{earnedBinaryPoints === 1 ? "" : "s"}
            </span>
          </div>

          {/* Give Work Button (Alumni & Faculty, or available to all) */}
          <button
            type="button"
            onClick={() => setIsGiveModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Give a Microtask
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-1 border border-rule bg-paper p-1">
          <button
            type="button"
            onClick={() => setActiveTab("available")}
            className={`px-3 py-1 transition-colors cursor-pointer ${activeTab === "available"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Available to Claim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mine")}
            className={`px-3 py-1 transition-colors cursor-pointer ${activeTab === "mine"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            My Assigned & Given
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1 transition-colors cursor-pointer ${activeTab === "completed"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Verified Complete (+1 pt)
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search deliverables & tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-rule bg-paper px-3 py-1 text-xs focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Microtask Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="border border-dashed border-rule p-8 text-center bg-paper/50">
          <p className="font-mono text-xs text-muted-foreground">
            No microtasks found under this filter.
          </p>
          <button
            type="button"
            onClick={() => setIsGiveModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 link-u font-mono text-xs text-accent"
          >
            + Give the first microtask to students
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
          {filteredTasks.map((task) => {
            const poster = profiles.find((p) => p.id === task.posted_by);
            const claimant = profiles.find((p) => p.id === task.claimed_by);
            const isCompleted = task.status === "completed";

            return (
              <article
                key={task.id}
                className="border border-rule bg-paper p-5 flex flex-col justify-between space-y-4 hover:border-foreground/50 transition-colors shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      {isCompleted ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          +1 Point Credited
                        </span>
                      ) : (
                        <span>Worth 1 Point (0 or 1)</span>
                      )}
                    </span>

                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 border font-semibold ${task.status === "open"
                        ? "border-accent text-accent bg-accent/5"
                        : isCompleted
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                          : "border-amber-700/40 text-amber-800 bg-amber-50 dark:bg-amber-950/40"
                        }`}
                    >
                      {isCompleted ? "✓ Verified Done" : task.status}
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-bold text-foreground">
                    {task.title}
                  </h4>

                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    {task.description}
                  </p>

                  {/* Submission Evidence (if submitted or completed) */}
                  {(task.submission_url || task.submission_file_name) && (
                    <div className="mt-2 rounded border border-accent/20 bg-accent/5 p-2.5 space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-accent font-semibold flex items-center gap-1 text-[11px]">
                          <FileText className="h-3.5 w-3.5" /> Submitted Deliverable:
                        </span>
                        {task.submitted_at && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(task.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {task.submission_url && (
                        <a
                          href={task.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-accent hover:underline text-[11px] truncate max-w-full"
                        >
                          <Link2 className="h-3 w-3" />
                          {task.submission_url.includes("drive.google.com")
                            ? "Google Drive Work Deliverable"
                            : task.submission_url}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}

                      {task.submission_file_name && (
                        <div className="inline-flex items-center gap-1.5 text-foreground text-[11px]">
                          <File className="h-3 w-3 text-accent" />
                          <span>{task.submission_file_name}</span>
                          {task.submission_file_size && (
                            <span className="text-muted-foreground">({task.submission_file_size})</span>
                          )}
                        </div>
                      )}

                      {task.submission_note && (
                        <p className="text-[10px] text-ink-soft italic pt-1 border-t border-accent/10">
                          "{task.submission_note}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-rule pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    {poster ? (
                      <p className="text-muted-foreground text-[11px]">
                        Given by:{" "}
                        <Link
                          to="/alumni/$id"
                          params={{ id: poster.id }}
                          className="link-u text-foreground font-medium"
                        >
                          {poster.full_name}
                        </Link>
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-[11px] font-mono">
                        Given by: Ashwood Alumnus
                      </p>
                    )}

                    {claimant && (
                      <p className="text-ink-soft text-[10px] font-mono mt-0.5">
                        Worker: {claimant.full_name || "Enrolled Student"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === "open" ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(task.id)}
                        className="bg-primary px-3 py-1 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors cursor-pointer"
                      >
                        Claim Task
                      </button>
                    ) : task.status === "claimed" ? (
                      <button
                        type="button"
                        onClick={() => setActiveSubmitTaskId(task.id)}
                        className="border border-accent bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-wider font-semibold text-accent hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="h-3 w-3" />
                        Submit Work
                      </button>
                    ) : (
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 1 Point Awarded
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ALUMNI GIVES A CERTAIN WORK (POST MICROTASK)
         ========================================================================= */}
      {isGiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-rule pb-3">
              <div>
                <span className="eyebrow text-accent">Alumni Assignment Registry</span>
                <h3 className="font-display text-2xl font-bold mt-0.5">
                  Give a Microtask to Students
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Commission a specific piece of work. Student will submit deliverable via Google Drive or file upload.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGiveModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGiveTask} className="mt-5 space-y-4">
              <div>
                <label className="eyebrow block mb-1">Task Title / Work Scope *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit compiler pass bug in LLVM IR or Benchmarking Rust SIMD"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-rule bg-paper p-2 text-xs focus:border-accent focus:outline-none"
                  >
                    <option value="Code & Architecture Review">Code & Architecture Review</option>
                    <option value="Research & Literature Synthesis">Research & Literature Synthesis</option>
                    <option value="UI/UX & Design Audit">UI/UX & Design Audit</option>
                    <option value="Data Verification & Pipelines">Data Verification & Pipelines</option>
                    <option value="Product Strategy Teardown">Product Strategy Teardown</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow block mb-1">Expected Turnaround</label>
                  <select
                    value={newTurnaround}
                    onChange={(e) => setNewTurnaround(e.target.value)}
                    className="w-full border border-rule bg-paper p-2 text-xs focus:border-accent focus:outline-none"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="1-2 hours">1-2 hours</option>
                    <option value="Half day">Half day</option>
                    <option value="1-2 days">1-2 days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-1">
                  Deliverable Specification & Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe precisely what output you want: e.g. 'Review PR #42 or submit a Google Drive doc summarizing cache misses with reproducible profiling script...'"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none leading-relaxed"
                />
              </div>

              {/* Binary Point System Notice */}
              <div className="rounded border border-accent/30 bg-accent/5 p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="font-mono text-xs">
                  <p className="font-semibold text-accent">Binary Points: Fixed at 1 Point</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Tasks are binary — <strong>0 points</strong> while pending, and exactly <strong>1 credibility point</strong> granted to the student once the deliverable is reviewed.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setIsGiveModalOpen(false)}
                  className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="bg-primary px-6 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPosting ? "Commissioning..." : "Assign Microtask"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: STUDENT SUBMITS WORK (GOOGLE DRIVE LINK OR FILE UPLOAD)
         ========================================================================= */}
      {activeSubmitTaskId && activeTaskForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-rule pb-3">
              <div>
                <span className="eyebrow text-accent">Deliverable Verification</span>
                <h3 className="font-display text-2xl font-bold mt-0.5">
                  Submit Proof of Work
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Task: <strong>{activeTaskForSubmission.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubmitTaskId(null);
                  setSubmissionUrl("");
                  setSubmissionFile(null);
                }}
                className="text-muted-foreground hover:text-foreground font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="mt-5 space-y-4">
              {/* Submission Mode Selector */}
              <div>
                <label className="eyebrow block mb-1.5">Deliverable Submission Method</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setSubmissionType("drive")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 border transition-colors cursor-pointer ${submissionType === "drive"
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-rule bg-paper text-muted-foreground hover:border-foreground"
                      }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Google Drive / URL Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmissionType("file")}
                    className={`flex items-center justify-center gap-1.5 p-2.5 border transition-colors cursor-pointer ${submissionType === "file"
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-rule bg-paper text-muted-foreground hover:border-foreground"
                      }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload File Directly
                  </button>
                </div>
              </div>

              {/* OPTION A: GOOGLE DRIVE LINK */}
              {submissionType === "drive" && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="eyebrow block">
                    Google Drive Link or Deliverable URL *
                  </label>
                  <input
                    type="url"
                    required={submissionType === "drive"}
                    placeholder="https://drive.google.com/file/d/... or https://github.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-xs focus:border-accent focus:outline-none"
                  />
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Ensure link sharing is set to "Anyone with the link can view".
                  </p>
                </div>
              )}

              {/* OPTION B: FILE UPLOAD */}
              {submissionType === "file" && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="eyebrow block">Upload Deliverable File *</label>
                  <div className="border border-dashed border-rule bg-paper p-4 text-center hover:border-accent transition-colors">
                    <input
                      type="file"
                      id="deliverableFileInput"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSubmissionFile(file);
                      }}
                    />
                    <label
                      htmlFor="deliverableFileInput"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <Upload className="h-6 w-6 text-accent" />
                      {submissionFile ? (
                        <div className="font-mono text-xs">
                          <p className="font-semibold text-foreground flex items-center gap-1 justify-center">
                            <Check className="h-3.5 w-3.5 text-accent" />
                            {submissionFile.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {Math.round(submissionFile.size / 1024)} KB · Click to choose different file
                          </p>
                        </div>
                      ) : (
                        <div className="font-mono text-xs">
                          <p className="font-semibold text-foreground">
                            Click to select deliverable file
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            PDF, ZIP, DOCX, Code, or image artifacts (up to 25MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Additional Context Note */}
              <div>
                <label className="eyebrow block mb-1">Notes to Poster / Reviewer</label>
                <textarea
                  rows={3}
                  placeholder="Summarize key findings, what parts were verified, test commands to run, etc..."
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none leading-relaxed"
                />
              </div>

              {/* Binary Points Confirmation */}
              <div className="rounded border border-accent/20 bg-accent/5 p-3">
                <p className="font-mono text-[11px] text-accent font-semibold">
                  Binary Points System (1 & 0)
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  Submitting work verifies this microtask and credits exactly <strong>+1 binary credibility point</strong> to your collegiate dossier.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubmitTaskId(null);
                    setSubmissionUrl("");
                    setSubmissionFile(null);
                  }}
                  className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary px-6 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit Deliverable (+1 pt)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
