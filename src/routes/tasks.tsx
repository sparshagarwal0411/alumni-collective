import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Empty, ErrorNote, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { tasksQuery, profilesQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import {
  createNewMicrotask,
  claimExistingMicrotask,
  completeExistingMicrotask,
} from "@/lib/supabaseSync";
import { toast } from "sonner";
import { Plus, CheckCircle2, Clock, Award, ShieldCheck, Filter, ExternalLink, ArrowRight, Upload, Link2, File, Check } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Microtasks & Proof-of-Work — Ashwood College" },
      {
        name: "description",
        content: "Lend a small hand: code reviews, paper teardowns, and design audits. Earn relational credibility points.",
      },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const queryClient = useQueryClient();
  const { user, currentRole } = useAuth();
  const tasksResult = useQuery(tasksQuery);
  const profilesResult = useQuery(profilesQuery);

  const tasks = tasksResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "given" | "taken" | "completed">("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Post new microtask modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Claim & Submit proof modals
  const [activeSubmitModal, setActiveSubmitModal] = useState<string | null>(null);
  const [submissionMethod, setSubmissionMethod] = useState<"drive" | "file">("drive");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const currentUserId = user?.id;

    return tasks.filter((t) => {
      const matchQuery =
        !q || [t.title, t.description ?? ""].join(" ").toLowerCase().includes(q);

      const matchStatus = selectedStatus === "all" || t.status === selectedStatus;

      // Filter Tab logic: All, Given (Posted by me), Taken (Claimed by me), Completed
      let matchTab = true;
      if (filterTab === "given") {
        matchTab = Boolean(t.posted_by && (t.posted_by === currentUserId || t.posted_by === "current-user"));
      } else if (filterTab === "taken") {
        matchTab = Boolean(t.claimed_by && (t.claimed_by === currentUserId || t.claimed_by === "current-user"));
      } else if (filterTab === "completed") {
        matchTab = t.status === "completed";
      }

      return matchQuery && matchStatus && matchTab;
    });
  }, [tasks, searchQuery, selectedStatus, filterTab, user]);

  const handlePostMicrotask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsPosting(true);
    try {
      await createNewMicrotask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        hours: 1, // fixed at 1 for binary point system
        posted_by: user?.id || "current-user",
      });

      toast.success("Microtask published! Worth 1 credibility point on completion.");
      setIsPostModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err: any) {
      toast.error(`Could not post microtask: ${err.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleClaim = async (taskId: string) => {
    try {
      await claimExistingMicrotask(taskId, user?.id || "current-user");
      toast.success("Task claimed! You have been assigned as the reviewer in Supabase.");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err: any) {
      toast.error(`Error claiming task: ${err.message}`);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitModal) return;
    if (submissionMethod === "drive" && !submissionUrl.trim()) {
      toast.error("Please provide your Google Drive link or deliverable URL.");
      return;
    }
    if (submissionMethod === "file" && !submissionFile) {
      toast.error("Please select a deliverable file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeExistingMicrotask(activeSubmitModal, {
        submission_url: submissionMethod === "drive" ? submissionUrl.trim() : undefined,
        submission_file_name: submissionMethod === "file" && submissionFile ? submissionFile.name : undefined,
        submission_file_size: submissionMethod === "file" && submissionFile ? `${Math.round(submissionFile.size / 1024)} KB` : undefined,
        submission_note: submissionNote.trim() || undefined,
      });
      toast.success("✓ Proof-of-work submitted! +1 credibility point credited to your record.");
      setActiveSubmitModal(null);
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

  return (
    <>
      <PageHead
        index="IV."
        eyebrow="Microtasks & Proof-of-Work"
        title="Small favours, permanent credit."
        lede="Thirty-minute to three-hour requests: a deck critique, a compiler bug review, a portfolio audit. Verified delivery increments your relational points in the college graph."
      />

      <Section>
        {/* Top Control Bar with "Post Task" Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-2 text-[11px]">View:</span>
            <div className="inline-flex rounded-xs border border-rule bg-background p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterTab === "all" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Open ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("given")}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterTab === "given" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tasks Given (Posted)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("taken")}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterTab === "taken" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tasks Taken (Claimed)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("completed")}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  filterTab === "completed" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Completed & Verified
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
            className="bg-accent text-accent-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" /> Post Microtask (Give Task)
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid gap-4 border-y border-foreground py-4 md:grid-cols-12 md:items-end">
          <label className="md:col-span-8">
            <span className="eyebrow">Search Tasks</span>
            <input
              type="text"
              placeholder="e.g. Compiler, design critique, bioinformatics, C++, pitch deck"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field text-base"
            />
          </label>
          <label className="md:col-span-4">
            <span className="eyebrow">Status Filter</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="field text-sm"
            >
              <option value="all">All States</option>
              <option value="open">Open (Ready to Claim)</option>
              <option value="claimed">Claimed (In Progress)</option>
              <option value="completed">Completed & Verified</option>
            </select>
          </label>
        </div>

        {/* Task Feed */}
        {tasksResult.isLoading ? (
          <Loading label="Inspecting open task ledgers" />
        ) : tasksResult.error ? (
          <div className="mt-8">
            <ErrorNote error={tasksResult.error} />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="mt-8">
            <Empty title="No microtasks found in this filter.">
              Post a new microtask above or switch filter tabs to see active assignments.
            </Empty>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="eyebrow">{filteredTasks.length} Microtasks Listed</span>
              <span className="text-xs text-muted-foreground font-mono">
                Supabase Ledger · Proof-of-Work Enabled
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredTasks.map((task) => {
                const poster = profiles.find((p) => p.id === task.posted_by);
                const claimant = profiles.find((p) => p.id === task.claimed_by);
                const isCompleted = task.status === "completed";

                return (
                  <article
                    key={task.id}
                    className="border border-rule bg-paper p-6 flex flex-col justify-between space-y-5 hover:border-foreground/60 transition-colors shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          {task.status === "completed" ? "+1 Point Earned" : "Worth 1 Point on Completion"}
                        </span>
                        <span
                          className={`font-mono text-[10px] uppercase px-2 py-0.5 border font-semibold ${
                            task.status === "open"
                              ? "border-accent text-accent bg-accent/5"
                              : task.status === "completed"
                              ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                              : "border-amber-700/40 text-amber-800 bg-amber-50 dark:bg-amber-950/40"
                          }`}
                        >
                          {task.status === "completed" ? "✓ Done" : task.status}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl leading-snug">
                        {task.title}
                        <SampleTag show={task.is_sample} />
                      </h3>

                      <p className="text-sm text-ink-soft leading-relaxed">
                        {task.description}
                      </p>

                      {/* Deliverable Proof Badge */}
                      {(task.submission_url || task.submission_file_name) && (
                        <div className="mt-2 rounded border border-accent/20 bg-accent/5 p-2.5 font-mono text-xs space-y-1">
                          <p className="text-accent font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Submitted Deliverable:
                          </p>
                          {task.submission_url && (
                            <a
                              href={task.submission_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-accent hover:underline text-[11px] truncate max-w-full"
                            >
                              <Link2 className="h-3 w-3" />
                              {task.submission_url.includes("drive.google.com")
                                ? "Google Drive Work File"
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

                    <div className="border-t border-rule pt-4 flex items-center justify-between gap-4 text-xs">
                      <div>
                        {poster ? (
                          <p className="text-muted-foreground">
                            Posted by:{" "}
                            <Link to="/alumni/$id" params={{ id: poster.id }} className="link-u text-foreground font-medium">
                              {poster.full_name}
                            </Link>
                          </p>
                        ) : (
                          <p className="text-muted-foreground font-mono">Posted by: Ashwood Scholar</p>
                        )}
                        {claimant && (
                          <p className="text-ink-soft mt-0.5 font-mono text-[11px]">
                            Claimed by: {claimant.full_name}
                          </p>
                        )}
                      </div>

                      <div>
                        {task.status === "open" ? (
                          <button
                            type="button"
                            onClick={() => handleClaim(task.id)}
                            className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-semibold cursor-pointer"
                          >
                            Claim Task
                          </button>
                        ) : task.status === "claimed" ? (
                          <button
                            type="button"
                            onClick={() => setActiveSubmitModal(task.id)}
                            className="border border-foreground bg-background px-3 py-1.5 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors font-semibold cursor-pointer"
                          >
                            Submit Deliverable
                          </button>
                        ) : (
                          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Verified & Credited
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Post New Microtask (Give Task) */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow text-accent">Micro-Stack Request</span>
                  <h3 className="font-display text-2xl font-bold mt-0.5">Post a Microtask</h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Ask a fellow student or graduate for targeted feedback, review, or code check.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostMicrotask} className="mt-5 space-y-4">
                <div>
                  <label className="eyebrow block mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audit compiler pass bug in LLVM IR"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Estimated Turnaround & Reward</label>
                  <select
                    className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none font-mono"
                    defaultValue="1"
                  >
                    <option value="1">1 hour (Worth 1 Binary Point)</option>
                    <option value="2">2 hours (Worth 1 Binary Point)</option>
                    <option value="0.5">30 minutes (Worth 1 Binary Point)</option>
                    <option value="3">Half day (Worth 1 Binary Point)</option>
                  </select>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Specification & Deliverable Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe precisely what review is needed, what files or link to check, and expected output..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="bg-primary px-6 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isPosting ? "Publishing..." : "Publish to Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Submitting Proof of Work */}
        {activeSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow text-accent">Proof-of-Work Verification</span>
                  <h3 className="font-display text-2xl font-bold mt-0.5">Submit Deliverable</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Provide a public reviewable link (GitHub PR, Google Doc, Figma file, or Loom video).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubmitModal(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="mt-5 space-y-4">
                <div>
                  <label className="eyebrow block mb-1.5">Deliverable Submission Method</label>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setSubmissionMethod("drive")}
                      className={`flex items-center justify-center gap-1.5 p-2.5 border transition-colors cursor-pointer ${
                        submissionMethod === "drive"
                          ? "border-accent bg-accent/10 text-accent font-semibold"
                          : "border-rule bg-paper text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Google Drive / Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmissionMethod("file")}
                      className={`flex items-center justify-center gap-1.5 p-2.5 border transition-colors cursor-pointer ${
                        submissionMethod === "file"
                          ? "border-accent bg-accent/10 text-accent font-semibold"
                          : "border-rule bg-paper text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload File
                    </button>
                  </div>
                </div>

                {submissionMethod === "drive" && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label className="eyebrow block">Google Drive or Deliverable URL *</label>
                    <input
                      type="url"
                      required={submissionMethod === "drive"}
                      placeholder="https://drive.google.com/file/d/... or https://github.com/..."
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="w-full border border-rule bg-paper p-3 text-xs focus:border-accent focus:outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Share a public Google Drive folder, doc, GitHub PR, Figma, or Loom video link.
                    </p>
                  </div>
                )}

                {submissionMethod === "file" && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label className="eyebrow block">Upload Deliverable File *</label>
                    <div className="border border-dashed border-rule bg-paper p-4 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        id="modalDeliverableFile"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSubmissionFile(file);
                        }}
                      />
                      <label htmlFor="modalDeliverableFile" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-6 w-6 text-accent" />
                        {submissionFile ? (
                          <div className="font-mono text-xs">
                            <p className="font-semibold text-foreground flex items-center gap-1 justify-center">
                              <Check className="h-3.5 w-3.5 text-accent" />
                              {submissionFile.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {Math.round(submissionFile.size / 1024)} KB · Click to change file
                            </p>
                          </div>
                        ) : (
                          <div className="font-mono text-xs">
                            <p className="font-semibold text-foreground">Click to select deliverable file</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">PDF, ZIP, DOCX, Code, or image artifacts</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="eyebrow block mb-1">Notes to Poster (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any context, blockers, or notes for the task poster..."
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="rounded border border-accent/20 bg-accent/5 p-3">
                  <p className="font-mono text-[11px] text-accent font-semibold">⚡ Binary Points System</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">Submission earns you exactly <strong>+1 credibility point</strong>. Points are binary — 0 (incomplete) or 1 (verified complete).</p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                  <button
                    type="button"
                    onClick={() => setActiveSubmitModal(null)}
                    className="border border-rule px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 font-semibold cursor-pointer"
                  >
                    {isSubmitting ? "Verifying..." : "Submit for Points"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
