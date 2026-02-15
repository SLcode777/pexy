import { Text, Image, StyleSheet, type TextStyle, type ImageStyle } from 'react-native';
import { PICTOGRAM_IMAGE_MAP } from './PictogramImageMap';

interface PictogramImageProps {
  source: string;
  size?: number;
  style?: TextStyle | ImageStyle;
}

/**
 * Component that displays either an emoji, a webp image, or a local file
 * Automatically detects the type based on the source string
 */
export function PictogramImage({ source, size = 48, style }: PictogramImageProps) {
  // Check if it's a local file URI
  const isLocalFile = source.startsWith('file://');

  // Check if it's an image path (contains .webp, starts with assets/, or is a local file)
  const isImage = source.includes('.webp') || source.startsWith('assets/') || isLocalFile;

  if (isImage) {
    // It's an image - use Image component
    // For local files, use { uri: source }, otherwise use the mapping
    const imageSource = isLocalFile
      ? { uri: source }
      : (PICTOGRAM_IMAGE_MAP[source] || { uri: source });

    return (
      <Image
        source={imageSource}
        style={[{ width: size, height: size }, styles.image, style]}
        resizeMode="cover"
      />
    );
  } else {
    // It's an emoji - use Text component
    return (
      <Text style={[styles.emoji, { fontSize: size }, style]}>
        {source}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    // Image styles
  },
  emoji: {
    textAlign: 'center',
  },
});
