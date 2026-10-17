export interface CompanyMeta {
  id: string;
  name: string;
  domain?: string;
  brandColor?: string;
  mark?: string;
  focus?: string;
}

export const KNOWN_COMPANIES: Record<string, CompanyMeta> = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    domain: "anthropic.com",
    brandColor: "#CC785C",
    mark: "A",
    focus: "Frontier computing & AI safety",
  },
  deepmind: {
    id: "deepmind",
    name: "Google DeepMind",
    domain: "deepmind.google",
    brandColor: "#4285F4",
    mark: "G",
    focus: "Applied intelligence & frontier research",
  },
  "google deepmind": {
    id: "deepmind",
    name: "Google DeepMind",
    domain: "deepmind.google",
    brandColor: "#4285F4",
    mark: "G",
    focus: "Applied intelligence & frontier research",
  },
  google: {
    id: "deepmind",
    name: "Google",
    domain: "google.com",
    brandColor: "#4285F4",
    mark: "G",
    focus: "Cloud, systems & search infrastructure",
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    domain: "stripe.com",
    brandColor: "#635BFF",
    mark: "S",
    focus: "Global financial infrastructure",
  },
  apple: {
    id: "apple",
    name: "Apple",
    domain: "apple.com",
    brandColor: "#18181B",
    mark: "",
    focus: "Human technology & Apple Silicon",
  },
  "apple silicon": {
    id: "apple",
    name: "Apple Silicon",
    domain: "apple.com",
    brandColor: "#18181B",
    mark: "",
    focus: "Low-power microarchitectures & tensor processors",
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    domain: "microsoft.com",
    brandColor: "#00A4EF",
    mark: "⊞",
    focus: "Cloud platforms & enterprise systems",
  },
  adobe: {
    id: "adobe",
    name: "Adobe",
    domain: "adobe.com",
    brandColor: "#EB1000",
    mark: "A",
    focus: "Creative software & intelligent design systems",
  },
  linear: {
    id: "linear",
    name: "Linear",
    domain: "linear.app",
    brandColor: "#5E6AD2",
    mark: "L",
    focus: "High-craft project & issue tracking",
  },
  zerodha: {
    id: "zerodha",
    name: "Zerodha",
    domain: "zerodha.com",
    brandColor: "#387ED1",
    mark: "Z",
    focus: "High-volume discount broking & capital infrastructure",
  },
  "peak xv": {
    id: "peakxv",
    name: "Peak XV Partners",
    domain: "peakxv.com",
    brandColor: "#0D5C3A",
    mark: "XV",
    focus: "Venture capital & early-stage partnerships",
  },
  "peak xv partners": {
    id: "peakxv",
    name: "Peak XV Partners",
    domain: "peakxv.com",
    brandColor: "#0D5C3A",
    mark: "XV",
    focus: "Venture capital & early-stage partnerships",
  },
  "sequoia capital": {
    id: "peakxv",
    name: "Peak XV Partners",
    domain: "peakxv.com",
    brandColor: "#0D5C3A",
    mark: "XV",
    focus: "Venture capital & technology investing",
  },
  citadel: {
    id: "citadel",
    name: "Citadel",
    domain: "citadel.com",
    brandColor: "#002D62",
    mark: "C",
    focus: "Alternative asset management & algorithmic trading",
  },
  "citadel securities": {
    id: "citadel",
    name: "Citadel Securities",
    domain: "citadelsecurities.com",
    brandColor: "#002D62",
    mark: "C",
    focus: "Algorithmic market making & execution",
  },
  synapse: {
    id: "synapse",
    name: "Synapse Robotics",
    domain: "synapserobotics.com",
    brandColor: "#0B1329",
    mark: "S",
    focus: "Autonomous surgical robotics & micro-kinematics",
  },
  "synapse robotics": {
    id: "synapse",
    name: "Synapse Robotics",
    domain: "synapserobotics.com",
    brandColor: "#0B1329",
    mark: "S",
    focus: "Autonomous surgical robotics & micro-kinematics",
  },
  oxfordbiomed: {
    id: "oxfordbiomed",
    name: "Oxford BioMed",
    domain: "oxfordbiomedica.co.uk",
    brandColor: "#002147",
    mark: "Ox",
    focus: "Gene therapy & structural biology research",
  },
  "oxford biomed": {
    id: "oxfordbiomed",
    name: "Oxford BioMed",
    domain: "oxfordbiomedica.co.uk",
    brandColor: "#002147",
    mark: "Ox",
    focus: "Gene therapy & structural biology research",
  },
  verve: {
    id: "verve",
    name: "Verve Climate",
    domain: "verveclimate.com",
    brandColor: "#064E3B",
    mark: "V",
    focus: "High-durability carbon removal verification",
  },
  "verve climate": {
    id: "verve",
    name: "Verve Climate",
    domain: "verveclimate.com",
    brandColor: "#064E3B",
    mark: "V",
    focus: "High-durability carbon removal verification",
  },
  latham: {
    id: "latham",
    name: "Latham & Watkins",
    domain: "lw.com",
    brandColor: "#0A192F",
    mark: "LW",
    focus: "Global antitrust, technology M&A & capital markets",
  },
  "latham & watkins": {
    id: "latham",
    name: "Latham & Watkins",
    domain: "lw.com",
    brandColor: "#0A192F",
    mark: "LW",
    focus: "Global antitrust, technology M&A & capital markets",
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    domain: "amazon.com",
    brandColor: "#232F3E",
    mark: "A",
    focus: "Cloud infrastructure & logistics scale",
  },
  meta: {
    id: "meta",
    name: "Meta",
    domain: "meta.com",
    brandColor: "#0668E1",
    mark: "M",
    focus: "Social graphs, open-source AI & distributed compute",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    domain: "openai.com",
    brandColor: "#10A37F",
    mark: "O",
    focus: "Frontier reasoning & generative intelligence",
  },
  nvidia: {
    id: "nvidia",
    name: "NVIDIA",
    domain: "nvidia.com",
    brandColor: "#76B900",
    mark: "N",
    focus: "Accelerated computing, CUDA & silicon interconnects",
  },
  tesla: {
    id: "tesla",
    name: "Tesla",
    domain: "tesla.com",
    brandColor: "#E82127",
    mark: "T",
    focus: "Autonomous mobility & robotics energy storage",
  },
  netflix: {
    id: "netflix",
    name: "Netflix",
    domain: "netflix.com",
    brandColor: "#E50914",
    mark: "N",
    focus: "Global media streaming & edge content delivery",
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    domain: "spotify.com",
    brandColor: "#1DB954",
    mark: "S",
    focus: "Audio streaming & personalized discovery engines",
  },
};

/**
 * Returns metadata and branding details for a company by name or slug.
 */
export function getCompanyMeta(name?: string | null): CompanyMeta | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase().trim();

  // Exact lookup in registry
  if (KNOWN_COMPANIES[normalized]) {
    return KNOWN_COMPANIES[normalized];
  }

  // Substring or keyword match
  for (const [key, meta] of Object.entries(KNOWN_COMPANIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return meta;
    }
  }

  return {
    id: normalized.replace(/[^a-z0-9]/g, "-"),
    name,
    mark: name.charAt(0).toUpperCase(),
    brandColor: "#2A3644",
  };
}
