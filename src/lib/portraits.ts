import aanyaPortrait from "@/assets/alumni/aanya-iyer.jpg";
import arjunPortrait from "@/assets/alumni/arjun-nair.jpg";
import priyaPortrait from "@/assets/alumni/priya-ramanathan.jpg";
import devPortrait from "@/assets/alumni/dev-mehta.jpg";
import taraPortrait from "@/assets/alumni/tara-deshmukh.jpg";
import kavitaPortrait from "@/assets/alumni/kavita-sharma.jpg";
import vikramPortrait from "@/assets/alumni/vikram-choudhury.jpg";
import rohanPortrait from "@/assets/alumni/rohan-sen.jpg";
import meeraPortrait from "@/assets/alumni/meera-bose.jpg";

const KABIR_PORTRAIT =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80";
const ADITYA_PORTRAIT =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80";
const SIMRAN_PORTRAIT =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80";

export const ALL_PORTRAIT_POOL: string[] = [
  arjunPortrait,
  priyaPortrait,
  aanyaPortrait,
  devPortrait,
  taraPortrait,
  kavitaPortrait,
  vikramPortrait,
  rohanPortrait,
  meeraPortrait,
  KABIR_PORTRAIT,
  ADITYA_PORTRAIT,
  SIMRAN_PORTRAIT,
];

export const KNOWN_PORTRAITS: Record<string, string> = {
  // Arjun
  "arjun-nair": arjunPortrait,
  "p-arjun-nair": arjunPortrait,
  "arjun-khanna": arjunPortrait,
  "arjun": arjunPortrait,

  // Priya
  "priya-ramanathan": priyaPortrait,
  "p-priya-ramanathan": priyaPortrait,
  "priya": priyaPortrait,

  // Aanya / Ananya
  "aanya-iyer": aanyaPortrait,
  "p-aanya-iyer": aanyaPortrait,
  "ananya-rao": aanyaPortrait,
  "ananya": aanyaPortrait,
  "aanya": aanyaPortrait,

  // Dev
  "dev-mehta": devPortrait,
  "p-dev-mehta": devPortrait,
  "dev-malhotra": devPortrait,
  "dev": devPortrait,

  // Tara / Ishita
  "tara-deshmukh": taraPortrait,
  "p-tara-deshmukh": taraPortrait,
  "ishita-sen": taraPortrait,
  "ishita": taraPortrait,
  "tara": taraPortrait,

  // Kavita / Sana
  "kavita-sharma": kavitaPortrait,
  "p-kavita-sharma": kavitaPortrait,
  "sana-qureshi": kavitaPortrait,
  "sana": kavitaPortrait,
  "kavita": kavitaPortrait,

  // Vikram
  "vikram-choudhury": vikramPortrait,
  "p-vikram-choudhury": vikramPortrait,
  "vikram": vikramPortrait,

  // Rohan
  "rohan-sen": rohanPortrait,
  "p-rohan-sen": rohanPortrait,
  "rohan-pillai": rohanPortrait,
  "rohan": rohanPortrait,

  // Meera
  "meera-bose": meeraPortrait,
  "p-meera-bose": meeraPortrait,
  "meera-iyer": meeraPortrait,
  "meera": meeraPortrait,

  // Kabir
  "kabir-alva": KABIR_PORTRAIT,
  "p-kabir-alva": KABIR_PORTRAIT,
  "kabir-mehta": KABIR_PORTRAIT,
  "kabir": KABIR_PORTRAIT,

  // Aditya
  "aditya-kapoor": ADITYA_PORTRAIT,
  "p-aditya-kapoor": ADITYA_PORTRAIT,
  "aditya": ADITYA_PORTRAIT,

  // Simran
  "simran-kaur": SIMRAN_PORTRAIT,
  "p-simran-kaur": SIMRAN_PORTRAIT,
  "simran": SIMRAN_PORTRAIT,
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns the portrait URL for a given alumnus ID, name, or photo key.
 * Guarantees a deterministic, consistent photographic portrait for every alumnus.
 */
export function getAlumniPortrait(idOrKey?: string | null, fullName?: string | null): string {
  // 1. Direct key lookup
  if (idOrKey) {
    const key = idOrKey.toLowerCase().trim();
    if (KNOWN_PORTRAITS[key]) return KNOWN_PORTRAITS[key];

    const unPrefixed = key.replace(/^p-/, "");
    if (KNOWN_PORTRAITS[unPrefixed]) return KNOWN_PORTRAITS[unPrefixed];

    // Check if key contains a known name
    for (const [candidate, img] of Object.entries(KNOWN_PORTRAITS)) {
      if (candidate.length >= 3 && key.includes(candidate)) {
        return img;
      }
    }
  }

  // 2. Full name token lookup
  if (fullName) {
    const cleanName = fullName
      .toLowerCase()
      .replace(/^(dr\.|mr\.|ms\.|mrs\.|prof\.)\s+/i, "")
      .trim();

    if (KNOWN_PORTRAITS[cleanName]) return KNOWN_PORTRAITS[cleanName];

    for (const [candidate, img] of Object.entries(KNOWN_PORTRAITS)) {
      if (candidate.length >= 3 && cleanName.includes(candidate)) {
        return img;
      }
    }

    const firstWord = cleanName.split(/\s+/)[0];
    if (firstWord && KNOWN_PORTRAITS[firstWord]) {
      return KNOWN_PORTRAITS[firstWord];
    }
  }

  // 3. Deterministic fallback pool lookup so EVERY alumnus has the EXACT same photo
  // both on cards and inside their profile
  const seed = (idOrKey || fullName || "ashwood-alumnus").toLowerCase();
  const index = simpleHash(seed) % ALL_PORTRAIT_POOL.length;
  return ALL_PORTRAIT_POOL[index];
}
