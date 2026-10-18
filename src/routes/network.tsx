import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Monogram, PageHead, SampleTag } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { profilesQuery } from "@/lib/queries";
import type { Profile } from "@/lib/mockData";
import { SpatialCanvas } from "@/components/graph/SpatialCanvas";
import { dijkstraService } from "@/services/dijkstraService";
import { useNetworkStore } from "@/store/useNetworkStore";
import { getInitialSpatialGraphData, SEED_PROFILES } from "@/data/seedData";
import { CANONICAL_SOCIETIES } from "@/data/nsutTaxonomy";
import { useAuth } from "@/lib/auth";
import type { GraphNode, GraphLink } from "@/types/database";
import { CredibilityAuditPopover } from "@/components/network/CredibilityAuditPopover";
import {
  Search,
  Crosshair,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Route as RouteIcon,
  GraduationCap,
  Building2,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Layers,
  Award,
  ArrowLeft,
  Users,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Directory & Relational Network Graph — NSUT Archive" },
      {
        name: "description",
        content: "Interactive 3D WebGL knowledge graph integrated with the complete alumni directory and live Dijkstra pathfinding.",
      },
    ],
  }),
  component: MergedDirectoryNetworkPage,
});

export function MergedDirectoryNetworkPage() {
  const navigate = useNavigate();
  const profilesResult = useQuery(profilesQuery);
  const rawPeople = profilesResult.data ?? [];

  const { user, currentRole } = useAuth();

  // Auth-aware current user persona node
  const currentUserId = useMemo(() => {
    if (!user || currentRole === "faculty") return null;
    if (currentRole === "alumni") return "p-arjun-nair";
    return "usr-stud-01"; // student or default
  }, [user, currentRole]);

  // Filter to canonical full-fledged profiles originally in final repo (+ active student persona)
  const people = useMemo(() => {
    return rawPeople.filter(
      (p) => p.id.startsWith("p-") || p.id === "usr-stud-01"
    );
  }, [rawPeople]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedSociety, setSelectedSociety] = useState<string>("all");
  const [onlyMentors, setOnlyMentors] = useState<boolean>(false);

  // Splitter Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(440);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Dijkstra State
  const [shortestPathSteps, setShortestPathSteps] = useState<
    Array<{ id: string; name: string; role: string; company?: string; weight: number }>
  >([]);
  const [totalResistance, setTotalResistance] = useState<number>(0);
  const [isComputingPath, setIsComputingPath] = useState<boolean>(false);

  // Zustand Store sync
  const {
    paneState,
    focusedNodeId,
    hoveredNodeId,
    setFocusedNode,
    setHoveredNode,
    setPaneState,
    clearPath,
    setFilter,
    resetFilters,
  } = useNetworkStore();

  // 1. Initial 3D Spatial Graph Data from canonical seed (only full-fledged profiles)
  const initialGraphData = useMemo(() => getInitialSpatialGraphData(), []);

  // Use only canonical full-fledged nodes
  const graphNodes = useMemo<GraphNode[]>(() => {
    return initialGraphData.nodes;
  }, [initialGraphData]);

  // Use only canonical relational links with anti-farming resistance weights
  const graphLinks = useMemo<GraphLink[]>(() => {
    return initialGraphData.links;
  }, [initialGraphData]);

  // Companies list (only employers that appear in the canonical graph nodes)
  const allCompanies = useMemo(() => {
    return Array.from(
      new Set(graphNodes.map((n) => n.company).filter((c): c is string => Boolean(c)))
    ).sort();
  }, [graphNodes]);

  // Departments list (only branches that appear in the canonical graph nodes)
  const allDepartments = useMemo(() => {
    return Array.from(
      new Set(graphNodes.map((n) => n.branch).filter((b): b is string => Boolean(b)))
    ).sort();
  }, [graphNodes]);

  // Societies list (20 canonical NSUT student societies)
  const allSocieties = useMemo(() => {
    return CANONICAL_SOCIETIES;
  }, []);

  // Filtered Directory Scholars
  const filteredPeople = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return people.filter((p) => {
      // 1. Text Search
      if (q) {
        const hay = [
          p.full_name,
          p.company,
          p.headline,
          p.department,
          p.city,
          String(p.grad_year ?? ""),
          ...(p.skills || []),
          ...(p.societies || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // 2. Company Filter
      if (selectedCompany !== "all") {
        if (!p.company || p.company.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }
      }

      // 3. Department Filter
      if (selectedDept !== "all") {
        if (!p.department || p.department.toLowerCase() !== selectedDept.toLowerCase()) {
          return false;
        }
      }

      // 4. Society Filter
      if (selectedSociety !== "all") {
        const socMatch = (p.societies || []).some(
          (s) => s.toLowerCase().includes(selectedSociety.toLowerCase()) || selectedSociety.toLowerCase().includes(s.toLowerCase())
        );
        if (!socMatch) return false;
      }

      // 5. Mentor Filter
      if (onlyMentors && !p.open_to_mentor) {
        return false;
      }

      return true;
    });
  }, [people, searchQuery, selectedCompany, selectedDept, selectedSociety, onlyMentors]);

  // Focused Profile in Profile View
  const focusedProfile = useMemo(() => {
    if (!focusedNodeId) return null;
    return people.find((p) => p.id === focusedNodeId) || null;
  }, [people, focusedNodeId]);

  // Select profile from list card click
  const handleSelectProfile = (person: Profile) => {
    setFocusedNode(person.id);
    setPaneState("PROFILE_VIEW");
  };

  // Back to directory list
  const handleBackToList = () => {
    setPaneState("LIST_VIEW");
    setFocusedNode(null);
    clearPath();
  };

  // Handle node selection from 3D Canvas
  const handleGraphNodeSelect = (node: GraphNode | null) => {
    if (node) {
      setFocusedNode(node.id);
      setPaneState("PROFILE_VIEW");
    } else {
      setFocusedNode(null);
      setPaneState("LIST_VIEW");
      clearPath();
    }
  };

  // Career history timeline entries
  const careerEntries = useMemo(() => {
    if (!focusedProfile) return [];
    const seedP = SEED_PROFILES.find((sp) => sp.id === focusedProfile.id);
    const expHist = seedP?.experience_history || focusedProfile.experience_history;
    if (expHist && expHist.length > 0) {
      return expHist.map((exp: any, i: number) => ({
        company: exp.company,
        role: exp.title,
        period: `${exp.start_year} – ${exp.end_year ? exp.end_year : "Present"}`,
        isCurrent: i === 0,
      }));
    }

    const entries = [];
    if (focusedProfile.company) {
      entries.push({
        company: focusedProfile.company,
        role: focusedProfile.role_title || focusedProfile.headline || "Professional Alumnus",
        period: `${(focusedProfile.grad_year || 2022) + 1} – Present`,
        isCurrent: true,
      });
    }
    entries.push({
      company: "Netaji Subhas University of Technology",
      role: `Student (${focusedProfile.department || "Engineering"})`,
      period: `${(focusedProfile.grad_year || 2022) - 4} – ${focusedProfile.grad_year || 2022}`,
      isCurrent: false,
    });
    return entries;
  }, [focusedProfile]);

  // True mutual societies between current student and focused alumnus
  const trueMutualSocieties = useMemo(() => {
    if (!focusedProfile) return [];
    const currentProfile = people.find((p) => p.id === currentUserId);
    if (!currentProfile) return [];
    const currentSocNames = (currentProfile.societies || []).map((s: string) => s.toLowerCase());
    return (focusedProfile.societies || []).filter((s: string) =>
      currentSocNames.some((cs: string) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
    );
  }, [focusedProfile, people, currentUserId]);

  // Shared Ties & Campus Common Ground
  const sharedTies = useMemo(() => {
    if (!focusedProfile) return [];
    const ties: string[] = [];
    const currentProfile = people.find((p) => p.id === currentUserId);
    if (!currentProfile) return ties;

    if (currentProfile.department && focusedProfile.department && currentProfile.department === focusedProfile.department) {
      ties.push(`Same Branch: ${currentProfile.department}`);
    }

    const currentSocs = (currentProfile.societies || []).map((s: string) => s.toLowerCase());
    (focusedProfile.societies || []).forEach((s) => {
      if (currentSocs.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))) {
        ties.push(`Society: ${s}`);
      }
    });

    const currentSkills = (currentProfile.skills || []).map((sk: string) => sk.toLowerCase());
    (focusedProfile.skills || []).forEach((sk) => {
      if (currentSkills.some((csk) => csk === sk.toLowerCase())) {
        ties.push(`Skill: ${sk}`);
      }
    });

    return ties;
  }, [focusedProfile, people, currentUserId]);

  // Compute Shortest Dijkstra Path whenever focusedProfile changes
  useEffect(() => {
    let isCancelled = false;

    async function computePath() {
      if (!focusedProfile || !currentUserId || focusedProfile.id === currentUserId) {
        setShortestPathSteps([]);
        setTotalResistance(0);
        return;
      }

      setIsComputingPath(true);

      try {
        const result = await dijkstraService.findShortestPath(
          currentUserId,
          focusedProfile.id,
          graphLinks
        );

        if (!isCancelled) {
          if (result.path && result.path.length > 0) {
            const steps = result.path.map((nodeId) => {
              const matchedPerson = people.find((p) => p.id === nodeId);
              const matchedNode = graphNodes.find((n) => n.id === nodeId);
              return {
                id: nodeId,
                name: matchedPerson?.full_name || matchedNode?.name || nodeId,
                role: nodeId === currentUserId ? "You (Student Builder)" : matchedPerson?.role_title || matchedPerson?.headline || "Alumnus",
                company: matchedPerson?.company || matchedNode?.company,
                weight: result.totalWeight,
              };
            });
            setShortestPathSteps(steps);
            setTotalResistance(result.totalWeight);
          } else {
            setShortestPathSteps([]);
            setTotalResistance(0);
          }
        }
      } catch (err) {
        console.error("Dijkstra calculation error:", err);
      } finally {
        if (!isCancelled) setIsComputingPath(false);
      }
    }

    computePath();

    return () => {
      isCancelled = true;
    };
  }, [focusedProfile, graphLinks, graphNodes, people, currentUserId]);

  // Splitter drag event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = Math.max(340, Math.min(680, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-background">
      {/* ─── STUDIO HEADER & MULTI-CRITERIA FILTER BAR ─── */}
      <div className="border-b border-rule bg-paper px-4 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Eyebrow & Status */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              NSUT Relational Knowledge Graph // Directory Studio
            </span>
            <span className="hidden sm:inline-block text-xs text-muted-foreground">·</span>
            <span className="hidden sm:inline-block font-mono text-[11px] text-muted-foreground">
              {filteredPeople.length} Scholars Listed ({graphNodes.length} Nodes in 3D Space)
            </span>
          </div>

          {/* Formula pill */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground bg-background px-2.5 py-1 border border-rule">
            <span className="text-accent font-semibold">Anti-Collusion Formula:</span>
            <span>W = 1 / (min(5, pts)×5 + shared×2 + 0.1)</span>
          </div>
        </div>

        {/* 4-Way Search & Filter Row */}
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search scholar by name, skills, company, city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFilter("searchQuery", e.target.value);
              }}
              className="w-full border border-rule bg-background pl-8 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
            />
          </div>

          {/* Company Filter (90 Companies) */}
          <div className="lg:col-span-3">
            <select
              value={selectedCompany}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCompany(val);
                setFilter("company", val === "all" ? null : val);
              }}
              className="w-full border border-rule bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-accent"
            >
              <option value="all">All Employers ({allCompanies.length})</option>
              {allCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter (Branches) */}
          <div className="lg:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDept(val);
                setFilter("branch", val === "all" ? null : val);
              }}
              className="w-full border border-rule bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-accent"
            >
              <option value="all">All Departments ({allDepartments.length})</option>
              {allDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Society Filter (20 Canonical Societies) */}
          <div className="lg:col-span-2">
            <select
              value={selectedSociety}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSociety(val);
                setFilter("sector", val === "all" ? null : val);
              }}
              className="w-full border border-rule bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-accent"
            >
              <option value="all">All Societies (20)</option>
              {allSocieties.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── SPLIT VIEW: DIRECTORY SIDEBAR (LEFT) + 3D GRAPH (RIGHT) ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: THE DIRECTORY SIDEBAR */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="border-r border-rule bg-paper flex flex-col shrink-0 overflow-hidden"
        >
          {paneState === "PROFILE_VIEW" && focusedProfile ? (
            /* ── PROFILE VIEW ("VS Code" Tab Behavior) ── */
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar p-4 space-y-4">
              {/* Navigation Bar: Back to Directory & Quick Actions */}
              <div className="flex items-center justify-between gap-2 border-b border-rule pb-3 shrink-0">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1.5 border border-rule bg-card px-2.5 py-1.5 text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer shadow-xs font-mono text-[10px] uppercase font-bold"
                  title="Return to Directory Register"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Register</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <Link
                    to="/alumni/$id"
                    params={{ id: focusedProfile.id }}
                    className="inline-flex items-center gap-1 border border-rule bg-card px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors"
                    title="View Full Profile Record"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                  <Link
                    to="/messages"
                    search={{ recipient: focusedProfile.id }}
                    className="inline-flex items-center gap-1 border border-accent bg-accent px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                    title="Send Direct Inquiry Message"
                  >
                    <MessageSquare className="h-2.5 w-2.5" />
                    <span>Inquire</span>
                  </Link>
                </div>
              </div>

              {/* Main Profile Header Card */}
              <div className="border border-rule bg-card p-4 space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <Monogram name={focusedProfile.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-display text-base font-semibold leading-tight text-foreground truncate">
                        {focusedProfile.full_name}
                      </h3>
                      <SampleTag show={focusedProfile.is_sample} />
                      {focusedProfile.open_to_mentor && (
                        <span className="border border-emerald-500/40 bg-emerald-500/10 px-1 py-0.2 font-mono text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                          Mentor
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                      Class of {focusedProfile.grad_year} · {focusedProfile.department}
                    </p>
                    {focusedProfile.company && (
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-accent font-semibold">
                        <CompanyLogo company={focusedProfile.company} className="h-3 w-3" />
                        <span className="truncate">{focusedProfile.company}</span>
                        {focusedProfile.city && <span className="text-muted-foreground font-normal">· {focusedProfile.city}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Credibility Audit & Endorsements Popover Row */}
                <div className="pt-2 border-t border-rule/70 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Credibility Audit:
                  </span>
                  <CredibilityAuditPopover
                    totalEndorsingAlumni={focusedProfile.distinct_alumni_count || 1}
                    totalPoints={focusedProfile.bounty_points || 0}
                  />
                </div>
              </div>

              {/* Career History Timeline */}
              <div className="border border-rule bg-card p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase tracking-wider font-semibold">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Career History</span>
                </div>
                <ol className="relative border-l border-rule ml-1.5 pl-3.5 space-y-2.5 font-mono text-xs">
                  {careerEntries.map((e, i) => (
                    <li key={i} className="relative">
                      <span
                        className={`absolute -left-[19px] top-1.5 h-2 w-2 rounded-full border ${
                          e.isCurrent ? "border-accent bg-accent" : "border-rule bg-paper"
                        }`}
                      />
                      <p className="font-sans text-xs font-semibold text-foreground leading-tight">{e.role}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <span className="font-medium text-ink-soft">{e.company}</span>
                        <span>·</span>
                        <span>{e.period}</span>
                        {e.isCurrent && (
                          <span className="ml-1 text-[8px] uppercase tracking-wider text-accent border border-accent/40 bg-accent/10 px-1 font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Campus Societies & True Mutual Societies */}
              <div className="border border-rule bg-card p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase tracking-wider font-semibold">
                    <Users className="h-3.5 w-3.5" />
                    <span>Campus Societies</span>
                  </div>
                  {trueMutualSocieties.length > 0 && (
                    <span className="border border-accent bg-accent/15 px-1.5 py-0.2 font-mono text-[9px] text-accent font-bold">
                      {trueMutualSocieties.length} Mutual
                    </span>
                  )}
                </div>

                {/* Mutual Societies highlight */}
                {trueMutualSocieties.length > 0 && (
                  <div className="space-y-1 bg-accent/5 border border-accent/30 p-2">
                    <p className="font-mono text-[9px] text-accent uppercase tracking-wider font-bold">
                      Shared Campus Grounds ({trueMutualSocieties.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {trueMutualSocieties.map((s, idx) => (
                        <span
                          key={idx}
                          className="border border-accent bg-accent/20 px-1.5 py-0.2 font-mono text-[9px] text-accent font-semibold"
                        >
                          {s} (Shared)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Profile Societies */}
                {focusedProfile.societies && focusedProfile.societies.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {focusedProfile.societies.map((s, idx) => (
                      <span
                        key={idx}
                        className="border border-rule bg-background px-1.5 py-0.5 font-mono text-[9px] text-ink-soft"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-muted-foreground">General Alumni Register</p>
                )}
              </div>

              {/* Campus Common Ground & Shared Ties */}
              <div className="border border-rule bg-card p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase tracking-wider font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Shared Ties & Common Ground</span>
                </div>
                {sharedTies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sharedTies.map((tie, i) => (
                      <span
                        key={i}
                        className="border border-rule bg-background px-2 py-0.5 font-mono text-[9px] text-foreground font-medium"
                      >
                        {tie}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
                    Connected via institutional campus registrar and university alumni registry.
                  </p>
                )}
              </div>

              {/* Live Dijkstra Shortest Path Breakdown */}
              <div className="border border-rule bg-card p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-rule pb-2">
                  <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase tracking-wider font-semibold">
                    <RouteIcon className="h-3.5 w-3.5" />
                    <span>Connection Path (Dijkstra)</span>
                  </div>
                  {shortestPathSteps.length > 1 && (
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {shortestPathSteps.length - 1} {shortestPathSteps.length - 1 === 1 ? "hop" : "hops"} away · W = {totalResistance.toFixed(3)}
                    </span>
                  )}
                </div>

                {isComputingPath ? (
                  <p className="font-mono text-[10px] text-muted-foreground animate-pulse py-2">
                    Computing optimal shortest path...
                  </p>
                ) : shortestPathSteps.length > 1 ? (
                  <div className="space-y-1.5 pt-1 font-mono text-[10px]">
                    {shortestPathSteps.map((step, idx) => {
                      const isCurrent = step.id === currentUserId;
                      const isTarget = step.id === focusedProfile.id;

                      return (
                        <div key={step.id} className="flex items-center gap-2">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center border border-rule bg-background text-[8px] font-bold">
                            {idx + 1}
                          </span>
                          <div className="flex-1 truncate">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isTarget && !isCurrent) {
                                  setFocusedNode(step.id);
                                }
                              }}
                              className={`font-semibold cursor-pointer hover:underline text-left truncate ${
                                isCurrent
                                  ? "text-blue-500 font-bold"
                                  : isTarget
                                  ? "text-accent font-bold"
                                  : "text-foreground"
                              }`}
                            >
                              {step.name}
                            </button>
                            {isCurrent && <span className="text-muted-foreground ml-1">(You)</span>}
                            {step.company && (
                              <span className="text-muted-foreground ml-1.5">· {step.company}</span>
                            )}
                          </div>
                          {idx < shortestPathSteps.length - 1 && (
                            <span className="text-accent text-[9px] font-bold">↓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-2.5 border border-amber-500/30 bg-amber-500/10 font-mono text-[10px] space-y-1">
                    <p className="font-bold text-amber-600 dark:text-amber-400">Unconnected Island Profile</p>
                    <p className="text-muted-foreground leading-relaxed text-[9px]">
                      No verified trust path connects you to this profile yet. Claim a microtask or connect through mutual campus peers to build a direct bridge.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom CTA Actions */}
              <div className="pt-2 flex items-center gap-2">
                <Link
                  to="/messages"
                  search={{ recipient: focusedProfile.id }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-accent bg-accent px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Inquire Directly</span>
                </Link>
                <Link
                  to="/alumni/$id"
                  params={{ id: focusedProfile.id }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-rule bg-card px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors font-semibold"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Full Dossier</span>
                </Link>
              </div>
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="flex-1 overflow-y-auto divide-y divide-rule font-mono text-xs">
              <div className="p-3 bg-background/50 border-b border-rule flex items-center justify-between text-xs font-mono text-muted-foreground sticky top-0 z-10 backdrop-blur-xs">
                <span>Directory Register ({filteredPeople.length} Matches)</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyMentors}
                    onChange={(e) => setOnlyMentors(e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  <span>Mentors Only</span>
                </label>
              </div>

              {filteredPeople.map((person) => {
                const isSelected = focusedNodeId === person.id;
                const isHovered = hoveredNodeId === person.id;

                return (
                  <div
                    key={person.id}
                    onClick={() => handleSelectProfile(person)}
                    onMouseEnter={() => setHoveredNode(person.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`group p-3.5 transition-colors cursor-pointer space-y-1.5 border-l-4 ${
                      isSelected
                        ? "border-l-accent bg-accent/10"
                        : isHovered
                        ? "border-l-accent/60 bg-accent/5"
                        : "border-l-transparent hover:bg-card/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Monogram name={person.full_name} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-display text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                              {person.full_name}
                            </span>
                            <SampleTag show={person.is_sample} />
                            {person.open_to_mentor && (
                              <span className="border border-emerald-500/40 bg-emerald-500/10 px-1 py-0.2 font-mono text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                                Mentor
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                            Class of {person.grad_year} · {person.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="border border-rule bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                          {person.bounty_points ?? 0} pts
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all ml-0.5" />
                      </div>
                    </div>

                    {person.company && (
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-foreground font-medium pl-9">
                        <CompanyLogo company={person.company} className="h-3 w-3" />
                        <span className="truncate">{person.company}</span>
                        {person.city && <span className="text-muted-foreground font-normal">· {person.city}</span>}
                      </div>
                    )}

                    {/* Societies Badges */}
                    {person.societies && person.societies.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pl-9 pt-0.5">
                        {person.societies.slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            className="border border-accent/30 bg-accent/5 px-1.5 py-0.2 font-mono text-[8px] text-accent"
                          >
                            {s}
                          </span>
                        ))}
                        {person.societies.length > 2 && (
                          <span className="font-mono text-[8px] text-muted-foreground">
                            +{person.societies.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPeople.length === 0 && (
                <div className="p-8 text-center font-mono text-xs text-muted-foreground space-y-2">
                  <p>No scholars match your criteria.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCompany("all");
                      setSelectedDept("all");
                      setSelectedSociety("all");
                      setOnlyMentors(false);
                      resetFilters();
                    }}
                    className="link-u text-accent text-xs cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── DRAGGABLE SPLITTER DIVIDER ── */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className={`w-1.5 hover:w-2 transition-all cursor-col-resize z-30 select-none ${
            isDragging ? "bg-accent w-2" : "bg-rule hover:bg-accent/60"
          }`}
          title="Drag horizontally to resize Directory sidebar and 3D Canvas"
        />

        {/* RIGHT PANE: THE 3D WEBGL GRAPH CANVAS */}
        <div className="flex-1 h-full relative overflow-hidden bg-[#0A0908]">
          <SpatialCanvas
            nodes={graphNodes}
            links={graphLinks}
            onNodeSelect={handleGraphNodeSelect}
            currentUserId={currentUserId ?? ""}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}