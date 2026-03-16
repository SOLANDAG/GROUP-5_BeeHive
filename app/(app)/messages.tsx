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
  doc,
  getDoc,
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
  const [isAdmin, setIsAdmin] = useState(false);

  /* ================= ADMIN CHECK ================= */

  useEffect(() => {

    const checkAdmin = async () => {

      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) return;

      const data = snap.data();

      if (data.admin === true) {
        setIsAdmin(true);
      }

    };

    checkAdmin();

  }, []);

  /* ================= FETCH CONVERSATIONS ================= */

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

    const list = await Promise.all(
      snap.docs.map(async (docSnap) => {

        const data = docSnap.data();

        let title = data.businessName || "Conversation";

        // If provider is viewing, show customer name instead
        if (data.providerId === user.uid) {

          try {

            const customerRef = doc(db, "users", data.customerId);
            const customerSnap = await getDoc(customerRef);

            if (customerSnap.exists()) {
              title =
                customerSnap.data().displayName ||
                customerSnap.data().email ||
                "Customer";
            }

          } catch (e) {
            console.log("Customer fetch error", e);
          }

        }

        return {
          id: docSnap.id,
          businessName: title,
          lastMessage: data.lastMessage || "",
          bookingId: data.bookingId || "",
          providerId: data.providerId || "",
          customerId: data.customerId || "",
        };

      })
    );

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

  /* ================= AUTO OPEN CHAT ================= */

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

  /* ================= BLOCK ADMIN ================= */

  if (isAdmin) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_600",
            color: theme.colors.text,
          }}
        >
          Messaging is not available for admins.
        </Text>
      </View>
    );
  }

  /* ================= UI ================= */

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