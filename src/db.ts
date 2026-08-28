export type Work = {
  id: string;
  activity: string;
  title: string;
  createdAt: string;
  data: unknown;
};

const DB_NAME = 'creative-cartridge';
const STORE = 'works';

const database = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Local storage could not open.'));
});

const transaction = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('This work could not be saved.'));
    tx.oncomplete = () => db.close();
  });
};

export const saveWork = (work: Work) => transaction('readwrite', store => store.put(work));
export const getWorks = () => transaction<Work[]>('readonly', store => store.getAll());
export const clearWorks = () => transaction('readwrite', store => store.clear());
export const deleteWork = (id: string) => transaction('readwrite', store => store.delete(id));

export const importWorks = async (value: unknown) => {
  if (!Array.isArray(value)) throw new Error('That file is not a Creative Cartridge collection.');
  const valid = value.every(item => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.activity === 'string');
  if (!valid) throw new Error('Some saved pieces in that file are not valid. Nothing was imported.');
  for (const item of value as Work[]) await saveWork(item);
  return value.length;
};

export const makeWork = (activity: string, title: string, data: unknown): Work => ({
  id: `${activity}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  activity,
  title,
  createdAt: new Date().toISOString(),
  data
});
