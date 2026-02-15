import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { createCustomPictogram } from '@/lib/db/operations';

export default function CreateCustomPictogramModal() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'choose' | 'name'>('choose');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pictogramName, setPictogramName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'application a besoin d\'accéder à la caméra pour prendre des photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'application a besoin d\'accéder à la galerie pour sélectionner des photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setStep('name');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo.');
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setStep('name');
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la photo.');
    }
  };

  const handleCreate = async () => {
    if (!selectedImage || !pictogramName.trim()) return;

    setIsSaving(true);

    try {
      // 1. Generate unique ID
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const customId = `custom_${timestamp}_${randomId}`;

      // 2. Convert image to WebP format for better compression
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 1024 } }], // Resize to max 1024px width while maintaining aspect ratio
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
      );

      // 3. Copy converted image to permanent directory
      const filename = `picto_${timestamp}_${randomId}.webp`;
      const destPath = `${FileSystemLegacy.documentDirectory}custom_pictograms/${filename}`;

      // Copy image using legacy API
      await FileSystemLegacy.copyAsync({
        from: manipulatedImage.uri,
        to: destPath,
      });

      // 4. Save to database
      await createCustomPictogram({
        customId,
        name: pictogramName.trim(),
        imagePath: `custom_pictograms/${filename}`,
        categoryId: 'custom',
      });

      // 5. Redirect to pictogram page
      router.replace(`/pictogram/custom/${customId}`);
    } catch (error) {
      console.error('Error creating custom pictogram:', error);
      Alert.alert('Erreur', 'Impossible de créer le pictogramme.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'name') {
      setStep('choose');
      setSelectedImage(null);
      setPictogramName('');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
            <Text style={styles.closeIcon}>{step === 'name' ? '←' : '✖️'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 'choose' ? 'Créer un pictogramme' : 'Nommer le pictogramme'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {step === 'choose' ? (
            // Step 1: Choose source
            <View style={styles.section}>
              <Text style={styles.description}>
                Choisissez une photo pour créer votre pictogramme personnalisé
              </Text>

              <TouchableOpacity
                style={styles.choiceButton}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <Text style={styles.choiceIcon}>📷</Text>
                <Text style={styles.choiceTitle}>Prendre une photo</Text>
                <Text style={styles.choiceDescription}>
                  Utilisez la caméra pour photographier un objet
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choiceButton}
                onPress={handleChooseFromGallery}
                activeOpacity={0.7}
              >
                <Text style={styles.choiceIcon}>🖼️</Text>
                <Text style={styles.choiceTitle}>Choisir dans la galerie</Text>
                <Text style={styles.choiceDescription}>
                  Sélectionnez une photo existante
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Step 2: Name input
            <View style={styles.section}>
              {/* Image preview */}
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: selectedImage?.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>

              {/* Name input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Nom du pictogramme *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Mon doudou"
                  placeholderTextColor={Colors.textSecondary}
                  value={pictogramName}
                  onChangeText={setPictogramName}
                  maxLength={50}
                  autoFocus
                />
                <Text style={styles.charCount}>{pictogramName.length}/50</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action button */}
        {step === 'name' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.createButton, !pictogramName.trim() && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={!pictogramName.trim() || isSaving}
            >
              <Text style={styles.createButtonText}>
                {isSaving ? 'Création...' : 'Créer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 24,
  },
  section: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  choiceButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  choiceIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  choiceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  inputSection: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
