// Generische HTTP-Request-Header. Manche Quellen (z.B. BFV) liefern nur mit
// einem Browser-User-Agent aus, deshalb wird hier einer mitgeschickt.
export const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/112.0.0.0 Safari/537.36",
  Accept: "text/html",
};
