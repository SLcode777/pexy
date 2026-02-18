import { PictogramImage } from "@/components/PictogramImage";
import { Colors } from "@/constants/colors";
import {
  deleteCustomPhrase,
  getCustomPhrases,
  isFavorite,
  toggleFavorite,
  getCustomPictogramById,
  deleteCustomPictogram,
} from "@/lib/db/operations";
import { getPictogram } from "@/lib/pictograms";
import { speakWithPreferences } from "@/lib/speakWithPreferences";
import type { Pictogram } from "@/types";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as FileSystemLegacy from 'expo-file-system/legacy';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface CustomPhrase {
  id: number;
  text: string;
  emoji: string | null;
}

export default function PictogramScreen() {
  const { categoryId, id } = useLocalSearchParams<{
    categoryId: string;
    id: string;
  }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [pictogram, setPictogram] = useState<Pictogram | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);

  // Reload custom phrases when screen is focused (after adding a new one)
  useFocusEffect(
    useCallback(() => {
      loadCustomPhrases();
    }, [id, i18n.language]),
  );

  useEffect(() => {
    loadPictogram();
    checkFavorite();
  }, [categoryId, id]);

  const loadPictogram = async () => {
    setLoading(true);

    if (categoryId === 'custom') {
      // Load custom pictogram from database
      const customPicto = await getCustomPictogramById(id);
      if (customPicto) {
        const formattedPicto: Pictogram = {
          id: customPicto.customId,
          category: 'custom',
          image: `file://${FileSystemLegacy.documentDirectory}${customPicto.imagePath}`,
          translations: {
            fr: { label: customPicto.name, phrases: [] },
            en: { label: customPicto.name, phrases: [] },
          },
        };
        setPictogram(formattedPicto);
      } else {
        setPictogram(null);
      }
    } else {
      // Load regular pictogram from JSON
      const data = await getPictogram(categoryId, id);
      setPictogram(data);
    }

    setLoading(false);
  };

  const checkFavorite = async () => {
    const favStatus = await isFavorite(id);
    setIsFav(favStatus);
  };

  const loadCustomPhrases = async () => {
    const phrases = await getCustomPhrases(id, i18n.language);
    setCustomPhrases(phrases);
  };

  const handleToggleFavorite = async () => {
    const newStatus = await toggleFavorite(id);
    setIsFav(newStatus);
  };

  const handleSpeakLabel = () => {
    if (pictogram) {
      const label =
        pictogram.translations[i18n.language]?.label ||
        pictogram.translations.fr.label;
      speakWithPreferences(label);
    }
  };

  const handleSpeakPhrase = (text: string) => {
    speakWithPreferences(text);
  };

  const handleAddPhrase = () => {
    // @ts-expect-error - Expo Router dynamic routes typing issue
    router.push({
      pathname: "/add-phrase",
      params: { pictogramId: id },
    });
  };

  const handleDeleteCustomPhrase = (customPhrase: CustomPhrase) => {
    Alert.alert(
      t("pictogram.delete_phrase_title"),
      t("pictogram.delete_phrase_message", { text: customPhrase.text }),
      [
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteCustomPhrase(customPhrase.id);
            await loadCustomPhrases();
          },
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ],
    );
  };

  const handleDeleteCustomPictogram = () => {
    Alert.alert(
      t("custom_picto.delete_title"),
      t("custom_picto.delete_confirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteCustomPictogram(id);
            router.back();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pictogram) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('pictogram.not_found')}</Text>
      </SafeAreaView>
    );
  }

  const translation =
    pictogram.translations[i18n.language] || pictogram.translations.fr;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>✖️</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.iconButton}
          >
            <Text style={styles.icon}>{isFav ? "⭐" : "☆"}</Text>
          </TouchableOpacity>
          {categoryId === 'custom' && (
            <TouchableOpacity
              onPress={handleDeleteCustomPictogram}
              style={styles.iconButton}
            >
              <Text style={styles.icon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Pictogram */}
        <TouchableOpacity
          onPress={handleSpeakLabel}
          style={styles.pictogramContainer}
        >
          <PictogramImage
            source={pictogram.image}
            size={120}
            style={{ borderRadius: 20 }}
          />
          <Text style={styles.pictogramLabel}>{translation.label}</Text>
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>

        {/* Phrases */}
        <View style={styles.phrasesContainer}>
          {/* Pre-built phrases */}
          {translation.phrases.map((phrase, index) => (
            <TouchableOpacity
              key={`prebuilt-${index}`}
              style={styles.phraseCard}
              onPress={() => handleSpeakPhrase(phrase.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.phraseEmoji}>{phrase.emoji}</Text>
              <Text style={styles.phraseText}>{phrase.text}</Text>
            </TouchableOpacity>
          ))}

          {/* Custom phrases */}
          {customPhrases.map((phrase) => (
            <View key={`custom-${phrase.id}`} style={styles.phraseRow}>
              <TouchableOpacity
                style={[styles.phraseCard, styles.customPhraseCard]}
                onPress={() => handleSpeakPhrase(phrase.text)}
                activeOpacity={0.7}
              >
                <Text style={styles.phraseEmoji}>{phrase.emoji || "💬"}</Text>
                <Text style={styles.phraseText}>{phrase.text}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCustomPhrase(phrase)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteIcon}>✖️</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add custom phrase button */}
          <TouchableOpacity
            style={styles.addPhraseButton}
            onPress={handleAddPhrase}
            activeOpacity={0.7}
          >
            <Text style={styles.addPhraseIcon}>➕</Text>
            <Text style={styles.addPhraseText}>
              {t('common.add_phrase')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 28,
  },
  content: {
    padding: 24,
  },
  pictogramContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  pictogramImage: {
    fontSize: 120,
    marginBottom: 16,
  },
  pictogramLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  speakerIcon: {
    fontSize: 24,
  },
  phrasesContainer: {
    gap: 12,
  },
  phraseRow: {
    flexDirection: "row",
    gap: 8,
  },
  phraseCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customPhraseCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  deleteButton: {
    width: 48,
    height: 48,
    // backgroundColor: Colors.coral,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  deleteIcon: {
    fontSize: 20,
  },
  phraseEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  phraseText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  addPhraseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightBlue,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addPhraseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addPhraseText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginTop: 24,
  },
});
