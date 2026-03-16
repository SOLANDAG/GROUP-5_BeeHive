import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
} from "react-native";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter } from "expo-router";

import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function Favorites() {
  const { theme } = useTheme();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);

  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {

      const favQuery = query(
        collection(db, "favorites"),
        where("userId", "==", user.uid)
      );

      const favSnap = await getDocs(favQuery);

      const favoriteServiceIds = favSnap.docs.map(
        (doc) => doc.data().serviceId
      );

      if (favoriteServiceIds.length === 0) {
        setServices([]);
        return;
      }

      const servicesSnap = await getDocs(
        collection(db, "services")
      );

      const favServices = servicesSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((service: any) =>
          favoriteServiceIds.includes(service.id)
        );

      setServices(favServices);

    } catch (error) {
      console.log("Favorites error:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 26,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Favorites
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (

          <View
            style={{
              backgroundColor: theme.colors.card,
              padding: 20,
              borderRadius: 20,
              marginBottom: 16,
            }}
          >

            <Text
              style={{
                fontFamily: "Kyiv_700",
                fontSize: 22,
                color: theme.colors.primary,
              }}
            >
              {item.businessName}
            </Text>

            <Text
              style={{
                marginTop: 6,
                color: theme.colors.text,
              }}
            >
              {item.category}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
              }}
            >

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: { userId: item.providerId },
              })
            }
            style={{
              marginRight: 20,
            }}
          >
            <Text
              style={{
                color: theme.colors.primary,
              }}
            >
              Message
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/book",
                params: { serviceId: item.id },
              })
            }
          >
            <Text
              style={{
                color: theme.colors.primary,
              }}
            >
              Book
            </Text>
          </Pressable>

            </View>

          </View>

        )}
      />

    </View>
  );
}