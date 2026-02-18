import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRoleContext } from "@/lib/auth/RoleProvider";
import { useSidebar } from "@/lib/ui/SidebarContext";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.78;

type MenuItem = {
  label: string;
  route: string;
  icon: string;
};

export default function Sidebar() {
  const { theme } = useTheme();
  const { roles, currentMode, setCurrentMode } = useRoleContext();
  const { isOpen, closeSidebar } = useSidebar();

  const router = useRouter();
  const pathname = usePathname();

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const navigate = (route: string) => {
    router.push(route as any);
    closeSidebar();
  };

  const handleLogout = async () => {
    await signOut(auth);
    closeSidebar();
    router.replace("/");
  };

  const renderItem = (item: MenuItem) => {
    const active = pathname === item.route;

    return (
      <Pressable
        key={item.route}
        onPress={() => navigate(item.route)}
        style={[
          styles.item,
          {
            backgroundColor: active ? theme.colors.primarySoft : "transparent",
          },
        ]}
      >
        <FontAwesome5
          name={item.icon as any}
          size={16}
          solid={active}
          color={active ? theme.colors.primary : theme.colors.iconInactive}
          style={{ width: 22, marginRight: 12 }}
        />

        <Text
          style={{
            fontFamily: "Kyiv_500",
            color: theme.colors.text,
            fontSize: 14,
          }}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  // Sidebar menu matches your blueprint (and your actual existing routes)
  // NOTE: Home is NOT here (Home is footer).
  const customerMenu: MenuItem[] = [
    { label: "Profile", route: "/(app)/profile", icon: "user" },
    { label: "Settings", route: "/(app)/settings", icon: "cog" },
    { label: "History", route: "/(app)/history", icon: "history" },
    { label: "Favorites", route: "/(app)/favorites", icon: "heart" },

    // Missing in your file list, so we add a placeholder screen: /(app)/payment
    { label: "Payment Method", route: "/(app)/payment", icon: "credit-card" },

    { label: "About BeeHive", route: "/(app)/about", icon: "info-circle" },
    { label: "Help & Support", route: "/(app)/help", icon: "question-circle" },
    { label: "Privacy Policy", route: "/(app)/privacy", icon: "shield-alt" },
    { label: "Terms of Service", route: "/(app)/terms", icon: "file-contract" },
  ];

  const workerMenu: MenuItem[] = [
    { label: "Profile", route: "/(app)/profile", icon: "user" },
    { label: "Settings", route: "/(app)/settings", icon: "cog" },
    { label: "History", route: "/(app)/history", icon: "history" },

    // Missing in your file list, so we add a placeholder screen: /(app)/ratings
    { label: "Ratings", route: "/(app)/ratings", icon: "star" },

    { label: "My Services", route: "/(app)/my-services", icon: "briefcase" },
    { label: "Availability", route: "/(app)/availability", icon: "calendar" },

    // Earnings exists in your file list
    { label: "Earnings", route: "/(app)/earnings", icon: "wallet" },

    { label: "About BeeHive", route: "/(app)/about", icon: "info-circle" },
    { label: "Help & Support", route: "/(app)/help", icon: "question-circle" },
    { label: "Privacy Policy", route: "/(app)/privacy", icon: "shield-alt" },
    { label: "Terms of Service", route: "/(app)/terms", icon: "file-contract" },
  ];

  return (
    <>
      {isOpen && <Pressable onPress={closeSidebar} style={styles.backdrop} />}

      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            transform: [{ translateX }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 76,
            paddingHorizontal: 18,
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_700",
              fontSize: 14,
              color: theme.colors.mutedText,
              marginBottom: 10,
              letterSpacing: 0.4,
            }}
          >
            MENU
          </Text>

          {currentMode === "customer" && customerMenu.map(renderItem)}
          {currentMode === "provider" && workerMenu.map(renderItem)}

          {/* Switch mode (only if user can be provider too) */}
          {roles.provider && (
            <Pressable
              onPress={() =>
                setCurrentMode(currentMode === "customer" ? "provider" : "customer")
              }
              style={[
                styles.switchBtn,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <FontAwesome5
                name="exchange-alt"
                size={14}
                color={theme.colors.primary}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  fontFamily: "Kyiv_600",
                  color: theme.colors.text,
                  fontSize: 13,
                }}
              >
                Switch to {currentMode === "customer" ? "Provider" : "Customer"} Mode
              </Text>
            </Pressable>
          )}

          {/* Logout */}
          <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
            <View style={styles.logoutRow}>
              <FontAwesome5
                name="sign-out-alt"
                size={16}
                color="#E53935"
                style={{ width: 22, marginRight: 12 }}
              />
              <Text style={{ fontFamily: "Kyiv_600", color: "#E53935" }}>
                Logout
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 1000,
    elevation: 30,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 6, height: 0 },
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 999,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  switchBtn: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});
