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
} from "firebase/firestore";

type ChatMessage = {
  id: string;
  senderId: string;
  type: "text" | "booking";
  text?: string;

  bookingDate?: string;
  bookingTime?: string;
  bookingStatus?: "pending" | "accepted" | "declined";
};

export default function ChatScreen() {

  const { theme } = useTheme();
  const { conversationId } = useLocalSearchParams();

  const user = auth.currentUser;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);

  const safeConversationId = useMemo(
    () => String(conversationId || ""),
    [conversationId]
  );

  const isCustomer = user?.uid === conversation?.customerId;
  const isProvider = user?.uid === conversation?.providerId;

  /* ================= LOAD CHAT ================= */

  useEffect(() => {

    if (!safeConversationId) {
      setLoading(false);
      return;
    }

    let unsubscribe: any;

    const initChat = async () => {

      const convRef = doc(db, "conversations", safeConversationId);
      const snap = await getDoc(convRef);

      if (!snap.exists()) {
        setLoading(false);
        return;
      }

      const data = snap.data();

      setConversation({ id: snap.id, ...data });

      if (!data.participants.includes(user?.uid)) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", safeConversationId),
        orderBy("createdAt", "asc")
      );

      unsubscribe = onSnapshot(q, (snap) => {

        const list = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));

        setMessages(list);
        setLoading(false);

      });

    };

    initChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };

  }, [safeConversationId]);

  /* ================= SEND TEXT MESSAGE ================= */

  const sendMessage = async () => {

    if (!user) return;
    if (!safeConversationId) return;
    if (!input.trim()) return;

    const cleanText = input.trim();

    await addDoc(collection(db, "messages"), {
      conversationId: safeConversationId,
      senderId: user.uid,
      type: "text",
      text: cleanText,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "conversations", safeConversationId), {
      lastMessage: cleanText,
      lastMessageAt: serverTimestamp(),
    });

    setInput("");

  };

  /* ================= SEND BOOKING REQUEST ================= */

  const sendBooking = async () => {

    if (!isCustomer) return;

    await addDoc(collection(db, "messages"), {
      conversationId: safeConversationId,
      senderId: user?.uid,
      type: "booking",
      bookingDate: "2026-03-20",
      bookingTime: "14:00",
      bookingStatus: "pending",
      createdAt: serverTimestamp(),
    });

  };

  /* ================= ACCEPT BOOKING ================= */

  const acceptBooking = async (message: ChatMessage) => {

    try {

      await updateDoc(doc(db, "messages", message.id), {
        bookingStatus: "accepted",
      });

      await addDoc(collection(db, "bookings"), {
        conversationId: safeConversationId,
        providerId: conversation.providerId,
        customerId: conversation.customerId,
        serviceId: conversation.serviceId,
        businessName: conversation.businessName,
        price: conversation.price,
        date: message.bookingDate,
        time: message.bookingTime,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "conversations", safeConversationId), {
        lastMessage: "Booking accepted",
        lastMessageAt: serverTimestamp(),
      });

    } catch (err) {
      console.log("Accept booking error:", err);
    }

  };

  /* ================= DECLINE BOOKING ================= */

  const declineBooking = async (message: ChatMessage) => {

    try {

      await updateDoc(doc(db, "messages", message.id), {
        bookingStatus: "declined",
      });

      await updateDoc(doc(db, "conversations", safeConversationId), {
        lastMessage: "Booking declined",
        lastMessageAt: serverTimestamp(),
      });

    } catch (err) {
      console.log("Decline booking error:", err);
    }

  };

  /* ================= UI ================= */

  return (

    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >

      {/* HEADER */}

      <View style={{
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
      }}>

        <Text style={{
          fontFamily: "Kyiv_700",
          fontSize: 22,
          color: theme.colors.text
        }}>
          {conversation?.businessName || "Chat"}
        </Text>

      </View>

      {loading ? (

        <ActivityIndicator size="large" color={theme.colors.primary} />

      ) : (

        <>
          {/* BOOKING BUTTON */}

          {isCustomer && (

            <Pressable
              onPress={sendBooking}
              style={{
                margin: 16,
                backgroundColor: theme.colors.primary,
                padding: 14,
                borderRadius: 14,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#fff", fontFamily: "Kyiv_700" }}>
                Request Booking
              </Text>
            </Pressable>

          )}

          {/* MESSAGES */}

          <ScrollView style={{ flex: 1, padding: 20 }}>

            {messages.map((item) => {

              const isMine = item.senderId === user?.uid;

              return (

                <View
                  key={item.id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    backgroundColor: isMine
                      ? theme.colors.primary
                      : theme.colors.card,
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 10,
                    maxWidth: "80%"
                  }}
                >

                  {item.type === "text" && (

                    <Text style={{
                      color: isMine ? "#fff" : theme.colors.text,
                      fontFamily: "Kyiv_400"
                    }}>
                      {item.text}
                    </Text>

                  )}

                  {item.type === "booking" && (

                    <View style={{
                        backgroundColor: isMine ? theme.colors.primary : theme.colors.card,
                        padding: 6,
                        borderRadius: 10
                      }}>

                    <Text style={{
                      fontFamily: "Kyiv_700",
                      color: theme.colors.text
                    }}>
                      Booking Request
                    </Text>

                    <Text style={{
                      fontFamily: "Kyiv_400",
                      color: theme.colors.text
                    }}>
                      {item.bookingDate} • {item.bookingTime}
                    </Text>

                      {isProvider && item.bookingStatus === "pending" && (

                        <View style={{
                          flexDirection: "row",
                          marginTop: 12
                        }}>

                        <Pressable
                          onPress={() => acceptBooking(item)}
                          style={{
                            backgroundColor: "#2E7D32",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 12,
                            marginRight: 10
                          }}
                        >
                          <Text style={{
                            color: "#fff",
                            fontFamily: "Kyiv_700"
                          }}>
                            Accept
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => declineBooking(item)}
                          style={{
                            backgroundColor: "#C62828",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 12
                          }}
                        >
                          <Text style={{
                            color: "#fff",
                            fontFamily: "Kyiv_700"
                          }}>
                            Decline
                          </Text>
                        </Pressable>

                        </View>

                      )}

                      {item.bookingStatus === "accepted" && (
                        <Text style={{
                          color: "#2E7D32",
                          fontFamily: "Kyiv_700",
                          marginTop: 6
                        }}>
                          Booking Accepted
                        </Text>
                      )}

                      {item.bookingStatus === "declined" && (
                        <Text style={{
                          color: "#C62828",
                          fontFamily: "Kyiv_700",
                          marginTop: 6
                        }}>
                          Booking Declined
                        </Text>
                      )}

                    </View>

                  )}

                </View>

              );

            })}

          </ScrollView>

          {/* INPUT */}

          <View style={{
            flexDirection: "row",
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border
          }}>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.placeholder}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 12,
                padding: 10,
                fontFamily: "Kyiv_400",
                color: theme.colors.text
              }}
            />

            <Pressable
              onPress={sendMessage}
              style={{
                marginLeft: 10,
                backgroundColor: theme.colors.primary,
                padding: 12,
                borderRadius: 10
              }}
            >
              <Text style={{
                color: "#fff",
                fontFamily: "Kyiv_700"
              }}>
                Send
              </Text>
            </Pressable>

          </View>

        </>
      )}

    </KeyboardAvoidingView>

  );

}