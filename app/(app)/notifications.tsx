import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  bookingId?: string;
  conversationId?: string;
};

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list: AppNotification[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "Notification",
          body: data.body || "",
          type: data.type || "",
          isRead: !!data.isRead,
          bookingId: data.bookingId || "",
          conversationId: data.conversationId || "",
        };
      });

      setItems(list);
    } catch (error) {
      console.log("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const openNotification = async (item: AppNotification) => {
    try {
      await updateDoc(doc(db, "notifications", item.id), {
        isRead: true,
      });

      if (item.conversationId) {
        router.push({
          pathname: "/(app)/messages",
          params: {
            conversationId: item.conversationId,
            bookingId: item.bookingId || "",
          },
        });
        return;
      }

      if (item.bookingId) {
        router.push("/(app)/book");
        return;
      }
    } catch (error) {
      console.log("Open notification error:", error);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 20,
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 24,
          color: theme.colors.text,
          marginBottom: 16,
        }}
      >
        Notifications
      </Text>

      {loading ? (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 18,
            padding: 18,
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_600",
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            No notifications yet
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => openNotification(item)}
            style={{
              backgroundColor: item.isRead ? theme.colors.card : theme.colors.primarySoft,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 18,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Kyiv_700",
                fontSize: 16,
                color: theme.colors.text,
              }}
            >
              {item.title}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_400",
                fontSize: 14,
                color: theme.colors.text,
                opacity: 0.85,
                marginTop: 6,
                lineHeight: 20,
              }}
            >
              {item.body}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_500",
                fontSize: 12,
                color: theme.colors.primary,
                marginTop: 10,
              }}
            >
              Tap to open
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}