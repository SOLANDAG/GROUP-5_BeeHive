import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";
import Sidebar from "@/app/components/Sidebar";

import { PanGestureHandler } from "react-native-gesture-handler";
import { useSidebar } from "@/lib/ui/SidebarContext";

export default function AppLayout() {
  const { theme } = useTheme();
  const { openSidebar } = useSidebar();

  const handleSwipe = (event: any) => {
    const { translationX } = event.nativeEvent;

    // Swipe right enough distance
    if (translationX > 80) {
      openSidebar();
    }
  };

  return (
    <PanGestureHandler onEnded={handleSwipe}>
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
                gestureEnabled: false,
              }}
            />
          </View>

          <AppFooter />
        </View>

        {/* SIDEBAR MUST BE LAST */}
        <Sidebar />
      </View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});