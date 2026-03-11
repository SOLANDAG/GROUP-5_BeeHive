import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ApplyProviderScreen() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleApply = async () => {
    if (!user) return;

    if (!businessName || !category || !description) {
      Alert.alert("Please fill all required fields.");
      return;
    }

    try {
      await setDoc(doc(db, "providerApplications", user.uid), {
        userId: user.uid,
        businessName,
        category,
        description,
        location,
        status: "pending",
        createdAt: new Date(),
      });

      await setDoc(
        doc(db, "users", user.uid),
        { providerStatus: "pending" },
        { merge: true }
      );

      Alert.alert("Application submitted for review.");
    } catch (error) {
      console.log(error);
      Alert.alert("Failed to submit application.");
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 24,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Apply as Service Provider
      </Text>

      <TextInput
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      />

      <TextInput
        placeholder="Service Category"
        value={category}
        onChangeText={setCategory}
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      />

      <TextInput
        placeholder="Service Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
          minHeight: 100,
        }}
      />

      <TextInput
        placeholder="Business Location (optional)"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      />

      <Pressable
        onPress={handleApply}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
          Submit Application
        </Text>
      </Pressable>
    </ScrollView>
  );
}
