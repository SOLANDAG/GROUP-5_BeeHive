import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
};

export default function ChatScreen() {
  const { theme } = useTheme();
  const { conversationId, bookingId } = useLocalSearchParams();

  const user = auth.currentUser;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);

  const safeConversationId = useMemo(
    () => String(conversationId || ""),
    [conversationId]
  );

  const safeBookingId = useMemo(
    () => String(bookingId || ""),
    [bookingId]
  );

  /* ================= LOAD CONVERSATION + MESSAGES ================= */

  useEffect(() => {
    if (!safeConversationId) {
      setLoading(false);
      return;
    }

    let unsubscribe: any;

    const initChat = async () => {
      try {
        const convRef = doc(db, "conversations", safeConversationId);
        const snap = await getDoc(convRef);

        if (snap.exists()) {
          const data = snap.data();
          setConversation({ id: snap.id, ...data });

          // security: ensure current user is a participant
          if (
            !data.participants ||
            !data.participants.includes(user?.uid)
          ) {
            console.log("User is not participant");
            setLoading(false);
            return;
          }
        } else {
          console.log("Conversation not found");
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "messages"),
          where("conversationId", "==", safeConversationId),
          orderBy("createdAt", "asc")
        );

        unsubscribe = onSnapshot(
          q,
          (snap) => {
            const list = snap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as any),
            }));

            setMessages(list);
            setLoading(false);
          },
          (error) => {
            console.log("Messages snapshot error:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.log("Chat init error:", error);
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [safeConversationId]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!user) return;
    if (!safeConversationId) return;
    if (!input.trim()) return;

    const cleanText = input.trim();

    try {

      /* ---------- ADD MESSAGE ---------- */

      await addDoc(collection(db, "messages"), {
        conversationId: safeConversationId,
        senderId: user.uid,
        text: cleanText,
        createdAt: serverTimestamp(),
      });

      /* ---------- UPDATE CONVERSATION ---------- */

      await updateDoc(doc(db, "conversations", safeConversationId), {
        lastMessage: cleanText,
        lastMessageAt: serverTimestamp(),
      });

      /* ---------- CREATE NOTIFICATION ---------- */

      if (conversation?.providerId && conversation?.customerId) {

        const notifyUserId =
          user.uid === conversation.customerId
            ? conversation.providerId
            : conversation.customerId;

        const notificationId =
          `${safeConversationId}_${Date.now()}`;

        await setDoc(
          doc(db, "notifications", notificationId),
          {
            userId: notifyUserId,
            title: "New Message",
            body: cleanText,
            type: "chat_message",
            bookingId: safeBookingId,
            conversationId: safeConversationId,
            isRead: false,
            createdAt: serverTimestamp(),
          }
        );
      }

      setInput("");

    } catch (error) {
      console.log("Send message error:", error);
    }
  };

  /* ================= UI ================= */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      {/* HEADER */}

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_700",
            fontSize: 22,
            color: theme.colors.text,
          }}
        >
          {conversation?.businessName || "Chat"}
        </Text>

        {!!safeBookingId && (
          <Text
            style={{
              marginTop: 4,
              fontFamily: "Kyiv_400",
              color: theme.colors.text,
              opacity: 0.7,
            }}
          >
            Booking ID: {safeBookingId}
          </Text>
        )}
      </View>

      {/* LOADING */}

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          {/* MESSAGES */}

          <ScrollView
            style={{ flex: 1, padding: 20 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <Text
                style={{
                  fontFamily: "Kyiv_400",
                  color: theme.colors.text,
                  opacity: 0.7,
                }}
              >
                No messages yet.
              </Text>
            ) : (
              messages.map((item) => {

                const isMine = item.senderId === user?.uid;

                return (
                  <View
                    key={item.id}
                    style={{
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      backgroundColor: isMine
                        ? theme.colors.primary
                        : theme.colors.card,
                      borderColor: isMine
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderWidth: isMine ? 0 : 1,
                      borderRadius: 16,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      marginBottom: 10,
                      maxWidth: "80%",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Kyiv_400",
                        color: isMine ? "#fff" : theme.colors.text,
                      }}
                    >
                      {item.text}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* INPUT */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.bg,
              gap: 10,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.placeholder}
              style={{
                flex: 1,
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontFamily: "Kyiv_400",
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />

            <Pressable
              onPress={sendMessage}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Kyiv_700",
                }}
              >
                Send
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}