import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Empty, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { eventsQuery, fmtDate, milestonesQuery } from "@/lib/queries";

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

function EventsPage() {
  const eventsResult = useQuery(eventsQuery);
  const milestonesResult = useQuery(milestonesQuery);
  const events = eventsResult.data ?? [];
  const milestones = milestonesResult.data ?? [];
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  const upcomingCount = events.filter((e) => e.status === "upcoming").length;

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

      <Section className="mt-28">
        <div className="flex items-baseline justify-between border-b border-foreground pb-3">
          <h2 className="text-3xl">Milestones</h2>
          <span className="eyebrow">From the college archive</span>
        </div>
        {milestonesResult.isLoading ? (
          <Loading label="Unrolling the timeline" />
        ) : (
          <ol className="mt-4">
            {milestones.map((m) => (
              <li key={m.id} className="grid grid-cols-[5rem_1fr] gap-6 border-t border-rule py-8 last:border-b md:grid-cols-[7rem_1fr]">
                <span className="font-mono text-sm text-accent">{m.year}</span>
                <div>
                  <h3 className="font-display text-2xl">{m.title}</h3>
                  <p className="mt-2 max-w-2xl text-ink-soft">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}
