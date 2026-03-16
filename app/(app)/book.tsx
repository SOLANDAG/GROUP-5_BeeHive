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
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Book() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // remove cancelled/completed bookings
        .filter(
          (b: any) =>
            b.status !== "cancelled" &&
            b.status !== "completed"
        )
        // newest first
        .sort((a: any, b: any) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });

      setBookings(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cancelBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "cancelled",
      });
    } catch (e) {
      console.log(e);
    }
  };

  const markDone = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
      });
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
          No active bookings yet.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookings.map((item) => {
            const date =
              item.date || item.bookingDate || "Date not set";

            const time =
              item.time || item.bookingTime || "Time not set";

            return (
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
                <Text
                  style={[
                    styles.date,
                    { color: theme.colors.text },
                  ]}
                >
                  {date}
                </Text>

                <Text
                  style={[
                    styles.title,
                    { color: theme.colors.primary },
                  ]}
                >
                  {item.businessName || "Service"}
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
                  {time}
                </Text>

                <Text
                  style={{
                    fontFamily: "Kyiv_700",
                    color: theme.colors.text,
                    marginTop: 8,
                  }}
                >
                  Price: ₱{item.price ?? 0}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => cancelBooking(item.id)}
                    style={[
                      styles.cancelBtn,
                      { backgroundColor: "#C62828" },
                    ]}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontFamily: "Kyiv_700",
                      }}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => markDone(item.id)}
                    style={[
                      styles.doneBtn,
                      { backgroundColor: "#2E7D32" },
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
            );
          })}
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});