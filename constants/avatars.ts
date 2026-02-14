import { Avatar } from '@/types';

/**
 * Default avatars for user profile
 * Using emojis as placeholders - can be replaced with custom images later
 */

export const AVATARS: Avatar[] = [
  // Boys
  { id: 'boy-1', gender: 'boy', image: '👦' },
  { id: 'boy-2', gender: 'boy', image: '🧒' },
  { id: 'boy-3', gender: 'boy', image: '👶' },
  { id: 'boy-4', gender: 'boy', image: '🧑' },
  { id: 'boy-5', gender: 'boy', image: '👨' },

  // Girls
  { id: 'girl-1', gender: 'girl', image: '👧' },
  { id: 'girl-2', gender: 'girl', image: '🧒' },
  { id: 'girl-3', gender: 'girl', image: '👶' },
  { id: 'girl-4', gender: 'girl', image: '👩' },
  { id: 'girl-5', gender: 'girl', image: '🧑' },

  // Mixed
  { id: 'mixed-1', gender: 'mixed', image: '😊' },
  { id: 'mixed-2', gender: 'mixed', image: '😄' },
  { id: 'mixed-3', gender: 'mixed', image: '🤗' },
  { id: 'mixed-4', gender: 'mixed', image: '🥰' },
  { id: 'mixed-5', gender: 'mixed', image: '😇' },
];
