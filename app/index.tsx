import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 32, fontWeight: "800" }}>BeeHive 🐝</Text>
      <Text style={{ marginTop: 10, fontSize: 16, opacity: 0.8 }}>
        Your AI-assisted workspace for tasks, notes, and help.
      </Text>

      <Pressable
        onPress={() => router.push("/(auth)/login" as any)}
        style={{
          marginTop: 24,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "black",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Get Started</Text>
      </Pressable>
    </View>
  );
}
