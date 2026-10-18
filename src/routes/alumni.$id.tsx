import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { profileQuery, tasksQuery } from "@/lib/queries";
import { getAlumniPortrait } from "@/lib/portraits";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Clock, MessageSquare, Send, UserCheck, X } from "lucide-react";
import { MicrotasksManager } from "@/components/microtasks/MicrotasksManager";

export const Route = createFileRoute("/alumni/$id")({
  head: () => ({
    meta: [
      { title: "Alumnus Profile — Ashwood College" },
      { name: "description", content: "View alumni academic record, skills, and current appointments." },
    ],
  }),
  component: ProfilePage,
});

const DEFAULT_TOPICS = [
  "Navigating Technical & Architectural Roadblocks",
  "Transitioning from Research to Industry Scale",
  "Product Strategy & Zero-to-One Architecture",
  "Graduate Fellowship & Doctoral Advisory",
  "Angel Syndicate & Early-Stage Capital Formulation",
  "General Career Counsel & Portfolio Critique",
];

function ProfilePage() {
  const { id } = Route.useParams();
  const profile = useQuery(profileQuery(id));
  const tasks = useQuery(tasksQuery);

  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);
  const [requestNote, setRequestNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);

  const p = profile.data;
  const userTasks = (tasks.data ?? []).filter((t) => t.posted_by === id || t.claimed_by === id);
  const portrait = p ? getAlumniPortrait(p.id, p.full_name) : null;

  if (profile.isLoading) {
    return <Loading label="Consulting the college register" />;
  }

  if (profile.error) {
    return (
      <Section className="py-16">
        <ErrorNote error={profile.error} />
      </Section>
    );
  }

  if (!p) {
    return (
      <Section className="py-20 text-center">
        <Empty title="Alumnus record not found">
          <p className="mt-2 text-ink-soft">This individual may not be registered in the public roll yet.</p>
          <div className="mt-6">
            <Link to="/directory" className="link-u text-sm">
              ← Return to Directory
            </Link>
          </div>
        </Empty>
      </Section>
    );
  }

  const handleSendMentorshipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSessionSubmitted(true);
      toast.success(`Mentorship consultation request sent directly to ${p.full_name}.`);
      setTimeout(() => {
        setIsMentorshipModalOpen(false);
        setSessionSubmitted(false);
        setRequestNote("");
      }, 1200);
    }, 600);
  };

  return (
    <>
      <Section className="pt-10">
        <Link to="/directory" className="eyebrow link-u">
          ← Back to Directory
        </Link>
      </Section>

      <PageHead
        index={
          portrait ? (
            <div className="overflow-hidden rounded-sm border border-rule bg-paper shadow-sm">
              <img
                src={portrait}
                alt={p.full_name}
                className="aspect-square w-24 object-cover object-top md:h-32 md:w-32"
              />
            </div>
          ) : (
            <Monogram name={p.full_name} size="lg" />
          )
        }
        eyebrow={`${p.department ?? "Alumni"} · Class of ${p.grad_year ?? "Unknown"}`}
        title={
          <span className="flex flex-wrap items-baseline gap-3">
            <span>{p.full_name}</span>
            <SampleTag show={p.is_sample} />
          </span>
        }
        lede={
          <div className="space-y-3">
            <p className="text-lg leading-relaxed text-ink-soft">
              {p.headline || `${p.role_title ?? "Member"} at ${p.company ?? "Ashwood Network"}`}
            </p>
            {p.company && (
              <div className="pt-1">
                <CompanyLogo company={p.company} variant="pill" size="sm" />
              </div>
            )}
          </div>
        }
        aside={
          <div className="space-y-3">
            {p.open_to_mentor && (
              <div className="inline-flex items-center gap-2 border border-accent/40 bg-paper px-3 py-1.5 font-mono text-xs text-accent">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Open to Mentoring
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                to="/messages"
                className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent"
              >
                Send Message
              </Link>
              {p.open_to_mentor && (
                <button
                  type="button"
                  onClick={() => setIsMentorshipModalOpen(true)}
                  className="border border-foreground bg-background px-4 py-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Request Mentorship
                </button>
              )}
            </div>
          </div>
        }
      />

      <Section className="mt-6">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Main Column */}
          <div className="space-y-12 md:col-span-8">
            {/* Biography */}
            <div className="border-t border-rule pt-6">
              <h2 className="eyebrow mb-4">Background & Notes</h2>
              <p className="font-display text-2xl leading-relaxed text-foreground/90">
                {p.bio || "No biographical statement entered into the register."}
              </p>
            </div>

            {/* Skills & Knowledge */}
            {p.skills && p.skills.length > 0 && (
              <div className="border-t border-rule pt-6">
                <h2 className="eyebrow mb-4">Focus Areas & Competencies</h2>
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-rule bg-paper px-3 py-1 text-sm font-sans text-ink-soft transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Microtasks / Ledger */}
            <div className="border-t border-rule pt-8">
              <MicrotasksManager
                profileId={p.id}
                rolePerspective="alumni"
                title={`${p.full_name}'s Microtask Ledger`}
                description={`Commissioned work and research reviews offered by ${p.full_name}. Verified completion awards 1 binary point.`}
              />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8 md:col-span-4">
            <div className="border border-rule bg-paper p-6 space-y-6">
              {/* Archival Photographic Record (Alumnus DP / Portrait) */}
              {portrait ? (
                <figure className="space-y-2">
                  <div className="relative aspect-[4/5] w-full overflow-hidden border border-rule bg-background shadow-xs">
                    <img
                      src={portrait}
                      alt={`Portrait of ${p.full_name}`}
                      className="h-full w-full object-cover object-top grayscale transition duration-300 hover:grayscale-0 dark:opacity-90 dark:sepia-[.15] dark:hover:sepia-0"
                    />
                  </div>
                  <figcaption className="flex justify-between font-mono text-[10px] text-muted-foreground">
                    <span>Ashwood Register · Photographic Record</span>
                    <span>Class of {p.grad_year}</span>
                  </figcaption>
                </figure>
              ) : (
                <div className="flex items-center gap-4">
                  <Monogram name={p.full_name} size="lg" />
                  <div>
                    <p className="font-display text-lg">{p.full_name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Class of {p.grad_year}
                    </p>
                  </div>
                </div>
              )}

              {/* Profile Details */}
              <div className="space-y-4 border-t border-rule pt-4 text-sm">
                <div>
                  <span className="eyebrow block mb-2">Current Position</span>
                  {p.company ? (
                    <div className="flex items-center gap-3 rounded-sm border border-rule bg-background/80 p-3 shadow-xs">
                      <CompanyLogo company={p.company} size="md" className="shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-medium leading-tight text-foreground">
                          {p.role_title || "Alumnus"}
                        </span>
                        <span className="block text-xs font-mono text-ink-soft mt-0.5">
                          {p.company}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="font-medium">{p.role_title || "Alumnus"}</span>
                  )}
                </div>

                <div>
                  <span className="eyebrow block">Primary Location</span>
                  <span>{p.city || "Unspecified"}</span>
                </div>

                <div>
                  <span className="eyebrow block">Department & Degree</span>
                  <span>{p.department}</span>
                  {p.degree && <span className="block text-ink-soft text-xs">{p.degree}</span>}
                </div>

                {p.linkedin && (
                  <div>
                    <span className="eyebrow block">External Registry</span>
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="link-u text-xs text-accent"
                    >
                      View LinkedIn Profile ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="border-l-2 border-foreground/20 pl-4 py-2">
              <p className="eyebrow">Institutional Verification</p>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                Academic credentials and graduation records verified against Ashwood College
                Registrar records.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Direct Mentorship Request Modal — Appears immediately when clicking Request Mentorship */}
      {isMentorshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl border border-foreground/30 bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-rule pb-4">
              <div className="flex items-center gap-3">
                {portrait ? (
                  <img
                    src={portrait}
                    alt={p.full_name}
                    className="h-12 w-12 rounded-sm border border-rule object-cover object-top"
                  />
                ) : (
                  <Monogram name={p.full_name} size="sm" />
                )}
                <div>
                  <span className="eyebrow text-accent">Direct Mentorship Request</span>
                  <h3 className="font-display text-2xl text-foreground">
                    Consultation with {p.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
                    <span>Class of {p.grad_year}</span>
                    <span>·</span>
                    {p.company && <CompanyLogo company={p.company} size="xs" />}
                    <span>{p.company || p.department}</span>
                  </div>
                </div>
              </div>
              {/* <button
                type="button"
                onClick={() => setIsMentorshipModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-mono p-1"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button> */}
            </div>

            {sessionSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 mx-auto text-accent" />
                <h4 className="font-display text-2xl">Request Dispatched</h4>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  Your mentorship consultation invitation has been sent to {p.full_name}. You will be notified when they accept.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMentorshipRequest} className="mt-6 space-y-5">
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
                  <label className="eyebrow block mb-1.5">
                    Proposed Agenda / Context Note
                  </label>
                  <textarea
                    rows={4}
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    required
                    placeholder={`Hello ${p.full_name.split(" ")[0]}, I am an Ashwood student/junior working on... I would greatly appreciate 30–45 minutes of your counsel regarding...`}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none leading-relaxed"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Briefly articulate your question, current stage, and why their specific background at {p.company ?? "Ashwood"} will guide your next steps.
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-rule pt-4 justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    <span>30–45 Min Consultation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMentorshipModalOpen(false)}
                      className="border border-rule px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !requestNote.trim()}
                      className="inline-flex items-center gap-2 bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      {isSubmitting ? "Dispatching…" : "Send Request"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
