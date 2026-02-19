import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";
import Sidebar from "@/app/components/Sidebar";

export default function AppLayout() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.bg },
      ]}
    >
      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        <AppHeader />

        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
            }}
          />
        </View>

        <AppFooter />
      </View>

      {/* SIDEBAR MUST BE LAST */}
      <Sidebar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
