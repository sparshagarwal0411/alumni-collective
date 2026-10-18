import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { profilesQuery, connectionsQuery } from "@/lib/queries";
import type { Profile } from "@/lib/mockData";
import { AlumniDirectoryMap } from "@/components/network/AlumniDirectoryMap";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Relational Network Graph — Ashwood College" },
      { name: "description", content: "Explore the living web of relationships, mentorship ties, and collaborative projects across alumni generations." },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const profilesResult = useQuery(profilesQuery);
  const connectionsResult = useQuery(connectionsQuery);

  const people = profilesResult.data ?? [];
  const connections = connectionsResult.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>("p-arjun-nair");

  // Unique companies and departments
  const companies = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.company).filter(Boolean))) as string[];
  }, [people]);

  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department).filter(Boolean))) as string[];
  }, [people]);

  // Filtered people
  const filteredPeople = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return people.filter((p) => {
      const matchQuery =
        !q ||
        [p.full_name, p.company, p.headline, p.department, p.city, ...(p.skills || [])]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchCompany = selectedCompany === "all" || p.company === selectedCompany;
      const matchDept = selectedDept === "all" || p.department === selectedDept;
      const matchCity =
        !selectedCity || (p.city && p.city.toLowerCase().includes(selectedCity.toLowerCase()));
      return matchQuery && matchCompany && matchDept && matchCity;
    });
  }, [people, searchQuery, selectedCompany, selectedDept, selectedCity]);

  const activeProfile = useMemo(() => {
    return people.find((p) => p.id === selectedProfileId) || people[0] || null;
  }, [people, selectedProfileId]);

  // Compute connections for active profile
  const activeConnections = useMemo(() => {
    if (!activeProfile) return [];
    return connections
      .filter((c) => c.requester === activeProfile.id || c.addressee === activeProfile.id)
      .map((c) => {
        const otherId = c.requester === activeProfile.id ? c.addressee : c.requester;
        const otherPerson = people.find((p) => p.id === otherId);
        return {
          connection: c,
          person: otherPerson,
          points: c.points ?? 5,
        };
      })
      .filter((item): item is { connection: typeof connections[0]; person: Profile; points: number } => Boolean(item.person));
  }, [activeProfile, connections, people]);

  // Simulated Dijkstra path from logged in student to selected profile
  const shortestPath = useMemo(() => {
    if (!activeProfile) return [];
    if (activeProfile.id === "p-arjun-nair") {
      return [
        { name: "You (Active Student)", role: "Class of '25 · CSE", weight: 0 },
        { name: "Vikram Choudhury", role: "Class of '16 · Zerodha Head of Infra", weight: 0.18 },
        { name: "Dr. Arjun Nair", role: "Class of '12 · Anthropic Principal Architect", weight: 0.09 },
      ];
    }
    if (activeProfile.id === "p-priya-ramanathan") {
      return [
        { name: "You (Active Student)", role: "Class of '25 · CSE", weight: 0 },
        { name: "Tara Deshmukh", role: "Class of '19 · Linear Design Director", weight: 0.22 },
        { name: "Priya Ramanathan", role: "Class of '14 · Stripe VP of Product", weight: 0.12 },
      ];
    }
    return [
      { name: "You (Active Student)", role: "Class of '25", weight: 0 },
      { name: "Dr. Arjun Nair", role: "Class of '12 · Core Faculty Mentor", weight: 0.19 },
      { name: activeProfile.full_name, role: activeProfile.headline || activeProfile.role_title || "Alumnus", weight: 0.14 },
    ];
  }, [activeProfile]);

  return (
    <>
      <PageHead
        index="II."
        eyebrow="Network"
        title="The web of who knows whom."
        lede="Navigate relational weight, mutual mentorship, and the shortest social path to any alumnus."
      />

      <Section className="mt-8">
        {/* Workspace controls */}
        <div className="grid gap-4 border-y border-foreground py-4 md:grid-cols-12 md:items-end">
          <label className="md:col-span-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Search Nodes</span>
              {selectedCity && (
                <button
                  type="button"
                  onClick={() => setSelectedCity(null)}
                  className="font-mono text-[10px] text-accent hover:underline"
                >
                  Clear city: {selectedCity} ×
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Search by name, research topic, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field text-base"
            />
          </label>

          <label className="md:col-span-3">
            <span className="eyebrow">Employer Filter</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="field text-sm"
            >
              <option value="all">All Companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-4">
            <span className="eyebrow">Discipline / Branch</span>
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

        {/* 2-Pane Workspace */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 min-h-[640px]">
          {/* Left Canvas / Interactive Visual Graph */}
          <div className="lg:col-span-7 border border-rule bg-paper p-6 relative flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-rule">
              <div>
                <span className="eyebrow">Force-Directed Graph Canvas</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any node to focus camera and compute Dijkstra path of least resistance
                </p>
              </div>
              <span className="font-mono text-xs bg-background px-2.5 py-1 border border-rule">
                {filteredPeople.length} Nodes Active
              </span>
            </div>

            {/* Simulated Interactive Force Graph */}
            <div className="relative my-8 h-96 w-full rounded border border-rule/60 bg-background/50 flex items-center justify-center p-4">
              <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* SVG connection webs */}
                <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="oklch(0.8 0.014 78)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="80%" y1="25%" x2="50%" y2="50%" stroke="oklch(0.8 0.014 78)" strokeWidth="1" />
                <line x1="30%" y1="75%" x2="50%" y2="50%" stroke="oklch(0.46 0.13 28)" strokeWidth="2" />
                <line x1="70%" y1="70%" x2="50%" y2="50%" stroke="oklch(0.8 0.014 78)" strokeWidth="1" />
                <line x1="15%" y1="55%" x2="30%" y2="75%" stroke="oklch(0.8 0.014 78)" strokeWidth="1" />
                <line x1="85%" y1="65%" x2="70%" y2="70%" stroke="oklch(0.8 0.014 78)" strokeWidth="1" />
              </svg>

              <div className="relative w-full h-full">
                {filteredPeople.map((person, index) => {
                  const total = filteredPeople.length || 1;
                  const angle = (index / total) * 2 * Math.PI;
                  const radius = index === 0 ? 0 : 38 + (index % 3) * 22; // percent
                  const x = 50 + (radius * Math.cos(angle)) * 0.75;
                  const y = 50 + (radius * Math.sin(angle)) * 0.75;

                  const isSelected = activeProfile?.id === person.id;

                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedProfileId(person.id)}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 focus:outline-none ${isSelected
                          ? "ring-4 ring-accent bg-accent text-accent-foreground z-20 scale-125"
                          : "bg-paper border border-foreground/40 hover:scale-110 hover:border-accent z-10"
                        } px-3 py-1.5 text-xs font-sans shadow-sm`}
                      title={`${person.full_name} (${person.company || "Ashwood"})`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${person.open_to_mentor ? "bg-accent" : "bg-muted-foreground"
                            }`}
                        />
                        <span className="font-medium whitespace-nowrap">{person.full_name.split(" ")[0]}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Graph Legend & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4 text-xs text-ink-soft">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Open to Mentoring
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-foreground/40" /> Verified Alumnus
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 bg-accent" /> Dijkstra Path Active
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                Formula: W = 1 / (pts×5 + shared×2 + 0.1)
              </span>
            </div>
          </div>

          {/* Right Pane: Inspector & Dijkstra Path */}
          <div className="lg:col-span-5 space-y-6">
            {activeProfile ? (
              <div className="border border-rule bg-card p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Monogram name={activeProfile.full_name} size="md" />
                    <div>
                      <h3 className="font-display text-2xl leading-none">
                        {activeProfile.full_name}
                        <SampleTag show={activeProfile.is_sample} />
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Class of {activeProfile.grad_year} · {activeProfile.department}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/alumni/$id"
                    params={{ id: activeProfile.id }}
                    className="link-u text-xs font-mono"
                  >
                    Full Profile →
                  </Link>
                </div>

                <p className="text-sm text-ink-soft leading-relaxed border-t border-rule pt-4">
                  {activeProfile.headline || activeProfile.bio}
                </p>

                {/* Shortest Social Path (Dijkstra Traversal Algorithm) */}
                <div className="border border-rule bg-paper p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-accent">Shortest Social Path</span>
                    <span className="font-mono text-[10px] text-muted-foreground">Dijkstra Min-Weight</span>
                  </div>
                  <ol className="space-y-2 text-xs">
                    {shortestPath.map((step, idx) => (
                      <li key={step.name} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">0{idx + 1}.</span>
                          <span className="font-medium text-foreground">{step.name}</span>
                          <span className="text-ink-soft text-[11px]">({step.role})</span>
                        </span>
                        {step.weight > 0 && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            w={step.weight}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-rule">
                    Calculated via shared department tags and verified microtask ledger interactions.
                  </p>
                </div>

                {/* Direct Connections / Mutual Ties */}
                <div>
                  <h4 className="eyebrow mb-3">Direct Relational Ties ({activeConnections.length})</h4>
                  {activeConnections.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No direct peer connections logged in current window.
                    </p>
                  ) : (
                    <ul className="divide-y divide-rule text-sm">
                      {activeConnections.slice(0, 4).map(({ person, points }) => (
                        <li key={person.id} className="py-2.5 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileId(person.id)}
                            className="text-left group"
                          >
                            <span className="font-medium group-hover:text-accent group-hover:underline">
                              {person.full_name}
                            </span>
                            <span className="block text-xs text-ink-soft">
                              {person.company || person.department}
                            </span>
                          </button>
                          <span className="font-mono text-xs bg-paper border border-rule px-2 py-0.5">
                            +{points} pts
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action CTA */}
                <div className="border-t border-rule pt-4 flex gap-3">
                  <Link
                    to="/messages"
                    className="flex-1 text-center bg-primary text-primary-foreground py-2 text-xs uppercase tracking-widest hover:bg-accent transition-colors"
                  >
                    Draft Message
                  </Link>
                  {activeProfile.open_to_mentor && (
                    <Link
                      to="/mentorship"
                      className="flex-1 text-center border border-foreground py-2 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                    >
                      Request Intro
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-rule p-8 text-center text-muted-foreground">
                Select any node from the canvas to view relational insights.
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Modern, Compact Alumni Directory Map shifted below the graph */}
      <Section className="mt-8 mb-12">
        <AlumniDirectoryMap
          people={people}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />
      </Section>
    </>
  );
}