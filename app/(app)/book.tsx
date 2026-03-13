import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Book() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "bookings"),
        where("customerId", "==", user.uid),
        where("status", "==", "accepted")
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(list);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);

      await updateDoc(bookingRef, {
        status: "cancelled",
      });

      fetchBookings();
    } catch (e) {
      console.log(e);
    }
  };

  const markDone = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);

      await updateDoc(bookingRef, {
        status: "completed",
      });

      fetchBookings();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 20,
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
        My Bookings
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : bookings.length === 0 ? (
        <Text
          style={{
            fontFamily: "Kyiv_400",
            color: theme.colors.text,
            opacity: 0.7,
          }}
        >
          No accepted bookings yet.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookings.map((item) => (
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
              <Text style={styles.date}>
                {item.scheduledDate || "Date not set"}
              </Text>

              <Text
                style={[
                  styles.title,
                  { color: theme.colors.primary },
                ]}
              >
                {item.businessName}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.text },
                ]}
              >
                Appointment
              </Text>

              <Text
                style={[
                  styles.time,
                  { color: theme.colors.text },
                ]}
              >
                {item.scheduledTime || "Time not set"}
              </Text>

              {/* PRICE */}

              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  color: theme.colors.text,
                  marginTop: 8,
                }}
              >
                Price: ₱{item.price ?? 0}
              </Text>

              {/* ACTION BUTTONS */}

              <View style={styles.actions}>
                <Pressable
                  onPress={() => cancelBooking(item.id)}
                  style={[
                    styles.cancelBtn,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontFamily: "Kyiv_600",
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => markDone(item.id)}
                  style={[
                    styles.doneBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "Kyiv_700",
                    }}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
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

  date: {
    fontFamily: "Kyiv_700",
    fontSize: 18,
    marginBottom: 4,
  },

  title: {
    fontFamily: "Kyiv_700",
    fontSize: 20,
  },

  subtitle: {
    fontFamily: "Kyiv_400",
    marginTop: 4,
  },

  time: {
    fontFamily: "Kyiv_600",
    marginTop: 6,
  },

  actions: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
  },

  cancelBtn: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});