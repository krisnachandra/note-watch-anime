import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    const signIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Sign in anonymously if RLS is enabled and requires an authenticated user
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Error signing in anonymously:", error);
        }
      }
    };
    signIn();
  }, []);

  return (
    <ThemeProvider>
      {/* Semua screen otomatis tidak akan menampilkan header bawaan */}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
