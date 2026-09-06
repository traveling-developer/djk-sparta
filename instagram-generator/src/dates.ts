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

export function todayDe(): string {
  return deInDays(0);
}

// "YYYY-MM-DD" für Sanity releaseDate
export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}
