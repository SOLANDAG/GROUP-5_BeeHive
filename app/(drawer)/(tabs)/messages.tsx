import { View, Text } from "react-native";

export default function MessagesScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Messages</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        Customer ↔ provider chats and updates will appear here.
      </Text>
    </View>
  );
}
