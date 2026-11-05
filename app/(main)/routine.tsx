import { CATEGORY_IMAGE_MAP } from "@/components/CategoryImageMap";
import { PictogramCard } from "@/components/PictogramCard";
import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { loadPictograms } from "@/lib/pictograms";
import { speakWithPreferences } from "@/lib/speakWithPreferences";
import type { Category, Pictogram } from "@/types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SelectedPicto {
  id: string;
  name: string;
  image: string;
}

import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 16;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const DEFAULT_FIRST_LABEL = "D'abord,";
const DEFAULT_THEN_LABEL = "ensuite";

export default function RoutineScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("fr") ? "fr" : "en") as "fr" | "en";
  const pexy = require("@/assets/images/no-bg-Pexy-mascot.webp");
  const routineIcon = require("@/assets/images/routine-icon.png");

  // Textes configurables
  const DEFAULT_FIRST_LABEL = "D'abord,";
  const DEFAULT_THEN_LABEL = "ensuite,";

  // Valeurs par défaut personnalisables
   const [firstLabel, setFirstLabel] = useState(DEFAULT_FIRST_LABEL);
   const [thenLabel, setThenLabel] = useState(DEFAULT_THEN_LABEL);

   // Fonction pour réinitialiser si besoin
   const handleResetLabels = () => {
     setFirstLabel(DEFAULT_FIRST_LABEL);
     setThenLabel(DEFAULT_THEN_LABEL);
   };

  // Pictos sélectionnés
  const [firstPicto, setFirstPicto] = useState<SelectedPicto | null>(null);
  const [thenPicto, setThenPicto] = useState<SelectedPicto | null>(null);

  // Gestion de la modale
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState<"first" | "then" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryPictos, setCategoryPictos] = useState<Pictogram[]>([]);
  const [loadingPictos, setLoadingPictos] = useState(false);

  // Ouvrir la modale
  const handleOpenPicker = (slot: "first" | "then") => {
    setActiveSlot(slot);
    setSelectedCategory(null);
    setCategoryPictos([]);
    setModalVisible(true);
  };

  // Revenir à la grille des catégories
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryPictos([]);
    setLoadingPictos(false);
  };

  // Clic sur une catégorie
  const handleSelectCategory = async (category: Category) => {
    setSelectedCategory(category);
    setLoadingPictos(true);
    try {
      const pictos = await loadPictograms(category.id);
      setCategoryPictos(pictos || []);
    } catch (error) {
      console.error("Erreur lors du chargement des pictogrammes :", error);
      setCategoryPictos([]);
    } finally {
      setLoadingPictos(false);
    }
  };

  // Clic sur un pictogramme
  const handleSelectPicto = (picto: Pictogram) => {
    const rawTranslation = picto.translations?.[currentLang];
    const pictoName =
      typeof rawTranslation === "string"
        ? rawTranslation
        : (rawTranslation as any)?.label ||
          (rawTranslation as any)?.name ||
          (picto as any).label ||
          (picto as any).name ||
          "";

    const chosen: SelectedPicto = {
      id: picto.id,
      name: String(pictoName),
      image: picto.image,
    };

    if (activeSlot === "first") {
      setFirstPicto(chosen);
    } else if (activeSlot === "then") {
      setThenPicto(chosen);
    }

    setModalVisible(false);
    setSelectedCategory(null);
    setCategoryPictos([]);
  };

  // Synthèse vocale
  const handlePlay = async () => {
    if (!firstPicto || !thenPicto) return;
    const phrase = `${firstLabel.trim()} ${firstPicto.name}, ${thenLabel.trim()} ${thenPicto.name}`;
    await speakWithPreferences(phrase);
  };

  const isReadyToPlay = firstPicto !== null && thenPicto !== null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Bandeau d'en-tête : Titre à gauche, renard à droite */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Image source={routineIcon} style={styles.headerIcon} resizeMode="contain" />
          <Text style={styles.headerTitle}>Routine</Text>
        </View>
        <Image source={pexy} style={styles.pexy} resizeMode="contain" />
      </View>
      <View style={styles.container}>
        {/* Bande TEACCH */}
        <View style={styles.boardContainer}>
          {/* Bloc D'ABORD */}
          <View style={styles.slotBlock}>
            <TextInput
              style={styles.labelInput}
              value={firstLabel}
              onChangeText={setFirstLabel}
              placeholder="D'abord,"
              placeholderTextColor="#999"
              selectTextOnFocus
              maxLength={30}
            />
            <TouchableOpacity
              style={styles.slotCard}
              activeOpacity={0.7}
              onPress={() => handleOpenPicker("first")}
            >
              {firstPicto ? (
                <PictogramCard
                  image={firstPicto.image}
                  label={firstPicto.name}
                  size={130}
                  onPress={() => handleOpenPicker("first")}
                />
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.plusIcon}>➕</Text>
                  <Text style={styles.placeholderDots}>...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Flèche */}
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowIcon}>➡️</Text>
          </View>

          {/* Bloc ENSUITE */}
          <View style={styles.slotBlock}>
            <TextInput
              style={styles.labelInput}
              value={thenLabel}
              onChangeText={setThenLabel}
              placeholder="ensuite"
              placeholderTextColor="#999"
              selectTextOnFocus
              maxLength={30}
            />
            <TouchableOpacity
              style={styles.slotCard}
              activeOpacity={0.7}
              onPress={() => handleOpenPicker("then")}
            >
              {thenPicto ? (
                <PictogramCard
                  image={thenPicto.image}
                  label={thenPicto.name}
                  size={130}
                  onPress={() => handleOpenPicker("then")}
                />
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.plusIcon}>➕</Text>
                  <Text style={styles.placeholderDots}>...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton de lecture */}
        {isReadyToPlay && (
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Text style={styles.playButtonText}>🔊 Écouter la phrase</Text>
          </TouchableOpacity>
        )}

        {/* MODALE DE SÉLECTION */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Barre d'en-tête */}
            <View style={styles.modalHeader}>
              {selectedCategory ? (
                <TouchableOpacity
                  onPress={handleBackToCategories}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>⬅️ Catégories</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.modalTitle}>Choisir une catégorie</Text>
              )}
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setSelectedCategory(null);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* VUE 1 : Grille des catégories identique à l'accueil */}
            {!selectedCategory ? (
              <FlatList
                key="list-categories-2"
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, paddingVertical: 12 }}
                columnWrapperStyle={{ gap: CARD_GAP, marginBottom: 16 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const categoryName =
                    item.translations?.[currentLang] ||
                    item.translations?.fr ||
                    item.id;

                  return (
                    <TouchableOpacity
                      style={[styles.categoryCard, { backgroundColor: item.color }]}
                      onPress={() => handleSelectCategory(item)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={CATEGORY_IMAGE_MAP[item.image]}
                        style={styles.categoryImage}
                        resizeMode="cover"
                      />
                      <View style={styles.categoryLabelOverlay}>
                        <Text style={styles.categoryName}>{categoryName}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : loadingPictos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary || "#4A6FA5"} />
              </View>
            ) : (
              /* VUE 2 : Pictogrammes */
              <FlatList
                key="list-pictos-3"
                data={categoryPictos}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const rawTranslation = item.translations?.[currentLang];
                  const pictoLabel =
                    typeof rawTranslation === "string"
                      ? rawTranslation
                      : (rawTranslation as any)?.label ||
                        (rawTranslation as any)?.name ||
                        (item as any).label ||
                        (item as any).name ||
                        "";

                  return (
                    <View style={styles.pictoCardWrapper}>
                      <PictogramCard
                        image={item.image}
                        label={String(pictoLabel)}
                        size={100}
                        onPress={() => handleSelectPicto(item)}
                      />
                    </View>
                  );
                }}
              />
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 50,
    height: 50,
  },
  pexy: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  boardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  slotBlock: {
    alignItems: "center",
    flex: 1,
  },
  labelInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#B0BEC5",
    paddingBottom: 6,
    minWidth: 120,
  },
  slotCard: {
    width: 135,
    height: 135,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#4A6FA5",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    overflow: "hidden",
  },
  emptySlot: {
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  placeholderDots: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#888",
  },
  arrowContainer: {
    paddingHorizontal: 8,
    marginTop: 36,
  },
  arrowIcon: {
    fontSize: 28,
  },
  playButton: {
    marginTop: 50,
    backgroundColor: "#3963d6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4A6FA5",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
  },
  listContent: {
    padding: 12,
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
    color: "#1A1A1A",
    textAlign: "center",
  },
  categoryDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666",
    textAlign: "center",
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    color: "#2C3E50",
  },
  loadingContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pictoCardWrapper: {
    flex: 1 / 3,
    margin: 6,
    alignItems: "center",
  },
  categoryImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  categoryLabelBar: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
});