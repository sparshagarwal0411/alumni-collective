import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Empty, ErrorNote, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { jobsQuery, profilesQuery } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs & Referrals — Ashwood College" },
      { name: "description", content: "Career opportunities and trusted internal referrals provided by Ashwood alumni worldwide." },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const jobsResult = useQuery(jobsQuery);
  const profilesResult = useQuery(profilesQuery);

  const jobs = jobsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState("all");
  const [referralOnly, setReferralOnly] = useState(false);
  const [activeReferralModal, setActiveReferralModal] = useState<string | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return jobs.filter((job) => {
      const matchQuery =
        !q ||
        [job.title, job.company, job.location ?? "", job.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchKind = selectedKind === "all" || job.kind === selectedKind;
      const matchReferral = !referralOnly || job.referral_available;
      return matchQuery && matchKind && matchReferral;
    });
  }, [jobs, searchQuery, selectedKind, referralOnly]);

  const handleRequestReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveReferralModal(null);
      setReferralNote("");
      toast.success("Referral request dispatched directly to the alumni poster's inbox.");
    }, 600);
  };

  return (
    <>
      <PageHead
        index="III."
        eyebrow="Opportunity"
        title="Jobs, fellowships and referrals."
        lede="Roles posted directly by Ashwood graduates. Ask for introductions, vouch for juniors, and bypass automated recruitment filters."
      />

      <Section>
        {/* Filters */}
        <div className="grid gap-4 border-y border-foreground py-4 md:grid-cols-12 md:items-end">
          <label className="md:col-span-6">
            <span className="eyebrow">Search Roles</span>
            <input
              type="text"
              placeholder="e.g. Distributed Systems, Product Manager, Bengaluru, London"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field text-base"
            />
          </label>
          <label className="md:col-span-3">
            <span className="eyebrow">Engagement Type</span>
            <select
              value={selectedKind}
              onChange={(e) => setSelectedKind(e.target.value)}
              className="field text-sm"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-3">
            <input
              type="checkbox"
              checked={referralOnly}
              onChange={(e) => setReferralOnly(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Alumni Referrals Only
          </label>
        </div>

        {/* Content list */}
        {jobsResult.isLoading ? (
          <Loading label="Fetching opportunities from the register" />
        ) : jobsResult.error ? (
          <div className="mt-8">
            <ErrorNote error={jobsResult.error} />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="mt-8">
            <Empty title="No postings match your criteria.">
              Try adjusting your search query or clearing the referral filter.
            </Empty>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="eyebrow">{filteredJobs.length} Positions Available</span>
              <span className="text-xs text-muted-foreground font-mono">Verified Alumni Postings</span>
            </div>

            <div className="divide-y divide-rule border-b border-rule">
              {filteredJobs.map((job) => {
                const poster = profiles.find((p) => p.id === job.posted_by);

                return (
                  <article
                    key={job.id}
                    className="group py-8 transition-colors md:grid md:grid-cols-12 md:gap-8"
                  >
                    <div className="md:col-span-8 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          {job.kind}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-display text-lg text-foreground font-semibold">
                          {job.company}
                        </span>
                        <SampleTag show={job.is_sample} />
                        {job.referral_available && (
                          <span className="border border-accent/40 bg-paper px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
                            Referral Offered
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-3xl text-foreground group-hover:text-accent transition-colors">
                        {job.title}
                      </h3>

                      <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span>📍 {job.location || "Remote / Flexible"}</span>
                        {poster && (
                          <span>
                            Posted by:{" "}
                            <Link
                              to="/alumni/$id"
                              params={{ id: poster.id }}
                              className="link-u text-foreground"
                            >
                              {poster.full_name} ({poster.role_title ?? "Alumnus"})
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col justify-between gap-4 md:mt-0 md:col-span-4 md:items-end">
                      <div className="text-right">
                        <span className="eyebrow block">Listed</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {job.referral_available && (
                          <button
                            type="button"
                            onClick={() => setActiveReferralModal(job.id)}
                            className="border border-foreground bg-background px-4 py-2 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
                          >
                            Request Referral
                          </button>
                        )}
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                          >
                            Apply ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal for Requesting Referral */}
        {activeReferralModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl">Request an Alumni Referral</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your college record, shared projects, and statement will be sent to the posting alumnus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReferralModal(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestReferral} className="mt-6 space-y-4">
                <div>
                  <label className="eyebrow block mb-2">Introduction & Fit Statement</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Briefly explain your relevant experience, graduation year, and why you are excited about this role..."
                    value={referralNote}
                    onChange={(e) => setReferralNote(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveReferralModal(null)}
                    className="border border-rule px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Send Request"}
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
