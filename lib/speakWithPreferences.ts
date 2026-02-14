import { getUserProfile } from '@/lib/db/operations';
import { speak, getTTSLanguage } from '@/lib/tts';

/**
 * Speak text with user's preferred voice and settings
 */
export const speakWithPreferences = async (text: string, languageOverride?: string) => {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      // Fallback to default if no profile
      await speak(text, {
        language: languageOverride || 'fr-FR',
      });
      return;
    }

    await speak(text, {
      language: languageOverride || getTTSLanguage(profile.language),
      rate: profile.ttsSpeed,
      voiceId: profile.ttsVoiceId || undefined,
    });
  } catch (error) {
    console.error('Error speaking with preferences:', error);
    // Fallback to default
    await speak(text, {
      language: languageOverride || 'fr-FR',
    });
  }
};
