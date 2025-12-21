import { openDB } from 'idb';

const DB_NAME = 'denuel-auto-agent';
const STORE = 'queue';

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    },
  });
}

export async function queueAction(action: { id: string; type: string; payload: any; createdAt: number }) {
  const db = await getDb();
  await db.put(STORE, action);
}

export async function listQueued() {
  const db = await getDb();
  return await db.getAll(STORE);
}

export async function clearQueued() {
  const db = await getDb();
  const all = await db.getAllKeys(STORE);
  await Promise.all(all.map(k => db.delete(STORE, k)));
}

export async function countQueued() {
  const db = await getDb();
  const items = await db.getAllKeys(STORE);
  return items.length;
}
