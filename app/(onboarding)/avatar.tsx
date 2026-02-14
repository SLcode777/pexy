import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { AVATARS } from '@/constants/avatars';
import type { AvatarGender } from '@/types';

export default function AvatarScreen() {
  const { t } = useTranslation();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [selectedGender, setSelectedGender] = useState<AvatarGender | 'all'>('all');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  // Filter avatars by gender
  const filteredAvatars = selectedGender === 'all'
    ? AVATARS
    : AVATARS.filter(avatar => avatar.gender === selectedGender);

  const handleNext = () => {
    if (selectedAvatarId) {
      router.push({
        // @ts-expect-error - Expo Router group routes typing issue
        pathname: '/(onboarding)/welcome',
        params: { name, avatarId: selectedAvatarId },
      });
    }
  };

  const renderAvatar = ({ item }: { item: typeof AVATARS[0] }) => {
    const isSelected = item.id === selectedAvatarId;

    return (
      <TouchableOpacity
        style={[
          styles.avatarCard,
          isSelected && styles.avatarCardSelected,
        ]}
        onPress={() => setSelectedAvatarId(item.id)}
      >
        <Text style={styles.avatarEmoji}>{item.image}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.avatar_title')}</Text>
        <Text style={styles.message}>{t('onboarding.avatar_message')}</Text>
      </View>

      {/* Gender filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedGender === 'boy' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedGender('boy')}
        >
          <Text
            style={[
              styles.filterText,
              selectedGender === 'boy' && styles.filterTextActive,
            ]}
          >
            {t('onboarding.avatar_filter_boy')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedGender === 'girl' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedGender('girl')}
        >
          <Text
            style={[
              styles.filterText,
              selectedGender === 'girl' && styles.filterTextActive,
            ]}
          >
            {t('onboarding.avatar_filter_girl')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedGender === 'mixed' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedGender('mixed')}
        >
          <Text
            style={[
              styles.filterText,
              selectedGender === 'mixed' && styles.filterTextActive,
            ]}
          >
            {t('onboarding.avatar_filter_mixed')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatars grid */}
      <FlatList
        data={filteredAvatars}
        renderItem={renderAvatar}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />

      {/* Next button */}
      <TouchableOpacity
        style={[
          styles.button,
          !selectedAvatarId && styles.buttonDisabled,
        ]}
        onPress={handleNext}
        disabled={!selectedAvatarId}
      >
        <Text style={styles.buttonText}>{t('common.next')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.darkText,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.darkText,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'white',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
    opacity: 0.7,
  },
  filterTextActive: {
    color: Colors.primary,
    opacity: 1,
  },
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  row: {
    gap: 16,
    marginBottom: 16,
  },
  avatarCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarCardSelected: {
    borderColor: Colors.darkText,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  button: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
});
