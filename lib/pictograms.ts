import type { Pictogram } from '@/types';
import { CATEGORIES } from '@/constants/categories';

/**
 * Load pictograms for a specific category
 */
export const loadPictograms = async (categoryId: string): Promise<Pictogram[]> => {
  try {
    // For now, only transport is available
    if (categoryId === 'transport') {
      const data = require('@/data/pictograms/transport.json');
      return data.pictograms;
    }

    // Return empty array for categories without pictograms yet
    return [];
  } catch (error) {
    console.error(`Error loading pictograms for category ${categoryId}:`, error);
    return [];
  }
};

/**
 * Load all pictograms from all categories
 */
export const loadAllPictograms = async (): Promise<Array<Pictogram & { categoryId: string }>> => {
  const allPictograms: Array<Pictogram & { categoryId: string }> = [];

  for (const category of CATEGORIES) {
    const pictograms = await loadPictograms(category.id);
    pictograms.forEach(picto => {
      allPictograms.push({ ...picto, categoryId: category.id });
    });
  }

  return allPictograms;
};

/**
 * Load favorite pictograms
 */
export const loadFavoritePictograms = async (favoriteIds: string[]): Promise<Array<Pictogram & { categoryId: string }>> => {
  const allPictograms = await loadAllPictograms();
  return allPictograms.filter(picto => favoriteIds.includes(picto.id));
};

/**
 * Get a single pictogram by ID
 */
export const getPictogram = async (
  categoryId: string,
  pictogramId: string
): Promise<Pictogram | null> => {
  const pictograms = await loadPictograms(categoryId);
  return pictograms.find(p => p.id === pictogramId) || null;
};
