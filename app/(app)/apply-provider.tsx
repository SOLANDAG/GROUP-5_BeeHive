import { useState, useEffect } from "react";
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

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export default function ApplyProviderScreen() {
  const { theme } = useTheme();

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [status, setStatus] = useState<string | null>(null);

  const user = auth.currentUser;

  // =========================
  // CHECK EXISTING APPLICATION
  // =========================
  useEffect(() => {
    const checkApplication = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(
          doc(db, "providerApplications", user.uid)
        );

        if (snap.exists()) {
          setStatus(snap.data().status);
        }
      } catch (error) {
        console.log("Application check error:", error);
      }
    };

    checkApplication();
  }, []);

  // =========================
  // SUBMIT APPLICATION
  // =========================
  const handleApply = async () => {
    if (!user) {
      Alert.alert("You must be logged in.");
      return;
    }

    if (!businessName || !category || !description) {
      Alert.alert("Please fill all required fields.");
      return;
    }

    try {
      const existing = await getDoc(
        doc(db, "providerApplications", user.uid)
      );

      if (existing.exists()) {
        const data = existing.data();

        if (data.status === "pending") {
          Alert.alert("Your application is still pending.");
          return;
        }

        if (data.status === "approved") {
          Alert.alert("You are already a provider.");
          return;
        }
      }

      await setDoc(
        doc(db, "providerApplications", user.uid),
        {
          userId: user.uid,
          businessName,
          category,
          description,
          location,
          status: "pending",
          createdAt: new Date(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "users", user.uid),
        {
          providerStatus: "pending",
        },
        { merge: true }
      );

      setStatus("pending");

      Alert.alert("Application submitted for review.");
    } catch (error) {
      console.log("Application error:", error);
      Alert.alert("Failed to submit application.");
    }
  };

  // =========================
  // CANCEL APPLICATION
  // =========================
  const cancelApplication = async () => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "providerApplications", user.uid));

      setStatus(null);

      Alert.alert("Application cancelled.");
    } catch (error) {
      console.log("Cancel error:", error);
      Alert.alert("Failed to cancel application.");
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

      {status === "pending" && (
        <Text
          style={{
            color: "orange",
            marginBottom: 20,
            fontFamily: "Kyiv_600",
          }}
        >
          Your provider application is pending approval.
        </Text>
      )}

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
          fontFamily: "Kyiv_400",
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
          fontFamily: "Kyiv_400",
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
          fontFamily: "Kyiv_400",
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
          fontFamily: "Kyiv_400",
        }}
      />

      <Pressable
        disabled={status === "pending"}
        onPress={handleApply}
        style={{
          backgroundColor:
            status === "pending"
              ? "#BDBDBD"
              : theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
          Submit Application
        </Text>
      </Pressable>

      {status === "pending" && (
        <Pressable
          onPress={cancelApplication}
          style={{
            marginTop: 10,
            backgroundColor: "#E53935",
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
            Cancel Application
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}