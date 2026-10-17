import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { profilesQuery } from "@/lib/queries";

const search = z.object({
  q: z.string().optional().catch(undefined),
  dept: z.string().optional().catch(undefined),
  mentor: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/directory")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Alumni Directory — Ashwood College" },
      { name: "description", content: "Search Ashwood alumni by name, class year, department, company or city." },
      { property: "og:title", content: "Alumni Directory — Ashwood College" },
      { property: "og:description", content: "Search Ashwood alumni by name, class year, department, company or city." },
    ],
  }),
  component: Directory,
});

function Directory() {
  const { q = "", dept = "", mentor = false } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, error } = useQuery(profilesQuery);
  const all = data ?? [];
  const depts = [...new Set(all.map((p) => p.department).filter(Boolean))].sort() as string[];
  const needle = q.toLowerCase();
  const rows = all.filter(
    (p) =>
      (!dept || p.department === dept) &&
      (!mentor || p.open_to_mentor) &&
      (!needle ||
        [p.full_name, p.company, p.city, p.role_title, p.department, String(p.grad_year ?? ""), ...(p.skills ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(needle)),
  );

  const set = (patch: Partial<z.infer<typeof search>>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <>
      <PageHead index="I." eyebrow="Directory" title="Everyone who came through the gate." lede="Search the register by name, class, discipline, employer, city or skill." />
      <Section>
        <div className="grid gap-6 border-y border-foreground py-5 md:grid-cols-12 md:items-end">
          <label className="md:col-span-6">
            <span className="eyebrow">Search</span>
            <input className="field text-lg" placeholder="e.g. 2012, Bengaluru, machine learning" value={q} onChange={(e) => set({ q: e.target.value || undefined })} />
          </label>
          <label className="md:col-span-3">
            <span className="eyebrow">Department</span>
            <select className="field" value={dept} onChange={(e) => set({ dept: e.target.value || undefined })}>
              <option value="">All departments</option>
              {depts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-3">
            <input type="checkbox" checked={mentor} onChange={(e) => set({ mentor: e.target.checked || undefined })} className="accent-[var(--accent)]" />
            Open to mentoring only
          </label>
        </div>

        {error ? <div className="mt-6"><ErrorNote error={error} /></div> : isLoading ? <Loading label="Reading the register" /> : rows.length === 0 ? (
          <Empty title="No one matches that search.">Try fewer words, or clear the filters.</Empty>
        ) : (
          <>
            <p className="mt-6 eyebrow">{rows.length} {rows.length === 1 ? "entry" : "entries"}</p>
            <ul className="mt-2">
              {rows.map((p) => (
                <li key={p.id} className="border-b border-rule">
                  <Link to="/alumni/$id" params={{ id: p.id }} className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-5 md:grid-cols-[auto_minmax(0,3fr)_minmax(0,2fr)_6rem] md:gap-6">
                    <Monogram name={p.full_name} />
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl group-hover:text-accent">
                        {p.full_name || "Unnamed"}<SampleTag show={p.is_sample} />
                      </p>
                      <p className="truncate text-sm text-ink-soft">{[p.role_title, p.company].filter(Boolean).join(", ") || p.headline}</p>
                    </div>
                    <p className="col-start-2 truncate text-sm text-muted-foreground md:col-start-auto">{[p.department, p.city].filter(Boolean).join(" · ")}</p>
                    <p className="hidden text-right font-mono text-sm md:block">
                      {p.grad_year ? `’${String(p.grad_year).slice(2)}` : ""}
                      {p.open_to_mentor && <span className="ml-2 text-accent" title="Open to mentoring">●</span>}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </>
  );
}
