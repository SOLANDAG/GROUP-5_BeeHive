import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function SignupScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Sign up</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          marginTop: 16,
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
        }}
      />

      <Pressable
        onPress={() => router.replace("/(tabs)/home" as any)}
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "black",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Create account</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>Back to login</Text>
      </Pressable>
    </View>
  );
}
