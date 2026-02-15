import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface AddCustomPictogramCardProps {
  size: number;
  onPress: () => void;
}

export function AddCustomPictogramCard({ size, onPress }: AddCustomPictogramCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>➕</Text>
      <Text style={styles.label}>Créer</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 48,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
});
