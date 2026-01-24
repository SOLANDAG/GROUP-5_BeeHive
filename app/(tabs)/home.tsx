import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Home</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        This will be your dashboard.
      </Text>
    </View>
  );
}
