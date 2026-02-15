import { Colors } from "@/constants/colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PictogramImage } from "./PictogramImage";

interface PictogramCardProps {
  image: string;
  label: string;
  onPress: () => void;
  size: number;
}

/**
 * Card component for displaying pictograms
 * - Webp images fill the entire card with label overlay at bottom
 * - Emojis use the classic centered layout
 */
export function PictogramCard({
  image,
  label,
  onPress,
  size,
}: PictogramCardProps) {
  const isImage = image.includes(".webp") || image.startsWith("assets/");

  if (isImage) {
    // New layout: image fills card, text overlay at bottom
    return (
      <TouchableOpacity
        style={[styles.card, { width: size, height: size }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <PictogramImage source={image} size={size} style={styles.fullImage} />
        </View>
        <View style={styles.labelOverlay}>
          <Text style={styles.labelText} numberOfLines={2}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  } else {
    // Classic layout: emoji centered, text below
    return (
      <TouchableOpacity
        style={[styles.card, styles.classicCard, { width: size, height: size }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <PictogramImage source={image} size={48} />
        <Text style={styles.classicLabel} numberOfLines={2}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
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
    backgroundColor: Colors.backgroundSecondary,
  },
  classicCard: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  labelOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  classicLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginTop: 8,
  },
});
