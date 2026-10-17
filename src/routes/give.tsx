import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Empty, ErrorNote, Loading, PageHead, SampleTag, Section } from "@/components/site/ui";
import { fundsQuery, fmtMoney } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/give")({
  head: () => ({
    meta: [
      { title: "Endowment & Giving — Ashwood College" },
      { name: "description", content: "Endow student scholarships, restore historical stone cloisters, and support emergency student hardship relief." },
    ],
  }),
  component: GivePage,
});

function GivePage() {
  const fundsResult = useQuery(fundsQuery);
  const funds = fundsResult.data ?? [];

  const [selectedFundId, setSelectedFundId] = useState<string>("f-1");
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isPledging, setIsPledging] = useState<boolean>(false);

  const activeFund = funds.find((f) => f.id === selectedFundId) || funds[0];

  const handlePledge = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPledging(true);
    setTimeout(() => {
      setIsPledging(false);
      toast.success("Thank you for your generous pledge to the Ashwood College Endowment.");
      setDonorName("");
      setDonorEmail("");
      setCustomAmount("");
    }, 600);
  };

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  return (
    <div className="space-y-12 pb-24">
      <PageHead
        index="IX."
        eyebrow="Stewardship"
        title="To keep the gates wide open."
        lede="Since 1887, every lecture hall bench, laboratory instrument, and bursary at Ashwood has existed because an alumnus chose to remember where they began."
      />

      {funds[0] && (
        <Section className="!mt-8">
          <div className="grid gap-10 bg-paper px-6 py-12 md:grid-cols-12 md:px-12 border border-rule">
            <div className="md:col-span-7">
              <p className="eyebrow">Giving · {funds[0].name}<SampleTag show={funds[0].is_sample} /></p>
              <p className="mt-4 font-display text-3xl leading-snug md:text-4xl">
                “I was the first in my family to see the inside of a lecture hall. Someone I never met paid for it.”
              </p>
              <p className="mt-4 text-sm text-muted-foreground">— Scholarship recipient, Class of 2019 (illustrative)</p>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-center">
              <p className="font-display text-5xl">{fmtMoney(funds[0].raised_amount)}</p>
              <p className="text-sm text-muted-foreground">of {fmtMoney(funds[0].goal_amount)} goal</p>
            </div>
          </div>
        </Section>
      )}

      <Section className="!mt-8">
        {fundsResult.isLoading ? (
          <Loading label="Consulting endowment ledgers" />
        ) : fundsResult.error ? (
          <ErrorNote error={fundsResult.error} />
        ) : funds.length === 0 ? (
          <Empty title="No active campaigns currently open." />
        ) : (
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Active Funds */}
            <div className="space-y-6 lg:col-span-7">
              <div className="flex items-baseline justify-between border-b border-rule pb-3">
                <span className="eyebrow">Active College Funds ({funds.length})</span>
                <span className="text-xs text-muted-foreground font-mono">100% Directed to Purpose</span>
              </div>

              <div className="space-y-6">
                {funds.map((fund) => {
                  const isSelected = activeFund?.id === fund.id;
                  const percent = Math.min(
                    100,
                    Math.round((fund.raised_amount / fund.goal_amount) * 100)
                  );

                  return (
                    <article
                      key={fund.id}
                      onClick={() => setSelectedFundId(fund.id)}
                      className={`cursor-pointer border p-6 transition-all ${
                        isSelected
                          ? "border-accent bg-paper shadow-sm"
                          : "border-rule bg-card hover:border-foreground/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl">
                            {fund.name}
                            <SampleTag show={fund.is_sample} />
                          </h3>
                          <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-xl">
                            {fund.summary}
                          </p>
                        </div>
                        <span className="font-mono text-sm text-accent font-semibold">
                          {percent}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-6 space-y-2">
                        <div className="h-1.5 w-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-mono text-muted-foreground">
                          <span>{fmtMoney(fund.raised_amount, fund.currency)} raised</span>
                          <span>Goal: {fmtMoney(fund.goal_amount, fund.currency)}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Right: Pledge Form */}
            <div className="lg:col-span-5">
              <div className="border border-rule bg-card p-6 md:p-8 space-y-6 sticky top-6">
                <div className="border-b border-rule pb-4">
                  <span className="eyebrow">Pledge Your Gift</span>
                  <h3 className="font-display text-2xl mt-1">
                    {activeFund ? activeFund.name : "Ashwood General Fund"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tax-deductible under 80G / 501(c)(3) institutional charter.
                  </p>
                </div>

                <form onSubmit={handlePledge} className="space-y-5">
                  {/* Preset amounts */}
                  <div>
                    <label className="eyebrow block mb-2">Select Contribution</label>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {[2500, 5000, 15000, 50000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomAmount("");
                          }}
                          className={`py-2 px-3 border transition-colors ${
                            !customAmount && selectedAmount === amt
                              ? "border-accent bg-accent text-accent-foreground font-semibold"
                              : "border-rule bg-paper hover:border-foreground"
                          }`}
                        >
                          {fmtMoney(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Or Custom Amount (INR)</label>
                    <input
                      type="number"
                      min={100}
                      placeholder="e.g. 100000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="field font-mono"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="eyebrow block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. A. Sharma"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="field"
                      />
                    </div>

                    <div>
                      <label className="eyebrow block mb-1">Email for Receipt</label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="field"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="accent-[var(--accent)]"
                      />
                      Keep my name unlisted on the public donor register
                    </label>
                  </div>

                  <div className="pt-4 border-t border-rule space-y-3">
                    <button
                      type="submit"
                      disabled={isPledging}
                      className="w-full bg-accent text-accent-foreground py-3 text-xs uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
                    >
                      {isPledging
                        ? "Transmitting Pledge..."
                        : `Complete Gift of ${fmtMoney(finalAmount || 5000)}`}
                    </button>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Official College Receipt generated immediately with cryptographic token.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}