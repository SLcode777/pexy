import { eq, desc, and } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { db } from './index';
import { userProfile, favorites, customPhrases, customPictograms } from './schema';
import type { NewUserProfile, NewFavorite, NewCustomPhrase, NewCustomPictogram, CustomPictogram } from './schema';

// ========================
// USER PROFILE OPERATIONS
// ========================

export const createUserProfile = async (data: NewUserProfile) => {
  const result = await db.insert(userProfile).values(data).returning();
  return result[0];
};

export const getUserProfile = async () => {
  const result = await db.select().from(userProfile).orderBy(desc(userProfile.id)).limit(1);
  return result[0] || null;
};

export const updateUserProfile = async (
  id: number,
  data: Partial<Omit<NewUserProfile, 'createdAt' | 'updatedAt'>>
) => {
  const result = await db
    .update(userProfile)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(userProfile.id, id))
    .returning();
  return result[0];
};

export const hasUserProfile = async (): Promise<boolean> => {
  const profile = await getUserProfile();
  return profile !== null;
};

// ========================
// FAVORITES OPERATIONS
// ========================

export const addFavorite = async (pictogramId: string) => {
  try {
    const result = await db
      .insert(favorites)
      .values({ pictogramId })
      .returning();
    return result[0];
  } catch (error) {
    // Handle unique constraint violation (already favorited)
    console.error('Error adding favorite:', error);
    return null;
  }
};

export const removeFavorite = async (pictogramId: string) => {
  await db.delete(favorites).where(eq(favorites.pictogramId, pictogramId));
};

export const isFavorite = async (pictogramId: string): Promise<boolean> => {
  const result = await db
    .select()
    .from(favorites)
    .where(eq(favorites.pictogramId, pictogramId))
    .limit(1);
  return result.length > 0;
};

export const toggleFavorite = async (pictogramId: string): Promise<boolean> => {
  const isCurrentlyFavorite = await isFavorite(pictogramId);

  if (isCurrentlyFavorite) {
    await removeFavorite(pictogramId);
    return false;
  } else {
    await addFavorite(pictogramId);
    return true;
  }
};

export const getFavorites = async (): Promise<string[]> => {
  const result = await db
    .select({ pictogramId: favorites.pictogramId })
    .from(favorites)
    .orderBy(desc(favorites.createdAt));
  return result.map(r => r.pictogramId);
};

// ========================
// CUSTOM PHRASES OPERATIONS
// ========================

export const addCustomPhrase = async (data: NewCustomPhrase) => {
  const result = await db.insert(customPhrases).values(data).returning();
  return result[0];
};

export const getCustomPhrases = async (pictogramId: string, language: string = 'fr') => {
  const result = await db
    .select()
    .from(customPhrases)
    .where(
      and(
        eq(customPhrases.pictogramId, pictogramId),
        eq(customPhrases.language, language)
      )
    )
    .orderBy(desc(customPhrases.createdAt));
  return result;
};

export const updateCustomPhrase = async (
  id: number,
  data: { text?: string; emoji?: string | null }
) => {
  const result = await db
    .update(customPhrases)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(customPhrases.id, id))
    .returning();
  return result[0];
};

export const deleteCustomPhrase = async (id: number) => {
  await db.delete(customPhrases).where(eq(customPhrases.id, id));
};

export const getAllCustomPhrases = async (language: string = 'fr') => {
  const result = await db
    .select()
    .from(customPhrases)
    .where(eq(customPhrases.language, language))
    .orderBy(desc(customPhrases.createdAt));
  return result;
};

// ========================
// CUSTOM PICTOGRAMS OPERATIONS
// ========================

export const createCustomPictogram = async (data: NewCustomPictogram) => {
  const result = await db.insert(customPictograms).values(data).returning();
  return result[0];
};

export const getCustomPictograms = async (): Promise<CustomPictogram[]> => {
  return await db
    .select()
    .from(customPictograms)
    .orderBy(desc(customPictograms.createdAt));
};

export const getCustomPictogramById = async (customId: string) => {
  const result = await db
    .select()
    .from(customPictograms)
    .where(eq(customPictograms.customId, customId))
    .limit(1);
  return result[0] || null;
};

export const updateCustomPictogram = async (customId: string, data: { name?: string }) => {
  return await db
    .update(customPictograms)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(customPictograms.customId, customId))
    .returning();
};

export const deleteCustomPictogram = async (customId: string) => {
  const picto = await getCustomPictogramById(customId);

  if (picto) {
    // 1. Delete image file
    const filePath = `${FileSystemLegacy.documentDirectory}${picto.imagePath}`;
    const file = new FileSystem.File(filePath);
    await file.delete().catch(console.error);

    // 2. Delete associated phrases (CASCADE)
    await db.delete(customPhrases).where(eq(customPhrases.pictogramId, customId));

    // 3. Delete DB record
    await db.delete(customPictograms).where(eq(customPictograms.customId, customId));
  }
};

// ========================
// DATA MANAGEMENT OPERATIONS
// ========================

/**
 * Clear all data from the database
 * Used for backup restore to ensure clean state
 */
export const clearAllData = async () => {
  // Delete custom pictogram images
  const customPictos = await getCustomPictograms();
  for (const picto of customPictos) {
    const filePath = `${FileSystemLegacy.documentDirectory}${picto.imagePath}`;
    const file = new FileSystem.File(filePath);
    await file.delete().catch(console.error);
  }

  // Delete DB records
  await db.delete(customPictograms);
  await db.delete(customPhrases);
  await db.delete(favorites);
  await db.delete(userProfile);
};
