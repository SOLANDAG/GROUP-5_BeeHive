import { View, Text, Pressable } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";

export default function AppHeader() {
  const navigation = useNavigation();

  return (
    <View
      style={{
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      {/* Always show menu icon */}
      <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Text style={{ fontSize: 20 }}>☰</Text>
      </Pressable>

      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        🐝 BeeHive
      </Text>

      <Pressable onPress={() => console.log("Notifications pressed")}>
        <Text style={{ fontSize: 20 }}>🔔</Text>
      </Pressable>
    </View>
  );
}
