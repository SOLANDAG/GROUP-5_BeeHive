import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function EarningsScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_600",
          fontSize: 22,
          color: theme.colors.text,
        }}
      >
        Earnings
      </Text>
    </View>
  );
}
