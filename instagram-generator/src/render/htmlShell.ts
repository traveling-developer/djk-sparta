// HTML-Hülle für das Playwright-Rendering: gleiche Google Fonts
// wie tmp/insta/Sparta Instagram Templates.html, plus das Template-Stylesheet.
import { STYLES } from "../templates/styles.ts";

export function htmlShell(bodyMarkup: string): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>${STYLES}</style>
</head>
<body>
<div id="root">${bodyMarkup}</div>
</body>
</html>`;
}
