import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const DATABASE_NAME = 'pexy.db';

// Open SQLite database
const expoDb = openDatabaseSync(DATABASE_NAME);

// Create Drizzle instance
export const db = drizzle(expoDb, { schema });

// Initialize database (create tables)
export const initDatabase = () => {
  try {
    // Create user_profile table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatar_id TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'fr',
        tts_speed REAL NOT NULL DEFAULT 1.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create favorites table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pictogram_id TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create custom_phrases table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS custom_phrases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pictogram_id TEXT NOT NULL,
        text TEXT NOT NULL,
        emoji TEXT,
        language TEXT NOT NULL DEFAULT 'fr',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_favorites_pictogram ON favorites(pictogram_id);
    `);

    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_custom_phrases_pictogram ON custom_phrases(pictogram_id);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export { schema };
