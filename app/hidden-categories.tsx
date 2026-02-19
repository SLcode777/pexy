import { CATEGORY_IMAGE_MAP } from "@/components/CategoryImageMap";
import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { getUserProfile, updateUserProfile } from "@/lib/db/operations";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CONTENT_PADDING = 16;
const CATEGORY_GAP = 10;
const CATEGORY_CARD_WIDTH =
  (Dimensions.get("window").width - CONTENT_PADDING * 2 - CATEGORY_GAP) / 2;

export default function HiddenCategoriesScreen() {
  const { t, i18n } = useTranslation();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getUserProfile();
    if (profile) {
      setProfileId(profile.id);
      try {
        const hidden = profile.hiddenCategories
          ? (JSON.parse(profile.hiddenCategories) as string[])
          : [];
        setHiddenCategories(hidden);
      } catch {
        setHiddenCategories([]);
      }
    }
  };

  const handleToggleCategory = async (categoryId: string) => {
    if (!profileId || categoryId === "custom") return;

    const newHidden = hiddenCategories.includes(categoryId)
      ? hiddenCategories.filter((id) => id !== categoryId)
      : [...hiddenCategories, categoryId];

    setHiddenCategories(newHidden);
    await updateUserProfile(profileId, {
      hiddenCategories: JSON.stringify(newHidden),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← {t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          🗂️ {t("settings.visible_categories_title")}
        </Text>
      </View>

      <Text style={styles.hint}>{t("settings.visible_categories_hint")}</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        <View style={styles.gridInner}>
          {CATEGORIES.map((category) => {
            const isCustom = category.id === "custom";
            const isHidden = hiddenCategories.includes(category.id);
            const categoryName =
              category.translations[i18n.language] || category.translations.fr;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.cardOuter,
                  !isHidden && styles.cardVisible,
                  isHidden && styles.cardHidden,
                ]}
                onPress={() => handleToggleCategory(category.id)}
                activeOpacity={isCustom ? 1 : 0.7}
              >
                <View
                  style={[
                    styles.cardInner,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Image
                    source={CATEGORY_IMAGE_MAP[category.image]}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {isHidden && <View style={styles.cardOverlay} />}
                  <View style={styles.cardLabel}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {categoryName}
                    </Text>
                  </View>
                  {!isHidden && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primaryDark,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: CONTENT_PADDING,
    marginBottom: 16,
    lineHeight: 18,
  },
  grid: {
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: 24,
  },
  gridInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CATEGORY_GAP,
  },
  cardOuter: {
    width: CATEGORY_CARD_WIDTH,
    height: CATEGORY_CARD_WIDTH,
    borderRadius: 16,
  },
  cardInner: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  cardVisible: {
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  cardHidden: {
    opacity: 0.9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  cardImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
  },
  cardLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cardName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 6,
    right: 8,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: "bold",
  },
});
