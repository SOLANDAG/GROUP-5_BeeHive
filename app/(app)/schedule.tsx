import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type BookingItem = {
  id: string;
  businessName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
};

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "bookings"),
        where("customerId", "==", user.uid)
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));

      setBookings(list);
    } catch (error) {
      console.log("Fetch schedule bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const bookingMap = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};

    bookings.forEach((booking) => {
      if (!booking.scheduledDate) return;

      if (!map[booking.scheduledDate]) {
        map[booking.scheduledDate] = [];
      }

      map[booking.scheduledDate].push(booking);
    });

    return map;
  }, [bookings]);

  const calendarCells = [];
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - firstDayIndex + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      calendarCells.push(null);
    } else {
      const monthString = String(month + 1).padStart(2, "0");
      const dayString = String(dayNumber).padStart(2, "0");
      const dateKey = `${year}-${monthString}-${dayString}`;
      const dayBookings = bookingMap[dateKey] || [];

      calendarCells.push({
        dayNumber,
        dateKey,
        bookings: dayBookings,
      });
    }
  }

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
          marginBottom: 16,
        }}
      >
        Schedule
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
          style={{
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.text }}>
            Prev
          </Text>
        </Pressable>

        <Text
          style={{
            fontFamily: "Kyiv_700",
            fontSize: 18,
            color: theme.colors.primary,
          }}
        >
          {monthLabel}
        </Text>

        <Pressable
          onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
          style={{
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontFamily: "Kyiv_600", color: theme.colors.text }}>
            Next
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View key={day} style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Kyiv_600",
                color: theme.colors.text,
                opacity: 0.8,
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {calendarCells.map((cell, index) => (
            <View
              key={index}
              style={{
                width: `${100 / 7}%`,
                padding: 4,
              }}
            >
              <View
                style={{
                  minHeight: 90,
                  backgroundColor: cell ? theme.colors.card : "transparent",
                  borderWidth: cell ? 1 : 0,
                  borderColor: theme.colors.border,
                  borderRadius: 14,
                  padding: 6,
                }}
              >
                {cell && (
                  <>
                    <Text
                      style={{
                        fontFamily: "Kyiv_700",
                        color: theme.colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {cell.dayNumber}
                    </Text>

                    {cell.bookings.slice(0, 2).map((booking) => (
                      <View
                        key={booking.id}
                        style={{
                          backgroundColor: theme.colors.primary,
                          borderRadius: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 4,
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            color: "#fff",
                            fontFamily: "Kyiv_600",
                            fontSize: 10,
                          }}
                        >
                          {booking.scheduledTime || "Time"}{" "}
                          {booking.businessName || "Appointment"}
                        </Text>
                      </View>
                    ))}

                    {cell.bookings.length > 2 && (
                      <Text
                        style={{
                          fontFamily: "Kyiv_400",
                          fontSize: 10,
                          color: theme.colors.text,
                          opacity: 0.7,
                        }}
                      >
                        +{cell.bookings.length - 2} more
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <Text
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontFamily: "Kyiv_700",
          fontSize: 18,
          color: theme.colors.text,
        }}
      >
        Upcoming Appointments
      </Text>

      {bookings.length === 0 ? (
        <Text
          style={{
            fontFamily: "Kyiv_400",
            color: theme.colors.text,
            opacity: 0.7,
          }}
        >
          No appointments yet.
        </Text>
      ) : (
        bookings
          .filter((item) => item.scheduledDate)
          .sort((a, b) =>
            `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(
              `${b.scheduledDate} ${b.scheduledTime}`
            )
          )
          .map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  color: theme.colors.primary,
                  marginBottom: 4,
                }}
              >
                {item.businessName || "Appointment"}
              </Text>

              <Text
                style={{
                  fontFamily: "Kyiv_400",
                  color: theme.colors.text,
                }}
              >
                {item.scheduledDate || "No date"} • {item.scheduledTime || "No time"}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontFamily: "Kyiv_400",
                  color: theme.colors.text,
                  opacity: 0.8,
                }}
              >
                Status: {item.status || "pending"}
              </Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}