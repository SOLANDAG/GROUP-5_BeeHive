import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function HelpScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>Help & Support</Text>
      <Text style={{ marginTop: 10, color: theme.colors.mutedText }}>
        FAQs, contact, and user guide will go here.
      </Text>
    </View>
  );
}
