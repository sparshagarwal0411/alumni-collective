import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useCallback } from "react";
import { PageHead, Section, SampleTag, Monogram } from "@/components/site/ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { jobsQuery, profilesQuery } from "@/lib/queries";
import { getAlumniPortrait } from "@/lib/portraits";
import { MOCK_MESSAGES, MOCK_MENTORSHIP_REQUESTS, type Message, type MentorshipRequest, type Job } from "@/lib/mockData";
import { useAuth, type AppRole } from "@/lib/auth";
import { getStudentProfile, type StudentProfileData } from "@/lib/studentProfile";
import { StudentProfilePage } from "@/routes/student";
import { AccountPage } from "@/routes/account";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Briefcase,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  GraduationCap,
  Landmark,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Send,
  Lock,
  Layers,
  Target,
  Award,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Calendar,
  Building,
  UserPlus,
  RefreshCw,
  Settings,
} from "lucide-react";
import { MicrotasksManager } from "@/components/microtasks/MicrotasksManager";
import {
  getStoredMessages,
  sendUnifiedMessage,
  CHAT_UPDATED_EVENT,
  type UnifiedMessage,
} from "@/lib/chatStore";

export const SCOUT_STUDENTS = [
  {
    id: "student-dev-sharma",
    fullName: "Dev Sharma",
    gradYear: 2025,
    department: "Computer Science & Engineering",
    gpa: "3.92 / 4.0",
    headline: "Undergraduate Fellow · Linux Kernels, Distributed Systems, Rust",
    skills: ["Rust", "Linux Kernels", "Distributed Systems", "CUDA", "eBPF", "PostgreSQL"],
    thesis: "Zero-copy lock-free ring buffers for multi-tenant GPU kernel dispatch",
    projects: 4,
    seekingRole: "Distributed Systems & Infrastructure Engineer",
  },
  {
    id: "student-aarav-patel",
    fullName: "Aarav Patel",
    gradYear: 2025,
    department: "Electrical & Computer Systems",
    gpa: "3.88 / 4.0",
    headline: "Robotics Controls & Low-Latency Firmware Developer",
    skills: ["Embedded C++", "Control Systems", "ROS2", "Kinematics", "Hardware Design"],
    thesis: "Closed-loop microsecond motor driver telemetry for sub-millimeter surgical robotics",
    projects: 3,
    seekingRole: "Robotics Controls & Hardware Engineer",
  },
  {
    id: "student-ananya-sen",
    fullName: "Ananya Sen",
    gradYear: 2026,
    department: "Data Science & Statistics",
    gpa: "3.95 / 4.0",
    headline: "Applied Machine Learning & Evaluation Researcher",
    skills: ["PyTorch", "Python", "LLM Evaluation", "C++20", "Distributed Training"],
    thesis: "Empirical benchmarking of hallucination rates in speculative decoding architectures",
    projects: 5,
    seekingRole: "ML Infrastructure & Evaluation Fellow",
  },
  {
    id: "student-rohan-varma",
    fullName: "Rohan Varma",
    gradYear: 2026,
    department: "Design & Human-Computer Interaction",
    gpa: "3.85 / 4.0",
    headline: "Product Systems Architect & Accessible Interface Designer",
    skills: ["TypeScript", "Design Systems", "Figma", "Interaction Design", "Next.js"],
    thesis: "Information density and spatial affordances in collaborative knowledge graphs",
    projects: 4,
    seekingRole: "Product Designer & Frontend Architect",
  },
];

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Universal Campus Dashboard — Ashwood College" },
      {
        name: "description",
        content: "Central unified collective workspace for students, faculty, and alumni to manage direct messaging, job seeking, opportunity posting, research referrals, and mentorship.",
      },
    ],
  }),
  component: UnifiedDashboardPage,
});

interface LocalPostedJob extends Job {
  requiredSkills: string[];
  qualifications: string;
  compensation: string;
  experienceLevel: string;
}

const LOCAL_POSTED_JOBS_KEY = "ashwood_local_posted_jobs_v1";
const LOCAL_SUBMITTED_REFERRALS_KEY = "ashwood_submitted_referrals_v1";

interface SubmittedReferral {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  note: string;
  folioAttached: boolean;
  status: "Pending Review" | "Vouched & Forwarded" | "Interview Scheduled";
  submittedAt: string;
}

function getSavedReferrals(): SubmittedReferral[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_SUBMITTED_REFERRALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return [
    {
      id: "ref-sample-1",
      jobId: "j-anthropic-systems",
      jobTitle: "Distributed Systems & Kernel Engineer",
      company: "Anthropic",
      candidateName: "Dev Sharma",
      note: "Strong background in Linux kernel tracing and lock-free data structures from Ashwood OS lab.",
      folioAttached: true,
      status: "Vouched & Forwarded",
      submittedAt: "2 days ago",
    },
    {
      id: "ref-sample-2",
      jobId: "j-synapse-controls",
      jobTitle: "Surgical Robotics Controls Engineer",
      company: "Synapse Robotics",
      candidateName: "Dev Sharma",
      note: "Built closed-loop feedback motor drivers with microsecond latency in Robotics Club.",
      folioAttached: true,
      status: "Pending Review",
      submittedAt: "Yesterday",
    },
  ];
}

function saveSubmittedReferrals(list: SubmittedReferral[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_SUBMITTED_REFERRALS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save referrals", err);
  }
}

function getLocalJobs(): LocalPostedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_POSTED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalJobs(jobs: LocalPostedJob[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_POSTED_JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error("Failed to save local posted jobs", err);
  }
}

export function UnifiedDashboardPage() {
  const { user, currentRole, setRole, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const { tab: requestedTab } = useSearch({ from: "/dashboard" });

  // Queries
  const profilesResult = useQuery(profilesQuery);
  const jobsResult = useQuery(jobsQuery);
  const people = profilesResult.data ?? [];
  const rawJobs = jobsResult.data ?? [];

  // Perspective is LOCKED to the authenticated role. Only guests can switch.
  const activePersona: AppRole = currentRole || "student";

  // Dashboard active section tab
  const dashboardTabs = [
    "overview",
    "messages",
    "seeking",
    "posting",
    "mentorship",
    "microtasks",
    "folio",
    "talent_scout",
    "account",
  ] as const;
  type DashboardTab = (typeof dashboardTabs)[number];
  const requestedDashboardTab = dashboardTabs.includes(requestedTab as DashboardTab)
    ? (requestedTab as DashboardTab)
    : undefined;
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    requestedDashboardTab || (currentRole === "student" ? "overview" : "overview")
  );
  const selectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    void navigate({ to: "/dashboard", search: { tab } });
  };

  useEffect(() => {
    if (requestedDashboardTab) {
      setActiveTab(requestedDashboardTab);
    }
  }, [requestedDashboardTab]);

  // Local student profile
  const [studentProfile, setStudentProfile] = useState<StudentProfileData>(getStudentProfile());
  useEffect(() => {
    const handleUpdate = () => setStudentProfile(getStudentProfile());
    window.addEventListener("student_profile_updated", handleUpdate);
    return () => window.removeEventListener("student_profile_updated", handleUpdate);
  }, []);

  // Messaging state — unified real-time chat store with cross-persona sync
  const [messages, setMessages] = useState<UnifiedMessage[]>(getStoredMessages());
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string>("p-arjun-nair");
  const [replyText, setReplyText] = useState("");
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  useEffect(() => {
    const handleChatUpdate = () => {
      setMessages(getStoredMessages());
    };
    window.addEventListener(CHAT_UPDATED_EVENT, handleChatUpdate);
    return () => window.removeEventListener(CHAT_UPDATED_EVENT, handleChatUpdate);
  }, []);

  // Mentorship state — seeded with mock, then replaced by real Supabase data
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(MOCK_MENTORSHIP_REQUESTS);
  const [openToMentorState, setOpenToMentorState] = useState(true);

  // Role-specific available tabs:
  // STUDENT: Overview, Job Seeking & Referrals, Microtasks, Mentorship, Folio & Resume, Messages, Account
  // ALUMNI: Recruiter Command, Recruiter Hub & Post Jobs, Commission Microtasks, Mentorship Requests, Student Talent Scout, Messages, Account
  // FACULTY: Academic Overview, Lab Grants & Postings, Academic Microtasks, Thesis Advisory, Student Scholars, Messages, Account
  const roleTabs = useMemo(() => {
    if (activePersona === "student") {
      return [
        { id: "folio" as DashboardTab, label: "Student Dossier & Resume", icon: FileText },
        { id: "overview" as DashboardTab, label: "Student Overview", icon: Target },
        { id: "seeking" as DashboardTab, label: "Job Seeking & Referrals", icon: Search },
        // { id: "microtasks" as DashboardTab, label: "Microtasks & Deliverables", icon: Award },
        // { id: "mentorship" as DashboardTab, label: "Alumni Mentors & Office Hours", icon: UserCheck },
        // { id: "folio" as DashboardTab, label: "Student Dossier & Resume", icon: FileText },
        // { id: "messages" as DashboardTab, label: `Direct Messages (${messages.length})`, icon: MessageSquare },
        { id: "account" as DashboardTab, label: "Account", icon: Settings },
      ];
    }
    if (activePersona === "alumni") {
      return [
        // { id: "overview" as DashboardTab, label: "Recruiter Command & Pipeline", icon: Target },
        { id: "posting" as DashboardTab, label: "Recruiter Hub & Post Jobs", icon: Plus },
        // { id: "microtasks" as DashboardTab, label: "Commission Work & Reviews", icon: Award },
        // { id: "mentorship" as DashboardTab, label: "Mentorship Requests", icon: UserCheck },
        { id: "talent_scout" as DashboardTab, label: "Student Talent & Folios", icon: GraduationCap },
        // { id: "messages" as DashboardTab, label: `Direct Messages (${messages.length})`, icon: MessageSquare },
        { id: "account" as DashboardTab, label: "Account", icon: Settings },
      ];
    }
    return [
      { id: "overview" as DashboardTab, label: "Academic Command Center", icon: Target },
      { id: "posting" as DashboardTab, label: "Research Lab Postings & Grants", icon: Plus },
      { id: "microtasks" as DashboardTab, label: "Academic Microtasks & Audits", icon: Award },
      { id: "mentorship" as DashboardTab, label: "Thesis Advisory & Office Hours", icon: UserCheck },
      { id: "talent_scout" as DashboardTab, label: "Student Research Scholars", icon: GraduationCap },
      { id: "messages" as DashboardTab, label: `Direct Messages (${messages.length})`, icon: MessageSquare },
      { id: "account" as DashboardTab, label: "Account", icon: Settings },
    ];
  }, [activePersona, messages.length]);

  // Ensure activeTab is valid for current role
  useEffect(() => {
    const validIds = roleTabs.map((t) => t.id);
    if (!validIds.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [activePersona, roleTabs, activeTab]);

  // ── Real-time: fetch + subscribe to mentorship_requests ───────────────────
  const fetchMentorship = useCallback(async () => {
    if (!user) return;
    const userId = user.id;
    const { data, error } = await supabase
      .from("mentorship_requests")
      .select("*")
      .or(`mentor.eq.${userId},mentee.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      const normalized: MentorshipRequest[] = data.map((r) => ({
        id: r.id,
        mentor: r.mentor,
        mentee: r.mentee,
        topic: r.topic,
        message: r.message ?? undefined,
        status: r.status as "pending" | "accepted" | "declined",
        created_at: r.created_at,
      }));
      setMentorshipRequests(normalized);
    }
  }, [user]);

  useEffect(() => {
    void fetchMentorship();
    if (!user) return;
    const channel = supabase
      .channel("rt-mentorship")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentorship_requests" },
        () => { void fetchMentorship(); }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, fetchMentorship]);

  // Posted jobs state
  const [localPostedJobs, setLocalPostedJobs] = useState<LocalPostedJob[]>(getLocalJobs());

  // Submitted referrals state
  const [submittedReferrals, setSubmittedReferrals] = useState<SubmittedReferral[]>(getSavedReferrals());

  // Referral Modal state
  const [activeReferralModalJobId, setActiveReferralModalJobId] = useState<string | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const [attachFolio, setAttachFolio] = useState(true);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

  // Post Job Modal / Drawer state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCompany, setPostCompany] = useState("");
  const [postLocation, setPostLocation] = useState("Bengaluru, India / Hybrid");
  const [postKind, setPostKind] = useState("Full-time");
  const [postCompensation, setPostCompensation] = useState("Competitive Ashwood Band");
  const [postSkills, setPostSkills] = useState("Distributed Systems, C++, Linux");
  const [postQualifications, setPostQualifications] = useState("Bachelor's or Master's in CS / EE from Ashwood.");
  const [postDescription, setPostDescription] = useState("");
  const [postReferralOffered, setPostReferralOffered] = useState(true);

  // All combined jobs
  const allJobs: LocalPostedJob[] = useMemo(() => {
    const defaultMeta: Record<string, { skills: string[]; comp: string }> = {
      "j-anthropic-systems": {
        skills: ["C++", "Rust", "Distributed Systems", "Linux Kernels", "CUDA"],
        comp: "$180,000 – $260,000 + Equity",
      },
      "j-stripe-infrastructure": {
        skills: ["Go", "Distributed Systems", "PostgreSQL", "Docker & K8s"],
        comp: "€95,000 – €140,000",
      },
      "j-synapse-controls": {
        skills: ["C++20", "Control Systems", "Real-Time OS", "Robotics"],
        comp: "₹35,00,000 – ₹55,00,000",
      },
      "j-linear-product": {
        skills: ["TypeScript", "Design Systems", "Web Performance", "React"],
        comp: "$140,000 – $190,000 + Equity",
      },
    };

    const formattedBase: LocalPostedJob[] = rawJobs.map((j) => {
      const meta = defaultMeta[j.id] || {
        skills: ["Computer Systems", "Problem Solving", "Engineering"],
        comp: "Market Competitive",
      };
      return {
        ...j,
        requiredSkills: meta.skills,
        qualifications: "Graduating Ashwood scholar or verified alumni standing.",
        compensation: meta.comp,
        experienceLevel: "All Ashwood Cohorts",
      };
    });

    return [...localPostedJobs, ...formattedBase];
  }, [rawJobs, localPostedJobs]);

  // Skill matching for student
  const studentSkillSet = useMemo(() => {
    return new Set(studentProfile.skills.map((s) => s.name.toLowerCase().trim()));
  }, [studentProfile]);

  const matchedJobs = useMemo(() => {
    return allJobs.map((job) => {
      const totalReq = job.requiredSkills.length;
      const matchedCount = job.requiredSkills.filter((req) => {
        const lower = req.toLowerCase().trim();
        return Array.from(studentSkillSet).some((s) => s.includes(lower) || lower.includes(s));
      }).length;
      const matchScore = totalReq > 0 ? Math.round((matchedCount / totalReq) * 100) : 0;
      return { ...job, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [allJobs, studentSkillSet]);

  const myId = user?.id || (activePersona === "student" ? "student-user" : "current-user");
  const myIds = useMemo(() => new Set<string>([myId, "current-user", "student-user"]), [myId]);

  // Chat partners
  const chatPartners = useMemo(() => {
    const partnerIds = new Set<string>();
    for (const m of messages) {
      if (!myIds.has(m.sender)) partnerIds.add(m.sender);
      if (!myIds.has(m.recipient)) partnerIds.add(m.recipient);
    }
    // Also include top alumni mentors
    people.slice(0, 6).forEach((p) => partnerIds.add(p.id));
    return people.filter((p) => partnerIds.has(p.id));
  }, [messages, people, myIds]);

  const activePartner = useMemo(() => {
    return people.find((p) => p.id === activeChatPartnerId) || chatPartners[0] || people[0] || null;
  }, [people, activeChatPartnerId, chatPartners]);

  const activeConversation = useMemo(() => {
    if (!activePartner) return [];
    return messages.filter(
      (m) =>
        (m.sender === activePartner.id && myIds.has(m.recipient)) ||
        (myIds.has(m.sender) && m.recipient === activePartner.id) ||
        (m.sender === activePartner.id && m.recipient === "current-user") ||
        (m.sender === "current-user" && m.recipient === activePartner.id)
    );
  }, [messages, activePartner, myIds]);

  // Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activePartner) return;
    const body = replyText.trim();
    setReplyText("");

    const myName =
      user?.user_metadata?.full_name ||
      (activePersona === "student"
        ? studentProfile.fullName
        : activePersona === "alumni"
          ? "Dr. Arjun Nair (Alumni)"
          : "Prof. Gayatri Sen (Faculty)");

    await sendUnifiedMessage({
      senderId: myId,
      senderName: myName,
      recipientId: activePartner.id,
      recipientName: activePartner.full_name,
      body,
      simulateAutoReply: true,
    });

    toast.success(`Message dispatched to ${activePartner.full_name}.`);
  };

  const handleVouchCandidate = (referralId: string) => {
    const updated = submittedReferrals.map((r) =>
      r.id === referralId ? { ...r, status: "Vouched & Forwarded" as const } : r
    );
    setSubmittedReferrals(updated);
    saveSubmittedReferrals(updated);
    toast.success("✓ Candidate vouched and dossier forwarded to recruiting team!");
  };

  const handleScheduleInterview = (referralId: string) => {
    const updated = submittedReferrals.map((r) =>
      r.id === referralId ? { ...r, status: "Interview Scheduled" as const } : r
    );
    setSubmittedReferrals(updated);
    saveSubmittedReferrals(updated);
    toast.success("✓ Candidate marked for interview screening.");
  };

  const handleDeclineReferral = (referralId: string) => {
    const updated = submittedReferrals.filter((r) => r.id !== referralId);
    setSubmittedReferrals(updated);
    saveSubmittedReferrals(updated);
    toast.info("Candidate application archived with constructive feedback.");
  };

  const handleAiDraft = () => {
    if (!activePartner) return;
    setIsAiDrafting(true);
    setTimeout(() => {
      setIsAiDrafting(false);
      const partnerFirst = activePartner.full_name.split(" ")[0];
      const draft = `Hello ${partnerFirst},\n\nI hope your work at ${activePartner.company || "your lab"} is progressing well. As a fellow member of the Ashwood network, I am reaching out regarding shared interests in ${activePartner.skills?.[0] || "computational systems"}. I would value 15 minutes of your perspective on career milestones and team openings.\n\nWarm regards,\n${studentProfile.fullName} (Ashwood '25)`;
      setReplyText(draft);
      toast.success("AI Warm Drafter: Contextual introduction compiled from Ashwood register.");
    }, 600);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postCompany.trim()) {
      toast.error("Please provide both a role title and company/institution name.");
      return;
    }

    const newJob: LocalPostedJob = {
      id: `local-job-${Date.now()}`,
      title: postTitle.trim(),
      company: postCompany.trim(),
      location: postLocation.trim(),
      kind: postKind,
      description: postDescription.trim() || "Ashwood verified internal placement opportunity.",
      posted_by: user?.email || "current-user",
      referral_available: postReferralOffered,
      url: null,
      is_sample: false,
      created_at: new Date().toISOString(),
      requiredSkills: postSkills.split(",").map((s) => s.trim()).filter(Boolean),
      qualifications: postQualifications.trim(),
      compensation: postCompensation.trim(),
      experienceLevel: "All Qualified Classes",
    };

    const updated = [newJob, ...localPostedJobs];
    setLocalPostedJobs(updated);
    saveLocalJobs(updated);
    setIsPostModalOpen(false);

    // Reset inputs
    setPostTitle("");
    setPostCompany("");
    setPostDescription("");

    toast.success(`Position "${newJob.title}" published to Ashwood Job Register!`);
    selectTab("posting");
  };

  const handleDispatchReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReferralModalJobId) return;

    const targetJob = allJobs.find((j) => j.id === activeReferralModalJobId);
    if (!targetJob) return;

    setIsSubmittingReferral(true);
    setTimeout(() => {
      setIsSubmittingReferral(false);

      const newReferral: SubmittedReferral = {
        id: `ref-${Date.now()}`,
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        company: targetJob.company,
        candidateName: user?.user_metadata?.full_name || studentProfile.fullName,
        note: referralNote.trim() || "Dispatched via Universal Dashboard",
        folioAttached: attachFolio,
        status: "Vouched & Forwarded",
        submittedAt: "Just now",
      };

      const updated = [newReferral, ...submittedReferrals];
      setSubmittedReferrals(updated);
      saveSubmittedReferrals(updated);

      setActiveReferralModalJobId(null);
      setReferralNote("");
      toast.success(`Referral request for "${targetJob.title}" sent with verified dossier!`);
    }, 600);
  };


  const activeModalJob = allJobs.find((j) => j.id === activeReferralModalJobId);

  return (
    <>
      <PageHead
        index="I."
        eyebrow="Universal Quad · Command Center"
        title={activePersona === "student" ? "Student Dashboard & Folio." : "Collective Campus Dashboard."}
        lede={activePersona === "student"
          ? "Your Student Folio is the main dashboard record. Manage your verified profile, messages, mentorship, opportunities, and account from one workspace."
          : "One shared control surface for students, faculty mentors, and graduated alumni. Manage collegiate inquiries, navigate jobs, publish lab openings, and coordinate advising."}
      />

      <Section className="space-y-8">
        {/* Guest / Demo Notice Banner if not logged in */}
        {!user && (
          <div className="border border-accent/40 bg-accent/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 border border-accent/30 text-accent">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-lg text-foreground font-semibold">Browsing in Interactive Guest Mode</h4>
                <p className="text-xs text-ink-soft">
                  You can explore and test all live messaging, job seeking, and posting tools below. Sign in or click a persona for quick test:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => signInAsDemo("student")}
                className="bg-primary px-3 py-1.5 text-xs text-primary-foreground font-semibold hover:bg-accent cursor-pointer transition-colors"
              >
                Test as Student
              </button>
              <button
                type="button"
                onClick={() => signInAsDemo("faculty")}
                className="border border-rule px-3 py-1.5 text-xs text-foreground hover:border-foreground cursor-pointer transition-colors"
              >
                Test as Faculty
              </button>
              <button
                type="button"
                onClick={() => signInAsDemo("alumni")}
                className="border border-rule px-3 py-1.5 text-xs text-foreground hover:border-foreground cursor-pointer transition-colors"
              >
                Test as Alum
              </button>
              <Link
                to="/auth"
                className="border border-accent px-3 py-1.5 text-xs text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              >
                Full Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Top Bar: Identity & Persona Switcher */}
        <div className="border border-rule bg-paper p-5 sm:p-6 md:flex md:items-center md:justify-between gap-6 space-y-4 md:space-y-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent font-semibold tracking-wider">
                {activePersona.toUpperCase()} WORKSPACE
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {activePersona === "student" && "Undergraduate Cohort · Ashwood '25"}
                {activePersona === "faculty" && "Department of Computer Systems & AI · Senior Fellow"}
                {activePersona === "alumni" && "Alumni Syndicate Member · Industry Referrer"}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {activePersona === "student" && `Welcome, ${studentProfile.fullName}`}
              {activePersona === "faculty" && "Welcome, Prof. Vikramaditya Roy"}
              {activePersona === "alumni" && `Welcome, ${user?.user_metadata?.full_name || "Dr. Arjun Nair"}`}
            </h2>
            <p className="text-xs text-ink-soft">
              Active Session: Verified Ashwood Credential · Semester Term Michaelmas 2026
            </p>
          </div>

          {/* Locked Role Badge — shown when authenticated */}
          {user && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-t md:border-t-0 border-rule pt-3 md:pt-0">
              <span className="eyebrow mr-1 text-[11px]">Workspace:</span>
              <div className="inline-flex items-center gap-1.5 rounded-xs border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs">
                {activePersona === "student" && <GraduationCap className="h-3.5 w-3.5 text-accent" />}
                {activePersona === "faculty" && <Landmark className="h-3.5 w-3.5 text-accent" />}
                {activePersona === "alumni" && <Briefcase className="h-3.5 w-3.5 text-accent" />}
                <span className="font-semibold text-accent uppercase">{activePersona}</span>
                {/* <span className="text-muted-foreground">· Locked to login role</span> */}
              </div>
            </div>
          )}
        </div>

        {/* Quick KPI Cards tailored to perspective */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-rule bg-paper p-4 space-y-1.5 hover:border-foreground transition-colors cursor-pointer" onClick={() => selectTab("messages")}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[10px]">Direct Messages</span>
              <MessageSquare className="h-4 w-4 text-accent" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {messages.length} <span className="text-xs font-mono font-normal text-muted-foreground">threads</span>
            </div>
            <p className="font-mono text-[11px] text-accent flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              2 unread dispatches
            </p>
          </div>

          <div className="border border-rule bg-paper p-4 space-y-1.5 hover:border-foreground transition-colors cursor-pointer" onClick={() => selectTab("seeking")}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[10px]">
                {activePersona === "student" ? "Matched Openings" : "Network Jobs"}
              </span>
              <Target className="h-4 w-4 text-accent" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {allJobs.length} <span className="text-xs font-mono font-normal text-muted-foreground">roles</span>
            </div>
            <p className="font-mono text-[11px] text-ink-soft">
              {activePersona === "student" ? `${matchedJobs.filter((j) => j.matchScore > 50).length} high skill match (>50%)` : `${localPostedJobs.length} posted by you`}
            </p>
          </div>

          <div className="border border-rule bg-paper p-4 space-y-1.5 hover:border-foreground transition-colors cursor-pointer" onClick={() => selectTab("posting")}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[10px]">Active Referrals</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {submittedReferrals.length} <span className="text-xs font-mono font-normal text-muted-foreground">vouched</span>
            </div>
            <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              Verified Dossiers Linked
            </p>
          </div>

          <div className="border border-rule bg-paper p-4 space-y-1.5 hover:border-foreground transition-colors cursor-pointer" onClick={() => selectTab("mentorship")}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="eyebrow text-[10px]">Advising & Office Hours</span>
              <Calendar className="h-4 w-4 text-accent" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {mentorshipRequests.length} <span className="text-xs font-mono font-normal text-muted-foreground">sessions</span>
            </div>
            <p className="font-mono text-[11px] text-ink-soft">
              {openToMentorState ? "Accepting Mentees" : "Calendar Paused"}
            </p>
          </div>
        </div> */}

        {/* Dynamic Role-Based Navigation Tabs */}
        <div className="border-b border-rule">
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2 font-mono text-xs">
            {roleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-semibold transition-colors cursor-pointer ${isActive
                    ? "border-accent text-accent bg-accent/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-rule"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: OVERVIEW & COMMAND FEED */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {activePersona === "student" ? (
              /* STUDENT OVERVIEW */
              <>
                {/* Student Quick Actions Bar */}
                {/* <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => selectTab("seeking")}
                    className="p-4 border border-rule bg-paper hover:border-foreground text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow">Career Pipeline</span>
                      <Target className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <h4 className="font-display text-base font-bold">Browse Matched Jobs</h4>
                    <p className="text-xs text-ink-soft mt-1">
                      Inspect {allJobs.length} roles at Anthropic, Stripe with alumni referrers.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectTab("microtasks")}
                    className="p-4 border border-accent bg-accent/10 hover:bg-accent hover:text-accent-foreground text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow text-accent group-hover:text-accent-foreground">Proof of Work</span>
                      <Award className="h-4 w-4" />
                    </div>
                    <h4 className="font-display text-base font-bold">Microtasks (1 Point Each)</h4>
                    <p className="text-xs text-ink-soft group-hover:text-accent-foreground/80 mt-1">
                      Submit deliverables via Google Drive or file upload for credibility.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectTab("mentorship")}
                    className="p-4 border border-rule bg-paper hover:border-foreground text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow">Alumni Counsel</span>
                      <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <h4 className="font-display text-base font-bold">Book Office Hours</h4>
                    <p className="text-xs text-ink-soft mt-1">
                      Connect 1-on-1 with industry veterans and faculty researchers.
                    </p>
                  </button> */}

                {/* <button
                  type="button"
                  onClick={() => selectTab("folio")}
                  className="p-4 border border-rule bg-paper hover:border-foreground text-left transition-colors group block cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow">Dossier</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                  <h4 className="font-display text-base font-bold">Edit Student Folio</h4>
                  <p className="text-xs text-ink-soft mt-1">
                    Update projects, GPA, resume PDF, and technical skills.
                  </p>
                </button>
              </div> */}

                {/* Split layout: Recent Messages + Recommended Opportunities */}
                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Left Column: Direct Inquiries */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-rule pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-accent" />
                        <h3 className="font-display text-xl font-bold">Recent Inquiries</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectTab("messages")}
                        className="font-mono text-xs text-accent hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Open Messages Hub <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="divide-y divide-rule border border-rule bg-paper">
                      {chatPartners.slice(0, 3).map((partner) => {
                        const lastMsg = messages
                          .filter((m) => m.sender === partner.id || m.recipient === partner.id)
                          .slice(-1)[0];
                        const portrait = getAlumniPortrait(partner.id);

                        return (
                          <div
                            key={partner.id}
                            onClick={() => {
                              setActiveChatPartnerId(partner.id);
                              selectTab("messages");
                            }}
                            className="p-4 hover:bg-accent/5 transition-colors cursor-pointer flex items-start gap-3.5"
                          >
                            {portrait ? (
                              <img src={portrait} alt={partner.full_name} className="h-10 w-10 rounded-full object-cover border border-rule shrink-0" />
                            ) : (
                              <Monogram name={partner.full_name} className="h-10 w-10 text-xs shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-display text-base font-semibold text-foreground truncate">
                                  {partner.full_name}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {partner.company || "Ashwood Lab"}
                                </span>
                              </div>
                              <p className="text-xs text-ink-soft line-clamp-1 mt-0.5">
                                {lastMsg ? lastMsg.body : `Connected on Ashwood Register · ${partner.headline || "Alumnus"}`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Top Matched Opportunities */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-rule pb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-accent" />
                        <h3 className="font-display text-xl font-bold">Top Matched Roles</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectTab("seeking")}
                        className="font-mono text-xs text-accent hover:underline cursor-pointer flex items-center gap-1"
                      >
                        View All {allJobs.length} Roles <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="divide-y divide-rule border border-rule bg-paper">
                      {matchedJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="p-4 flex items-start justify-between gap-4 hover:bg-accent/5 transition-colors">
                          <div className="flex items-start gap-3 min-w-0">
                            <CompanyLogo company={job.company} size="md" className="shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-display text-base font-semibold text-foreground truncate">{job.title}</h4>
                                <span className="font-mono text-[10px] bg-accent/10 text-accent px-1.5 py-0.2 border border-accent/30 font-semibold shrink-0">
                                  {job.matchScore}% Match
                                </span>
                              </div>
                              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                                {job.company} · {job.location || "Remote"} · {job.kind}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveReferralModalJobId(job.id)}
                            className="bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-wider font-semibold hover:bg-accent cursor-pointer transition-colors shrink-0"
                          >
                            Referral
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Referral Requests Tracking */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-rule pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-display text-xl font-bold">Active Referral Pipeline</h3>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {submittedReferrals.length} referrals dispatched with verified portfolio
                    </span>
                  </div>

                  <div className="border border-rule bg-paper overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead className="border-b border-rule font-mono text-[11px] text-muted-foreground uppercase tracking-wider bg-background/50">
                        <tr>
                          <th className="p-3.5">Opportunity</th>
                          <th className="p-3.5">Organization</th>
                          <th className="p-3.5">Candidate Dossier</th>
                          <th className="p-3.5">Vouch Status</th>
                          <th className="p-3.5">Timeline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rule">
                        {submittedReferrals.map((ref) => (
                          <tr key={ref.id} className="hover:bg-accent/5 transition-colors">
                            <td className="p-3.5 font-display text-sm font-semibold text-foreground">{ref.jobTitle}</td>
                            <td className="p-3.5 font-mono text-muted-foreground">{ref.company}</td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                                {ref.candidateName} (Class of '25)
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${ref.status === "Vouched & Forwarded"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : ref.status === "Interview Scheduled"
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                }`}>
                                {ref.status}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-muted-foreground">{ref.submittedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* ALUMNI & FACULTY RECRUITER COMMAND OVERVIEW */
              <>
                {/* Recruiter / Faculty Header & Action Bar */}


                {/* Secondary Split: Microtasks Verification Shortcut + Quick Talent Scout */}
                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Left: Microtasks Review Box */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-rule pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-accent" />
                        <h4 className="font-display text-lg font-bold">Microtask Deliverables & Proof of Work</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectTab("microtasks")}
                        className="font-mono text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Manage All Tasks <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="border border-rule bg-paper p-5 space-y-3">
                      <p className="text-xs text-ink-soft leading-relaxed">
                        Students submit code repositories, Google Drive documents, or zipped build artifacts to prove mastery.
                        Awarding credit gives the student <strong>1 binary credibility point</strong>.
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          Turnaround standard: 48–72 hours
                        </span>
                        <button
                          type="button"
                          onClick={() => selectTab("microtasks")}
                          className="bg-primary text-primary-foreground px-4 py-1.5 font-mono text-xs uppercase font-semibold hover:bg-accent cursor-pointer transition-colors"
                        >
                          Review Deliverables Console →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Featured Candidates from Talent Scout */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-rule pb-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-accent" />
                        <h4 className="font-display text-lg font-bold">Top Verified Talent Pool</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectTab("talent_scout")}
                        className="font-mono text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Full Talent Scout ({SCOUT_STUDENTS.length}) <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="divide-y divide-rule border border-rule bg-paper">
                      {SCOUT_STUDENTS.slice(0, 2).map((scout) => (
                        <div key={scout.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-accent/5 transition-colors">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-display text-sm font-bold text-foreground">{scout.fullName}</h5>
                              <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                                GPA {scout.gpa} · Class of '{scout.gradYear.toString().slice(-2)}
                              </span>
                            </div>
                            <p className="text-xs text-ink-soft line-clamp-1 mt-0.5">{scout.seekingRole}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              selectTab("talent_scout");
                            }}
                            className="border border-rule px-3 py-1 font-mono text-xs text-foreground hover:border-foreground shrink-0 cursor-pointer"
                          >
                            View Folio
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE MESSAGES HUB */}
        {
          activeTab === "messages" && (
            <div className="grid lg:grid-cols-12 border border-rule bg-paper min-h-[550px] animate-in fade-in duration-200">
              {/* Conversations list column */}
              <div className="lg:col-span-4 border-r border-rule flex flex-col">
                <div className="p-4 border-b border-rule bg-background/40 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold">Collegiate Inbox</h3>
                    <span className="eyebrow text-[10px]">Warm Ashwood Threads</span>
                  </div>
                  <button type="button" onClick={() => selectTab("messages")} className="font-mono text-xs text-accent hover:underline flex items-center gap-1">
                    Full Page <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="divide-y divide-rule overflow-y-auto flex-1">
                  {chatPartners.map((partner) => {
                    const isSelected = activePartner?.id === partner.id;
                    const portrait = getAlumniPortrait(partner.id);
                    const lastMsg = messages
                      .filter((m) => m.sender === partner.id || m.recipient === partner.id)
                      .slice(-1)[0];

                    return (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => setActiveChatPartnerId(partner.id)}
                        className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${isSelected ? "bg-accent/15 border-l-3 border-accent" : "hover:bg-accent/5"
                          }`}
                      >
                        {portrait ? (
                          <img src={portrait} alt={partner.full_name} className="h-10 w-10 rounded-full object-cover border border-rule shrink-0" />
                        ) : (
                          <Monogram name={partner.full_name} className="h-10 w-10 text-xs shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-semibold truncate text-foreground">
                              {partner.full_name}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">{partner.company || "Faculty"}</span>
                          </div>
                          <p className="text-xs text-ink-soft line-clamp-1 mt-0.5">
                            {lastMsg ? lastMsg.body : partner.headline || "Ashwood verified fellow"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversation active view column */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                {activePartner ? (
                  <>
                    {/* Chat header */}
                    <div className="p-4 border-b border-rule bg-background/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAlumniPortrait(activePartner.id) ? (
                          <img src={getAlumniPortrait(activePartner.id)!} alt={activePartner.full_name} className="h-10 w-10 rounded-full object-cover border border-rule" />
                        ) : (
                          <Monogram name={activePartner.full_name} className="h-10 w-10 text-xs" />
                        )}
                        <div>
                          <h4 className="font-display text-base font-bold text-foreground">{activePartner.full_name}</h4>
                          <p className="font-mono text-xs text-muted-foreground">
                            {activePartner.role_title || "Fellow"} · {activePartner.company || activePartner.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={handleAiDraft}
                          disabled={isAiDrafting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/15 border border-accent/40 text-accent font-semibold hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {isAiDrafting ? "Drafting..." : "AI Context Drafter"}
                        </button>
                      </div>
                    </div>

                    {/* Messages scroll area */}
                    <div className="p-5 space-y-4 overflow-y-auto max-h-[380px] flex-1">
                      {activeConversation.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="font-display text-lg">No previous dispatches with {activePartner.full_name}.</p>
                          <p className="text-xs text-ink-soft max-w-md mx-auto">
                            Click "AI Context Drafter" above or type below to introduce yourself referencing your academic major and common college bonds.
                          </p>
                        </div>
                      ) : (
                        activeConversation.map((msg) => {
                          const isMine = msg.sender === "current-user";
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                              <div
                                className={`max-w-md p-3.5 text-xs font-sans leading-relaxed ${isMine
                                  ? "bg-primary text-primary-foreground border border-primary"
                                  : "bg-background border border-rule text-foreground"
                                  }`}
                              >
                                <p className="whitespace-pre-line">{msg.body}</p>
                              </div>
                              <span className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                                {isMine ? "You" : activePartner.full_name.split(" ")[0]} · {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message input bar */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-rule bg-background/50 flex gap-2">
                      <input
                        type="text"
                        placeholder={`Message ${activePartner.full_name}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 border border-rule bg-paper px-3.5 py-2 text-xs font-sans focus:border-accent focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" /> Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground font-mono text-xs">
                    Select a contact on the left to review messages.
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* TAB 3: JOB SEEKING & REFERRALS HUB */}
        {
          activeTab === "seeking" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold">Ashwood Verified Opportunities</h3>
                  <p className="text-xs text-ink-soft">
                    Roles submitted by alumni founders, partners, and faculty research heads with direct referral paths.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-rule font-mono text-xs hover:border-foreground"
                  >
                    Full Job Board <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Jobs grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {matchedJobs.map((job) => (
                  <div key={job.id} className="border border-rule bg-paper p-5 flex flex-col justify-between space-y-4 hover:border-foreground transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <CompanyLogo company={job.company} size="lg" className="shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              {job.kind} · {job.location || "Remote"}
                            </span>
                            <h4 className="font-display text-lg font-bold text-foreground leading-snug mt-0.5">{job.title}</h4>
                            <p className="font-sans text-xs text-foreground font-semibold">{job.company}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 bg-accent/15 text-accent border border-accent/30">
                            {job.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                        {job.description || "Exciting role with direct alumni engineering mentorship."}
                      </p>

                      {/* Required Skills tags */}
                      <div className="space-y-1.5 pt-1">
                        <span className="eyebrow text-[10px]">Verified Skills Match:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {job.requiredSkills.map((skill) => {
                            const hasSkill = Array.from(studentSkillSet).some(
                              (s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
                            );
                            return (
                              <span
                                key={skill}
                                className={`font-mono text-[10px] px-2 py-0.5 border ${hasSkill
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold"
                                  : "bg-background text-muted-foreground border-rule"
                                  }`}
                              >
                                {hasSkill && "✓ "}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-rule pt-3.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted-foreground font-medium">
                        {job.compensation}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveReferralModalJobId(job.id)}
                        className="bg-primary text-primary-foreground px-4 py-1.5 text-xs uppercase tracking-wider font-semibold hover:bg-accent transition-colors cursor-pointer"
                      >
                        Request Referral
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* TAB 4: OPPORTUNITY POSTING & RECRUITER HUB */}
        {
          activeTab === "posting" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold">Opportunity Management Console</h3>
                  <p className="text-xs text-ink-soft">
                    Publish openings for your lab, startup, or department. Review candidate dossiers and vouch for fellows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(true)}
                  className="bg-accent text-accent-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Post New Position
                </button>
              </div>

              {/* Candidate Pipeline for Recruiter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-rule pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <h4 className="font-display text-lg font-bold">Candidate Applications & Referral Pipeline</h4>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {submittedReferrals.length} candidates awaiting vouching
                  </span>
                </div>

                <div className="border border-rule bg-paper divide-y divide-rule">
                  {submittedReferrals.map((c) => (
                    <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent/5 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-display text-base font-bold text-foreground">{c.candidateName}</h5>
                          <span className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 border ${c.status === "Vouched & Forwarded"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : c.status === "Interview Scheduled"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          Role: <strong className="text-foreground">{c.jobTitle}</strong> ({c.company}) · Submitted: {c.submittedAt}
                        </p>
                        <p className="text-xs text-ink-soft italic">"{c.note}"</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleVouchCandidate(c.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Vouch & Forward
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScheduleInterview(c.id)}
                          className="border border-rule hover:border-foreground bg-background px-3 py-1.5 font-mono text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Screen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* List of jobs posted by the user */}
              <div className="space-y-4">
                <h4 className="eyebrow">Your Active Listings ({localPostedJobs.length})</h4>

                {localPostedJobs.length === 0 ? (
                  <div className="border border-rule bg-paper p-8 text-center space-y-4">
                    <Briefcase className="h-8 w-8 mx-auto text-accent" />
                    <div className="space-y-1">
                      <h5 className="font-display text-lg font-bold">No Published Listings Yet</h5>
                      <p className="text-xs text-ink-soft max-w-md mx-auto">
                        As a faculty member or alumnus, you can list internships, full-time engineering posts, or lab assistantships directly in the Ashwood Register.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPostModalOpen(true)}
                      className="bg-primary text-primary-foreground px-5 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-accent cursor-pointer transition-colors"
                    >
                      Create First Listing
                    </button>
                  </div>
                ) : (
                  <div className="border border-rule bg-paper divide-y divide-rule">
                    {localPostedJobs.map((job) => (
                      <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-display text-lg font-bold text-foreground">{job.title}</h5>
                            <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 uppercase font-semibold">
                              Active
                            </span>
                          </div>
                          <p className="font-mono text-xs text-muted-foreground">
                            {job.company} · {job.location} · {job.kind} · {job.compensation}
                          </p>
                          <p className="text-xs text-ink-soft line-clamp-1">{job.description}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              toast.info(`Reviewing 3 student applicant dossiers for ${job.title}.`);
                            }}
                            className="border border-rule px-3 py-1.5 font-mono text-xs text-foreground hover:border-foreground cursor-pointer"
                          >
                            Review Applicants (3)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = localPostedJobs.filter((j) => j.id !== job.id);
                              setLocalPostedJobs(updated);
                              saveLocalJobs(updated);
                              toast.success("Listing withdrawn from register.");
                            }}
                            className="border border-destructive/40 text-destructive px-3 py-1.5 font-mono text-xs hover:bg-destructive/10 cursor-pointer"
                          >
                            Close Listing
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* TAB 5: MENTORSHIP & OFFICE HOURS */}
        {
          activeTab === "mentorship" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold">Mentorship & Academic Counsel</h3>
                  <p className="text-xs text-ink-soft">
                    Structured 1-on-1 office hours, Ph.D. proposal reviews, and career coaching across generations.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenToMentorState(!openToMentorState);
                      toast.success(openToMentorState ? "Advising hours marked unavailable." : "Advising hours marked OPEN for mentees.");
                    }}
                    className={`px-3 py-1.5 font-mono text-xs font-semibold border transition-colors cursor-pointer ${openToMentorState
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                      : "border-rule text-muted-foreground"
                      }`}
                  >
                    {openToMentorState ? "✓ Accepting Mentees" : "✕ Calendar Paused"}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab("mentorship")}
                    className="font-mono text-xs border border-rule px-3 py-1.5 hover:border-foreground"
                  >
                    Mentorship Circle <ArrowRight className="h-3 w-3 inline" />
                  </button>
                </div>
              </div>

              {/* Sessions list */}
              <div className="grid md:grid-cols-2 gap-6">
                {mentorshipRequests.map((req) => {
                  const mentorProfile = people.find((p) => p.id === req.mentor);
                  return (
                    <div key={req.id} className="border border-rule bg-paper p-5 space-y-3 hover:border-foreground transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {mentorProfile?.department || "Ashwood Fellowship"}
                        </span>
                        <span className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 border ${req.status === "accepted"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          }`}>
                          {req.status}
                        </span>
                      </div>

                      <h4 className="font-display text-base font-bold text-foreground">{req.topic}</h4>
                      <p className="text-xs text-ink-soft leading-relaxed italic">
                        "{req.message}"
                      </p>

                      <div className="border-t border-rule pt-3 flex items-center justify-between font-mono text-xs">
                        <span className="text-muted-foreground">Mentor: {mentorProfile?.full_name || "Faculty Lead"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`Session link confirmed with ${mentorProfile?.full_name}. Calendar invite synchronized.`);
                          }}
                          className="text-accent hover:underline font-semibold cursor-pointer"
                        >
                          Join Office Hours →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        }

        {/* TAB: MICROTASKS & PROOF OF WORK */}
        {activeTab === "microtasks" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MicrotasksManager
              rolePerspective={activePersona}
              title={
                activePersona === "student"
                  ? "Student Microtasks & Deliverables"
                  : activePersona === "alumni"
                    ? "Alumni Commissioned Work & Student Deliverables"
                    : "Faculty Research Microtasks & Reviews"
              }
              description={
                activePersona === "student"
                  ? "Claim microtasks from alumni and submit deliverables via Google Drive or file upload to earn 1 binary credibility point per verified task."
                  : "Assign work to students with specific deliverable requirements. Verified completions award 1 binary credibility point to the student."
              }
            />
          </div>
        )}

        {/* TAB 6: DOSSIER & CREDENTIALS HUB (STUDENT) */}
        {activeTab === "folio" && <StudentProfilePage />}

        {/* TAB: TALENT SCOUT & STUDENT FOLIOS (ALUMNI & FACULTY) */}
        {activeTab === "talent_scout" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold">
                  {activePersona === "alumni"
                    ? "Student Talent Scout & Dossier Explorer"
                    : "Student Research Scholars & Fellowship Candidates"}
                </h3>
                <p className="text-xs text-ink-soft">
                  Direct access to verified Ashwood engineering, AI, and design fellows. Review GPA, thesis work, and initiate outreach.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 bg-accent/10 text-accent border border-accent/30 font-semibold">
                  {SCOUT_STUDENTS.length} Verified Candidates
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {SCOUT_STUDENTS.map((scout) => (
                <div key={scout.id} className="border border-rule bg-paper p-5 flex flex-col justify-between space-y-4 hover:border-foreground transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-lg font-bold text-foreground">{scout.fullName}</h4>
                          <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.2 font-semibold">
                            Class of '{scout.gradYear.toString().slice(-2)}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">
                          {scout.department} · <strong className="text-foreground">GPA {scout.gpa}</strong>
                        </p>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 bg-background border border-rule text-muted-foreground">
                        {scout.projects} Repositories
                      </span>
                    </div>

                    <p className="font-mono text-xs text-accent font-medium">
                      Target Role: {scout.seekingRole}
                    </p>

                    <p className="text-xs text-ink-soft leading-relaxed italic bg-background/50 p-2.5 border-l-2 border-accent">
                      Thesis / Capstone: "{scout.thesis}"
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <span className="eyebrow text-[10px]">Verified Skills & Stack:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {scout.skills.map((skill) => (
                          <span
                            key={skill}
                            className="font-mono text-[10px] px-2 py-0.5 bg-background border border-rule text-foreground font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-rule pt-3.5 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Dossier Verified by Ashwood Registrar
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target = chatPartners[0];
                          if (target) setActiveChatPartnerId(target.id);
                          selectTab("messages");
                        }}
                        className="bg-primary text-primary-foreground px-3 py-1.5 text-xs uppercase tracking-wider font-semibold hover:bg-accent cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" /> Message Candidate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "account" && <AccountPage />}
      </Section >

      {/* MODAL: REQUEST REFERRAL */}
      {
        activeReferralModalJobId && activeModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow text-accent">Alumni Internal Referral</span>
                  <h3 className="font-display text-2xl font-bold mt-0.5">
                    Request Referral for {activeModalJob.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {activeModalJob.company} · {activeModalJob.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReferralModalJobId(null)}
                  className="text-muted-foreground hover:text-foreground font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDispatchReferral} className="mt-5 space-y-4">
                <div className="border border-rule bg-paper p-3.5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachFolio}
                      onChange={(e) => setAttachFolio(e.target.checked)}
                      className="accent-[var(--accent)] h-4 w-4 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-foreground font-semibold">
                      Attach my verified Student Folio & Resume
                    </span>
                  </label>
                  {attachFolio && (
                    <div className="pl-6 font-mono text-[11px] text-muted-foreground space-y-0.5">
                      <p>Candidate: <strong>{studentProfile.fullName}</strong> (Ashwood Class of {studentProfile.gradYear})</p>
                      <p>Dossier: Verified coursework, GPA, and {studentProfile.projects.length} repository projects</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="eyebrow block mb-1">Introduction & Statement of Fit</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain why you are interested in this team, your relevant experience with the required tech stack, and graduation timeline..."
                    value={referralNote}
                    onChange={(e) => setReferralNote(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                  <button
                    type="button"
                    onClick={() => setActiveReferralModalJobId(null)}
                    className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReferral}
                    className="bg-primary px-6 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReferral ? "Dispatching..." : "Send Referral Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* MODAL: POST OPPORTUNITY */}
      {
        isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow text-accent">Ashwood Opportunity Register</span>
                  <h3 className="font-display text-2xl font-bold mt-0.5">Publish New Opportunity</h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Available to students, recent alumni, and faculty researchers across the network.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="mt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="eyebrow block mb-1">Position Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Systems Engineer"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-1">Organization / Lab *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anthropic, Ashwood OS Lab"
                      value={postCompany}
                      onChange={(e) => setPostCompany(e.target.value)}
                      className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="eyebrow block mb-1">Opportunity Type</label>
                    <select
                      value={postKind}
                      onChange={(e) => setPostKind(e.target.value)}
                      className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                    >
                      <option value="Full-time">Full-time Position</option>
                      <option value="Internship">Summer / Fall Internship</option>
                      <option value="Research Fellowship">Research Fellowship / Grant</option>
                      <option value="Lab Assistant">Undergraduate Lab Assistant</option>
                      <option value="Co-op">Co-op Placement</option>
                    </select>
                  </div>
                  <div>
                    <label className="eyebrow block mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India / Remote"
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="eyebrow block mb-1">Compensation / Stipend</label>
                    <input
                      type="text"
                      placeholder="e.g. Competitive Band / Research Stipend"
                      value={postCompensation}
                      onChange={(e) => setPostCompensation(e.target.value)}
                      className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-1">Required Skills (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rust, Linux, Distributed Systems"
                      value={postSkills}
                      onChange={(e) => setPostSkills(e.target.value)}
                      className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Description & Qualifications</label>
                  <textarea
                    rows={3}
                    placeholder="Outline the responsibilities, project scope, and what you're looking for in Ashwood applicants..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full border border-rule bg-paper p-2.5 text-xs focus:border-accent focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="referralCheck"
                    checked={postReferralOffered}
                    onChange={(e) => setPostReferralOffered(e.target.checked)}
                    className="accent-[var(--accent)] h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="referralCheck" className="text-xs text-foreground cursor-pointer font-medium">
                    Offer direct internal referrals / vouching for verified students
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary px-6 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </>
  );
}
