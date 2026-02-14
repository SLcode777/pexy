import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { addCustomPhrase } from '@/lib/db/operations';

// Common emojis for phrases
const COMMON_EMOJIS = [
  '❤️', '😊', '👍', '👋', '🙏', '💪', '🎉', '✨',
  '🔊', '👀', '👂', '🤔', '😢', '😡', '😱', '🤗',
  '🍽️', '🥤', '🛏️', '🚗', '🏠', '🏫', '⏰', '📱',
];

export default function AddPhraseModal() {
  const { t, i18n } = useTranslation();
  const { pictogramId } = useLocalSearchParams<{ pictogramId: string }>();
  const [phraseText, setPhraseText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!phraseText.trim()) return;

    setIsSaving(true);

    try {
      await addCustomPhrase({
        pictogramId,
        text: phraseText.trim(),
        emoji: selectedEmoji,
        language: i18n.language,
      });

      // Go back and refresh
      router.back();
    } catch (error) {
      console.error('Error saving custom phrase:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmojiPress = (emoji: string) => {
    if (selectedEmoji === emoji) {
      setSelectedEmoji(null); // Deselect
    } else {
      setSelectedEmoji(emoji);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✖️</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ajouter une phrase</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Emoji selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Emoji (optionnel)</Text>
            <View style={styles.emojiGrid}>
              {COMMON_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected,
                  ]}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phrase input */}
          <View style={styles.section}>
            <Text style={styles.label}>Texte de la phrase *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Je veux aller au parc."
              placeholderTextColor={Colors.textSecondary}
              value={phraseText}
              onChangeText={setPhraseText}
              multiline
              numberOfLines={3}
              maxLength={200}
              autoFocus
            />
            <Text style={styles.charCount}>{phraseText.length}/200</Text>
          </View>

          {/* Preview */}
          {phraseText.trim() && (
            <View style={styles.section}>
              <Text style={styles.label}>Aperçu</Text>
              <View style={styles.preview}>
                {selectedEmoji && <Text style={styles.previewEmoji}>{selectedEmoji}</Text>}
                <Text style={styles.previewText}>{phraseText}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !phraseText.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!phraseText.trim() || isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emojiButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBlue,
  },
  emoji: {
    fontSize: 24,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  previewEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  previewText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkText,
  },
});
