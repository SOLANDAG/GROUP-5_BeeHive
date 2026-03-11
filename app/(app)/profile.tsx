import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword, updateEmail } from "firebase/auth";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");

  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFirstName(data.firstName || "");
        setMiddleName(data.middleName || "");
        setLastName(data.lastName || "");
        if (data.birthdate) setBirthdate(new Date(data.birthdate));
      } else {
        // fallback from auth if no doc yet
        setFirstName(user.displayName || "");
      }

      setPhotoURL(user.photoURL);
      setEmail(user.email || "");
    };

    fetchUser();
  }, []);

  const calculateAge = (date: Date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const prettyAuthError = (code?: string) => {
    switch (code) {
      case "auth/requires-recent-login":
        return "For security, please log in again to change email/password.";
      case "auth/invalid-email":
        return "That email address is not valid.";
      case "auth/email-already-in-use":
        return "That email is already registered.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters (better if longer).";
      default:
        return code ? `Update failed (${code}).` : "Update failed.";
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // basic validations
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("First and Last name are required.");
      return;
    }

    if (birthdate && calculateAge(birthdate) < 18) {
      Alert.alert("You must be at least 18 years old.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        Alert.alert("Password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      // 1) Save to Firestore safely (works even if doc doesn't exist yet)
      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          birthdate: birthdate ? birthdate.toISOString() : null,
        },
        { merge: true }
      );

      // 2) Update auth profile (sidebar reads from here)
      await updateProfile(user, {
        displayName: firstName.trim(), // formal first name
        photoURL: photoURL || undefined,
      });

      // 3) Update email only if changed
      if (email.trim() && email.trim() !== (user.email || "")) {
        try {
          await updateEmail(user, email.trim());
        } catch (e: any) {
          Alert.alert(prettyAuthError(e?.code));
          // Don't return; let other saves stand
        }
      }

      // 4) Update password only if provided
      if (newPassword) {
        try {
          await updatePassword(user, newPassword);
        } catch (e: any) {
          Alert.alert(prettyAuthError(e?.code));
          // Don't return; let other saves stand
        }
      }

      Alert.alert("Profile updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      console.log("Profile update error:", e);
      Alert.alert(prettyAuthError(e?.code));
    } finally {
      setLoading(false);
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
    >
      {/* PROFILE IMAGE */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={
            photoURL
              ? { uri: photoURL }
              : require("@/app/assets/images/profile.jpg")
          }
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
          }}
        />

        <Pressable onPress={pickImage}>
          <Text
            style={{
              marginTop: 8,
              color: theme.colors.primary,
              fontFamily: "Kyiv_500",
            }}
          >
            Edit Profile Picture
          </Text>
        </Pressable>
      </View>

      {/* First Name */}
      <Text style={labelStyle(theme)}>First Name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        style={inputStyle(theme)}
      />

      {/* Middle Name */}
      <Text style={labelStyle(theme)}>Middle Name (Optional)</Text>
      <TextInput
        value={middleName}
        onChangeText={setMiddleName}
        placeholder="Enter middle name"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        style={inputStyle(theme)}
      />

      {/* Last Name */}
      <Text style={labelStyle(theme)}>Last Name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        style={inputStyle(theme)}
      />

      {/* Email */}
      <Text style={labelStyle(theme)}>Email Address</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        keyboardType="email-address"
        autoCapitalize="none"
        style={inputStyle(theme)}
      />

      {/* Birthdate */}
      <Text style={labelStyle(theme)}>Birthdate</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          inputStyle(theme),
          { justifyContent: "center" },
        ]}
      >
        <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text }}>
          {birthdate ? birthdate.toDateString() : "Select birthdate"}
        </Text>
      </Pressable>

      {showPicker && (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <DateTimePicker
            value={birthdate || new Date(2000, 0, 1)}
            mode="date"
            display="spinner"
            themeVariant="light"
            onChange={(event, selectedDate) => {
              if (selectedDate) setBirthdate(selectedDate);
            }}
          />
        </View>
      )}

      <View style={dividerStyle(theme)} />

      {/* Password */}
      <Text style={labelStyle(theme)}>Change Password</Text>

      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        secureTextEntry
        style={inputStyle(theme)}
      />

      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        secureTextEntry
        style={inputStyle(theme)}
      />

      <View style={dividerStyle(theme)} />

      {/* Save */}
      <Pressable
        onPress={handleSave}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const labelStyle = (theme: any) => ({
  fontFamily: "Kyiv_600",
  color: theme.colors.placeholder,
  marginBottom: 6,
  marginTop: 10,
});

const inputStyle = (theme: any) => ({
  backgroundColor: theme.colors.card,
  padding: 14,
  borderRadius: 16,
  marginBottom: 12,
  color: theme.colors.text,
  fontFamily: "Kyiv_400",
});

const dividerStyle = (theme: any) => ({
  height: 1,
  backgroundColor: theme.colors.border,
  marginVertical: 20,
});
