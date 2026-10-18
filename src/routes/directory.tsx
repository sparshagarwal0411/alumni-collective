import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Empty, ErrorNote, Loading, Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { getAlumniPortrait } from "@/lib/portraits";
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

import { useState } from "react";
import { Table, LayoutList, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react";

function Directory() {
  const { q = "", dept = "", mentor = false } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, error } = useQuery(profilesQuery);
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

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
          <label className="md:col-span-5">
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
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={mentor} onChange={(e) => set({ mentor: e.target.checked || undefined })} className="accent-[var(--accent)]" />
            Mentors only
          </label>
          <div className="md:col-span-2 flex justify-end">
            <div className="inline-flex rounded-xs border border-rule bg-background p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1 cursor-pointer transition-colors ${viewMode === "table" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                title="Table Ledger View"
              >
                <Table className="h-3.5 w-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-2.5 py-1 cursor-pointer transition-colors ${viewMode === "list" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                title="List View"
              >
                <LayoutList className="h-3.5 w-3.5" /> List
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="mt-6"><ErrorNote error={error} /></div> : isLoading ? <Loading label="Reading the register" /> : rows.length === 0 ? (
          <Empty title="No one matches that search.">Try fewer words, or clear the filters.</Empty>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between border-b border-rule pb-2">
              <p className="eyebrow">{rows.length} {rows.length === 1 ? "entry" : "entries"} recorded in Supabase Register</p>
              <span className="font-mono text-xs text-muted-foreground">Live Database View</span>
            </div>

            {viewMode === "table" ? (
              <div className="mt-4 border border-rule bg-paper overflow-x-auto shadow-xs">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="border-b border-rule font-mono text-[11px] text-muted-foreground uppercase tracking-wider bg-background/50">
                    <tr>
                      <th className="p-3.5">Scholar / Alumnus</th>
                      <th className="p-3.5">Class</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Appointment & Company</th>
                      <th className="p-3.5">City</th>
                      <th className="p-3.5">Competencies</th>
                      <th className="p-3.5">Mentoring</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {rows.map((p) => {
                      const portrait = getAlumniPortrait(p.id, p.full_name);
                      return (
                        <tr key={p.id} className="hover:bg-accent/5 transition-colors group">
                          <td className="p-3.5">
                            <Link to="/alumni/$id" params={{ id: p.id }} className="flex items-center gap-2.5 font-display text-sm font-semibold text-foreground group-hover:text-accent">
                              {portrait ? (
                                <img src={portrait} alt={p.full_name} className="h-8 w-8 rounded-full object-cover object-top border border-rule shrink-0" />
                              ) : (
                                <Monogram name={p.full_name} className="h-8 w-8 text-[10px] shrink-0" />
                              )}
                              <span className="truncate">{p.full_name || "Unnamed"}</span>
                              <SampleTag show={p.is_sample} />
                            </Link>
                          </td>
                          <td className="p-3.5 font-mono text-muted-foreground font-medium">
                            {p.grad_year ? `’${String(p.grad_year).slice(2)}` : "—"}
                          </td>
                          <td className="p-3.5 text-muted-foreground font-sans">
                            {p.department || "General Studies"}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                              {p.company && <CompanyLogo company={p.company} size="xs" className="shrink-0" />}
                              <span className="truncate">{[p.role_title, p.company].filter(Boolean).join(" · ") || p.headline || "Alumnus"}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-muted-foreground font-mono">
                            {p.city || "—"}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(p.skills || []).slice(0, 3).map((s) => (
                                <span key={s} className="font-mono text-[10px] px-1.5 py-0.2 bg-background border border-rule text-ink-soft">
                                  {s}
                                </span>
                              ))}
                              {(p.skills || []).length > 3 && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  +{(p.skills || []).length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            {p.open_to_mentor ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5">
                                ● Open
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-muted-foreground">Paused</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to="/messages"
                                search={{ partnerId: p.id }}
                                className="p-1 border border-rule text-muted-foreground hover:text-foreground hover:border-foreground"
                                title="Send Direct Message"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                to="/alumni/$id"
                                params={{ id: p.id }}
                                className="p-1 border border-rule text-muted-foreground hover:text-foreground hover:border-foreground"
                                title="View Record"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="mt-2">
                {rows.map((p) => (
                  <li key={p.id} className="border-b border-rule">
                    <Link to="/alumni/$id" params={{ id: p.id }} className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-5 md:grid-cols-[auto_minmax(0,3fr)_minmax(0,2fr)_6rem] md:gap-6">
                      {getAlumniPortrait(p.id, p.full_name) ? (
                        <img
                          src={getAlumniPortrait(p.id, p.full_name)}
                          alt={p.full_name}
                          className="h-12 w-12 rounded-sm border border-rule object-cover object-top shadow-xs"
                        />
                      ) : (
                        <Monogram name={p.full_name} />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-display text-xl group-hover:text-accent">
                          {p.full_name || "Unnamed"}<SampleTag show={p.is_sample} />
                        </p>
                        <div className="flex items-center gap-1.5 truncate text-sm text-ink-soft">
                          {p.company && <CompanyLogo company={p.company} size="xs" />}
                          <span className="truncate">{[p.role_title, p.company].filter(Boolean).join(", ") || p.headline}</span>
                        </div>
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
            )}
          </>
        )}
      </Section>
    </>
  );
}
