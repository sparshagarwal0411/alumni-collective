import React from "react";
import { X } from "lucide-react";

export type TagCategory = "SKILL" | "SOCIETY" | "POSITION" | "DOMAIN" | "BRANCH" | "GRAD_YEAR";

const ACCENTS: Record<TagCategory, string> = {
  SKILL: "text-foreground border-rule bg-paper",
  SOCIETY: "text-accent border-accent/40 bg-accent/10 font-semibold",
  POSITION: "text-muted-foreground border-rule bg-paper",
  DOMAIN: "text-foreground border-rule bg-paper",
  BRANCH: "text-muted-foreground border-rule bg-paper",
  GRAD_YEAR: "text-foreground border-rule bg-paper",
};

export interface ExtractedTagItem {
  id: string;
  label: string;
  category: TagCategory;
}

interface TagChipProps {
  label: string;
  category: TagCategory;
  onRemove?: () => void;
  readOnly?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  category,
  onRemove,
  readOnly = false,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${ACCENTS[category] || "text-foreground border-rule bg-paper"}`}
  >
    <span className="opacity-60">{category.replace("_", " ")}</span>
    <span className="opacity-30">·</span>
    <span className="font-medium">{label}</span>
    {!readOnly && onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-muted-foreground opacity-50 transition-opacity hover:opacity-100 hover:text-foreground cursor-pointer"
        aria-label={`Remove ${label}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    )}
  </span>
);

interface TagChipClusterProps {
  tags: ExtractedTagItem[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  emptyLabel?: string;
}

export const TagChipCluster: React.FC<TagChipClusterProps> = ({
  tags,
  onRemove,
  readOnly = false,
  emptyLabel = "No tags extracted.",
}) => {
  if (tags.length === 0) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground opacity-50">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <TagChip
          key={t.id}
          label={t.label}
          category={t.category}
          readOnly={readOnly}
          onRemove={onRemove ? () => onRemove(t.id) : undefined}
        />
      ))}
    </div>
  );
};
