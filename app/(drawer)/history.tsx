import { View, Text } from "react-native";

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>History</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        Past AI conversations and completed services will appear here.
      </Text>
    </View>
  );
}
