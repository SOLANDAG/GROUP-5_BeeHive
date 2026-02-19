import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  ImageBackground,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { auth } from "@/lib/firebase";

const { width } = Dimensions.get("window");

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 105;

export default function Home() {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [typedText, setTypedText] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  const fullText = "How can BeeHive assist you today?";
  const username = auth.currentUser?.displayName || "Guest";

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* HEADER CARD */}
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

          {/* GREETING */}
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

          {/* TYPED QUESTION (HANDYCART EXACT LOGIC) */}
          {typedText.length > 0 && (
            <Text style={styles.typedText}>
              {renderTypedText()}
            </Text>
          )}

          {showTyping && (
            <Text style={styles.typedText}>
              {renderTypedText()}
            </Text>
          )}

          {/* SEARCH BAR */}
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

      {/* SCROLL AREA */}
      <Animated.ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          />
        ))}
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
