import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert(
        "Missing info",
        "Please enter first name, last name, email, and password."
      );
      return;
    }

    try {
      setLoading(true);

      // Create Auth account
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Create Firestore user profile
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: "", // optional, user can set later
        createdAt: serverTimestamp(),
      });

      // Go to Home
      router.replace("/(tabs)/home" as any);
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Sign up</Text>

      <TextInput
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
        style={{ marginTop: 16, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <TextInput
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
        style={{ marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={onSignup}
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
          {loading ? "Creating..." : "Create account"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>Back to login</Text>
      </Pressable>
    </View>
  );
}
