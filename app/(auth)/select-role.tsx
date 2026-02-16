import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

type Role = "customer" | "provider" | "both";

export default function SelectRoleScreen() {
  const goToSignup = (role: Role) => {
    router.push({ pathname: "/(auth)/signup", params: { role } } as any);
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800", textAlign: "center" }}>
        How will you use BeeHive? 🐝
      </Text>

      <Pressable style={btn} onPress={() => goToSignup("customer")}>
        <Text style={txt}>I want to book services</Text>
      </Pressable>

      <Pressable style={btn} onPress={() => goToSignup("provider")}>
        <Text style={txt}>I provide services</Text>
      </Pressable>

      <Pressable style={btn} onPress={() => goToSignup("both")}>
        <Text style={txt}>I want to do both</Text>
      </Pressable>

      {/* Login option for existing users */}
      <Pressable onPress={() => router.push("/(auth)/login" as any)} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center" }}>
          Already have an account? <Text style={{ fontWeight: "700" }}>Login</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const btn = {
  marginTop: 16,
  padding: 14,
  borderRadius: 12,
  backgroundColor: "black",
  alignItems: "center" as const,
};

const txt = { color: "white", fontWeight: "700" as const };
