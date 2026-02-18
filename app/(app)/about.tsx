import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AboutScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>About BeeHive</Text>
      <Text style={{ marginTop: 10, color: theme.colors.mutedText }}>
        App info and mission will go here.
      </Text>
    </View>
  );
}
