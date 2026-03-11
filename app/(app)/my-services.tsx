import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRole } from "@/lib/auth/useRole";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function MyServicesScreen() {
  const { theme } = useTheme();
  const { roles } = useRole();

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const createService = async () => {
  const user = auth.currentUser;

    if (!user) {
      Alert.alert("You must be logged in.");
      return;
    }

    if (!serviceName || !price) {
      Alert.alert("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "services"), {
        name: serviceName,
        price: Number(price),
        description,
        providerId: user.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Service created!");

      setServiceName("");
      setPrice("");
      setDescription("");

    } catch (error) {
      console.log("Create service error:", error);
      Alert.alert("Error creating service.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!roles.provider) {
      router.replace("/(app)/home");
    }
  }, [roles]);

  if (!roles.provider) return null;

  return (
  <View
    style={{
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: 24,
    }}
  >
    <Text
      style={{
        fontSize: 24,
        fontWeight: "900",
        color: theme.colors.text,
        marginBottom: 20,
      }}
    >
      My Services
      </Text>

      <Text style={{ color: theme.colors.placeholder }}>Service Name</Text>
      <TextInput
        value={serviceName}
        onChangeText={setServiceName}
        placeholder="Enter service name"
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 12,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      />

      <Text style={{ color: theme.colors.placeholder }}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 12,
          marginBottom: 12,
          color: theme.colors.text,
        }}
      />

      <Text style={{ color: theme.colors.placeholder }}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your service"
        multiline
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 12,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      />

      <Pressable
        onPress={createService}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {loading ? "Creating..." : "Create Service"}
        </Text>
      </Pressable>
    </View>
  );
}
