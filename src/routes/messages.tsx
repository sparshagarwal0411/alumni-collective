import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Monogram, PageHead, SampleTag, Section } from "@/components/site/ui";
import { profilesQuery } from "@/lib/queries";
import { MOCK_MESSAGES, type Message } from "@/lib/mockData";
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
  const profilesResult = useQuery(profilesQuery);
  const people = profilesResult.data ?? [];

  const [activePartnerId, setActivePartnerId] = useState<string>("p-arjun-nair");
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

  // Partners with active conversations
  const chatPartners = useMemo(() => {
    const partnerIds = new Set<string>();
    for (const m of messages) {
      if (m.sender !== "current-user") partnerIds.add(m.sender);
      if (m.recipient !== "current-user") partnerIds.add(m.recipient);
    }
    return people.filter((p) => partnerIds.has(p.id));
  }, [messages, people]);

  const activePartner = useMemo(() => {
    return people.find((p) => p.id === activePartnerId) || people[0] || null;
  }, [people, activePartnerId]);

  const activeConversation = useMemo(() => {
    if (!activePartner) return [];
    return messages.filter(
      (m) =>
        (m.sender === activePartner.id && m.recipient === "current-user") ||
        (m.sender === "current-user" && m.recipient === activePartner.id)
    );
  }, [messages, activePartner]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "current-user",
      recipient: activePartner.id,
      body: inputText.trim(),
      created_at: new Date().toISOString(),
      is_ai_drafted: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    toast.success("Message dispatched.");
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
        <div className="border border-rule bg-paper min-h-[620px] grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-sm">
          {/* Left: Chat Partner List */}
          <div className="md:col-span-4 border-r border-rule flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-rule bg-background flex items-center justify-between">
                <span className="eyebrow">Active Inquiries</span>
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
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                        isSelected ? "bg-background border-l-2 border-accent" : "hover:bg-background/50"
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
                          className={`max-w-lg p-4 text-sm leading-relaxed ${
                            isMe
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
      </Section>
    </>
  );
}
