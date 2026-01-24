import { View, Text, Pressable } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { router } from "expo-router";

export default function ProfileScreen() {
  const onLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/login" as any);
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Profile</Text>

      <Pressable
        onPress={onLogout}
        style={{
          marginTop: 24,
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
