export async function safeJson<T = unknown>(res: Response, sourceName: string = "External API"): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `${sourceName} returned non-JSON response (status ${res.status}): ${text.slice(0, 200)}`,
    );
  }
}
