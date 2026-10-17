import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { companiesQuery, profilesQuery, societiesQuery } from "@/lib/queries";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Communities — Ashwood College" },
      {
        name: "description",
        content: "Campus societies and the companies where Ashwood alumni work, gather, and hire.",
      },
    ],
  }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const societiesResult = useQuery(societiesQuery);
  const companiesResult = useQuery(companiesQuery);
  const profilesResult = useQuery(profilesQuery);
  const societies = societiesResult.data ?? [];
  const companies = companiesResult.data ?? [];
  const people = profilesResult.data ?? [];
  const [tab, setTab] = useState<"societies" | "companies">("societies");

  const nameOf = (id: string) => people.find((p) => p.id === id)?.full_name ?? "Alumnus";

  const companyIndustries = useMemo(
    () => [...new Set(companies.map((c) => c.industry))].sort(),
    [companies],
  );

  return (
    <>
      <PageHead
        index="VII."
        eyebrow="Chapters"
        title="Societies and the houses they went on to."
        lede="The clubs that still meet on campus, and the companies where Ashwood people now sit — professional networks as much as social ones."
      />

      <Section>
        <div className="flex flex-wrap items-center gap-3 border-y border-foreground py-4 font-mono text-xs">
          <span className="eyebrow mr-2">Browse:</span>
          <button
            type="button"
            onClick={() => setTab("societies")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "societies" ? "bg-primary text-primary-foreground" : "border border-rule hover:border-foreground"
            }`}
          >
            Campus societies ({societies.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("companies")}
            className={`px-3 py-1.5 transition-colors ${
              tab === "companies" ? "bg-primary text-primary-foreground" : "border border-rule hover:border-foreground"
            }`}
          >
            Where alumni work ({companies.length})
          </button>
        </div>

        {tab === "societies" ? (
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
        ) : companiesResult.isLoading ? (
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
        )}

        <div className="mt-20 grid items-center gap-8 border border-rule bg-paper p-8 md:grid-cols-12 md:p-12">
          <div className="space-y-2 md:col-span-7">
            <span className="eyebrow">Start a chapter</span>
            <h3 className="font-display text-3xl">A city, a company, a society — write in.</h3>
            <p className="text-sm text-ink-soft">
              If your firm or old club is missing from this list, the Association will add a roll as soon as two alumni ask
              for it.
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
