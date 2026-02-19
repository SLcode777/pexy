import PINCodeModal from "@/components/PINCodeModal";
import SetPINModal from "@/components/SetPINModal";
import { Colors } from "@/constants/colors";
import { useBackup } from "@/hooks/useBackup";
import { useUserProfile } from "@/hooks/useUserProfile";
import { clearAllData, updateUserProfile } from "@/lib/db/operations";
import {
  getTTSLanguage,
  getVoicesByLanguage,
  speak,
  type TTSVoice,
} from "@/lib/tts";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
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
  const { handleExport, handleImport, exportLoading, importLoading } =
    useBackup();
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isFirstTimeSettingPin, setIsFirstTimeSettingPin] = useState(false);

  const kofiButton = require("@/assets/images/support_me_on_kofi_beige.webp");

  useEffect(() => {
    loadVoices();
  }, [i18n.language]);

  useEffect(() => {
    if (profile) {
      setSelectedVoiceId(profile.ttsVoiceId || null);

      // Si l'utilisateur n'a pas de PIN, proposer d'en créer un
      if (!profile.pinCode) {
        setIsFirstTimeSettingPin(true);
        setIsAuthenticated(true); // Autoriser l'accès pour la première fois
      }
    }
  }, [profile]);

  // Réinitialiser l'authentification quand l'utilisateur revient sur cette page
  useFocusEffect(
    useCallback(() => {
      // Quand la page prend le focus, réinitialiser l'authentification
      // (sauf si c'est la première fois et qu'il n'y a pas de PIN)
      if (profile?.pinCode) {
        setIsAuthenticated(false);
      }
    }, [profile?.pinCode]),
  );

  const loadVoices = async (lang?: string) => {
    setLoadingVoices(true);
    const languageCode = lang || i18n.language;
    const availableVoices = await getVoicesByLanguage(languageCode);

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
    const testText = t("settings.tts_voice_test");

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
    const testText = t("settings.tts_speed_test_text");

    speak(testText, {
      language: getTTSLanguage(i18n.language),
      rate: speed,
      voiceId: selectedVoiceId,
    });
  };

  const handleSetPin = async (pin: string) => {
    if (!profile) return;

    await updateUserProfile(profile.id, {
      pinCode: pin,
    });
    await refreshProfile();
    setIsSettingPin(false);
    setIsFirstTimeSettingPin(false);

    Alert.alert(
      t("settings.pin_set_success_title"),
      t("settings.pin_set_success_message"),
    );
  };

  const handleChangePin = () => {
    setIsSettingPin(true);
  };

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync("sl.code.777@gmail.com");
    Alert.alert("✅", t("settings.pin_copied"));
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
              console.error("Error resetting database:", error);
              Alert.alert("Error", "Failed to reset database");
            }
          },
        },
      ],
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
          <Text style={styles.testButtonText}>🔊</Text>
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
      {/* Modal de code PIN pour vérification */}
      {profile?.pinCode && (
        <PINCodeModal
          visible={!isAuthenticated}
          onSuccess={() => setIsAuthenticated(true)}
          correctPIN={profile.pinCode}
          onCancel={() => router.back()}
        />
      )}

      {/* Modal pour définir/modifier le code PIN */}
      <SetPINModal
        visible={isFirstTimeSettingPin || isSettingPin}
        onSuccess={handleSetPin}
        onCancel={
          isFirstTimeSettingPin ? undefined : () => setIsSettingPin(false)
        }
        title={
          isFirstTimeSettingPin
            ? t("settings.pin_protect_title")
            : t("settings.pin_change_title")
        }
        subtitle={
          isFirstTimeSettingPin
            ? t("settings.pin_protect_subtitle")
            : t("settings.pin_change_subtitle")
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>⚙️ {t("settings.title")}</Text>

        {/* Profile info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            👤 {t("settings.profile_section")}
          </Text>
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

        {/* PIN Code Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 {t("settings.pin_code")}</Text>
          <TouchableOpacity style={styles.card} onPress={handleChangePin}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.label}>{t("settings.pin_security")}</Text>
                <Text style={styles.value}>
                  {profile?.pinCode
                    ? t("settings.pin_active")
                    : t("settings.pin_inactive")}
                </Text>
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
              🔊 {t("settings.tts_test_speed")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎙️ {t("settings.tts_voices_title", { count: voices.length })}
          </Text>

          {/* Voices list */}
          {voices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("settings.tts_no_voice")}</Text>
            </View>
          ) : (
            <View style={styles.voicesList}>{voices.map(renderVoiceItem)}</View>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💾 {t("settings.data_management")}
          </Text>

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
                  <Text
                    style={[styles.backupButtonText, styles.importButtonText]}
                  >
                    {t("settings.import_backup")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.backupHint}>{t("settings.backup_hint")}</Text>

          {/* Support Section */}

          <View style={styles.emailContainer}>
            <Text style={styles.emailText}>{t("settings.contact_email")} </Text>
            <Pressable onPress={handleCopyEmail}>
              <Text style={(styles.emailText, styles.emailLink)}>
                sl.code.777@gmail.com
              </Text>
            </Pressable>
          </View>

          <View style={styles.supportContainer}>
            <Text style={styles.supportTextCentered}>
              {t("settings.developed_with_love")}
            </Text>

            <Text style={styles.supportTextCentered}>
              {t("settings.app_free")}
            </Text>
            <Text style={styles.supportTextCentered}>
              {t("settings.support_message")}
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => Linking.openURL("https://ko-fi.com/slcode")}
            >
              <Image
                source={kofiButton}
                style={styles.kofiImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.supportTextCentered}>
              {t("settings.donors_list")}
            </Text>
            <Text style={styles.supportTextCentered}>
              {t("settings.thank_you")}
            </Text>
          </View>

          <View style={styles.todoContainer}>
            <Text style={styles.todoText}>{t("settings.todo_title")}</Text>
            <Text style={styles.todoText}>
              - {t("settings.todo_improve_phrases")}
            </Text>
            <Text style={styles.todoText}>
              - {t("settings.todo_improve_pictos")}
            </Text>
          </View>

          {/* Dev: Reset Database Button */}
          {__DEV__ && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👩‍💻 Dev Only</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetDatabase}
              >
                <Text style={styles.resetButtonText}>🔄 Reset Database</Text>
              </TouchableOpacity>
            </View>
          )}
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
            <Text style={styles.modalTitle}>
              {t("settings.edit_name_modal_title")}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder={t("settings.profile_name_placeholder")}
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCancelEditName}
              >
                <Text style={styles.modalButtonTextCancel}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveName}
                disabled={!editedName.trim()}
              >
                <Text style={styles.modalButtonTextSave}>
                  {t("common.save")}
                </Text>
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
    borderWidth: 1,
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
    color: Colors.text,
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
    borderWidth: 1,
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
    color: Colors.text,
  },
  testSpeedButton: {
    backgroundColor: Colors.backgroundSecondary,
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
    color: Colors.text,
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
    borderWidth: 1,
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
    paddingHorizontal: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
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
    color: Colors.text,
  },
  backupButtonsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: Colors.softYellow,
    padding: 8,
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
    padding: 8,
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
    color: Colors.text,
  },
  backupHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
    marginBottom: 24,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: Colors.primaryDark,
    padding: 16,
    borderRadius: 12,
    borderColor: Colors.border,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkText,
  },
  supportContainer: {
    padding: 10,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
  },
  supportTextCentered: {
    color: Colors.darkText,
    marginVertical: 4,
    fontSize: 14,
    textAlign: "center",
  },
  supportButton: {
    alignItems: "center",
    marginVertical: 8,
    width: "auto",
  },
  kofiImage: {
    width: 180,
    height: 50,
  },
  todoContainer: {
    marginTop: 6,
    marginBottom: 16,
    padding: 10,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
  },
  todoText: {
    color: Colors.darkText,
    fontSize: 14,
  },
  feedbackContainer: {
    marginTop: 6,
    marginBottom: 16,
    padding: 10,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
  },
  feedbackText: {
    color: Colors.darkText,
    fontSize: 14,
  },
  emailContainer: {
    marginTop: 6,
    marginBottom: 16,
    padding: 10,
    backgroundColor: Colors.coral,
    borderRadius: 12,
  },
  emailText: {
    color: Colors.text,
    fontSize: 14,
  },
  emailLink: {
    textDecorationLine: "underline",
    color: Colors.primaryDark,
    fontWeight: "600",
  },
});
