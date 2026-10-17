import aanyaPortrait from "@/assets/alumni/aanya-iyer.jpg";
import arjunPortrait from "@/assets/alumni/arjun-nair.jpg";
import priyaPortrait from "@/assets/alumni/priya-ramanathan.jpg";
import devPortrait from "@/assets/alumni/dev-mehta.jpg";
import taraPortrait from "@/assets/alumni/tara-deshmukh.jpg";
import kavitaPortrait from "@/assets/alumni/kavita-sharma.jpg";
import vikramPortrait from "@/assets/alumni/vikram-choudhury.jpg";
import rohanPortrait from "@/assets/alumni/rohan-sen.jpg";
import meeraPortrait from "@/assets/alumni/meera-bose.jpg";

export const LOCAL_PORTRAITS: Record<string, string> = {
  "arjun-nair": arjunPortrait,
  "p-arjun-nair": arjunPortrait,
  "priya-ramanathan": priyaPortrait,
  "p-priya-ramanathan": priyaPortrait,
  "aanya-iyer": aanyaPortrait,
  "p-aanya-iyer": aanyaPortrait,
  "dev-mehta": devPortrait,
  "p-dev-mehta": devPortrait,
  "tara-deshmukh": taraPortrait,
  "p-tara-deshmukh": taraPortrait,
  "kavita-sharma": kavitaPortrait,
  "p-kavita-sharma": kavitaPortrait,
  "vikram-choudhury": vikramPortrait,
  "p-vikram-choudhury": vikramPortrait,
  "rohan-sen": rohanPortrait,
  "p-rohan-sen": rohanPortrait,
  "meera-bose": meeraPortrait,
  "p-meera-bose": meeraPortrait,
  "kabir-alva": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  "p-kabir-alva": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  "aditya-kapoor": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
  "p-aditya-kapoor": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
  "simran-kaur": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
  "p-simran-kaur": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
};

/**
 * Returns the portrait URL for a given alumnus ID or photo key.
 */
export function getAlumniPortrait(idOrKey?: string | null): string | null {
  if (!idOrKey) return null;
  const key = idOrKey.toLowerCase().trim();
  if (LOCAL_PORTRAITS[key]) return LOCAL_PORTRAITS[key];

  // Try stripping "p-" prefix
  const unPrefixed = key.replace(/^p-/, "");
  if (LOCAL_PORTRAITS[unPrefixed]) return LOCAL_PORTRAITS[unPrefixed];

  return null;
}
