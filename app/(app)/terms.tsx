import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function TermsScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>Terms of Service</Text>
      <Text style={{ marginTop: 10, color: theme.colors.mutedText }}>
        Terms of service content will go here.
      </Text>
    </View>
  );
}
