import { supabase } from "@/integrations/supabase/client";
import {
  MOCK_PROFILES,
  MOCK_MICROTASKS,
  MOCK_MESSAGES,
  MOCK_FUNDS,
  type Profile,
  type Microtask,
  type Message,
  type Fund,
} from "./mockData";

export interface DonationRecord {
  id: string;
  fundId: string;
  fundName: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  isAnonymous: boolean;
  note?: string;
  createdAt: string;
  receiptNumber: string;
}

const LOCAL_MESSAGES_KEY = "ashwood_local_messages_v2";
const LOCAL_MICROTASKS_KEY = "ashwood_local_microtasks_v2";
const LOCAL_DONATIONS_KEY = "ashwood_donations_ledger_v2";
const LOCAL_PROFILES_KEY = "ashwood_local_profiles_v2";

export function isValidUuid(str: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Deterministically convert any arbitrary string (like "p-arjun-nair" or "current-user") to a valid UUID format
export function toUuid(id: string): string {
  if (isValidUuid(id)) return id;
  // Fallbacks for well-known mock IDs to match Supabase seed UUIDs
  const wellKnownMap: Record<string, string> = {
    "current-user": "00000000-0000-0000-0000-000000000001",
    "p-arjun-nair": "00000000-0000-0000-0000-000000000006",
    "p-priya-ramanathan": "00000000-0000-0000-0000-000000000001",
    "p-kabir-mehta": "00000000-0000-0000-0000-000000000002",
    "p-ishita-sen": "00000000-0000-0000-0000-000000000003",
    "p-rohan-pillai": "00000000-0000-0000-0000-000000000004",
    "p-meera-iyer": "00000000-0000-0000-0000-000000000005",
    "p-sana-qureshi": "00000000-0000-0000-0000-000000000007",
    "p-dev-malhotra": "00000000-0000-0000-0000-000000000008",
  };
  if (wellKnownMap[id]) return wellKnownMap[id];

  // Hash string into a standard UUID v4 shape
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.repeat(2).slice(0, 12)}`;
}

// ==========================================
// 1. MESSAGES (Supabase + Local Sync)
// ==========================================

export function getLocalMessages(): Message[] {
  if (typeof window === "undefined") return MOCK_MESSAGES;
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return MOCK_MESSAGES;
}

export function saveLocalMessages(msgs: Message[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(msgs));
  } catch {}
}

export async function fetchAllMessages(): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const dbMsgs: Message[] = data.map((m) => ({
        id: m.id,
        sender: m.sender,
        recipient: m.recipient,
        body: m.body,
        created_at: m.created_at,
      }));

      // Merge with local/mock
      const local = getLocalMessages();
      const existingIds = new Set(dbMsgs.map((m) => m.id));
      const combined = [...dbMsgs, ...local.filter((l) => !existingIds.has(l.id))];
      saveLocalMessages(combined);
      return combined;
    }
  } catch (err) {
    console.warn("Could not query Supabase messages, using local sync", err);
  }

  return getLocalMessages();
}

export async function sendChatMessage(
  senderId: string,
  recipientId: string,
  body: string
): Promise<{ success: boolean; message: Message; error?: string }> {
  const newMsg: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender: senderId,
    recipient: recipientId,
    body: body.trim(),
    created_at: new Date().toISOString(),
    is_ai_drafted: false,
  };

  // 1. Always save locally immediately for responsive UI
  const current = getLocalMessages();
  const updated = [...current, newMsg];
  saveLocalMessages(updated);

  // 2. Attempt Supabase insert if sender has auth or valid UUID
  try {
    const senderUuid = toUuid(senderId);
    const recipientUuid = toUuid(recipientId);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender: senderUuid,
        recipient: recipientUuid,
        body: body.trim(),
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newMsg.id = data.id;
    }
  } catch (err: any) {
    console.info("Supabase message stored locally with active fallback:", err?.message || err);
  }

  return { success: true, message: newMsg };
}

// ==========================================
// 2. MICROTASKS (Given & Taken / Supabase Sync)
// ==========================================

export function getLocalMicrotasks(): Microtask[] {
  if (typeof window === "undefined") return MOCK_MICROTASKS;
  try {
    const raw = localStorage.getItem(LOCAL_MICROTASKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return MOCK_MICROTASKS;
}

export function saveLocalMicrotasks(tasks: Microtask[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_MICROTASKS_KEY, JSON.stringify(tasks));
  } catch {}
}

export async function fetchAllMicrotasks(): Promise<Microtask[]> {
  try {
    const { data, error } = await supabase
      .from("microtasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const formatted: Microtask[] = data.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        hours: t.hours ? Number(t.hours) : null,
        status: (t.status === "done" ? "completed" : t.status) as "open" | "claimed" | "completed",
        posted_by: t.posted_by,
        claimed_by: t.claimed_by,
        is_sample: t.is_sample ?? false,
        created_at: t.created_at,
      }));

      // Combine with any extra locally posted tasks
      const local = getLocalMicrotasks();
      const existingIds = new Set(formatted.map((f) => f.id));
      const combined = [...formatted, ...local.filter((l) => !existingIds.has(l.id))];
      saveLocalMicrotasks(combined);
      return combined;
    }
  } catch (err) {
    console.warn("Could not query Supabase microtasks, using local sync", err);
  }

  return getLocalMicrotasks();
}

export async function createNewMicrotask(task: {
  title: string;
  description: string;
  hours: number;
  posted_by?: string;
}): Promise<{ task: Microtask; error?: string }> {
  const newTask: Microtask = {
    id: `task-${Date.now()}`,
    title: task.title.trim(),
    description: task.description.trim(),
    hours: task.hours,
    status: "open",
    posted_by: task.posted_by || "current-user",
    claimed_by: null,
    is_sample: false,
    created_at: new Date().toISOString(),
  };

  // 1. Save local
  const current = getLocalMicrotasks();
  const updated = [newTask, ...current];
  saveLocalMicrotasks(updated);

  // 2. Supabase insert
  try {
    const postedByUuid = task.posted_by && isValidUuid(task.posted_by) ? task.posted_by : null;
    const { data, error } = await supabase
      .from("microtasks")
      .insert({
        title: task.title.trim(),
        description: task.description.trim(),
        hours: task.hours,
        status: "open",
        posted_by: postedByUuid,
        is_sample: false,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newTask.id = data.id;
    } else if (error) {
      console.warn("Supabase microtask insert notice:", error.message);
    }
  } catch (err) {
    console.warn("Supabase microtask fallback active:", err);
  }

  return { task: newTask };
}

export async function claimExistingMicrotask(
  taskId: string,
  claimedById: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Update local
  const current = getLocalMicrotasks();
  const updated = current.map((t) =>
    t.id === taskId ? { ...t, status: "claimed" as const, claimed_by: claimedById } : t
  );
  saveLocalMicrotasks(updated);

  // 2. Update Supabase if valid UUID
  if (isValidUuid(taskId)) {
    try {
      const claimerUuid = isValidUuid(claimedById) ? claimedById : null;
      await supabase
        .from("microtasks")
        .update({
          status: "claimed",
          claimed_by: claimerUuid,
        })
        .eq("id", taskId);
    } catch (err) {
      console.warn("Supabase task claim update notice:", err);
    }
  }

  return { success: true };
}

export async function completeExistingMicrotask(
  taskId: string,
  submission?: {
    submission_url?: string;
    submission_file_name?: string;
    submission_file_size?: string;
    submission_note?: string;
  }
): Promise<{ success: boolean }> {
  // 1. Update local
  const current = getLocalMicrotasks();
  const updated = current.map((t) =>
    t.id === taskId
      ? {
          ...t,
          status: "completed" as const,
          submission_url: submission?.submission_url || t.submission_url,
          submission_file_name: submission?.submission_file_name || t.submission_file_name,
          submission_file_size: submission?.submission_file_size || t.submission_file_size,
          submission_note: submission?.submission_note || t.submission_note,
          submitted_at: new Date().toISOString(),
        }
      : t
  );
  saveLocalMicrotasks(updated);

  // 2. Update Supabase
  if (isValidUuid(taskId)) {
    try {
      await supabase.from("microtasks").update({ status: "done" }).eq("id", taskId);
    } catch (err) {
      console.warn("Supabase task complete update notice:", err);
    }
  }

  return { success: true };
}

// ==========================================
// 3. PROFILES (Supabase + Local Sync)
// ==========================================

export async function fetchAllProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("grad_year", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbProfiles: Profile[] = data.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        headline: p.headline,
        role_title: p.role_title,
        company: p.company,
        department: p.department,
        degree: p.degree,
        grad_year: p.grad_year,
        city: p.city,
        bio: p.bio,
        skills: p.skills || [],
        open_to_mentor: p.open_to_mentor ?? false,
        linkedin: p.linkedin,
        is_sample: p.is_sample ?? false,
        created_at: p.created_at,
      }));

      // Combine with rich showcase profiles if not present
      const existingIds = new Set(dbProfiles.map((p) => p.id));
      const combined = [...dbProfiles, ...MOCK_PROFILES.filter((m) => !existingIds.has(m.id))];
      return combined;
    }
  } catch (err) {
    console.warn("Could not query Supabase profiles, using fallback", err);
  }

  return MOCK_PROFILES;
}

export async function saveUserProfile(profileData: {
  id: string;
  full_name: string;
  headline?: string;
  role_title?: string;
  company?: string;
  department?: string;
  degree?: string;
  grad_year?: number;
  city?: string;
  bio?: string;
  skills?: string[];
  open_to_mentor?: boolean;
  linkedin?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const profileUuid = toUuid(profileData.id);
    const { error } = await supabase.from("profiles").upsert({
      id: profileUuid,
      full_name: profileData.full_name,
      headline: profileData.headline || null,
      role_title: profileData.role_title || null,
      company: profileData.company || null,
      department: profileData.department || null,
      degree: profileData.degree || null,
      grad_year: profileData.grad_year || null,
      city: profileData.city || null,
      bio: profileData.bio || null,
      skills: profileData.skills || [],
      open_to_mentor: profileData.open_to_mentor ?? false,
      linkedin: profileData.linkedin || null,
      is_sample: false,
    });

    if (error) {
      console.warn("Supabase profile upsert note:", error.message);
    }
  } catch (err: any) {
    console.warn("Supabase profile save fallback active:", err);
  }

  // Also persist to local cache
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profileData));
  }

  return { success: true };
}

// ==========================================
// 4. DONATIONS & ENDOWMENT GIVING
// ==========================================

export function getDonationsLedger(): DonationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DONATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: "gift-sample-1",
      fundId: "609e0766-81e6-4cb5-b763-184389fef911",
      fundName: "First-Generation Scholarships",
      amount: 25000,
      donorName: "Ananya Rao",
      isAnonymous: false,
      note: "In honor of Prof. Mukherjee's early mentorship.",
      createdAt: "2026-10-15T10:30:00Z",
      receiptNumber: "ASH-2026-8819",
    },
    {
      id: "gift-sample-2",
      fundId: "6cc518a2-681e-4b5b-9ea0-1b1bfecf8c5a",
      fundName: "The Reading Room Restoration",
      amount: 50000,
      donorName: "Arjun Nair",
      isAnonymous: false,
      note: "To preserve the 1931 oak study bays.",
      createdAt: "2026-10-16T14:15:00Z",
      receiptNumber: "ASH-2026-9042",
    },
    {
      id: "gift-sample-3",
      fundId: "57960d8b-89de-48d4-8347-734011b1cd14",
      fundName: "Undergraduate Research Grants",
      amount: 10000,
      donorName: "Anonymous Alumnus (Class of 2018)",
      isAnonymous: true,
      note: "For student compute clusters.",
      createdAt: "2026-10-17T09:00:00Z",
      receiptNumber: "ASH-2026-9211",
    },
  ];
}

export function saveDonationsLedger(list: DonationRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(list));
  } catch {}
}

export async function processDonationGift(params: {
  fundId: string;
  fundName: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  isAnonymous?: boolean;
  note?: string;
}): Promise<{ success: boolean; record: DonationRecord; newTotal?: number }> {
  const receiptNumber = `ASH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const record: DonationRecord = {
    id: `gift-${Date.now()}`,
    fundId: params.fundId,
    fundName: params.fundName,
    amount: params.amount,
    donorName: params.isAnonymous ? "Anonymous Alum" : params.donorName || "Ashwood Friend",
    donorEmail: params.donorEmail,
    isAnonymous: Boolean(params.isAnonymous),
    note: params.note,
    createdAt: new Date().toISOString(),
    receiptNumber,
  };

  // 1. Save to local ledger
  const current = getDonationsLedger();
  const updated = [record, ...current];
  saveDonationsLedger(updated);

  // 2. Update Supabase fund raised amount
  let newRaisedTotal: number | undefined;
  try {
    if (isValidUuid(params.fundId)) {
      const { data: fund } = await supabase
        .from("funds")
        .select("raised_amount")
        .eq("id", params.fundId)
        .maybeSingle();

      if (fund) {
        newRaisedTotal = (fund.raised_amount || 0) + params.amount;
        await supabase
          .from("funds")
          .update({ raised_amount: newRaisedTotal })
          .eq("id", params.fundId);
      }
    }
  } catch (err) {
    console.warn("Supabase funds update notice:", err);
  }

  return { success: true, record, newTotal: newRaisedTotal };
}
