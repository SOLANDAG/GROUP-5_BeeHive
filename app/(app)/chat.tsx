import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { useLocalSearchParams } from "expo-router";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Chat() {

  const { theme } = useTheme();
  const user = auth.currentUser;

  const { conversationId, bookingId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const scrollRef = useRef<ScrollView | null>(null);


  /* LOAD MESSAGES */

  useEffect(() => {

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(list);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);

    });

    return unsubscribe;

  }, []);


  /* SEND MESSAGE */

  const sendMessage = async () => {

    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      conversationId,
      senderId: user?.uid,
      text,
      createdAt: serverTimestamp(),
    });

    setText("");

  };


  /* ACCEPT BOOKING */

  const acceptBooking = async () => {

    if (!date || !time) {
      Alert.alert("Set date and time first");
      return;
    }

    const bookingRef = doc(db, "bookings", bookingId as string);

    await updateDoc(bookingRef, {
      status: "accepted",
      scheduledDate: date,
      scheduledTime: time
    });

    Alert.alert("Booking accepted");

  };


  return (

    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}   /* THIS MOVES INPUT HIGHER */
    >

      {/* SCHEDULING AREA */}

      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: theme.colors.border
        }}
      >

        <Text
          style={{
            fontFamily: "Kyiv_700",
            fontSize: 16,
            marginBottom: 10,
            color: theme.colors.text
          }}
        >
          Schedule Booking
        </Text>

        <TextInput
          placeholder="Set Date (ex: March 20)"
          placeholderTextColor={theme.colors.placeholder}
          value={date}
          onChangeText={setDate}
          style={{
            backgroundColor: theme.colors.card,
            padding: 10,
            borderRadius: 10,
            marginBottom: 8,
            color: theme.colors.text
          }}
        />

        <TextInput
          placeholder="Set Time (ex: 6:00 PM)"
          placeholderTextColor={theme.colors.placeholder}
          value={time}
          onChangeText={setTime}
          style={{
            backgroundColor: theme.colors.card,
            padding: 10,
            borderRadius: 10,
            marginBottom: 10,
            color: theme.colors.text
          }}
        />

        <Pressable
          onPress={acceptBooking}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 10,
            borderRadius: 10,
            alignItems: "center"
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: "Kyiv_700"
            }}
          >
            Accept Booking
          </Text>
        </Pressable>

      </View>


      {/* MESSAGES */}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >

        {messages.map((msg) => {

          const isMine = msg.senderId === user?.uid;

          return (

            <View
              key={msg.id}
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                backgroundColor: isMine
                  ? theme.colors.primary
                  : theme.colors.card,
                padding: 12,
                borderRadius: 14,
                marginBottom: 10,
                maxWidth: "75%",
              }}
            >

              <Text
                style={{
                  color: isMine ? "#fff" : theme.colors.text,
                  fontFamily: "Kyiv_400",
                }}
              >
                {msg.text}
              </Text>

            </View>

          );

        })}

      </ScrollView>


      {/* INPUT */}

      <View
        style={{
          flexDirection: "row",
          padding: 14,           /* increased padding */
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.bg
        }}
      >

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={theme.colors.placeholder}
          style={{
            flex: 1,
            backgroundColor: theme.colors.card,
            padding: 12,
            borderRadius: 14,
            marginRight: 10,
            color: theme.colors.text,
            fontSize: 15
          }}
        />

        <Pressable
          onPress={sendMessage}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 18,
            justifyContent: "center",
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

    </KeyboardAvoidingView>

  );
}