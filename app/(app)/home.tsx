import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  ImageBackground,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeProvider";

const { width } = Dimensions.get("window");

const GREETING_EXPANDED_HEIGHT = 240;
const GREETING_COLLAPSED_HEIGHT = 100;
const SCROLL_DISTANCE =
  GREETING_EXPANDED_HEIGHT - GREETING_COLLAPSED_HEIGHT;

export default function HomeScreen() {
  const { theme } = useTheme();
  const [displayName, setDisplayName] =
    useState<string>("");
  const [loading, setLoading] =
    useState<boolean>(true);

  const scrollY = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        router.replace("/(auth)/login" as any);
        return;
      }

      try {
        const snap = await getDoc(
          doc(db, "users", user.uid)
        );
        const data = snap.data() as any;

        const name =
          (data?.username &&
            data.username.trim()) ||
          (data?.firstName &&
            data.firstName.trim()) ||
          user.email ||
          "there";

        setDisplayName(name);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const animatedHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [
      GREETING_EXPANDED_HEIGHT,
      GREETING_COLLAPSED_HEIGHT,
    ],
    extrapolate: "clamp",
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const greetingTranslate = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor:
            theme.colors.bg,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          theme.colors.bg,
      }}
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={
          false
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          { useNativeDriver: false }
        )}
      >
        {/* SHADOW WRAPPER */}
        <View style={styles.shadowWrapper}>
          <Animated.View
            style={{
              height: animatedHeight,
              overflow: "hidden",
            }}
          >
            <ImageBackground
              source={
                theme.greetingImage
              }
              resizeMode="cover"
              style={
                styles.imageBackground
              }
            >
              {/* Right Gradient */}
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.55)",
                  "transparent",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={
                  styles.gradientOverlay
                }
              />

              {/* Greeting */}
              <Animated.View
                style={[
                  styles.greetingContainer,
                  {
                    opacity:
                      greetingOpacity,
                    transform: [
                      {
                        translateY:
                          greetingTranslate,
                      },
                    ],
                  },
                ]}
              >
                <Text
                  style={
                    styles.welcomeText
                  }
                >
                  Welcome,
                </Text>
                <Text
                  style={styles.nameText}
                >
                  {displayName}
                </Text>
              </Animated.View>

              {/* Search Pill */}
              <View
                style={
                  styles.searchWrapper
                }
              >
                <View
                  style={
                    styles.searchContainer
                  }
                >
                  <TextInput
                    placeholder="Search for a service..."
                    placeholderTextColor="#999"
                    style={
                      styles.searchInput
                    }
                  />
                </View>
              </View>
            </ImageBackground>
          </Animated.View>
        </View>

        {/* TEMP CONTENT */}
        <View
          style={{
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily:
                "Kyiv_600",
              marginBottom: 16,
              color:
                theme.colors.text,
            }}
          >
            Recommended for you
          </Text>

          {Array.from({
            length: 8,
          }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.demoCard,
                {
                  backgroundColor:
                    theme.colors.card,
                },
              ]}
            />
          ))}

          <View
            style={{ height: 100 }}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    backgroundColor:
      "transparent",
  },

  imageBackground: {
    flex: 1,
    justifyContent:
      "center",
    paddingHorizontal: 24,
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },

  greetingContainer: {
    position: "absolute",
    top: 60,
    right: 24,
    alignItems:
      "flex-end",
    maxWidth:
      width * 0.65,
  },

  welcomeText: {
    fontSize: 26,
    fontFamily:
      "Fraunces_600",
    color: "white",
  },

  nameText: {
    fontSize: 32,
    fontFamily:
      "Fraunces_700",
    color: "white",
  },

  searchWrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems:
      "center",
  },

  searchContainer: {
    width:
      width * 0.88,
    backgroundColor:
      "rgba(255,255,255,0.95)",
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  searchInput: {
    fontSize: 16,
    fontFamily:
      "Kyiv_400",
    color: "#222",
  },

  demoCard: {
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
});
