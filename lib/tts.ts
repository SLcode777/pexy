import * as Speech from 'expo-speech';

/**
 * Text-to-Speech utility functions
 */

export const speak = async (
  text: string,
  options?: {
    language?: string;
    rate?: number; // 0.5 to 2.0
    pitch?: number; // 0.5 to 2.0
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
export const getAvailableVoices = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices;
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
};
