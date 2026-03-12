import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AboutScreen() {
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
        About BeeHive
      </Text>

      <Text
        style={{
          marginTop: 16,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
          lineHeight: 22,
        }}
      >
        BeeHive is an AI-assisted mobile application designed to help users
        manage services, bookings, and everyday tasks in one convenient place.
        The platform connects customers with service providers and allows both
        sides to manage requests, schedules, and communication efficiently.
      </Text>

      <Text
        style={{
          marginTop: 16,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
          lineHeight: 22,
        }}
      >
        BeeHive aims to simplify service discovery and booking while providing
        an intelligent assistant that helps users organize their activities,
        track requests, and access support when needed.
      </Text>

      <Text
        style={{
          marginTop: 16,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
          lineHeight: 22,
        }}
      >
        The platform is built using modern technologies such as Expo,
        Firebase, and AI-assisted workflows to deliver a smooth and
        reliable experience for both customers and service providers.
      </Text>
    </ScrollView>
  );
}