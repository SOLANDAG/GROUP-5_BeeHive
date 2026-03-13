import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { askBee } from "@/lib/ai";

export default function AssistantScreen() {

  const { theme } = useTheme();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = input;

    setMessages(prev => [
      ...prev,
      { role: "user", text: userMessage }
    ]);

    setInput("");
    setLoading(true);

    try {

      const reply = await askBee(userMessage);

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: reply }
      ]);

    } catch {

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "AI error." }
      ]);

    }

    setLoading(false);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >

      <View style={{ flex: 1 }}>

        {/* MESSAGES */}

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >

          {messages.map((msg, i) => {

            const isUser = msg.role === "user";

            return (
              <View
                key={i}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  backgroundColor: isUser
                    ? theme.colors.primary
                    : theme.colors.card,
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 10,
                  maxWidth: "80%"
                }}
              >
                <Text style={{
                  color: isUser ? "#fff" : theme.colors.text
                }}>
                  {msg.text}
                </Text>
              </View>
            );
          })}

          {loading && (
            <ActivityIndicator color={theme.colors.primary} />
          )}

        </ScrollView>

        {/* INPUT BAR */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.bg,
            gap: 10
          }}
        >

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Bee..."
            placeholderTextColor={theme.colors.placeholder}
            style={{
              flex: 1,
              backgroundColor: theme.colors.card,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 16,
              color: theme.colors.text,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}
          />

          <Pressable
            onPress={sendMessage}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 14
            }}
          >
            <Text style={{
              color: "#fff",
              fontWeight: "bold"
            }}>
              Send
            </Text>
          </Pressable>

        </View>

      </View>

    </KeyboardAvoidingView>
  );
}