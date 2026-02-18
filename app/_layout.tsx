import { Stack } from "expo-router";
import AppProviders from "@/lib/providers/AppProviders";
import { useFonts } from "expo-font";
//import AppLoading from "expo-app-loading";

import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";

import {
  SourGummy_400Regular,
} from "@expo-google-fonts/sour-gummy";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Fraunces
    Fraunces_500: Fraunces_500Medium,
    Fraunces_600: Fraunces_600SemiBold,
    Fraunces_700: Fraunces_700Bold,

    // Kyiv Type Sans
    Kyiv_100: require("./assets/fonts/KyivTypeSans-Thin.otf"),
    Kyiv_300: require("./assets/fonts/KyivTypeSans-Light.otf"),
    Kyiv_400: require("./assets/fonts/KyivTypeSans-Regular.otf"),
    Kyiv_500: require("./assets/fonts/KyivTypeSans-Medium.otf"),
    Kyiv_700: require("./assets/fonts/KyivTypeSans-Bold.otf"),
    Kyiv_900: require("./assets/fonts/KyivTypeSans-Black.otf"),

    // Sour Gummy
    SourGummy_400: SourGummy_400Regular,
  });

  if (!fontsLoaded) {
  return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AppProviders>
  );
}
