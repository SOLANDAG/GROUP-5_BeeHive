import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function MyServicesScreen() {
  const { theme } = useTheme();

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
        Create Service
      </Text>

      <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.placeholder }}>
        Service Name
      </Text>

      <TextInput
        value={serviceName}
        onChangeText={setServiceName}
        placeholder="Ex: Home Cleaning"
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 16,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.placeholder }}>
        Price
      </Text>

      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Ex: 500"
        keyboardType="numeric"
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 16,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.placeholder }}>
        Description
      </Text>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your service..."
        multiline
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 24,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <Pressable
        onPress={createService}
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
            Create Service
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}