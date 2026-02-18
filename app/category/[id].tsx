import { PictogramCard } from "@/components/PictogramCard";
import { AddCustomPictogramCard } from "@/components/AddCustomPictogramCard";
import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { loadPictograms } from "@/lib/pictograms";
import { speakWithPreferences } from "@/lib/speakWithPreferences";
import { getCustomPictograms } from "@/lib/db/operations";
import type { Pictogram } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystemLegacy from 'expo-file-system/legacy';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useCallback } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [loading, setLoading] = useState(true);

  const category = CATEGORIES.find((c) => c.id === id);

  useEffect(() => {
    loadCategoryPictograms();
  }, [id]);

  // Reload when screen comes into focus (after creating custom pictogram)
  useFocusEffect(
    useCallback(() => {
      if (id === 'custom') {
        loadCategoryPictograms();
      }
    }, [id])
  );

  const loadCategoryPictograms = async () => {
    setLoading(true);

    if (id === 'custom') {
      // Load custom pictograms from database
      const customPictos = await getCustomPictograms();
      const formattedPictos: Pictogram[] = customPictos.map(cp => ({
        id: cp.customId,
        category: 'custom',
        image: `file://${FileSystemLegacy.documentDirectory}${cp.imagePath}`,
        translations: {
          fr: { label: cp.name, phrases: [] },
          en: { label: cp.name, phrases: [] },
        },
      }));
      setPictograms(formattedPictos);
    } else {
      // Load regular pictograms from JSON
      const data = await loadPictograms(id);
      setPictograms(data);
    }

    setLoading(false);
  };

  const handlePictogramPress = (pictogram: Pictogram) => {
    // Speak pictogram label with user's preferred voice
    const label =
      pictogram.translations[i18n.language]?.label ||
      pictogram.translations.fr.label;
    speakWithPreferences(label);

    // Navigate to pictogram detail
    // @ts-expect-error - Expo Router dynamic routes typing issue
    router.push(`/pictogram/${id}/${pictogram.id}`);
  };

  const handleCategoryNamePress = () => {
    if (category) {
      const categoryName =
        category.translations[i18n.language] || category.translations.fr;
      speakWithPreferences(categoryName);
    }
  };

  const renderPictogram = ({ item }: { item: Pictogram }) => {
    const label =
      item.translations[i18n.language]?.label || item.translations.fr.label;

    return (
      <PictogramCard
        image={item.image}
        label={label}
        onPress={() => handlePictogramPress(item)}
        size={CARD_WIDTH}
      />
    );
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('category.not_found')}</Text>
      </SafeAreaView>
    );
  }

  const categoryName =
    category.translations[i18n.language] || category.translations.fr;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCategoryNamePress}
          style={styles.titleContainer}
        >
          {/* <Text style={styles.categoryIcon}>{category.icon}</Text> */}
          <Text style={styles.title}>{categoryName}</Text>
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>

        <View style={styles.backButton} />
      </View>

      {/* Pictograms grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : pictograms.length === 0 && id !== 'custom' ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('category.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pictograms}
          renderItem={renderPictogram}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            id === 'custom' ? (
              <View style={styles.addCardContainer}>
                <AddCustomPictogramCard
                  size={CARD_WIDTH}
                  onPress={() => router.push('/create-custom-pictogram')}
                />
              </View>
            ) : null
          }
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: Colors.text,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pictogramImage: {
    fontSize: 40,
    marginBottom: 4,
  },
  pictogramLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginTop: 24,
  },
  addCardContainer: {
    alignItems: 'flex-start',
  },
});
