import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function HelpScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontFamily: "Kyiv_700",
          color: theme.colors.text,
        }}
      >
        Help & Support
      </Text>

      <Text
        style={{
          marginTop: 16,
          fontFamily: "Kyiv_600",
          color: theme.colors.text,
        }}
      >
        Frequently Asked Questions
      </Text>

      <Text style={{ marginTop: 10, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        • How do I book a service?
      </Text>
      <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, opacity: 0.7 }}>
        Browse available services and submit a booking request from the booking screen.
      </Text>

      <Text style={{ marginTop: 10, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        • How do I become a provider?
      </Text>
      <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, opacity: 0.7 }}>
        Submit an application through the “Apply as Provider” page. Admins will review your request.
      </Text>

      <Text style={{ marginTop: 10, fontFamily: "Kyiv_400", color: theme.colors.text }}>
        • How can I edit my profile?
      </Text>
      <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, opacity: 0.7 }}>
        Go to the Profile page and update your personal information.
      </Text>

      <Text
        style={{
          marginTop: 20,
          fontFamily: "Kyiv_600",
          color: theme.colors.text,
        }}
      >
        Contact Support
      </Text>

      <Text
        style={{
          marginTop: 10,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
        }}
      >
        If you experience issues with the application, please contact our
        support team through the official BeeHive channels.
      </Text>
    </ScrollView>
  );
}