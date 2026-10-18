import { supabase } from "@/integrations/supabase/client";
import type { Message, Profile } from "./mockData";
import { MOCK_MESSAGES, MOCK_PROFILES } from "./mockData";

const CHAT_STORAGE_KEY = "ashwood_unified_chat_messages";

// Event for cross-component / cross-tab synchronization
export const CHAT_UPDATED_EVENT = "ashwood_chat_updated";

export interface UnifiedMessage {
  id: string;
  sender: string; // user id or profile id
  senderName?: string;
  recipient: string; // user id or profile id
  recipientName?: string;
  body: string;
  created_at: string;
  is_ai_drafted?: boolean;
}

// Convert MOCK_MESSAGES to unified format
function getInitialMessages(): UnifiedMessage[] {
  return MOCK_MESSAGES.map((m) => {
    const senderProf = MOCK_PROFILES.find((p) => p.id === m.sender);
    const recipProf = MOCK_PROFILES.find((p) => p.id === m.recipient);
    return {
      id: m.id,
      sender: m.sender,
      senderName: senderProf?.full_name || (m.sender === "current-user" ? "You" : m.sender),
      recipient: m.recipient,
      recipientName: recipProf?.full_name || (m.recipient === "current-user" ? "You" : m.recipient),
      body: m.body,
      created_at: m.created_at,
      is_ai_drafted: m.is_ai_drafted ?? false,
    };
  });
}

export function getStoredMessages(): UnifiedMessage[] {
  if (typeof window === "undefined") return getInitialMessages();
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading chat storage", err);
  }
  const initial = getInitialMessages();
  saveStoredMessages(initial);
  return initial;
}

export function saveStoredMessages(msgs: UnifiedMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
    window.dispatchEvent(new CustomEvent(CHAT_UPDATED_EVENT, { detail: msgs }));
  } catch (err) {
    console.error("Error saving chat storage", err);
  }
}

// Check if string is valid UUID
function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Send a chat message with persistence + Supabase integration + bi-directional conversation
export async function sendUnifiedMessage({
  senderId,
  senderName,
  recipientId,
  recipientName,
  body,
  simulateAutoReply = false,
}: {
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  body: string;
  simulateAutoReply?: boolean;
}): Promise<UnifiedMessage> {
  const newMsg: UnifiedMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: senderId,
    senderName,
    recipient: recipientId,
    recipientName,
    body: body.trim(),
    created_at: new Date().toISOString(),
  };

  // 1. Immediately persist to unified local storage
  const current = getStoredMessages();
  const updated = [...current, newMsg];
  saveStoredMessages(updated);

  // 2. If both sender and recipient are UUIDs, persist to Supabase
  if (isUuid(senderId) && isUuid(recipientId)) {
    try {
      await supabase.from("messages").insert({
        sender: senderId,
        recipient: recipientId,
        body: body.trim(),
      });
    } catch (err) {
      console.warn("Supabase messages insert error (using local sync):", err);
    }
  }

  // 3. If chatting with an alumnus mentor who is not online, simulate a realistic warm reply
  if (simulateAutoReply) {
    setTimeout(() => {
      const replies = [
        `Thanks for reaching out, ${senderName.split(" ")[0]}! I took a look at your message and your student folio. Your work on systems architecture is sharp. I'd be glad to discuss next steps — would Tuesday afternoon work for a 20-minute call?`,
        `Hello ${senderName.split(" ")[0]}! Great to connect with an Ashwood student. We currently have openings at our team that match your focus. Let me review your resume and I'll flag it for our recruiting pipeline.`,
        `Hi ${senderName.split(" ")[0]}, glad you reached out! Happy to give feedback on your project or talk through career transitions. Let's set up some time on the office hours schedule.`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: UnifiedMessage = {
        id: `msg-${Date.now()}-reply`,
        sender: recipientId,
        senderName: recipientName,
        recipient: senderId,
        recipientName: senderName,
        body: randomReply,
        created_at: new Date().toISOString(),
      };

      const fresh = getStoredMessages();
      saveStoredMessages([...fresh, replyMsg]);
    }, 1500);
  }

  return newMsg;
}

// Get all conversations for a specific user ID or role
export function getConversationsForUser(userId: string, userRole: string, people: Profile[]) {
  const allMessages = getStoredMessages();

  // Normalize: what IDs represent the current user
  const myIds = new Set<string>([userId, "current-user"]);
  if (userRole === "student") {
    myIds.add("p-dev-sharma");
    myIds.add("student-user");
  } else if (userRole === "alumni") {
    myIds.add("p-arjun-nair");
    myIds.add("alumni-user");
  } else if (userRole === "faculty") {
    myIds.add("p-gayatri-sen");
    myIds.add("faculty-user");
  }

  // Find all unique partners
  const partnerMap = new Map<string, { lastMessage: UnifiedMessage; unreadCount: number }>();

  for (const m of allMessages) {
    const isMeSender = myIds.has(m.sender);
    const isMeRecipient = myIds.has(m.recipient);

    let partnerId = "";
    if (isMeSender && !isMeRecipient) {
      partnerId = m.recipient;
    } else if (isMeRecipient && !isMeSender) {
      partnerId = m.sender;
    } else if (!isMeSender && !isMeRecipient) {
      // Default: if viewed from student perspective, other messages involve sample alumni
      partnerId = m.sender;
    }

    if (partnerId && partnerId !== "current-user") {
      partnerMap.set(partnerId, { lastMessage: m, unreadCount: 0 });
    }
  }

  return partnerMap;
}
