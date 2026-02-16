import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { router } from "expo-router";

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        router.replace("/(auth)/login" as any);
        return;
      }

      try {
        setEmail(user.email ?? "");

        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() as any;

        setFirstName(data?.firstName ?? "");
        setLastName(data?.lastName ?? "");
        setUsername(data?.username ?? "");
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const onSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/(auth)/login" as any);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Missing info", "First name and last name are required.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(), // optional
      });

      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/login" as any);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Profile</Text>

      <Text style={{ marginTop: 10, opacity: 0.7 }}>Email</Text>
      <Text style={{ marginTop: 4, fontWeight: "700" }}>{email}</Text>

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
        placeholder="Username (optional)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{ marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={onSave}
        disabled={saving}
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: saving ? "gray" : "black",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          {saving ? "Saving..." : "Save changes"}
        </Text>
      </Pressable>

      <Pressable
        onPress={onLogout}
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "black",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
