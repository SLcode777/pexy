import { Text, Image, StyleSheet, type TextStyle, type ImageStyle } from 'react-native';
import { PICTOGRAM_IMAGE_MAP } from './PictogramImageMap';

interface PictogramImageProps {
  source: string;
  size?: number;
  style?: TextStyle | ImageStyle;
}

/**
 * Component that displays either an emoji or a webp image
 * Automatically detects the type based on the source string
 */
export function PictogramImage({ source, size = 48, style }: PictogramImageProps) {
  // Check if it's an image path (contains .webp or starts with assets/)
  const isImage = source.includes('.webp') || source.startsWith('assets/');

  if (isImage) {
    // It's a webp image - use Image component
    // Get the image from the auto-generated mapping
    const imageSource = PICTOGRAM_IMAGE_MAP[source] || { uri: source };

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
