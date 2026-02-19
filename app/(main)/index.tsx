import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { CATEGORY_IMAGE_MAP } from "@/components/CategoryImageMap";
import { getUserProfile, getHiddenCategories } from "@/lib/db/operations";
import { speakWithPreferences } from "@/lib/speakWithPreferences";
import type { Category } from "@/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 16;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("");
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const pexy = require("@/assets/images/no-bg-Pexy-mascot.webp");

  useEffect(() => {
    loadUserProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHiddenCategories();
    }, [])
  );

  const loadUserProfile = async () => {
    const profile = await getUserProfile();
    if (profile) {
      setUserName(profile.name);

      // Welcome message with TTS
      speakWithPreferences(t("common.greeting", { name: profile.name }));
    }
  };

  const loadHiddenCategories = async () => {
    const hidden = await getHiddenCategories();
    setHiddenCategories(hidden);
  };

  const handleCategoryPress = (category: Category) => {
    // Speak category name with user's preferred voice
    const categoryName =
      category.translations[i18n.language] || category.translations.fr;
    speakWithPreferences(categoryName);

    // Navigate to category page
    router.push(`/category/${category.id}`);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const categoryName =
      item.translations[i18n.language] || item.translations.fr;

    return (
      <TouchableOpacity
        style={[styles.categoryCard, { backgroundColor: item.color }]}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <Image source={CATEGORY_IMAGE_MAP[item.image]} style={styles.categoryImage} resizeMode="cover" />
        <View style={styles.categoryLabelOverlay}>
          <Text style={styles.categoryName}>{categoryName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {userName
            ? t("common.greeting", { name: userName })
            : t("common.greeting_default")}
        </Text>
        <Image source={pexy} style={styles.pexy} />
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => router.push("/search")}
        activeOpacity={0.7}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>
          {t("common.search_placeholder")}
        </Text>
      </TouchableOpacity>

      {/* Categories grid */}
      <FlatList
        data={CATEGORIES.filter(c => !hiddenCategories.includes(c.id))}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: 68 + insets.bottom },
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  pexy: {
    width: 50,
    height: 50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  grid: {
    paddingHorizontal: 16,
  },
  row: {
    gap: 16,
    marginBottom: 16,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  categoryLabelOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
});
