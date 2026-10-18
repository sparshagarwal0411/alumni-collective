import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  FileText,
  Github,
  UploadCloud,
  CheckCircle2,
  Cpu,
  Sparkles,
  X,
  ArrowRight,
  Layers,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { TagChip, TagChipCluster, ExtractedTagItem } from "@/components/ui/TagChip";
import {
  parseResumePdf,
  parseGitHubSync,
  parseManualSubmission,
  ExtractedProfileData,
} from "@/services/aiService";
import {
  getStudentProfile,
  saveStudentProfile,
  StudentProfileData,
} from "@/lib/studentProfile";

export interface OmniParserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}

type TabMode = "resume" | "github" | "manual";

export const OmniParserModal: React.FC<OmniParserModalProps> = ({
  isOpen,
  onOpenChange,
  onCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>("resume");
  const [isParsing, setIsParsing] = useState(false);
  const [telemetryStep, setTelemetryStep] = useState<string>("");
  const [extractedData, setExtractedData] = useState<ExtractedProfileData | null>(null);

  // Resume Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // GitHub State
  const [githubUsername, setGithubUsername] = useState<string>("akashniranjan");

  // Manual State
  const [manualForm, setManualForm] = useState({
    fullName: "Akash Niranjan",
    branch: "Computer Engineering",
    gradYear: 2025,
    headline: "Undergrad Systems Architect @ DevComm NSUT | Rust & Distributed Data",
    city: "New Delhi, India",
    selectedSocieties: ["DevComm NSUT", "The Debugging Society"],
    skillsInput: "Rust, TypeScript, Distributed Systems, PostgreSQL, Docker",
    selectedDomain: "Systems & Infrastructure",
    positionsInput: "Core Systems Lead",
  });

  // Extracted Editable Tags State
  const [editableTags, setEditableTags] = useState<ExtractedTagItem[]>([]);
  const [overrideProfile, setOverrideProfile] = useState({
    fullName: "Akash Niranjan",
    headline: "Undergrad Systems Architect @ DevComm NSUT | Rust & Distributed Data",
    branch: "Computer Engineering",
    gradYear: 2025,
    city: "New Delhi, India",
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
      } else {
        toast.error("Only PDF documents are supported for resume extraction.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUseSampleResume = () => {
    const sample = new File(
      ["Akash Niranjan - NSUT Computer Engineering 2025 - DevComm NSUT - Rust & Systems Architect"],
      "Akash_Niranjan_Systems_Resume.pdf",
      { type: "application/pdf" }
    );
    setSelectedFile(sample);
    toast.success("Loaded sample scholar resume: Akash_Niranjan_Systems_Resume.pdf");
  };

  const executeExtraction = async (pipelineFn: () => Promise<ExtractedProfileData>) => {
    setIsParsing(true);
    setTelemetryStep("[01/03] Reading profile details & PDF AST...");

    const stepTimer1 = setTimeout(() => {
      setTelemetryStep("[02/03] Matching NSUT campus societies & technical taxonomy...");
    }, 350);

    const stepTimer2 = setTimeout(() => {
      setTelemetryStep("[03/03] Generating canonical vector tags & graph relations...");
    }, 700);

    try {
      const result = await pipelineFn();
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setExtractedData(result);
      setEditableTags(result.tags);
      setOverrideProfile({
        fullName: result.fullName,
        headline: result.headline,
        branch: result.branch,
        gradYear: result.gradYear,
        city: result.currentCity || "New Delhi, India",
      });
      toast.success(
        `✓ Extracted ${result.tags.length} vector tags in ${result.latencyMs}ms (${result.provider})`
      );
    } catch {
      toast.error("Extraction encountered an issue. Falling back to local taxonomy.");
    } finally {
      setIsParsing(false);
      setTelemetryStep("");
    }
  };

  const handleParsePdf = () => {
    if (!selectedFile) {
      toast.error("Please select or drop a PDF resume first.");
      return;
    }
    executeExtraction(() => parseResumePdf(selectedFile));
  };

  const handleParseGitHub = () => {
    if (!githubUsername.trim()) {
      toast.error("Please enter a GitHub username.");
      return;
    }
    executeExtraction(() => parseGitHubSync(githubUsername));
  };

  const handleParseManual = () => {
    const skills = manualForm.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const positions = manualForm.positionsInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    executeExtraction(() =>
      parseManualSubmission({
        fullName: manualForm.fullName,
        branch: manualForm.branch,
        gradYear: Number(manualForm.gradYear),
        headline: manualForm.headline,
        city: manualForm.city,
        societies: manualForm.selectedSocieties,
        skills,
        domain: manualForm.selectedDomain,
        positions,
      })
    );
  };

  const handleRemoveTag = (tagId: string) => {
    setEditableTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleApplyToDossier = () => {
    const current = getStudentProfile();

    const extractedSkillTags = editableTags
      .filter((t) => t.category === "SKILL")
      .map((t) => ({
        name: t.label,
        level: "Advanced" as const,
        category: "Systems & Cloud" as const,
      }));

    const mergedSkills = [...current.skills];
    extractedSkillTags.forEach((st) => {
      if (!mergedSkills.some((ms) => ms.name.toLowerCase() === st.name.toLowerCase())) {
        mergedSkills.push(st);
      }
    });

    const updated: StudentProfileData = {
      ...current,
      fullName: overrideProfile.fullName || current.fullName,
      headline: overrideProfile.headline || current.headline,
      department: overrideProfile.branch || current.department,
      gradYear: overrideProfile.gradYear || current.gradYear,
      city: overrideProfile.city || current.city,
      skills: mergedSkills,
      resume: selectedFile
        ? {
            fileName: selectedFile.name,
            fileSize: `${Math.round(selectedFile.size / 1024)} KB`,
            fileType: selectedFile.type || "application/pdf",
            uploadedAt: new Date().toISOString(),
            summaryNote: extractedData?.rawSummary || "Parsed via NSUT Archive Dual-AI Omni-Parser.",
          }
        : current.resume,
    };

    saveStudentProfile(updated);
    toast.success("✓ Profile synchronized! Dossier & knowledge tags updated successfully.");
    onOpenChange(false);
    if (onCompleted) onCompleted();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border border-rule bg-background p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rule pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent flex items-center gap-1.5 font-semibold">
                <Cpu className="h-3.5 w-3.5" />
                NSUT Archive // Dual-AI Omni-Parser
              </span>
              <Dialog.Title className="font-display text-2xl text-foreground mt-1 font-bold">
                Auto-Extract Profile from Resume
              </Dialog.Title>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Multimodal PDF extraction via Gemini 1.5 Flash + Groq Llama-3 with authentic NSUT taxonomy matching.
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 border border-rule bg-paper p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("resume")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 transition-colors cursor-pointer font-medium ${
                activeTab === "resume"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              PDF Resume
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("github")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 transition-colors cursor-pointer font-medium ${
                activeTab === "github"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Github className="h-3.5 w-3.5" />
              GitHub Sync
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 transition-colors cursor-pointer font-medium ${
                activeTab === "manual"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Manual Taxon
            </button>
          </div>

          {/* TAB 1: PDF Resume Upload */}
          {activeTab === "resume" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed p-6 text-center transition-colors ${
                  isDragOver ? "border-accent bg-accent/5" : "border-rule bg-paper/50"
                }`}
              >
                <UploadCloud className="h-8 w-8 mx-auto text-accent mb-2" />
                <p className="font-mono text-xs font-semibold text-foreground">
                  {selectedFile ? selectedFile.name : "Drag & drop undergraduate PDF resume here"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supports standard student CVs, IEEE formats, and academic folios.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <label className="inline-flex items-center gap-1.5 border border-rule bg-card px-3 py-1.5 font-mono text-xs text-foreground hover:border-accent cursor-pointer">
                    Browse File
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSampleResume}
                    className="inline-flex items-center gap-1.5 border border-accent bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer font-semibold"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Load Sample Resume
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!selectedFile || isParsing}
                  onClick={handleParsePdf}
                  className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {isParsing ? "Extracting..." : "Run Omni-Parser Ingestion"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GitHub Sync */}
          {activeTab === "github" && (
            <div className="space-y-4">
              <div className="border border-rule bg-paper p-4 space-y-3">
                <label className="font-mono text-xs text-foreground block font-medium">
                  GitHub Profile / Organization Username:
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">github.com/</span>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. akashniranjan"
                    className="flex-1 border border-rule bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Groq Llama-3 analyzes public commits, repos, and language distributions to map skills into NSUT taxonomy.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!githubUsername.trim() || isParsing}
                  onClick={handleParseGitHub}
                  className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {isParsing ? "Analyzing..." : "Sync GitHub Repositories"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Manual Classification */}
          {activeTab === "manual" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={manualForm.fullName}
                    onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                    className="w-full border border-rule bg-paper p-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Department / Branch</label>
                  <input
                    type="text"
                    value={manualForm.branch}
                    onChange={(e) => setManualForm({ ...manualForm, branch: e.target.value })}
                    className="w-full border border-rule bg-paper p-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={manualForm.skillsInput}
                  onChange={(e) => setManualForm({ ...manualForm, skillsInput: e.target.value })}
                  className="w-full border border-rule bg-paper p-2 text-foreground"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isParsing}
                  onClick={handleParseManual}
                  className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-primary-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  Classify into Taxonomy
                </button>
              </div>
            </div>
          )}

          {/* Telemetry Progress Bar */}
          {isParsing && (
            <div className="border border-accent/30 bg-accent/5 p-3 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-accent font-semibold">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  {telemetryStep}
                </span>
                <span className="text-[10px]">Processing...</span>
              </div>
              <div className="h-1 w-full bg-rule overflow-hidden">
                <div className="h-full bg-accent animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Extraction Results & Vector Tags Preview */}
          {extractedData && (
            <div className="border border-rule bg-card p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-rule pb-2">
                <span className="text-accent font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Extracted NSUT Knowledge Vectors ({editableTags.length} tags)
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {extractedData.provider} · {extractedData.latencyMs}ms · {Math.round(extractedData.confidence * 100)}% conf
                </span>
              </div>

              <TagChipCluster
                tags={editableTags}
                onRemove={handleRemoveTag}
                emptyLabel="All tags removed."
              />

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Extracted Name:</span>
                  <input
                    type="text"
                    value={overrideProfile.fullName}
                    onChange={(e) => setOverrideProfile({ ...overrideProfile, fullName: e.target.value })}
                    className="w-full border border-rule bg-background p-1.5 text-foreground"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Branch / Class:</span>
                  <input
                    type="text"
                    value={`${overrideProfile.branch} (${overrideProfile.gradYear})`}
                    onChange={(e) => setOverrideProfile({ ...overrideProfile, branch: e.target.value })}
                    className="w-full border border-rule bg-background p-1.5 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-rule flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Ready to update your student folio and 3D network relations.
                </p>
                <button
                  type="button"
                  onClick={handleApplyToDossier}
                  className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shadow-xs"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  Apply to Student Dossier
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
