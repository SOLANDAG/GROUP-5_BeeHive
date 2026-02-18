import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useSidebar } from "@/lib/ui/SidebarContext";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

export default function AppHeader() {
  const { theme } = useTheme();
  const { openSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const isNotifications = pathname === "/(app)/notifications";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.headerBg,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* LEFT: Menu */}
      <Pressable onPress={openSidebar}>
        <FontAwesome5
          name="bars"
          size={18}
          color={theme.colors.text}
        />
      </Pressable>

      {/* CENTER: Logo + BeeHive */}
      <View style={styles.center}>
        <Image
          source={require("@/app/assets/images/LOGO.png")}
          style={styles.logo}
        />
        <Text
          style={[
            styles.appName,
            { color: theme.colors.headerText },
          ]}
        >
          BeeHive
        </Text>
      </View>

      {/* RIGHT: Notifications */}
      <Pressable
        onPress={() => router.push("/(app)/notifications")}
      >
        <FontAwesome5
          name="bell"
          size={18}
          solid={isNotifications}
          color={
            isNotifications
              ? theme.colors.primary
              : theme.colors.text
          }
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 38,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
  },

  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  appName: {
    fontFamily: "Fraunces_700",
    fontSize: 20,
  },
});
