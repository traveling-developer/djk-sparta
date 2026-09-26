// Exponentielles Backoff — portiert aus news-generator/src/genai.ts.
// `baseDelayMs` für träge Quellen (mytischtennis rate-limitet mit ~15–20 s
// Cooldown) hochsetzen. `shouldRetry` bricht bei aussichtslosen Fehlern sofort ab.
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
  shouldRetry: (error: unknown) => boolean = () => true,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1 || !shouldRetry(error)) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * baseDelayMs),
      );
    }
  }
  throw new Error("Max retries reached");
}
