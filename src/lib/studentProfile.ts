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
    level: "Advanced" | "Proficient" | "Familiar";
    category: "Languages" | "Systems & Cloud" | "AI & ML" | "Frontend & Design" | "Tools & Theory";
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

const STORAGE_KEY = "ashwood_student_profile_v1";

export function getStudentProfile(): StudentProfileData {
  if (typeof window === "undefined") return DEFAULT_STUDENT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT_PROFILE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfileData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("student_profile_updated", { detail: profile }));
  } catch (err) {
    console.error("Failed to save student profile", err);
  }
}
