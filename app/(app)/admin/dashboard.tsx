import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AdminDashboard() {
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
          fontFamily: "Kyiv_700",
          fontSize: 26,
          color: theme.colors.text,
          marginBottom: 20,
        }}
      >
        Admin Dashboard
      </Text>

      {/* USERS */}

      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: 20,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.text }}>
          Total Customers
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontFamily: "Kyiv_700",
            color: theme.colors.primary,
          }}
        >
          0
        </Text>
      </View>

      {/* PROVIDERS */}

      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: 20,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.text }}>
          Total Providers
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontFamily: "Kyiv_700",
            color: theme.colors.primary,
          }}
        >
          0
        </Text>
      </View>

      {/* APPLICATIONS */}

      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: 20,
          borderRadius: 16,
        }}
      >
        <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.text }}>
          Pending Applications
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontFamily: "Kyiv_700",
            color: theme.colors.primary,
          }}
        >
          0
        </Text>
      </View>
    </ScrollView>
  );
}