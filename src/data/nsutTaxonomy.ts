/**
 * NSUT ARCHIVE — Canonical Institutional Taxonomy Dictionaries
 * Strictly defines the 20 Canonical Societies, 90 Hiring Companies,
 * Engineering Branches, and Domain Classifications.
 */

import { Tag } from '../types/database';

export interface SocietyDefinition {
  id: string;
  name: string;
  slug: string;
  category: 'society';
  domain: string;
  established?: number;
  description: string;
}

export interface CompanyDefinition {
  id: string;
  name: string;
  slug: string;
  category: 'company';
  sector: string;
  hqCity: string;
}

export interface BranchDefinition {
  code: string;
  name: string;
  slug: string;
  description: string;
}

export interface DomainDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/**
 * 20 Canonical NSUT Student Societies
 */
export const CANONICAL_SOCIETIES: SocietyDefinition[] = [
  {
    id: "soc-ieee",
    name: "IEEE NSUT",
    slug: "ieee-nsut",
    category: "society",
    domain: "Technical & Research",
    established: 1988,
    description: "The Institute of Electrical and Electronics Engineers student branch at NSUT."
  },
  {
    id: "soc-devcomm",
    name: "DevComm NSUT",
    slug: "devcomm-nsut",
    category: "society",
    domain: "Open Source & Software",
    established: 2017,
    description: "Premier developers' society fostering open-source software, hackathons, and systems architecture."
  },
  {
    id: "soc-debug",
    name: "The Debugging Society",
    slug: "debugging-society",
    category: "society",
    domain: "Competitive Programming",
    established: 2014,
    description: "Algorithmic thinking, data structures, and ICPC preparatory division."
  },
  {
    id: "soc-asn",
    name: "ASN – Algorithm Society of NSUT",
    slug: "asn-nsut",
    category: "society",
    domain: "Competitive Programming",
    established: 2016,
    description: "Elite algorithmic track focusing on high-speed problem solving and quant preparation."
  },
  {
    id: "soc-gdg",
    name: "Google Developer Group (GDG) NSUT",
    slug: "gdg-nsut",
    category: "society",
    domain: "Cloud & Mobile Development",
    established: 2019,
    description: "Community chapter for Google technologies, Android, Flutter, and Cloud infrastructure."
  },
  {
    id: "soc-csi",
    name: "CSI NSUT",
    slug: "csi-nsut",
    category: "society",
    domain: "Computer Science",
    established: 1994,
    description: "Computer Society of India student branch organizing national hackathons and symposiums."
  },
  {
    id: "soc-ecell",
    name: "E-Cell NSUT",
    slug: "e-cell-nsut",
    category: "society",
    domain: "Entrepreneurship & Startups",
    established: 2008,
    description: "Incubating student ventures, startup pitch summits, and venture capital connections."
  },
  {
    id: "soc-180dc",
    name: "180 Degrees Consulting NSUT",
    slug: "180dc-nsut",
    category: "society",
    domain: "Management Consulting",
    established: 2019,
    description: "Pro-bono strategic consulting for non-profits, social enterprises, and high-impact NGOs."
  },
  {
    id: "soc-fes",
    name: "Finance & Economics Society (FES)",
    slug: "fes-nsut",
    category: "society",
    domain: "Quantitative Finance",
    established: 2015,
    description: "Financial markets, asset valuation, macroeconomics, and investment banking analysis."
  },
  {
    id: "soc-shatranj",
    name: "Shatranj NSUT",
    slug: "shatranj-nsut",
    category: "society",
    domain: "Strategy & Chess",
    established: 2011,
    description: "Competitive chess, game tree algorithms, and inter-university tactical championships."
  },
  {
    id: "soc-igts",
    name: "IGTS – Indian Game Theory Society",
    slug: "igts-nsut",
    category: "society",
    domain: "Game Theory & Economics",
    established: 2018,
    description: "Mathematical modeling of strategic interaction, Nash equilibria, and auction mechanics."
  },
  {
    id: "soc-ares",
    name: "ARES Robotics NSUT",
    slug: "ares-robotics-nsut",
    category: "society",
    domain: "Robotics & Hardware",
    established: 2012,
    description: "Autonomous robotics, computer vision, University Rover Challenge, and embedded systems."
  },
  {
    id: "soc-nakshatra",
    name: "Nakshatra – Astronomy and Mathematics Society",
    slug: "nakshatra-nsut",
    category: "society",
    domain: "Astrophysics & Pure Math",
    established: 2013,
    description: "Stargazing expeditions, mathematical proofs, astrophotography, and orbital physics."
  },
  {
    id: "soc-enactus",
    name: "Enactus NSUT",
    slug: "enactus-nsut",
    category: "society",
    domain: "Social Entrepreneurship",
    established: 2012,
    description: "Empowering underserved communities through sustainable economic entrepreneurial action."
  },
  {
    id: "soc-debsoc",
    name: "Debating Society of NSUT (DebSoc)",
    slug: "debsoc-nsut",
    category: "society",
    domain: "Parliamentary Debate",
    established: 1996,
    description: "Asian Parliamentary & British Parliamentary competitive collegiate debating."
  },
  {
    id: "soc-crosslinks",
    name: "Crosslinks NSUT",
    slug: "crosslinks-nsut",
    category: "society",
    domain: "Editorial & Media",
    established: 2004,
    description: "The official campus media and journalistic body chronicling campus history and newsletters."
  },
  {
    id: "soc-intaglios",
    name: "Intaglios – Design Society",
    slug: "intaglios-nsut",
    category: "society",
    domain: "UI/UX & Visual Arts",
    established: 2015,
    description: "UI/UX design, visual identity, architectural rendering, and digital typography."
  },
  {
    id: "soc-finsoc",
    name: "FinSoc NSUT",
    slug: "finsoc-nsut",
    category: "society",
    domain: "Corporate Finance",
    established: 2020,
    description: "Corporate financial engineering, algorithmic trade modeling, and equity research."
  },
  {
    id: "soc-tedx",
    name: "TEDxNSUT",
    slug: "tedx-nsut",
    category: "society",
    domain: "Leadership & Ideas",
    established: 2016,
    description: "Independently organized TED event hosting thought leaders, scientists, and alumni."
  },
  {
    id: "soc-quiz",
    name: "NSUT Quiz Club",
    slug: "nsut-quiz-club",
    category: "society",
    domain: "General Knowledge & Trivia",
    established: 2002,
    description: "Premier quizzing collective competing across national college leagues and MELA quizzes."
  }
];

/**
 * 90 Canonical Hiring Companies (NSUT Top Recruiters & Alumni Employers)
 */
export const CANONICAL_COMPANIES: CompanyDefinition[] = [
  // Tier 1 Big Tech
  { id: "comp-google", name: "Google", slug: "google", category: "company", sector: "Big Tech", hqCity: "Mountain View, USA" },
  { id: "comp-microsoft", name: "Microsoft", slug: "microsoft", category: "company", sector: "Big Tech", hqCity: "Redmond, USA" },
  { id: "comp-amazon", name: "Amazon", slug: "amazon", category: "company", sector: "Big Tech", hqCity: "Seattle, USA" },
  { id: "comp-apple", name: "Apple", slug: "apple", category: "company", sector: "Big Tech", hqCity: "Cupertino, USA" },
  { id: "comp-adobe", name: "Adobe", slug: "adobe", category: "company", sector: "Product Software", hqCity: "San Jose, USA" },
  { id: "comp-nvidia", name: "NVIDIA", slug: "nvidia", category: "company", sector: "Semiconductors & AI", hqCity: "Santa Clara, USA" },
  { id: "comp-uber", name: "Uber", slug: "uber", category: "company", sector: "Mobility & Tech", hqCity: "San Francisco, USA" },
  { id: "comp-atlassian", name: "Atlassian", slug: "atlassian", category: "company", sector: "Enterprise SaaS", hqCity: "Sydney, Australia" },
  { id: "comp-meta", name: "Meta", slug: "meta", category: "company", sector: "Big Tech", hqCity: "Menlo Park, USA" },
  { id: "comp-aws", name: "Amazon Web Services (AWS)", slug: "aws", category: "company", sector: "Cloud Infrastructure", hqCity: "Seattle, USA" },
  { id: "comp-deepmind", name: "Google DeepMind", slug: "deepmind", category: "company", sector: "Artificial Intelligence", hqCity: "London, UK" },

  // Quantitative Trading & High-Frequency Finance
  { id: "comp-deshaw", name: "DE Shaw", slug: "de-shaw", category: "company", sector: "Quantitative Finance", hqCity: "New York, USA" },
  { id: "comp-tower", name: "Tower Research Capital", slug: "tower-research-capital", category: "company", sector: "High Frequency Trading", hqCity: "New York, USA" },
  { id: "comp-goldman", name: "Goldman Sachs", slug: "goldman-sachs", category: "company", sector: "Investment Banking", hqCity: "New York, USA" },
  { id: "comp-jpmorgan", name: "JPMorgan Chase", slug: "jpmorgan-chase", category: "company", sector: "Investment Banking", hqCity: "New York, USA" },
  { id: "comp-morganstanley", name: "Morgan Stanley", slug: "morgan-stanley", category: "company", sector: "Investment Banking", hqCity: "New York, USA" },
  { id: "comp-barclays", name: "Barclays", slug: "barclays", category: "company", sector: "Investment Banking", hqCity: "London, UK" },
  { id: "comp-nomura", name: "Nomura", slug: "nomura", category: "company", sector: "Financial Services", hqCity: "Tokyo, Japan" },
  { id: "comp-ivp", name: "Indus Valley Partners", slug: "indus-valley-partners", category: "company", sector: "Fintech", hqCity: "Noida, India" },

  // Semiconductors & Systems
  { id: "comp-qualcomm", name: "Qualcomm", slug: "qualcomm", category: "company", sector: "Semiconductors", hqCity: "San Diego, USA" },
  { id: "comp-ti", name: "Texas Instruments", slug: "texas-instruments", category: "company", sector: "Semiconductors", hqCity: "Dallas, USA" },
  { id: "comp-arm", name: "ARM", slug: "arm", category: "company", sector: "Semiconductors", hqCity: "Cambridge, UK" },
  { id: "comp-intel", name: "Intel", slug: "intel", category: "company", sector: "Semiconductors", hqCity: "Santa Clara, USA" },
  { id: "comp-cadence", name: "Cadence Design Systems", slug: "cadence-design-systems", category: "company", sector: "Electronic Design", hqCity: "San Jose, USA" },
  { id: "comp-synopsys", name: "Synopsys", slug: "synopsys", category: "company", sector: "Electronic Design", hqCity: "Mountain View, USA" },
  { id: "comp-samsung", name: "Samsung", slug: "samsung", category: "company", sector: "Consumer Electronics", hqCity: "Seoul, South Korea" },

  // Enterprise & Platform SaaS
  { id: "comp-cisco", name: "Cisco", slug: "cisco", category: "company", sector: "Networking & Security", hqCity: "San Jose, USA" },
  { id: "comp-oracle", name: "Oracle", slug: "oracle", category: "company", sector: "Enterprise Cloud", hqCity: "Austin, USA" },
  { id: "comp-salesforce", name: "Salesforce", slug: "salesforce", category: "company", sector: "Enterprise CRM", hqCity: "San Francisco, USA" },
  { id: "comp-sap", name: "SAP Labs", slug: "sap-labs", category: "company", sector: "Enterprise ERP", hqCity: "Walldorf, Germany" },
  { id: "comp-ibm", name: "IBM", slug: "ibm", category: "company", sector: "Enterprise Technology", hqCity: "Armonk, USA" },
  { id: "comp-commvault", name: "Commvault", slug: "commvault", category: "company", sector: "Data Management", hqCity: "Tinton Falls, USA" },
  { id: "comp-informatica", name: "Informatica", slug: "informatica", category: "company", sector: "Cloud Data", hqCity: "Redwood City, USA" },
  { id: "comp-linkedin", name: "LinkedIn", slug: "linkedin", category: "company", sector: "Professional Networking", hqCity: "Sunnyvale, USA" },

  // Top Indian Unicorns & Startups
  { id: "comp-flipkart", name: "Flipkart", slug: "flipkart", category: "company", sector: "E-Commerce", hqCity: "Bengaluru, India" },
  { id: "comp-walmart", name: "Walmart", slug: "walmart", category: "company", sector: "Retail Tech", hqCity: "Bentonville, USA" },
  { id: "comp-zomato", name: "Zomato", slug: "zomato", category: "company", sector: "Food Logistics", hqCity: "Gurugram, India" },
  { id: "comp-swiggy", name: "Swiggy", slug: "swiggy", category: "company", sector: "Hyperlocal Delivery", hqCity: "Bengaluru, India" },
  { id: "comp-paytm", name: "Paytm", slug: "paytm", category: "company", sector: "Fintech", hqCity: "Noida, India" },
  { id: "comp-phonepe", name: "PhonePe", slug: "phonepe", category: "company", sector: "Fintech Payments", hqCity: "Bengaluru, India" },
  { id: "comp-razorpay", name: "Razorpay", slug: "razorpay", category: "company", sector: "Payment Gateway", hqCity: "Bengaluru, India" },
  { id: "comp-meesho", name: "Meesho", slug: "meesho", category: "company", sector: "Social Commerce", hqCity: "Bengaluru, India" },
  { id: "comp-makemytrip", name: "MakeMyTrip", slug: "makemytrip", category: "company", sector: "Online Travel", hqCity: "Gurugram, India" },
  { id: "comp-infoedge", name: "Info Edge", slug: "info-edge", category: "company", sector: "Internet Portals", hqCity: "Noida, India" },
  { id: "comp-expedia", name: "Expedia", slug: "expedia", category: "company", sector: "Online Travel", hqCity: "Seattle, USA" },
  { id: "comp-expediagroup", name: "Expedia Group", slug: "expedia-group", category: "company", sector: "Travel Tech", hqCity: "Seattle, USA" },
  { id: "comp-directi", name: "Directi", slug: "directi", category: "company", sector: "Web Technologies", hqCity: "Mumbai, India" },
  { id: "comp-cvent", name: "Cvent", slug: "cvent", category: "company", sector: "Event Management Tech", hqCity: "Tysons, USA" },
  { id: "comp-lenskart", name: "Lenskart", slug: "lenskart", category: "company", sector: "Omnichannel Eyewear", hqCity: "Faridabad, India" },
  { id: "comp-payu", name: "PayU", slug: "payu", category: "company", sector: "Digital Payments", hqCity: "Hoofddorp, Netherlands" },
  { id: "comp-mobikwik", name: "MobiKwik", slug: "mobikwik", category: "company", sector: "Fintech Wallet", hqCity: "Gurugram, India" },
  { id: "comp-unicommerce", name: "Unicommerce", slug: "unicommerce", category: "company", sector: "SaaS Supply Chain", hqCity: "New Delhi, India" },
  { id: "comp-healthifyme", name: "HealthifyMe", slug: "healthifyme", category: "company", sector: "Health Tech", hqCity: "Bengaluru, India" },
  { id: "comp-cleartax", name: "ClearTax", slug: "cleartax", category: "company", sector: "Tax & Compliance Fintech", hqCity: "Bengaluru, India" },

  // Strategy & Management Consulting
  { id: "comp-mckinsey", name: "McKinsey & Company", slug: "mckinsey-company", category: "company", sector: "Management Consulting", hqCity: "New York, USA" },
  { id: "comp-bcg", name: "Boston Consulting Group (BCG)", slug: "boston-consulting-group", category: "company", sector: "Management Consulting", hqCity: "Boston, USA" },
  { id: "comp-bain", name: "Bain & Company", slug: "bain-company", category: "company", sector: "Management Consulting", hqCity: "Boston, USA" },

  // Big 4 & Advisory
  { id: "comp-deloitte", name: "Deloitte", slug: "deloitte", category: "company", sector: "Consulting & Advisory", hqCity: "London, UK" },
  { id: "comp-pwc", name: "PwC", slug: "pwc", category: "company", sector: "Consulting & Tax", hqCity: "London, UK" },
  { id: "comp-kpmg", name: "KPMG", slug: "kpmg", category: "company", sector: "Consulting & Audit", hqCity: "Amstelveen, Netherlands" },
  { id: "comp-ey", name: "EY (Ernst & Young)", slug: "ey-ernst-young", category: "company", sector: "Professional Services", hqCity: "London, UK" },
  { id: "comp-accenture", name: "Accenture", slug: "accenture", category: "company", sector: "Technology Consulting", hqCity: "Dublin, Ireland" },

  // Data Science, Analytics & Healthcare
  { id: "comp-fractal", name: "Fractal Analytics", slug: "fractal-analytics", category: "company", sector: "AI & Decision Sciences", hqCity: "New York, USA" },
  { id: "comp-sigmoid", name: "Sigmoid", slug: "sigmoid", category: "company", sector: "Data Engineering", hqCity: "San Francisco, USA" },
  { id: "comp-zs", name: "ZS Associates", slug: "zs-associates", category: "company", sector: "Management Consulting", hqCity: "Evanston, USA" },
  { id: "comp-axtria", name: "Axtria", slug: "axtria", category: "company", sector: "Life Sciences Analytics", hqCity: "Berkeley Heights, USA" },
  { id: "comp-exl", name: "EXL", slug: "exl", category: "company", sector: "Operations & Analytics", hqCity: "New York, USA" },
  { id: "comp-dunnhumby", name: "Dunnhumby", slug: "dunnhumby", category: "company", sector: "Customer Data Science", hqCity: "London, UK" },
  { id: "comp-musigma", name: "Mu Sigma", slug: "mu-sigma", category: "company", sector: "Decision Sciences", hqCity: "Chicago, USA" },
  { id: "comp-evaluserve", name: "Evalueserve", slug: "evaluserve", category: "company", sector: "Research & Analytics", hqCity: "Schaffhausen, Switzerland" },
  { id: "comp-optum", name: "UnitedHealth Group", slug: "unitedhealth-group", category: "company", sector: "Healthcare Technology", hqCity: "Minnetonka, USA" },

  // Payments & Financial Services
  { id: "comp-visa", name: "Visa", slug: "visa", category: "company", sector: "Payment Networks", hqCity: "San Francisco, USA" },
  { id: "comp-fiserv", name: "Fiserv", slug: "fiserv", category: "company", sector: "Fintech Infrastructure", hqCity: "Brookfield, USA" },
  { id: "comp-fis", name: "FIS", slug: "fis", category: "company", sector: "Fintech", hqCity: "Jacksonville, USA" },

  // Core Engineering & Automotive
  { id: "comp-maruti", name: "Maruti Suzuki", slug: "maruti-suzuki", category: "company", sector: "Automotive", hqCity: "New Delhi, India" },
  { id: "comp-hero", name: "Hero MotoCorp", slug: "hero-motocorp", category: "company", sector: "Automotive", hqCity: "New Delhi, India" },

  // Telecom & Communications
  { id: "comp-jio", name: "Reliance Jio", slug: "reliance-jio", category: "company", sector: "Telecommunications", hqCity: "Mumbai, India" },
  { id: "comp-airtel", name: "Airtel", slug: "airtel", category: "company", sector: "Telecommunications", hqCity: "New Delhi, India" },
  { id: "comp-amdocs", name: "Amdocs", slug: "amdocs", category: "company", sector: "Telecom Software", hqCity: "Chesterfield, USA" },

  // Global IT Services & Software Delivery
  { id: "comp-hcltech", name: "HCLTech", slug: "hcltech", category: "company", sector: "IT Services", hqCity: "Noida, India" },
  { id: "comp-accolite", name: "Accolite", slug: "accolite", category: "company", sector: "Digital Transformation", hqCity: "Addison, USA" },
  { id: "comp-nagarro", name: "Nagarro", slug: "nagarro", category: "company", sector: "Digital Engineering", hqCity: "Munich, Germany" },
  { id: "comp-maq", name: "MAQ Software", slug: "maq-software", category: "company", sector: "Analytics & Cloud", hqCity: "Redmond, USA" },
  { id: "comp-newgen", name: "Newgen Software", slug: "newgen-software", category: "company", sector: "Enterprise Content Tech", hqCity: "New Delhi, India" },
  { id: "comp-thoughtworks", name: "Thoughtworks", slug: "thoughtworks", category: "company", sector: "Software Consulting", hqCity: "Chicago, USA" },
  { id: "comp-wipro", name: "Wipro", slug: "wipro", category: "company", sector: "IT Services", hqCity: "Bengaluru, India" },
  { id: "comp-infosys", name: "Infosys", slug: "infosys", category: "company", sector: "IT Services", hqCity: "Bengaluru, India" },
  { id: "comp-tcs", name: "Tata Consultancy Services (TCS)", slug: "tcs", category: "company", sector: "IT Services", hqCity: "Mumbai, India" }
];

/**
 * NSUT Engineering Branches (Accredited Undergraduate Disciplines)
 */
export const CANONICAL_BRANCHES: BranchDefinition[] = [
  { code: "COE", name: "Computer Engineering", slug: "coe", description: "Systems programming, algorithms, operating systems, and distributed architectures." },
  { code: "IT", name: "Information Technology", slug: "it", description: "Web technologies, cloud platforms, security protocols, and software infrastructure." },
  { code: "ECE", name: "Electronics and Communication Engineering", slug: "ece", description: "Signal processing, VLSI design, wireless communication, and embedded hardware." },
  { code: "ICE", name: "Instrumentation and Control Engineering", slug: "ice", description: "Control systems, sensor networks, industrial automation, and robotics." },
  { code: "MAC", name: "Mathematics and Computing", slug: "mac", description: "Computational mathematics, stochastic modeling, financial engineering, and cryptography." },
  { code: "MPAE", name: "Manufacturing Processes and Automation Engineering", slug: "mpae", description: "Additive manufacturing, mechatronics, CAD/CAM, and precision robotics." },
  { code: "BT", name: "Biotechnology", slug: "bt", description: "Bioinformatics, computational genomics, biochemical engineering, and pharmacology." }
];

/**
 * High-Impact Industry Target Domains
 */
export const CANONICAL_DOMAINS: DomainDefinition[] = [
  { id: "dom-sys", name: "Systems & Infrastructure", slug: "systems-infrastructure", description: "Kernel engineering, distributed databases, cloud orchestration, and high-throughput networks." },
  { id: "dom-quant", name: "Quant & Algorithmic Trading", slug: "quant-algorithmic-trading", description: "Statistical arbitrage, order routing, stochastic modeling, and latency optimization." },
  { id: "dom-ai", name: "AI/ML Engineering", slug: "ai-ml-engineering", description: "Large language models, reinforcement learning, computer vision, and neural compute pipelines." },
  { id: "dom-product", name: "Full-Stack Product", slug: "full-stack-product", description: "High-density web applications, mobile architectures, frontend frameworks, and reactive state systems." },
  { id: "dom-robotics", name: "Robotics & Embedded", slug: "robotics-embedded", description: "Firmware, real-time operating systems (RTOS), motor controllers, and sensor fusion." },
  { id: "dom-pm", name: "Product Management", slug: "product-management", description: "User journey mapping, market sizing, technical specifications, and cross-functional leadership." },
  { id: "dom-consulting", name: "Management Consulting", slug: "management-consulting", description: "Business model transformation, operational turnaround, cost rationalization, and growth strategy." }
];

/**
 * Top Technical Skills Tags
 */
export const CANONICAL_SKILLS = [
  "TypeScript", "React", "Rust", "Go", "Python", "C++", "Three.js", "WebGL", "PostgreSQL",
  "Supabase", "Docker", "Kubernetes", "PyTorch", "TensorFlow", "Next.js", "Kafka",
  "GraphQL", "Redis", "Solidity", "Tailwind CSS", "Linux Kernel", "LLM Fine-tuning",
  "Distributed Systems", "Computer Vision", "Financial Modeling", "System Design"
];

/**
 * Global Flattened Tags Repository
 */
export const ALL_CANONICAL_TAGS: Tag[] = [
  ...CANONICAL_SOCIETIES.map((s) => ({
    id: s.id,
    category: "society" as const,
    name: s.name,
    slug: s.slug
  })),
  ...CANONICAL_COMPANIES.map((c) => ({
    id: c.id,
    category: "company" as const,
    name: c.name,
    slug: c.slug
  })),
  ...CANONICAL_BRANCHES.map((b) => ({
    id: `branch-${b.slug}`,
    category: "branch" as const,
    name: b.name,
    slug: b.slug
  })),
  ...CANONICAL_DOMAINS.map((d) => ({
    id: d.id,
    category: "domain" as const,
    name: d.name,
    slug: d.slug
  })),
  ...CANONICAL_SKILLS.map((skill) => ({
    id: `skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    category: "skill" as const,
    name: skill,
    slug: skill.toLowerCase().replace(/[^a-z0-9]/g, '-')
  }))
];

/**
 * Anti-farming Dijkstra Resistance Calculation
 * Formula from docs/schema.md:
 * W = 1 / (min(5, relational_points) * 5.0 + shared_tags_count * 2.0 + 0.1)
 */
export function calculateDijkstraWeight(relationalPoints: number, sharedTagsCount: number): number {
  const boundedPoints = Math.min(5, Math.max(0, relationalPoints));
  const denominator = (boundedPoints * 5.0) + (sharedTagsCount * 2.0) + 0.1;
  const weight = 1 / denominator;
  // Format to 4 decimal places
  return Number(weight.toFixed(4));
}

/**
 * Taxonomy Retrieval & Search Utilities
 */
export function searchTaxonomy(query: string, category?: string): Tag[] {
  const q = query.trim().toLowerCase();
  return ALL_CANONICAL_TAGS.filter((t) => {
    if (category && t.category !== category) return false;
    return t.name.toLowerCase().includes(q) || t.slug.includes(q);
  });
}

export function getSocietyBySlug(slug: string): SocietyDefinition | undefined {
  return CANONICAL_SOCIETIES.find((s) => s.slug === slug);
}

export function getCompanyBySlug(slug: string): CompanyDefinition | undefined {
  return CANONICAL_COMPANIES.find((c) => c.slug === slug);
}

export function getBranchByCode(code: string): BranchDefinition | undefined {
  return CANONICAL_BRANCHES.find((b) => b.code.toUpperCase() === code.toUpperCase());
}
