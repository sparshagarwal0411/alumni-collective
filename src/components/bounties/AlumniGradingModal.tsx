import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, ExternalLink, ShieldCheck, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { gradeExistingMicrotask } from "@/lib/supabaseSync";

export interface AlumniGradingModalProps {
  task: {
    id: string;
    title: string;
    submission_url?: string;
    submission_file_name?: string;
    submission_file_size?: string;
    submission_note?: string;
    submitted_at?: string;
    claimed_by?: string | null;
    hours?: number | null;
    grade?: "0" | "1" | null;
    reviewer_feedback?: string | null;
  } | null;
  studentName?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGraded?: () => void;
}

export const AlumniGradingModal: React.FC<AlumniGradingModalProps> = ({
  task,
  studentName,
  isOpen,
  onOpenChange,
  onGraded,
}) => {
  const [feedback, setFeedback] = useState(task?.reviewer_feedback || "");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!task) return null;

  const handleGrade = async (grade: "0" | "1") => {
    setIsProcessing(true);
    try {
      await gradeExistingMicrotask(task.id, grade, feedback);
      if (grade === "1") {
        toast.success("Approved! Awarded +1 credibility point to student.");
      } else {
        toast.info("Submission returned with feedback for student revisions.");
      }

      setFeedback("");
      onOpenChange(false);
      if (onGraded) onGraded();
    } catch (err: any) {
      toast.error(`Could not submit review: ${err.message || "Please try again."}`);
    } finally {
      setIsProcessing(false);
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
                <ShieldCheck className="h-3.5 w-3.5" />
                Alumni Review Desk
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

          {/* Student & Deliverable Details */}
          <div className="border border-rule bg-paper p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                Student Worker
              </span>
              <span className="text-foreground font-semibold">
                {studentName || "Ashwood Student Scholar"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                Point Reward
              </span>
              <span className="text-accent font-semibold tabular-nums">
                +1 Binary Credibility Point
              </span>
            </div>

            {task.submitted_at && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  Submitted At
                </span>
                <span className="text-foreground">
                  {new Date(task.submitted_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {task.submission_url && (
              <div className="pt-2 border-t border-rule flex items-center justify-between">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  Deliverable URL
                </span>
                <a
                  href={task.submission_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-accent hover:underline text-[11px] truncate max-w-[280px]"
                >
                  <span className="truncate">{task.submission_url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}

            {task.submission_file_name && (
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  Attached File
                </span>
                <span className="text-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3 text-accent" />
                  {task.submission_file_name} {task.submission_file_size && `(${task.submission_file_size})`}
                </span>
              </div>
            )}

            {task.submission_note && (
              <div className="pt-2 border-t border-rule">
                <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  Student Note:
                </span>
                <p className="font-serif text-xs text-ink-soft italic">
                  &ldquo;{task.submission_note}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Feedback Input */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Feedback &amp; Notes
            </label>
            <textarea
              rows={3}
              placeholder="Provide constructive feedback, notes on architectural trade-offs, or review comments..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-rule bg-paper p-2.5 font-mono text-xs text-foreground outline-none resize-none focus:border-accent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-rule">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleGrade("0")}
              className="flex items-center gap-1.5 border border-red-500/40 bg-red-500/10 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              Request Changes
            </button>

            <div className="flex items-center gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="border border-rule px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleGrade("1")}
                className="flex items-center gap-1.5 bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground font-semibold transition-opacity disabled:opacity-40 hover:bg-accent cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Approve Submission (+1 pt)
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
