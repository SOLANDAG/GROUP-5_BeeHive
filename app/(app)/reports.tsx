import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function ReportsScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontFamily: "Kyiv_700",
          color: theme.colors.text,
          marginBottom: 10,
        }}
      >
        Reports
      </Text>

      <Text
        style={{
          fontFamily: "Kyiv_400",
          color: theme.colors.mutedText,
          textAlign: "center",
        }}
      >
        Admin reports and analytics will appear here.
      </Text>
    </View>
  );
}