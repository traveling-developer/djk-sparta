export class MatchReport {
  league: string;
  match: string;
  date: string;
  filePath: string;
  title: string = "";
  content: string = "";

  constructor(league: string, match: string, date: string, filePath: string) {
    this.league = league;
    this.match = match;
    this.date = date;
    this.filePath = filePath;
  }
}
