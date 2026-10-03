// Shared client for the cloud AI endpoints.
// Centralises error classification so every workspace can detect when cloud AI
// is unavailable and transparently degrade to an on-device engine.

export type AiErrorCode = 'NO_API_KEY' | 'QUOTA_EXHAUSTED' | 'UPSTREAM_ERROR' | 'NETWORK';

/** Thrown when the cloud engine cannot serve a request and a fallback is possible. */
export class AiUnavailableError extends Error {
  code: AiErrorCode;
  status: number;

  constructor(code: AiErrorCode, message: string, status = 0) {
    super(message);
    this.name = 'AiUnavailableError';
    this.code = code;
    this.status = status;
  }

  /** True when the caller should silently switch to an on-device engine. */
  get canDegrade(): boolean {
    return this.code !== 'UPSTREAM_ERROR';
  }
}

export interface AiHealth {
  ok: boolean;
  cloudAi: boolean;
  capabilities: Record<string, boolean>;
}

/** Probe the backend once at boot to learn whether cloud AI is configured. */
export async function fetchAiHealth(): Promise<AiHealth | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return (await res.json()) as AiHealth;
  } catch {
    return null;
  }
}

/**
 * POST JSON to a cloud AI endpoint.
 * On failure throws an AiUnavailableError carrying a machine-readable code.
 */
export async function requestAi<T>(
  endpoint: string,
  payload: Record<string, unknown>,
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 45000;
  let res: Response;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    throw new AiUnavailableError(
      'NETWORK',
      err instanceof Error ? err.message : 'Network request failed'
    );
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: AiErrorCode };
    const code: AiErrorCode = body.code || (res.status === 429 ? 'QUOTA_EXHAUSTED' : 'UPSTREAM_ERROR');
    throw new AiUnavailableError(code, body.error || `Server error: ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}
