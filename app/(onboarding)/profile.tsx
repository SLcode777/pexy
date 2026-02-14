import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleNext = () => {
    if (name.trim()) {
      // Navigate to avatar selection with the name
      router.push({
        // @ts-expect-error - Expo Router group routes typing issue
        pathname: '/(onboarding)/avatar',
        params: { name: name.trim() },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{t('onboarding.profile_title')}</Text>

        {/* Message */}
        <Text style={styles.message}>{t('onboarding.profile_message')}</Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder={t('onboarding.profile_placeholder')}
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={30}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />

        {/* Mascot */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascot}>🐰</Text>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[
            styles.button,
            !name.trim() && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  mascotContainer: {
    marginVertical: 32,
  },
  mascot: {
    fontSize: 120,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
});
