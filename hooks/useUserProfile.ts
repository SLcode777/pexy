import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/db/operations';
import type { UserProfile } from '@/lib/db/schema';

/**
 * Hook to get user profile and preferences
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getUserProfile();
    setProfile(data);
    setLoading(false);
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return {
    profile,
    loading,
    refreshProfile,
  };
};
