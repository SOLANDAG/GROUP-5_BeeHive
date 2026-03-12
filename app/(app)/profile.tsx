import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  updateEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail } from "firebase/auth";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
      });

      return unsubscribe;
    }, []);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");

  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempBirthdate, setTempBirthdate] = useState<Date | null>(null);

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();

          setFirstName(data.firstName || "");
          setMiddleName(data.middleName || "");
          setLastName(data.lastName || "");
          setBio(data.bio || "");

          if (data.birthdate) {
            setBirthdate(new Date(data.birthdate));
          }

          setPhotoURL(data.photoURL || user.photoURL || null);
        } else {
          setFirstName(user.displayName || "");
          setPhotoURL(user.photoURL || null);
        }

        setEmail(user.email || "");
      } catch (error) {
        console.log("Fetch profile error:", error);
      }
    };

    fetchUser();
  }, [user]);

  const calculateAge = (date: Date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDifference = today.getMonth() - date.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    return age;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow gallery access first.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setPickedImageUri(localUri);
      setPhotoURL(localUri);
    }
  };

  const prettyAuthError = (code?: string) => {
    switch (code) {
      case "auth/requires-recent-login":
        return "For security, please log in again to change email or password.";
      case "auth/invalid-email":
        return "That email address is not valid.";
      case "auth/email-already-in-use":
        return "That email is already registered.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      default:
        return code ? `Update failed (${code}).` : "Update failed.";
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert("No user found.");
      return;
    }

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
      let finalPhotoURL = photoURL || user.photoURL || null;

      if (pickedImageUri) {
        finalPhotoURL = pickedImageUri;
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          fullName,
          email: email.trim(),
          birthdate: birthdate ? birthdate.toISOString() : null,
          photoURL: finalPhotoURL,
          bio,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await updateProfile(user, {
        displayName: fullName,
        photoURL: finalPhotoURL || undefined,
      });

      if (email.trim() && email.trim() !== (user.email || "")) {
        try {
          await updateEmail(user, email.trim());
        } catch (error: any) {
          Alert.alert(prettyAuthError(error?.code));
        }
      }

      if (newPassword) {

      if (!oldPassword) {
        Alert.alert("Please enter your current password.");
        return;
      }

      try {

        const credential = EmailAuthProvider.credential(
          user.email || "",
          oldPassword
        );

        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPassword);

      } catch (error: any) {
        Alert.alert(prettyAuthError(error?.code));
      }

    }

      setPickedImageUri(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert("Success", "Profile updated successfully.");
    } catch (error: any) {
      console.log("Profile update error:", error);
      Alert.alert("Error", prettyAuthError(error?.code));
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
      contentContainerStyle={{ paddingBottom: 40 }}
    >
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

      <Text style={labelStyle(theme)}>First Name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        style={inputStyle(theme)}
      />

      <Text style={labelStyle(theme)}>Middle Name (Optional)</Text>
      <TextInput
        value={middleName}
        onChangeText={setMiddleName}
        placeholder="Enter middle name"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        style={inputStyle(theme)}
      />

      <Text style={labelStyle(theme)}>Last Name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        style={inputStyle(theme)}
      />

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

      <Text style={labelStyle(theme)}>About You</Text>

      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Tell people about yourself..."
        placeholderTextColor={theme.colors.placeholder}
        multiline
        blurOnSubmit={true}
        returnKeyType="done"
        style={[inputStyle(theme), { minHeight: 80 }]}
      />

      <Text style={labelStyle(theme)}>Birthdate</Text>
      <Pressable
        onPress={() => {
          setTempBirthdate(birthdate || new Date(2000, 0, 1));
          setShowPicker(true);
        }}
        style={[inputStyle(theme), { justifyContent: "center" }]}
      >
        <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text }}>
          {birthdate ? birthdate.toDateString() : "Select birthdate"}
        </Text>
      </Pressable>

      {/* DO NOT CHANGE, IT'S ALREADY WORKING PROPERLY*/}
      {showPicker && (
      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: 16,
          borderRadius: 16,
          marginBottom: 12,
        }}
      >
        <DateTimePicker
          value={tempBirthdate || new Date(2000, 0, 1)}
          mode="date"
          display="spinner"
          themeVariant={theme.colors.bg === "#000" ? "dark" : "light"}
          textColor={theme.colors.text}
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setTempBirthdate(selectedDate);
            }
          }}
        />

        <Pressable
          onPress={() => {
            if (tempBirthdate) {
              setBirthdate(tempBirthdate);
            }
            setShowPicker(false);
          }}
          style={{
            marginTop: 10,
            backgroundColor: theme.colors.primary,
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
            Set Birthdate
          </Text>
        </Pressable>
      </View>
    )}

      <View style={dividerStyle(theme)} />

      <Text style={labelStyle(theme)}>Current Password</Text>

<TextInput
  value={oldPassword}
  onChangeText={setOldPassword}
  placeholder="Enter current password"
  placeholderTextColor={theme.colors.placeholder}
  selectionColor={theme.colors.primary}
  secureTextEntry
  style={inputStyle(theme)}
/>

<Pressable
  onPress={async () => {
    if (!user?.email) return;

    await sendPasswordResetEmail(auth, user.email);

    Alert.alert(
      "Password Reset",
      "A password reset link has been sent to your email."
    );
  }}
>
  <Text
    style={{
      color: theme.colors.primary,
      fontFamily: "Kyiv_500",
      marginBottom: 12,
    }}
  >
    Forgot password?
  </Text>
      </Pressable>

      <Text style={labelStyle(theme)}>New Password</Text>

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

      <Pressable
        onPress={handleSave}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#BDBDBD" : theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
            Save Changes
          </Text>
        )}
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