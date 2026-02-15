import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { exportBackup, importBackup } from "@/lib/backup";
import { BackupError } from "@/types/backup";

/**
 * Hook to handle backup export and import operations
 */
export const useBackup = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  /**
   * Handle export backup operation
   */
  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportBackup();
      Alert.alert(
        t("backup.export_success_title"),
        t("backup.export_success_message")
      );
    } catch (error) {
      if (error instanceof BackupError) {
        Alert.alert(t("backup.error_title"), t(error.message));
      } else {
        Alert.alert(t("backup.error_title"), t("backup.error_corrupted"));
      }
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Handle import backup operation
   * Shows confirmation dialog before proceeding
   */
  const handleImport = async () => {
    // Show warning dialog first
    Alert.alert(
      t("backup.import_warning_title"),
      t("backup.import_warning_message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("backup.replace_data"),
          style: "destructive",
          onPress: async () => {
            setImportLoading(true);
            try {
              await importBackup();

              // Navigate to home to refresh all data
              router.replace("/(main)");

              // Show success message after navigation
              setTimeout(() => {
                Alert.alert(
                  t("backup.import_success_title"),
                  t("backup.import_success_message")
                );
              }, 500);
            } catch (error) {
              if (error instanceof BackupError) {
                Alert.alert(t("backup.error_title"), t(error.message));
              } else {
                Alert.alert(t("backup.error_title"), t("backup.error_corrupted"));
              }
            } finally {
              setImportLoading(false);
            }
          },
        },
      ]
    );
  };

  return {
    handleExport,
    handleImport,
    exportLoading,
    importLoading,
  };
};
