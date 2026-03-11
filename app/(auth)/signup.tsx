import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SignupScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        const user = credential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          roles: {
            customer: true,
            provider: false,
          },
          currentMode: "customer",
          createdAt: new Date()
        });

        router.replace("/(app)/home");
      } catch (err: any) {
            if (err.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else {
        setError("Signup failed. Try again.");
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
        Create Account
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
        onSubmitEditing={handleSignup}
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
        onPress={handleSignup}
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
          <Text style={{ fontFamily: "Kyiv_300", color: "#fff" }}>Sign Up</Text>
        )}
      </Pressable>

      {/* Return to Login */}
      <Pressable
        onPress={() => router.replace("/(auth)/login")}
        style={{ marginTop: 16, alignItems: "center" }}
      >
        <Text style={{ fontFamily: "Kyiv_500", color: theme.colors.primary }}>
          ← Return to Login
        </Text>
      </Pressable>
    </View>
  );
}
