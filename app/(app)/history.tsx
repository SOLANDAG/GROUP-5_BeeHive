import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function HistoryDrawerScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>History</Text>
      <Text style={{ marginTop: 10, color: theme.colors.mutedText }}>
        Past services and interactions will appear here.
      </Text>
    </View>
  );
}
