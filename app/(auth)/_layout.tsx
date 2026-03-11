import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
