// Datums-Helfer — gleiche Logik wie news-generator/src/matchReports.ts.

// "DD.MM.YYYY" für den Datumsfilter auf mytischtennis.de
export function yesterdayDe(): string {
  return new Date(
    new Date().setDate(new Date().getDate() - 1),
  ).toLocaleDateString("de", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// "DD.MM.YYYY" für den Datumsfilter auf mytischtennis.de
export function todayDe(): string {
  return new Date().toLocaleDateString("de", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// "YYYY-MM-DD" für Sanity releaseDate
export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}
