import React, { useState } from "react";
import { Building2 } from "lucide-react";
import { getCompanyMeta } from "@/lib/companies";

export interface CompanyLogoProps {
  company?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "mark" | "pill" | "inline";
  showName?: boolean;
  nameClassName?: string;
}

const SIZE_MAP = {
  xs: "h-4 w-4 text-[10px]",
  sm: "h-6 w-6 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
} as const;

export function CompanyLogo({
  company,
  size = "md",
  className = "",
  variant = "mark",
  showName = false,
  nameClassName = "",
}: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const meta = getCompanyMeta(company);

  if (!company) {
    return (
      <div
        className={`inline-flex shrink-0 items-center justify-center rounded-sm border border-rule bg-paper text-muted-foreground ${SIZE_MAP[size]} ${className}`}
        title="Unknown Organization"
      >
        <Building2 className="h-1/2 w-1/2" />
      </div>
    );
  }

  const renderOfficialSvg = () => {
    switch (meta?.id) {
      case "anthropic":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Anthropic logo">
            <rect width="24" height="24" rx="4.5" fill="#CC785C" />
            <path
              d="M13.88 4.2h-3.76L4.5 19.8h3.76l1.32-3.66h4.84l1.32 3.66h3.76L13.88 4.2zm-3.4 9.16l1.42-3.94 1.42 3.94h-2.84z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "deepmind":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Google DeepMind logo">
            <rect width="24" height="24" rx="4.5" fill="#FFFFFF" className="dark:fill-slate-900" />
            <path
              fill="#4285F4"
              d="M21.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.34c-.23 1.23-.94 2.27-2 2.97v2.49h3.24c1.9-1.75 2.92-4.33 2.92-7.47z"
            />
            <path
              fill="#34A853"
              d="M12 21.9c2.67 0 4.92-.88 6.56-2.4l-3.24-2.49c-.89.6-2.02.96-3.32.96-2.55 0-4.72-1.72-5.49-4.04H3.18v2.57C4.81 19.72 8.16 21.9 12 21.9z"
            />
            <path
              fill="#FBBC05"
              d="M6.51 13.93c-.2-.6-.31-1.25-.31-1.93s.11-1.33.31-1.93V7.5H3.18C2.5 8.86 2.1 10.38 2.1 12s.4 3.14 1.08 4.5l3.33-2.57z"
            />
            <path
              fill="#EA4335"
              d="M12 6.07c1.45 0 2.76.5 3.79 1.48l2.84-2.84C16.91 3.12 14.66 2.1 12 2.1 8.16 2.1 4.81 4.28 3.18 7.5l3.33 2.57c.77-2.32 2.94-4.04 5.49-4.04z"
            />
          </svg>
        );

      case "stripe":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Stripe logo">
            <rect width="24" height="24" rx="4.5" fill="#635BFF" />
            <path
              d="M13.6 8.8c-1.8-.7-2.8-1.2-2.8-2 0-.7.6-1.1 1.6-1.1 1.9 0 3.8.7 5.1 1.4l.7-4.5C16.9 2 15.1 1.2 12.3 1.2c-4.2 0-7.3 2.3-7.3 5.9 0 3.4 2.2 4.9 5.8 6.1 2.2.8 2.9 1.3 2.9 2.1 0 .8-.7 1.2-1.9 1.2-1.9 0-4.3-.9-5.9-1.8l-.8 4.6c1.6.8 3.9 1.7 6.8 1.7 4.3 0 7.7-2.2 7.7-6 0-3.6-2.4-5.1-6-6.2z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "apple":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Apple logo">
            <rect width="24" height="24" rx="4.5" fill="#18181B" className="dark:fill-zinc-800" />
            <path
              d="M16.5 17.2c-.6.9-1.2 1.7-2.2 1.8-.9 0-1.2-.5-2.3-.5-1.1 0-1.4.5-2.3.6-.9 0-1.6-.9-2.2-1.8-1.2-1.8-2.1-5.1-.9-7.2.6-1.1 1.7-1.7 2.9-1.8.9 0 1.8.6 2.3.6.6 0 1.6-.8 2.7-.6.5 0 1.8.2 2.6 1.4-.1 0-1.5.9-1.5 2.7 0 2.1 1.9 2.8 1.9 2.8-.2.5-.5 1.2-1.2 2zm-1.9-9.3c.4-.5.7-1.3.6-2.1-.7 0-1.4.4-1.9 1-.4.5-.8 1.2-.7 2 .8 0 1.5-.4 2-.9z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "microsoft":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Microsoft logo">
            <rect width="24" height="24" rx="4.5" fill="#FFFFFF" className="dark:fill-slate-900" />
            <rect x="3.5" y="3.5" width="7.8" height="7.8" fill="#F25022" />
            <rect x="12.7" y="3.5" width="7.8" height="7.8" fill="#7FBA00" />
            <rect x="3.5" y="12.7" width="7.8" height="7.8" fill="#00A4EF" />
            <rect x="12.7" y="12.7" width="7.8" height="7.8" fill="#FFB900" />
          </svg>
        );

      case "adobe":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Adobe logo">
            <rect width="24" height="24" rx="4.5" fill="#EB1000" />
            <polygon points="15.1,4 20,18.5 16.5,18.5 15,14 11.4,14 13.9,6.5" fill="#FFFFFF" />
            <polygon points="8.9,4 4,18.5 7.5,18.5 9,14 10.4,14" fill="#FFFFFF" />
            <polygon points="12,10.2 13.9,15.8 10.1,15.8" fill="#FFFFFF" />
          </svg>
        );

      case "linear":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Linear logo">
            <rect width="24" height="24" rx="4.5" fill="#5E6AD2" />
            <path
              d="M4.6 13.7c-.2-.6-.3-1.1-.3-1.7 0-4.2 3.4-7.6 7.6-7.6.6 0 1.1.1 1.7.3L4.6 13.7zm1.6 3.1L16.8 6.2c.4.4.7.9 1 1.4L7.6 17.8c-.5-.3-1-.6-1.4-1zm3.1 2.6L19.4 9.3c.2.6.3 1.1.3 1.7 0 4.2-3.4 7.6-7.6 7.6-.6 0-1.1-.1-1.7-.3z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "zerodha":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Zerodha logo">
            <rect width="24" height="24" rx="4.5" fill="#387ED1" />
            <path d="M5.5 7.5h11l-6.8 8.5h6.8v2H5.5l6.8-8.5H5.5v-2z" fill="#FFFFFF" />
            <circle cx="17.2" cy="7.8" r="1.6" fill="#FF5722" />
          </svg>
        );

      case "peakxv":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Peak XV logo">
            <rect width="24" height="24" rx="4.5" fill="#0D5C3A" />
            <path d="M4 18l5.5-9 3.5 5.5 2-3 5 6.5H4z" fill="#FFFFFF" fillOpacity="0.95" />
            <path d="M12 9l2.5-4 4.5 7-1.8 1.2-2.7-4.2L12 9z" fill="#E5A93C" />
          </svg>
        );

      case "citadel":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Citadel logo">
            <rect width="24" height="24" rx="4.5" fill="#002D62" />
            <rect x="5.5" y="5.5" width="5.5" height="5.5" rx="1" fill="#FFFFFF" />
            <rect x="13" y="5.5" width="5.5" height="5.5" rx="1" fill="#38BDF8" />
            <rect x="5.5" y="13" width="5.5" height="5.5" rx="1" fill="#38BDF8" />
            <rect x="13" y="13" width="5.5" height="5.5" rx="1" fill="#FFFFFF" />
          </svg>
        );

      case "synapse":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Synapse Robotics logo">
            <rect width="24" height="24" rx="4.5" fill="#0B1329" />
            <line x1="7" y1="8" x2="11" y2="11" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="17" y1="8" x2="13" y2="11" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7.5" y1="16" x2="11" y2="13" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16.5" y1="16" x2="13" y2="13" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3.2" fill="#00F0FF" />
            <circle cx="6" cy="7.5" r="2" fill="#818CF8" />
            <circle cx="18" cy="7.5" r="2" fill="#818CF8" />
            <circle cx="6.5" cy="16.5" r="2" fill="#38BDF8" />
            <circle cx="17.5" cy="16.5" r="2" fill="#38BDF8" />
          </svg>
        );

      case "oxfordbiomed":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Oxford BioMed logo">
            <rect width="24" height="24" rx="4.5" fill="#002147" />
            <path
              d="M6.5 5.5c2.5 0 3.5 3.5 5.5 6.5s3 6.5 5.5 6.5"
              stroke="#00A3E0"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M17.5 5.5c-2.5 0-3.5 3.5-5.5 6.5s-3 6.5-5.5 6.5"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="2" fill="#F59E0B" />
          </svg>
        );

      case "verve":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Verve Climate logo">
            <rect width="24" height="24" rx="4.5" fill="#064E3B" />
            <path
              d="M12 4C8 4 5 7.5 5 11.5c0 4 3 8 7 8s7-4 7-8c0-4-3-7.5-7-7.5zm0 3c2.8 0 4.2 2.5 4.2 4.5 0 2-1.4 4.5-4.2 4.5-2.8 0-4.2-2.5-4.2-4.5 0-2 1.4-4.5 4.2-4.5z"
              fill="#34D399"
            />
            <circle cx="12" cy="11.5" r="2.2" fill="#A7F3D0" />
          </svg>
        );

      case "latham":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Latham & Watkins logo">
            <rect width="24" height="24" rx="4.5" fill="#0A192F" />
            <text
              x="3.5"
              y="16.5"
              fontFamily="Georgia, 'Newsreader', serif"
              fontSize="10"
              fontWeight="bold"
              fill="#D4AF37"
            >
              L
            </text>
            <text x="8.8" y="15" fontFamily="sans-serif" fontSize="7.5" fontWeight="bold" fill="#E2E8F0">
              &amp;
            </text>
            <text
              x="13"
              y="16.5"
              fontFamily="Georgia, 'Newsreader', serif"
              fontSize="10"
              fontWeight="bold"
              fill="#D4AF37"
            >
              W
            </text>
          </svg>
        );

      case "amazon":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Amazon logo">
            <rect width="24" height="24" rx="4.5" fill="#232F3E" />
            <path d="M5.5 14.5c3.5 2.5 8.5 2.5 12 0" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" />
            <path
              d="M15.5 13.5l2.4 1.2-1.1 2.4"
              stroke="#FF9900"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "meta":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Meta logo">
            <rect width="24" height="24" rx="4.5" fill="#0668E1" />
            <path
              d="M7.8 8C5.7 8 4 9.8 4 12s1.7 4 3.8 4c1.8 0 3-1.1 4.2-2.8 1.2 1.7 2.4 2.8 4.2 2.8 2.1 0 3.8-1.8 3.8-4s-1.7-4-3.8-4c-1.8 0-3 1.1-4.2 2.8C10.8 9.1 9.6 8 7.8 8zm0 2.2c1.2 0 2.2 1.2 3.1 2.5-.9 1.3-1.9 2.5-3.1 2.5-1.1 0-1.9-.9-1.9-2.1 0-1.2.8-2.1 1.9-2.1zm8.4 0c1.1 0 1.9.9 1.9 2.1 0 1.2-.8 2.1-1.9 2.1-1.2 0-2.2-1.2-3.1-2.5.9-1.3 1.9-2.5 3.1-2.5z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "openai":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="OpenAI logo">
            <rect width="24" height="24" rx="4.5" fill="#10A37F" />
            <path
              d="M12 4.5a3.5 3.5 0 0 1 3.4 2.7l.1.5v3.2l2.3-1.3a3.5 3.5 0 0 1 4.7 1.3 3.5 3.5 0 0 1-1.2 4.8l-2.8 1.6v2.7a3.5 3.5 0 0 1-5.2 3l-2.3-1.3-2.3 1.3a3.5 3.5 0 0 1-5.2-3v-2.7l-2.8-1.6a3.5 3.5 0 0 1-1.2-4.8 3.5 3.5 0 0 1 4.7-1.3l2.3 1.3V7.7a3.5 3.5 0 0 1 3.5-3.2zm0 5l-2.2 1.3v2.5l2.2 1.3 2.2-1.3v-2.5L12 9.5z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "nvidia":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="NVIDIA logo">
            <rect width="24" height="24" rx="4.5" fill="#111827" />
            <path
              d="M12 4.5c4.1 0 7.5 3.4 7.5 7.5s-3.4 7.5-7.5 7.5c-3.1 0-5.7-1.9-6.9-4.6.6.6 1.4 1 2.3 1 2.2 0 4-1.8 4-4s-1.8-4-4-4c-.9 0-1.7.4-2.3 1 1.2-2.7 3.8-4.4 6.9-4.4zm0 3c2.5 0 4.5 2 4.5 4.5S14.5 16.5 12 16.5c-1.4 0-2.6-.6-3.4-1.6.4.1.8.2 1.2.2 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5c-.4 0-.8.1-1.2.2.8-1 2-1.8 3.4-1.8z"
              fill="#76B900"
            />
          </svg>
        );

      case "tesla":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Tesla logo">
            <rect width="24" height="24" rx="4.5" fill="#E82127" />
            <path
              d="M12 5.5c2.8 0 5.4.6 7.5 1.7l-.8 2.1c-1.8-.9-4.1-1.4-6.7-1.4s-4.9.5-6.7 1.4l-.8-2.1c2.1-1.1 4.7-1.7 7.5-1.7zm0 4.2c1.9 0 3.7.3 5.2.9l-1 2.3c-1.1-.4-2.4-.6-4.2-.6s-3.1.2-4.2.6l-1-2.3c1.5-.6 3.3-.9 5.2-.9zm-.9 4.1h1.8v5.7h-1.8v-5.7z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "netflix":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Netflix logo">
            <rect width="24" height="24" rx="4.5" fill="#000000" />
            <path d="M6 4h3.2v16H6V4z" fill="#B81D24" />
            <path d="M14.8 4H18v16h-3.2V4z" fill="#B81D24" />
            <path d="M6 4h3.5l5.3 16h-3.5L6 4z" fill="#E50914" />
          </svg>
        );

      case "spotify":
        return (
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-label="Spotify logo">
            <rect width="24" height="24" rx="4.5" fill="#1DB954" />
            <path
              d="M17.5 15.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4.1-.9 7.6-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.3.4-.8.5-1.2.3-2.9-1.8-7.3-2.3-10.7-1.3-.5.1-1-.1-1.1-.6-.1-.5.1-1 .6-1.1 3.9-1.2 8.7-.6 12.1 1.5.4.2.5.8.3 1.2zm.1-2.9c-3.5-2.1-9.2-2.3-12.6-1.2-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 3.8-1.2 10.2-.9 14.2 1.5.5.3.6 1 .3 1.5-.3.4-.9.6-1.2.1z"
              fill="#FFFFFF"
            />
          </svg>
        );

      default:
        if (meta?.domain && !imgError) {
          return (
            <img
              src={`https://logo.clearbit.com/${meta.domain}`}
              alt={`${company} logo`}
              className="h-full w-full rounded-sm object-contain"
              onError={() => setImgError(true)}
            />
          );
        }
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-sm font-semibold text-white shadow-xs"
            style={{ backgroundColor: meta?.brandColor || "#334155" }}
          >
            {meta?.mark || company.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  const logoNode = (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm transition-transform duration-200 group-hover:scale-105 ${SIZE_MAP[size]} ${className}`}
      title={company}
    >
      {renderOfficialSvg()}
    </div>
  );

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-sm border border-rule bg-paper/80 px-2.5 py-1 text-xs transition-colors hover:border-accent ${className}`}
      >
        {logoNode}
        <span className={`font-medium text-foreground ${nameClassName}`}>{meta?.name || company}</span>
      </span>
    );
  }

  if (showName) {
    return (
      <span className="inline-flex items-center gap-2">
        {logoNode}
        <span className={`font-medium text-foreground ${nameClassName}`}>{meta?.name || company}</span>
      </span>
    );
  }

  return logoNode;
}
