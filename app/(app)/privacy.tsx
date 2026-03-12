import { ScrollView, Text } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function PrivacyScreen() {
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
        Privacy Policy
      </Text>

      <Text style={{ marginTop: 16, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        BeeHive respects your privacy and is committed to protecting your
        personal information.
      </Text>

      <Text style={{ marginTop: 16, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        The application may collect basic user information such as name,
        email address, and profile details to provide essential services
        such as account management, bookings, and communication between
        customers and providers.
      </Text>

      <Text style={{ marginTop: 16, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        BeeHive does not sell personal data to third parties. Information
        collected is only used to improve functionality and maintain
        service quality.
      </Text>
    </ScrollView>
  );
}