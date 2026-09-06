// Vereinsnamen für die Templates: eigene Mannschaften auf "Sparta\nNoris <Suffix>"
// normalisieren, Gegner am mittigsten Leerzeichen umbrechen — einzeilige Namen
// wie "ASV Burglengenfeld" sprengen sonst die VS-Spalte im 9:16-Story-Layout.
const CLUB = "Sparta";

function ourName(club: string): string {
  const match = club.match(/Sparta Noris(?:\s+N(?:ü|ue)rnberg)?\s*(.*)$/i);
  const suffix = match?.[1]?.trim();
  return suffix ? `Sparta\nNoris ${suffix}` : "Sparta\nNoris";
}

function twoLines(club: string): string {
  const clean = club.replace(/\s+/g, " ").trim();
  if (clean.length <= 12 || !clean.includes(" ")) return clean;

  const mid = Math.floor(clean.length / 2);
  let best = clean.indexOf(" ");
  for (let i = clean.indexOf(" "); i !== -1; i = clean.indexOf(" ", i + 1)) {
    if (Math.abs(i - mid) < Math.abs(best - mid)) best = i;
  }
  return `${clean.slice(0, best)}\n${clean.slice(best + 1)}`;
}

export function displayName(club: string): string {
  return club.includes(CLUB) ? ourName(club) : twoLines(club);
}
