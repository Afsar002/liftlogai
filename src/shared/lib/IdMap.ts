/* ------------------------------------------------------------------ */
/* Generic ID Mapping Service                                         */
/* ------------------------------------------------------------------ */
/* Provides bidirectional mapping between remote IDs and local IDs.   */
/* Uses deterministic UUID-based IDs for cross-device deduplication.  */
/* ------------------------------------------------------------------ */

interface RemoteMapping<TRemoteId> {
  /** Remote numeric ID (from API) */
  remoteId: TRemoteId;
  /** Remote UUID (stable across API instances) */
  remoteUuid: string;
  /** Our local deterministic ID (prefix-{uuid}) */
  localId: string;
  /** Name for debugging/display */
  name: string;
  /** When this mapping was created */
  createdAt: number;
}

interface IdMapState<TRemoteId> {
  version: number;
  updatedAt: number;
  mappings: RemoteMapping<TRemoteId>[];
}

const MAP_VERSION = 1;

function storageKey(prefix: string): string {
  return `liftlog_${prefix}_id_map`;
}

function readMap<TRemoteId>(prefix: string): IdMapState<TRemoteId> | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(storageKey(prefix));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IdMapState<TRemoteId>;
    if (parsed.version !== MAP_VERSION) {
      localStorage.removeItem(storageKey(prefix));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeMap<TRemoteId>(prefix: string, state: IdMapState<TRemoteId>): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(storageKey(prefix), JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

/** Generates deterministic local ID from remote UUID. */
export function generateLocalId(prefix: string, remoteUuid: string): string {
  return `${prefix}-${remoteUuid}`;
}

/** Extracts remote UUID from our local ID. */
export function extractRemoteUuid(prefix: string, localId: string): string | null {
  const expectedPrefix = `${prefix}-`;
  if (!localId.startsWith(expectedPrefix)) return null;
  return localId.slice(expectedPrefix.length);
}

/** Checks if an ID is a mapped ID for this prefix. */
export function isMappedId(prefix: string, id: string): boolean {
  return id.startsWith(`${prefix}-`);
}

/**
 * Builds/updates the mapping table from a list of items.
 * Items must have: id (local), name, and optionally remoteUuid or remoteId.
 */
export function buildMappingFromItems<TItem, TRemoteId>(
  prefix: string,
  items: TItem[],
  getRemoteUuid: (item: TItem) => string | null,
  getRemoteId: (item: TItem) => TRemoteId | null,
  getName: (item: TItem) => string
): void {
  const existing = readMap<TRemoteId>(prefix);
  const mappings = existing?.mappings ?? [];
  const existingByUuid = new Map(mappings.map(m => [m.remoteUuid, m]));
  let updated = false;

  for (const item of items) {
    const remoteUuid = getRemoteUuid(item);
    if (!remoteUuid) continue;

    const existing = existingByUuid.get(remoteUuid);
    const remoteId = getRemoteId(item);
    const name = getName(item);
    const localId = generateLocalId(prefix, remoteUuid);

    if (!existing) {
      mappings.push({
        remoteId: remoteId ?? (0 as TRemoteId),
        remoteUuid,
        localId,
        name,
        createdAt: Date.now(),
      });
      updated = true;
    } else {
      if (existing.name !== name) {
        existing.name = name;
        updated = true;
      }
      if (remoteId && existing.remoteId === (0 as TRemoteId)) {
        existing.remoteId = remoteId;
        updated = true;
      }
    }
  }

  if (updated) {
    writeMap(prefix, {
      version: MAP_VERSION,
      updatedAt: Date.now(),
      mappings,
    });
  }
}

/** Gets the local ID for a remote UUID. */
export function getLocalIdByRemoteUuid<TRemoteId>(prefix: string, remoteUuid: string): string | null {
  const map = readMap<TRemoteId>(prefix);
  if (!map) return null;
  const mapping = map.mappings.find(m => m.remoteUuid === remoteUuid);
  return mapping?.localId ?? null;
}

/** Gets the remote UUID for a local ID. */
export function getRemoteUuidByLocalId(prefix: string, localId: string): string | null {
  if (!isMappedId(prefix, localId)) return null;
  return extractRemoteUuid(prefix, localId);
}

/** Gets the remote numeric ID for a local ID (if available). */
export function getRemoteIdByLocalId<TRemoteId>(prefix: string, localId: string): TRemoteId | null {
  const map = readMap<TRemoteId>(prefix);
  if (!map) return null;
  const mapping = map.mappings.find(m => m.localId === localId);
  return mapping?.remoteId ?? null;
}

/** Gets the remote numeric ID for a remote UUID (if available). */
export function getRemoteIdByRemoteUuid<TRemoteId>(prefix: string, remoteUuid: string): TRemoteId | null {
  const map = readMap<TRemoteId>(prefix);
  if (!map) return null;
  const mapping = map.mappings.find(m => m.remoteUuid === remoteUuid);
  return mapping?.remoteId ?? null;
}

/** Sets the remote numeric ID for a mapping (call when you have it from API). */
export function setRemoteIdForUuid<TRemoteId>(prefix: string, remoteUuid: string, remoteId: TRemoteId): void {
  const map = readMap<TRemoteId>(prefix);
  if (!map) return;
  const mapping = map.mappings.find(m => m.remoteUuid === remoteUuid);
  if (mapping) {
    mapping.remoteId = remoteId;
    writeMap(prefix, map);
  }
}

/** Gets all mappings. */
export function getAllMappings<TRemoteId>(prefix: string): RemoteMapping<TRemoteId>[] {
  const map = readMap<TRemoteId>(prefix);
  return map?.mappings ?? [];
}

/** Gets mapping count. */
export function getMappingCount<TRemoteId>(prefix: string): number {
  const map = readMap<TRemoteId>(prefix);
  return map?.mappings.length ?? 0;
}

/** Clears the mapping table. */
export function clearMapping(prefix: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(storageKey(prefix));
    }
  } catch { }
}

/** Checks if mapping exists and is fresh. */
export function hasFreshMapping<TRemoteId>(prefix: string, maxAgeMs = 7 * 24 * 60 * 60 * 1000): boolean {
  const map = readMap<TRemoteId>(prefix);
  if (!map || map.mappings.length === 0) return false;
  return Date.now() - map.updatedAt < maxAgeMs;
}

/** Finds mappings by partial name match. */
export function findMappingsByName<TRemoteId>(prefix: string, query: string): RemoteMapping<TRemoteId>[] {
  const map = readMap<TRemoteId>(prefix);
  if (!map) return [];
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  return map.mappings.filter(m => m.name.toLowerCase().includes(lowerQuery));
}

/** Batch resolves remote IDs to local IDs. */
export function resolveRemoteIdsToLocalIds<TRemoteId>(
  prefix: string,
  remoteIds: TRemoteId[]
): Map<TRemoteId, string> {
  const result = new Map<TRemoteId, string>();
  const map = readMap<TRemoteId>(prefix);
  if (!map) return result;

  for (const remoteId of remoteIds) {
    const mapping = map.mappings.find(m => m.remoteId === remoteId);
    if (mapping) {
      result.set(remoteId, mapping.localId);
    }
  }
  return result;
}

/** Facade export for a specific prefix. */
export function createIdMap<TRemoteId>(prefix: string) {
  return {
    generateLocalId: (remoteUuid: string) => generateLocalId(prefix, remoteUuid),
    extractRemoteUuid: (localId: string) => extractRemoteUuid(prefix, localId),
    isMappedId: (id: string) => isMappedId(prefix, id),
    buildMappingFromItems: <TItem,>(
      items: TItem[],
      getRemoteUuid: (item: TItem) => string | null,
      getRemoteId: (item: TItem) => TRemoteId | null,
      getName: (item: TItem) => string
    ) => buildMappingFromItems(prefix, items, getRemoteUuid, getRemoteId, getName),
    getLocalIdByRemoteUuid: (remoteUuid: string) => getLocalIdByRemoteUuid<TRemoteId>(prefix, remoteUuid),
    getRemoteUuidByLocalId: (localId: string) => getRemoteUuidByLocalId(prefix, localId),
    getRemoteIdByLocalId: (localId: string) => getRemoteIdByLocalId<TRemoteId>(prefix, localId),
    getRemoteIdByRemoteUuid: (remoteUuid: string) => getRemoteIdByRemoteUuid<TRemoteId>(prefix, remoteUuid),
    setRemoteIdForUuid: (remoteUuid: string, remoteId: TRemoteId) => setRemoteIdForUuid(prefix, remoteUuid, remoteId),
    getAllMappings: () => getAllMappings<TRemoteId>(prefix),
    getMappingCount: () => getMappingCount<TRemoteId>(prefix),
    clearMapping: () => clearMapping(prefix),
    hasFreshMapping: (maxAgeMs?: number) => hasFreshMapping<TRemoteId>(prefix, maxAgeMs),
    findMappingsByName: (query: string) => findMappingsByName<TRemoteId>(prefix, query),
    resolveRemoteIdsToLocalIds: (remoteIds: TRemoteId[]) => resolveRemoteIdsToLocalIds(prefix, remoteIds),
  };
}

type TItem = unknown;