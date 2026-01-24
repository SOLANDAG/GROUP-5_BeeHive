import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Profile</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        Settings and user info will go here.
      </Text>
    </View>
  );
}
