/* ------------------------------------------------------------------ */
/* Wger API Client - Shared base for all wger services                */
/* ------------------------------------------------------------------ */

export interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

export interface WgerClientConfig {
  baseUrl: string;
  defaultLanguage: number;
  cacheKey: string;
  cacheTtlMs: number;
}

const DEFAULT_CONFIG: WgerClientConfig = {
  baseUrl: "https://wger.de/api/v2",
  defaultLanguage: 2,
  cacheKey: "liftlog_wger_generic",
  cacheTtlMs: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Generic cache helpers using localStorage.
 * Subclasses can override cacheKey/ttl per endpoint.
 */
export function createCacheHelpers<T>(cacheKey: string, ttlMs: number) {
  function readCache(): CacheEntry<T> | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() - parsed.timestamp > ttlMs) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function writeCache(data: T): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    } catch {
      // Ignore quota errors
    }
  }

  function invalidateCache(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(cacheKey);
      }
    } catch {
      // Ignore
    }
  }

  function hasFreshCache(): boolean {
    return readCache() !== null;
  }

  function getCachedCount(): number {
    const cached = readCache();
    return Array.isArray(cached?.data) ? (cached.data as T[]).length : 0;
  }

  return { readCache, writeCache, invalidateCache, hasFreshCache, getCachedCount };
}

/**
 * Base Wger API client with common HTTP and cache logic.
 * Each service extends this and provides its own types/transforms.
 */
export class WgerApiClient<TResponse, TListResponse extends TResponse[] = TResponse[]> {
  public config: WgerClientConfig;
  protected cache: ReturnType<typeof createCacheHelpers<TListResponse>>;

  constructor(config: Partial<WgerClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = createCacheHelpers<TListResponse>(this.config.cacheKey, this.config.cacheTtlMs);
  }

  /**
   * Core JSON fetch with standard headers.
   */
  async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`wger API error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Fetches all pages of a paginated endpoint.
   */
  async fetchAllPages<T>(initialUrl: string, options?: RequestInit): Promise<T[]> {
    const results: T[] = [];
    let url: string | null = initialUrl;
    while (url) {
      const response: WgerPaginatedResponse<T> = await this.fetchJson<WgerPaginatedResponse<T>>(url, options);
      results.push(...response.results);
      url = response.next;
    }
    return results;
  }

  /**
   * Fetches list data with caching.
   * Subclasses should override for query-specific behavior.
   */
  async fetchList(forceRefresh = false, buildUrl: () => string, options?: RequestInit): Promise<TListResponse> {
    if (!forceRefresh) {
      const cached = this.cache.readCache();
      if (cached) return cached.data;
    }

    try {
      const url = buildUrl();
      const data = await this.fetchAllPages<TResponse>(url, options) as TListResponse;
      this.cache.writeCache(data);
      return data;
    } catch (error) {
      console.error(`[WgerApiClient] Failed to fetch list:`, error);
      const cached = this.cache.readCache();
      if (cached) return cached.data;
      throw error;
    }
  }

  /**
   * Fetches a single item by UUID.
   */
  async fetchById<T>(uuid: string, buildUrl: (uuid: string) => string, options?: RequestInit): Promise<T | null> {
    try {
      return await this.fetchJson<T>(buildUrl(uuid), options);
    } catch (error) {
      console.error(`[WgerApiClient] Failed to fetch by ID:`, error);
      return null;
    }
  }

  /**
   * Creates a new resource via POST.
   */
  async create<T, TBody>(buildUrl: () => string, body: TBody, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(buildUrl(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("[WgerApiClient] Create failed:", error);
        return null;
      }

      const created = await response.json();
      this.cache.invalidateCache();
      return created as T;
    } catch (error) {
      console.error("[WgerApiClient] Failed to create:", error);
      return null;
    }
  }

  /**
   * Updates a resource via PUT/PATCH.
   */
  async update<T, TBody>(buildUrl: () => string, body: TBody, method: "PUT" | "PATCH" = "PUT"): Promise<T | null> {
    try {
      const response = await fetch(buildUrl(), {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("[WgerApiClient] Update failed:", error);
        return null;
      }

      const updated = await response.json();
      this.cache.invalidateCache();
      return updated as T;
    } catch (error) {
      console.error("[WgerApiClient] Failed to update:", error);
      return null;
    }
  }

  // Cache accessors
  invalidateCache(): void {
    this.cache.invalidateCache();
  }

  hasFreshCache(): boolean {
    return this.cache.hasFreshCache();
  }

  getCachedCount(): number {
    return this.cache.getCachedCount();
  }

  readCache(): CacheEntry<TListResponse> | null {
    return this.cache.readCache();
  }
}

/**
 * Creates an authenticated client (for user-specific endpoints).
 */
export function createAuthenticatedClient<TResponse, TListResponse extends TResponse[]>(
  config: Partial<WgerClientConfig>,
  accessToken: string
): WgerApiClient<TResponse, TListResponse> {
  const client = new WgerApiClient<TResponse, TListResponse>(config);

  // Override fetchJson to include auth header
  const originalFetchJson = client.fetchJson.bind(client);
  (client as any).fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
    return originalFetchJson(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Token ${accessToken}`,
      },
    });
  };

  // Override fetchAllPages to include auth header
  const originalFetchAllPages = client.fetchAllPages.bind(client);
  (client as any).fetchAllPages = async <T>(initialUrl: string, options?: RequestInit): Promise<T[]> => {
    return originalFetchAllPages(initialUrl, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Token ${accessToken}`,
      },
    });
  };

  return client;
}