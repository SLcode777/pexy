import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as schema from './schema';

const DATABASE_NAME = 'pexy.db';

// Open SQLite database
const expoDb = openDatabaseSync(DATABASE_NAME);

// Create Drizzle instance
export const db = drizzle(expoDb, { schema });

// Initialize database (create tables)
export const initDatabase = async () => {
  try {
    // Create user_profile table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'fr',
        tts_speed REAL NOT NULL DEFAULT 1.0,
        tts_voice_id TEXT,
        pin_code TEXT,
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

    // Create custom_pictograms table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS custom_pictograms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        custom_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        image_path TEXT NOT NULL,
        category_id TEXT NOT NULL DEFAULT 'custom',
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

    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_custom_pictograms_custom_id ON custom_pictograms(custom_id);
    `);

    // Create custom_pictograms directory
    const customPictogramsDir = `${FileSystemLegacy.documentDirectory}custom_pictograms/`;
    await FileSystemLegacy.makeDirectoryAsync(customPictogramsDir, { intermediates: true })
      .catch(() => {}); // Ignore if already exists

    // Migrations: Add tts_voice_id column if it doesn't exist
    try {
      // Check if column exists
      const tableInfo = expoDb.getAllSync('PRAGMA table_info(user_profile)') as any[];
      const hasVoiceIdColumn = tableInfo.some((col: any) => col.name === 'tts_voice_id');

      if (!hasVoiceIdColumn) {
        console.log('🔄 Adding tts_voice_id column to user_profile...');
        expoDb.execSync(`
          ALTER TABLE user_profile ADD COLUMN tts_voice_id TEXT;
        `);
        console.log('✅ Migration completed: tts_voice_id column added');
      }
    } catch (error) {
      console.error('⚠️ Migration error (non-critical):', error);
    }

    // Migrations: Add pin_code column if it doesn't exist
    try {
      const tableInfo = expoDb.getAllSync('PRAGMA table_info(user_profile)') as any[];
      const hasPinCodeColumn = tableInfo.some((col: any) => col.name === 'pin_code');

      if (!hasPinCodeColumn) {
        console.log('🔄 Adding pin_code column to user_profile...');
        expoDb.execSync(`
          ALTER TABLE user_profile ADD COLUMN pin_code TEXT;
        `);
        console.log('✅ Migration completed: pin_code column added');
      }
    } catch (error) {
      console.error('⚠️ Migration error (non-critical):', error);
    }

    // Migrations: Remove avatar_id column if it exists
    try {
      const tableInfo = expoDb.getAllSync('PRAGMA table_info(user_profile)') as any[];
      const hasAvatarIdColumn = tableInfo.some((col: any) => col.name === 'avatar_id');

      if (hasAvatarIdColumn) {
        console.log('🔄 Removing avatar_id column from user_profile...');
        expoDb.execSync(`
          ALTER TABLE user_profile DROP COLUMN avatar_id;
        `);
        console.log('✅ Migration completed: avatar_id column removed');
      }
    } catch (error) {
      console.error('⚠️ Migration error (non-critical):', error);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export { schema };
