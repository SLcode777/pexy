import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { loadAllPictograms } from '@/lib/pictograms';
import { getCustomPhrases } from '@/lib/db/operations';
import { speakWithPreferences } from '@/lib/speakWithPreferences';
import type { Pictogram, Phrase } from '@/types';

interface SearchResult {
  type: 'pictogram' | 'phrase';
  pictogram: Pictogram & { categoryId: string };
  phrase?: Phrase;
  customPhraseText?: string;
  customPhraseEmoji?: string;
}

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    } else {
      setResults([]);
    }
  }, [searchQuery, i18n.language]);

  const performSearch = async (query: string) => {
    setLoading(true);
    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    try {
      // Load all pictograms
      const allPictograms = await loadAllPictograms();

      // Search through pictograms
      for (const picto of allPictograms) {
        const translation = picto.translations[i18n.language] || picto.translations.fr;
        const label = translation.label.toLowerCase();

        // Check if pictogram label matches
        if (label.includes(lowerQuery)) {
          searchResults.push({
            type: 'pictogram',
            pictogram: picto,
          });
        }

        // Check if any pre-built phrase matches
        for (const phrase of translation.phrases) {
          if (phrase.text.toLowerCase().includes(lowerQuery)) {
            searchResults.push({
              type: 'phrase',
              pictogram: picto,
              phrase,
            });
          }
        }

        // Check custom phrases for this pictogram
        const customPhrases = await getCustomPhrases(picto.id, i18n.language);
        for (const customPhrase of customPhrases) {
          if (customPhrase.text.toLowerCase().includes(lowerQuery)) {
            searchResults.push({
              type: 'phrase',
              pictogram: picto,
              customPhraseText: customPhrase.text,
              customPhraseEmoji: customPhrase.emoji || '💬',
            });
          }
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    const translation = result.pictogram.translations[i18n.language] || result.pictogram.translations.fr;

    if (result.type === 'pictogram') {
      // Speak pictogram label
      speakWithPreferences(translation.label);
    } else if (result.phrase) {
      // Speak pre-built phrase
      speakWithPreferences(result.phrase.text);
    } else if (result.customPhraseText) {
      // Speak custom phrase
      speakWithPreferences(result.customPhraseText);
    }

    // Navigate to pictogram detail
    // @ts-expect-error - Expo Router dynamic routes typing issue
    router.push(`/pictogram/${result.pictogram.categoryId}/${result.pictogram.id}`);
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const translation = item.pictogram.translations[i18n.language] || item.pictogram.translations.fr;
    const isPictogram = item.type === 'pictogram';

    return (
      <TouchableOpacity
        style={[
          styles.resultCard,
          isPictogram && styles.resultCardPictogram,
        ]}
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.resultIcon}>{item.pictogram.image}</Text>
        {item.phrase && (
          <Text style={styles.resultEmoji}>{item.phrase.emoji}</Text>
        )}
        {item.customPhraseEmoji && (
          <Text style={styles.resultEmoji}>{item.customPhraseEmoji}</Text>
        )}
        <Text style={styles.resultText}>
          {isPictogram
            ? translation.label
            : item.phrase?.text || item.customPhraseText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIconHeader}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search_input_placeholder')}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✖️</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : searchQuery.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍</Text>
          <Text style={styles.emptySubtext}>{t('common.search_hint')}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🤷</Text>
          <Text style={styles.emptySubtext}>{t('common.search_no_results')}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item, index) => `${item.type}-${item.pictogram.id}-${index}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIconHeader: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  resultCardPictogram: {
    backgroundColor: Colors.pink,
    borderColor: Colors.pink,
  },
  resultIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  resultEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
});
