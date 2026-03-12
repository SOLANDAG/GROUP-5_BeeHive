import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

type Booking = {
  id: string;
  bookingId?: string;
  providerId: string;
  customerId: string;
  businessName: string;
  category: string;
  description: string;
  requestedDay?: string;
  requestedTime?: string;
  status: string;
  serviceId?: string;
};

type UserRoleInfo = {
  isProvider: boolean;
  isCustomer: boolean;
};

export default function BookScreen() {
  const { theme } = useTheme();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo>({
    isProvider: false,
    isCustomer: true,
  });

  const fetchBookings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);

      const roleSnap = await getDocs(
        query(collection(db, "users"), where("__name__", "==", user.uid))
      );

      if (!roleSnap.empty) {
        const data = roleSnap.docs[0].data();
        setRoleInfo({
          isProvider: !!data?.roles?.provider,
          isCustomer: !!data?.roles?.customer,
        });
      }

      const providerQ = query(
        collection(db, "bookings"),
        where("providerId", "==", user.uid)
      );

      const customerQ = query(
        collection(db, "bookings"),
        where("customerId", "==", user.uid)
      );

      const [providerSnap, customerSnap] = await Promise.all([
        getDocs(providerQ),
        getDocs(customerQ),
      ]);

      const map = new Map<string, Booking>();

      providerSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        map.set(docSnap.id, {
          id: docSnap.id,
          providerId: data.providerId,
          customerId: data.customerId,
          businessName: data.businessName || "Service",
          category: data.category || "",
          description: data.description || "",
          requestedDay: data.requestedDay || "",
          requestedTime: data.requestedTime || "",
          status: data.status || "pending",
          serviceId: data.serviceId || "",
        });
      });

      customerSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        map.set(docSnap.id, {
          id: docSnap.id,
          providerId: data.providerId,
          customerId: data.customerId,
          businessName: data.businessName || "Service",
          category: data.category || "",
          description: data.description || "",
          requestedDay: data.requestedDay || "",
          requestedTime: data.requestedTime || "",
          status: data.status || "pending",
          serviceId: data.serviceId || "",
        });
      });

      setBookings(Array.from(map.values()));
    } catch (error) {
      console.log("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openConversationFromBooking = async (booking: Booking) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const conversationQ = query(
        collection(db, "conversations"),
        where("bookingId", "==", booking.id)
      );

      const snap = await getDocs(conversationQ);

      if (!snap.empty) {
        router.push({
          pathname: "/(app)/messages",
          params: {
            conversationId: snap.docs[0].id,
            bookingId: booking.id,
          },
        });
      }
    } catch (error) {
      console.log("Open conversation error:", error);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 20,
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 24,
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        Requests & Bookings
      </Text>

      <Text
        style={{
          fontFamily: "Kyiv_400",
          fontSize: 14,
          color: theme.colors.text,
          opacity: 0.7,
          marginBottom: 18,
          lineHeight: 20,
        }}
      >
        Customers can track their booking requests here, while providers can review new requests and continue the conversation.
      </Text>

      {loading ? (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 20,
            padding: 18,
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_600",
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            No bookings yet
          </Text>
          <Text
            style={{
              fontFamily: "Kyiv_400",
              fontSize: 14,
              color: theme.colors.text,
              opacity: 0.75,
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            Once someone books a service or starts a booking conversation, it will appear here.
          </Text>
        </View>
      ) : (
        bookings.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 20,
              padding: 18,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontFamily: "Kyiv_700",
                fontSize: 18,
                color: theme.colors.primary,
              }}
            >
              {item.businessName}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_500",
                fontSize: 13,
                color: theme.colors.text,
                opacity: 0.75,
                marginTop: 4,
              }}
            >
              {item.category}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_400",
                fontSize: 14,
                color: theme.colors.text,
                lineHeight: 21,
                marginTop: 8,
              }}
            >
              {item.description}
            </Text>

            <View
              style={{
                height: 2,
                borderRadius: 999,
                backgroundColor: theme.colors.border,
                marginVertical: 12,
              }}
            />

            <Text
              style={{
                fontFamily: "Kyiv_600",
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              Day: {item.requestedDay || "Not yet set"}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_400",
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              Time: {item.requestedTime || "Not yet set"}
            </Text>

            <Text
              style={{
                fontFamily: "Kyiv_700",
                fontSize: 13,
                color:
                  item.status === "accepted"
                    ? "#43A047"
                    : item.status === "completed"
                    ? "#1E88E5"
                    : item.status === "cancelled"
                    ? "#E53935"
                    : "#FB8C00",
              }}
            >
              Status: {item.status.toUpperCase()}
            </Text>

            <Pressable
              onPress={() => openConversationFromBooking(item)}
              style={{
                marginTop: 14,
                backgroundColor: theme.colors.primary,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  color: "#fff",
                  fontSize: 14,
                }}
              >
                Open Conversation
              </Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}