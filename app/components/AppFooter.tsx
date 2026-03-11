import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { FontAwesome5 } from "@expo/vector-icons";

type FooterItem = {
  label: string;
  route: string;
  icon: string;
};

export default function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  // Customer + Worker footer order (per your blueprint):
  // Home, Book, Bee, Message, Schedule :contentReference[oaicite:3]{index=3}
  const items: FooterItem[] = [
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
