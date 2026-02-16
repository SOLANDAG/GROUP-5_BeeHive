import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import AppHeader from "./AppHeader";

export default function DrawerLayout() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />

      <Drawer
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}
