import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ExternalLink, Send, AlertCircle, Upload, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";
import { completeExistingMicrotask } from "@/lib/supabaseSync";

export interface SubmissionDialogProps {
  task: {
    id: string;
    title: string;
    hours?: number | null;
    posted_by?: string | null;
  } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmissionSuccess?: () => void;
}

export const SubmissionDialog: React.FC<SubmissionDialogProps> = ({
  task,
  isOpen,
  onOpenChange,
  onSubmissionSuccess,
}) => {
  const [submissionMethod, setSubmissionMethod] = useState<"url" | "file">("url");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!task) return null;

  const validateUrl = (url: string): boolean => {
    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError("Submission URL is required.");
      return false;
    }
    const isValid =
      trimmed.includes("github.com/") ||
      trimmed.includes("drive.google.com/") ||
      trimmed.includes("figma.com/") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("http://");

    if (!isValid) {
      setValidationError("Please provide a valid GitHub PR, Google Drive, or Figma URL.");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submissionMethod === "url") {
      if (!validateUrl(submissionUrl)) return;
    } else {
      if (!submissionFile) {
        setValidationError("Please select a file to upload.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await completeExistingMicrotask(task.id, {
        submission_url: submissionMethod === "url" ? submissionUrl.trim() : undefined,
        submission_file_name: submissionMethod === "file" && submissionFile ? submissionFile.name : undefined,
        submission_file_size: submissionMethod === "file" && submissionFile ? `${Math.round(submissionFile.size / 1024)} KB` : undefined,
        submission_note: notes.trim() || undefined,
      });

      toast.success("Deliverable submitted successfully for alumni review.");
      setSubmissionUrl("");
      setSubmissionFile(null);
      setNotes("");
      setValidationError(null);
      onOpenChange(false);
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err: any) {
      toast.error(`Submission failed: ${err.message || "Please check connection."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-rule bg-background p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rule pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Submit Deliverable
              </span>
              <Dialog.Title className="font-display text-xl text-foreground mt-1">
                {task.title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Task Summary Card */}
          <div className="border border-rule bg-paper p-3.5 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                Credibility Reward
              </span>
              <span className="text-accent font-semibold tabular-nums">
                +1 Binary Point Upon Alumni Approval
              </span>
            </div>
          </div>

          {/* Submission Method Toggle */}
          <div className="flex border border-rule bg-paper p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setSubmissionMethod("url");
                setValidationError(null);
              }}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                submissionMethod === "url"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              Public URL (GitHub / Drive / Figma)
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmissionMethod("file");
                setValidationError(null);
              }}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                submissionMethod === "file"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              File Upload
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {submissionMethod === "url" ? (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  Deliverable URL (GitHub PR / Google Drive / Figma) *
                </label>
                <div className="flex items-center border border-rule bg-paper px-3 py-2">
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/..."
                    value={submissionUrl}
                    onChange={(e) => {
                      setSubmissionUrl(e.target.value);
                      if (validationError) validateUrl(e.target.value);
                    }}
                    className="w-full bg-transparent font-mono text-xs text-foreground outline-none"
                  />
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                </div>
                {validationError && (
                  <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {validationError}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  Deliverable Document / Archive *
                </label>
                <div className="border border-dashed border-rule bg-paper p-4 text-center">
                  <input
                    type="file"
                    id="submission-file-input"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSubmissionFile(e.target.files[0]);
                        setValidationError(null);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="submission-file-input"
                    className="cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Upload className="h-5 w-5 text-accent" />
                    {submissionFile ? (
                      <span className="font-mono text-xs text-foreground font-semibold flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-accent" />
                        {submissionFile.name} ({Math.round(submissionFile.size / 1024)} KB)
                      </span>
                    ) : (
                      <>
                        <span className="font-mono text-xs text-foreground font-semibold link-u">
                          Click to select deliverable file
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          PDF, ZIP, TAR.GZ, or Markdown
                        </span>
                      </>
                    )}
                  </label>
                </div>
                {validationError && (
                  <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {validationError}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Implementation Notes &amp; Rationale (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention key architecture decisions, test results, benchmarks, or notes for the alumni reviewer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-rule bg-paper p-2.5 font-mono text-xs text-foreground outline-none resize-none focus:border-accent"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-rule">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary px-5 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground font-semibold transition-opacity disabled:opacity-40 hover:bg-accent cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit Deliverable
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
