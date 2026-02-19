import { Colors } from "@/constants/colors";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (name.trim()) {
      // Navigate directly to welcome
      router.push({
        // @ts-expect-error - Expo Router group routes typing issue
        pathname: "/(onboarding)/welcome",
        params: {
          name: name.trim(),
        },
      });
    }
  };

  const pexy = require("@/assets/images/no-bg-Pexy-mascot.webp");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {/* Title */}
          <Text style={styles.title}>{t("onboarding.profile_title")}</Text>

          {/* Message */}
          <Text style={styles.message}>{t("onboarding.profile_message")}</Text>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder={t("onboarding.profile_placeholder")}
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={30}
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />

          {/* Mascot */}
          <View style={styles.mascotContainer}>
            <Image source={pexy} width={10} height={10} />
          </View>

          {/* Next button */}
          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>{t("common.next")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 60,

    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  mascotContainer: {
    marginVertical: 32,
    alignItems: "center",
  },
  mascot: {
    fontSize: 120,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
});
