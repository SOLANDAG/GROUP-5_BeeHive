import { View, Text, Pressable, Switch, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ProviderStatus() {
  const { theme } = useTheme();
  const [active, setActive] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    const loadStatus = async () => {
      if (!user) return;

      const snap = await getDoc(doc(db, "services", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setActive(data.isActive === true);
      }
    };

    loadStatus();
  }, []);

  const toggleActive = async () => {
    if (!user) return;

    const newState = !active;

    await updateDoc(doc(db, "services", user.uid), {
      isActive: newState
    });

    setActive(newState);
  };

  const cancelProvider = async () => {
    if (!user) return;

    Alert.alert(
      "Cancel Provider",
      "Are you sure you want to stop being a provider?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {

            await deleteDoc(doc(db, "services", user.uid));

            await updateDoc(doc(db, "users", user.uid), {
            "roles.provider": false,
            providerStatus: "none",
            currentMode: "customer",
            isActive: false
            });

            Alert.alert("You are no longer a provider.");
          }
        }
      ]
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: theme.colors.bg
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Kyiv_700",
          marginBottom: 20,
          color: theme.colors.text
        }}
      >
        Provider Status
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 30
        }}
      >
        <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text }}>
          Active Provider
        </Text>

        <Switch
          value={active}
          onValueChange={toggleActive}
        />
      </View>

      <Pressable
        onPress={cancelProvider}
        style={{
          backgroundColor: "#E53935",
          padding: 16,
          borderRadius: 16,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
          Cancel Provider Status
        </Text>
      </Pressable>
    </View>
  );
}