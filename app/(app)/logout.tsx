import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function LogoutScreen() {
  const { theme } = useTheme();

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut(auth);
        router.replace("/(auth)/login" as any);
      } catch (error) {
        console.log("Logout error:", error);
      }
    };

    logout();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator />
      <Text
        style={{
          marginTop: 10,
          fontWeight: "700",
          color: theme.colors.text,
        }}
      >
        Logging out...
      </Text>
    </View>
  );
}
