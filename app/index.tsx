import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { hasUserProfile } from '@/lib/db/operations';

export default function Index() {
  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const profileExists = await hasUserProfile();

      if (profileExists) {
        // User has a profile, go to main app
        // @ts-expect-error - Expo Router group routes typing issue
        router.replace('/(main)');
      } else {
        // No profile, go to onboarding
        // @ts-expect-error - Expo Router group routes typing issue
        router.replace('/(onboarding)/profile');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // On error, default to onboarding
      // @ts-expect-error - Expo Router group routes typing issue
      router.replace('/(onboarding)/profile');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
