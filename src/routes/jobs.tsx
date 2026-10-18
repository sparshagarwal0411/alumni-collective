import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Empty, ErrorNote, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { jobsQuery, profilesQuery } from "@/lib/queries";
<<<<<<< HEAD
import { getStudentProfile, type StudentProfileData } from "@/lib/studentProfile";
=======
import { useAuth } from "@/lib/auth";
import { Lock, ShieldCheck } from "lucide-react";
>>>>>>> 6a64cfba3ad78b914ee742765300955f34639493
import { toast } from "sonner";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  ExternalLink,
  Target,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs, Employment Skills & Referrals — Ashwood College" },
      {
        name: "description",
        content: "Career opportunities, required employment skills rubrics, and trusted internal referrals provided by Ashwood alumni worldwide.",
      },
    ],
  }),
  component: JobsPage,
});

interface EnrichedJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  kind: string;
  description: string | null;
  posted_by: string | null;
  referral_available: boolean;
  url: string | null;
  is_sample: boolean;
  created_at: string;
  requiredSkills: string[];
  qualifications: string;
  compensation?: string;
  experienceLevel?: string;
}

const DEFAULT_REQUIRED_SKILLS: Record<
  string,
  { skills: string[]; qualifications: string; compensation: string; exp: string }
> = {
  "j-1": {
    skills: ["Rust", "CUDA", "Linux Kernels", "Distributed Systems", "PyTorch"],
    qualifications:
      "B.Tech/M.S. in Computer Science or Electrical Engineering. Demonstrated experience with multi-node GPU clusters, NCCL interconnects, or custom CUDA kernels.",
    compensation: "$190k – $240k + Equity",
    exp: "New Grad / Early Career / Master's",
  },
  "j-2": {
    skills: ["Product Strategy", "Distributed Systems", "Data Modeling", "Fintech", "Go"],
    qualifications:
      "Analytical rigor, API design ergonomics, and cross-border payments architecture. Comfort leading technical specs with distributed systems teams.",
    compensation: "£110k – £145k + Equity",
    exp: "Associate / 1–3 Years Experience",
  },
  "j-3": {
    skills: ["Embedded C++", "Control Systems", "Kinematics", "Computer Vision", "ROS2"],
    qualifications:
      "B.Tech in Mechanical, Mechatronics, or Computer Science. Strong mathematical foundations in Lagrangian mechanics and trajectory optimization.",
    compensation: "₹24 LPA – ₹36 LPA + ESOPs",
    exp: "New Grad / Junior Engineer",
  },
  "j-4": {
    skills: ["PyTorch", "Reinforcement Learning", "LLM Alignment", "Statistical Modeling", "Python"],
    qualifications:
      "Ph.D. or Master's with published research in top-tier conferences (NeurIPS, ICML, ICLR, or CVPR). Strong empirical alignment intuition.",
    compensation: "£130k – £170k + Bonus",
    exp: "Fellowship / Doctoral / Post-Doc",
  },
  "j-5": {
    skills: ["Go", "Linux Kernels", "PostgreSQL", "Network Engineering", "High Performance Computing"],
    qualifications:
      "Deep understanding of Linux network stacks, zero-allocation Go, epoll/kqueue, bare-metal hardware operations, and high-throughput databases.",
    compensation: "₹35 LPA – ₹50 LPA",
    exp: "Prodigious Grads & 2+ Years Exp",
  },
  "j-6": {
    skills: ["Stochastic Calculus", "C++20", "Python", "Statistical Arbitrage", "Concurrency Primitives"],
    qualifications:
      "Undergraduate, Master's, or Ph.D. students graduating in 2026/2027 in Math, Physics, CS, or Stats. Medalists in Math/Informatics Olympiads preferred.",
    compensation: "$5,500 / week + Housing",
    exp: "Summer 2026 Fellowship",
  },
  "j-7": {
    skills: ["Design Systems", "Product Design", "Typography", "Figma", "Interaction Design", "TypeScript"],
    qualifications:
      "Exceptional taste in keyboard-first desktop software, typography rhythm, and interaction craft. Working prototypes in React/TypeScript.",
    compensation: "$160k – $210k + Equity",
    exp: "Junior to Mid-Level / Strong Portfolio",
  },
  "j-8": {
    skills: ["Python", "Remote Sensing", "Climate Tech", "Statistical Modeling", "Docker & K8s"],
    qualifications:
      "Current students or 2025/2026 graduates with experience in GDAL, NumPy, and satellite spectral analysis for soil carbon verification.",
    compensation: "€2,400 / month",
    exp: "Undergraduate Internship",
  },
};

const EMPLOYMENT_SKILLS_RUBRICS = [
  {
    discipline: "Frontier Systems & GPU Infrastructure",
    companies: ["Anthropic", "Google DeepMind", "Apple Silicon", "Citadel"],
    targetRoles: ["Systems Software Engineer", "GPU Runtime Architect", "Distributed Storage Engineer"],
    coreRequiredSkills: [
      { name: "Rust / Modern C++20", desc: "Zero-cost abstractions, RAII, memory models, and cache locality." },
      { name: "Linux Kernel Internals", desc: "Virtual memory, eBPF, page tables, epoll, and scheduler runqueues." },
      { name: "CUDA & Accelerator Interconnects", desc: "Warp-level primitives, tensor cores, NCCL ring all-reduce, and unified memory." },
      { name: "Distributed Storage & Consensus", desc: "Raft, Paxos, Write-Ahead Logging (WAL), and LSM-tree storage engines." },
    ],
    whatAlumniLookFor:
      "Independent open-source contributions, custom kernel modules, or reproducible benchmarks demonstrating mastery of memory hierarchy and concurrent synchronization.",
    sampleInterviewDrill:
      "Design a lock-free multi-producer multi-consumer ring buffer with sub-microsecond latency. Explain cache line bouncing and memory fence semantics under x86-64 and ARM.",
  },
  {
    discipline: "Applied AI & Large Model Alignment",
    companies: ["OpenAI", "Google DeepMind", "Anthropic", "Oxford BioMed"],
    targetRoles: ["Research Scientist", "Alignment Engineer", "ML Infrastructure Member"],
    coreRequiredSkills: [
      { name: "PyTorch & Distributed Training", desc: "FSDP, Megatron-LM tensor parallelism, ZeRO-3 stages, and activation checkpointing." },
      { name: "Reinforcement Learning & Alignment", desc: "PPO, DPO, RLHF pipelines, reward modeling, and constitutional evaluation." },
      { name: "Statistical Mechanics & Linear Algebra", desc: "Singular value decomposition, attention dynamics, and transformer residual streams." },
    ],
    whatAlumniLookFor:
      "Empirical research papers, reproducible training logs, and evidence of debugging loss spikes or gradient explosions on large GPU clusters.",
    sampleInterviewDrill:
      "Derive the memory footprint of Llama-70B during mixed-precision AdamW training across 64 H100s. Where does activation memory accumulate, and how do you shard optimizer states?",
  },
  {
    discipline: "High-Frequency FinTech & Capital Infrastructure",
    companies: ["Zerodha", "Stripe", "Citadel Securities", "Peak XV"],
    targetRoles: ["Quantitative Developer", "Core Infrastructure Engineer", "Payments Architect"],
    coreRequiredSkills: [
      { name: "Zero-Allocation Go / C++", desc: "Custom allocators, GC-pause avoidance, ring buffers, and SIMD instructions." },
      { name: "PostgreSQL & Relational Tuning", desc: "WAL archiving, index selectivity, MVCC row lock avoidance, and isolation levels." },
      { name: "Stochastic Calculus & Time Series", desc: "Ornstein-Uhlenbeck processes, volatility surfaces, and algorithmic order routing." },
    ],
    whatAlumniLookFor:
      "Students who build bare-metal systems with zero cloud bloat, demonstrate clean architectural discipline, and think about tail latency and partition isolation.",
    sampleInterviewDrill:
      "A trading engine experiences an unexpected 20ms p999 spike every 4 minutes. Walk through your profiling strategy across CPU counters, page faults, and network socket queues.",
  },
  {
    discipline: "Software Craft, Typography & Product Design",
    companies: ["Linear", "Figma", "Apple", "Adobe"],
    targetRoles: ["Product Designer", "Design Technologist", "Frontend Systems Engineer"],
    coreRequiredSkills: [
      { name: "Design Systems & Typography", desc: "Typographic scale, baseline rhythm, CSS variables, and layout ergonomics." },
      { name: "Keyboard-First Desktop UX", desc: "Command palettes, keyboard navigation, focus management, and accessibility." },
      { name: "TypeScript & React Architecture", desc: "State machines, virtualized lists, optimistic UI updates, and sub-16ms render frames." },
    ],
    whatAlumniLookFor:
      "A polished, opinionated portfolio showing real interactive prototypes, meticulous care for micro-interactions, and high respect for tool users.",
    sampleInterviewDrill:
      "Implement a keyboard-accessible combobox that handles 10,000 items with zero lag, instant fuzzy search, and smooth arrow-key transitions.",
  },
  {
    discipline: "Robotics, Control Systems & Space Guidance",
    companies: ["Synapse Robotics", "ISRO", "Tesla"],
    targetRoles: ["Robotics Software Engineer", "Control Systems Architect", "Embedded Firmware Lead"],
    coreRequiredSkills: [
      { name: "Embedded C++ & Real-Time OS", desc: "Deterministic execution loops, FreeRTOS, memory boundaries, and CAN-bus telemetry." },
      { name: "Kinematics & Motion Planning", desc: "Forward/inverse kinematics, trajectory optimization, and collision avoidance." },
      { name: "Sensor Fusion & Computer Vision", desc: "Kalman filtering, stereo depth calibration, and edge inference." },
    ],
    whatAlumniLookFor:
      "Physical projects, robotics society leadership, hardware hacking experience, and mathematical rigor in linear control theory.",
    sampleInterviewDrill:
      "Design a dual-PID control loop with anti-windup for a sub-millimeter robotic laparoscopy joint experiencing variable surgical tissue resistance.",
  },
];

const LOCAL_POSTED_JOBS_KEY = "ashwood_local_posted_jobs_v1";

function getLocalPostedJobs(): EnrichedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_POSTED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPostedJobs(jobs: EnrichedJob[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_POSTED_JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error("Failed to save local posted jobs", err);
  }
}

function JobsPage() {
  const { user, currentRole, signInAsDemo } = useAuth();
  const jobsResult = useQuery(jobsQuery);
  const profilesResult = useQuery(profilesQuery);

  const rawJobs = jobsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  // Local student profile for skill matching
  const [studentProfile, setStudentProfile] = useState<StudentProfileData>(getStudentProfile());
  const [tab, setTab] = useState<"openings" | "skills-rubric" | "post">("openings");

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState("all");
  const [referralOnly, setReferralOnly] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");

  // Referral Modal states
  const [activeReferralModal, setActiveReferralModal] = useState<string | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const [attachStudentFolio, setAttachStudentFolio] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Job Posting Form states
  const [postTitle, setPostTitle] = useState("");
  const [postCompany, setPostCompany] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [postKind, setPostKind] = useState("Full-time");
  const [postCompensation, setPostCompensation] = useState("");
  const [postSkillsStr, setPostSkillsStr] = useState("");
  const [postQualifications, setPostQualifications] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postReferral, setPostReferral] = useState(true);
  const [localPostedJobs, setLocalPostedJobs] = useState<EnrichedJob[]>(getLocalPostedJobs());

  useEffect(() => {
    const handleUpdate = () => {
      setStudentProfile(getStudentProfile());
    };
    window.addEventListener("student_profile_updated", handleUpdate);
    return () => window.removeEventListener("student_profile_updated", handleUpdate);
  }, []);

  // Merge server mock jobs with enriched metadata and locally posted jobs
  const allEnrichedJobs = useMemo(() => {
    const baseList: EnrichedJob[] = rawJobs.map((j) => {
      const meta = DEFAULT_REQUIRED_SKILLS[j.id] || {
        skills: ["Software Engineering", "Problem Solving", "Computer Systems"],
        qualifications: "Bachelor's degree in engineering or relevant quantitative discipline.",
        compensation: "Competitive compensation band",
        exp: "Open to qualified candidates",
      };
      return {
        ...j,
        requiredSkills: meta.skills,
        qualifications: meta.qualifications,
        compensation: meta.compensation,
        experienceLevel: meta.exp,
      };
    });

    return [...localPostedJobs, ...baseList];
  }, [rawJobs, localPostedJobs]);

  const studentSkillNames = useMemo(() => {
    return new Set(studentProfile.skills.map((s) => s.name.toLowerCase().trim()));
  }, [studentProfile]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allEnrichedJobs.filter((job) => {
      const matchQuery =
        !q ||
        [
          job.title,
          job.company,
          job.location ?? "",
          job.description ?? "",
          ...(job.requiredSkills || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchKind = selectedKind === "all" || job.kind === selectedKind;
      const matchReferral = !referralOnly || job.referral_available;
      return matchQuery && matchKind && matchReferral;
    });
  }, [allEnrichedJobs, searchQuery, selectedKind, referralOnly]);

  const handleRequestReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveReferralModal(null);
      setReferralNote("");
      toast.success(
        attachStudentFolio
          ? `Referral request with verified Student Folio (${studentProfile.fullName}) dispatched directly to alumnus.`
          : "Referral request dispatched directly to the alumni poster's inbox."
      );
    }, 600);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postCompany.trim()) return;

    const newJob: EnrichedJob = {
      id: `local-job-${Date.now()}`,
      title: postTitle.trim(),
      company: postCompany.trim(),
      location: postLocation.trim() || "Remote / Ashwood Network",
      kind: postKind,
      description: postDescription.trim(),
      posted_by: "alumnus-user",
      referral_available: postReferral,
      url: postUrl.trim() || null,
      is_sample: false,
      created_at: new Date().toISOString(),
      requiredSkills: postSkillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      qualifications: postQualifications.trim() || "Ashwood degree or equivalent background.",
      compensation: postCompensation.trim() || "Competitive Alumni Band",
      experienceLevel: "All Qualified Classes",
    };

    const updated = [newJob, ...localPostedJobs];
    setLocalPostedJobs(updated);
    saveLocalPostedJobs(updated);

    // Reset form
    setPostTitle("");
    setPostCompany("");
    setPostLocation("");
    setPostCompensation("");
    setPostSkillsStr("");
    setPostQualifications("");
    setPostDescription("");
    setPostUrl("");

    toast.success(`Job posting "${newJob.title}" published with required skills rubric.`);
    setTab("openings");
  };

  const activeJob = allEnrichedJobs.find((j) => j.id === activeReferralModal);

  return (
    <>
      <PageHead
        index="III."
        eyebrow="Opportunity & Employment"
        title="Jobs, required skills and referrals."
        lede="Roles posted directly by Ashwood graduates. Inspect required employment competencies, verify your skill match, and ask for trusted alumni referrals."
      />

      <Section>
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-foreground py-4 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-1">Section:</span>
            <button
              type="button"
              onClick={() => setTab("openings")}
              className={`px-3 py-1.5 transition-colors ${tab === "openings"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-rule hover:border-foreground"
                }`}
            >
              Available Positions ({allEnrichedJobs.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("skills-rubric")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors ${tab === "skills-rubric"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-rule hover:border-foreground"
                }`}
            >
              <Target className="h-3.5 w-3.5" />
              Employment Skills Matrix & Rubric
            </button>
            <button
              type="button"
              onClick={() => setTab("post")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors ${tab === "post"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-rule hover:border-foreground"
                }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Post an Opportunity (Alumni)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student"
              className="inline-flex items-center gap-1.5 border border-accent/40 bg-paper px-3 py-1.5 text-accent hover:border-accent font-semibold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              My Student Folio ({studentProfile.skills.length} Skills)
            </Link>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: OPENINGS & REFERRALS (WITH LIVE SKILL MATCHER)
           ========================================================================= */}
        {tab === "openings" && (
          <div className="mt-8 space-y-8">
            {/* Student Matcher Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-rule bg-paper p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/10 text-accent font-mono text-sm font-bold">
                  {studentProfile.skills.length}
                </div>
                <div>
                  <p className="font-display text-lg text-foreground font-semibold">
                    Live Skill Matching Enabled for {studentProfile.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Class of {studentProfile.gradYear} · {studentProfile.department} ·{" "}
                    {studentProfile.resume ? "✓ Resume Attached" : "No Resume Uploaded"}
                  </p>
                </div>
              </div>
              <Link
                to="/student"
                className="link-u font-mono text-xs text-accent hover:text-foreground"
              >
                Update Skills on Folio →
              </Link>
            </div>

            {/* Filter Bar */}
            <div className="grid gap-4 border-y border-foreground py-4 md:grid-cols-12 md:items-end">
              <label className="md:col-span-6">
                <span className="eyebrow block mb-1">Search Roles, Skills or Companies</span>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, Rust, CUDA, Anthropic, London..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-rule bg-paper px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
                />
              </label>

              <label className="md:col-span-3">
                <span className="eyebrow block mb-1">Engagement Type</span>
                <select
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value)}
                  className="w-full border border-rule bg-paper px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm md:col-span-3 pt-2">
                <input
                  type="checkbox"
                  checked={referralOnly}
                  onChange={(e) => setReferralOnly(e.target.checked)}
                  className="accent-[var(--accent)] h-4 w-4"
                />
                <span className="font-mono text-xs">Alumni Referrals Only</span>
              </label>
            </div>

            {/* Job Listings with Skill Badges */}
            {jobsResult.isLoading ? (
              <Loading label="Fetching opportunities and matching competencies" />
            ) : filteredJobs.length === 0 ? (
              <div className="py-12">
                <Empty title="No postings match your criteria.">
                  Try adjusting your search terms or clearing the filter.
                </Empty>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-baseline justify-between border-b border-rule pb-2">
                  <span className="eyebrow">{filteredJobs.length} Positions Available</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Verified Ashwood Network Postings
                  </span>
                </div>

                <div className="divide-y divide-rule border-b border-rule">
                  {filteredJobs.map((job) => {
                    const poster = profiles.find((p) => p.id === job.posted_by);

                    // Compute matching score with student profile
                    const totalReq = job.requiredSkills.length;
                    const matchedCount = job.requiredSkills.filter((reqSkill) => {
                      const lower = reqSkill.toLowerCase().trim();
                      return Array.from(studentSkillNames).some(
                        (s) => s.includes(lower) || lower.includes(s)
                      );
                    }).length;

                    const matchPercentage =
                      totalReq > 0 ? Math.round((matchedCount / totalReq) * 100) : 0;

                    return (
                      <article
                        key={job.id}
                        className="group py-8 transition-colors md:grid md:grid-cols-12 md:gap-8"
                      >
                        <div className="md:col-span-8 flex items-start gap-4">
                          <CompanyLogo
                            company={job.company}
                            size="lg"
                            className="mt-1 shrink-0 shadow-xs"
                          />

                          <div className="space-y-3 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                {job.kind}
                              </span>
                              <span className="text-muted-foreground">·</span>
                              <span className="font-display text-lg text-foreground font-semibold">
                                {job.company}
                              </span>
                              <SampleTag show={job.is_sample} />
                              {job.referral_available && (
                                <span className="border border-accent/40 bg-paper px-2 py-0.5 font-mono text-[10px] uppercase text-accent font-semibold">
                                  Referral Offered
                                </span>
                              )}
                              {job.compensation && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  · {job.compensation}
                                </span>
                              )}
                            </div>

                            <h3 className="font-display text-3xl text-foreground group-hover:text-accent transition-colors font-bold leading-snug">
                              {job.title}
                            </h3>

                            <p className="text-sm text-ink-soft leading-relaxed max-w-2xl font-serif">
                              {job.description}
                            </p>

                            {/* Required Skills & Fit Section */}
                            <div className="border border-rule bg-paper p-4 space-y-2.5 rounded-sm">
                              <div className="flex items-center justify-between">
                                <span className="eyebrow text-xs flex items-center gap-1.5">
                                  <Target className="h-3.5 w-3.5 text-accent" />
                                  Required Skills on Employment:
                                </span>
                                <span
                                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-xs ${matchPercentage >= 70
                                    ? "bg-accent/15 text-accent border border-accent/30"
                                    : matchPercentage >= 40
                                      ? "bg-muted text-foreground border border-rule"
                                      : "bg-background text-muted-foreground border border-rule"
                                    }`}
                                >
                                  {matchPercentage}% Skill Match ({matchedCount}/{totalReq})
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((reqSkill) => {
                                  const lower = reqSkill.toLowerCase().trim();
                                  const isMatched = Array.from(studentSkillNames).some(
                                    (s) => s.includes(lower) || lower.includes(s)
                                  );

                                  return (
                                    <span
                                      key={reqSkill}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-xs border ${isMatched
                                        ? "border-accent/40 bg-accent/10 text-accent font-semibold"
                                        : "border-rule bg-background text-muted-foreground"
                                        }`}
                                      title={
                                        isMatched
                                          ? `Matched with your Student Folio`
                                          : `Required skill not currently listed on your Folio`
                                      }
                                    >
                                      <span>{isMatched ? "✓" : "○"}</span>
                                      <span>{reqSkill}</span>
                                    </span>
                                  );
                                })}
                              </div>

                              {job.qualifications && (
                                <p className="text-xs text-muted-foreground pt-1 border-t border-rule font-sans">
                                  <strong>Qualifications:</strong> {job.qualifications}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 font-mono">
                              <span>📍 {job.location || "Remote / Flexible"}</span>
                              {poster && (
                                <span>
                                  Posted by:{" "}
                                  <Link
                                    to="/alumni/$id"
                                    params={{ id: poster.id }}
                                    className="link-u text-foreground"
                                  >
                                    {poster.full_name} ({poster.role_title ?? "Alumnus"})
                                  </Link>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-6 flex flex-col justify-between gap-4 md:mt-0 md:col-span-4 md:items-end">
                          <div className="text-right">
                            <span className="eyebrow block">Listed</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {new Date(job.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {job.referral_available && (
                              <button
                                type="button"
                                onClick={() => setActiveReferralModal(job.id)}
                                className="border border-foreground bg-background px-4 py-2 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors font-medium"
                              >
                                Request Referral
                              </button>
                            )}
                            {job.url && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-medium"
                              >
                                Apply ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: EMPLOYMENT SKILLS MATRIX & RUBRIC (DEDICATED PAGE FOR ALUMNI)
           ========================================================================= */}
        {tab === "skills-rubric" && (
          <div className="mt-10 space-y-12">
            <div className="border-b border-rule pb-6">
              <span className="eyebrow text-accent">Competency Benchmark</span>
              <h2 className="mt-2 font-display text-4xl text-foreground font-bold">
                Employment Skills Rubric for Ashwood Graduates
              </h2>
              <p className="mt-3 text-lg text-ink-soft max-w-3xl leading-relaxed font-serif">
                A structured reference outlining the required technical competencies, interview
                expectations, and portfolio artifacts alumni look for when reviewing candidates
                across major industry chapters.
              </p>
            </div>

            <div className="grid gap-8">
              {EMPLOYMENT_SKILLS_RUBRICS.map((rubric) => (
                <article
                  key={rubric.discipline}
                  className="border border-rule bg-paper p-8 space-y-6 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-4">
                    <div>
                      <span className="eyebrow text-accent">Industry Chapter</span>
                      <h3 className="font-display text-2xl font-bold text-foreground mt-1">
                        {rubric.discipline}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        Target Roles: {rubric.targetRoles.join(" · ")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground mr-1">
                        Hiring Houses:
                      </span>
                      {rubric.companies.map((co) => (
                        <CompanyLogo
                          key={co}
                          company={co}
                          variant="pill"
                          size="sm"
                          className="bg-background"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Core Required Skills List */}
                  <div>
                    <span className="eyebrow block mb-3">Required Core Competencies</span>
                    <div className="grid gap-3 md:grid-cols-2">
                      {rubric.coreRequiredSkills.map((sk) => (
                        <div
                          key={sk.name}
                          className="border border-rule bg-background p-3.5 space-y-1 rounded-sm"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            <span className="font-display text-base font-semibold text-foreground">
                              {sk.name}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft font-sans pl-6">{sk.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What Alumni Look For */}
                  <div className="border-l-2 border-accent pl-4 py-1.5 space-y-1 bg-accent/5">
                    <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold block">
                      What Alumni Reviewers Look For in Student Portfolios:
                    </span>
                    <p className="text-sm text-foreground/90 font-serif leading-relaxed">
                      {rubric.whatAlumniLookFor}
                    </p>
                  </div>

                  {/* Sample Drill */}
                  <div className="border border-rule bg-background p-4 space-y-1 font-mono text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold block">
                      Sample Technical Interview Drill:
                    </span>
                    <p className="text-foreground leading-relaxed italic">
                      "{rubric.sampleInterviewDrill}"
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="border border-rule bg-paper p-8 text-center space-y-3">
              <h3 className="font-display text-2xl text-foreground font-semibold">
                Are you an alumnus hiring for your organization?
              </h3>
              <p className="text-sm text-ink-soft max-w-xl mx-auto">
                Define the specific skills your team requires and offer internal referrals directly to
                vetted Ashwood undergraduates.
              </p>
              <button
                type="button"
                onClick={() => setTab("post")}
                className="bg-primary px-6 py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-semibold"
              >
                Post an Opportunity with Required Skills →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: POST AN EMPLOYMENT OPPORTUNITY (FOR ALUMNI)
           ========================================================================= */}
        {tab === "post" && (
          <div className="mt-10 max-w-3xl mx-auto">
            <form onSubmit={handlePostJob} className="border border-rule bg-card p-6 md:p-10 space-y-8 shadow-xs">
              <div className="border-b border-rule pb-4">
                <span className="eyebrow text-accent">Alumni Employment Roll</span>
                <h2 className="font-display text-3xl font-bold text-foreground mt-1">
                  Post an Opportunity with Required Skills
                </h2>
                <p className="text-sm text-ink-soft mt-1">
                  Specify the required technical skills and qualifications so Ashwood students can
                  evaluate their match and request referrals with their verified folio.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="eyebrow block mb-1">Job / Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Member of Technical Staff — Distributed Systems"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Hiring Organization / Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anthropic, Stripe, DeepMind, Zerodha"
                    value={postCompany}
                    onChange={(e) => setPostCompany(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="eyebrow block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Engagement Kind</label>
                  <select
                    value={postKind}
                    onChange={(e) => setPostKind(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Compensation Band</label>
                  <input
                    type="text"
                    placeholder="e.g. $180k–$220k / ₹30LPA"
                    value={postCompensation}
                    onChange={(e) => setPostCompensation(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-1">
                  Required Core Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rust, CUDA, Linux Kernels, Distributed Systems, Compilers"
                  value={postSkillsStr}
                  onChange={(e) => setPostSkillsStr(e.target.value)}
                  className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  These skills will be matched against students' folios to display fit percentages.
                </p>
              </div>

              <div>
                <label className="eyebrow block mb-1">Minimum Qualifications & Degrees</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech / M.S. in CS/EE with prior experience in systems software."
                  value={postQualifications}
                  onChange={(e) => setPostQualifications(e.target.value)}
                  className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Role Description & Responsibilities</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the team, problem scope, daily engineering challenges, and interview process..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2 items-center">
                <div>
                  <label className="eyebrow block mb-1">Application URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/..."
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postReferral}
                      onChange={(e) => setPostReferral(e.target.checked)}
                      className="accent-[var(--accent)] h-4 w-4"
                    />
                    <span className="font-mono text-xs text-foreground font-semibold">
                      I am offering internal alumni referrals for this role
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setTab("openings")}
                  className="border border-rule px-5 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary px-8 py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-semibold"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal for Requesting Referral with Student Folio Attachment */}
        {activeReferralModal && activeJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow text-accent">Alumni Referral</span>
                  <h3 className="font-display text-2xl text-foreground font-bold mt-0.5">
                    Request Referral for {activeJob.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {activeJob.company} · {activeJob.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReferralModal(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

<<<<<<< HEAD
  <form onSubmit={handleRequestReferral} className="mt-5 space-y-4">
    {/* Folio Attachment Badge */}
    <div className="border border-rule bg-paper p-3.5 space-y-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={attachStudentFolio}
          onChange={(e) => setAttachStudentFolio(e.target.checked)}
          className="accent-[var(--accent)] h-4 w-4"
        />
        <span className="font-mono text-xs text-foreground font-semibold">
          Attach my verified Student Folio & Resume
        </span>
      </label>
      {attachStudentFolio && (
        <div className="pl-6 font-mono text-[11px] text-muted-foreground space-y-1">
          <p>
            Candidate: <strong>{studentProfile.fullName}</strong> (Class of{" "}
            {studentProfile.gradYear})
          </p>
          <p>
            Resume:{" "}
            {studentProfile.resume
              ? `✓ ${studentProfile.resume.fileName} (${studentProfile.resume.fileSize})`
              : "No PDF uploaded (Profile only)"}
          </p>
          <p>Projects: {studentProfile.projects.length} artifacts included</p>
        </div>
      )}
    </div>

    <div>
      <label className="eyebrow block mb-1">Statement of Fit & Introduction</label>
      <textarea
        rows={4}
        required
        placeholder="Briefly explain your relevant experience with the required skills, your graduation timeline, and why you are interested in this team..."
        value={referralNote}
        onChange={(e) => setReferralNote(e.target.value)}
        className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none font-sans leading-relaxed"
      />
=======
              {!user ? (
        <div className="mt-6 space-y-4 border border-rule bg-paper p-5 rounded text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 border border-accent/30 text-accent">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display text-xl">Sign-In Required for Referrals</h4>
            <p className="text-xs text-ink-soft mt-1">
              Internal alumni referrals require an authenticated student, faculty, or alumni profile so the referrer can vouch for your application.
            </p>
          </div>
          <Link
            to="/auth"
            search={{ redirect: "/jobs", intent: "referral" }}
            className="block w-full text-center bg-primary text-primary-foreground py-2.5 text-xs uppercase tracking-widest hover:bg-accent transition-colors"
          >
            Sign In to Request Referral
          </Link>
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
            <span>Quick test:</span>
            <button
              type="button"
              onClick={() => signInAsDemo("student")}
              className="link-u text-foreground hover:text-accent cursor-pointer"
            >
              Student
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => signInAsDemo("alumni")}
              className="link-u text-foreground hover:text-accent cursor-pointer"
            >
              Alum
            </button>
          </div>
>>>>>>> 6a64cfba3ad78b914ee742765300955f34639493
        </div>
      ) : (
        <form onSubmit={handleRequestReferral} className="mt-6 space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 border border-emerald-200 dark:border-emerald-800 rounded">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Candidate Profile: <strong>{user.user_metadata?.full_name || user.email}</strong> ({currentRole.toUpperCase()})</span>
          </div>

<<<<<<< HEAD
  <div className="flex justify-end gap-3 pt-3 border-t border-rule">
    <button
      type="button"
      onClick={() => setActiveReferralModal(null)}
      className="border border-rule px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="bg-primary px-6 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 font-semibold"
    >
      {isSubmitting ? "Dispatching..." : "Send Referral Request"}
    </button>
  </div>
              </form >
=======
                  <div>
                    <label className="eyebrow block mb-2">Introduction & Fit Statement</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Briefly explain your relevant experience, graduation year, and why you are excited about this role..."
                      value={referralNote}
                      onChange={(e) => setReferralNote(e.target.value)}
                      className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveReferralModal(null)}
                      className="border border-rule px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Send Request"}
                    </button>
                  </div>
                </form>
              )}
>>>>>>> 6a64cfba3ad78b914ee742765300955f34639493
            </div >
          </div >
        )
}
      </Section >
    </>
  );
}
