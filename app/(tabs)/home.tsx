import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";

export default function HomeScreen() {
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;

      // ✅ Important: don't get stuck loading
      if (!user) {
        setLoading(false);
        router.replace("/(auth)/login" as any);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() as any;

        const name =
          (data?.username && data.username.trim()) ||
          (data?.firstName && data.firstName.trim()) ||
          user.email ||
          "there";

        setDisplayName(name);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>
        Welcome, {displayName} 👋
      </Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        What are you in here for today?
      </Text>
    </View>
  );
}
