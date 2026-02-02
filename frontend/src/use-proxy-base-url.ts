/**
 * Hook to get the proxy base URL for images.
 * Uses the global config and can be overridden with props.
 */
import { useMemo } from "react";
import { config } from "./config";

export function useProxyBaseUrl(explicitUrl?: string): string {
  return useMemo(() => {
    if (explicitUrl) {
      return explicitUrl;
    }
    return config.serverBaseUrl;
  }, [explicitUrl]);
}
