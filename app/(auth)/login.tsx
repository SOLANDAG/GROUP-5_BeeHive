import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    setError("Please fill all fields.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Login successful
    router.replace("/(app)/home");

  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      setError("Account not found.");
    } else if (err.code === "auth/wrong-password") {
      setError("Incorrect password.");
    } else if (err.code === "auth/invalid-email") {
      setError("Invalid email address.");
    } else {
      setError("Login failed.");
    }
  }

  setLoading(false);
};

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: theme.colors.bg,
      }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 26,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.colors.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        selectionColor={theme.colors.primary}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        selectionColor={theme.colors.primary}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
        }}
      />

      {error ? (
        <Text
          style={{
            color: "red",
            marginBottom: 12,
            fontFamily: "Kyiv_400",
          }}
        >
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={handleLogin}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ fontFamily: "Kyiv_300", color: "#fff" }}>Login</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/signup")}
        style={{ marginTop: 16 }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_500",
            color: theme.colors.primary,
          }}
        >
          Create account
        </Text>
      </Pressable>
    </View>
  );
}
