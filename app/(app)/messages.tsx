import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  system?: boolean;
};

type BookingData = {
  id: string;
  providerId: string;
  customerId: string;
  businessName: string;
  requestedDay?: string;
  requestedTime?: string;
  status: string;
};

type ConversationData = {
  id: string;
  serviceName?: string;
};

export default function MessagesScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const conversationId = String(params.conversationId || "");
  const bookingId = String(params.bookingId || "");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [conversation, setConversation] = useState<ConversationData | null>(null);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const user = auth.currentUser;
  const isProvider = booking?.providerId === user?.uid;

  const loadData = async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const convoSnap = await getDoc(doc(db, "conversations", conversationId));
      if (convoSnap.exists()) {
        setConversation({
          id: convoSnap.id,
          serviceName: convoSnap.data().serviceName || "Chat",
        });
      }

      let foundBookingId = bookingId;

      if (!foundBookingId && convoSnap.exists()) {
        foundBookingId = convoSnap.data().bookingId || "";
      }

      if (foundBookingId) {
        const bookingSnap = await getDoc(doc(db, "bookings", foundBookingId));
        if (bookingSnap.exists()) {
          const data = bookingSnap.data();
          setBooking({
            id: bookingSnap.id,
            providerId: data.providerId,
            customerId: data.customerId,
            businessName: data.businessName || "Service",
            requestedDay: data.requestedDay || "",
            requestedTime: data.requestedTime || "",
            status: data.status || "pending",
          });
          setSelectedDay(data.requestedDay || "");
          setSelectedTime(data.requestedTime || "");
        }
      }

      const messageQ = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
      );

      const messageSnap = await getDocs(messageQ);

      const list: ChatMessage[] = messageSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId || "",
          text: data.text || "",
          system: !!data.system,
        };
      });

      setMessages(list);
    } catch (error) {
      console.log("Load messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!messageText.trim() || !conversationId || !user) return;

    try {
      setSending(true);

      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: user.uid,
        text: messageText.trim(),
        system: false,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: messageText.trim(),
        lastMessageAt: serverTimestamp(),
      });

      if (booking) {
        const receiverId = isProvider ? booking.customerId : booking.providerId;

        await addDoc(collection(db, "notifications"), {
          userId: receiverId,
          title: "New Message",
          body: `You have a new message about ${booking.businessName}.`,
          type: "chat_message",
          bookingId: booking.id,
          conversationId,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }

      setMessageText("");
      loadData();
    } catch (error) {
      console.log("Send message error:", error);
      Alert.alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const saveSchedule = async () => {
    if (!booking?.id) return;

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        requestedDay: selectedDay,
        requestedTime: selectedTime,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: user?.uid || "",
        text: `Schedule updated: ${selectedDay || "No day"} | ${selectedTime || "No time"}`,
        system: true,
        createdAt: serverTimestamp(),
      });

      if (booking) {
        const receiverId = isProvider ? booking.customerId : booking.providerId;

        await addDoc(collection(db, "notifications"), {
          userId: receiverId,
          title: "Schedule Updated",
          body: `Schedule proposal updated for ${booking.businessName}.`,
          type: "schedule_updated",
          bookingId: booking.id,
          conversationId,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }

      loadData();
    } catch (error) {
      console.log("Save schedule error:", error);
      Alert.alert("Failed to save schedule.");
    }
  };

  const acceptBooking = async () => {
    if (!booking?.id) return;

    if (!selectedDay || !selectedTime) {
      Alert.alert("Set day and time first");
      return;
    }

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        requestedDay: selectedDay,
        requestedTime: selectedTime,
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: user?.uid || "",
        text: `Booking accepted for ${selectedDay} at ${selectedTime}.`,
        system: true,
        createdAt: serverTimestamp(),
      });

      const receiverId = isProvider ? booking.customerId : booking.providerId;

      await addDoc(collection(db, "notifications"), {
        userId: receiverId,
        title: "Booking Accepted",
        body: `${booking.businessName} booking has been accepted.`,
        type: "booking_accepted",
        bookingId: booking.id,
        conversationId,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      loadData();
    } catch (error) {
      console.log("Accept booking error:", error);
      Alert.alert("Failed to accept booking.");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        paddingHorizontal: 16,
        paddingTop: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            marginRight: 12,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 12,
            backgroundColor: theme.colors.card,
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_700",
              color: theme.colors.text,
              fontSize: 16,
            }}
          >
            {"<"}
          </Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Kyiv_700",
              fontSize: 18,
              color: theme.colors.text,
            }}
          >
            {booking?.businessName || conversation?.serviceName || "Messages"}
          </Text>
          {booking?.status ? (
            <Text
              style={{
                fontFamily: "Kyiv_400",
                fontSize: 12,
                color: theme.colors.text,
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              Status: {booking.status}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: 18,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_600",
            fontSize: 14,
            color: theme.colors.text,
            marginBottom: 8,
          }}
        >
          Set Day
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          {DAYS.map((day) => {
            const selected = selectedDay === day;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                style={{
                  backgroundColor: selected ? theme.colors.primary : theme.colors.bg,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Kyiv_500",
                    color: selected ? "#fff" : theme.colors.text,
                    fontSize: 13,
                  }}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text
          style={{
            fontFamily: "Kyiv_600",
            fontSize: 14,
            color: theme.colors.text,
            marginBottom: 8,
          }}
        >
          Set Time
        </Text>

        <TextInput
          placeholder="Example: 12:00 PM - 6:00 PM"
          placeholderTextColor={theme.colors.placeholder}
          value={selectedTime}
          onChangeText={setSelectedTime}
          returnKeyType="done"
          onSubmitEditing={saveSchedule}
          style={{
            backgroundColor: theme.colors.bg,
            color: theme.colors.text,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontFamily: "Kyiv_400",
            marginBottom: 12,
          }}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={saveSchedule}
            style={{
              flex: 1,
              backgroundColor: theme.colors.primarySoft,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Kyiv_700",
                color: theme.colors.text,
              }}
            >
              Save
            </Text>
          </Pressable>

          <Pressable
            onPress={acceptBooking}
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Kyiv_700",
                color: "#fff",
              }}
            >
              Accept
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => {
          const mine = item.senderId === user?.uid;
          const bubbleBg = item.system
            ? theme.colors.primarySoft
            : mine
            ? theme.colors.primary
            : theme.colors.card;

          const bubbleText = item.system
            ? theme.colors.text
            : mine
            ? "#fff"
            : theme.colors.text;

          return (
            <View
              key={item.id}
              style={{
                alignItems: mine ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  maxWidth: "82%",
                  backgroundColor: bubbleBg,
                  borderColor: item.system ? theme.colors.border : "transparent",
                  borderWidth: item.system ? 1 : 0,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                }}
              >
                <Text
                  style={{
                    fontFamily: item.system ? "Kyiv_500" : "Kyiv_400",
                    fontSize: 14,
                    color: bubbleText,
                    lineHeight: 20,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 18,
          gap: 10,
        }}
      >
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.placeholder}
          value={messageText}
          onChangeText={setMessageText}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          style={{
            flex: 1,
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontFamily: "Kyiv_400",
          }}
        />

        <Pressable
          onPress={sendMessage}
          disabled={sending}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                fontFamily: "Kyiv_700",
                color: "#fff",
              }}
            >
              Send
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}