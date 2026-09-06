// Exponentielles Backoff — portiert aus news-generator/src/genai.ts.
// `baseDelayMs` für träge Quellen (mytischtennis rate-limitet mit ~15–20 s
// Cooldown) hochsetzen.
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * baseDelayMs),
      );
    }
  }
  throw new Error("Max retries reached");
}
