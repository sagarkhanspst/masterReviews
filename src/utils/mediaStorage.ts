import { Product } from '../types';

/**
 * Client-side media handling and IndexedDB persistence for products and uploaded media.
 */

const DB_NAME = 'AffiliateMediaDB';
const MEDIA_STORE = 'media_files';
const APP_STORE = 'app_data';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(APP_STORE)) {
        db.createObjectStore(APP_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Persist products array into IndexedDB (virtually unlimited quota)
 */
export async function saveProductsToIndexedDB(products: Product[]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(APP_STORE, 'readwrite');
      const store = tx.objectStore(APP_STORE);
      const req = store.put({ key: 'products', data: products, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save products to IndexedDB:', err);
  }
}

/**
 * Retrieve saved products from IndexedDB
 */
export async function getProductsFromIndexedDB(): Promise<Product[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(APP_STORE, 'readonly');
      const store = tx.objectStore(APP_STORE);
      const req = store.get('products');

      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.data) && req.result.data.length > 0) {
          resolve(req.result.data as Product[]);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load products from IndexedDB:', err);
    return null;
  }
}

/**
 * Persist a media Blob or File into IndexedDB
 */
export async function saveMediaToStorage(id: string, file: Blob): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE);
      const req = store.put({ id, data: file, mimeType: file.type, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save media in IndexedDB:', err);
  }
}

/**
 * Retrieve a stored media blob from IndexedDB and return an object URL
 */
export async function getMediaUrlFromStorage(id: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readonly');
      const store = tx.objectStore(MEDIA_STORE);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const objectUrl = URL.createObjectURL(req.result.data);
          resolve(objectUrl);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load media from IndexedDB:', err);
    return null;
  }
}

/**
 * Resolves any video or image URL (handling indexeddb: prefixes)
 */
export async function resolveMediaUrl(url?: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('indexeddb:')) {
    const mediaId = url.replace('indexeddb:', '');
    const objUrl = await getMediaUrlFromStorage(mediaId);
    return objUrl || url;
  }
  return url;
}

/**
 * Optimizes and compresses an uploaded image file down to a lightweight, crystal-clear WebP / JPEG data URL
 * Keeps size around 25KB - 40KB so it easily fits into storage without exceeding quotas.
 */
export function compressAndProcessImage(file: File, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer image/webp if supported, fallback to image/jpeg
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback
        }

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export interface VideoUploadResult {
  storageUrl: string;
  previewUrl: string;
}

/**
 * Reads an uploaded video file and returns a usable URL with persistent IndexedDB storage
 */
export async function processVideoUpload(file: File): Promise<VideoUploadResult> {
  const mediaId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  try {
    await saveMediaToStorage(mediaId, file);
    const previewUrl = URL.createObjectURL(file);
    return {
      storageUrl: `indexeddb:${mediaId}`,
      previewUrl,
    };
  } catch {
    // If IndexedDB fails, use object URL for session
    const objectUrl = URL.createObjectURL(file);
    return {
      storageUrl: objectUrl,
      previewUrl: objectUrl,
    };
  }
}
