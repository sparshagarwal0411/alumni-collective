import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Empty, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { eventsQuery, fmtDate, milestonesQuery } from "@/lib/queries";
import { Award, BookOpen, Clock, Compass, Globe, Landmark, Scroll, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Milestones — Ashwood College" },
      {
        name: "description",
        content: "Reunions, campus meets, workshops, and the long timeline of the Alumni Association.",
      },
    ],
  }),
  component: EventsPage,
});

const MILESTONE_METADATA: Record<
  string,
  { era: string; epoch: string; tag: string; icon: React.ComponentType<{ className?: string }>; citation: string }
> = {
  "ms-1": {
    era: "The Victorian Foundation",
    epoch: "Epoch I",
    tag: "Founding Deed",
    icon: Landmark,
    citation: "Ashwood Registry · Vol. I, Folio 1",
  },
  "ms-2": {
    era: "The Interwar Charter",
    epoch: "Epoch II",
    tag: "Alumni Charter",
    icon: BookOpen,
    citation: "Charter Roll · Convocation Hall",
  },
  "ms-3": {
    era: "International Expansion",
    epoch: "Epoch III",
    tag: "First Foreign Chapter",
    icon: Globe,
    citation: "London Chapter Records · 1971",
  },
  "ms-4": {
    era: "The Hardship Endowment",
    epoch: "Epoch IV",
    tag: "Student Hardship Trust",
    icon: Shield,
    citation: "Bursary Ledger · Disbursal Trust",
  },
  "ms-5": {
    era: "The Shared Ledger",
    epoch: "Epoch V",
    tag: "Online Public Register",
    icon: Scroll,
    citation: "Digital Commons · Roll No. 001",
  },
  "ms-6": {
    era: "Structured Mentorship",
    epoch: "Epoch VI",
    tag: "500th Mentorship Match",
    icon: Award,
    citation: "Mentorship Circle Annals · 2024",
  },
  "ms-7": {
    era: "Frontier Horizons",
    epoch: "Epoch VII",
    tag: "Maker Pavilion Groundbreaking",
    icon: Sparkles,
    citation: "Campus Master Plan · Quad West",
  },
};

function EventsPage() {
  const eventsResult = useQuery(eventsQuery);
  const milestonesResult = useQuery(milestonesQuery);
  const events = eventsResult.data ?? [];
  const milestones = milestonesResult.data ?? [];
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [activeEpochFilter, setActiveEpochFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  const upcomingCount = events.filter((e) => e.status === "upcoming").length;

  const filteredMilestones = useMemo(() => {
    if (activeEpochFilter === "all") return milestones;
    if (activeEpochFilter === "classic") {
      return milestones.filter((m) => parseInt(m.year) < 2000);
    }
    return milestones.filter((m) => parseInt(m.year) >= 2000);
  }, [milestones, activeEpochFilter]);

  return (
    <>
      <PageHead
        index="VI."
        eyebrow="Gatherings"
        title="Events & milestones."
        lede="Reunions on the lawn, workshops in the old library, and a century of dates that still belong to everyone who came through the gate."
        aside={<p className="text-sm text-ink-soft">{upcomingCount} gatherings still ahead this season.</p>}
      />

      <Section>
        <div className="flex flex-wrap items-center gap-3 border-y border-foreground py-4 font-mono text-xs">
          <span className="eyebrow mr-2">Show:</span>
          {(
            [
              ["all", `All (${events.length})`],
              ["upcoming", "Upcoming"],
              ["past", "Past"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 transition-colors ${
                filter === id ? "bg-primary text-primary-foreground" : "border border-rule hover:border-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {eventsResult.isLoading ? (
          <Loading label="Opening the calendar" />
        ) : filtered.length === 0 ? (
          <div className="mt-8">
            <Empty title="No gatherings in this column." />
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {filtered.map((event, idx) => (
              <article key={event.id} className="grid gap-6 border-b border-rule pb-16 md:grid-cols-12 md:gap-12">
                <div className="md:col-span-3">
                  <span className="block font-mono text-xs text-muted-foreground">
                    0{idx + 1} · {fmtDate(event.when)}
                  </span>
                  <span className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent">
                    {event.kind} · {event.status}
                  </span>
                  <SampleTag />
                  <p className="mt-4 text-sm text-ink-soft">{event.where}</p>
                </div>
                <div className="space-y-4 md:col-span-9">
                  <h2 className="font-display text-3xl leading-snug md:text-4xl">{event.title}</h2>
                  <p className="max-w-3xl font-serif text-lg leading-relaxed text-ink-soft">{event.summary}</p>
                  <ul className="grid gap-2 text-sm text-ink-soft md:grid-cols-3">
                    {event.highlights.map((h) => (
                      <li key={h} className="border-t border-rule pt-3">
                        {h}
                      </li>
                    ))}
                  </ul>
                  {event.status === "upcoming" && (
                    <p className="pt-2 font-mono text-xs text-muted-foreground">
                      Register via the Association desk ·{" "}
                      <Link to="/auth" className="link-u text-foreground">
                        Sign in to confirm attendance
                      </Link>
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {/* Aesthetic, Nostalgic Historical Milestones Timeline */}
      <Section className="mt-32">
        <div className="border-b border-foreground pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-accent">The College Annals · 1887 to Present</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Milestones across the century.</h2>
            </div>
            <p className="max-w-md text-sm text-ink-soft md:text-right">
              Seven defining moments unrolled from the leather-bound registers of the Ashwood College archives.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="eyebrow mr-2">Era Filter:</span>
            {[
              ["all", "All Milestones (1887–2026)"],
              ["classic", "Early Era (1887–1999)"],
              ["modern", "Modern Era (2000–2026)"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setActiveEpochFilter(val)}
                className={`px-3 py-1 border transition-colors ${
                  activeEpochFilter === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-rule bg-paper hover:border-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {milestonesResult.isLoading ? (
          <Loading label="Unrolling the college timeline" />
        ) : (
          <div className="relative mt-16 pb-12">
            {/* Central Vertical Heritage Spine */}
            <div
              className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-accent/60 via-rule to-accent/20 md:left-1/2 md:-ml-px"
              aria-hidden="true"
            />

            {/* Decorative Top Archival Finial */}
            <div className="relative mb-12 flex justify-start md:justify-center">
              <div className="ml-1.5 md:ml-0 flex items-center gap-2 border border-accent/40 bg-paper px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-accent shadow-xs">
                <Compass className="h-3.5 w-3.5" />
                <span>Founded A.D. 1887 · Ashwood Quadrangle</span>
              </div>
            </div>

            {/* Timeline Entries */}
            <div className="space-y-12 md:space-y-16">
              {filteredMilestones.map((m, index) => {
                const meta = MILESTONE_METADATA[m.id] || {
                  era: "Historical Register",
                  epoch: `Epoch ${index + 1}`,
                  tag: "College Event",
                  icon: BookOpen,
                  citation: "Ashwood Archive Registry",
                };
                const IconComponent = meta.icon;
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={m.id}
                    className="group relative flex flex-col md:flex-row md:items-center"
                  >
                    {/* Timeline Node Point in Center */}
                    <div
                      className="absolute left-6 z-10 -ml-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-accent bg-paper text-accent shadow-xs transition-transform duration-300 group-hover:scale-125 md:left-1/2 md:-ml-3.5"
                      aria-hidden="true"
                    >
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>

                    {/* Timeline Card Container */}
                    <div
                      className={`ml-14 md:ml-0 md:w-1/2 ${
                        isLeft ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12 md:text-left"
                      }`}
                    >
                      <article className="relative border border-rule bg-paper p-6 md:p-8 shadow-xs transition-all duration-300 group-hover:border-accent group-hover:shadow-md">
                        {/* Antique Tag & Year Pill */}
                        <div
                          className={`flex flex-wrap items-center gap-3 ${
                            isLeft ? "md:justify-end" : "md:justify-start"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5 border border-accent/40 bg-background px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                            <Clock className="h-3 w-3" />
                            {m.year}
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            {meta.epoch} · {meta.tag}
                          </span>
                        </div>

                        {/* Title */}
                        <div
                          className={`mt-4 flex items-center gap-3 ${
                            isLeft ? "md:flex-row-reverse" : "md:flex-row"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-rule bg-background text-accent">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <h3 className="font-display text-2xl md:text-3xl text-foreground group-hover:text-accent transition-colors">
                            {m.title}
                          </h3>
                        </div>

                        {/* Body Narrative */}
                        <p className="mt-3 font-serif text-base leading-relaxed text-ink-soft">
                          {m.body}
                        </p>

                        {/* Archival Footnote / Citation */}
                        <div
                          className={`mt-5 flex items-center gap-2 border-t border-rule pt-3 text-[11px] font-mono text-muted-foreground ${
                            isLeft ? "md:justify-end" : "md:justify-start"
                          }`}
                        >
                          <span>Record citation:</span>
                          <span className="text-foreground/80 italic font-serif text-xs">
                            {meta.citation}
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Terminal Seal */}
            <div className="relative mt-16 flex justify-start md:justify-center">
              <div className="ml-1.5 md:ml-0 flex items-center gap-2 border border-foreground/30 bg-paper px-5 py-2 font-display text-sm italic text-foreground shadow-xs">
                <Scroll className="h-4 w-4 text-accent" />
                <span>The Register continues · Next Century Pending</span>
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
