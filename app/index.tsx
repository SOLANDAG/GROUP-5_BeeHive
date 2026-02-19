import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function LandingScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      {/* Logo */}
      <Image
        source={require("@/app/assets/images/LOGO.png")}
        style={{
          width: 60,
          height: 60,
          marginBottom: 16,
        }}
        resizeMode="contain"
      />

      {/* App Name */}
      <Text
        style={{
          fontFamily: "Fraunces_700",
          fontSize: 32,
          color: theme.colors.text,
        }}
      >
        BeeHive
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontFamily: "Kyiv_400",
          fontSize: 14,
          marginTop: 8,
          textAlign: "center",
          color: theme.colors.text,
          opacity: 0.7,
        }}
      >
        Your AI-assisted workspace for tasks, notes, and help.
      </Text>

      {/* Button */}
      <Pressable
        onPress={() => router.push("/(auth)/login")}
        style={{
          marginTop: 40,
          backgroundColor: theme.colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 40,
          borderRadius: 20,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_300",
            color: "#fff",
            fontSize: 16,
          }}
        >
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
