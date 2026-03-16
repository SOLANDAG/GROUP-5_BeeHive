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
  serverTimestamp,
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

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .sort((a: any, b: any) => {
            const ta = a.createdAt?.seconds || 0;
            const tb = b.createdAt?.seconds || 0;
            return tb - ta;
          });

        setBookings(list);
        setLoading(false);
      },
      (err) => {
        console.log("Book snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const cancelBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.log("Cancel error:", e);
    }
  };

  const markDone = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.log("Done error:", e);
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
          No bookings yet.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookings.map((item) => {
            const date =
              item.date ||
              item.bookingDate ||
              item.scheduledDate ||
              "Date not set";

            const time =
              item.time ||
              item.bookingTime ||
              item.scheduledTime ||
              "Time not set";

            const status = item.status || "pending";

            const disabled =
              status === "cancelled" || status === "completed";

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

                <Text
                  style={{
                    fontFamily: "Kyiv_600",
                    marginTop: 6,
                    color:
                      status === "cancelled"
                        ? "#E53935"
                        : status === "completed"
                        ? "#43A047"
                        : "#FB8C00",
                  }}
                >
                  Status: {status}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    disabled={disabled}
                    onPress={() => cancelBooking(item.id)}
                    style={[
                      styles.cancelBtn,
                      { backgroundColor: "#C62828", opacity: disabled ? 0.5 : 1 },
                    ]}
                  >
                    <Text style={{ color: "#fff", fontFamily: "Kyiv_700" }}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={disabled}
                    onPress={() => markDone(item.id)}
                    style={[
                      styles.doneBtn,
                      { backgroundColor: "#2E7D32", opacity: disabled ? 0.5 : 1 },
                    ]}
                  >
                    <Text style={{ color: "#fff", fontFamily: "Kyiv_700" }}>
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