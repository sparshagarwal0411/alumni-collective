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
import { Plus, CheckCircle2, Clock, Award, ShieldCheck, Filter, ExternalLink, ArrowRight } from "lucide-react";

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
  const [newHours, setNewHours] = useState<number>(1.0);
  const [isPosting, setIsPosting] = useState(false);

  // Claim & Submit proof modals
  const [activeSubmitModal, setActiveSubmitModal] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
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
        hours: newHours,
        posted_by: user?.id || "current-user",
      });

      toast.success("Microtask request published to the live register!");
      setIsPostModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewHours(1.0);
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

    setIsSubmitting(true);
    try {
      await completeExistingMicrotask(activeSubmitModal);
      toast.success("Proof-of-work submitted! Relational credibility points credited to your record.");
      setActiveSubmitModal(null);
      setSubmissionUrl("");
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
                const points = Math.round((Number(task.hours) || 1) * 10);

                return (
                  <article
                    key={task.id}
                    className="border border-rule bg-paper p-6 flex flex-col justify-between space-y-5 hover:border-foreground/60 transition-colors shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          Est. {task.hours} hr{task.hours === 1 ? "" : "s"} · +{points} Relational Pts
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
                  <label className="eyebrow block mb-1">Estimated Duration (Hours)</label>
                  <select
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                  >
                    <option value={0.5}>30 minutes (+5 points)</option>
                    <option value={1.0}>1 hour (+10 points)</option>
                    <option value={1.5}>1.5 hours (+15 points)</option>
                    <option value={2.0}>2 hours (+20 points)</option>
                    <option value={3.0}>3 hours (+30 points)</option>
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
                  <label className="eyebrow block mb-1">Deliverable URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/... or https://docs.google.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-xs focus:border-accent focus:outline-none"
                  />
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
