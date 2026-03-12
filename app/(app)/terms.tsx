import { ScrollView, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function TermsScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 28, fontFamily: "Kyiv_700", color: theme.colors.text }}>
        Terms of Service
      </Text>

      <Text style={{ marginTop: 16, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        By using BeeHive, you agree to follow the rules and guidelines
        outlined in this application.
      </Text>

      <Text style={{ marginTop: 16, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        Users are responsible for maintaining the accuracy of their
        information and ensuring respectful communication with other users.
      </Text>

      <Text style={{ marginTop: 16, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        BeeHive reserves the right to suspend or terminate accounts that
        violate the platform’s policies or misuse the services.
      </Text>
    </ScrollView>
  );
}