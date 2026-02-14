import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { createUserProfile } from '@/lib/db/operations';

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const { name, avatarId } = useLocalSearchParams<{ name: string; avatarId: string }>();
  const [isCreating, setIsCreating] = useState(false);

  const handleStart = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Create user profile in database
      await createUserProfile({
        name,
        avatarId,
        language: i18n.language,
        ttsSpeed: 1.0,
      });

      console.log('✅ User profile created:', { name, avatarId });

      // Navigate to main app
      // @ts-expect-error - Expo Router group routes typing issue
      router.replace('/(main)');
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{t('onboarding.welcome_title')}</Text>

        {/* Message */}
        <Text style={styles.message}>{t('onboarding.welcome_message')}</Text>

        {/* Mascot with sparkles */}
        <View style={styles.mascotContainer}>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.mascot}>🐰</Text>
          <Text style={styles.sparkle}>✨</Text>
        </View>

        <View style={styles.mascotSparkleDots}>
          <Text style={styles.sparkleDot}>⭐</Text>
          <Text style={styles.sparkleDot}>⭐</Text>
          <Text style={styles.sparkleDot}>⭐</Text>
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleStart}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.buttonText}>{t('onboarding.welcome_button')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  mascotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 32,
  },
  mascot: {
    fontSize: 140,
  },
  sparkle: {
    fontSize: 40,
  },
  mascotSparkleDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
  },
  sparkleDot: {
    fontSize: 24,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 24,
    minWidth: 250,
    alignItems: 'center',
    marginTop: 'auto',
    height: 56,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
});
