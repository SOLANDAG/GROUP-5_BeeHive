import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  ImageBackground,
  StyleSheet,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";

import {
  collection,
  getDocs,
  query,
  addDoc,
  serverTimestamp,
  where,
  deleteDoc,
} from "firebase/firestore";

const { width } = Dimensions.get("window");

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 105;

export default function Home() {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [typedText, setTypedText] = useState("");
  const fullText = "How can BeeHive assist you today?";
  const username = auth.currentUser?.displayName || "Guest";

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [favorites, setFavorites] = useState<string[]>([]);

  const [loadingChat, setLoadingChat] = useState(false);

  const loadFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const ids = snap.docs.map((doc) => doc.data().serviceId as string);

      setFavorites(ids);
    } catch (error) {
      console.log("Load favorites error:", error);
    }
  };

  const toggleFavorite = async (serviceId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", user.uid),
        where("serviceId", "==", serviceId)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        await deleteDoc(snap.docs[0].ref);

        setFavorites((prev) => prev.filter((id) => id !== serviceId));
      } else {
        await addDoc(collection(db, "favorites"), {
          userId: user.uid,
          serviceId,
          createdAt: serverTimestamp(),
        });

        setFavorites((prev) => [...prev, serviceId]);
      }
    } catch (error) {
      console.log("Toggle favorite error:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const q = query(collection(db, "services"));
      const snap = await getDocs(q);

      const user = auth.currentUser;

      const list = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (service: any) =>
            service.providerId !== user?.uid &&
            service.isActive === true
        );

      setServices(list);
    } catch (e) {
      console.log("Fetch services error:", e);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
    loadFavorites();
  }, []);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    let timeout: any;
    let hasTyped = false;

    const listener = scrollY.addListener(({ value }) => {
      if (value > 60 && !hasTyped) {
        hasTyped = true;

        let i = 0;

        const typeNext = () => {
          if (i <= fullText.length) {
            setTypedText(fullText.slice(0, i));
            i++;
            timeout = setTimeout(typeNext, 40);
          }
        };

        typeNext();
      }

      if (value <= 60) {
        hasTyped = false;
        setTypedText("");
      }
    });

    return () => {
      scrollY.removeListener(listener);
      if (timeout) clearTimeout(timeout);
    };
  }, [scrollY]);

  const renderTypedText = () => {
    const beeIndex = typedText.indexOf("BeeHive");

    if (beeIndex === -1) {
      return (
        <Text style={{ color: theme.colors.greetingQuestion }}>
          {typedText}
        </Text>
      );
    }

    return (
      <>
        <Text style={{ color: theme.colors.greetingQuestion }}>
          {typedText.slice(0, beeIndex)}
        </Text>

        <Text style={{ color: theme.colors.primary }}>
          {typedText.slice(beeIndex, beeIndex + 7)}
        </Text>

        <Text style={{ color: theme.colors.greetingQuestion }}>
          {typedText.slice(beeIndex + 7)}
        </Text>
      </>
    );
  };

  const handleMessage = async (service: any) => {
    const user = auth.currentUser;
    if (!user) return;
    if (loadingChat) return;

    setLoadingChat(true);

    try {
      const existingQuery = query(
        collection(db, "conversations"),
        where("serviceId", "==", service.id),
        where("customerId", "==", user.uid)
      );

      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        const existingConversation = existingSnap.docs[0];
        const existingData = existingConversation.data();

        router.push({
          pathname: "/(app)/chat",
          params: {
            conversationId: existingConversation.id,
            bookingId: existingData.bookingId,
          },
        });

        setLoadingChat(false);
        return;
      }

      const bookingRef = await addDoc(collection(db, "bookings"), {
        serviceId: service.id,
        providerId: service.providerId,
        customerId: user.uid,
        businessName: service.businessName,
        category: service.category,
        description: service.description,
        price: service.price ?? 0,
        status: "pending",
        scheduledDate: "",
        scheduledTime: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const conversationRef = await addDoc(collection(db, "conversations"), {
        bookingId: bookingRef.id,
        serviceId: service.id,
        providerId: service.providerId,
        customerId: user.uid,
        participants: [service.providerId, user.uid],
        businessName: service.businessName,
        lastMessage: `Hello! I want to inquire about ${service.businessName}.`,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "messages"), {
        conversationId: conversationRef.id,
        senderId: user.uid,
        text: `Hello! I want to inquire about ${service.businessName}.`,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: service.providerId,
        title: "New Booking Request",
        body: `${user.email || "A customer"} messaged about ${service.businessName}.`,
        type: "new_booking",
        bookingId: bookingRef.id,
        conversationId: conversationRef.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      router.push({
        pathname: "/(app)/chat",
        params: {
          conversationId: conversationRef.id,
          bookingId: bookingRef.id,
        },
      });
    } catch (e) {
      console.log("Message error", e);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Animated.View
        style={[
          styles.headerCard,
          {
            height: headerHeight,
            shadowColor: theme.colors.text,
          },
        ]}
      >
        <ImageBackground
          source={theme.greetingImage}
          style={styles.imageBackground}
        >
          <LinearGradient
            colors={["rgba(20,11,2,0.75)", "transparent"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradient}
          />

          <Animated.View
            style={[
              styles.greetingWrapper,
              { opacity: greetingOpacity },
            ]}
          >
            <Text
              style={[
                styles.welcomeText,
                { color: theme.colors.greetingTitle },
              ]}
            >
              Welcome,
            </Text>

            <Text
              style={[
                styles.usernameText,
                { color: theme.colors.greetingName },
              ]}
            >
              {username}
            </Text>
          </Animated.View>

          {typedText.length > 0 && (
            <Text style={styles.typedText}>
              {renderTypedText()}
            </Text>
          )}

          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: theme.colors.searchBg },
              ]}
            >
              <Ionicons
                name="search"
                size={28}
                color={theme.colors.iconInactive}
                style={{ marginRight: 8 }}
              />

              <TextInput
                placeholder="Search"
                placeholderTextColor={theme.colors.placeholder}
                style={[
                  styles.searchInput,
                  { color: theme.colors.text },
                ]}
              />
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Text
          style={{
            fontFamily: "Kyiv_700",
            fontSize: 22,
            color: theme.colors.text,
            marginBottom: 15,
          }}
        >
          Available Services
        </Text>

        {loadingServices ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : services.length === 0 ? (
          <Text
            style={{
              fontFamily: "Kyiv_400",
              color: theme.colors.text,
              opacity: 0.7,
            }}
          >
            No approved services yet.
          </Text>
        ) : (
          services.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  padding: 18,
                  height: "auto",
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
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

                <Pressable onPress={() => toggleFavorite(item.id)}>
                  <FontAwesome
                    name={favorites.includes(item.id) ? "heart" : "heart-o"}
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
                onPress={() => {
                  if (!loadingChat) handleMessage(item);
                }}
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
                  }}
                >
                  Message & Book
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    overflow: "hidden",
    elevation: 10,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  imageBackground: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  greetingWrapper: {
    zIndex: 1,
    marginBottom: 50,
    alignItems: "flex-end",
  },

  welcomeText: {
    fontSize: 38,
    fontFamily: "Fraunces_600",
  },

  usernameText: {
    fontSize: 40,
    fontFamily: "Fraunces_700",
  },

  typedText: {
    position: "absolute",
    bottom: 65,
    left: 20,
    right: 20,
    fontSize: 20,
    fontFamily: "Fraunces_500",
    zIndex: 3,
  },

  searchWrapper: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    zIndex: 2,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Kyiv_400",
  },

  card: {
    height: 100,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 15,
  },
});