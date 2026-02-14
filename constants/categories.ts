import { Category } from '@/types';
import { CategoryColors } from './colors';

/**
 * Default categories for the app
 * More categories and pictograms will be added in data/pictograms
 */

export const CATEGORIES: Category[] = [
  {
    id: 'favorites',
    icon: '⭐',
    color: CategoryColors.favorites,
    translations: {
      fr: 'Favoris',
      en: 'Favorites',
    },
  },
  {
    id: 'conversation',
    icon: '💬',
    color: CategoryColors.conversation,
    translations: {
      fr: 'Conversation',
      en: 'Conversation',
    },
  },
  {
    id: 'people',
    icon: '👥',
    color: CategoryColors.people,
    translations: {
      fr: 'Personnes',
      en: 'People',
    },
  },
  {
    id: 'sentiments',
    icon: '😊',
    color: CategoryColors.sentiments,
    translations: {
      fr: 'Sentiments',
      en: 'Sentiments',
    },
  },
  {
    id: 'food',
    icon: '🍎',
    color: CategoryColors.food,
    translations: {
      fr: 'Nourriture',
      en: 'Food',
    },
  },
  {
    id: 'animals',
    icon: '🐱',
    color: CategoryColors.animals,
    translations: {
      fr: 'Animaux',
      en: 'Animals',
    },
  },
  {
    id: 'school',
    icon: '📚',
    color: CategoryColors.school,
    translations: {
      fr: 'L\'école',
      en: 'School',
    },
  },
  {
    id: 'activities',
    icon: '🎯',
    color: CategoryColors.activities,
    translations: {
      fr: 'Activités',
      en: 'Activities',
    },
  },
];
