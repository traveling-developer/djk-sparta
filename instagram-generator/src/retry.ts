// Exponentielles Backoff — portiert aus news-generator/src/genai.ts.
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }
  throw new Error("Max retries reached");
}
