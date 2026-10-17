import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { companiesQuery, profilesQuery, societiesQuery } from "@/lib/queries";
import { getAlumniPortrait } from "@/lib/portraits";
import { MOCK_MENTORSHIP_REQUESTS, type MentorshipRequest } from "@/lib/mockData";
import { toast } from "sonner";
import { Clock, Send, X, CheckCircle2, Search } from "lucide-react";

const communitiesSearch = z.object({
  tab: z.enum(["societies", "companies", "mentorship"]).optional().catch(undefined),
});

export const Route = createFileRoute("/communities")({
  validateSearch: communitiesSearch,
  head: () => ({
    meta: [
      { title: "Communities & Mentorship — Ashwood College" },
      {
        name: "description",
        content: "Campus societies, company chapters, and one-on-one alumni mentorship consultations.",
      },
    ],
  }),
  component: CommunitiesPage,
});

const DEFAULT_TOPICS = [
  "Transitioning from Systems Research to Industry Infrastructure Engineering",
  "Graduate School & Ph.D. Proposal Review",
  "Hardware & Robotics Architecture Deep Dive",
  "Crafting a Design Systems Portfolio with Editorial Typography",
  "Product Leadership & Zero-to-One Strategy",
  "Quantitative Modeling & High-Frequency Systems",
  "General Career Counsel & Fellowship Guidance",
];

function CommunitiesPage() {
  const search = Route.useSearch();
  const societiesResult = useQuery(societiesQuery);
  const companiesResult = useQuery(companiesQuery);
  const profilesResult = useQuery(profilesQuery);

  const societies = societiesResult.data ?? [];
  const companies = companiesResult.data ?? [];
  const people = profilesResult.data ?? [];

  const [tab, setTab] = useState<"societies" | "companies" | "mentorship">(
    search.tab || "societies",
  );

  // Mentorship Tab States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>(MOCK_MENTORSHIP_REQUESTS);
  const [activeRequestMentorId, setActiveRequestMentorId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);
  const [requestNote, setRequestNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);

  const nameOf = (id: string) => people.find((p) => p.id === id)?.full_name ?? "Alumnus";

  const companyIndustries = useMemo(
    () => [...new Set(companies.map((c) => c.industry))].sort(),
    [companies],
  );

  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department).filter(Boolean))) as string[];
  }, [people]);

  const filteredAlumni = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return people.filter((p) => {
      const matchDept = selectedDept === "all" || p.department === selectedDept;
      const matchQuery =
        !q ||
        [p.full_name, p.company, p.headline, p.role_title, ...(p.skills || [])]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchDept && matchQuery;
    });
  }, [people, selectedDept, searchQuery]);

  const activeMentor = people.find((p) => p.id === activeRequestMentorId);

  const handleSendMentorshipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMentor) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSessionSubmitted(true);

      const newReq: MentorshipRequest = {
        id: `mr-${Date.now()}`,
        mentor: activeMentor.id,
        mentee: "current-user",
        topic: selectedTopic,
        message: requestNote,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      setMyRequests((prev) => [newReq, ...prev]);
      toast.success(`Mentorship consultation request submitted directly to ${activeMentor.full_name}.`);

      setTimeout(() => {
        setActiveRequestMentorId(null);
        setSessionSubmitted(false);
        setRequestNote("");
      }, 1000);
    }, 600);
  };

  return (
    <>
      <PageHead
        index="VII."
        eyebrow="Chapters & Collective"
        title="Societies, the houses they went to, and mentorship."
        lede="The clubs that still meet on campus, the companies where Ashwood graduates sit, and direct one-on-one mentorship consultations."
      />

      <Section>
        {/* Browse Navigation Bar */}
        <div className="flex flex-wrap items-center gap-3 border-y border-foreground py-4 font-mono text-xs">
          <span className="eyebrow mr-2">Browse:</span>
          <button
            type="button"
            onClick={() => setTab("societies")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "societies"
                ? "bg-primary text-primary-foreground"
                : "border border-rule hover:border-foreground"
            }`}
          >
            Campus societies ({societies.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("companies")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "companies"
                ? "bg-primary text-primary-foreground"
                : "border border-rule hover:border-foreground"
            }`}
          >
            Where alumni work ({companies.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("mentorship")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "mentorship"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-rule hover:border-foreground"
            }`}
          >
            Mentorship ({people.length})
          </button>
        </div>

        {/* Tab 1: Campus Societies */}
        {tab === "societies" && (
          societiesResult.isLoading ? (
            <Loading label="Calling the societies" />
          ) : (
            <div className="mt-12 grid gap-0 md:grid-cols-2">
              {societies.map((soc, i) => (
                <article
                  key={soc.id}
                  className={`border-t border-rule py-10 md:px-8 ${i % 2 === 0 ? "md:pl-0 md:border-r" : "md:pr-0"}`}
                >
                  <p className="eyebrow">
                    Est. {soc.founded} · {soc.members} on the roll
                    <SampleTag />
                  </p>
                  <h2 className="mt-3 font-display text-3xl">{soc.name}</h2>
                  <p className="mt-3 text-ink-soft">{soc.summary}</p>
                  <ul className="mt-6 flex flex-wrap gap-4">
                    {soc.alumniIds.map((id) => (
                      <li key={id}>
                        <Link to="/alumni/$id" params={{ id }} className="flex items-center gap-2 text-sm hover:text-accent">
                          <Monogram name={nameOf(id)} size="sm" />
                          {nameOf(id)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )
        )}

        {/* Tab 2: Where Alumni Work */}
        {tab === "companies" && (
          companiesResult.isLoading ? (
            <Loading label="Listing employers" />
          ) : (
            <>
              <p className="mt-8 text-sm text-ink-soft">
                {companyIndustries.length} industries · {companies.reduce((n, c) => n + c.alumniCount, 0)} alumni on record at
                these houses. Figures are illustrative.
              </p>
              <div className="mt-8 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((co) => (
                  <article key={co.id} className="bg-background p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">
                          {co.industry}
                          <SampleTag />
                        </p>
                        <h2 className="mt-2 font-display text-2xl">{co.company}</h2>
                      </div>
                      <CompanyLogo company={co.company} size="lg" className="shrink-0 shadow-xs" />
                    </div>
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      {co.alumniCount} alumni · {co.cities.join(" · ")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{co.summary}</p>
                    <ul className="mt-5 space-y-2">
                      {co.alumniIds.map((id) => (
                        <li key={id}>
                          <Link to="/alumni/$id" params={{ id }} className="link-u text-sm">
                            {nameOf(id)}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link to="/directory" search={{ q: co.company }} className="text-xs text-muted-foreground hover:text-foreground">
                          Search directory →
                        </Link>
                      </li>
                    </ul>
                  </article>
                ))}
              </div>
            </>
          )
        )}

        {/* Tab 3: Mentorship Circle (All Alumni with Active Consultations Board) */}
        {tab === "mentorship" && (
          <div className="mt-10 space-y-12">
            {/* Header intro matching screenshot */}
            <div className="border-b border-rule pb-8">
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span>VIII.</span>
                <span>·</span>
                <span className="eyebrow">MENTORSHIP</span>
              </div>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl text-foreground">
                An hour of someone’s attention.
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-ink-soft leading-relaxed font-sans">
                Request a dedicated consultation, career critique, or technical guidance from an
                alumnus who has walked the exact path before you.
              </p>
            </div>

            {/* Active Consultations Board (Matches User's Screenshot) */}
            <div className="border border-rule bg-paper p-6 md:p-8">
              <div className="flex items-baseline justify-between border-b border-rule pb-3 mb-5">
                <span className="eyebrow tracking-wider text-xs">
                  YOUR ACTIVE CONSULTATIONS ({myRequests.length})
                </span>
                <span className="text-xs text-muted-foreground font-mono">Status Board</span>
              </div>

              {myRequests.length === 0 ? (
                <p className="py-6 text-center text-sm italic text-muted-foreground">
                  No active consultations currently on record. Request one from any alumnus below.
                </p>
              ) : (
                <div className="divide-y divide-rule">
                  {myRequests.map((req) => {
                    const mentor = people.find((p) => p.id === req.mentor);
                    const mentorPortrait = mentor ? getAlumniPortrait(mentor.id, mentor.full_name) : null;
                    const mentorName = mentor?.full_name ?? "Alumnus Mentor";

                    return (
                      <div
                        key={req.id}
                        className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {mentorPortrait ? (
                            <img
                              src={mentorPortrait}
                              alt={mentorName}
                              className="h-11 w-11 rounded-sm border border-rule object-cover object-top shadow-xs shrink-0"
                            />
                          ) : (
                            <Monogram name={mentorName} size="sm" />
                          )}
                          <div className="space-y-1">
                            <p className="font-display text-xl leading-snug">
                              <span className="font-semibold text-foreground">{mentorName}</span>
                              <span className="text-muted-foreground"> — </span>
                              <span className="font-sans text-sm font-normal text-ink-soft">
                                {req.topic}
                              </span>
                            </p>
                            {req.message && (
                              <p className="text-xs text-muted-foreground italic leading-relaxed">
                                "{req.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span
                            className={`inline-block px-3 py-1 font-mono text-[11px] uppercase tracking-wider border ${
                              req.status === "accepted"
                                ? "border-accent text-accent bg-accent/5 font-semibold"
                                : "border-rule bg-paper text-muted-foreground"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mentors Search & Academic Faculty Filter Bar */}
            <div className="grid gap-6 border-y border-foreground py-5 md:grid-cols-12 md:items-end">
              <label className="md:col-span-8">
                <span className="eyebrow block mb-1.5">SEARCH MENTORS</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by expertise, research area, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-rule bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </label>

              <label className="md:col-span-4">
                <span className="eyebrow block mb-1.5">ACADEMIC FACULTY</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full border border-rule bg-paper px-3 py-3 text-sm focus:border-accent focus:outline-none"
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

            {/* Alumni Mentors Grid (Shows ALL Alumni) */}
            {profilesResult.isLoading ? (
              <Loading label="Calling the mentorship roll" />
            ) : filteredAlumni.length === 0 ? (
              <div className="py-12">
                <Empty title="No alumni match this inquiry.">
                  <p className="mt-2 text-ink-soft">Try searching with broader terms or clear the department filter.</p>
                </Empty>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-baseline justify-between border-b border-rule pb-2">
                  <span className="eyebrow">{filteredAlumni.length} Verified Alumni Available</span>
                  <span className="text-xs text-muted-foreground font-mono">1:1 Mentorship Agreement</span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {filteredAlumni.map((person) => {
                    const portrait = getAlumniPortrait(person.id, person.full_name);

                    return (
                      <article
                        key={person.id}
                        className="flex flex-col justify-between border border-rule bg-paper p-6 transition-colors hover:border-foreground/50 shadow-xs"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            {portrait ? (
                              <img
                                src={portrait}
                                alt={person.full_name}
                                className="h-16 w-16 rounded-sm border border-rule object-cover object-top shadow-xs shrink-0"
                              />
                            ) : (
                              <Monogram name={person.full_name} size="md" />
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-2xl leading-tight">
                                <Link
                                  to="/alumni/$id"
                                  params={{ id: person.id }}
                                  className="hover:text-accent transition-colors"
                                >
                                  {person.full_name}
                                </Link>
                                <SampleTag show={person.is_sample} />
                              </h3>
                              <p className="mt-0.5 font-mono text-xs text-muted-foreground truncate">
                                Class of {person.grad_year} · {person.department}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                {person.company && (
                                  <CompanyLogo company={person.company} size="xs" />
                                )}
                                <span className="truncate">
                                  {person.role_title || "Alumnus"}
                                  {person.company ? ` at ${person.company}` : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm leading-relaxed text-ink-soft line-clamp-3">
                            {person.bio || person.headline}
                          </p>

                          {person.skills && person.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {person.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="border border-rule bg-background px-2.5 py-0.5 font-sans text-xs text-ink-soft"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-rule pt-4">
                          <Link
                            to="/alumni/$id"
                            params={{ id: person.id }}
                            className="link-u font-mono text-xs text-muted-foreground hover:text-foreground"
                          >
                            View Dossier →
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRequestMentorId(person.id);
                              setSessionSubmitted(false);
                            }}
                            className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent"
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

            {/* Mentorship Request Modal (Form directly accessible!) */}
            {activeRequestMentorId && activeMentor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between border-b border-rule pb-4">
                    <div className="flex items-center gap-3">
                      {getAlumniPortrait(activeMentor.id, activeMentor.full_name) ? (
                        <img
                          src={getAlumniPortrait(activeMentor.id, activeMentor.full_name)!}
                          alt={activeMentor.full_name}
                          className="h-12 w-12 rounded-sm border border-rule object-cover object-top shadow-xs"
                        />
                      ) : (
                        <Monogram name={activeMentor.full_name} size="sm" />
                      )}
                      <div>
                        <h3 className="font-display text-2xl leading-tight">
                          Consultation with {activeMentor.full_name}
                        </h3>
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">
                          {activeMentor.role_title} at {activeMentor.company}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveRequestMentorId(null)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {sessionSubmitted ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="font-display text-2xl text-foreground">
                        Consultation Invitation Dispatched
                      </h4>
                      <p className="text-sm text-ink-soft max-w-sm mx-auto">
                        Your request has been added to your Active Consultations board and queued
                        for {activeMentor.full_name}'s review.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMentorshipRequest} className="mt-5 space-y-4">
                      <div>
                        <label className="eyebrow block mb-1.5">Consultation Topic</label>
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
                        <label className="eyebrow block mb-1.5">Context Note & Focus Questions</label>
                        <textarea
                          rows={4}
                          required
                          value={requestNote}
                          onChange={(e) => setRequestNote(e.target.value)}
                          placeholder={`Dear ${activeMentor.full_name.split(" ")[0]},\n\nI would value your counsel regarding...`}
                          className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none leading-relaxed font-sans"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Briefly summarize the problem you are solving and questions you wish to explore.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Clock className="h-4 w-4 text-accent" />
                          <span>30–45 Minute Session</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveRequestMentorId(null)}
                            className="border border-rule px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !requestNote.trim()}
                            className="inline-flex items-center gap-2 bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {isSubmitting ? "Dispatching…" : "Dispatch Request"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Propose a community / footer card */}
        <div className="mt-20 grid items-center gap-8 border border-rule bg-paper p-8 md:grid-cols-12 md:p-12">
          <div className="space-y-2 md:col-span-7">
            <span className="eyebrow">Start a chapter or mentorship circle</span>
            <h3 className="font-display text-3xl">A city, a company, a society — write in.</h3>
            <p className="text-sm text-ink-soft">
              If your firm, old club, or specialized discipline is missing from this list, the
              Association will add a roll as soon as two alumni ask for it.
            </p>
          </div>
          <div className="md:col-span-5">
            <Link to="/auth" className="inline-block bg-accent px-5 py-2.5 text-sm text-accent-foreground hover:bg-primary">
              Propose a community
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
