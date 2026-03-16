import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";

import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

type FavoriteService = {
  id: string;
  providerId?: string;
  businessName?: string;
  category?: string;
  description?: string;
  location?: string;
  price?: number;
  availableDays?: string[];
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
  favDocId?: string;
};

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [services, setServices] = useState<FavoriteService[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const favQuery = query(
        collection(db, "favorites"),
        where("userId", "==", user.uid)
      );

      const favSnap = await getDocs(favQuery);

      const favoriteRecords = favSnap.docs.map((favoriteDoc) => ({
        serviceId: favoriteDoc.data().serviceId as string,
        favDocId: favoriteDoc.id,
      }));

      if (favoriteRecords.length === 0) {
        setServices([]);
        return;
      }

      const servicesSnap = await getDocs(collection(db, "services"));

      const favoriteServices: FavoriteService[] = servicesSnap.docs
        .map((serviceDoc) => ({
          id: serviceDoc.id,
          ...serviceDoc.data(),
        }))
        .filter((service: any) =>
          favoriteRecords.some(
            (favorite) => favorite.serviceId === service.id
          )
        )
        .map((service: any) => ({
          ...service,
          favDocId: favoriteRecords.find(
            (favorite) => favorite.serviceId === service.id
          )?.favDocId,
        }));

      setServices(favoriteServices);
    } catch (error) {
      console.log("Favorites load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const unfavorite = async (favDocId?: string, serviceId?: string) => {
    if (!favDocId || !serviceId) return;

    try {
      await deleteDoc(doc(db, "favorites", favDocId));

      setServices((prev) =>
        prev.filter((service) => service.id !== serviceId)
      );
    } catch (error) {
      console.log("Unfavorite error:", error);
    }
  };

  const handleMessage = (service: FavoriteService) => {
    router.push({
      pathname: "/chat",
      params: {
        providerId: service.providerId,
        serviceId: service.id,
      },
    });
  };

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
          fontSize: 24,
          color: theme.colors.text,
          marginBottom: 18,
        }}
      >
        Favorite Services
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : services.length === 0 ? (
        <Text
          style={{
            fontFamily: "Kyiv_400",
            color: theme.colors.text,
            opacity: 0.7,
          }}
        >
          You have no favorite services yet.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {services.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <Text
                  style={{
                    fontFamily: "Kyiv_700",
                    fontSize: 22,
                    color: theme.colors.primary,
                  }}
                >
                  {item.businessName}
                </Text>

                <Pressable
                  onPress={() => unfavorite(item.favDocId, item.id)}
                >
                  <FontAwesome
                    name="heart"
                    size={20}
                    color="#E53935"
                  />
                </Pressable>
              </View>

              <Text
                style={{
                  fontFamily: "Kyiv_500",
                  fontSize: 13,
                  marginBottom: 8,
                  opacity: 0.8,
                  color: theme.colors.text,
                }}
              >
                {item.category}
              </Text>

              <Text
                style={{
                  fontFamily: "Kyiv_400",
                  color: theme.colors.text,
                  marginBottom: 10,
                }}
              >
                {item.description}
              </Text>

              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  fontSize: 15,
                  color: theme.colors.primary,
                  marginBottom: 8,
                }}
              >
                Price: ₱{item.price}
              </Text>

              <View
                style={{
                  height: 2,
                  backgroundColor: theme.colors.border,
                  marginVertical: 10,
                }}
              />

              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  fontSize: 15,
                  color: theme.colors.primary,
                  marginBottom: 4,
                }}
              >
                SCHEDULE
              </Text>

              <Text style={{ color: theme.colors.text }}>
                {Array.isArray(item.availableDays)
                  ? item.availableDays.join(" | ")
                  : "Schedule not set"}
              </Text>

              <Text style={{ color: theme.colors.text }}>
                {item.startTime} - {item.endTime}
              </Text>

              <Pressable
                disabled={item.isActive === false}
                onPress={() => handleMessage(item)}
                style={{
                  marginTop: 14,
                  backgroundColor:
                    item.isActive === false ? "#B0B0B0" : theme.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Kyiv_700",
                    color: "#fff",
                  }}
                >
                  {item.isActive === false ? "Inactive" : "Message & Book"}
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});