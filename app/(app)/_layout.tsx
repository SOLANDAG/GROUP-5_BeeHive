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
      {/* HEADER */}
      <AppHeader />

      {/* CONTENT */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* FOOTER */}
      <AppFooter />

      {/* SIDEBAR ON TOP OF EVERYTHING */}
      <Sidebar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});
