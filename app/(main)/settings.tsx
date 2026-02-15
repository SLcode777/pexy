import { Colors } from "@/constants/colors";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBackup } from "@/hooks/useBackup";
import { updateUserProfile, clearAllData } from "@/lib/db/operations";
import {
  getTTSLanguage,
  getVoicesByLanguage,
  speak,
  type TTSVoice,
} from "@/lib/tts";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile();
  const { handleExport, handleImport, exportLoading, importLoading } = useBackup();
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    loadVoices();
  }, [i18n.language]);

  useEffect(() => {
    if (profile) {
      setSelectedVoiceId(profile.ttsVoiceId || null);
    }
  }, [profile]);

  const loadVoices = async (lang?: string) => {
    setLoadingVoices(true);
    const languageCode = lang || i18n.language;
    const availableVoices = await getVoicesByLanguage(languageCode);

    console.log(
      `📢 Loading voices for language: ${languageCode}`,
      availableVoices.map((v) => ({ name: v.name, id: v.identifier, lang: v.language })),
    );

    setVoices(availableVoices);
    setLoadingVoices(false);
  };

  const handleSelectVoice = async (voice: TTSVoice) => {
    if (!profile) return;

    setSelectedVoiceId(voice.identifier);

    // Save to database
    await updateUserProfile(profile.id, {
      ttsVoiceId: voice.identifier,
    });

    await refreshProfile();
  };

  const handleTestVoice = (voice: TTSVoice) => {
    const testText =
      i18n.language === "fr"
        ? "C'est une voix test."
        : "Hello, I am a text-to-speech voice.";

    speak(testText, {
      language: getTTSLanguage(i18n.language),
      voiceId: voice.identifier,
    });
  };

  const handleEditName = () => {
    if (!profile) return;
    setEditedName(profile.name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!profile || !editedName.trim()) return;

    await updateUserProfile(profile.id, {
      name: editedName.trim(),
    });
    await refreshProfile();
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleChangeLanguage = async (languageCode: string) => {
    if (!profile) return;

    await updateUserProfile(profile.id, {
      language: languageCode,
    });

    // Change i18n language
    await i18n.changeLanguage(languageCode);

    await refreshProfile();
    await loadVoices(languageCode); // Reload voices for new language with explicit lang
  };

  const handleChangeSpeed = async (speed: number) => {
    if (!profile) return;

    await updateUserProfile(profile.id, {
      ttsSpeed: speed,
    });

    await refreshProfile();
  };

  const handleTestSpeed = (speed: number) => {
    const testText =
      i18n.language === "fr"
        ? "Ceci est un test de vitesse de lecture."
        : "This is a speech speed test.";

    speak(testText, {
      language: getTTSLanguage(i18n.language),
      rate: speed,
      voiceId: selectedVoiceId,
    });
  };

  const handleResetDatabase = () => {
    Alert.alert(
      "⚠️ Reset Database (Dev)",
      "This will delete ALL data and restart the onboarding. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              router.replace("/(onboarding)/profile");
            } catch (error) {
              Alert.alert("Error", "Failed to reset database");
            }
          },
        },
      ]
    );
  };

  const renderVoiceItem = (voice: TTSVoice) => {
    const isSelected = voice.identifier === selectedVoiceId;

    return (
      <View key={voice.identifier} style={styles.voiceItem}>
        <TouchableOpacity
          style={[styles.voiceCard, isSelected && styles.voiceCardSelected]}
          onPress={() => handleSelectVoice(voice)}
        >
          <View style={styles.voiceInfo}>
            <Text style={styles.voiceName}>{voice.name}</Text>
            <Text style={styles.voiceQuality}>{voice.quality}</Text>
          </View>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => handleTestVoice(voice)}
        >
          <Text style={styles.testButtonText}>🔊 Tester</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (profileLoading || loadingVoices) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>⚙️ {t("settings.title")}</Text>

        {/* Profile info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profil</Text>
          <TouchableOpacity style={styles.card} onPress={handleEditName}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.label}>{t("settings.profile_name")}</Text>
                <Text style={styles.value}>{profile?.name}</Text>
              </View>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 {t("settings.language")}</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === "fr" && styles.languageButtonActive,
              ]}
              onPress={() => handleChangeLanguage("fr")}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  i18n.language === "fr" && styles.languageButtonTextActive,
                ]}
              >
                🇫🇷 Français
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === "en" && styles.languageButtonActive,
              ]}
              onPress={() => handleChangeLanguage("en")}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  i18n.language === "en" && styles.languageButtonTextActive,
                ]}
              >
                🇬🇧 English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TTS Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ {t("settings.tts_speed")}</Text>
          <View style={styles.speedButtons}>
            <TouchableOpacity
              style={[
                styles.speedButton,
                profile?.ttsSpeed === 0.5 && styles.speedButtonActive,
              ]}
              onPress={() => handleChangeSpeed(0.5)}
            >
              <Text
                style={[
                  styles.speedButtonText,
                  profile?.ttsSpeed === 0.5 && styles.speedButtonTextActive,
                ]}
              >
                🐢 {t("settings.tts_speed_slow")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.speedButton,
                profile?.ttsSpeed === 1.0 && styles.speedButtonActive,
              ]}
              onPress={() => handleChangeSpeed(1.0)}
            >
              <Text
                style={[
                  styles.speedButtonText,
                  profile?.ttsSpeed === 1.0 && styles.speedButtonTextActive,
                ]}
              >
                ▶️ {t("settings.tts_speed_normal")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.speedButton,
                profile?.ttsSpeed === 1.25 && styles.speedButtonActive,
              ]}
              onPress={() => handleChangeSpeed(1.25)}
            >
              <Text
                style={[
                  styles.speedButtonText,
                  profile?.ttsSpeed === 1.25 && styles.speedButtonTextActive,
                ]}
              >
                🐰 {t("settings.tts_speed_fast")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test speed button */}
          <TouchableOpacity
            style={styles.testSpeedButton}
            onPress={() => handleTestSpeed(profile?.ttsSpeed || 1.0)}
          >
            <Text style={styles.testSpeedButtonText}>
              🔊 Tester la vitesse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎙️ Voix Text-to-Speech ({voices.length} disponibles)
          </Text>

          {/* Voices list */}
          {voices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune voix disponible</Text>
            </View>
          ) : (
            <View style={styles.voicesList}>
              {voices.map(renderVoiceItem)}
            </View>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 {t("settings.data_management")}</Text>

          <View style={styles.backupButtonsContainer}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <>
                  <Text style={styles.backupIcon}>📤</Text>
                  <Text style={styles.backupButtonText}>
                    {t("settings.export_backup")}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importButton}
              onPress={handleImport}
              disabled={importLoading}
            >
              {importLoading ? (
                <ActivityIndicator size="small" color={Colors.darkText} />
              ) : (
                <>
                  <Text style={styles.backupIcon}>📥</Text>
                  <Text style={[styles.backupButtonText, styles.importButtonText]}>
                    {t("settings.import_backup")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.backupHint}>
            {t("settings.backup_hint")}
          </Text>

          {/* Dev: Reset Database Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetDatabase}
          >
            <Text style={styles.resetButtonText}>🔄 Reset Database (Dev)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditingName}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEditName}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le nom</Text>
            <TextInput
              style={styles.modalInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Nom du profil"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCancelEditName}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveName}
                disabled={!editedName.trim()}
              >
                <Text style={styles.modalButtonTextSave}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editIcon: {
    fontSize: 20,
  },
  languageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  languageButtonTextActive: {
    color: Colors.darkText,
  },
  speedButtons: {
    flexDirection: "row",
    gap: 8,
  },
  speedButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  speedButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  speedButtonTextActive: {
    color: Colors.darkText,
  },
  testSpeedButton: {
    backgroundColor: Colors.softYellow,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginTop: 12,
  },
  testSpeedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  tabTextActive: {
    color: Colors.darkText,
  },
  voicesList: {
    gap: 12,
  },
  voiceItem: {
    flexDirection: "row",
    gap: 8,
  },
  voiceCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voiceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBlue,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  voiceQuality: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkmark: {
    fontSize: 24,
    color: Colors.primary,
  },
  testButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.softYellow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkText,
  },
  backupButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: Colors.softYellow,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 56,
  },
  importButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 56,
  },
  backupIcon: {
    fontSize: 24,
  },
  backupButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  importButtonText: {
    color: Colors.darkText,
  },
  backupHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: Colors.coral,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkText,
  },
});
