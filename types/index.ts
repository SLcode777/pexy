// Pictogram types
export interface PictogramTranslation {
  label: string;
  phrases: Phrase[];
}

export interface Phrase {
  emoji?: string;
  text: string;
}

export interface Pictogram {
  id: string;
  category: string;
  image: string;
  translations: {
    [languageCode: string]: PictogramTranslation;
  };
}

// Category types
export interface CategoryTranslation {
  [languageCode: string]: string;
}

export interface Category {
  id: string;
  icon: string;
  color: string;
  translations: CategoryTranslation;
}

// Avatar types
export type AvatarGender = "boy" | "girl" | "mixed";

export interface Avatar {
  id: string;
  gender: AvatarGender;
  image: string;
}

// Settings types
export interface AppSettings {
  language: string;
  ttsSpeed: number;
}

// TTS types
export type TTSSpeed = 0.5 | 1.0 | 1.25 | 2.0;
