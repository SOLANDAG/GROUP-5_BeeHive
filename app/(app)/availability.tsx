import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AvailabilityScreen() {
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
      <Text style={{ fontSize: 24, fontWeight: "900", color: theme.colors.text }}>
        Availability
      </Text>
    </View>
  );
}
