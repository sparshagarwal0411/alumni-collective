import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { profileQuery, tasksQuery } from "@/lib/queries";

export const Route = createFileRoute("/alumni/$id")({
  head: () => ({
    meta: [
      { title: "Alumnus Profile — Ashwood College" },
      { name: "description", content: "View alumni academic record, skills, and current appointments." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const profile = useQuery(profileQuery(id));
  const tasks = useQuery(tasksQuery);

  const p = profile.data;
  const userTasks = (tasks.data ?? []).filter((t) => t.posted_by === id || t.claimed_by === id);

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

  return (
    <>
      <Section className="pt-10">
        <Link to="/directory" className="eyebrow link-u">
          ← Back to Directory
        </Link>
      </Section>

      <PageHead
        eyebrow={`${p.department ?? "Alumni"} · Class of ${p.grad_year ?? "Unknown"}`}
        title={
          <span className="flex flex-wrap items-baseline gap-3">
            {p.full_name}
            <SampleTag show={p.is_sample} />
          </span>
        }
        lede={p.headline || `${p.role_title ?? "Member"} at ${p.company ?? "Ashwood Network"}`}
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
                <Link
                  to="/mentorship"
                  className="border border-foreground bg-background px-4 py-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Request Mentorship
                </Link>
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
            <div className="border-t border-rule pt-6">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="eyebrow">Microtask Ledger</h2>
                <Link to="/tasks" className="link-u text-xs">
                  All microtasks →
                </Link>
              </div>

              {userTasks.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">
                  No public microtasks currently associated with this profile.
                </p>
              ) : (
                <ul className="divide-y divide-rule border-y border-rule">
                  {userTasks.map((t) => (
                    <li key={t.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-ink-soft mt-1">
                          {t.hours} hour{t.hours === 1 ? "" : "s"} · Status: {t.status}
                        </p>
                      </div>
                      <Link to="/tasks" className="link-u text-xs">
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8 md:col-span-4">
            <div className="border border-rule bg-paper p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Monogram name={p.full_name} size="lg" />
                <div>
                  <p className="font-display text-lg">{p.full_name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    Class of {p.grad_year}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-rule pt-4 text-sm">
                <div>
                  <span className="eyebrow block">Current Position</span>
                  <span className="font-medium">{p.role_title || "Alumnus"}</span>
                  {p.company && <span className="block text-ink-soft">at {p.company}</span>}
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
    </>
  );
}
