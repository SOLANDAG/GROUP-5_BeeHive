import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

type Role = "customer" | "provider" | "both";

export default function SignupScreen() {
  const { role } = useLocalSearchParams<{ role?: Role }>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: "",
        roles: {
          customer: role === "customer" || role === "both",
          provider: role === "provider" || role === "both",
        },
        createdAt: serverTimestamp(),
      });

      router.replace("/(drawer)/(tabs)/home" as any);
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Sign up</Text>

      <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={input} />
      <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={input} />

      <Pressable onPress={onSignup} disabled={loading} style={[btn, { backgroundColor: loading ? "gray" : "black" }]}>
        <Text style={{ color: "white", fontWeight: "700" }}>
          {loading ? "Creating..." : "Create account"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>Back</Text>
      </Pressable>
    </View>
  );
}

const input = { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 };
const btn = { marginTop: 16, padding: 14, borderRadius: 12, alignItems: "center" as const };
