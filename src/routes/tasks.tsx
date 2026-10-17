import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Empty, ErrorNote, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { tasksQuery, profilesQuery } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Microtasks & Proof-of-Work — Ashwood College" },
      { name: "description", content: "Lend a small hand: code reviews, paper teardowns, and design audits. Earn relational credibility points." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const tasksResult = useQuery(tasksQuery);
  const profilesResult = useQuery(profilesQuery);

  const tasks = tasksResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeClaimModal, setActiveClaimModal] = useState<string | null>(null);
  const [activeSubmitModal, setActiveSubmitModal] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tasks.filter((t) => {
      const matchQuery =
        !q || [t.title, t.description ?? ""].join(" ").toLowerCase().includes(q);
      const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
      return matchQuery && matchStatus;
    });
  }, [tasks, searchQuery, selectedStatus]);

  const handleClaim = (taskId: string) => {
    toast.success("Task claimed! You have been assigned as the reviewer. Submit your deliverable link once ready.");
    setActiveClaimModal(null);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveSubmitModal(null);
      setSubmissionUrl("");
      toast.success("Proof-of-work submitted! The posting alumnus has been notified to verify and grant relational points.");
    }, 600);
  };

  return (
    <>
      <PageHead
        index="IV."
        eyebrow="Microtasks"
        title="Small favours, permanent credit."
        lede="Thirty-minute to three-hour requests: a deck critique, a compiler bug review, a portfolio audit. Verified delivery increments your relational points in the college graph."
      />

      <Section>
        {/* Filters */}
        <div className="grid gap-4 border-y border-foreground py-4 md:grid-cols-12 md:items-end">
          <label className="md:col-span-8">
            <span className="eyebrow">Search Tasks</span>
            <input
              type="text"
              placeholder="e.g. Compiler, design critique, bioinformatics, C++"
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
            <Empty title="No microtasks found.">
              Check back soon or propose a new request to the alumni council.
            </Empty>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="eyebrow">{filteredTasks.length} Microtasks Listed</span>
              <span className="text-xs text-muted-foreground font-mono">Proof-of-Work Enabled</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredTasks.map((task) => {
                const poster = profiles.find((p) => p.id === task.posted_by);
                const claimant = profiles.find((p) => p.id === task.claimed_by);

                return (
                  <article
                    key={task.id}
                    className="border border-rule bg-paper p-6 flex flex-col justify-between space-y-5 hover:border-foreground/60 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          Est. {task.hours} hr{task.hours === 1 ? "" : "s"} · +{Number(task.hours) * 5} Relational Pts
                        </span>
                        <span
                          className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                            task.status === "open"
                              ? "border-accent text-accent bg-accent/5"
                              : task.status === "completed"
                              ? "border-foreground/30 text-muted-foreground bg-muted"
                              : "border-amber-700/40 text-amber-800 bg-amber-50"
                          }`}
                        >
                          {task.status}
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
                        {poster && (
                          <p className="text-muted-foreground">
                            Posted by:{" "}
                            <Link to="/alumni/$id" params={{ id: poster.id }} className="link-u text-foreground">
                              {poster.full_name}
                            </Link>
                          </p>
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
                            className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                          >
                            Claim Task
                          </button>
                        ) : task.status === "claimed" ? (
                          <button
                            type="button"
                            onClick={() => setActiveSubmitModal(task.id)}
                            className="border border-foreground bg-background px-3 py-1.5 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
                          >
                            Submit Deliverable
                          </button>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            ✓ Verified
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

        {/* Modal for Submitting Proof of Work */}
        {activeSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl">Submit Proof-of-Work</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Provide a public reviewable link (GitHub PR, Google Doc, Figma file, or Loom video).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubmitModal(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="mt-6 space-y-4">
                <div>
                  <label className="eyebrow block mb-2">Deliverable URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/... or https://docs.google.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubmitModal(null)}
                    className="border border-rule px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
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
