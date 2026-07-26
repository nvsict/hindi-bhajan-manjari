// utils/db.ts
import Dexie, { Table } from 'dexie';

// 1. Saved Bhajans Table (संग्रह)
export interface SavedBhajanDB {
  slug: string; // Primary Key
  title: string;
  folder: string; // e.g., 'All', 'Morning Bhajans'
  isPinned: number; // 0 (False) or 1 (True) - Dexie sorts numbers better
  addedAt: string;
  
  // Offline Metadata (Phase 3 के लिए)
  deity?: string;
  singer?: string;
  lyrics_excerpt?: string;
  full_html?: string; // Offline Mode cache
}

// 2. Reading History Table (हिस्ट्री और स्टैट्स)
export interface ReadingHistoryDB {
  id?: number; // Auto-increment
  slug: string;
  openedAt: string;
}

// 3. App Settings Table (कस्टम सेटिंग्स)
export interface AppSettingsDB {
  key: string;
  value: any;
}

export class SangrahDatabase extends Dexie {
  savedBhajans!: Table<SavedBhajanDB, string>;
  readingHistory!: Table<ReadingHistoryDB, number>;
  appSettings!: Table<AppSettingsDB, string>;

  constructor() {
    super('SangrahDB');
    
    // Schema Declaration (Define Indexes for lightning-fast search & sort)
    this.version(1).stores({
      savedBhajans: 'slug, folder, isPinned, addedAt, title, deity', 
      readingHistory: '++id, slug, openedAt',
      appSettings: 'key'
    });
  }
}

// Export a single instance to use across the app
export const db = new SangrahDatabase();