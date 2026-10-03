import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchAiHealth, AiUnavailableError } from '../utils/aiClient';

export type EngineReason = 'no_key' | 'quota' | null;

interface EngineContextType {
  /** True when cloud AI should NOT be attempted (no key, or quota exhausted). */
  cloudUnavailable: boolean;
  reason: EngineReason;
  /** Call when any cloud request fails so the whole app degrades together. */
  reportCloudFailure: (error: unknown) => void;
  /** Call on a successful cloud request to clear a transient failure. */
  reportCloudSuccess: () => void;
  /** User can dismiss and retry cloud from the banner. */
  retryCloud: () => void;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

export const EngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cloudUnavailable, setCloudUnavailable] = useState<boolean>(false);
  const [reason, setReason] = useState<EngineReason>(null);

  // Probe once at boot: lets us start directly in on-device mode
  // instead of failing the user's first request.
  useEffect(() => {
    let cancelled = false;
    fetchAiHealth().then((health) => {
      if (cancelled || !health) return;
      if (!health.cloudAi) {
        setCloudUnavailable(true);
        setReason('no_key');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const reportCloudFailure = useCallback((error: unknown) => {
    if (error instanceof AiUnavailableError) {
      if (error.code === 'NO_API_KEY') {
        setCloudUnavailable(true);
        setReason('no_key');
      } else if (error.code === 'QUOTA_EXHAUSTED') {
        setCloudUnavailable(true);
        setReason('quota');
      }
      // UPSTREAM_ERROR / NETWORK are transient — do not disable cloud globally.
    }
  }, []);

  const reportCloudSuccess = useCallback(() => {
    // A successful cloud call means the engine is healthy again.
    setCloudUnavailable(false);
    setReason(null);
  }, []);

  const retryCloud = useCallback(() => {
    setCloudUnavailable(false);
    setReason(null);
  }, []);

  return (
    <EngineContext.Provider
      value={{ cloudUnavailable, reason, reportCloudFailure, reportCloudSuccess, retryCloud }}
    >
      {children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return context;
};
