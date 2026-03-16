import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Calendar } from "react-native-calendars";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function ScheduleScreen() {

  const { theme } = useTheme();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {

    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(list);

      const marks: any = {};

      list.forEach((b: any) => {

        const date =
          b.date ||
          b.bookingDate ||
          b.scheduledDate;

        if (!date) return;

        marks[date] = {
          marked: true,
          dotColor:
            b.status === "cancelled"
              ? "#E53935"
              : b.status === "completed"
              ? "#43A047"
              : "#FB8C00",
        };
      });

      setMarkedDates(marks);
      setLoading(false);

    });

    return () => unsubscribe();

  }, [user?.uid]);

  const dayBookings = bookings.filter((b) => {
    const d =
      b.date ||
      b.bookingDate ||
      b.scheduledDate;

    return d === selectedDate;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            hideExtraDays={true}
            theme={{
              calendarBackground: theme.colors.bg,
              dayTextColor: theme.colors.text,
              monthTextColor: theme.colors.text,
              arrowColor: theme.colors.primary,
              textMonthFontFamily: "Kyiv_700",
              textDayFontFamily: "Kyiv_400",
              textDayHeaderFontFamily: "Kyiv_600",
            }}
          />

          <ScrollView style={{ padding: 20 }}>
            {!selectedDate ? (
              <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, opacity: 0.7 }}>
                Tap a day to view appointments.
              </Text>
            ) : dayBookings.length === 0 ? (
              <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, opacity: 0.7 }}>
                No bookings on this day.
              </Text>
            ) : (
              dayBookings.map((b) => (
                <View
                  key={b.id}
                  style={{
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ fontFamily: "Kyiv_700", color: theme.colors.text, fontSize: 16 }}>
                    {b.businessName || "Service"}
                  </Text>

                  <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, marginTop: 4 }}>
                    Time: {b.time || b.bookingTime || b.scheduledTime || "Not set"}
                  </Text>

                  <Text style={{ fontFamily: "Kyiv_400", color: theme.colors.text, marginTop: 4 }}>
                    Price: ₱{b.price ?? 0}
                  </Text>

                  <Text
                    style={{
                      fontFamily: "Kyiv_600",
                      marginTop: 6,
                      color:
                        b.status === "cancelled"
                          ? "#E53935"
                          : b.status === "completed"
                          ? "#43A047"
                          : "#FB8C00",
                    }}
                  >
                    Status: {b.status}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}