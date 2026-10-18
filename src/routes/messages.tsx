import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { profilesQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import {
  getStoredMessages,
  sendUnifiedMessage,
  CHAT_UPDATED_EVENT,
  type UnifiedMessage,
} from "@/lib/chatStore";
import { Lock, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  validateSearch: (search: Record<string, unknown>) => search,
  head: () => ({
    meta: [
      { title: "Direct Inquiries & Messages — Ashwood College" },
      { name: "description", content: "Warm conversational threads prioritized by mutual college bonds and microtask credibility." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, currentRole, signInAsDemo } = useAuth();
  const profilesResult = useQuery(profilesQuery);
  const people = profilesResult.data ?? [];


  const [activePartnerId, setActivePartnerId] = useState<string>("p-arjun-nair");
  const [messages, setMessages] = useState<UnifiedMessage[]>(getStoredMessages());
  const [inputText, setInputText] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setMessages(getStoredMessages());
    };
    window.addEventListener(CHAT_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CHAT_UPDATED_EVENT, handleUpdate);
  }, []);

  const myId = user?.id || (currentRole === "student" ? "student-user" : "current-user");
  const myIds = new Set<string>([myId, "current-user", "student-user"]);

  // Partners with active conversations
  const chatPartners = useMemo(() => {
    const partnerIds = new Set<string>();
    for (const m of messages) {
      if (!myIds.has(m.sender)) partnerIds.add(m.sender);
      if (!myIds.has(m.recipient)) partnerIds.add(m.recipient);
    }
    const list = people.filter((p) => partnerIds.has(p.id));
    return list.length > 0 ? list : people.slice(0, 5);
  }, [messages, people, myId]);

  const activePartner = useMemo(() => {
    return people.find((p) => p.id === activePartnerId) || chatPartners[0] || people[0] || null;
  }, [people, activePartnerId, chatPartners]);

  const activeConversation = useMemo(() => {
    if (!activePartner) return [];
    return messages.filter(
      (m) =>
        (m.sender === activePartner.id && myIds.has(m.recipient)) ||
        (myIds.has(m.sender) && m.recipient === activePartner.id) ||
        (m.sender === activePartner.id && m.recipient === "current-user") ||
        (m.sender === "current-user" && m.recipient === activePartner.id)
    );
  }, [messages, activePartner, myId]);

  // AI "Agentic Drafter" logic
  const handleGenerateDraft = () => {
    if (!activePartner) return;
    setIsDrafting(true);
    setTimeout(() => {
      setIsDrafting(false);
      const draft = `Hello ${activePartner.full_name.split(" ")[0]},\n\nI noticed we share an academic background from Ashwood's ${activePartner.department ?? "cohort"} as well as mutual interest in ${activePartner.skills?.[0] || "frontier technology"}. I've been following your recent work at ${activePartner.company || "your team"} and would appreciate the chance to seek your perspective on next career steps when your schedule allows.\n\nBest regards,\nActive Ashwood Student`;
      setInputText(draft);
      toast.success("AI Warm Drafter: Contextual introduction generated from shared college records.");
    }, 700);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner) return;

    const body = inputText.trim();
    setInputText("");

    const myName =
      user?.user_metadata?.full_name ||
      (currentRole === "student" ? "Dev Sharma (Student)" : "Ashwood Member");

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

  return (
    <>
      <PageHead
        index="VII."
        eyebrow="Inbox"
        title="Direct inquiries and warm dispatches."
        lede="Messages prioritized by relational credibility and mutual tags rather than cold recruitment noise."
      />

      <Section className="mt-4">
        {!user ? (
          <div className="border border-rule bg-paper p-8 md:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 border border-accent/30 text-accent">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <span className="eyebrow text-accent">Member Authentication Required</span>
              <h2 className="font-display text-3xl md:text-4xl mt-2 text-foreground">
                Private Chat & Inquiries Channel
              </h2>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Direct messaging with fellow alumni, faculty mentors, and students is exclusively available to authenticated Ashwood College members.
              </p>
            </div>

            <div className="border border-rule bg-card/60 p-4 rounded text-left space-y-2">
              <span className="eyebrow block">Roles Permitted:</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="border border-rule bg-background px-2.5 py-1 rounded">🎓 Student</span>
                <span className="border border-rule bg-background px-2.5 py-1 rounded">🏛️ Faculty</span>
                <span className="border border-rule bg-background px-2.5 py-1 rounded">💼 Alum</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/auth"
                search={{ redirect: "/messages", intent: "chat" }}
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
              >
                Sign In to Access Chat
              </Link>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground font-mono">
                <span>Or quick test:</span>
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
                  onClick={() => signInAsDemo("faculty")}
                  className="link-u text-foreground hover:text-accent cursor-pointer"
                >
                  Faculty
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
            </div>
          </div>
        ) : (
          <div className="border border-rule bg-paper min-h-[620px] grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-sm">
            {/* Left: Chat Partner List */}
            <div className="md:col-span-4 border-r border-rule flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-rule bg-background flex items-center justify-between">
                  <div>
                    <span className="eyebrow">Active Inquiries</span>
                    <p className="font-mono text-[10px] text-accent mt-0.5">
                      Logged in as {currentRole.toUpperCase()}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    Sorted by Warmth
                  </span>
                </div>

                <div className="divide-y divide-rule max-h-[540px] overflow-y-auto">
                  {chatPartners.map((partner) => {
                    const isSelected = activePartner?.id === partner.id;
                    const latestMsg = messages
                      .filter(
                        (m) =>
                          (m.sender === partner.id && m.recipient === "current-user") ||
                          (m.sender === "current-user" && m.recipient === partner.id)
                      )
                      .slice(-1)[0];

                    return (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => setActivePartnerId(partner.id)}
                        className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${isSelected ? "bg-background border-l-2 border-accent" : "hover:bg-background/50"
                          }`}
                      >
                        <Monogram name={partner.full_name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-display text-base truncate font-medium text-foreground">
                              {partner.full_name}
                            </p>
                            <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                              Class of '{String(partner.grad_year).slice(2)}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft truncate mt-0.5">
                            {partner.company} · {partner.role_title}
                          </p>
                          {latestMsg && (
                            <p className="text-xs text-muted-foreground truncate mt-2 italic font-serif">
                              "{latestMsg.body}"
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-rule bg-background/50 text-xs text-muted-foreground">
                Direct connection ranking powered by verified microtask proof and shared academic cohort.
              </div>
            </div>

            {/* Right: Active Conversation */}
            <div className="md:col-span-8 flex flex-col justify-between bg-card min-h-[500px]">
              {activePartner ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-rule bg-background flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monogram name={activePartner.full_name} size="sm" />
                      <div>
                        <p className="font-display text-lg leading-tight flex items-center gap-2">
                          {activePartner.full_name}
                          <SampleTag show={activePartner.is_sample} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activePartner.headline || `${activePartner.role_title} at ${activePartner.company}`}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/alumni/$id"
                      params={{ id: activePartner.id }}
                      className="link-u text-xs font-mono"
                    >
                      View Record →
                    </Link>
                  </div>

                  {/* Message Log */}
                  <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {activeConversation.map((msg) => {
                      const isMe = msg.sender === "current-user";

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-lg p-4 text-sm leading-relaxed ${isMe
                                ? "bg-primary text-primary-foreground font-sans"
                                : "bg-paper border border-rule text-foreground font-sans"
                              }`}
                          >
                            <p className="whitespace-pre-line">{msg.body}</p>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.is_ai_drafted && " · AI Assisted"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Area with Magic Wand Drafter */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-rule bg-background space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="eyebrow">Compose Statement</span>
                      <button
                        type="button"
                        onClick={handleGenerateDraft}
                        disabled={isDrafting}
                        className="inline-flex items-center gap-1.5 text-accent hover:underline disabled:opacity-50 font-mono text-[11px]"
                      >
                        <span className="text-xs">✨</span>
                        {isDrafting ? "Synthesizing shared context..." : "AI Warm Intro Drafter"}
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Write a considerate message citing your shared Ashwood background..."
                      className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                    />

                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-muted-foreground">
                        Press Send to transmit directly to the alumnus portal.
                      </p>
                      <button
                        type="submit"
                        className="bg-primary px-5 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  Select an inquiry thread from the left pane.
                </div>
              )}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
