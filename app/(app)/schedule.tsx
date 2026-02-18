import { View, Text } from "react-native";

export default function ScheduleScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>My Schedule</Text>
      <Text style={{ marginTop: 10, opacity: 0.8 }}>
        Your upcoming and completed bookings will appear here.
      </Text>
    </View>
  );
}
