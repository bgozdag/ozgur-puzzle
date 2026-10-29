import { Baloo2_600SemiBold, Baloo2_800ExtraBold, useFonts } from '@expo-google-fonts/baloo-2';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initSounds } from '../sound';
import { ProfileProvider } from '../state/profiles';
import { COLORS } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Baloo2_600SemiBold, Baloo2_800ExtraBold });

  useEffect(() => {
    initSounds();
  }, []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg }, animation: 'slide_from_right' }}>
          {/* Parça sürüklerken yanlışlıkla geri kaydırma olmasın */}
          <Stack.Screen name="play/[id]" options={{ gestureEnabled: false }} />
        </Stack>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
