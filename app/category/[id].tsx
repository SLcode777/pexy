import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/constants/categories';
import { loadPictograms } from '@/lib/pictograms';
import { speakWithPreferences } from '@/lib/speakWithPreferences';
import type { Pictogram } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [loading, setLoading] = useState(true);

  const category = CATEGORIES.find(c => c.id === id);

  useEffect(() => {
    loadCategoryPictograms();
  }, [id]);

  const loadCategoryPictograms = async () => {
    setLoading(true);
    const data = await loadPictograms(id);
    setPictograms(data);
    setLoading(false);
  };

  const handlePictogramPress = (pictogram: Pictogram) => {
    // Speak pictogram label with user's preferred voice
    const label = pictogram.translations[i18n.language]?.label || pictogram.translations.fr.label;
    speakWithPreferences(label);

    // Navigate to pictogram detail
    // @ts-expect-error - Expo Router dynamic routes typing issue
    router.push(`/pictogram/${id}/${pictogram.id}`);
  };

  const handleCategoryNamePress = () => {
    if (category) {
      const categoryName = category.translations[i18n.language] || category.translations.fr;
      speakWithPreferences(categoryName);
    }
  };

  const renderPictogram = ({ item }: { item: Pictogram }) => {
    const label = item.translations[i18n.language]?.label || item.translations.fr.label;

    return (
      <TouchableOpacity
        style={styles.pictogramCard}
        onPress={() => handlePictogramPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.pictogramImage}>{item.image}</Text>
        <Text style={styles.pictogramLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Catégorie introuvable</Text>
      </SafeAreaView>
    );
  }

  const categoryName = category.translations[i18n.language] || category.translations.fr;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCategoryNamePress} style={styles.titleContainer}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.title}>{categoryName}</Text>
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>

        <View style={styles.backButton} />
      </View>

      {/* Pictograms grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : pictograms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun pictogramme disponible pour cette catégorie</Text>
        </View>
      ) : (
        <FlatList
          data={pictograms}
          renderItem={renderPictogram}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: Colors.text,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  speakerIcon: {
    fontSize: 20,
  },
  grid: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  pictogramCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pictogramImage: {
    fontSize: 40,
    marginBottom: 4,
  },
  pictogramLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 24,
  },
});
