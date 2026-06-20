// Zentrales Stylesheet für alle Templates.
// Skalierung über die CSS-Variable --s (pro Format am .ig-frame gesetzt),
// Werte 1:1 aus dem Original-Design (tmp/insta/ig-shared.jsx + Templates).
export const STYLES = `
  html, body { margin: 0; padding: 0; }
  * { box-sizing: border-box; }

  .ig-frame {
    --red: #D81E28;
    --red-deep: #A51119;
    --ink: #0C0C0E;
    --ink-soft: #1A1A1D;
    --paper: #FAFAF8;
    --paper-alt: #F1F0EC;
    --line: #E4E2DD;
    --pad: calc(72px * var(--s));
    position: relative;
    overflow: hidden;
    font-family: "Inter", system-ui, sans-serif;
    display: flex;
    flex-direction: column;
  }
  /* Story (9:16) ist schmaler im Verhältnis — weniger Außenrand,
     damit z.B. die Match-Day-Detailzellen nicht umbrechen */
  .ig-frame.fmt-story { --pad: calc(56px * var(--s)); }

  /* --- Motive --- */
  .ig-diagonal {
    position: absolute;
    left: -80px;
    width: 640px;
    background: var(--red);
    transform: skewX(-18deg);
    z-index: 0;
    display: flex;
    align-items: center;
  }
  .ig-diagonal-label {
    transform: skewX(18deg); /* Gegen-Skew: Text steht gerade im schrägen Balken */
    padding-left: calc(80px + var(--pad));
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(40px * var(--s));
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #fff;
  }
  .ig-sigma {
    position: absolute;
    right: -160px;
    bottom: -240px;
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(820px * var(--s));
    line-height: 0.8;
    z-index: 0;
    pointer-events: none;
  }
  .ig-stripes {
    position: absolute;
    top: 60px;
    right: 64px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1;
  }
  .ig-stripes div { height: 5px; background: var(--red); }

  /* --- Logo --- */
  .ig-logo {
    display: flex;
    align-items: center;
    gap: calc(16px * var(--s));
    position: relative;
    z-index: 2;
  }
  .ig-logo-title {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(30px * var(--s));
    letter-spacing: 1.5px;
    text-transform: uppercase;
    line-height: 0.95;
    color: #fff;
  }
  .ig-logo-sub {
    font-size: calc(16px * var(--s));
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--red);
    font-weight: 600;
    margin-top: 4px;
  }

  /* --- Header / Footer / Badge / Kicker --- */
  .ig-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: var(--pad);
    position: relative;
    z-index: 2;
  }
  .ig-badge {
    display: inline-flex;
    align-items: center;
    gap: calc(10px * var(--s));
    padding: calc(10px * var(--s)) calc(18px * var(--s));
    background: var(--red);
    color: #fff;
    font-family: "Oswald", sans-serif;
    font-weight: 600;
    font-size: calc(22px * var(--s));
    letter-spacing: 3px;
    text-transform: uppercase;
    position: relative;
    z-index: 2;
  }
  .ig-footer {
    padding: calc(24px * var(--s)) var(--pad) var(--pad);
    position: relative;
    z-index: 2;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 var(--pad);
  }
  .ig-footer-handle {
    display: flex;
    align-items: center;
    gap: calc(14px * var(--s));
    font-family: "Oswald", sans-serif;
    font-weight: 600;
    font-size: calc(24px * var(--s));
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .ig-footer-accent {
    width: calc(12px * var(--s));
    height: calc(12px * var(--s));
    background: var(--red);
  }
  .ig-footer-site {
    font-family: ui-monospace, Menlo, monospace;
    font-size: calc(20px * var(--s));
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 1px;
  }
  .ig-kicker {
    font-family: "Oswald", sans-serif;
    font-weight: 600;
    font-size: calc(26px * var(--s));
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--red);
    position: relative;
    z-index: 2;
  }
  .ig-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 var(--pad);
    position: relative;
    z-index: 2;
  }
  .ig-spacer { flex: 1; }

  /* --- Foto-Platzhalter (dunkel schraffiert) --- */
  .ig-ph {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(135deg, var(--ink) 0 14px, rgba(255, 255, 255, 0.12) 14px 15px);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .ig-ph span {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  /* --- Template: Spielankündigung (Match Day) --- */
  /* Inhalt oben ausrichten und unter die Diagonale schieben (statt mittig,
     sonst kollidiert der Kicker mit dem roten Diagonal-Balken) — analog Story */
  .md-main {
    justify-content: flex-start;
    padding-top: calc(230px * var(--s));
  }
  .md-kicker { margin-bottom: calc(24px * var(--s)); }
  .md-vs-row {
    display: flex;
    align-items: center;
    gap: calc(28px * var(--s));
    margin-bottom: calc(40px * var(--s));
  }
  .md-team { flex: 1; text-align: center; }
  /* Teamnamen leicht versetzt: Heim über, Gast unter der VS-Achse */
  .md-team.home { transform: translateY(calc(-28px * var(--s))); }
  .md-team.guest { transform: translateY(calc(28px * var(--s))); }
  .md-team-name {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(46px * var(--s));
    text-transform: uppercase;
    line-height: 0.95;
  }
  .md-vs {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(96px * var(--s));
    color: var(--red);
    font-style: italic;
  }
  .md-details {
    display: flex;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }
  .md-cell {
    flex: 1;
    padding: calc(22px * var(--s)) calc(10px * var(--s));
    text-align: center;
  }
  .md-cell + .md-cell { border-left: 2px solid rgba(255, 255, 255, 0.2); }
  .md-cell-key {
    font-size: calc(18px * var(--s));
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 8px;
  }
  .md-cell-value {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(34px * var(--s));
    text-transform: uppercase;
  }

  .md-cta {
    align-self: center;
    margin-top: calc(140px * var(--s));
    background: var(--red);
    color: #fff;
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(30px * var(--s));
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: calc(16px * var(--s)) calc(28px * var(--s));
  }

  /* Story (9:16): Inhalt größer skalieren, damit der Hochkant-Raum
     genutzt wird; Detail-Zellen als gestapelte Zeilen statt Spalten */
  .fmt-story .ig-badge {
    font-size: calc(28px * var(--s));
    padding: calc(13px * var(--s)) calc(24px * var(--s));
  }
  /* Story behält mehr Abstand nach oben (mehr Hochkant-Raum) */
  .fmt-story .md-main { padding-top: calc(310px * var(--s)); }
  .fmt-story .md-kicker {
    font-size: calc(32px * var(--s));
    margin-bottom: calc(36px * var(--s));
  }
  /* Teams + Details tiefer setzen, ohne den Kicker (Liga) mitzuziehen */
  .fmt-story .md-vs-row {
    gap: calc(32px * var(--s));
    margin-top: calc(120px * var(--s));
    margin-bottom: calc(100px * var(--s));
  }
  .fmt-story .md-team-name { font-size: calc(60px * var(--s)); }
  .fmt-story .md-team.home { transform: translateY(calc(-40px * var(--s))); }
  .fmt-story .md-team.guest { transform: translateY(calc(40px * var(--s))); }
  .fmt-story .md-vs { font-size: calc(140px * var(--s)); }
  .fmt-story .md-cta {
    margin-top: calc(160px * var(--s));
    font-size: calc(36px * var(--s));
  }
  .fmt-story .md-cell { padding: calc(28px * var(--s)) calc(12px * var(--s)); }
  .fmt-story .md-cell-key { font-size: calc(24px * var(--s)); }
  .fmt-story .md-cell-value { font-size: calc(44px * var(--s)); }

  /* Ergebnis-Story: Inhalt nach oben (unter die Diagonale) statt mittig,
     Vereine stärker zum Score versetzt */
  .fmt-story .result-main {
    justify-content: flex-start;
    padding-top: calc(310px * var(--s));
  }
  .fmt-story .result-team { font-size: calc(60px * var(--s)); }
  .fmt-story .result-team.home { transform: translateY(calc(-40px * var(--s))); }
  .fmt-story .result-team.guest { transform: translateY(calc(40px * var(--s))); }

  /* --- Template: Ergebnis --- */
  /* Logo-Subtitle steht auf dem roten Result-Grund (rot-auf-rot) → schwarz */
  .ig-frame:has(.result-main) .ig-logo-sub { color: var(--ink); }
  /* Inhalt oben unter die Diagonale schieben — gleiche Höhe wie Match Day */
  .result-main {
    justify-content: flex-start;
    padding-top: calc(230px * var(--s));
  }
  .result-kicker { color: #fff; opacity: 0.9; margin-bottom: calc(20px * var(--s)); }
  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(20px * var(--s));
    margin-bottom: calc(58px * var(--s));
  }
  .result-team {
    flex: 1;
    text-align: center;
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(46px * var(--s));
    text-transform: uppercase;
    line-height: 0.95;
  }
  /* Vereine leicht versetzt zum Ergebnis: Heim über, Gast unter der Score-Achse
     (Darstellung identisch zu Match Day) */
  .result-team.home { transform: translateY(calc(-28px * var(--s))); }
  .result-team.guest { transform: translateY(calc(28px * var(--s))); }
  .result-score-box {
    text-align: center;
    padding: calc(20px * var(--s)) calc(28px * var(--s));
  }
  .result-score {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(150px * var(--s));
    line-height: 0.85;
    letter-spacing: -2px;
    color: var(--ink);
  }
  .result-bottom {
    text-align: center;
    border-top: 2px solid rgba(255, 255, 255, 0.3);
    padding-top: calc(30px * var(--s));
  }
  .result-label {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(64px * var(--s));
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .result-date {
    font-size: calc(24px * var(--s));
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.85;
    margin-top: 12px;
  }

  /* --- Template: Spielbericht --- */
  .report-bg { position: absolute; inset: 0; z-index: 0; }
  .report-bg img { width: 100%; height: 100%; object-fit: cover; }
  .report-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(12, 12, 14, 0.55) 0%, rgba(12, 12, 14, 0.2) 35%, rgba(12, 12, 14, 0.95) 100%);
  }
  .report-body { padding: 0 var(--pad); position: relative; z-index: 2; }
  .report-headline {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(78px * var(--s));
    text-transform: uppercase;
    line-height: 0.92;
    letter-spacing: -1px;
    margin: calc(24px * var(--s)) 0 calc(20px * var(--s));
  }
  .report-headline .accent { color: var(--red); }
  .report-teaser {
    font-size: calc(28px * var(--s));
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.85);
    max-width: calc(820px * var(--s));
    margin-bottom: calc(24px * var(--s));
  }
  .report-cta {
    display: flex;
    align-items: center;
    gap: calc(14px * var(--s));
    font-size: calc(24px * var(--s));
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
  }
  .report-cta .accent { color: var(--red); }

  /* --- Template: Neue Website online (Ankündigung) --- */
  /* Inhalt oben unter die Diagonale schieben (analog Match Day) statt mittig */
  .web-main {
    justify-content: flex-start;
    padding-top: calc(165px * var(--s));
  }
  .web-headline {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(116px * var(--s));
    text-transform: uppercase;
    line-height: 0.84;
    letter-spacing: -2px;
    margin-bottom: calc(34px * var(--s));
  }
  .web-headline .accent { color: var(--red); font-style: italic; }

  /* Browser-Chrome-Mockup */
  .web-browser {
    background: #fff;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    border-radius: calc(16px * var(--s));
    overflow: hidden;
  }
  .web-chrome {
    display: flex;
    align-items: center;
    gap: calc(10px * var(--s));
    padding: calc(14px * var(--s)) calc(18px * var(--s));
    border-bottom: 1px solid var(--line);
  }
  .web-dots { display: flex; gap: calc(7px * var(--s)); }
  .web-dots span {
    width: calc(16px * var(--s));
    height: calc(16px * var(--s));
    border-radius: 50%;
  }
  .web-url {
    flex: 1;
    margin-left: calc(8px * var(--s));
    background: var(--paper-alt);
    border-radius: 100px;
    padding: calc(10px * var(--s)) calc(18px * var(--s));
    font-family: ui-monospace, Menlo, monospace;
    font-size: calc(22px * var(--s));
    color: var(--ink-soft);
    display: flex;
    align-items: center;
    gap: calc(10px * var(--s));
  }
  .web-url-dot { color: var(--red); }
  .web-viewport {
    height: calc(150px * var(--s));
    position: relative;
    overflow: hidden;
    background: var(--paper);
  }
  .web-viewport-bar {
    position: absolute;
    left: -30px;
    top: calc(24px * var(--s));
    width: calc(300px * var(--s));
    height: calc(26px * var(--s));
    background: var(--red);
    transform: skewX(-18deg);
  }
  .web-hero {
    position: relative;
    padding: calc(28px * var(--s)) calc(24px * var(--s));
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(60px * var(--s));
    color: var(--ink);
    text-transform: uppercase;
    line-height: 0.85;
  }
  .web-hero .accent { color: var(--red); }
  .web-hero-img {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: calc(10px * var(--s));
    height: calc(130px * var(--s));
    width: auto;
    object-fit: contain;
    z-index: 1;
  }
  .web-body {
    margin-top: calc(32px * var(--s));
    font-size: calc(28px * var(--s));
    line-height: 1.45;
    color: #fff;
    max-width: calc(800px * var(--s));
  }
  /* Story (9:16): mehr Hochkant-Raum oben, analog Match Day */
  .fmt-story .web-main { padding-top: calc(345px * var(--s)); }
  /* Mehr Luft zwischen Titel und Browser-Mockup */
  .fmt-story .web-headline { margin-bottom: calc(64px * var(--s)); }

  /* --- Template: Nachwuchs gesucht (Ankündigung, heller Hintergrund) --- */
  /* Logo & Footer auf Papier-Grund invertieren (dunkle Schrift/Linien) */
  .ig-frame:has(.youth-main) .ig-logo-title { color: var(--ink); }
  .ig-frame:has(.youth-main) .ig-footer { border-top-color: rgba(0, 0, 0, 0.15); }
  .ig-frame:has(.youth-main) .ig-footer-site { color: var(--ink-soft); }
  /* Längerer Kicker-Text als Diagonal-Label → Balken weiten, Label verkleinern */
  .ig-frame:has(.youth-main) .ig-diagonal { width: calc(880px * var(--s)); }
  .ig-frame:has(.youth-main) .ig-diagonal-label {
    font-size: calc(28px * var(--s));
    letter-spacing: 3px;
  }

  /* Inhalt unter die Diagonale verankern (Match-Day-Pattern) */
  .youth-main {
    justify-content: flex-start;
    padding-top: calc(170px * var(--s));
  }
  .youth-headline {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(132px * var(--s));
    text-transform: uppercase;
    line-height: 0.82;
    letter-spacing: -3px;
    margin-bottom: calc(30px * var(--s));
  }
  .youth-headline .accent { color: var(--red); font-style: italic; }
  .youth-body {
    font-size: calc(30px * var(--s));
    line-height: 1.45;
    color: var(--ink-soft);
    max-width: calc(800px * var(--s));
    margin-bottom: calc(36px * var(--s));
  }
  .youth-cards { display: flex; gap: calc(14px * var(--s)); }
  .youth-card {
    flex: 1;
    background: var(--ink);
    color: #fff;
    padding: calc(22px * var(--s)) calc(24px * var(--s));
  }
  .youth-card-day {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(44px * var(--s));
    text-transform: uppercase;
    line-height: 1;
  }
  .youth-card-time {
    font-family: ui-monospace, Menlo, monospace;
    font-size: calc(26px * var(--s));
    margin-top: calc(6px * var(--s));
  }
  .youth-card-group {
    font-size: calc(20px * var(--s));
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--red);
    margin-top: calc(10px * var(--s));
    font-weight: 600;
  }
  /* Story (9:16): mehr Hochkant-Raum oben */
  .fmt-story .youth-main { padding-top: calc(330px * var(--s)); }

  /* --- Template: Tabelle --- */
  .table-kicker { margin-bottom: calc(12px * var(--s)); }
  .table-title {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(86px * var(--s));
    text-transform: uppercase;
    line-height: 0.9;
    letter-spacing: -1px;
    margin-bottom: calc(32px * var(--s));
  }
  .table-head, .table-row {
    display: grid;
    grid-template-columns: calc(64px * var(--s)) 1fr calc(90px * var(--s));
    padding: calc(16px * var(--s)) calc(20px * var(--s));
  }
  .table-head {
    padding: calc(10px * var(--s)) calc(20px * var(--s));
    font-size: calc(20px * var(--s));
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }
  .table-head .pts { text-align: right; }
  .table-row {
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border-bottom: 2px solid rgba(12, 12, 14, 1);
  }
  .table-row.us { background: var(--red); }
  .table-row .rank {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(36px * var(--s));
    color: #fff;
  }
  .table-row.top3:not(.us) .rank { color: var(--red); }
  .table-row .club {
    font-family: "Oswald", sans-serif;
    font-weight: 600;
    font-size: calc(36px * var(--s));
    text-transform: uppercase;
  }
  .table-row.us .club { font-weight: 700; }
  .table-row .pts {
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    font-size: calc(40px * var(--s));
    text-align: right;
  }
`;
