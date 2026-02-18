import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { getFavorites } from '@/lib/db/operations';
import { loadFavoritePictograms } from '@/lib/pictograms';
import { speakWithPreferences } from '@/lib/speakWithPreferences';
import { PictogramCard } from '@/components/PictogramCard';
import type { Pictogram } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export default function FavoritesScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [pictograms, setPictograms] = useState<Array<Pictogram & { categoryId: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Reload favorites when screen is focused (after adding/removing favorites)
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [i18n.language])
  );

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoriteIds = await getFavorites();
      const favoritePictograms = await loadFavoritePictograms(favoriteIds);
      setPictograms(favoritePictograms);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePictogramPress = (pictogram: Pictogram & { categoryId: string }) => {
    // Speak pictogram label with user's preferred voice
    const label = pictogram.translations[i18n.language]?.label || pictogram.translations.fr.label;
    speakWithPreferences(label);

    // Navigate to pictogram detail
    // @ts-expect-error - Expo Router dynamic routes typing issue
    router.push(`/pictogram/${pictogram.categoryId}/${pictogram.id}`);
  };

  const renderPictogram = ({ item }: { item: Pictogram & { categoryId: string } }) => {
    const label = item.translations[i18n.language]?.label || item.translations.fr.label;

    return (
      <PictogramCard
        image={item.image}
        label={label}
        onPress={() => handlePictogramPress(item)}
        size={CARD_WIDTH}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>⭐ {t('common.favorites')}</Text>
      </View>

      {/* Pictograms grid */}
      {pictograms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>{t('favorites.empty_text')}</Text>
          <Text style={styles.emptySubtext}>
            {t('favorites.empty_subtext')}
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
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
});
