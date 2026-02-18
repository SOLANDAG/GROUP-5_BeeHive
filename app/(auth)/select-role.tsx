import { View, Text, Pressable } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter } from "expo-router";

export default function SelectRoleScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const saveRole = async (role: "customer" | "provider" | "both") => {
    const user = auth.currentUser;
    if (!user) return;

    const roles = {
      customer: role === "customer" || role === "both",
      provider: role === "provider" || role === "both",
    };

    await setDoc(
      doc(db, "users", user.uid),
      {
        roles,
        currentMode: "customer",
      },
      { merge: true }
    );

    router.replace("/(app)/home");
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
          fontSize: 24,
          marginBottom: 24,
          color: theme.colors.text,
        }}
      >
        Select Your Role
      </Text>

      {["customer", "provider", "both"].map((role) => (
        <Pressable
          key={role}
          onPress={() => saveRole(role as any)}
          style={{
            backgroundColor: theme.colors.card,
            padding: 18,
            borderRadius: 16,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_600",
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            {role.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
