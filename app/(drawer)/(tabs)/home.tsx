import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Welcome, AppleStar12345 👋
      </Text>

      <Text style={{ marginTop: 8 }}>
        What are you in here for today?
      </Text>
    </View>
  );
}
