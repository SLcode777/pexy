import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import { Alert } from "react-native";
import type { BackupData } from "@/types/backup";
import { BackupError } from "@/types/backup";
import {
  getUserProfile,
  getFavorites,
  getAllCustomPhrases,
  createUserProfile,
  addFavorite,
  addCustomPhrase,
  clearAllData,
} from "@/lib/db/operations";
import type { CustomPhrase } from "@/lib/db/schema";

// Constants
const BACKUP_VERSION = "1.0.0";
const APP_VERSION = "1.0.0";

/**
 * Format timestamp for file naming
 * Returns format: YYYY-MM-DD-HHmmss
 */
const formatTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
};

/**
 * Generate SHA-256 checksum for data verification
 */
const generateChecksum = async (data: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
  return digest;
};

/**
 * Validate backup file structure
 * Throws BackupError if invalid
 */
const validateBackupStructure = (backup: any): void => {
  // Check required fields
  if (!backup.version || typeof backup.version !== "string") {
    throw new BackupError("backup.error_invalid");
  }

  if (!backup.checksum || typeof backup.checksum !== "string") {
    throw new BackupError("backup.error_invalid");
  }

  if (!backup.data || typeof backup.data !== "object") {
    throw new BackupError("backup.error_invalid");
  }

  // Validate data structure
  const { data } = backup;

  if (!Array.isArray(data.favorites)) {
    throw new BackupError("backup.error_invalid");
  }

  if (!data.customPhrases || typeof data.customPhrases !== "object") {
    throw new BackupError("backup.error_invalid");
  }

  if (!Array.isArray(data.customPhrases.fr) || !Array.isArray(data.customPhrases.en)) {
    throw new BackupError("backup.error_invalid");
  }

  // Validate userProfile if present
  if (data.userProfile !== null && typeof data.userProfile !== "object") {
    throw new BackupError("backup.error_invalid");
  }
};

/**
 * Check if backup version is compatible with current app
 */
const isVersionCompatible = (backupVersion: string): boolean => {
  const backupMajor = parseInt(backupVersion.split(".")[0], 10);
  const currentMajor = parseInt(BACKUP_VERSION.split(".")[0], 10);
  return backupMajor === currentMajor;
};

/**
 * Export user data to a backup file and share it
 */
export const exportBackup = async (): Promise<void> => {
  try {
    // 1. Fetch all data from database
    const userProfile = await getUserProfile();
    const favorites = await getFavorites();
    const customPhrasesFr = await getAllCustomPhrases("fr");
    const customPhrasesEn = await getAllCustomPhrases("en");

    // Check if there's any data to backup
    if (!userProfile) {
      throw new BackupError("backup.error_no_data");
    }

    // 2. Build backup data object
    const backupData: Omit<BackupData, "checksum"> = {
      version: BACKUP_VERSION,
      appVersion: APP_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        userProfile,
        favorites,
        customPhrases: {
          fr: customPhrasesFr,
          en: customPhrasesEn,
        },
      },
    };

    // 3. Calculate checksum
    const dataString = JSON.stringify(backupData.data);
    const checksum = await generateChecksum(dataString);

    const fullBackupData: BackupData = {
      ...backupData,
      checksum,
    };

    // 4. Generate filename
    const timestamp = formatTimestamp();
    const filename = `pexy-backup-${timestamp}.json`;
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    // 5. Write JSON to file
    const jsonContent = JSON.stringify(fullBackupData, null, 2);
    await FileSystem.writeAsStringAsync(filePath, jsonContent);

    // 6. Share file using native share dialog
    await Sharing.shareAsync(filePath, {
      mimeType: "application/json",
      dialogTitle: "Save Pexy Backup",
      UTI: "public.json",
    });

    // 7. Clean up temporary file after 5 seconds
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      } catch (error) {
        console.error("Failed to clean up temporary backup file:", error);
      }
    }, 5000);
  } catch (error) {
    if (error instanceof BackupError) {
      throw error;
    }
    throw new BackupError("backup.error_corrupted");
  }
};

/**
 * Import and restore user data from a backup file
 */
export const importBackup = async (): Promise<void> => {
  try {
    // 1. Open file picker
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    // User cancelled
    if (result.canceled) {
      return;
    }

    const fileUri = result.assets[0].uri;

    // 2. Read file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri);

    // 3. Parse JSON
    let backup: any;
    try {
      backup = JSON.parse(fileContent);
    } catch (error) {
      throw new BackupError("backup.error_corrupted");
    }

    // 4. Validate structure
    validateBackupStructure(backup);

    // 5. Verify checksum
    const dataString = JSON.stringify(backup.data);
    const calculatedChecksum = await generateChecksum(dataString);

    if (calculatedChecksum !== backup.checksum) {
      throw new BackupError("backup.error_corrupted");
    }

    // 6. Check version compatibility
    if (!isVersionCompatible(backup.version)) {
      throw new BackupError("backup.error_version");
    }

    // 7. Clear all existing data
    await clearAllData();

    // 8. Restore data in order
    const { userProfile, favorites, customPhrases } = backup.data;

    // Restore user profile
    if (userProfile) {
      // Remove id and timestamps as they will be auto-generated
      const { id, createdAt, updatedAt, ...profileData } = userProfile;
      await createUserProfile(profileData);
    }

    // Restore favorites
    for (const pictogramId of favorites) {
      await addFavorite(pictogramId);
    }

    // Restore custom phrases (French)
    for (const phrase of customPhrases.fr) {
      const { id, createdAt, updatedAt, ...phraseData } = phrase;
      await addCustomPhrase(phraseData);
    }

    // Restore custom phrases (English)
    for (const phrase of customPhrases.en) {
      const { id, createdAt, updatedAt, ...phraseData } = phrase;
      await addCustomPhrase(phraseData);
    }

    // 9. Clean up temporary file
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error("Failed to clean up temporary import file:", error);
    }
  } catch (error) {
    if (error instanceof BackupError) {
      throw error;
    }
    // Handle document picker cancellation
    if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
      return;
    }
    throw new BackupError("backup.error_corrupted");
  }
};
