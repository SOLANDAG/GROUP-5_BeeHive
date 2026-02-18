import { View, Text, FlatList, Pressable } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

const mockNotifications = [
  {
    id: "1",
    title: "Booking Confirmed",
    description: "Your cleaning service is confirmed.",
  },
  {
    id: "2",
    title: "New Message",
    description: "You received a message from a provider.",
  },
  {
    id: "3",
    title: "Payment Successful",
    description: "Your payment has been processed.",
  },
];

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* Page Header */}
      <View
        style={{
          height: 90,
          paddingTop: 40,
          paddingHorizontal: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <FontAwesome5
            name="arrow-left"
            size={18}
            color={theme.colors.text}
          />
        </Pressable>

        <Text
          style={{
            fontFamily: "Kyiv_600",
            fontSize: 18,
            color: theme.colors.text,
          }}
        >
          Notifications
        </Text>

        <View style={{ width: 18 }} />
      </View>

      {/* Notification List */}
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Kyiv_600",
                fontSize: 15,
                color: theme.colors.text,
              }}
            >
              {item.title}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_400",
                fontSize: 13,
                marginTop: 4,
                opacity: 0.6,
              }}
            >
              {item.description}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
