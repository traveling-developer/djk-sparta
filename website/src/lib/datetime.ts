const BERLIN = "Europe/Berlin";

const pad = (value: number) => String(value).padStart(2, "0");

function berlinOffset(instant: Date): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: BERLIN,
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;

  return name?.replace("GMT", "") || "+01:00";
}

export function berlinIso(instant: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: BERLIN,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );

  const hour = p.hour === "24" ? "00" : p.hour;

  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}${berlinOffset(instant)}`;
}

export function berlinIsoFromWallClock(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  const approx = new Date(Date.UTC(year, month - 1, day, hour, minute));

  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${berlinOffset(approx)}`;
}
