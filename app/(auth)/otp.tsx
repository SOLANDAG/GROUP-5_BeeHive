import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function OtpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const expectedOtp =
    typeof params.otp === "string" ? params.otp : "";

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(expectedOtp);
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(15);
  const [canResend, setCanResend] = useState(false);

  const bannerTop = useRef(new Animated.Value(-150)).current;
  const [showBanner, setShowBanner] = useState(false);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const showNotification = (code: string) => {
    setGeneratedOtp(code);
    setShowBanner(true);

    Animated.sequence([
      Animated.timing(bannerTop, {
        toValue: 60,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.delay(3500),
      Animated.timing(bannerTop, {
        toValue: -150,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowBanner(false);
    });
  };

  useEffect(() => {
    if (generatedOtp) {
      showNotification(generatedOtp);
    }
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = () => {
    Keyboard.dismiss();

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.trim() !== generatedOtp) {
      setError("Incorrect OTP.");
      return;
    }

    router.replace("/(app)/home");
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    const newOtp = generateOtp();

    setGeneratedOtp(newOtp);
    setTimer(15);
    setCanResend(false);

    showNotification(newOtp);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: theme.colors.bg,
        }}
      >
        {showBanner && (
          <Animated.View
            style={{
              position: "absolute",
              top: bannerTop,
              left: 16,
              right: 16,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 14,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
              zIndex: 999,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: 14,
                marginBottom: 3,
              }}
            >
              BeeHive
            </Text>

            <Text style={{ fontSize: 13 }}>
              Your verification code is {generatedOtp}
            </Text>
          </Animated.View>
        )}

        <Text
          style={{
            fontFamily: "Kyiv_700",
            fontSize: 26,
            marginBottom: 10,
            color: theme.colors.text,
          }}
        >
          Enter OTP
        </Text>

        <Text
          style={{
            fontFamily: "Kyiv_400",
            fontSize: 14,
            marginBottom: 20,
            opacity: 0.8,
            color: theme.colors.text,
          }}
        >
          Please enter the verification code sent to you.
        </Text>

        <TextInput
          placeholder="6-digit OTP"
          placeholderTextColor={theme.colors.placeholder}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleVerifyOtp}
          style={{
            backgroundColor: theme.colors.card,
            padding: 14,
            borderRadius: 16,
            marginBottom: 12,
            fontFamily: "Kyiv_400",
            color: theme.colors.text,
            letterSpacing: 4,
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
          onPress={handleVerifyOtp}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: "Kyiv_300", color: "#fff" }}>
            Verify OTP
          </Text>
        </Pressable>

        <View
          style={{
            marginTop: 20,
            alignItems: "center",
          }}
        >
          {canResend ? (
            <Pressable onPress={handleResendOtp}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontFamily: "Kyiv_500",
                }}
              >
                Resend Code
              </Text>
            </Pressable>
          ) : (
            <Text
              style={{
                opacity: 0.7,
                fontFamily: "Kyiv_400",
              }}
            >
              Resend code in {timer}s
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            router.replace("/(auth)/login");
          }}
          style={{
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Kyiv_500",
              color: theme.colors.primary,
            }}
          >
            ← Return to Login
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}