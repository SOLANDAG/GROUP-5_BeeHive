import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useSidebar } from "@/lib/ui/SidebarContext";
import { useRoleContext } from "@/lib/auth/RoleProvider";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import { PanGestureHandler } from "react-native-gesture-handler";

import { doc, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8;

export default function Sidebar() {

  const [isAdmin, setIsAdmin] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  const { theme } = useTheme();
  const { isOpen, closeSidebar, openSidebar } = useSidebar();
  const { currentMode } = useRoleContext();

  const router = useRouter();
  const pathname = usePathname();

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  /* ================= USER ROLE LISTENER ================= */

  useEffect(() => {

    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {

      if (!snap.exists()) return;

      const data = snap.data();

      setIsAdmin(data.admin === true);
      setIsProvider(data.providerStatus === "approved");

    });

    return unsubscribe;

  }, []);

  /* ================= SIDEBAR ANIMATION ================= */

  useEffect(() => {

    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();

  }, [isOpen]);

  /* ================= SWIPE HANDLING ================= */

  const handleGesture = (event: any) => {

    let drag = event.nativeEvent.translationX;

    if (drag > 0) {
      translateX.setValue(Math.min(drag - SIDEBAR_WIDTH, 0));
    }

  };

  const handleGestureEnd = (event: any) => {

    const drag = event.nativeEvent.translationX;

    if (drag > SIDEBAR_WIDTH / 3) {
      openSidebar();
    } else {
      closeSidebar();
    }

  };

  /* ================= NAVIGATION ================= */

  const navigate = (route: string) => {

    router.push(route as any);
    closeSidebar();

  };

  /* ================= SIDEBAR ITEM ================= */

  const renderItem = (label: string, route: string, icon: string) => {

    const currentScreen = pathname.split("/").pop();
    const targetScreen = route.split("/").pop();

    const active = currentScreen === targetScreen;

    return (

      <Pressable
        onPress={() => navigate(route)}
        style={[
          styles.item,
          {
            backgroundColor: active
              ? theme.colors.primarySoft
              : "transparent",
          },
        ]}
      >
        <FontAwesome5
          name={icon as any}
          size={16}
          color={
            active
              ? theme.colors.primary
              : theme.colors.iconInactive
          }
          style={{ marginRight: 14 }}
        />

        <Text
          style={[
            styles.itemText,
            {
              color: active
                ? theme.colors.primary
                : theme.colors.text,
            },
          ]}
        >
          {label}
        </Text>

      </Pressable>

    );

  };

  return (
    <>
      {isOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={closeSidebar}
        />
      )}

      <PanGestureHandler
        onGestureEvent={handleGesture}
        onEnded={handleGestureEnd}
      >
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
              padding: 20,
              paddingTop: 60,
            }}
          >
            {/* CLOSE BUTTON */}

            <Pressable onPress={closeSidebar}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.colors.text}
              />
            </Pressable>

            <View style={{ height: 20 }} />

            {/* PROFILE */}

            <Pressable
              onPress={() => navigate("/(app)/profile")}
              style={styles.profileContainer}
            >
              <Image
                source={
                  auth.currentUser?.photoURL
                    ? { uri: auth.currentUser.photoURL }
                    : require("@/app/assets/images/profile.jpg")
                }
                style={styles.profileImage}
              />

              <View style={styles.profileTextWrapper}>
                <Text
                  style={[
                    styles.username,
                    { color: theme.colors.text },
                  ]}
                >
                  {isAdmin
                    ? "Admin"
                    : auth.currentUser?.displayName || "Guest"}
                </Text>

                <Text
                  style={[
                    styles.email,
                    { color: theme.colors.placeholder },
                  ]}
                >
                  {auth.currentUser?.email || "guest@email.com"}
                </Text>
              </View>
            </Pressable>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.border },
              ]}
            />

            {/* BASIC */}

            {renderItem("Profile", "/(app)/profile", "user")}
            {renderItem("Settings", "/(app)/settings", "cog")}

            {isAdmin ? (
              <>
              </>
            ) : (
              <>
                {/* CUSTOMER MODE */}

                {currentMode === "customer" && (
                  <>
                    {!isProvider && (
                      <>
                        {renderItem("Favorites", "/(app)/favorites", "heart")}

                        {renderItem(
                          "Payment Method",
                          "/(app)/payment",
                          "credit-card"
                        )}

                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: theme.colors.border },
                          ]}
                        />
                      </>
                    )}

                    {!isProvider &&
                      renderItem(
                        "Become a Provider",
                        "/(app)/apply-provider",
                        "briefcase"
                      )}

                    {isProvider &&
                      renderItem(
                        "Provider Status",
                        "/(app)/provider-status",
                        "briefcase"
                      )}
                  </>
                )}

                {/* PROVIDER PANEL */}

                {isProvider && (
                  <>
                    {renderItem("Ratings", "/(app)/ratings", "star")}
                    {renderItem("My Services", "/(app)/my-services", "briefcase")}
                    {renderItem("Availability", "/(app)/availability", "calendar")}
                    {renderItem("Earnings", "/(app)/earnings", "wallet")}
                  </>
                )}
              </>
            )}

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.border },
              ]}
            />

            {/* INFORMATION */}

            {renderItem("About BeeHive", "/(app)/about", "info-circle")}
            {renderItem("Help & Support", "/(app)/help", "question-circle")}
            {renderItem("Privacy Policy", "/(app)/privacy", "shield-alt")}
            {renderItem("Terms of Service", "/(app)/terms", "file-contract")}

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.border },
              ]}
            />

            {/* LOGOUT */}

            <Pressable
              onPress={async () => {
                await signOut(auth);
                router.replace("/");
              }}
              style={styles.item}
            >
              <FontAwesome5
                name="sign-out-alt"
                size={16}
                color="#E53935"
                style={{ marginRight: 14 }}
              />

              <Text
                style={[
                  styles.itemText,
                  { color: "#E53935" },
                ]}
              >
                Logout
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 1000,
    elevation: 30,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 999,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  profileTextWrapper: {
    marginLeft: 14,
  },

  username: {
    fontSize: 18,
    fontFamily: "Kyiv_400",
  },

  email: {
    fontSize: 13,
    fontFamily: "Kyiv_400",
    marginTop: 2,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  itemText: {
    fontFamily: "Kyiv_500",
  },

  divider: {
    height: 1,
    marginVertical: 14,
  },
});