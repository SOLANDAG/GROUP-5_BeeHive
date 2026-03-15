import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOtpBanner, setShowOtpBanner] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const bannerTop = useRef(new Animated.Value(-120)).current;

  const showTopBanner = (otpCode: string) => {
    setGeneratedOtp(otpCode);
    setShowOtpBanner(true);

    Animated.sequence([
      Animated.timing(bannerTop, {
        toValue: 50,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.delay(4000),
      Animated.timing(bannerTop, {
        toValue: -120,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowOtpBanner(false);

      router.replace({
        pathname: "/(auth)/otp",
        params: {
          otp: otpCode,
        },
      });
    });
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      const otpCode = generateOtp();

      router.replace({
        pathname: "/(auth)/otp",
        params: { otp: otpCode },
      });
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Account not found.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Login failed.");
      }
    }

    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: theme.colors.bg,
      }}
    >
      {showOtpBanner && (
        <Animated.View
          style={{
            position: "absolute",
            top: bannerTop,
            left: 20,
            right: 20,
            zIndex: 999,
            backgroundColor: theme.colors.primary,
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_700",
              color: "#fff",
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            BeeHive Verification Code
          </Text>

          <Text
            style={{
              fontFamily: "Kyiv_400",
              color: "#fff",
              fontSize: 13,
              opacity: 0.95,
            }}
          >
            Your OTP is: {generatedOtp}
          </Text>
        </Animated.View>
      )}

      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 26,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.colors.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        selectionColor={theme.colors.primary}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        selectionColor={theme.colors.primary}
        style={{
          backgroundColor: theme.colors.card,
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          fontFamily: "Kyiv_400",
          color: theme.colors.text,
        }}
      />

      {error ? (
        <Text
          style={{
            color: "#E53935",
            marginBottom: 12,
            fontFamily: "Kyiv_400",
          }}
        >
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={handleLogin}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ fontFamily: "Kyiv_300", color: "#fff" }}>Login</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/signup")}
        style={{ marginTop: 16 }}
      >
        <Text
          style={{
            fontFamily: "Kyiv_500",
            color: theme.colors.primary,
          }}
        >
          Create account
        </Text>
      </Pressable>
    </View>
  );
}