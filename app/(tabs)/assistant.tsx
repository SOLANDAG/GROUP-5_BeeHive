import { View, Text } from "react-native";

export default function AssistantScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Assistant</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        This will be the Bee AI chat screen.
      </Text>
    </View>
  );
}
