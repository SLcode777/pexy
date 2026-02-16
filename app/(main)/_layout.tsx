import { Colors } from "@/constants/colors";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Text as RNText } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === "android" ? insets.bottom + 8 : 8,
          paddingTop: 4,
          height: Platform.OS === "android" ? 60 + insets.bottom : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("common.pictos"),
          tabBarIcon: ({ color }) => (
            <RNText style={{ fontSize: 22, paddingBottom: 2 }}>🏠</RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("common.favorites"),
          tabBarIcon: ({ color }) => (
            <RNText style={{ fontSize: 22 }}>⭐</RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("common.settings"),
          tabBarIcon: ({ color }) => (
            <RNText style={{ fontSize: 22 }}>⚙️</RNText>
          ),
        }}
      />
    </Tabs>
  );
}
