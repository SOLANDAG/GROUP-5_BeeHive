import { View, Text, Pressable, ScrollView } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { THEMES, ThemeType } from "@/lib/theme/theme";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SettingsScreen() {
  const { theme, themeName, setThemeName } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
    >
      {/* TITLE */}
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 22,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Settings
      </Text>

      {/* APPEARANCE SECTION */}
      <Text
        style={{
          fontFamily: "Kyiv_600",
          fontSize: 16,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      >
        Appearance
      </Text>

      {Object.entries(THEMES).map(([key, value]) => (
        <Pressable
          key={key}
          onPress={() => setThemeName(key as ThemeType)}
          style={{
            backgroundColor:
              themeName === key
                ? theme.colors.primarySoft
                : theme.colors.card,
            padding: 16,
            borderRadius: 16,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_500",
              color: theme.colors.text,
            }}
          >
            {value.name}
          </Text>

          {themeName === key && (
            <FontAwesome5
              name="check-circle"
              size={16}
              solid
              color={theme.colors.primary}
            />
          )}
        </Pressable>
      ))}

      {/* ACCOUNT SECTION */}
      <Text
        style={{
          fontFamily: "Kyiv_600",
          fontSize: 16,
          marginTop: 24,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      >
        Account
      </Text>

      <Pressable
        style={{
          backgroundColor: theme.colors.card,
          padding: 16,
          borderRadius: 16,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_500",
            color: theme.colors.text,
          }}
        >
          Change Password
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: theme.colors.card,
          padding: 16,
          borderRadius: 16,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_500",
            color: theme.colors.text,
          }}
        >
          Edit Profile
        </Text>
      </Pressable>

      {/* LOGOUT */}
      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: "#E53935",
          padding: 16,
          borderRadius: 16,
          marginTop: 30,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_600",
            color: "#fff",
          }}
        >
          Logout
        </Text>
      </Pressable>
    </ScrollView>
  );
}
