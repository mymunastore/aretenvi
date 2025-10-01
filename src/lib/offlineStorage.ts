import Dexie, { type EntityTable } from 'dexie';

interface OfflineAction {
  id?: number;
  type: string;
  payload: any;
  timestamp: number;
  synced: boolean;
}

interface CachedData {
  id?: number;
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

class OfflineDatabase extends Dexie {
  actions!: EntityTable<OfflineAction, 'id'>;
  cache!: EntityTable<CachedData, 'id'>;

  constructor() {
    super('AretOfflineDB');
    this.version(1).stores({
      actions: '++id, type, timestamp, synced',
      cache: '++id, key, timestamp, expiresAt',
    });
  }
}

export const db = new OfflineDatabase();

export async function queueAction(type: string, payload: any) {
  await db.actions.add({
    type,
    payload,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function getPendingActions() {
  return db.actions.where('synced').equals(false).toArray();
}

export async function markActionSynced(id: number) {
  await db.actions.update(id, { synced: true });
}

export async function cacheData(key: string, data: any, ttlMinutes?: number) {
  const timestamp = Date.now();
  const expiresAt = ttlMinutes ? timestamp + ttlMinutes * 60 * 1000 : undefined;

  const existing = await db.cache.where('key').equals(key).first();

  if (existing) {
    await db.cache.update(existing.id!, { data, timestamp, expiresAt });
  } else {
    await db.cache.add({ key, data, timestamp, expiresAt });
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = await db.cache.where('key').equals(key).first();

  if (!cached) return null;

  if (cached.expiresAt && Date.now() > cached.expiresAt) {
    await db.cache.delete(cached.id!);
    return null;
  }

  return cached.data as T;
}

export async function clearExpiredCache() {
  const now = Date.now();
  const expired = await db.cache.where('expiresAt').below(now).toArray();
  const ids = expired.map(e => e.id!);
  await db.cache.bulkDelete(ids);
}

export async function syncPendingActions() {
  if (!navigator.onLine) return;

  const pending = await getPendingActions();

  for (const action of pending) {
    try {
      await processSyncAction(action);
      await markActionSynced(action.id!);
    } catch (error) {
      console.error('Failed to sync action:', action, error);
    }
  }
}

async function processSyncAction(action: OfflineAction) {
  const { supabase } = await import('@/integrations/supabase/client');

  switch (action.type) {
    case 'CREATE_COLLECTION':
      await supabase.from('waste_collections').insert(action.payload);
      break;
    case 'UPDATE_COLLECTION':
      await supabase.from('waste_collections')
        .update(action.payload.data)
        .eq('id', action.payload.id);
      break;
    case 'CREATE_FEEDBACK':
      await supabase.from('feedback').insert(action.payload);
      break;
    default:
      console.warn('Unknown action type:', action.type);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingActions();
  });

  setInterval(clearExpiredCache, 60 * 60 * 1000);
}