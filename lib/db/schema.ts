import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * User Profile table
 * Stores user information and preferences
 */
export const userProfile = sqliteTable('user_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  avatarId: text('avatar_id').notNull(),
  language: text('language').notNull().default('fr'),
  ttsSpeed: real('tts_speed').notNull().default(1.0),
  ttsVoiceId: text('tts_voice_id'), // ID de la voix TTS préférée
  pinCode: text('pin_code'), // Code PIN à 4 chiffres pour protéger l'accès aux paramètres
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Favorites table
 * Stores user's favorite pictograms
 */
export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pictogramId: text('pictogram_id').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Custom Phrases table
 * Stores user-created custom phrases for pictograms
 */
export const customPhrases = sqliteTable('custom_phrases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pictogramId: text('pictogram_id').notNull(),
  text: text('text').notNull(),
  emoji: text('emoji'),
  language: text('language').notNull().default('fr'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Custom Pictograms table
 * Stores user-created custom pictograms with photos
 */
export const customPictograms = sqliteTable('custom_pictograms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customId: text('custom_id').notNull().unique(),
  name: text('name').notNull(),
  imagePath: text('image_path').notNull(),
  categoryId: text('category_id').notNull().default('custom'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export types for TypeScript
export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type CustomPhrase = typeof customPhrases.$inferSelect;
export type NewCustomPhrase = typeof customPhrases.$inferInsert;

export type CustomPictogram = typeof customPictograms.$inferSelect;
export type NewCustomPictogram = typeof customPictograms.$inferInsert;
