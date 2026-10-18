import type { User } from "@supabase/supabase-js";

type ProfileRole = "student" | "faculty" | "alumni" | "admin";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  impactMetrics?: string;
  featured?: boolean;
}

export interface StudentResume {
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  fileUrl?: string;
  summaryNote?: string;
}

export type SkillLevel = "Advanced" | "Proficient" | "Familiar";
export type SkillCategory = "Languages" | "Systems & Cloud" | "AI & ML" | "Frontend & Design" | "Tools & Theory";

export interface StudentProfileData {
  id: string;
  fullName: string;
  department: string;
  degree: string;
  gradYear: number;
  gpa?: string;
  city: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  email: string;
  github?: string;
  linkedin?: string;
  portfolioUrl?: string;
  resume?: StudentResume | null;
  skills: {
    name: string;
    level: SkillLevel;
    category: SkillCategory;
  }[];
  projects: Project[];
  coursework: string[];
  researchThesis?: string;
  seeking: {
    internship: boolean;
    fullTime: boolean;
    researchFellowship: boolean;
    referrals: boolean;
    targetRoles: string[];
    preferredLocations: string[];
    availableFrom: string;
  };
}

export const DEFAULT_STUDENT_PROFILE: StudentProfileData = {
  id: "student-dev-sharma",
  fullName: "Dev Sharma",
  department: "Computer Science & Engineering",
  degree: "B.Tech. Honours in Computer Science",
  gradYear: 2026,
  gpa: "3.92 / 4.00 · Dean's List (2023, 2024, 2025)",
  city: "Ashwood Campus · New Delhi, India",
  headline: "Junior CS Undergraduate · Distributed Systems, GPU Scheduling & High-Performance Runtimes",
  bio: "Pre-final year undergraduate passionate about low-latency storage systems, concurrent data structures, and Linux kernel execution models. Looking for Summer 2026 systems engineering internships and alumni technical mentors.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  email: "dev.sharma@ashwood.edu",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  portfolioUrl: "https://ashwood.edu/~dsharma",
  resume: {
    fileName: "Dev_Sharma_Ashwood_Resume_2026.pdf",
    fileSize: "284 KB",
    fileType: "application/pdf",
    uploadedAt: "2026-03-12T09:30:00Z",
    summaryNote: "Comprehensive 1-page academic & technical CV detailing systems projects, GPA, and publications.",
  },
  skills: [
    { name: "Rust", level: "Advanced", category: "Languages" },
    { name: "C++20", level: "Advanced", category: "Languages" },
    { name: "Go", level: "Proficient", category: "Languages" },
    { name: "Python", level: "Advanced", category: "Languages" },
    { name: "Linux Kernels", level: "Proficient", category: "Systems & Cloud" },
    { name: "Distributed Systems", level: "Advanced", category: "Systems & Cloud" },
    { name: "CUDA", level: "Proficient", category: "Systems & Cloud" },
    { name: "Docker & K8s", level: "Proficient", category: "Systems & Cloud" },
    { name: "PostgreSQL", level: "Advanced", category: "Systems & Cloud" },
    { name: "PyTorch", level: "Familiar", category: "AI & ML" },
    { name: "Distributed Storage", level: "Advanced", category: "Systems & Cloud" },
    { name: "Compiler Design", level: "Familiar", category: "Tools & Theory" },
    { name: "Concurrency Primitives", level: "Advanced", category: "Tools & Theory" },
    { name: "Git & Linux Profiling (perf, eBPF)", level: "Advanced", category: "Tools & Theory" },
  ],
  projects: [
    {
      id: "p-raft-kv",
      title: "Vesper: High-Throughput Raft Distributed KV Store",
      tagline: "Zero-dependency consensus-backed key-value store built in modern Rust",
      description:
        "Designed and implemented a distributed storage cluster utilizing the Raft consensus protocol. Features Write-Ahead Logging (WAL), snapshotting, automatic leader election, and non-blocking asynchronous pipelining via Tokio. Successfully validated partition tolerance under network chaos using Jepsen tests.",
      technologies: ["Rust", "Tokio", "gRPC", "Protobuf", "Raft", "eBPF"],
      liveUrl: "https://github.com",
      githubUrl: "https://github.com",
      impactMetrics: "Benchmarked at 54,000 req/sec with < 4.2ms p99 write latency across 5 node topologies.",
      featured: true,
    },
    {
      id: "p-gpu-sched",
      title: "TensorStream: Micro-Kernel GPU Workload Orchestrator",
      tagline: "Lightweight userspace scheduler optimizing PCIe-to-HBM transfer queues",
      description:
        "Built a userspace CUDA memory pool and stream scheduler designed to prevent pipeline stalls during large tensor matmul passes. Intercepts memory allocation requests to enforce predictable memory reuse and minimizes CPU-GPU synchronization bottlenecks.",
      technologies: ["C++20", "CUDA", "Linux perf", "CMake"],
      liveUrl: "https://github.com",
      githubUrl: "https://github.com",
      impactMetrics: "Reduces memory fragmentation by 32% and accelerates batched inference passes by 18%.",
      featured: true,
    },
    {
      id: "p-ashwood-compiler",
      title: "Onyx: Static Bytecode Compiler & Virtual Machine",
      tagline: "Stack-based bytecode VM with register allocation and SSA optimization passes",
      description:
        "Engineered a recursive descent parser, lexer, AST generator, and register-allocated SSA intermediate representation pass for an imperative typed scripting language. Includes a custom garbage-collected virtual machine runtime.",
      technologies: ["Rust", "Compilers", "LLVM IR", "x86-64 Asm"],
      liveUrl: "https://github.com",
      githubUrl: "https://github.com",
      impactMetrics: "Executes microbenchmarks within 1.4x of native compiled C binaries.",
      featured: false,
    },
  ],
  coursework: [
    "CS 401: Advanced Operating Systems Internals",
    "CS 420: Distributed Consensus & Fault Tolerance",
    "CS 350: Compiler Optimization & Runtime Design",
    "CS 310: Computer Architecture & Memory Subsystems",
    "MA 210: Linear Algebra & Matrix Decompositions",
    "CS 204: Algorithms & Concrete Data Structures",
  ],
  researchThesis: "Lock-Free Collective Communication Primitives in Heterogeneous Distributed Compute Nodes",
  seeking: {
    internship: true,
    fullTime: false,
    researchFellowship: true,
    referrals: true,
    targetRoles: [
      "Distributed Systems Engineer",
      "Systems Infrastructure Intern",
      "GPU Runtime & Storage Engineer",
      "Kernel Software Engineer",
    ],
    preferredLocations: ["Bengaluru", "San Francisco / Bay Area", "London", "Remote"],
    availableFrom: "May 2026 (Summer Fellowship / Internship)",
  },
};

const GUEST_STORAGE_KEY = "ashwood_student_profile_v1";
const ONBOARD_PREFIX = "ashwood_onboarded_v1_";

export const STUDENT_PROFILE_UPDATED_EVENT = "student_profile_updated";

function profileStorageKey(userId?: string | null) {
  return userId ? `${GUEST_STORAGE_KEY}_${userId}` : GUEST_STORAGE_KEY;
}

export function createBlankStudentProfile(
  partial: Partial<StudentProfileData> = {},
): StudentProfileData {
  return {
    id: partial.id || `student-${Date.now()}`,
    fullName: partial.fullName || "",
    department: partial.department || "",
    degree: partial.degree || "",
    gradYear: partial.gradYear || new Date().getFullYear() + 1,
    gpa: partial.gpa,
    city: partial.city || "",
    headline: partial.headline || "",
    bio: partial.bio || "",
    avatarUrl: partial.avatarUrl,
    email: partial.email || "",
    github: partial.github,
    linkedin: partial.linkedin,
    portfolioUrl: partial.portfolioUrl,
    resume: partial.resume ?? null,
    skills: partial.skills || [],
    projects: partial.projects || [],
    coursework: partial.coursework || [],
    researchThesis: partial.researchThesis,
    seeking: partial.seeking || {
      internship: true,
      fullTime: false,
      researchFellowship: false,
      referrals: true,
      targetRoles: [],
      preferredLocations: [],
      availableFrom: "",
    },
  };
}

export function getStudentProfile(userId?: string | null): StudentProfileData {
  if (typeof window === "undefined") {
    return userId ? createBlankStudentProfile({ id: userId }) : DEFAULT_STUDENT_PROFILE;
  }
  try {
    const raw = localStorage.getItem(profileStorageKey(userId));
    if (!raw) {
      return userId ? createBlankStudentProfile({ id: userId }) : DEFAULT_STUDENT_PROFILE;
    }
    return JSON.parse(raw) as StudentProfileData;
  } catch {
    return userId ? createBlankStudentProfile({ id: userId }) : DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfileData, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(profileStorageKey(userId), JSON.stringify(profile));
    window.dispatchEvent(
      new CustomEvent(STUDENT_PROFILE_UPDATED_EVENT, { detail: { profile, userId } }),
    );
  } catch (err) {
    console.error("Failed to save student profile", err);
  }
}

export function isOnboarded(userId?: string | null): boolean {
  if (typeof window === "undefined" || !userId) return false;
  return localStorage.getItem(`${ONBOARD_PREFIX}${userId}`) === "1";
}

export function markOnboarded(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${ONBOARD_PREFIX}${userId}`, "1");
}

export function metadataFullName(user: User | null | undefined): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const candidates = [meta.full_name, meta.name, meta.display_name];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const emailName = user.email?.split("@")[0]?.replace(/[._-]+/g, " ");
  return emailName ? titleCaseName(emailName) : "";
}

export function getDisplayName(
  user: User | null | undefined,
  role: ProfileRole,
  studentProfile?: StudentProfileData,
): string {
  if (role === "student") {
    const fromProfile = studentProfile?.fullName?.trim();
    if (fromProfile) return fromProfile;
  }
  const fromMeta = metadataFullName(user);
  if (fromMeta) return fromMeta;
  return studentProfile?.fullName?.trim() || "";
}

export function needsOnboarding(user: User | null | undefined, _role?: ProfileRole): boolean {
  if (!user) return false;
  return !isOnboarded(user.id);
}

function titleCaseName(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
