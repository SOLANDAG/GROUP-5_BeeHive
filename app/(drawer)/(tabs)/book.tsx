import { View, Text } from "react-native";

export default function BookScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Book</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        Browse services and start a booking request here.
      </Text>
    </View>
  );
}
