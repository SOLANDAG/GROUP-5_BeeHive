import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function RatingsScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontFamily: "Kyiv_700", color: theme.colors.text }}>
        Ratings
      </Text>
      <Text style={{ marginTop: 10, fontFamily: "Kyiv_400", color: theme.colors.mutedText }}>
        Ratings + tips summary will go here.
      </Text>
    </View>
  );
}
