// Datums-/Zeitformatierung in Europe/Berlin — von beiden Consumern genutzt.

// "YYYY-MM-DD" eines Datums in Europe/Berlin (für Tagesvergleiche).
export function berlinYmd(date: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

// Kurzes deutsches Datum + Uhrzeit. `year` hängt das 2-stellige Jahr an
// (Website zeigt es, die Instagram-Story nicht).
export function formatBerlin(
  date: Date,
  opts: { year?: boolean } = {},
): { date: string; time: string } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      weekday: "short",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  const weekday = (p.weekday ?? "").replace(/\.$/, "");
  return {
    date: `${weekday}. ${p.day}.${p.month}.${opts.year ? p.year : ""}`,
    time: `${p.hour}:${p.minute}`,
  };
}
