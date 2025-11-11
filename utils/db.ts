import type { LoveStoryData } from '../types';

const DB_NAME = 'HowMuchLoveDB';
const DB_VERSION = 1;
const STORE_NAME = 'loveStories';

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'userEmail' });
      }
    };
  });
};

export const saveStoryDB = async (userEmail: string, storyData: LoveStoryData): Promise<void> => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ userEmail, ...storyData });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error saving story to DB:', request.error);
      reject('Failed to save story');
    };
  });
};

export const loadStoryDB = async (userEmail: string): Promise<LoveStoryData | null> => {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(userEmail);

        request.onsuccess = () => {
            resolve(request.result ? request.result : null);
        };

        request.onerror = () => {
            console.error('Error loading story from DB:', request.error);
            reject('Failed to load story');
        };
    });
};
