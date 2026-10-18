export interface Profile {
  id: string;
  full_name: string;
  headline: string | null;
  role_title: string | null;
  company: string | null;
  department: string | null;
  degree: string | null;
  grad_year: number | null;
  city: string | null;
  bio: string | null;
  skills: string[];
  open_to_mentor: boolean;
  linkedin: string | null;
  is_sample: boolean;
  created_at: string;
}

export interface Job {
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
}

export interface Microtask {
  id: string;
  title: string;
  description: string | null;
  hours: number | null;
  status: "open" | "claimed" | "completed";
  posted_by: string | null;
  claimed_by: string | null;
  is_sample: boolean;
  created_at: string;
  submission_url?: string;
  submission_file_name?: string;
  submission_file_size?: string;
  submission_note?: string;
  submitted_at?: string;
}

export interface Fund {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  sort: number;
  is_sample: boolean;
}

export interface Update {
  id: string;
  title: string;
  category: string;
  body: string;
  created_at: string;
  is_sample: boolean;
}

export interface Connection {
  id: string;
  requester: string;
  addressee: string;
  status: string;
  created_at: string;
  points?: number;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  body: string;
  created_at: string;
  is_ai_drafted?: boolean;
}

export interface MentorshipRequest {
  id: string;
  mentor: string;
  mentee: string;
  topic: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "completed";
  created_at: string;
}

export const MOCK_PROFILES: Profile[] = [
  {
    id: "p-arjun-nair",
    full_name: "Dr. Arjun Nair",
    headline: "Principal Systems Architect at Anthropic · Distributed GPU Scheduling",
    role_title: "Principal Systems Architect",
    company: "Anthropic",
    department: "Computer Science & Engineering",
    degree: "B.Tech. Honours, Class of 2012",
    grad_year: 2012,
    city: "San Francisco, USA",
    bio: "Working on low-latency cluster orchestration and large-scale model runtime kernels. Formerly Staff Engineer at Google Brain and maintainer of open-source CUDA collectives. Proud former member of the Ashwood Robotics Society.",
    skills: ["Distributed Systems", "Rust", "CUDA", "Linux Kernels", "Compiler Design"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "p-priya-ramanathan",
    full_name: "Priya Ramanathan",
    headline: "VP of Product at Stripe · Identity & Trust Infrastructure",
    role_title: "VP of Product",
    company: "Stripe",
    department: "Economics & Public Policy",
    degree: "B.A. Economics, Class of 2014",
    grad_year: 2014,
    city: "London, UK",
    bio: "Leading international regulatory compliance and merchant identity systems across 45+ jurisdictions. Passionate about financial inclusion, payments architecture, and mentoring first-generation college graduates.",
    skills: ["Product Strategy", "Fintech", "Regulatory Engineering", "Organizational Design", "Venture Investing"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-01-18T12:30:00Z",
  },
  {
    id: "p-dev-mehta",
    full_name: "Dev Mehta",
    headline: "Founding Engineer & CTO at Synapse Robotics · Ex-ISRO Guidance Systems",
    role_title: "Co-Founder & CTO",
    company: "Synapse Robotics",
    department: "Mechanical Sciences",
    degree: "B.Tech. Mechanical Engineering, Class of 2017",
    grad_year: 2017,
    city: "Bengaluru, India",
    bio: "Building autonomous sub-millimeter surgical robotics. Previously spent 4 years at ISRO designing telemetry control surfaces for cryogenic upper stages. Active angel investor in hardware & aerospace deep-tech.",
    skills: ["Control Systems", "Computer Vision", "Embedded C++", "Hardware Design", "Kinematics"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-01T09:15:00Z",
  },
  {
    id: "p-aanya-iyer",
    full_name: "Dr. Aanya Iyer",
    headline: "Senior Scientist in Structural Biology at Oxford BioMed & Francis Crick",
    role_title: "Senior Research Scientist",
    company: "Oxford BioMed",
    department: "Biophysics & Molecular Biology",
    degree: "Ph.D. Molecular Biophysics, Class of 2015",
    grad_year: 2015,
    city: "Oxford, UK",
    bio: "Specializing in cryo-EM structure determination of membrane receptors for neurodegenerative therapeutics. Co-author of 18 Nature and Cell papers. Always happy to chat with students considering PhDs in biosciences.",
    skills: ["Cryo-EM", "Protein Engineering", "Python", "Drug Discovery", "Structural Biology"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-05T14:20:00Z",
  },
  {
    id: "p-rohan-sen",
    full_name: "Rohan Sen",
    headline: "Managing Director at Sequoia Capital India & Southeast Asia",
    role_title: "Managing Director",
    company: "Peak XV Partners",
    department: "Economics & Public Policy",
    degree: "B.A. Honours Economics, Class of 2008",
    grad_year: 2008,
    city: "Singapore",
    bio: "Early-stage investor in developer tools, fintech, and cross-border SaaS. Served on the Ashwood Student Union board (2007) and currently chairs the Ashwood College Student Hardship Trust.",
    skills: ["Venture Capital", "Growth Strategy", "Cap Table Economics", "B2B SaaS", "Board Governance"],
    open_to_mentor: false,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-10T11:00:00Z",
  },
  {
    id: "p-kavita-sharma",
    full_name: "Kavita Sharma",
    headline: "Staff Machine Learning Engineer at DeepMind · Reinforcement Learning",
    role_title: "Staff Research Engineer",
    company: "Google DeepMind",
    department: "Computer Science & Engineering",
    degree: "M.Tech. Computer Science, Class of 2018",
    grad_year: 2018,
    city: "London, UK",
    bio: "Focusing on sample-efficient reinforcement learning and alignment in frontier reasoning agents. Regular reviewer for NeurIPS and ICML. Lover of analog synthesizers and campus debating.",
    skills: ["PyTorch", "Reinforcement Learning", "LLM Alignment", "Statistical Modeling", "Distributed Training"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-12T16:45:00Z",
  },
  {
    id: "p-vikram-choudhury",
    full_name: "Vikram Choudhury",
    headline: "Head of Infrastructure at Zerodha · Scaled High-Frequency Architecture",
    role_title: "Head of Infrastructure",
    company: "Zerodha",
    department: "Computer Science & Engineering",
    degree: "B.Tech. Computer Science, Class of 2016",
    grad_year: 2016,
    city: "Bengaluru, India",
    bio: "Directing the bare-metal core systems processing 15M+ retail orders daily. Advocate for zero-dependency architectures, PostgreSQL tuning, and open-source computing. Former Ashwood Linux User Group lead.",
    skills: ["High Performance Computing", "Go", "PostgreSQL", "Network Engineering", "Linux SysOps"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-14T08:30:00Z",
  },
  {
    id: "p-tara-deshmukh",
    full_name: "Tara Deshmukh",
    headline: "Design Director at Linear · Crafting Digital Tools & Workflows",
    role_title: "Design Director",
    company: "Linear",
    department: "Literature & Visual Studies",
    degree: "B.A. Visual Arts & Media, Class of 2019",
    grad_year: 2019,
    city: "Zurich, Switzerland",
    bio: "Obsessed with keyboard-first ergonomics, micro-interactions, typography, and precision desktop software design. Former design lead at Figma and Notion. Mentor for young designers entering tech.",
    skills: ["Design Systems", "Product Design", "Typography", "Figma", "Interaction Design"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-20T17:10:00Z",
  },
  {
    id: "p-kabir-alva",
    full_name: "Kabir Alva",
    headline: "Partner at Latham & Watkins · Technology M&A & Antitrust Counsel",
    role_title: "Partner",
    company: "Latham & Watkins",
    department: "Economics & Public Policy",
    degree: "B.A. Political Science & Jurisprudence, Class of 2010",
    grad_year: 2010,
    city: "New York, USA",
    bio: "Advising multinational technology conglomerates and sovereign wealth funds on cross-border acquisitions and regulatory investigations. Ashwood Debating Society President (2009).",
    skills: ["Antitrust Law", "Cross-border M&A", "Corporate Governance", "Negotiation", "IP Licensing"],
    open_to_mentor: false,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-22T19:00:00Z",
  },
  {
    id: "p-meera-bose",
    full_name: "Meera Bose",
    headline: "Staff Hardware Architect at Apple Silicon · Low-Power NPU Subsystems",
    role_title: "Staff Hardware Architect",
    company: "Apple",
    department: "Electrical & Computer Engineering",
    degree: "B.Tech. Electrical Engineering, Class of 2013",
    grad_year: 2013,
    city: "Cupertino, USA",
    bio: "Designing energy-proportional neural engine architectures and tensor execution pipelines for on-device inference. Holder of 9 US patents. Avid classical pianist and Ashwood music society alumna.",
    skills: ["Verilog/Chisel", "ASIC Design", "Computer Architecture", "Static Timing Analysis", "VLSI"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-02-25T11:20:00Z",
  },
  {
    id: "p-aditya-kapoor",
    full_name: "Aditya Kapoor",
    headline: "Co-Founder & CEO at Verve Climate · Carbon Removal Verification",
    role_title: "Co-Founder & CEO",
    company: "Verve Climate",
    department: "Civil & Environmental Engineering",
    degree: "B.Tech. Civil & Environmental, Class of 2020",
    grad_year: 2020,
    city: "Berlin, Germany",
    bio: "Building satellite radar and spectroscopic soil monitoring systems for high-durability carbon credits. Raised $14M Series A backed by Breakthrough Energy and Lowercarbon Capital.",
    skills: ["Climate Tech", "Remote Sensing", "Fundraising", "GIS", "Life Cycle Assessment"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-03-01T13:40:00Z",
  },
  {
    id: "p-simran-kaur",
    full_name: "Simran Kaur",
    headline: "Senior Quantitative Researcher at Citadel Securities · Algorithmic Trading",
    role_title: "Senior Quantitative Researcher",
    company: "Citadel Securities",
    department: "Mathematics & Computing",
    degree: "Integrated M.Sc. Applied Mathematics, Class of 2021",
    grad_year: 2021,
    city: "Chicago, USA",
    bio: "Developing stochastic volatility models and high-frequency automated execution strategies for global fixed income markets. Ashwood Math Olympiad medal recipient (2019).",
    skills: ["Stochastic Calculus", "C++20", "Time-Series Econometrics", "Statistical Arbitrage", "Python"],
    open_to_mentor: true,
    linkedin: "https://linkedin.com",
    is_sample: true,
    created_at: "2024-03-04T09:00:00Z",
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "j-1",
    title: "Member of Technical Staff — Distributed Training Frameworks",
    company: "Anthropic",
    location: "San Francisco, CA (Hybrid)",
    kind: "Full-time",
    description: "Looking for an engineer experienced in high-throughput interconnects (NCCL, RoCEv2), PyTorch kernel development, and distributed checkpointing at cluster scale. Happy to provide personal internal referrals for Ashwood graduates.",
    posted_by: "p-arjun-nair",
    referral_available: true,
    url: "https://anthropic.com/careers",
    is_sample: true,
    created_at: "2024-03-05T10:00:00Z",
  },
  {
    id: "j-2",
    title: "Product Manager — Merchant Identity & Trust Protocols",
    company: "Stripe",
    location: "London, UK or Dublin, Ireland",
    kind: "Full-time",
    description: "Lead zero-friction verification systems across EMEA and APAC. Strong background in data modeling, developer APIs, or financial regulations required. Direct mentorship and referral review provided.",
    posted_by: "p-priya-ramanathan",
    referral_available: true,
    url: "https://stripe.com/jobs",
    is_sample: true,
    created_at: "2024-03-02T14:30:00Z",
  },
  {
    id: "j-3",
    title: "Robotics Motion Planning & Control Systems Engineer",
    company: "Synapse Robotics",
    location: "Bengaluru, India (On-site)",
    kind: "Full-time",
    description: "Join our founding core team building precision micro-actuation systems for robotic laparoscopy. We want engineers who build physical things with love, rigorous kinematics, and robust safety margins.",
    posted_by: "p-dev-mehta",
    referral_available: true,
    url: "https://synapserobotics.com",
    is_sample: true,
    created_at: "2024-02-28T11:15:00Z",
  },
  {
    id: "j-4",
    title: "Research Scientist — Foundation Model Alignment",
    company: "Google DeepMind",
    location: "London, UK (Hybrid)",
    kind: "Full-time",
    description: "Drive novel empirical techniques for reinforcement learning from human and algorithmic feedback. Strong theoretical grasp of RL, game theory, and multi-turn conversational optimization expected.",
    posted_by: "p-kavita-sharma",
    referral_available: true,
    url: "https://deepmind.google/careers",
    is_sample: true,
    created_at: "2024-02-24T16:00:00Z",
  },
  {
    id: "j-5",
    title: "Senior Core Infrastructure Systems Engineer",
    company: "Zerodha",
    location: "Bengaluru, India (Flexible)",
    kind: "Full-time",
    description: "Zero external cloud bloat. We manage our own bare-metal racks, custom network fabrics, and hyper-optimized relational clusters. If you love clean systems, low memory footprints, and high performance, write to us.",
    posted_by: "p-vikram-choudhury",
    referral_available: true,
    url: "https://zerodha.com/careers",
    is_sample: true,
    created_at: "2024-02-20T09:40:00Z",
  },
  {
    id: "j-6",
    title: "Summer Quantitative Research Fellow (2025)",
    company: "Citadel Securities",
    location: "Chicago, IL or New York, NY",
    kind: "Internship",
    description: "10-week summer research fellowship open to pre-final year and graduate students in Math, Physics, CS, and EE. Includes dedicated mentorship from senior portfolio researchers, competitive stipend, and housing.",
    posted_by: "p-simran-kaur",
    referral_available: true,
    url: "https://citadelsecurities.com/careers",
    is_sample: true,
    created_at: "2024-02-15T12:00:00Z",
  },
  {
    id: "j-7",
    title: "Staff Product Designer — Core Workflows",
    company: "Linear",
    location: "Remote (Global / EMEA & US Eastern)",
    kind: "Full-time",
    description: "Linear is seeking an exceptional designer who obsesses over software feel, craft, speed, and simplicity. We write thoughtful specs, test in code, and care deeply about toolmakers' dignity.",
    posted_by: "p-tara-deshmukh",
    referral_available: true,
    url: "https://linear.app/careers",
    is_sample: true,
    created_at: "2024-02-10T15:20:00Z",
  },
  {
    id: "j-8",
    title: "Climate Geospatial Data Science Intern",
    company: "Verve Climate",
    location: "Berlin, Germany (Remote friendly)",
    kind: "Internship",
    description: "Analyze multi-spectral Sentinel and PlanetScope imagery to model soil organic carbon variation. Ideal for current Ashwood students or recent graduates with Python, GDAL, and statistical geography skills.",
    posted_by: "p-aditya-kapoor",
    referral_available: false,
    url: "https://verveclimate.com",
    is_sample: true,
    created_at: "2024-02-05T13:10:00Z",
  },
];

export const MOCK_MICROTASKS: Microtask[] = [
  {
    id: "t-1",
    title: "Architecture & Code Review for Student Compiler Project",
    description: "Review a 1,200-line LLVM frontend written by Ashwood undergraduates building an experimental typed dialect. Provide architectural feedback on AST representation and register allocation.",
    hours: 2,
    status: "open",
    posted_by: "p-arjun-nair",
    claimed_by: null,
    is_sample: true,
    created_at: "2024-03-06T10:00:00Z",
  },
  {
    id: "t-2",
    title: "Fintech Pitch Deck Teardown for Student Founders",
    description: "Offer a rigorous 45-minute critique of an Ashwood student team's cross-border remittance seed deck before their first angel meetings.",
    hours: 1,
    status: "claimed",
    posted_by: "p-priya-ramanathan",
    claimed_by: "p-dev-mehta",
    is_sample: true,
    created_at: "2024-03-04T12:00:00Z",
  },
  {
    id: "t-3",
    title: "Benchmarking Bare-Metal NVMe Throughput on Linux Kernel 6.8",
    description: "Run synthetic FIO workloads and compare latency curves against custom storage daemons on an Ubuntu workstation. Perfect for a systems student looking for hands-on Linux experience.",
    hours: 3,
    status: "open",
    posted_by: "p-vikram-choudhury",
    claimed_by: null,
    is_sample: true,
    created_at: "2024-03-01T15:30:00Z",
  },
  {
    id: "t-4",
    title: "Bioinformatics Pipeline Script Verification (AlphaFold & ColabFold)",
    description: "Help an Ashwood biochemistry research group verify their automated MSA generation bash and Python wrappers for high-throughput docking runs.",
    hours: 2,
    status: "completed",
    posted_by: "p-aanya-iyer",
    claimed_by: "p-kavita-sharma",
    is_sample: true,
    created_at: "2024-02-25T11:00:00Z",
  },
  {
    id: "t-5",
    title: "Design Critique: Portfolio Audit for Aspiring UI Designers",
    description: "Provide line-by-line constructive design feedback on typographic rhythm, layout hierarchy, and case study clarity for 2 junior design candidates.",
    hours: 2,
    status: "open",
    posted_by: "p-tara-deshmukh",
    claimed_by: null,
    is_sample: true,
    created_at: "2024-02-20T14:15:00Z",
  },
  {
    id: "t-6",
    title: "Mock Technical Interview: Fixed-Income Quantitative Modeling",
    description: "Conduct a 60-minute technical drill covering probability theory, martingale pricing basics, and linear algebra for a student interviewing at market-making firms.",
    hours: 1,
    status: "open",
    posted_by: "p-simran-kaur",
    claimed_by: null,
    is_sample: true,
    created_at: "2024-02-18T16:00:00Z",
  },
  {
    id: "t-7",
    title: "Hardware Telemetry Data Parser in Modern C++",
    description: "Write a zero-allocation binary frame unpacker for CAN-bus telemetry packets coming from robotic joint sensors. Great portfolio exercise.",
    hours: 4,
    status: "claimed",
    posted_by: "p-dev-mehta",
    claimed_by: "p-arjun-nair",
    is_sample: true,
    created_at: "2024-02-12T09:30:00Z",
  },
  {
    id: "t-8",
    title: "Patent Prior-Art Search & Summary for Climate Tech Catalyst",
    description: "Synthesize 5 existing international patent filings covering electrochemical direct-air capture contacting towers into a 2-page brief.",
    hours: 3,
    status: "open",
    posted_by: "p-aditya-kapoor",
    claimed_by: null,
    is_sample: true,
    created_at: "2024-02-08T17:45:00Z",
  },
];

export const MOCK_FUNDS: Fund[] = [
  {
    id: "f-1",
    name: "The First-Generation Scholar Endowment",
    slug: "first-generation-scholars",
    summary: "Guarantees comprehensive tuition, laptop grants, and living stipends for brilliant students from rural and non-traditional backgrounds who are the first in their lineage to attend Ashwood.",
    goal_amount: 15000000,
    raised_amount: 11450000,
    currency: "INR",
    sort: 1,
    is_sample: true,
  },
  {
    id: "f-2",
    name: "Old Quadrangle & Arched Cloister Restoration",
    slug: "quad-restoration",
    summary: "Preserving the 1887 hand-carved stone arches, oak lecture hall benches, and stained-glass memorial windows of the main administrative quad.",
    goal_amount: 8000000,
    raised_amount: 5200000,
    currency: "INR",
    sort: 2,
    is_sample: true,
  },
  {
    id: "f-3",
    name: "Undergraduate Research & Travel Fellowship",
    slug: "undergraduate-travel",
    summary: "Disburses direct flight and conference grants for students accepted to present original research papers at major international symposiums (NeurIPS, ICSE, Nature Conferences).",
    goal_amount: 4500000,
    raised_amount: 4120000,
    currency: "INR",
    sort: 3,
    is_sample: true,
  },
  {
    id: "f-4",
    name: "The Emergency Student Hardship Relief Fund",
    slug: "student-hardship",
    summary: "A rapid-disbursal reserve allocated within 48 hours to any active student experiencing sudden medical emergency, bereavement, or housing insecurity.",
    goal_amount: 3000000,
    raised_amount: 2850000,
    currency: "INR",
    sort: 4,
    is_sample: true,
  },
];

export const MOCK_UPDATES: Update[] = [
  {
    id: "u-1",
    title: "Ashwood Roboticists win First Place at Zurich Micro-Surgery Trials",
    category: "Campus & Research",
    body: "A collaborative student-alumni cohort spearheaded by the Ashwood Robotics Society took the prestigious Gold Laureate at the International Surgical Robotics Trials in Zurich. Their multi-articulated catheter navigated complex simulated coronary vasculature with zero vessel trauma.",
    created_at: "2024-03-01T10:00:00Z",
    is_sample: true,
  },
  {
    id: "u-2",
    title: "Class of 2014 Decennial Reunion Scheduled for Autumn Quad Convocation",
    category: "Reunions & Gatherings",
    body: "Ten years since walking down the Great Hall aisle, the Class of 2014 will gather this October on the North Lawn. Activities include an inter-departmental debating debate, cloister dinner, and dedication of the newly endowed Maker Laboratory.",
    created_at: "2024-02-22T14:30:00Z",
    is_sample: true,
  },
  {
    id: "u-3",
    title: "Dr. Aanya Iyer ('15) Awarded Royal Society Biophysics Fellowship",
    category: "Alumni in Focus",
    body: "Alumna Dr. Aanya Iyer has been appointed a Royal Society University Research Fellow for her foundational discoveries in determining the high-resolution architecture of orphan GPCR complexes using novel cryo-electron microscopy algorithms.",
    created_at: "2024-02-14T09:15:00Z",
    is_sample: true,
  },
  {
    id: "u-4",
    title: "The Ashwood Letter: Spring Dispatch on Campus Renewal & Endowment Growth",
    category: "Endowment",
    body: "Our annual endowment stewardship report reveals a 14.2% annualized return across sustainable infrastructure assets, allowing the Board of Governors to freeze undergraduate tuition for the fourth consecutive academic session.",
    created_at: "2024-02-02T11:00:00Z",
    is_sample: true,
  },
  {
    id: "u-5",
    title: "New Maker Pavilion Groundbreaking on East Cloister Gardens",
    category: "Campus & Research",
    body: "Construction began this week on a 14,000 sq ft multidisciplinary facility featuring 5-axis CNC machining, micro-electronics clean-rooms, and wet-lab benches open 24/7 to all enrolled students and visiting alumni fellows.",
    created_at: "2024-01-20T16:40:00Z",
    is_sample: true,
  },
  {
    id: "u-6",
    title: "Alumni Mentorship Circle reaches 500 active matches across 22 countries",
    category: "Alumni in Focus",
    body: "Over five hundred undergraduates have now completed structured 1-on-1 mentorship cycles with senior alumni working across frontier computing, clinical medicine, aerospace, and public policy.",
    created_at: "2024-01-10T12:00:00Z",
    is_sample: true,
  },
];

export const MOCK_CONNECTIONS: Connection[] = [
  { id: "c-1", requester: "p-arjun-nair", addressee: "p-priya-ramanathan", status: "accepted", created_at: "2023-05-10T00:00:00Z", points: 8 },
  { id: "c-2", requester: "p-arjun-nair", addressee: "p-kavita-sharma", status: "accepted", created_at: "2023-06-12T00:00:00Z", points: 12 },
  { id: "c-3", requester: "p-arjun-nair", addressee: "p-vikram-choudhury", status: "accepted", created_at: "2023-07-01T00:00:00Z", points: 15 },
  { id: "c-4", requester: "p-dev-mehta", addressee: "p-arjun-nair", status: "accepted", created_at: "2023-08-15T00:00:00Z", points: 9 },
  { id: "c-5", requester: "p-dev-mehta", addressee: "p-meera-bose", status: "accepted", created_at: "2023-09-20T00:00:00Z", points: 11 },
  { id: "c-6", requester: "p-priya-ramanathan", addressee: "p-rohan-sen", status: "accepted", created_at: "2023-04-18T00:00:00Z", points: 14 },
  { id: "c-7", requester: "p-priya-ramanathan", addressee: "p-kabir-alva", status: "accepted", created_at: "2023-05-22T00:00:00Z", points: 7 },
  { id: "c-8", requester: "p-kavita-sharma", addressee: "p-simran-kaur", status: "accepted", created_at: "2023-11-10T00:00:00Z", points: 10 },
  { id: "c-9", requester: "p-tara-deshmukh", addressee: "p-priya-ramanathan", status: "accepted", created_at: "2023-10-05T00:00:00Z", points: 6 },
  { id: "c-10", requester: "p-tara-deshmukh", addressee: "p-vikram-choudhury", status: "accepted", created_at: "2023-12-01T00:00:00Z", points: 5 },
  { id: "c-11", requester: "p-aanya-iyer", addressee: "p-kavita-sharma", status: "accepted", created_at: "2023-07-14T00:00:00Z", points: 8 },
  { id: "c-12", requester: "p-aditya-kapoor", addressee: "p-dev-mehta", status: "accepted", created_at: "2023-08-29T00:00:00Z", points: 7 },
  { id: "c-13", requester: "p-rohan-sen", addressee: "p-dev-mehta", status: "accepted", created_at: "2023-09-02T00:00:00Z", points: 13 },
  { id: "c-14", requester: "p-meera-bose", addressee: "p-arjun-nair", status: "accepted", created_at: "2023-10-18T00:00:00Z", points: 16 },
  { id: "c-15", requester: "p-simran-kaur", addressee: "p-rohan-sen", status: "accepted", created_at: "2024-01-05T00:00:00Z", points: 9 },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "p-arjun-nair",
    recipient: "current-user",
    body: "Hi! Great to see another Ashwood alum interested in distributed systems. I read your note on kernel bypass networking — would love to trade notes on our upcoming cluster migration when you have a moment.",
    created_at: "2024-03-05T14:20:00Z",
    is_ai_drafted: false,
  },
  {
    id: "m-2",
    sender: "current-user",
    recipient: "p-arjun-nair",
    body: "Dr. Nair, thank you so much for reaching out! Your work on GPU memory virtualization at Anthropic has been a huge inspiration for our student research team here at Ashwood.",
    created_at: "2024-03-05T15:10:00Z",
    is_ai_drafted: false,
  },
  {
    id: "m-3",
    sender: "p-priya-ramanathan",
    recipient: "current-user",
    body: "Hello! Always delighted to support fellow Ashwood graduates making the transition into product leadership. Are you free for a 30-min call next Thursday morning London time?",
    created_at: "2024-03-04T11:00:00Z",
    is_ai_drafted: true,
  },
  {
    id: "m-4",
    sender: "p-dev-mehta",
    recipient: "current-user",
    body: "Hey! Saw your PR for the hardware telemetry parser microtask. Clean logic on the endianness handling. Mind hopping on a quick call to talk about a full-time opening with our robotics team in Bengaluru?",
    created_at: "2024-03-02T16:30:00Z",
    is_ai_drafted: false,
  },
];

export interface NotableAlumnus {
  profileId: string;
  distinction: string;
  accolade: string;
  photo: "arjun-nair" | "priya-ramanathan" | "aanya-iyer" | null;
}

export interface AlumniEvent {
  id: string;
  title: string;
  kind: "reunion" | "meetup" | "workshop" | "campus";
  when: string;
  where: string;
  status: "upcoming" | "past";
  summary: string;
  highlights: string[];
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  body: string;
}

export interface Society {
  id: string;
  name: string;
  kind: "society" | "chapter";
  founded: number;
  members: number;
  summary: string;
  alumniIds: string[];
}

export interface CompanyChapter {
  id: string;
  company: string;
  industry: string;
  alumniCount: number;
  cities: string[];
  summary: string;
  alumniIds: string[];
}

export const MOCK_NOTABLE: NotableAlumnus[] = [
  {
    profileId: "p-arjun-nair",
    distinction: "Frontier Computing",
    accolade: "Principal Systems Architect at Anthropic. Formerly Staff Engineer at Google Brain.",
    photo: "arjun-nair",
  },
  {
    profileId: "p-priya-ramanathan",
    distinction: "Industry Leadership",
    accolade: "VP of Product at Stripe, leading identity and trust infrastructure across 45 jurisdictions.",
    photo: "priya-ramanathan",
  },
  {
    profileId: "p-aanya-iyer",
    distinction: "Science & Research",
    accolade: "Royal Society Fellow. Senior Scientist at Oxford BioMed and the Francis Crick Institute.",
    photo: "aanya-iyer",
  },
];

export const MOCK_EVENTS: AlumniEvent[] = [
  {
    id: "e-1",
    title: "Annual Alumni Meet on the North Lawn",
    kind: "meetup",
    when: "2026-12-23T12:00:00Z",
    where: "Main Quadrangle, Ashwood College",
    status: "upcoming",
    summary:
      "A full day of batch photographs, cloister supper, and conversations with faculty. Open to every class year — bring a classmate you have not seen since convocation.",
    highlights: [
      "Networking sessions across industry and research",
      "Keynotes from notable alumni",
      "Workshops on mentorship and career paths",
    ],
  },
  {
    id: "e-2",
    title: "Class of 2014 Decennial Reunion",
    kind: "reunion",
    when: "2026-10-18T12:00:00Z",
    where: "Great Hall & East Cloister",
    status: "upcoming",
    summary:
      "Ten years since walking the aisle. Inter-departmental debate, dedication of the Maker Laboratory, and dinner under the arched cloister.",
    highlights: [
      "Class photograph on the North Lawn",
      "Dedication of the Maker Laboratory",
      "Cloister dinner with faculty",
    ],
  },
  {
    id: "e-3",
    title: "Mentorship Mixer — Students meet the register",
    kind: "workshop",
    when: "2026-11-08T12:00:00Z",
    where: "Old Library Reading Room",
    status: "upcoming",
    summary:
      "Structured 20-minute conversations between current students and alumni who have offered an hour. No pitches; just attention.",
    highlights: [
      "Matched 1:1 conversations",
      "Open office hours with industry mentors",
      "Follow-up via the mentorship desk",
    ],
  },
  {
    id: "e-4",
    title: "Silver Jubilee — Batch of 2000",
    kind: "reunion",
    when: "2025-12-27T12:00:00Z",
    where: "Vice-Chancellor's Lodge lawns",
    status: "past",
    summary:
      "Twenty-five years on, the class of 2000 returned from India and abroad. The Vice-Chancellor briefed alumni on campus renewal and asked them to keep mentoring.",
    highlights: [
      "Campus walkthrough of new laboratories",
      "Peer professional roundtables",
      "Endowment briefing",
    ],
  },
  {
    id: "e-5",
    title: "The Ashwood Letter — Newsletter launch gathering",
    kind: "campus",
    when: "2025-09-12T12:00:00Z",
    where: "College Press Room",
    status: "past",
    summary:
      "First public reading of the monthly dispatch: campus appointments, alumni stories, and quiet notes from the archive.",
    highlights: [
      "Monthly digital letter",
      "Invitations to reunions and webinars",
      "Career and mentorship notices",
    ],
  },
];

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "ms-1",
    year: "1887",
    title: "The college is founded",
    body: "Ashwood opens its gates. The first register is a leather volume of forty-three names.",
  },
  {
    id: "ms-2",
    year: "1924",
    title: "Alumni Association chartered",
    body: "Graduates form a formal association to keep the conversation going past convocation — dinners, bursaries, and letters home.",
  },
  {
    id: "ms-3",
    year: "1971",
    title: "First overseas chapter",
    body: "London alumni host the first foreign chapter supper. San Francisco and Singapore follow within a decade.",
  },
  {
    id: "ms-4",
    year: "2012",
    title: "Student Hardship Trust endowed",
    body: "A rapid-disbursal reserve is created so no student leaves for want of a term's rent or a medical bill.",
  },
  {
    id: "ms-5",
    year: "2019",
    title: "Public alumni register goes online",
    body: "The directory, jobs board, and mentorship desk move onto a shared ledger — funded, as at many peer colleges, by alumni gifts.",
  },
  {
    id: "ms-6",
    year: "2024",
    title: "Mentorship Circle reaches 500 matches",
    body: "Five hundred undergraduates complete structured cycles with alumni across computing, medicine, aerospace, and public policy.",
  },
  {
    id: "ms-7",
    year: "2026",
    title: "Maker Pavilion groundbreaking",
    body: "A 14,000 sq ft workshop with CNC, clean-rooms, and wet labs opens to students and visiting alumni fellows.",
  },
];

export const MOCK_SOCIETIES: Society[] = [
  {
    id: "soc-robotics",
    name: "Ashwood Robotics Society",
    kind: "society",
    founded: 1998,
    members: 86,
    summary:
      "Student–alumni cohort behind the Zurich Micro-Surgery gold. Weekly build nights, summer internships at Synapse and ISRO alumni labs.",
    alumniIds: ["p-dev-mehta", "p-arjun-nair", "p-meera-bose"],
  },
  {
    id: "soc-debate",
    name: "Ashwood Debating Society",
    kind: "society",
    founded: 1902,
    members: 124,
    summary:
      "The oldest continuous society on campus. Moot courts, inter-college unions, and a long line of counsel and policy alumni.",
    alumniIds: ["p-kabir-alva", "p-priya-ramanathan", "p-rohan-sen"],
  },
  {
    id: "soc-lug",
    name: "Linux User Group",
    kind: "society",
    founded: 2004,
    members: 67,
    summary:
      "Kernel nights, FIO benches, and a allergy to unnecessary cloud. Home of systems engineers now at Zerodha, Anthropic, and Apple.",
    alumniIds: ["p-vikram-choudhury", "p-arjun-nair", "p-kavita-sharma"],
  },
  {
    id: "soc-music",
    name: "College Music Society",
    kind: "society",
    founded: 1911,
    members: 58,
    summary:
      "Chamber evenings in the chapel and analog-synth jams in the east cellar. Alumni still return for the Advent concert.",
    alumniIds: ["p-meera-bose", "p-kavita-sharma", "p-tara-deshmukh"],
  },
  {
    id: "soc-maths",
    name: "Mathematical Society",
    kind: "society",
    founded: 1894,
    members: 71,
    summary:
      "Olympiad training, reading groups in stochastic calculus, and a quiet pipeline into research and market-making.",
    alumniIds: ["p-simran-kaur", "p-kavita-sharma", "p-rohan-sen"],
  },
  {
    id: "soc-arts",
    name: "Visual Arts & Media Circle",
    kind: "society",
    founded: 1968,
    members: 49,
    summary:
      "Typography, editorial layout, and the college press. Alumni now at Linear, Figma, and independent studios.",
    alumniIds: ["p-tara-deshmukh", "p-priya-ramanathan"],
  },
];

export const MOCK_COMPANIES: CompanyChapter[] = [
  {
    id: "co-anthropic",
    company: "Anthropic",
    industry: "Frontier AI",
    alumniCount: 4,
    cities: ["San Francisco"],
    summary: "Systems, kernels, and cluster orchestration. A small but loud cluster of Ashwood computer scientists.",
    alumniIds: ["p-arjun-nair"],
  },
  {
    id: "co-stripe",
    company: "Stripe",
    industry: "Fintech",
    alumniCount: 6,
    cities: ["London", "Dublin", "Bengaluru"],
    summary: "Payments, identity, and merchant trust. Product and regulatory alumni across EMEA.",
    alumniIds: ["p-priya-ramanathan"],
  },
  {
    id: "co-apple",
    company: "Apple",
    industry: "Hardware",
    alumniCount: 5,
    cities: ["Cupertino", "Munich"],
    summary: "Silicon, NPUs, and low-power inference. Electrical engineering's quiet pride.",
    alumniIds: ["p-meera-bose"],
  },
  {
    id: "co-deepmind",
    company: "Google DeepMind",
    industry: "Research",
    alumniCount: 3,
    cities: ["London"],
    summary: "Reinforcement learning and alignment. Regular NeurIPS reviewers among the class lists.",
    alumniIds: ["p-kavita-sharma"],
  },
  {
    id: "co-zerodha",
    company: "Zerodha",
    industry: "Markets infrastructure",
    alumniCount: 7,
    cities: ["Bengaluru"],
    summary: "Bare-metal trading systems. The Linux User Group's favourite employer.",
    alumniIds: ["p-vikram-choudhury"],
  },
  {
    id: "co-peakxv",
    company: "Peak XV Partners",
    industry: "Venture capital",
    alumniCount: 2,
    cities: ["Singapore", "Bengaluru"],
    summary: "Early-stage investing in developer tools, fintech, and cross-border SaaS.",
    alumniIds: ["p-rohan-sen"],
  },
  {
    id: "co-citadel",
    company: "Citadel Securities",
    industry: "Quantitative trading",
    alumniCount: 3,
    cities: ["Chicago", "New York"],
    summary: "Stochastic models and high-frequency execution. A home for the Mathematical Society.",
    alumniIds: ["p-simran-kaur"],
  },
  {
    id: "co-linear",
    company: "Linear",
    industry: "Product design",
    alumniCount: 2,
    cities: ["Zurich", "Remote"],
    summary: "Keyboard-first software craft. Visual Arts alumni who never left the drawing board.",
    alumniIds: ["p-tara-deshmukh"],
  },
  {
    id: "co-synapse",
    company: "Synapse Robotics",
    industry: "Surgical robotics",
    alumniCount: 8,
    cities: ["Bengaluru"],
    summary: "Founded by Ashwood mechanical scientists. Internships reserved for the Robotics Society.",
    alumniIds: ["p-dev-mehta"],
  },
  {
    id: "co-verve",
    company: "Verve Climate",
    industry: "Climate tech",
    alumniCount: 3,
    cities: ["Berlin"],
    summary: "Satellite soil carbon. Civil & environmental alumni building the verification stack.",
    alumniIds: ["p-aditya-kapoor"],
  },
];

export const MOCK_MENTORSHIP_REQUESTS: MentorshipRequest[] = [
  {
    id: "mr-1",
    mentor: "p-arjun-nair",
    mentee: "current-user",
    topic: "Transitioning from Systems Research to Industry Infrastructure Engineering",
    message: "Seeking advice on navigating high-scale systems architecture interviews and selecting between compiler research and distributed storage roles.",
    status: "accepted",
    created_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "mr-2",
    mentor: "p-tara-deshmukh",
    mentee: "current-user",
    topic: "Crafting a Design Systems Portfolio with Editorial Typography",
    message: "Would love your guidance on presenting micro-interactions and desktop keyboard UX in my senior year design portfolio.",
    status: "pending",
    created_at: "2024-03-04T09:30:00Z",
  },
];
