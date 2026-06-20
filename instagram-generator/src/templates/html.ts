// Mini-Helfer für HTML-Template-Strings.

// Gescrapte/fremde Texte immer escapen, bevor sie ins Markup wandern.
export function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// esc() + "\n" → <br /> (für Teamnamen mit Zeilenumbruch)
export function escMultiLine(text: string): string {
  return text.split("\n").map(esc).join("<br />");
}
