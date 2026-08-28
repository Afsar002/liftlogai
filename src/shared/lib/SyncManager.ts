/* ------------------------------------------------------------------ */
/* Sync Manager - Centralized sync configuration                      */
/* ------------------------------------------------------------------ */

export interface SyncConfig {
  enabled: boolean;
  accessToken: string | null;
  lastSyncAt: string | null;
  autoSync: boolean;
  preferredUnit?: "kg" | "lb";
}

interface SyncConfigWithExtras extends SyncConfig {
  [key: string]: unknown;
}

function readSyncConfig(key: string): SyncConfigWithExtras {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return { enabled: false, accessToken: null, lastSyncAt: null, autoSync: false };
    }
    const raw = localStorage.getItem(key);
    if (!raw) return { enabled: false, accessToken: null, lastSyncAt: null, autoSync: false };
    return JSON.parse(raw) as SyncConfigWithExtras;
  } catch {
    return { enabled: false, accessToken: null, lastSyncAt: null, autoSync: false };
  }
}

function writeSyncConfig(key: string, config: Partial<SyncConfigWithExtras>): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const current = readSyncConfig(key);
    localStorage.setItem(key, JSON.stringify({ ...current, ...config }));
  } catch { }
}

/**
 * Creates a sync manager for a specific feature (workout, nutrition, body, template).
 * All sync config is stored under a single key per feature.
 */
export function createSyncManager(featureKey: string, defaults: Partial<SyncConfig> = {}) {
  const storageKey = `liftlog_${featureKey}_sync_config`;

  return {
    /** Checks if sync is configured and enabled. */
    isEnabled(): boolean {
      const config = readSyncConfig(storageKey);
      return config.enabled && !!config.accessToken;
    },

    /** Gets the stored access token. */
    getAccessToken(): string | null {
      return readSyncConfig(storageKey).accessToken;
    },

    /** Gets the full sync config. */
    getConfig(): SyncConfig {
      return readSyncConfig(storageKey);
    },

    /**
     * Configures sync with an access token.
     * Optionally validates the token with a test API call.
     */
    async configure(accessToken: string, validate?: (token: string) => Promise<boolean>): Promise<boolean> {
      if (validate) {
        const valid = await validate(accessToken);
        if (!valid) return false;
      }

      writeSyncConfig(storageKey, {
        enabled: true,
        accessToken,
        lastSyncAt: null,
        autoSync: true,
        ...defaults,
      });
      return true;
    },

    /** Disables sync and clears token. */
    disable(): void {
      writeSyncConfig(storageKey, {
        enabled: false,
        accessToken: null,
        lastSyncAt: null,
        autoSync: false,
        ...defaults,
      });
    },

    /** Sets auto-sync preference. */
    setAutoSync(enabled: boolean): void {
      writeSyncConfig(storageKey, { autoSync: enabled });
    },

    /** Gets auto-sync preference. */
    getAutoSync(): boolean {
      return readSyncConfig(storageKey).autoSync;
    },

    /** Updates last sync timestamp. */
    setLastSyncAt(timestamp: string): void {
      writeSyncConfig(storageKey, { lastSyncAt: timestamp });
    },

    /** Gets last sync timestamp. */
    getLastSyncAt(): string | null {
      return readSyncConfig(storageKey).lastSyncAt;
    },

    /** Sets preferred unit (for body sync). */
    setPreferredUnit(unit: "kg" | "lb"): void {
      writeSyncConfig(storageKey, { preferredUnit: unit });
    },

    /** Gets preferred unit (for body sync). */
    getPreferredUnit(): "kg" | "lb" {
      return readSyncConfig(storageKey).preferredUnit ?? "kg";
    },

    /** Invalidates the config (clears it). */
    clear(): void {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem(storageKey);
        }
      } catch { }
    },
  };
}

/** Pre-configured sync managers for each feature. */
export const workoutSync = createSyncManager("workout", { preferredUnit: "kg" });
export const templateSync = createSyncManager("template");
export const nutritionSync = createSyncManager("nutrition");
export const bodySync = createSyncManager("body", { preferredUnit: "kg" });