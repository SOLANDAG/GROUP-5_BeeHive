import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(drawer)/(tabs)/home" as any);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginTop: 16, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={onLogin}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: loading ? "gray" : "black",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/select-role" as any)}
        style={{ marginTop: 12 }}
      >
        <Text style={{ textAlign: "center" }}>
          No account? <Text style={{ fontWeight: "700" }}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
