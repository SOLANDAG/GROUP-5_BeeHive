import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { FontAwesome5 } from "@expo/vector-icons";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

type FooterItem = {
  label: string;
  route: string;
  icon: string;
};

export default function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const checkAdmin = async () => {

      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setIsAdmin(snap.data().admin === true);
      }

    };

    checkAdmin();

  }, []);

  // Customer + Worker footer order (per your blueprint):
  // Home, Book, Bee, Message, Schedule :contentReference[oaicite:3]{index=3}
  const items: FooterItem[] = isAdmin
    ? [
        { label: "Home", route: "/(app)/home", icon: "home" },
        { label: "Requests", route: "/(app)/admin/applications", icon: "clipboard-list" },
        { label: "Bee", route: "/(app)/assistant", icon: "robot" },
        { label: "Dashboard", route: "/(app)/admin/dashboard", icon: "chart-line" },
        { label: "Reports", route: "/(app)/reports", icon: "file-alt" },
      ]
    : [
        { label: "Home", route: "/(app)/home", icon: "home" },
        { label: "Book", route: "/(app)/book", icon: "book-open" },
        { label: "Bee", route: "/(app)/assistant", icon: "robot" },
        { label: "Message", route: "/(app)/messages", icon: "comments" },
        { label: "Schedule", route: "/(app)/schedule", icon: "calendar-alt" },
      ];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      {items.map((item) => {
        const active = pathname.includes(item.route.split("/").pop()!);

        return (
          <Pressable
            key={item.route}
            onPress={() => router.push(item.route as any)}
            style={styles.item}
          >
            <FontAwesome5
              name={item.icon as any}
              size={18}
              solid={active}
              color={active ? theme.colors.primary : theme.colors.tabInactive}
            />
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.colors.primary : theme.colors.tabInactive,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  item: {
    alignItems: "center",
    width: 64,
  },
  label: {
    marginTop: 5,
    fontSize: 11,
    fontFamily: "Kyiv_500",
  },
});
