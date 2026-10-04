// Datums-Helfer — die Tagesgrenze liegt immer in Europe/Berlin, unabhängig von
// der Server-Zeitzone (GitHub Actions läuft UTC).

// "DD.MM.YYYY" des Tages in `days` Tagen in Europe/Berlin — Format wie auf
// mytischtennis.de (negative Werte für Vergangenheit).
export function deInDays(days: number): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
}

export function yesterdayDe(): string {
  return deInDays(-1);
}

// Letztes Spielwochenende (Fr–So) als "DD.MM.YYYY" in Europe/Berlin: der
// jüngste Sonntag bis einschließlich heute — Montag also gestern, sonntags
// heute (dann evtl. noch unvollständig).
export function lastWeekendDe(): { from: string; to: string } {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    weekday: "short",
  }).format(new Date());
  const sinceSunday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );
  return { from: deInDays(-sinceSunday - 2), to: deInDays(-sinceSunday) };
}
