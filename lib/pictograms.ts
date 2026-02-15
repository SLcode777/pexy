import type { Pictogram } from '@/types';
import { CATEGORIES } from '@/constants/categories';

/**
 * Load pictograms for a specific category
 */
export const loadPictograms = async (categoryId: string): Promise<Pictogram[]> => {
  try {
    // Map category IDs to JSON files
    const categoryFiles: Record<string, any> = {
      transport: require('@/data/pictograms/transport.json'),
      conversation: require('@/data/pictograms/conversation.json'),
      feelings: require('@/data/pictograms/feelings.json'),
      people: require('@/data/pictograms/people.json'),
      food: require('@/data/pictograms/food.json'),
      clothes: require('@/data/pictograms/clothes.json'),
      animals: require('@/data/pictograms/animals.json'),
      activities: require('@/data/pictograms/activities.json'),
      school: require('@/data/pictograms/school.json'),
      selfcare: require('@/data/pictograms/selfcare.json'),
      shapes: require('@/data/pictograms/shapes.json'),
      colors: require('@/data/pictograms/colors.json'),
      toys: require('@/data/pictograms/toys.json'),
      fruits: require('@/data/pictograms/fruits.json'),
      vegetables: require('@/data/pictograms/vegetables.json'),
      places: require('@/data/pictograms/places.json'),
      household: require('@/data/pictograms/household.json'),
      letters: require('@/data/pictograms/letters.json'),
      numbers: require('@/data/pictograms/numbers.json'),
      sports: require('@/data/pictograms/sports.json'),
      professions: require('@/data/pictograms/professions.json'),
      snacks: require('@/data/pictograms/snacks.json'),
      party: require('@/data/pictograms/party.json'),
      carnival: require('@/data/pictograms/carnival.json'),
      travel: require('@/data/pictograms/travel.json'),
      gardening: require('@/data/pictograms/gardening.json'),
      medical: require('@/data/pictograms/medical.json'),
      cooking: require('@/data/pictograms/cooking.json'),
      diabetes: require('@/data/pictograms/diabetes.json'),
    };

    const data = categoryFiles[categoryId];
    if (data) {
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
