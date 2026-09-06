// Generische HTTP-Request-Header. Manche Quellen (z.B. BFV) liefern nur mit
// einem Browser-User-Agent aus, deshalb wird hier einer mitgeschickt.
export const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/112.0.0.0 Safari/537.36",
  Accept: "text/html",
};

// axios hat per Default *kein* Timeout: ein hängender Request würde den
// kompletten Lauf blockieren (GitHub Actions bricht erst nach Stunden ab).
export const REQUEST_TIMEOUT_MS = 20_000;
