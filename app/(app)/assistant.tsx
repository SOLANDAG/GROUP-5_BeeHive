import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { executeBeeCommand } from "@/lib/beeBrain";

type MessageItem = {
  role: "user" | "assistant";
  text: string;
};

const QUICK_ACTIONS = [
  { label: "Find Providers", prompt: "Find providers" },
  { label: "Book Appointment", prompt: "Book cleaning tomorrow 3 PM" },
  { label: "My Schedule", prompt: "Show my schedule" },
  { label: "Cancel Latest", prompt: "Cancel my latest booking" },
  { label: "Reschedule", prompt: "Reschedule my booking to tomorrow 4 PM" },
];

export default function AssistantScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: "assistant",
      text: "Hi, I’m Bee. I can help you find providers, create bookings, check your schedule, and answer app questions.",
    },
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const pushMessage = (message: MessageItem) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendPrompt = async (promptText: string) => {
    const cleanPrompt = promptText.trim();

    if (!cleanPrompt || loading) return;

    pushMessage({ role: "user", text: cleanPrompt });
    setLoading(true);
    setInput("");

    try {
      const result = await executeBeeCommand(cleanPrompt);

      pushMessage({
        role: "assistant",
        text: result.reply,
      });

      if (result.intent === "view_schedule") {
        setTimeout(() => {
          router.push("/(app)/schedule");
        }, 500);
      }
    } catch (error) {
      console.log("Assistant sendPrompt error:", error);

      pushMessage({
        role: "assistant",
        text: "I’m still here to help. Try asking about providers, bookings, or your schedule.",
      });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={{ flex: 1 }}>
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
              fontSize: 24,
              color: theme.colors.text,
              marginBottom: 6,
            }}
          >
            Bee Assistant
          </Text>

          <Text
            style={{
              fontFamily: "Kyiv_400",
              color: theme.colors.text,
              opacity: 0.75,
              lineHeight: 20,
            }}
          >
            Chat with Bee or use a quick action below.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 14,
              gap: 10,
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => sendPrompt(action.prompt)}
                style={{
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Kyiv_600",
                    color: theme.colors.text,
                  }}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <View
                key={`${msg.role}-${index}`}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  backgroundColor: isUser
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderWidth: isUser ? 0 : 1,
                  borderColor: isUser ? "transparent" : theme.colors.border,
                  borderRadius: 18,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 12,
                  maxWidth: "86%",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Kyiv_400",
                    color: isUser ? "#fff" : theme.colors.text,
                    lineHeight: 20,
                  }}
                >
                  {msg.text}
                </Text>
              </View>
            );
          })}

          {loading && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </ScrollView>

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
            placeholder="Ask Bee anything..."
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
            onSubmitEditing={() => sendPrompt(input)}
            returnKeyType="send"
          />

          <Pressable
            onPress={() => sendPrompt(input)}
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
      </View>
    </KeyboardAvoidingView>
  );
}