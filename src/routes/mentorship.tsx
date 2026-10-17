import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { z } from "zod";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { profilesQuery } from "@/lib/queries";
import { getAlumniPortrait } from "@/lib/portraits";
import { MOCK_MENTORSHIP_REQUESTS, type MentorshipRequest } from "@/lib/mockData";
import { toast } from "sonner";
import { CheckCircle2, Clock, MessageSquare, Send, UserCheck, X, ArrowLeft, Calendar } from "lucide-react";

const mentorshipSearch = z.object({
  mentorId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/mentorship")({
  validateSearch: mentorshipSearch,
  head: () => ({
    meta: [
      { title: "Mentorship Circle — Ashwood College" },
      {
        name: "description",
        content: "One-on-one counsel, career guidance, and academic direction between students and seasoned graduates.",
      },
    ],
  }),
  component: MentorshipPage,
});

const DEFAULT_TOPICS = [
  "Transitioning from Academia to High-Impact Tech",
  "Graduate School & Ph.D. Proposal Review",
  "System Architecture / Hardware Engineering Deep Dive",
  "Product Leadership & Startup Founder Advisory",
  "Resume Teardown & Mock Technical Interview",
  "General Career Counsel & Fellowship Guidance",
];

function MentorshipPage() {
  const { mentorId } = Route.useSearch();
  const profilesResult = useQuery(profilesQuery);
  const people = profilesResult.data ?? [];

  const mentors = useMemo(() => {
    return people.filter((p) => p.open_to_mentor);
  }, [people]);

  // If a mentor was selected directly via URL parameter
  const focusedMentor = useMemo(() => {
    if (!mentorId) return null;
    return people.find((p) => p.id === mentorId) ?? null;
  }, [mentorId, people]);

  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRequestMentorId, setActiveRequestMentorId] = useState<string | null>(mentorId || null);
  const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);
  const [requestNote, setRequestNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
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

  const handleSendRequest = (mentorTargetId: string) => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSessionSubmitted(true);
      const targetMentor = people.find((p) => p.id === mentorTargetId);
      const newReq: MentorshipRequest = {
        id: `mr-${Date.now()}`,
        mentor: mentorTargetId,
        mentee: "current-user",
        topic: selectedTopic,
        message: requestNote,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      setMyRequests((prev) => [newReq, ...prev]);
      toast.success(
        `Mentorship session invitation submitted to ${targetMentor?.full_name ?? "alumnus"}'s calendar.`,
      );
      setRequestNote("");
    }, 600);
  };

  const selectedModalMentor = mentors.find((m) => m.id === activeRequestMentorId);

  // If the user requested mentorship for a specific alumnus:
  // Show ONLY this alumnus and the consultation form directly at first glance, NO other profiles!
  if (focusedMentor) {
    const portrait = getAlumniPortrait(focusedMentor.id);

    return (
      <>
        <Section className="pt-10">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link to="/alumni/$id" params={{ id: focusedMentor.id }} className="link-u text-accent flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to {focusedMentor.full_name}'s Dossier
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/mentorship" search={{ mentorId: undefined }} className="link-u text-muted-foreground hover:text-foreground">
              Browse all mentors in register
            </Link>
          </div>
        </Section>

        <PageHead
          index="VIII."
          eyebrow="Direct Consultation"
          title={
            <span className="flex flex-wrap items-center gap-4">
              {portrait && (
                <img
                  src={portrait}
                  alt={focusedMentor.full_name}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-sm border border-rule object-cover object-top shadow-xs"
                />
              )}
              <span>Request Session with {focusedMentor.full_name}</span>
            </span>
          }
          lede={`You are requesting a dedicated 30–45 minute consultation with ${focusedMentor.full_name} (${focusedMentor.role_title ?? "Alumnus"} at ${focusedMentor.company ?? "Ashwood Network"}). Fill in the agenda below to schedule.`}
        />

        <Section className="mt-4 mb-24">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Left: Alumnus Card */}
            <div className="md:col-span-5 space-y-6">
              <div className="border border-rule bg-paper p-6 space-y-6">
                {portrait && (
                  <div className="overflow-hidden border border-rule bg-background shadow-xs">
                    <img
                      src={portrait}
                      alt={focusedMentor.full_name}
                      className="aspect-[4/5] w-full object-cover object-top grayscale transition duration-300 hover:grayscale-0 dark:opacity-90 dark:sepia-[.15] dark:hover:sepia-0"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-2xl">{focusedMentor.full_name}</p>
                    <SampleTag show={focusedMentor.is_sample} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    Class of {focusedMentor.grad_year} · {focusedMentor.department}
                  </p>
                  {focusedMentor.company && (
                    <div className="flex items-center gap-2 pt-1">
                      <CompanyLogo company={focusedMentor.company} size="sm" />
                      <span className="text-sm font-medium">{focusedMentor.company}</span>
                    </div>
                  )}
                  <p className="text-sm text-ink-soft leading-relaxed pt-2">
                    {focusedMentor.bio || focusedMentor.headline}
                  </p>
                </div>

                {focusedMentor.skills && focusedMentor.skills.length > 0 && (
                  <div className="border-t border-rule pt-4">
                    <span className="eyebrow block mb-2">Advisory Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {focusedMentor.skills.map((skill) => (
                        <span
                          key={skill}
                          className="border border-rule bg-background px-2.5 py-0.5 text-xs text-ink-soft font-sans"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: The Mentorship Form At First Glance (No extra buttons to click!) */}
            <div className="md:col-span-7">
              <div className="border border-rule bg-card p-6 md:p-8 shadow-sm">
                <div className="border-b border-rule pb-4 mb-6">
                  <span className="eyebrow text-accent">Advisory Protocol</span>
                  <h3 className="font-display text-3xl mt-1">Consultation Request Form</h3>
                  <p className="text-sm text-ink-soft mt-1">
                    State your question clearly so {focusedMentor.full_name.split(" ")[0]} can prepare relevant insights before meeting.
                  </p>
                </div>

                {sessionSubmitted ? (
                  <div className="py-12 text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-accent" />
                    <h4 className="font-display text-3xl">Invitation Queued</h4>
                    <p className="text-sm text-ink-soft max-w-md mx-auto">
                      Your consultation brief has been recorded. Once {focusedMentor.full_name} accepts, calendar coordinates will be sent to your account.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                      <Link
                        to="/alumni/$id"
                        params={{ id: focusedMentor.id }}
                        className="bg-primary px-5 py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                      >
                        Return to Dossier
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSessionSubmitted(false)}
                        className="border border-rule px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-foreground hover:bg-paper"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendRequest(focusedMentor.id);
                    }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="eyebrow block mb-2">Primary Consultation Topic</label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                      >
                        {DEFAULT_TOPICS.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="eyebrow block mb-2">Your Specific Goals & Context Note</label>
                      <textarea
                        rows={6}
                        required
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        placeholder={`Dear ${focusedMentor.full_name.split(" ")[0]},\n\nI am currently working on... and would value your perspective given your work at ${focusedMentor.company ?? "Ashwood"}...\n\nTopics I hope to address:\n1. ...\n2. ...`}
                        className="w-full border border-rule bg-paper p-3.5 text-sm focus:border-accent focus:outline-none leading-relaxed font-sans"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Be specific about what problem you are solving and how their past experience will accelerate your journey.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>Duration: 30–45 Minutes</span>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !requestNote.trim()}
                        className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSubmitting ? "Dispatching Invitation…" : "Dispatch Consultation Request"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Section>
      </>
    );
  }

  // Generic Mentorship Directory View (when no specific mentor is pre-selected)
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
                const mentorPortrait = mentor ? getAlumniPortrait(mentor.id) : null;

                return (
                  <div key={req.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {mentorPortrait ? (
                        <img
                          src={mentorPortrait}
                          alt={mentor?.full_name ?? "Mentor"}
                          className="h-10 w-10 rounded-sm border border-rule object-cover object-top"
                        />
                      ) : (
                        <Monogram name={mentor?.full_name ?? "Mentor"} size="sm" />
                      )}
                      <div>
                        <p className="font-display text-lg">
                          {mentor?.full_name ?? "Alumnus Mentor"} —{" "}
                          <span className="text-sm font-sans text-ink-soft">{req.topic}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {req.message ? `"${req.message}"` : "Session request queued."}
                        </p>
                      </div>
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
              {filteredMentors.map((mentor) => {
                const portrait = getAlumniPortrait(mentor.id);

                return (
                  <article
                    key={mentor.id}
                    className="border border-rule bg-paper p-6 flex flex-col justify-between space-y-6 hover:border-foreground/50 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        {portrait ? (
                          <img
                            src={portrait}
                            alt={mentor.full_name}
                            className="h-14 w-14 rounded-sm border border-rule object-cover object-top shadow-xs shrink-0"
                          />
                        ) : (
                          <Monogram name={mentor.full_name} size="md" />
                        )}
                        <div>
                          <h3 className="font-display text-2xl leading-tight">
                            {mentor.full_name}
                            <SampleTag show={mentor.is_sample} />
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Class of {mentor.grad_year} · {mentor.department}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                            {mentor.company && <CompanyLogo company={mentor.company} size="xs" />}
                            <span>
                              {mentor.role_title} at {mentor.company}
                            </span>
                          </div>
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
                        onClick={() => {
                          setActiveRequestMentorId(mentor.id);
                          setSessionSubmitted(false);
                        }}
                        className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                      >
                        Request Mentorship
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal for Requesting Session in Generic Mode */}
        {activeRequestMentorId && selectedModalMentor && !focusedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-3">
                  {getAlumniPortrait(selectedModalMentor.id) ? (
                    <img
                      src={getAlumniPortrait(selectedModalMentor.id)!}
                      alt={selectedModalMentor.full_name}
                      className="h-10 w-10 rounded-sm border border-rule object-cover object-top"
                    />
                  ) : (
                    <Monogram name={selectedModalMentor.full_name} size="sm" />
                  )}
                  <div>
                    <h3 className="font-display text-2xl leading-tight">
                      Consultation with {selectedModalMentor.full_name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                      Class of {selectedModalMentor.grad_year} · {selectedModalMentor.company}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRequestMentorId(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono p-1"
                >
                  ✕
                </button>
              </div>

              {sessionSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-accent" />
                  <h4 className="font-display text-2xl">Request Dispatched</h4>
                  <p className="text-xs text-ink-soft max-w-xs mx-auto">
                    Your invitation has been submitted directly to {selectedModalMentor.full_name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRequestMentorId(null);
                      setSessionSubmitted(false);
                    }}
                    className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendRequest(selectedModalMentor.id);
                  }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="eyebrow block mb-2">Primary Consultation Topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                    >
                      {DEFAULT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
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
                      disabled={isSubmitting || !requestNote.trim()}
                      className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Dispatching..." : "Send Invitation"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
