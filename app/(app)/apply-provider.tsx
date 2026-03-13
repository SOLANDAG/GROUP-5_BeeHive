import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ApplyProviderScreen() {
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  const [status, setStatus] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  const [startTimeDate, setStartTimeDate] = useState<Date>(new Date());
  const [endTimeDate, setEndTimeDate] = useState<Date>(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  useEffect(() => {
    const loadApplication = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "providerApplications", user.uid));

        if (snap.exists()) {
          const data = snap.data();

          setStatus(data.status || null);
          setBusinessName(data.businessName || "");
          setCategory(data.category || "");
          setDescription(data.description || "");
          setLocation(data.location || "");
          setPrice(
            data.price !== undefined && data.price !== null
              ? String(data.price)
              : ""
          );
          setAvailableDays(data.availableDays || []);

          if (data.startTime) {
            // keep display from Firestore; picker still starts on current time
          }
          if (data.endTime) {
            // same
          }
        }
      } catch (error) {
        console.log("Load provider application error:", error);
      }
    };

    loadApplication();
  }, [user]);

  const handleApply = async () => {
    if (!user) {
      Alert.alert("You must be logged in.");
      return;
    }

    if (!businessName || !category || !description || !price) {
      Alert.alert("Please fill all required fields.");
      return;
    }

    if (availableDays.length === 0) {
      Alert.alert("Please select at least one available day.");
      return;
    }

    const numericPrice = Number(price);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Please enter a valid price.");
      return;
    }

    try {
      const existing = await getDoc(doc(db, "providerApplications", user.uid));

      if (existing.exists()) {
        const data = existing.data();
        if (data.status === "approved") {
          Alert.alert("You are already an approved provider.");
          return;
        }
      }

      await setDoc(
        doc(db, "providerApplications", user.uid),
        {
          userId: user.uid,
          businessName,
          category,
          description,
          location,
          price: numericPrice,
          availableDays,
          startTime: formatTime(startTimeDate),
          endTime: formatTime(endTimeDate),
          status: "pending",
          updatedAt: serverTimestamp(),
          createdAt: existing.exists()
            ? existing.data()?.createdAt || serverTimestamp()
            : serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "users", user.uid),
        {
          providerStatus: "pending",
        },
        { merge: true }
      );

      setStatus("pending");
      Alert.alert("Application submitted.");
    } catch (error) {
      console.log("Application submit error:", error);
      Alert.alert("Failed to submit application.");
    }
  };

  const cancelApplication = async () => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "providerApplications", user.uid));
      await setDoc(
        doc(db, "users", user.uid),
        {
          providerStatus: "none",
        },
        { merge: true }
      );

      setStatus(null);
      setBusinessName("");
      setCategory("");
      setDescription("");
      setLocation("");
      setPrice("");
      setAvailableDays([]);

      Alert.alert("Application cancelled.");
    } catch (error) {
      console.log("Cancel application error:", error);
      Alert.alert("Failed to cancel application.");
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 24,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Apply as Service Provider
      </Text>

      {status === "pending" && (
        <Text
          style={{
            color: "#FB8C00",
            marginBottom: 20,
            fontFamily: "Kyiv_600",
          }}
        >
          You can still edit your application while it is pending review.
        </Text>
      )}

      <TextInput
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
        placeholderTextColor={theme.colors.placeholder}
        returnKeyType="next"
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <TextInput
        placeholder="Service Category"
        value={category}
        onChangeText={setCategory}
        placeholderTextColor={theme.colors.placeholder}
        returnKeyType="next"
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <TextInput
        placeholder="Service Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor={theme.colors.placeholder}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          minHeight: 100,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <TextInput
        placeholder="Business Location"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor={theme.colors.placeholder}
        returnKeyType="next"
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <TextInput
        placeholder="Price (example: 500)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor={theme.colors.placeholder}
        returnKeyType="done"
        onSubmitEditing={handleApply}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 20,
          color: theme.colors.text,
          fontFamily: "Kyiv_400",
        }}
      />

      <Text
        style={{
          fontFamily: "Kyiv_600",
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        Available Days
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {DAYS.map((day) => {
          const selected = availableDays.includes(day);

          return (
            <Pressable
              key={day}
              onPress={() => toggleDay(day)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: selected ? theme.colors.primary : theme.colors.card,
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: selected ? "#fff" : theme.colors.text,
                  fontFamily: "Kyiv_400",
                }}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={{
          fontFamily: "Kyiv_600",
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        Available Time
      </Text>

      <Pressable
        onPress={() => setShowStartPicker(true)}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: theme.colors.text, fontFamily: "Kyiv_400" }}>
          Start Time: {formatTime(startTimeDate)}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setShowEndPicker(true)}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: theme.colors.text, fontFamily: "Kyiv_400" }}>
          End Time: {formatTime(endTimeDate)}
        </Text>
      </Pressable>

      {showStartPicker && (
        <View
          style={{
            backgroundColor: theme.colors.card,
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <DateTimePicker
            value={startTimeDate}
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) setStartTimeDate(selectedDate);
            }}
          />

          <Pressable
            onPress={() => setShowStartPicker(false)}
            style={{
              marginTop: 10,
              backgroundColor: theme.colors.primary,
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>Done</Text>
          </Pressable>
        </View>
      )}

      {showEndPicker && (
        <View
          style={{
            backgroundColor: theme.colors.card,
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <DateTimePicker
            value={endTimeDate}
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) setEndTimeDate(selectedDate);
            }}
          />

          <Pressable
            onPress={() => setShowEndPicker(false)}
            style={{
              marginTop: 10,
              backgroundColor: theme.colors.primary,
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>Done</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={handleApply}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
          {status === "pending" ? "Update Application" : "Submit Application"}
        </Text>
      </Pressable>

      {status === "pending" && (
        <Pressable
          onPress={cancelApplication}
          style={{
            marginTop: 10,
            backgroundColor: "#E53935",
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
            Cancel Application
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}