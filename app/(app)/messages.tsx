import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

type ConversationItem = {
  id: string;
  businessName: string;
  lastMessage: string;
  bookingId?: string;
  providerId?: string;
  customerId?: string;
};

export default function Messages() {
  const { theme } = useTheme();
  const user = auth.currentUser;
  const params = useLocalSearchParams();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.uid),
        orderBy("lastMessageAt", "desc")
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          businessName: data.businessName || "Conversation",
          lastMessage: data.lastMessage || "",
          bookingId: data.bookingId || "",
          providerId: data.providerId || "",
          customerId: data.customerId || "",
        };
      });

      setConversations(list);
    } catch (error) {
      console.log("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (params?.conversationId) {
      router.push({
        pathname: "/(app)/chat",
        params: {
          conversationId: String(params.conversationId),
          bookingId: String(params.bookingId || ""),
        },
      });
    }
  }, [params?.conversationId]);

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
        Messages
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : conversations.length === 0 ? (
        <Text
          style={{
            fontFamily: "Kyiv_400",
            color: theme.colors.text,
            opacity: 0.7,
          }}
        >
          No conversations yet.
        </Text>
      ) : (
        conversations.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat",
                params: {
                  conversationId: item.id,
                  bookingId: item.bookingId || "",
                },
              })
            }
            style={{
              backgroundColor: theme.colors.card,
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
                fontSize: 18,
                color: theme.colors.primary,
                marginBottom: 6,
              }}
            >
              {item.businessName}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_400",
                color: theme.colors.text,
                opacity: 0.85,
              }}
              numberOfLines={2}
            >
              {item.lastMessage || "Open conversation"}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}