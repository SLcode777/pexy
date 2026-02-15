import { UserProfile, CustomPhrase, CustomPictogram } from "@/lib/db/schema";

/**
 * Backup data structure
 * Contains all user data needed for export/import
 */
export interface BackupData {
  version: string; // Format version (ex: "1.0.0")
  appVersion: string; // App version
  timestamp: string; // ISO timestamp
  checksum: string; // SHA-256 of the data object
  data: {
    userProfile: UserProfile | null;
    favorites: string[];
    customPhrases: {
      fr: CustomPhrase[];
      en: CustomPhrase[];
    };
    customPictograms?: {
      items: CustomPictogram[];
      images: Record<string, string>; // imagePath -> base64
    };
  };
}

/**
 * Custom error class for backup operations
 */
export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupError";
  }
}
