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
import { router } from "expo-router";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

export default function Messages() {

  const { theme } = useTheme();
  const user = auth.currentUser;

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {

    if (!user) return;

    try {

      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.uid)
      );

      const snap = await getDocs(q);

      const rawList = await Promise.all(
        snap.docs.map(async (docSnap) => {

          const data = docSnap.data();

          let businessName = "Service";

          if (data.serviceId) {
            const serviceDoc = await getDoc(doc(db, "services", data.serviceId));

            if (serviceDoc.exists()) {
              businessName = serviceDoc.data().businessName;
            }
          }

          return {
            id: docSnap.id,
            bookingId: data.bookingId,
            businessName,
            createdAt: data.createdAt?.seconds || 0
          };
        })
      );

      /* REMOVE DUPLICATES */

      const unique = Array.from(
        new Map(rawList.map(item => [item.id, item])).values()
      );

      /* SORT NEWEST FIRST */

      unique.sort((a, b) => b.createdAt - a.createdAt);

      setConversations(unique);

    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 20,
      }}
    >

      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 24,
          color: theme.colors.text,
          marginBottom: 20,
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

        <ScrollView showsVerticalScrollIndicator={false}>

          {conversations.map((chat) => (

            <Pressable
              key={chat.id}
              onPress={() =>
                router.push({
                  pathname: "/(app)/chat",
                  params: {
                    conversationId: chat.id,
                    bookingId: chat.bookingId,
                  },
                })
              }
              style={{
                backgroundColor: theme.colors.card,
                padding: 16,
                borderRadius: 18,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >

              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  fontSize: 16,
                  color: theme.colors.primary,
                }}
              >
                {chat.businessName}
              </Text>

              <Text
                style={{
                  fontFamily: "Kyiv_400",
                  fontSize: 14,
                  marginTop: 4,
                  color: theme.colors.text,
                  opacity: 0.7,
                }}
              >
                Tap to open chat
              </Text>

            </Pressable>

          ))}

        </ScrollView>

      )}

    </View>
  );
}