import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRole } from "@/lib/auth/useRole";
import { useEffect } from "react";
import { router } from "expo-router";

export default function MyServicesScreen() {
  const { theme } = useTheme();
  const { roles } = useRole();

  useEffect(() => {
    if (!roles.provider) {
      router.replace("/(app)/home");
    }
  }, [roles]);

  if (!roles.provider) return null;

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.bg,
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: "900",
        color: theme.colors.text
      }}>
        My Services
      </Text>
    </View>
  );
}
