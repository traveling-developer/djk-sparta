export const CLUB = "Sparta";

export function isOurs(club: string): boolean {
  return club.includes(CLUB);
}

export function venueOf(home: string, guest: string): string {
  if (isOurs(home) && isOurs(guest)) return "Vereinsduell";
  return isOurs(home) ? "Heimspiel" : "Auswärtsspiel";
}
