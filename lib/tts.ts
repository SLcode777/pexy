import * as Speech from 'expo-speech';

/**
 * Text-to-Speech utility functions
 */

export interface TTSVoice {
  identifier: string;
  name: string;
  quality: string;
  language: string;
}

export const speak = async (
  text: string,
  options?: {
    language?: string;
    rate?: number; // 0.5 to 2.0
    pitch?: number; // 0.5 to 2.0
    voiceId?: string | null; // Specific voice ID
  }
) => {
  try {
    // Stop any ongoing speech
    await Speech.stop();

    // Speak the text
    await Speech.speak(text, {
      language: options?.language || 'fr-FR',
      rate: options?.rate || 1.0,
      pitch: options?.pitch || 1.0,
      voice: options?.voiceId || undefined,
    });
  } catch (error) {
    console.error('Error speaking text:', error);
  }
};

export const stopSpeaking = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};

export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Error checking if speaking:', error);
    return false;
  }
};

/**
 * Get TTS language code based on app language
 */
export const getTTSLanguage = (appLanguage: string): string => {
  const languageMap: Record<string, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    it: 'it-IT',
  };

  return languageMap[appLanguage] || 'fr-FR';
};

/**
 * Get available voices for the current platform
 */
export const getAvailableVoices = async (): Promise<TTSVoice[]> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.map(v => ({
      identifier: v.identifier,
      name: v.name,
      quality: v.quality,
      language: v.language,
    }));
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
};

/**
 * Get voices filtered by language
 */
export const getVoicesByLanguage = async (languageCode: string): Promise<TTSVoice[]> => {
  const allVoices = await getAvailableVoices();
  return allVoices.filter(voice => voice.language.startsWith(languageCode));
};

/**
 * Group voices by gender (approximation based on name)
 */
export const groupVoicesByGender = (voices: TTSVoice[]): {
  male: TTSVoice[];
  female: TTSVoice[];
  other: TTSVoice[];
} => {
  const male: TTSVoice[] = [];
  const female: TTSVoice[] = [];
  const other: TTSVoice[] = [];

  // Common male voice name patterns
  const malePatterns = ['thomas', 'nicolas', 'male', 'homme', 'man', 'daniel', 'alex'];
  // Common female voice name patterns
  const femalePatterns = ['amelie', 'audrey', 'female', 'femme', 'woman', 'samantha', 'claire', 'marie'];

  voices.forEach(voice => {
    const nameLower = voice.name.toLowerCase();
    const identifierLower = voice.identifier.toLowerCase();
    const combined = `${nameLower} ${identifierLower}`;

    if (malePatterns.some(pattern => combined.includes(pattern))) {
      male.push(voice);
    } else if (femalePatterns.some(pattern => combined.includes(pattern))) {
      female.push(voice);
    } else {
      other.push(voice);
    }
  });

  return { male, female, other };
};
