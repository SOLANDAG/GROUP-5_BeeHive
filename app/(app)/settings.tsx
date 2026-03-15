import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { THEMES, ThemeType } from "@/lib/theme/theme";
import { FontAwesome5 } from "@expo/vector-icons";

import { auth } from "@/lib/firebase";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

export default function SettingsScreen() {
  const { theme, themeName, setThemeName } = useTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("User not found.");
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("Password updated successfully.");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("Old password incorrect.");
      } else {
        Alert.alert("Password update failed.");
      }
    }
  };

  return (

    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
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

      {/* CHANGE PASSWORD */}

      <Text
        style={{
          fontFamily: "Kyiv_600",
          fontSize: 16,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      >
        Change Password
      </Text>

      <TextInput
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 18,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <Pressable
        onPress={handleChangePassword}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
          
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
          Save Password
        </Text>
      </Pressable>

      <View
        style={{
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical: 28,
        }}
      />

      {/* APPEARANCE */}

      <Text
        style={{
          fontFamily: "Kyiv_600",
          fontSize: 16,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      >
        Appearance | Theme Colors
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
    </ScrollView>
  );
}