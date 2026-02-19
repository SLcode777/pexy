import { Colors } from "@/constants/colors";
import { createUserProfile } from "@/lib/db/operations";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const { name } = useLocalSearchParams<{
    name: string;
  }>();
  const [isCreating, setIsCreating] = useState(false);
  const insets = useSafeAreaInsets();

  const handleStart = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Create user profile in database
      await createUserProfile({
        name,
        language: i18n.language,
        ttsSpeed: 1.0,
      });

      console.log("✅ User profile created:", { name });

      // Navigate to main app
      router.replace("/(main)");
    } catch (error) {
      console.error("❌ Error creating user profile:", error);
      setIsCreating(false);
    }
  };

  const pexy = require("@/assets/images/no-bg-Pexy-mascot.webp");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View
          style={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>{t("onboarding.welcome_title")}</Text>

          {/* Message */}
          <Text style={styles.message}>{t("onboarding.welcome_message1")}</Text>
          <Text style={styles.message}>{t("onboarding.welcome_message2")}</Text>

          {/* Mascot with sparkles */}
          <View style={styles.mascotContainer}>
            <Image source={pexy} width={10} height={10} />
          </View>

          {/* Start button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleStart}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.buttonText}>
                {t("onboarding.welcome_button")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    marginTop: 60,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  mascotContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginVertical: 32,
  },
  mascot: {
    fontSize: 140,
  },
  sparkle: {
    fontSize: 40,
  },
  mascotSparkleDots: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 48,
  },
  sparkleDot: {
    fontSize: 24,
  },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    minWidth: 200,
    alignItems: "center",
    marginTop: "auto",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
});
