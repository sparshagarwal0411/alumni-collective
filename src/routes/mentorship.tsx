import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { profilesQuery } from "@/lib/queries";
import { MOCK_MENTORSHIP_REQUESTS, type MentorshipRequest } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/mentorship")({
  head: () => ({
    meta: [
      { title: "Mentorship Circle — Ashwood College" },
      { name: "description", content: "One-on-one counsel, career guidance, and academic direction between students and seasoned graduates." },
    ],
  }),
  component: MentorshipPage,
});

function MentorshipPage() {
  const profilesResult = useQuery(profilesQuery);
  const people = profilesResult.data ?? [];

  const mentors = useMemo(() => {
    return people.filter((p) => p.open_to_mentor);
  }, [people]);

  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRequestMentorId, setActiveRequestMentorId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("Transitioning from Academia to High-Impact Tech");
  const [requestNote, setRequestNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>(MOCK_MENTORSHIP_REQUESTS);

  const departments = useMemo(() => {
    return Array.from(new Set(mentors.map((m) => m.department).filter(Boolean))) as string[];
  }, [mentors]);

  const filteredMentors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mentors.filter((m) => {
      const matchDept = selectedDept === "all" || m.department === selectedDept;
      const matchQuery =
        !q ||
        [m.full_name, m.company, m.headline, ...(m.skills || [])]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchDept && matchQuery;
    });
  }, [mentors, selectedDept, searchQuery]);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestMentorId) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newReq: MentorshipRequest = {
        id: `mr-${Date.now()}`,
        mentor: activeRequestMentorId,
        mentee: "current-user",
        topic: selectedTopic,
        message: requestNote,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      setMyRequests((prev) => [newReq, ...prev]);
      setActiveRequestMentorId(null);
      setRequestNote("");
      toast.success("Mentorship session invitation submitted to alumnus calendar.");
    }, 600);
  };

  const selectedMentor = mentors.find((m) => m.id === activeRequestMentorId);

  return (
    <>
      <PageHead
        index="VIII."
        eyebrow="Mentorship"
        title="An hour of someone’s attention."
        lede="Request a dedicated consultation, career critique, or technical guidance from an alumnus who has walked the exact path before you."
      />

      <Section>
        {/* Active sessions list if any */}
        {myRequests.length > 0 && (
          <div className="mb-12 border border-rule bg-paper p-6">
            <div className="flex items-baseline justify-between border-b border-rule pb-3 mb-4">
              <span className="eyebrow">Your Active Consultations ({myRequests.length})</span>
              <span className="text-xs text-muted-foreground font-mono">Status Board</span>
            </div>
            <div className="divide-y divide-rule">
              {myRequests.map((req) => {
                const mentor = people.find((p) => p.id === req.mentor);
                return (
                  <div key={req.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-lg">
                        {mentor?.full_name ?? "Alumnus Mentor"} —{" "}
                        <span className="text-sm font-sans text-ink-soft">{req.topic}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.message ? `"${req.message}"` : "Session request queued."}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-xs uppercase px-2.5 py-1 border ${
                        req.status === "accepted"
                          ? "border-accent text-accent bg-background"
                          : "border-foreground/30 text-muted-foreground bg-muted"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid gap-4 border-y border-foreground py-4 md:grid-cols-12 md:items-end">
          <label className="md:col-span-8">
            <span className="eyebrow">Search Mentors</span>
            <input
              type="text"
              placeholder="Search by expertise, research area, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field text-base"
            />
          </label>
          <label className="md:col-span-4">
            <span className="eyebrow">Academic Faculty</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="field text-sm"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Mentors Feed */}
        {profilesResult.isLoading ? (
          <Loading label="Calling the mentorship registry" />
        ) : profilesResult.error ? (
          <div className="mt-8">
            <ErrorNote error={profilesResult.error} />
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="mt-8">
            <Empty title="No mentors currently matching this search." />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="eyebrow">{filteredMentors.length} Verified Alumni Available</span>
              <span className="text-xs text-muted-foreground font-mono">1:1 Mentorship Agreement</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredMentors.map((mentor) => (
                <article
                  key={mentor.id}
                  className="border border-rule bg-paper p-6 flex flex-col justify-between space-y-6 hover:border-foreground/50 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Monogram name={mentor.full_name} size="md" />
                      <div>
                        <h3 className="font-display text-2xl leading-tight">
                          {mentor.full_name}
                          <SampleTag show={mentor.is_sample} />
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Class of {mentor.grad_year} · {mentor.department}
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {mentor.role_title} at {mentor.company}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-ink-soft leading-relaxed">
                      {mentor.bio || mentor.headline}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(mentor.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="border border-rule bg-background px-2.5 py-0.5 text-xs text-ink-soft font-sans"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-rule pt-4 flex items-center justify-between gap-4">
                    <Link
                      to="/alumni/$id"
                      params={{ id: mentor.id }}
                      className="link-u text-xs font-mono"
                    >
                      View Dossier →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveRequestMentorId(mentor.id)}
                      className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                    >
                      Request Session
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Requesting Session */}
        {activeRequestMentorId && selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl">
                    Request Consultation with {selectedMentor.full_name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Class of {selectedMentor.grad_year} · {selectedMentor.company}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRequestMentorId(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendRequest} className="mt-6 space-y-4">
                <div>
                  <label className="eyebrow block mb-2">Primary Consultation Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  >
                    <option>Transitioning from Academia to High-Impact Tech</option>
                    <option>Graduate School & Ph.D. Proposal Review</option>
                    <option>System Architecture / Hardware Engineering Deep Dive</option>
                    <option>Product Leadership & Startup Founder Advisory</option>
                    <option>Resume Teardown & Mock Technical Interview</option>
                  </select>
                </div>

                <div>
                  <label className="eyebrow block mb-2">Your Specific Goals & Context</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Briefly state your current standing, what you hope to ask, and 2 preferred meeting timeframes..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveRequestMentorId(null)}
                    className="border border-rule px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Dispatching..." : "Send Invitation"}
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
