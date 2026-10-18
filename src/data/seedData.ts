/**
 * NSUT ARCHIVE — Synthetic Seed Universe
 * Generates 28 authentic profiles (16 Alumni, 10 Students, 2 Admins),
 * initial graph edges with pre-computed anti-collusion Dijkstra weights,
 * bounties, submissions, and messages.
 */

import { Profile, GraphEdge, Bounty, TaskSubmission, Message, SpatialGraphData } from '../types/database';
import { calculateDijkstraWeight } from './nsutTaxonomy';

/**
 * 28 Canonical Profiles
 */
export const SEED_PROFILES: Profile[] = [
  // ─── 16 ALUMNI ───
  {
    id: "usr-alum-01",
    role: "alumni",
    full_name: "Rajeev Suri",
    headline: "Ex-CEO @ Nokia | Board Director",
    branch: "Electronics and Communication Engineering",
    grad_year: 1989,
    current_company: "Nokia",
    current_city: "London, UK",
    experience_history: [
      { company: "Nokia", title: "Chief Executive Officer", start_year: 2014, end_year: 2020 },
      { company: "Nokia Siemens Networks", title: "CEO", start_year: 2009, end_year: 2014 },
      { company: "Inmarsat", title: "CEO", start_year: 2021, end_year: 2023 }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/rajeevsuri",
    bounty_points: 5,
    distinct_alumni_count: 5,
    onboarding_completed: true,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z"
  },
  {
    id: "usr-alum-02",
    role: "alumni",
    full_name: "Naveen Tewari",
    headline: "Founder & CEO @ InMobi Group",
    branch: "Manufacturing Processes and Automation Engineering",
    grad_year: 2000,
    current_company: "InMobi",
    current_city: "Bengaluru, India",
    experience_history: [
      { company: "InMobi", title: "Founder & CEO", start_year: 2007, end_year: null },
      { company: "McKinsey & Company", title: "Business Analyst", start_year: 2000, end_year: 2003 }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/naveentewari",
    bounty_points: 4,
    distinct_alumni_count: 4,
    onboarding_completed: true,
    created_at: "2024-01-12T09:00:00Z",
    updated_at: "2024-01-12T09:00:00Z"
  },
  {
    id: "usr-alum-03",
    role: "alumni",
    full_name: "Aman Gupta",
    headline: "Co-Founder & CMO @ boAt Lifestyle",
    branch: "Computer Engineering",
    grad_year: 2002,
    current_company: "boAt",
    current_city: "New Delhi, India",
    experience_history: [
      { company: "boAt", title: "Co-Founder & CMO", start_year: 2016, end_year: null },
      { company: "Harman International", title: "Director Sales", start_year: 2012, end_year: 2016 }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/amanguptaboat",
    bounty_points: 4,
    distinct_alumni_count: 4,
    onboarding_completed: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "usr-alum-04",
    role: "alumni",
    full_name: "Rohan Verma",
    headline: "Staff Software Engineer @ Google Cloud",
    branch: "Computer Engineering",
    grad_year: 2015,
    current_company: "Google",
    current_city: "Mountain View, USA",
    experience_history: [
      { company: "Google", title: "Staff Software Engineer", start_year: 2021, end_year: null },
      { company: "Amazon", title: "Senior SDE", start_year: 2017, end_year: 2021 },
      { company: "Directi", title: "Platform Engineer", start_year: 2015, end_year: 2017 }
    ],
    github_url: "https://github.com/rohanverma-nsut",
    linkedin_url: "https://linkedin.com/in/rohanverma-cloud",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-01-18T11:00:00Z",
    updated_at: "2024-01-18T11:00:00Z"
  },
  {
    id: "usr-alum-05",
    role: "alumni",
    full_name: "Pooja Sharma",
    headline: "Principal Product Manager @ Microsoft Azure",
    branch: "Information Technology",
    grad_year: 2016,
    current_company: "Microsoft",
    current_city: "Redmond, USA",
    experience_history: [
      { company: "Microsoft", title: "Principal Product Manager", start_year: 2022, end_year: null },
      { company: "Microsoft", title: "Senior PM", start_year: 2018, end_year: 2022 },
      { company: "Flipkart", title: "Associate PM", start_year: 2016, end_year: 2018 }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/poojasharma-pm",
    bounty_points: 2,
    distinct_alumni_count: 2,
    onboarding_completed: true,
    created_at: "2024-01-20T12:00:00Z",
    updated_at: "2024-01-20T12:00:00Z"
  },
  {
    id: "usr-alum-06",
    role: "alumni",
    full_name: "Tanvi Mehta",
    headline: "Staff Infrastructure Engineer @ Stripe",
    branch: "Computer Engineering",
    grad_year: 2017,
    current_company: "Stripe",
    current_city: "San Francisco, USA",
    experience_history: [
      { company: "Stripe", title: "Staff Infrastructure Engineer", start_year: 2022, end_year: null },
      { company: "Uber", title: "Senior Software Engineer", start_year: 2019, end_year: 2022 },
      { company: "Tower Research Capital", title: "Systems Engineer", start_year: 2017, end_year: 2019 }
    ],
    github_url: "https://github.com/tanvimehta-systems",
    linkedin_url: "https://linkedin.com/in/tanvimehta-infra",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-01-22T13:00:00Z",
    updated_at: "2024-01-22T13:00:00Z"
  },
  {
    id: "usr-alum-07",
    role: "alumni",
    full_name: "Dr. Ananya Roy",
    headline: "Research Scientist @ Google DeepMind",
    branch: "Mathematics and Computing",
    grad_year: 2016,
    current_company: "Google DeepMind",
    current_city: "London, UK",
    experience_history: [
      { company: "Google DeepMind", title: "Research Scientist", start_year: 2021, end_year: null },
      { company: "Oxford University", title: "Postdoctoral Fellow in ML", start_year: 2019, end_year: 2021 }
    ],
    github_url: "https://github.com/ananyaroy-research",
    linkedin_url: "https://linkedin.com/in/ananyaroy-ai",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-01-25T14:00:00Z",
    updated_at: "2024-01-25T14:00:00Z"
  },
  {
    id: "usr-alum-08",
    role: "alumni",
    full_name: "Siddharth Jain",
    headline: "Quantitative Strategist @ Tower Research Capital",
    branch: "Mathematics and Computing",
    grad_year: 2019,
    current_company: "Tower Research Capital",
    current_city: "Gurugram, India",
    experience_history: [
      { company: "Tower Research Capital", title: "Quantitative Strategist", start_year: 2021, end_year: null },
      { company: "Goldman Sachs", title: "Quant Analyst", start_year: 2019, end_year: 2021 }
    ],
    github_url: "https://github.com/siddharth-quant",
    linkedin_url: "https://linkedin.com/in/siddharthjain-quant",
    bounty_points: 4,
    distinct_alumni_count: 4,
    onboarding_completed: true,
    created_at: "2024-01-28T15:00:00Z",
    updated_at: "2024-01-28T15:00:00Z"
  },
  {
    id: "usr-alum-09",
    role: "alumni",
    full_name: "Karan Malhotra",
    headline: "Senior SDE @ Apple | GPU Driver Architect",
    branch: "Computer Engineering",
    grad_year: 2018,
    current_company: "Apple",
    current_city: "Cupertino, USA",
    experience_history: [
      { company: "Apple", title: "Senior GPU Architect", start_year: 2022, end_year: null },
      { company: "NVIDIA", title: "Systems Software Engineer", start_year: 2018, end_year: 2022 }
    ],
    github_url: "https://github.com/karanm-gpu",
    linkedin_url: "https://linkedin.com/in/karanmalhotra-apple",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z"
  },
  {
    id: "usr-alum-10",
    role: "alumni",
    full_name: "Sneha Kapoor",
    headline: "Engineering Manager @ Uber Marketplace",
    branch: "Information Technology",
    grad_year: 2017,
    current_company: "Uber",
    current_city: "Amsterdam, Netherlands",
    experience_history: [
      { company: "Uber", title: "Engineering Manager", start_year: 2023, end_year: null },
      { company: "Uber", title: "Senior SDE", start_year: 2019, end_year: 2023 },
      { company: "Zomato", title: "Software Engineer", start_year: 2017, end_year: 2019 }
    ],
    github_url: "https://github.com/snehakapoor-uber",
    linkedin_url: "https://linkedin.com/in/snehakapoor-tech",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-02-03T11:00:00Z",
    updated_at: "2024-02-03T11:00:00Z"
  },
  {
    id: "usr-alum-11",
    role: "alumni",
    full_name: "Vikram Sethi",
    headline: "Co-Founder & CTO @ Fintech YC W22",
    branch: "Computer Engineering",
    grad_year: 2019,
    current_company: "Razorpay",
    current_city: "Bengaluru, India",
    experience_history: [
      { company: "YC Startup", title: "Co-Founder & CTO", start_year: 2022, end_year: null },
      { company: "Razorpay", title: "Payments Architect", start_year: 2019, end_year: 2022 }
    ],
    github_url: "https://github.com/vikramsethi-dev",
    linkedin_url: "https://linkedin.com/in/vikramsethi-cto",
    bounty_points: 2,
    distinct_alumni_count: 2,
    onboarding_completed: true,
    created_at: "2024-02-05T12:00:00Z",
    updated_at: "2024-02-05T12:00:00Z"
  },
  {
    id: "usr-alum-12",
    role: "alumni",
    full_name: "Rhea Sen",
    headline: "Senior Autonomous Robotics Engineer @ Tesla",
    branch: "Instrumentation and Control Engineering",
    grad_year: 2018,
    current_company: "Texas Instruments",
    current_city: "Austin, USA",
    experience_history: [
      { company: "Texas Instruments", title: "Senior Embedded Engineer", start_year: 2022, end_year: null },
      { company: "Maruti Suzuki", title: "Robotics Automation Lead", start_year: 2018, end_year: 2022 }
    ],
    github_url: "https://github.com/rheasen-robotics",
    linkedin_url: "https://linkedin.com/in/rheasen-auto",
    bounty_points: 2,
    distinct_alumni_count: 2,
    onboarding_completed: true,
    created_at: "2024-02-08T13:00:00Z",
    updated_at: "2024-02-08T13:00:00Z"
  },
  {
    id: "usr-alum-13",
    role: "alumni",
    full_name: "Aditya Khurana",
    headline: "Partner @ McKinsey & Company",
    branch: "Mechanical Engineering",
    grad_year: 2010,
    current_company: "McKinsey & Company",
    current_city: "New Delhi, India",
    experience_history: [
      { company: "McKinsey & Company", title: "Partner", start_year: 2019, end_year: null },
      { company: "BCG", title: "Principal", start_year: 2014, end_year: 2019 }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/adityakhurana-consulting",
    bounty_points: 4,
    distinct_alumni_count: 4,
    onboarding_completed: true,
    created_at: "2024-02-10T14:00:00Z",
    updated_at: "2024-02-10T14:00:00Z"
  },
  {
    id: "usr-alum-14",
    role: "alumni",
    full_name: "Divya Nambiar",
    headline: "Vice President @ Goldman Sachs Global Markets",
    branch: "Computer Engineering",
    grad_year: 2015,
    current_company: "Goldman Sachs",
    current_city: "New York, USA",
    experience_history: [
      { company: "Goldman Sachs", title: "Vice President", start_year: 2021, end_year: null },
      { company: "Goldman Sachs", title: "Associate", start_year: 2017, end_year: 2021 },
      { company: "Morgan Stanley", title: "Technology Analyst", start_year: 2015, end_year: 2017 }
    ],
    github_url: "https://github.com/divyanambiar-fin",
    linkedin_url: "https://linkedin.com/in/divyanambiar-gs",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-02-12T15:00:00Z",
    updated_at: "2024-02-12T15:00:00Z"
  },
  {
    id: "usr-alum-15",
    role: "alumni",
    full_name: "Harshit Singhal",
    headline: "Compiler Engineer @ NVIDIA CUDA Team",
    branch: "Computer Engineering",
    grad_year: 2020,
    current_company: "NVIDIA",
    current_city: "Santa Clara, USA",
    experience_history: [
      { company: "NVIDIA", title: "Compiler Engineer", start_year: 2022, end_year: null },
      { company: "Qualcomm", title: "Software Engineer", start_year: 2020, end_year: 2022 }
    ],
    github_url: "https://github.com/harshits-compiler",
    linkedin_url: "https://linkedin.com/in/harshitsinghal-cuda",
    bounty_points: 2,
    distinct_alumni_count: 2,
    onboarding_completed: true,
    created_at: "2024-02-14T16:00:00Z",
    updated_at: "2024-02-14T16:00:00Z"
  },
  {
    id: "usr-alum-16",
    role: "alumni",
    full_name: "Meera Chawla",
    headline: "Founding Engineer @ Hasura | GraphQL Core",
    branch: "Information Technology",
    grad_year: 2019,
    current_company: "Atlassian",
    current_city: "Bengaluru, India",
    experience_history: [
      { company: "Atlassian", title: "Senior Full-Stack Engineer", start_year: 2022, end_year: null },
      { company: "Hasura", title: "Founding Engineer", start_year: 2019, end_year: 2022 }
    ],
    github_url: "https://github.com/meerachawla-graphql",
    linkedin_url: "https://linkedin.com/in/meerachawla-eng",
    bounty_points: 3,
    distinct_alumni_count: 3,
    onboarding_completed: true,
    created_at: "2024-02-16T17:00:00Z",
    updated_at: "2024-02-16T17:00:00Z"
  },

  // ─── 10 STUDENTS ───
  {
    id: "usr-stud-01",
    role: "student",
    full_name: "Akash Niranjan",
    headline: "Undergrad Builder @ DevComm NSUT | Systems & Rust",
    branch: "Computer Engineering",
    grad_year: 2025,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "DevComm NSUT", title: "Core Systems Lead", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/akashniranjan",
    linkedin_url: "https://linkedin.com/in/akashniranjan-nsut",
    bounty_points: 1,
    distinct_alumni_count: 1,
    onboarding_completed: true,
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2024-03-01T08:00:00Z"
  },
  {
    id: "usr-stud-02",
    role: "student",
    full_name: "Arjun Mehta",
    headline: "Student Researcher @ IEEE NSUT | ML & WebGL",
    branch: "Computer Engineering",
    grad_year: 2025,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "IEEE NSUT", title: "Web and Graphics Lead", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/arjunmehta-dev",
    linkedin_url: "https://linkedin.com/in/arjunmehta-nsut",
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-03-03T09:00:00Z",
    updated_at: "2024-03-03T09:00:00Z"
  },
  {
    id: "usr-stud-03",
    role: "student",
    full_name: "Priya Nair",
    headline: "Robotics Lead @ ARES Robotics | Embedded & ROS",
    branch: "Instrumentation and Control Engineering",
    grad_year: 2026,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "ARES Robotics", title: "Firmware Lead", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/priyanair-ros",
    linkedin_url: "https://linkedin.com/in/priyanair-robotics",
    bounty_points: 1,
    distinct_alumni_count: 1,
    onboarding_completed: true,
    created_at: "2024-03-05T10:00:00Z",
    updated_at: "2024-03-05T10:00:00Z"
  },
  {
    id: "usr-stud-04",
    role: "student",
    full_name: "Kabir Sachdeva",
    headline: "Quant Researcher @ FES NSUT | Stochastic Calculus",
    branch: "Mathematics and Computing",
    grad_year: 2025,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "Finance & Economics Society", title: "President", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/kabirsachdeva-quant",
    linkedin_url: "https://linkedin.com/in/kabirsachdeva-finance",
    bounty_points: 2,
    distinct_alumni_count: 2,
    onboarding_completed: true,
    created_at: "2024-03-07T11:00:00Z",
    updated_at: "2024-03-07T11:00:00Z"
  },
  {
    id: "usr-stud-05",
    role: "student",
    full_name: "Simran Kaur",
    headline: "Competitive Programmer @ ASN NSUT | Candidate Master",
    branch: "Computer Engineering",
    grad_year: 2026,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "ASN – Algorithm Society", title: "Problem Setter", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/simrankaur-cp",
    linkedin_url: "https://linkedin.com/in/simrankaur-algorithms",
    bounty_points: 1,
    distinct_alumni_count: 1,
    onboarding_completed: true,
    created_at: "2024-03-10T12:00:00Z",
    updated_at: "2024-03-10T12:00:00Z"
  },
  {
    id: "usr-stud-06",
    role: "student",
    full_name: "Dhruv Bansal",
    headline: "Full-Stack Engineer @ CSI NSUT | Next.js & Cloud",
    branch: "Information Technology",
    grad_year: 2025,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "CSI NSUT", title: "Technical Coordinator", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/dhruvbansal-web",
    linkedin_url: "https://linkedin.com/in/dhruvbansal-dev",
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-03-12T13:00:00Z",
    updated_at: "2024-03-12T13:00:00Z"
  },
  {
    id: "usr-stud-07",
    role: "student",
    full_name: "Ishita Goel",
    headline: "President @ 180 Degrees Consulting NSUT",
    branch: "Manufacturing Processes and Automation Engineering",
    grad_year: 2025,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "180DC NSUT", title: "Branch President", start_year: 2023, end_year: null }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/ishitagoel-consulting",
    bounty_points: 1,
    distinct_alumni_count: 1,
    onboarding_completed: true,
    created_at: "2024-03-15T14:00:00Z",
    updated_at: "2024-03-15T14:00:00Z"
  },
  {
    id: "usr-stud-08",
    role: "student",
    full_name: "Rishabh Tyagi",
    headline: "President @ Debating Society NSUT | Parliamentary Speaker",
    branch: "Electronics and Communication Engineering",
    grad_year: 2026,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "DebSoc NSUT", title: "President", start_year: 2023, end_year: null }
    ],
    github_url: null,
    linkedin_url: "https://linkedin.com/in/rishabhtyagi-debate",
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-03-18T15:00:00Z",
    updated_at: "2024-03-18T15:00:00Z"
  },
  {
    id: "usr-stud-09",
    role: "student",
    full_name: "Tanmay Bhattacharya",
    headline: "Lead Designer @ Intaglios NSUT | Design Systems",
    branch: "Computer Engineering",
    grad_year: 2027,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "Intaglios Design Society", title: "Design Systems Lead", start_year: 2024, end_year: null }
    ],
    github_url: "https://github.com/tanmayb-design",
    linkedin_url: "https://linkedin.com/in/tanmaybhattacharya-ui",
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-03-20T16:00:00Z",
    updated_at: "2024-03-20T16:00:00Z"
  },
  {
    id: "usr-stud-10",
    role: "student",
    full_name: "Zoya Qureshi",
    headline: "Bioinformatics Researcher @ NSUT Biotech Lab",
    branch: "Biotechnology",
    grad_year: 2026,
    current_company: null,
    current_city: "New Delhi, India",
    experience_history: [
      { company: "NSUT Computational Biology Lab", title: "Undergrad Researcher", start_year: 2023, end_year: null }
    ],
    github_url: "https://github.com/zoyaqureshi-bio",
    linkedin_url: "https://linkedin.com/in/zoyaqureshi-biotech",
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-03-22T17:00:00Z",
    updated_at: "2024-03-22T17:00:00Z"
  },

  // ─── 2 ADMINS ───
  {
    id: "usr-admin-01",
    role: "admin",
    full_name: "NSUT Institutional Registrar",
    headline: "Official Campus Archive & Alumni Secretariat",
    branch: "Computer Engineering",
    grad_year: 1983,
    current_company: "NSUT",
    current_city: "New Delhi, India",
    experience_history: [
      { company: "Netaji Subhas University of Technology", title: "Dean of Alumni Affairs", start_year: 2018, end_year: null }
    ],
    github_url: null,
    linkedin_url: null,
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "usr-admin-02",
    role: "admin",
    full_name: "Campus System Administrator",
    headline: "System Verification Engine & Network Node Overseer",
    branch: "Information Technology",
    grad_year: 2018,
    current_company: "NSUT",
    current_city: "New Delhi, India",
    experience_history: [
      { company: "NSUT Computer Centre", title: "Senior Network Architect", start_year: 2020, end_year: null }
    ],
    github_url: null,
    linkedin_url: null,
    bounty_points: 0,
    distinct_alumni_count: 0,
    onboarding_completed: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

/**
 * Profile Tag Associations (Mapping each profile to authentic NSUT tags)
 */
export const SEED_PROFILE_TAGS: Record<string, string[]> = {
  "usr-alum-01": ["nokia", "ece", "telecommunications", "management-consulting"],
  "usr-alum-02": ["inmobi", "mckinsey-company", "mpae", "e-cell-nsut", "product-management"],
  "usr-alum-03": ["boAt", "coe", "e-cell-nsut", "product-management"],
  "usr-alum-04": ["google", "coe", "devcomm-nsut", "systems-infrastructure", "typescript", "rust"],
  "usr-alum-05": ["microsoft", "it", "csi-nsut", "product-management", "cloud-platforms"],
  "usr-alum-06": ["stripe", "coe", "devcomm-nsut", "systems-infrastructure", "go", "kafka"],
  "usr-alum-07": ["deepmind", "mac", "nakshatra-nsut", "ai-ml-engineering", "pytorch", "python"],
  "usr-alum-08": ["tower-research-capital", "mac", "fes-nsut", "quant-algorithmic-trading", "c++"],
  "usr-alum-09": ["apple", "nvidia", "coe", "systems-infrastructure", "c++", "linux-kernel"],
  "usr-alum-10": ["uber", "it", "devcomm-nsut", "full-stack-product", "go", "microservices"],
  "usr-alum-11": ["razorpay", "coe", "devcomm-nsut", "full-stack-product", "typescript", "react"],
  "usr-alum-12": ["texas-instruments", "ice", "ares-robotics-nsut", "robotics-embedded", "c++"],
  "usr-alum-13": ["mckinsey-company", "180dc-nsut", "management-consulting"],
  "usr-alum-14": ["goldman-sachs", "coe", "fes-nsut", "quant-algorithmic-trading", "python"],
  "usr-alum-15": ["nvidia", "coe", "debugging-society", "systems-infrastructure", "c++", "cuda"],
  "usr-alum-16": ["atlassian", "it", "devcomm-nsut", "full-stack-product", "graphql", "react"],

  "usr-stud-01": ["coe", "devcomm-nsut", "ieee-nsut", "systems-infrastructure", "rust", "typescript", "supabase"],
  "usr-stud-02": ["coe", "ieee-nsut", "csi-nsut", "ai-ml-engineering", "three.js", "webgl", "react"],
  "usr-stud-03": ["ice", "ares-robotics-nsut", "ieee-nsut", "robotics-embedded", "c++", "ros"],
  "usr-stud-04": ["mac", "fes-nsut", "180dc-nsut", "quant-algorithmic-trading", "python", "financial-modeling"],
  "usr-stud-05": ["coe", "asn-nsut", "debugging-society", "c++", "competitive-programming"],
  "usr-stud-06": ["it", "csi-nsut", "devcomm-nsut", "full-stack-product", "next.js", "tailwind-css"],
  "usr-stud-07": ["mpae", "180dc-nsut", "e-cell-nsut", "management-consulting"],
  "usr-stud-08": ["ece", "debsoc-nsut", "crosslinks-nsut", "product-management"],
  "usr-stud-09": ["coe", "intaglios-nsut", "devcomm-nsut", "full-stack-product", "ui-ux", "react"],
  "usr-stud-10": ["bt", "nakshatra-nsut", "ieee-nsut", "ai-ml-engineering", "python", "computational-biology"],

  "usr-admin-01": ["coe", "nsut", "archive"],
  "usr-admin-02": ["it", "nsut", "systems-infrastructure"]
};

/**
 * Pre-computed Graph Edges with Anti-collusion Dijkstra Resistance Weights
 */
export const SEED_GRAPH_EDGES: GraphEdge[] = [
  // Student 01 (Akash Niranjan) connections
  {
    id: "edge-01-04",
    source_id: "usr-stud-01",
    target_id: "usr-alum-04", // Rohan Verma (Google)
    relational_points: 3,
    shared_tags_count: 3, // coe, devcomm-nsut, systems-infrastructure
    calculated_weight: calculateDijkstraWeight(3, 3), // 1 / (15 + 6 + 0.1) = ~0.047
    created_at: "2024-03-02T10:00:00Z"
  },
  {
    id: "edge-01-06",
    source_id: "usr-stud-01",
    target_id: "usr-alum-06", // Tanvi Mehta (Stripe)
    relational_points: 2,
    shared_tags_count: 3, // coe, devcomm-nsut, systems-infrastructure
    calculated_weight: calculateDijkstraWeight(2, 3), // 1 / (10 + 6 + 0.1) = ~0.062
    created_at: "2024-03-03T11:00:00Z"
  },
  {
    id: "edge-01-11",
    source_id: "usr-stud-01",
    target_id: "usr-alum-11", // Vikram Sethi (Razorpay)
    relational_points: 1,
    shared_tags_count: 2, // coe, devcomm-nsut
    calculated_weight: calculateDijkstraWeight(1, 2), // 1 / (5 + 4 + 0.1) = ~0.109
    created_at: "2024-03-04T12:00:00Z"
  },
  {
    id: "edge-01-03",
    source_id: "usr-stud-01",
    target_id: "usr-alum-03", // Aman Gupta (boAt)
    relational_points: 0,
    shared_tags_count: 1, // coe
    calculated_weight: calculateDijkstraWeight(0, 1), // 1 / (0 + 2 + 0.1) = ~0.476
    created_at: "2024-03-05T13:00:00Z"
  },

  // Student 02 (Arjun Mehta) connections
  {
    id: "edge-02-04",
    source_id: "usr-stud-02",
    target_id: "usr-alum-04", // Rohan Verma (Google)
    relational_points: 2,
    shared_tags_count: 1, // coe
    calculated_weight: calculateDijkstraWeight(2, 1),
    created_at: "2024-03-04T10:00:00Z"
  },
  {
    id: "edge-02-07",
    source_id: "usr-stud-02",
    target_id: "usr-alum-07", // Ananya Roy (DeepMind)
    relational_points: 3,
    shared_tags_count: 1, // ai-ml-engineering
    calculated_weight: calculateDijkstraWeight(3, 1),
    created_at: "2024-03-05T11:00:00Z"
  },
  {
    id: "edge-02-16",
    source_id: "usr-stud-02",
    target_id: "usr-alum-16", // Meera Chawla (Atlassian)
    relational_points: 1,
    shared_tags_count: 1, // react
    calculated_weight: calculateDijkstraWeight(1, 1),
    created_at: "2024-03-06T12:00:00Z"
  },

  // Student 03 (Priya Nair) connections
  {
    id: "edge-03-12",
    source_id: "usr-stud-03",
    target_id: "usr-alum-12", // Rhea Sen (TI)
    relational_points: 4,
    shared_tags_count: 3, // ice, ares-robotics-nsut, robotics-embedded
    calculated_weight: calculateDijkstraWeight(4, 3), // 1 / (20 + 6 + 0.1) = ~0.038
    created_at: "2024-03-06T10:00:00Z"
  },

  // Student 04 (Kabir Sachdeva) connections
  {
    id: "edge-04-08",
    source_id: "usr-stud-04",
    target_id: "usr-alum-08", // Siddharth Jain (Tower Research)
    relational_points: 4,
    shared_tags_count: 3, // mac, fes-nsut, quant-algorithmic-trading
    calculated_weight: calculateDijkstraWeight(4, 3),
    created_at: "2024-03-08T10:00:00Z"
  },
  {
    id: "edge-04-14",
    source_id: "usr-stud-04",
    target_id: "usr-alum-14", // Divya Nambiar (Goldman Sachs)
    relational_points: 2,
    shared_tags_count: 2, // fes-nsut, quant-algorithmic-trading
    calculated_weight: calculateDijkstraWeight(2, 2),
    created_at: "2024-03-09T11:00:00Z"
  },

  // Student 05 (Simran Kaur) connections
  {
    id: "edge-05-15",
    source_id: "usr-stud-05",
    target_id: "usr-alum-15", // Harshit Singhal (NVIDIA)
    relational_points: 3,
    shared_tags_count: 3, // coe, debugging-society, c++
    calculated_weight: calculateDijkstraWeight(3, 3),
    created_at: "2024-03-11T10:00:00Z"
  },

  // Student 06 (Dhruv Bansal) connections
  {
    id: "edge-06-05",
    source_id: "usr-stud-06",
    target_id: "usr-alum-05", // Pooja Sharma (Microsoft)
    relational_points: 2,
    shared_tags_count: 2, // it, csi-nsut
    calculated_weight: calculateDijkstraWeight(2, 2),
    created_at: "2024-03-13T10:00:00Z"
  },

  // Student 07 (Ishita Goel) connections
  {
    id: "edge-07-02",
    source_id: "usr-stud-07",
    target_id: "usr-alum-02", // Naveen Tewari (InMobi)
    relational_points: 2,
    shared_tags_count: 2, // mpae, e-cell-nsut
    calculated_weight: calculateDijkstraWeight(2, 2),
    created_at: "2024-03-16T10:00:00Z"
  },
  {
    id: "edge-07-13",
    source_id: "usr-stud-07",
    target_id: "usr-alum-13", // Aditya Khurana (McKinsey)
    relational_points: 3,
    shared_tags_count: 2, // 180dc-nsut, management-consulting
    calculated_weight: calculateDijkstraWeight(3, 2),
    created_at: "2024-03-17T11:00:00Z"
  },

  // Alumni-to-Alumni Peer Connections
  {
    id: "edge-04-06",
    source_id: "usr-alum-04", // Rohan Verma (Google)
    target_id: "usr-alum-06", // Tanvi Mehta (Stripe)
    relational_points: 5,
    shared_tags_count: 3, // coe, devcomm-nsut, systems-infrastructure
    calculated_weight: calculateDijkstraWeight(5, 3), // 1 / (25 + 6 + 0.1) = ~0.032
    created_at: "2024-01-23T10:00:00Z"
  },
  {
    id: "edge-04-09",
    source_id: "usr-alum-04", // Rohan Verma (Google)
    target_id: "usr-alum-09", // Karan Malhotra (Apple)
    relational_points: 4,
    shared_tags_count: 2, // coe, systems-infrastructure
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-02T10:00:00Z"
  },
  {
    id: "edge-05-10",
    source_id: "usr-alum-05", // Pooja Sharma (Microsoft)
    target_id: "usr-alum-10", // Sneha Kapoor (Uber)
    relational_points: 3,
    shared_tags_count: 1, // it
    calculated_weight: calculateDijkstraWeight(3, 1),
    created_at: "2024-02-04T10:00:00Z"
  },
  {
    id: "edge-07-08",
    source_id: "usr-alum-07", // Ananya Roy (DeepMind)
    target_id: "usr-alum-08", // Siddharth Jain (Tower Research)
    relational_points: 5,
    shared_tags_count: 1, // mac
    calculated_weight: calculateDijkstraWeight(5, 1),
    created_at: "2024-01-29T10:00:00Z"
  },
  {
    id: "edge-01-02",
    source_id: "usr-alum-01", // Rajeev Suri (Nokia)
    target_id: "usr-alum-02", // Naveen Tewari (InMobi)
    relational_points: 5,
    shared_tags_count: 1, // management-consulting
    calculated_weight: calculateDijkstraWeight(5, 1),
    created_at: "2024-01-13T10:00:00Z"
  },
  {
    id: "edge-02-03",
    source_id: "usr-alum-02", // Naveen Tewari (InMobi)
    target_id: "usr-alum-03", // Aman Gupta (boAt)
    relational_points: 5,
    shared_tags_count: 1, // e-cell-nsut
    calculated_weight: calculateDijkstraWeight(5, 1),
    created_at: "2024-01-16T10:00:00Z"
  },
  // Additional Student Connections
  {
    id: "edge-08-01",
    source_id: "usr-stud-08", // Rishabh Tyagi (ECE)
    target_id: "usr-alum-01", // Rajeev Suri (Nokia)
    relational_points: 3,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(3, 2),
    created_at: "2024-03-18T10:00:00Z"
  },
  {
    id: "edge-08-13",
    source_id: "usr-stud-08", // Rishabh Tyagi (DebSoc)
    target_id: "usr-alum-13", // Aditya Khurana (McKinsey)
    relational_points: 2,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(2, 1),
    created_at: "2024-03-18T11:00:00Z"
  },
  {
    id: "edge-09-11",
    source_id: "usr-stud-09", // Tanmay Bhattacharya (Intaglios)
    target_id: "usr-alum-11", // Vikram Sethi (Razorpay)
    relational_points: 3,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(3, 2),
    created_at: "2024-03-20T10:00:00Z"
  },
  {
    id: "edge-09-16",
    source_id: "usr-stud-09", // Tanmay Bhattacharya
    target_id: "usr-alum-16", // Meera Chawla (Atlassian)
    relational_points: 2,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(2, 2),
    created_at: "2024-03-20T11:00:00Z"
  },
  {
    id: "edge-10-07",
    source_id: "usr-stud-10", // Zoya Qureshi (Biotech / AI)
    target_id: "usr-alum-07", // Ananya Roy (DeepMind)
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-03-22T10:00:00Z"
  },
  {
    id: "edge-10-04",
    source_id: "usr-stud-10", // Zoya Qureshi
    target_id: "usr-alum-04", // Rohan Verma (Google)
    relational_points: 2,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(2, 1),
    created_at: "2024-03-22T11:00:00Z"
  },
  // Additional Alumni-to-Alumni Bridges
  {
    id: "edge-09-12",
    source_id: "usr-alum-09", // Karan Malhotra (Apple)
    target_id: "usr-alum-12", // Rhea Sen (Texas Instruments)
    relational_points: 5,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(5, 2),
    created_at: "2024-02-10T10:00:00Z"
  },
  {
    id: "edge-09-15",
    source_id: "usr-alum-09", // Karan Malhotra (Apple)
    target_id: "usr-alum-15", // Harshit Singhal (NVIDIA)
    relational_points: 5,
    shared_tags_count: 3,
    calculated_weight: calculateDijkstraWeight(5, 3),
    created_at: "2024-02-12T10:00:00Z"
  },
  {
    id: "edge-04-15",
    source_id: "usr-alum-04", // Rohan Verma (Google)
    target_id: "usr-alum-15", // Harshit Singhal (NVIDIA)
    relational_points: 4,
    shared_tags_count: 3,
    calculated_weight: calculateDijkstraWeight(4, 3),
    created_at: "2024-02-14T10:00:00Z"
  },
  {
    id: "edge-06-10",
    source_id: "usr-alum-06", // Tanvi Mehta (Stripe)
    target_id: "usr-alum-10", // Sneha Kapoor (Uber)
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-16T10:00:00Z"
  },
  {
    id: "edge-06-11",
    source_id: "usr-alum-06", // Tanvi Mehta (Stripe)
    target_id: "usr-alum-11", // Vikram Sethi (Razorpay)
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-18T10:00:00Z"
  },
  {
    id: "edge-11-16",
    source_id: "usr-alum-11", // Vikram Sethi (Razorpay)
    target_id: "usr-alum-16", // Meera Chawla (Atlassian)
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-20T10:00:00Z"
  },
  {
    id: "edge-05-16",
    source_id: "usr-alum-05", // Pooja Sharma (Microsoft)
    target_id: "usr-alum-16", // Meera Chawla (Atlassian)
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-22T10:00:00Z"
  },
  {
    id: "edge-02-13",
    source_id: "usr-alum-02", // Naveen Tewari (InMobi)
    target_id: "usr-alum-13", // Aditya Khurana (McKinsey)
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-24T10:00:00Z"
  },
  {
    id: "edge-08-14",
    source_id: "usr-alum-08", // Siddharth Jain (Tower Research)
    target_id: "usr-alum-14", // Divya Nambiar (Goldman Sachs)
    relational_points: 5,
    shared_tags_count: 3,
    calculated_weight: calculateDijkstraWeight(5, 3),
    created_at: "2024-02-26T10:00:00Z"
  },
  {
    id: "edge-03-04",
    source_id: "usr-alum-03", // Aman Gupta (boAt)
    target_id: "usr-alum-04", // Rohan Verma (Google)
    relational_points: 3,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(3, 1),
    created_at: "2024-02-28T10:00:00Z"
  },
  // Institutional Admin Anchors
  {
    id: "edge-adm01-alum01",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-alum-01", // Rajeev Suri
    relational_points: 5,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(5, 2),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm01-alum04",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-alum-04", // Rohan Verma
    relational_points: 5,
    shared_tags_count: 3,
    calculated_weight: calculateDijkstraWeight(5, 3),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm02-alum05",
    source_id: "usr-admin-02", // Campus System Administrator
    target_id: "usr-alum-05", // Pooja Sharma
    relational_points: 5,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(5, 2),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm02-stud01",
    source_id: "usr-admin-02", // Campus System Administrator
    target_id: "usr-stud-01", // Akash Niranjan
    relational_points: 4,
    shared_tags_count: 2,
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-01-01T10:00:00Z"
  },
  // ── Campus Trust Bridges (Guarantees zero islands & rich multi-hop pathways) ──
  {
    id: "edge-stud01-stud02",
    source_id: "usr-stud-01", // Akash Niranjan (COE)
    target_id: "usr-stud-02", // Arjun Mehta (COE / IEEE)
    relational_points: 4,
    shared_tags_count: 2, // coe, react
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-03-01T10:00:00Z"
  },
  {
    id: "edge-stud01-stud06",
    source_id: "usr-stud-01", // Akash Niranjan (COE)
    target_id: "usr-stud-06", // Dhruv Bansal (IT / CSI)
    relational_points: 3,
    shared_tags_count: 1, // full-stack
    calculated_weight: calculateDijkstraWeight(3, 1),
    created_at: "2024-03-02T10:00:00Z"
  },
  {
    id: "edge-stud01-stud07",
    source_id: "usr-stud-01", // Akash Niranjan
    target_id: "usr-stud-07", // Ishita Goel (180DC President)
    relational_points: 2,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(2, 1),
    created_at: "2024-03-03T10:00:00Z"
  },
  {
    id: "edge-stud01-stud09",
    source_id: "usr-stud-01", // Akash Niranjan
    target_id: "usr-stud-09", // Tanmay Bhattacharya (Intaglios Design)
    relational_points: 3,
    shared_tags_count: 2, // coe, react
    calculated_weight: calculateDijkstraWeight(3, 2),
    created_at: "2024-03-04T10:00:00Z"
  },
  {
    id: "edge-stud01-stud03",
    source_id: "usr-stud-01", // Akash Niranjan
    target_id: "usr-stud-03", // Priya Nair (ARES Robotics)
    relational_points: 2,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(2, 1),
    created_at: "2024-03-05T10:00:00Z"
  },
  {
    id: "edge-stud01-stud04",
    source_id: "usr-stud-01", // Akash Niranjan
    target_id: "usr-stud-04", // Kabir Sachdeva (FES Quant)
    relational_points: 2,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(2, 1),
    created_at: "2024-03-06T10:00:00Z"
  },
  {
    id: "edge-stud01-stud05",
    source_id: "usr-stud-01", // Akash Niranjan
    target_id: "usr-stud-05", // Simran Kaur (ASN Algorithm)
    relational_points: 4,
    shared_tags_count: 2, // coe, debugging
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-03-07T10:00:00Z"
  },
  {
    id: "edge-adm01-stud01",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-stud-01", // Akash Niranjan
    relational_points: 5,
    shared_tags_count: 2, // coe, archive
    calculated_weight: calculateDijkstraWeight(5, 2),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm01-alum02",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-alum-02", // Naveen Tewari (InMobi)
    relational_points: 5,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(5, 1),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm01-alum08",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-alum-08", // Siddharth Jain (Tower Research)
    relational_points: 4,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(4, 1),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm01-alum12",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-alum-12", // Rhea Sen (Texas Instruments)
    relational_points: 4,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(4, 1),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm01-stud07",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-stud-07", // Ishita Goel (MPAE)
    relational_points: 4,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(4, 1),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-adm01-stud10",
    source_id: "usr-admin-01", // NSUT Registrar
    target_id: "usr-stud-10", // Zoya Qureshi (Biotech)
    relational_points: 4,
    shared_tags_count: 1,
    calculated_weight: calculateDijkstraWeight(4, 1),
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "edge-alum04-alum07",
    source_id: "usr-alum-04", // Rohan Verma (Google)
    target_id: "usr-alum-07", // Dr. Ananya Roy (DeepMind)
    relational_points: 5,
    shared_tags_count: 2, // systems, ai
    calculated_weight: calculateDijkstraWeight(5, 2),
    created_at: "2024-02-01T10:00:00Z"
  },
  {
    id: "edge-alum04-alum05",
    source_id: "usr-alum-04", // Rohan Verma (Google)
    target_id: "usr-alum-05", // Pooja Sharma (Microsoft)
    relational_points: 4,
    shared_tags_count: 2, // big tech
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-03T10:00:00Z"
  },
  {
    id: "edge-alum04-alum10",
    source_id: "usr-alum-04", // Rohan Verma (Google)
    target_id: "usr-alum-10", // Sneha Kapoor (Uber)
    relational_points: 4,
    shared_tags_count: 2, // devcomm
    calculated_weight: calculateDijkstraWeight(4, 2),
    created_at: "2024-02-05T10:00:00Z"
  },
  {
    id: "edge-alum01-alum13",
    source_id: "usr-alum-01", // Rajeev Suri (Nokia)
    target_id: "usr-alum-13", // Aditya Khurana (McKinsey)
    relational_points: 5,
    shared_tags_count: 2, // management-consulting
    calculated_weight: calculateDijkstraWeight(5, 2),
    created_at: "2024-02-08T10:00:00Z"
  },
  {
    id: "edge-alum03-alum14",
    source_id: "usr-alum-03", // Aman Gupta (boAt)
    target_id: "usr-alum-14", // Divya Nambiar (Goldman Sachs)
    relational_points: 4,
    shared_tags_count: 1, // finance
    calculated_weight: calculateDijkstraWeight(4, 1),
    created_at: "2024-02-15T10:00:00Z"
  }
];

/**
 * Synthetic Bounties (Microtasks & Pinned Vacancies)
 */
export const SEED_BOUNTIES: Bounty[] = [
  {
    id: "bounty-01",
    author_id: "usr-alum-04", // Rohan Verma (Google)
    type: "microtask",
    title: "Rust CLI for Supabase Schema Migrations",
    description: "Build a single-binary CLI in Rust that parses PostgreSQL DDL schema files and generates typed TypeScript interfaces matching docs/schema.md with automated zero-leak assertions.",
    required_tags: ["rust", "systems-infrastructure", "postgresql"],
    points_reward: 1,
    status: "open",
    external_apply_url: null,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z"
  },
  {
    id: "bounty-02",
    author_id: "usr-alum-06", // Tanvi Mehta (Stripe)
    type: "microtask",
    title: "Implement Token Bucket Rate Limiter in Go",
    description: "Write an in-memory distributed token bucket rate limiter with lock-free atomic CAS primitives capable of sustaining 250,000 req/sec benchmark with p99 latency < 2ms.",
    required_tags: ["go", "systems-infrastructure", "distributed-systems"],
    points_reward: 1,
    status: "open",
    external_apply_url: null,
    created_at: "2024-03-02T11:00:00Z",
    updated_at: "2024-03-02T11:00:00Z"
  },
  {
    id: "bounty-03",
    author_id: "usr-alum-07", // Ananya Roy (DeepMind)
    type: "microtask",
    title: "LoRA Fine-Tuning Script on NSUT Research Papers",
    description: "Prepare an automated PyTorch script fine-tuning Llama-3-8B with QLoRA on 40 years of NSUT publications, exporting the adapter weights with strict evaluation perplexity < 4.2.",
    required_tags: ["pytorch", "python", "ai-ml-engineering"],
    points_reward: 1,
    status: "claimed",
    external_apply_url: null,
    created_at: "2024-03-04T12:00:00Z",
    updated_at: "2024-03-05T14:00:00Z"
  },
  {
    id: "bounty-04",
    author_id: "usr-alum-08", // Siddharth Jain (Tower Research)
    type: "microtask",
    title: "Lock-Free Order Book Adjacency Engine in C++20",
    description: "Construct a cache-coherent L3 limit order book structure leveraging AVX-512 SIMD vector instructions for price-level matching with zero heap allocation during trading loops.",
    required_tags: ["c++", "quant-algorithmic-trading", "financial-modeling"],
    points_reward: 1,
    status: "open",
    external_apply_url: null,
    created_at: "2024-03-05T13:00:00Z",
    updated_at: "2024-03-05T13:00:00Z"
  },
  {
    id: "bounty-05",
    author_id: "usr-alum-11", // Vikram Sethi (Razorpay)
    type: "job_posting",
    title: "Founding Systems Engineer (Series A Funded)",
    description: "Looking for a high-velocity junior engineer or graduating senior from NSUT COE/IT with deep knowledge of distributed event buses, Kafka, and PostgreSQL internals. Competitive equity package.",
    required_tags: ["typescript", "systems-infrastructure", "full-stack-product"],
    points_reward: 1,
    status: "open",
    external_apply_url: "https://boards.greenhouse.io/nsut-alumni-ventures",
    created_at: "2024-03-06T14:00:00Z",
    updated_at: "2024-03-06T14:00:00Z"
  }
];

/**
 * Synthetic Task Submissions
 */
export const SEED_SUBMISSIONS: TaskSubmission[] = [
  {
    id: "sub-01",
    bounty_id: "bounty-01",
    student_id: "usr-stud-01", // Akash Niranjan
    submission_url: "https://github.com/akashniranjan/nsut-schema-cli/pull/4",
    grade: "1",
    reviewer_feedback: "Exceptional code quality. Idiomatic Rust error handling with thiserror and zero heap allocations on the hot path. +1 Point awarded.",
    reviewed_at: "2024-03-04T16:30:00Z",
    created_at: "2024-03-03T18:00:00Z"
  },
  {
    id: "sub-02",
    bounty_id: "bounty-03",
    student_id: "usr-stud-02", // Arjun Mehta
    submission_url: "https://github.com/arjunmehta-dev/nsut-lora-tuning/pull/1",
    grade: null, // Pending review
    reviewer_feedback: null,
    reviewed_at: null,
    created_at: "2024-03-08T12:00:00Z"
  }
];

/**
 * Synthetic Direct Messages
 */
export const SEED_MESSAGES: Message[] = [
  {
    id: "msg-01",
    sender_id: "usr-stud-01",
    receiver_id: "usr-alum-04",
    content: "Hi Rohan bhaiya, I saw your Google Cloud work on distributed tracing. I'm building systems tools at DevComm NSUT and recently completed the Rust schema CLI deliverable. Would love your perspective on eBPF telemetry.",
    is_ai_drafted: true,
    read_at: "2024-03-04T17:00:00Z",
    created_at: "2024-03-04T16:45:00Z"
  },
  {
    id: "msg-02",
    sender_id: "usr-alum-04",
    receiver_id: "usr-stud-01",
    content: "Hey Akash, checked out your PR on the Rust schema CLI — genuinely impressed with your approach to Zero-Copy parsing. Let's set up a 20-min chat this Thursday at 7 PM IST.",
    is_ai_drafted: false,
    read_at: "2024-03-04T17:15:00Z",
    created_at: "2024-03-04T17:05:00Z"
  }
];

/**
 * 3D Force Graph Spatial Data Generator
 * Returns only canonical full-fledged profiles and authentic relational links
 */
export function getInitialSpatialGraphData(): SpatialGraphData {
  const canonicalProfiles: GraphNode[] = [
    {
      id: "p-arjun-nair",
      name: "Dr. Arjun Nair",
      role: "alumni",
      headline: "Principal Systems Architect at Anthropic · Distributed GPU Scheduling",
      company: "Anthropic",
      city: "San Francisco, USA",
      branch: "Computer Science & Engineering",
      gradYear: 2012,
      bountyPoints: 5,
      distinctAlumniCount: 4,
      tags: ["Distributed Systems", "Rust", "CUDA", "Linux Kernels", "Compiler Design"],
      val: 5,
    },
    {
      id: "p-priya-ramanathan",
      name: "Priya Ramanathan",
      role: "alumni",
      headline: "VP of Product at Stripe · Identity & Trust Infrastructure",
      company: "Stripe",
      city: "London, UK",
      branch: "Economics & Public Policy",
      gradYear: 2014,
      bountyPoints: 4,
      distinctAlumniCount: 4,
      tags: ["Product Strategy", "Fintech", "Regulatory Engineering", "Organizational Design"],
      val: 4.5,
    },
    {
      id: "p-dev-mehta",
      name: "Dev Mehta",
      role: "alumni",
      headline: "Founding Engineer & CTO at Synapse Robotics · Ex-ISRO Guidance Systems",
      company: "Synapse Robotics",
      city: "Bengaluru, India",
      branch: "Mechanical Sciences",
      gradYear: 2017,
      bountyPoints: 5,
      distinctAlumniCount: 3,
      tags: ["Control Systems", "Computer Vision", "Embedded C++", "Hardware Design"],
      val: 4.5,
    },
    {
      id: "p-aanya-iyer",
      name: "Dr. Aanya Iyer",
      role: "alumni",
      headline: "Senior Scientist in Structural Biology at Oxford BioMed & Francis Crick",
      company: "Oxford BioMed",
      city: "Oxford, UK",
      branch: "Biophysics & Molecular Biology",
      gradYear: 2015,
      bountyPoints: 4,
      distinctAlumniCount: 2,
      tags: ["Cryo-EM", "Protein Engineering", "Python", "Drug Discovery"],
      val: 4,
    },
    {
      id: "p-rohan-sen",
      name: "Rohan Sen",
      role: "alumni",
      headline: "Managing Director at Sequoia Capital India & Southeast Asia",
      company: "Peak XV Partners",
      city: "Singapore",
      branch: "Economics & Public Policy",
      gradYear: 2008,
      bountyPoints: 5,
      distinctAlumniCount: 5,
      tags: ["Venture Capital", "Growth Strategy", "Cap Table Economics", "B2B SaaS"],
      val: 5,
    },
    {
      id: "p-kavita-sharma",
      name: "Kavita Sharma",
      role: "alumni",
      headline: "Staff Machine Learning Engineer at DeepMind · Reinforcement Learning",
      company: "Google DeepMind",
      city: "London, UK",
      branch: "Computer Science & Engineering",
      gradYear: 2018,
      bountyPoints: 4,
      distinctAlumniCount: 3,
      tags: ["PyTorch", "Reinforcement Learning", "LLM Alignment", "Statistical Modeling"],
      val: 4.5,
    },
    {
      id: "p-vikram-choudhury",
      name: "Vikram Choudhury",
      role: "alumni",
      headline: "Head of Infrastructure at Zerodha · Scaled High-Frequency Architecture",
      company: "Zerodha",
      city: "Bengaluru, India",
      branch: "Computer Science & Engineering",
      gradYear: 2016,
      bountyPoints: 4,
      distinctAlumniCount: 3,
      tags: ["High Performance Computing", "Go", "PostgreSQL", "Network Engineering"],
      val: 4,
    },
    {
      id: "p-tara-deshmukh",
      name: "Tara Deshmukh",
      role: "alumni",
      headline: "Design Director at Linear · Crafting Digital Tools & Workflows",
      company: "Linear",
      city: "Zurich, Switzerland",
      branch: "Literature & Visual Studies",
      gradYear: 2019,
      bountyPoints: 3,
      distinctAlumniCount: 3,
      tags: ["Design Systems", "Product Design", "Typography", "Figma"],
      val: 4,
    },
    {
      id: "p-kabir-alva",
      name: "Kabir Alva",
      role: "alumni",
      headline: "Partner at Latham & Watkins · Technology M&A & Antitrust Counsel",
      company: "Latham & Watkins",
      city: "New York, USA",
      branch: "Economics & Public Policy",
      gradYear: 2010,
      bountyPoints: 4,
      distinctAlumniCount: 2,
      tags: ["Antitrust Law", "Cross-border M&A", "Corporate Governance"],
      val: 4,
    },
    {
      id: "p-meera-bose",
      name: "Meera Bose",
      role: "alumni",
      headline: "Staff Hardware Architect at Apple Silicon · Low-Power NPU Subsystems",
      company: "Apple",
      city: "Cupertino, USA",
      branch: "Electrical & Computer Engineering",
      gradYear: 2013,
      bountyPoints: 4,
      distinctAlumniCount: 3,
      tags: ["Verilog/Chisel", "ASIC Design", "Computer Architecture"],
      val: 4.5,
    },
    {
      id: "p-aditya-kapoor",
      name: "Aditya Kapoor",
      role: "alumni",
      headline: "Co-Founder & CEO at Verve Climate · Carbon Removal Verification",
      company: "Verve Climate",
      city: "Berlin, Germany",
      branch: "Civil & Environmental Engineering",
      gradYear: 2020,
      bountyPoints: 3,
      distinctAlumniCount: 2,
      tags: ["Climate Tech", "Remote Sensing", "Fundraising"],
      val: 3.5,
    },
    {
      id: "p-simran-kaur",
      name: "Simran Kaur",
      role: "alumni",
      headline: "Senior Quantitative Researcher at Citadel Securities · Algorithmic Trading",
      company: "Citadel Securities",
      city: "Chicago, USA",
      branch: "Mathematics & Computing",
      gradYear: 2021,
      bountyPoints: 4,
      distinctAlumniCount: 2,
      tags: ["Stochastic Calculus", "C++20", "Time-Series Econometrics"],
      val: 4,
    },
    {
      id: "usr-stud-01",
      name: "Akash Niranjan",
      role: "student",
      headline: "Systems & Compiler Builder @ DevComm NSUT",
      company: "DevComm NSUT",
      city: "New Delhi, India",
      branch: "Computer Engineering",
      gradYear: 2025,
      bountyPoints: 1,
      distinctAlumniCount: 4,
      tags: ["coe", "devcomm-nsut", "rust", "typescript", "supabase"],
      val: 6,
    },
  ];

  const canonicalConnections: GraphLink[] = [
    // ── ARJUN NAIR (Anthropic) – hub, 5 connections ──
    { source: "p-arjun-nair", target: "p-priya-ramanathan",  relationalPoints: 8,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-arjun-nair", target: "p-kavita-sharma",     relationalPoints: 12, sharedTagsCount: 3, weight: calculateDijkstraWeight(5, 3) },
    { source: "p-arjun-nair", target: "p-vikram-choudhury",  relationalPoints: 15, sharedTagsCount: 4, weight: calculateDijkstraWeight(5, 4) },
    { source: "p-arjun-nair", target: "p-meera-bose",        relationalPoints: 16, sharedTagsCount: 3, weight: calculateDijkstraWeight(5, 3) },
    { source: "p-arjun-nair", target: "p-dev-mehta",         relationalPoints: 9,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-arjun-nair", target: "p-simran-kaur",       relationalPoints: 5,  sharedTagsCount: 1, weight: calculateDijkstraWeight(5, 1) },

    // ── PRIYA RAMANATHAN (Stripe) – 5 connections ──
    { source: "p-priya-ramanathan", target: "p-rohan-sen",      relationalPoints: 14, sharedTagsCount: 3, weight: calculateDijkstraWeight(5, 3) },
    { source: "p-priya-ramanathan", target: "p-kabir-alva",     relationalPoints: 7,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-priya-ramanathan", target: "p-tara-deshmukh",  relationalPoints: 6,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-priya-ramanathan", target: "p-aditya-kapoor",  relationalPoints: 4,  sharedTagsCount: 1, weight: calculateDijkstraWeight(4, 1) },

    // ── DEV MEHTA (Synapse Robotics) – 4 connections ──
    { source: "p-dev-mehta", target: "p-meera-bose",     relationalPoints: 11, sharedTagsCount: 3, weight: calculateDijkstraWeight(5, 3) },
    { source: "p-dev-mehta", target: "p-aditya-kapoor",  relationalPoints: 7,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-dev-mehta", target: "p-rohan-sen",      relationalPoints: 13, sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },

    // ── KAVITA SHARMA (DeepMind) – 4 connections ──
    { source: "p-kavita-sharma", target: "p-simran-kaur", relationalPoints: 10, sharedTagsCount: 3, weight: calculateDijkstraWeight(5, 3) },
    { source: "p-kavita-sharma", target: "p-aanya-iyer",  relationalPoints: 8,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-kavita-sharma", target: "p-meera-bose",  relationalPoints: 7,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },

    // ── VIKRAM CHOUDHURY (Zerodha) – 3 connections ──
    { source: "p-vikram-choudhury", target: "p-tara-deshmukh",  relationalPoints: 5,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-vikram-choudhury", target: "p-kabir-alva",     relationalPoints: 4,  sharedTagsCount: 1, weight: calculateDijkstraWeight(4, 1) },

    // ── ROHAN SEN (Peak XV) – 3 connections ──
    { source: "p-rohan-sen", target: "p-simran-kaur",    relationalPoints: 9,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-rohan-sen", target: "p-kabir-alva",     relationalPoints: 8,  sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },

    // ── MEERA BOSE (Apple) – already covered above + 1 more ──
    { source: "p-meera-bose", target: "p-simran-kaur",   relationalPoints: 5,  sharedTagsCount: 1, weight: calculateDijkstraWeight(5, 1) },

    // ── TARA DESHMUKH (Linear) – 1 more ──
    { source: "p-tara-deshmukh", target: "p-aditya-kapoor", relationalPoints: 3, sharedTagsCount: 1, weight: calculateDijkstraWeight(3, 1) },

    // ── AANYA IYER (Oxford BioMed) – 2 more ──
    { source: "p-aanya-iyer", target: "p-aditya-kapoor",  relationalPoints: 5, sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },
    { source: "p-aanya-iyer", target: "p-priya-ramanathan", relationalPoints: 4, sharedTagsCount: 1, weight: calculateDijkstraWeight(4, 1) },

    // ── SIMRAN KAUR (Citadel) – extra ──
    { source: "p-simran-kaur", target: "p-vikram-choudhury", relationalPoints: 6, sharedTagsCount: 2, weight: calculateDijkstraWeight(5, 2) },

    // ── KABIR ALVA (Latham & Watkins) – extra ──
    { source: "p-kabir-alva", target: "p-aditya-kapoor",  relationalPoints: 4, sharedTagsCount: 1, weight: calculateDijkstraWeight(4, 1) },

    // ── STUDENT usr-stud-01 (Akash Niranjan) – well-connected to 6 alumni ──
    { source: "usr-stud-01", target: "p-arjun-nair",        relationalPoints: 3, sharedTagsCount: 3, weight: calculateDijkstraWeight(3, 3) },
    { source: "usr-stud-01", target: "p-dev-mehta",         relationalPoints: 2, sharedTagsCount: 2, weight: calculateDijkstraWeight(2, 2) },
    { source: "usr-stud-01", target: "p-kavita-sharma",     relationalPoints: 2, sharedTagsCount: 2, weight: calculateDijkstraWeight(2, 2) },
    { source: "usr-stud-01", target: "p-tara-deshmukh",     relationalPoints: 1, sharedTagsCount: 2, weight: calculateDijkstraWeight(1, 2) },
    { source: "usr-stud-01", target: "p-vikram-choudhury",  relationalPoints: 2, sharedTagsCount: 3, weight: calculateDijkstraWeight(2, 3) },
    { source: "usr-stud-01", target: "p-aanya-iyer",        relationalPoints: 1, sharedTagsCount: 1, weight: calculateDijkstraWeight(1, 1) },
  ];

  return { nodes: canonicalProfiles, links: canonicalConnections };
}
