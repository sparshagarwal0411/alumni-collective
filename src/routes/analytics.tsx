import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PageHead, Section } from "@/components/site/ui";
import { profilesQuery } from "@/lib/queries";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Institutional Analytics & Distribution — Ashwood College" },
      { name: "description", content: "Macro trends, geographic clusters, hiring destinations, and historical alumni census data." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const profilesResult = useQuery(profilesQuery);
  const people = profilesResult.data ?? [];

  // Top companies aggregation
  const companyData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of people) {
      if (p.company) {
        counts[p.company] = (counts[p.company] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [people]);

  // Department distribution
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of people) {
      if (p.department) {
        counts[p.department] = (counts[p.department] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [people]);

  // Geographic city clusters
  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of people) {
      if (p.city) {
        counts[p.city] = (counts[p.city] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [people]);

  // Graduation decade spread
  const gradYearData = useMemo(() => {
    const years: Record<string, number> = {
      "2005-2010": 0,
      "2011-2015": 0,
      "2016-2020": 0,
      "2021-2025": 0,
    };
    for (const p of people) {
      const y = p.grad_year ?? 2020;
      if (y <= 2010) years["2005-2010"]++;
      else if (y <= 2015) years["2011-2015"]++;
      else if (y <= 2020) years["2016-2020"]++;
      else years["2021-2025"]++;
    }
    return Object.entries(years).map(([name, count]) => ({ name, count }));
  }, [people]);

  const COLORS = [
    "oklch(0.46 0.13 28)",
    "oklch(0.38 0.01 60)",
    "oklch(0.6 0.09 75)",
    "oklch(0.55 0.06 150)",
    "oklch(0.7 0.02 70)",
  ];

  return (
    <>
      <PageHead
        index="VI."
        eyebrow="Census"
        title="Institutional data and global clusters."
        lede="Empirical telemetry from the college register: top employers, discipline balance, and global alumni distribution."
      />

      <Section>
        {/* Top metrics summary */}
        <div className="grid grid-cols-2 gap-6 border-y border-foreground py-8 md:grid-cols-4">
          <div>
            <span className="eyebrow">Registered Alumni</span>
            <p className="mt-1 font-display text-4xl">{people.length}</p>
          </div>
          <div>
            <span className="eyebrow">Active Mentors</span>
            <p className="mt-1 font-display text-4xl">
              {people.filter((p) => p.open_to_mentor).length}
            </p>
          </div>
          <div>
            <span className="eyebrow">Global Cities</span>
            <p className="mt-1 font-display text-4xl">{cityData.length}</p>
          </div>
          <div>
            <span className="eyebrow">Target Employers</span>
            <p className="mt-1 font-display text-4xl">{companyData.length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {/* Top Companies */}
          <div className="border border-rule bg-paper p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="font-display text-xl">Top Alumni Destinations</h3>
                <p className="text-xs text-muted-foreground">Highest concentration of verified alumni</p>
              </div>
              <span className="font-mono text-xs text-accent">By Volume</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <XAxis type="number" stroke="oklch(0.5 0.012 65)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.5 0.012 65)" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="oklch(0.46 0.13 28)" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graduating Cohort Distribution */}
          <div className="border border-rule bg-paper p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="font-display text-xl">Graduation Cohort Spread</h3>
                <p className="text-xs text-muted-foreground">Distribution across eras</p>
              </div>
              <span className="font-mono text-xs text-accent">Era Cohorts</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradYearData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <XAxis dataKey="name" stroke="oklch(0.5 0.012 65)" fontSize={11} />
                  <YAxis stroke="oklch(0.5 0.012 65)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="oklch(0.24 0.01 60)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographic Distribution (Cities) */}
          <div className="border border-rule bg-paper p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="font-display text-xl">Global Geographic Nodes</h3>
                <p className="text-xs text-muted-foreground">Primary residential and work metropolitan hubs</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">Top Locations</span>
            </div>

            <ul className="divide-y divide-rule text-sm">
              {cityData.map((c) => (
                <li key={c.name} className="py-2.5 flex items-center justify-between">
                  <Link
                    to="/directory"
                    search={{ q: c.name }}
                    className="font-medium hover:text-accent hover:underline flex items-center gap-2"
                  >
                    <span>📍 {c.name}</span>
                  </Link>
                  <span className="font-mono text-xs bg-background px-2.5 py-0.5 border border-rule">
                    {c.count} {c.count === 1 ? "alumnus" : "alumni"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Department Share */}
          <div className="border border-rule bg-paper p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="font-display text-xl">Disciplinary Breakdown</h3>
                <p className="text-xs text-muted-foreground">Enrolled departments & faculties</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">Academic Split</span>
            </div>

            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft justify-center pt-2">
              {deptData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name.split(" ")[0]} ({d.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
