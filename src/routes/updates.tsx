import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Empty, ErrorNote, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { updatesQuery, fmtDate } from "@/lib/queries";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Quad Updates & Chronicles — Ashwood College" },
      { name: "description", content: "Monthly dispatches, campus appointments, scientific discoveries, and decennial reunion news." },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  const updatesResult = useQuery(updatesQuery);
  const updates = updatesResult.data ?? [];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    return Array.from(new Set(updates.map((u) => u.category)));
  }, [updates]);

  const filteredUpdates = useMemo(() => {
    if (selectedCategory === "all") return updates;
    return updates.filter((u) => u.category === selectedCategory);
  }, [updates, selectedCategory]);

  return (
    <>
      <PageHead
        index="V."
        eyebrow="Chronicle"
        title="Dispatches from the quadrangle."
        lede="Reunions, appointments, scientific breakthroughs, and notes on college architecture. Written with measured care."
      />

      <Section>
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3 border-y border-foreground py-4 text-xs font-mono">
          <span className="eyebrow mr-2">Dispatches:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-rule hover:border-foreground"
            }`}
          >
            All Chronicles ({updates.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-rule hover:border-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content list */}
        {updatesResult.isLoading ? (
          <Loading label="Opening the quad archive" />
        ) : updatesResult.error ? (
          <div className="mt-8">
            <ErrorNote error={updatesResult.error} />
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="mt-8">
            <Empty title="No chronicles published in this section yet." />
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {filteredUpdates.map((item, idx) => (
              <article
                key={item.id}
                className="grid gap-6 border-b border-rule pb-16 md:grid-cols-12 md:gap-12"
              >
                <div className="md:col-span-3">
                  <span className="font-mono text-xs text-muted-foreground block">
                    0{idx + 1} · {fmtDate(item.created_at)}
                  </span>
                  <span className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent">
                    {item.category}
                  </span>
                  <SampleTag show={item.is_sample} />
                </div>

                <div className="md:col-span-9 space-y-4">
                  <h2 className="font-display text-3xl leading-snug text-foreground md:text-4xl">
                    {item.title}
                  </h2>
                  <p className="font-serif text-lg leading-relaxed text-ink-soft max-w-3xl">
                    {item.body}
                  </p>
                  <div className="pt-2 text-xs text-muted-foreground font-mono">
                    Official College Record · Filed under {item.category}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Newsletter Callout */}
        <div className="mt-20 border border-rule bg-paper p-8 md:p-12 md:grid md:grid-cols-12 md:gap-8 items-center">
          <div className="md:col-span-7 space-y-2">
            <span className="eyebrow">The Ashwood Letter</span>
            <h3 className="font-display text-3xl">Delivered to your quiet inbox monthly.</h3>
            <p className="text-sm text-ink-soft">
              No sponsored announcements or promotional clutter. Just thoughtful reports on our alumni, faculty papers, and campus history.
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:col-span-5">
            <Newsletter />
          </div>
        </div>
      </Section>
    </>
  );
}
