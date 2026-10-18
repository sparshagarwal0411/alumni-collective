/**
 * NSUT ARCHIVE — Database & Relational Data Types
 * Conforms strictly to docs/schema.md
 */

export type UserRole = 'student' | 'alumni' | 'admin';

export type TagCategory = 'skill' | 'society' | 'company' | 'domain' | 'position' | 'branch';

export type BountyType = 'microtask' | 'job_posting';

export type BountyStatus = 'open' | 'claimed' | 'completed' | 'archived';

export type SubmissionGrade = '0' | '1'; // '0' = Fail, '1' = Pass

export interface ExperienceRecord {
  company: string;
  title: string;
  start_year: number;
  end_year?: number | null; // null for present
  description?: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string | null;
  headline?: string | null;
  branch: string; // e.g. "Computer Engineering", "Information Technology"
  grad_year: number; // e.g. 1989, 2018, 2025
  current_company?: string | null;
  current_city?: string | null; // "City, Country"
  experience_history: ExperienceRecord[];
  github_url?: string | null;
  linkedin_url?: string | null;
  resume_storage_path?: string | null;
  bounty_points: number;
  distinct_alumni_count: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  category: TagCategory;
  name: string;
  slug: string;
  created_at?: string;
}

export interface UserTag {
  profile_id: string;
  tag_id: string;
  context?: string | null; // e.g., "President", "Lead Maintainer", "Core Team"
  created_at?: string;
  tag?: Tag;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relational_points: number;
  shared_tags_count: number;
  calculated_weight: number; // 1 / (min(5, pts)*5 + shared*2 + 0.1)
  last_interaction?: string | null;
  created_at?: string;
}

export interface Bounty {
  id: string;
  author_id: string;
  type: BountyType;
  title: string;
  description: string;
  required_tags: string[]; // array of tag IDs or tag slugs
  points_reward: number;
  status: BountyStatus;
  external_apply_url?: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface TaskSubmission {
  id: string;
  bounty_id: string;
  student_id: string;
  submission_url: string; // GitHub PR, Google Drive, or Figma link
  grade?: SubmissionGrade | null;
  reviewer_feedback?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  bounty?: Bounty;
  student?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_ai_drafted: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface GraphNode {
  id: string;
  name: string;
  role: UserRole;
  headline?: string;
  company?: string;
  city?: string;
  branch: string;
  gradYear: number;
  avatarUrl?: string;
  bountyPoints: number;
  distinctAlumniCount: number;
  tags: string[]; // tag slugs
  val: number; // visual sizing weight
}

export interface GraphLink {
  source: string; // ID
  target: string; // ID
  relationalPoints: number;
  sharedTagsCount: number;
  weight: number; // Dijkstra resistance
}

export interface SpatialGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ProfileFilters {
  search?: string;
  company?: string;
  branch?: string;
  domain?: string;
  society?: string;
  gradYearMin?: number;
  gradYearMax?: number;
  role?: UserRole;
}

export interface BountyFilters {
  search?: string;
  type?: BountyType;
  status?: BountyStatus;
  tag?: string;
  authorId?: string;
}
