import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as SecureStore from "expo-secure-store";

import { AuthContext } from "../../context/AuthContext";
import { verifyOtp, resendOtp } from "../../services/auth_api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpScreen({ route }: any) {
  const { email } = route.params;
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);

  const [resendEnabled, setResendEnabled] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const inputs = useRef<TextInput[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  /* Shake animation */
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  /* OTP change */
  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1].focus();
    }

    const code = newOtp.join("");

    if (code.length === OTP_LENGTH && !code.includes("")) {
      handleVerify(code);
    }
  };

  /* Backspace navigation */
  const handleBackspace = (index: number) => {
    if (index > 0 && otp[index] === "") {
      inputs.current[index - 1].focus();
    }
  };

  /* Verify OTP */
  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("");

    if (code.length !== OTP_LENGTH) {
      Alert.alert("Invalid OTP", "Enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp(code);

      const { accessToken, refreshToken } = response;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid token response");
      }

      await login(accessToken, refreshToken);

    } catch (error: any) {
      triggerShake();
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  /* Clipboard paste */
  const pasteOtp = async () => {
    const text = await Clipboard.getStringAsync();

    if (/^\d{6}$/.test(text)) {
      const digits = text.split("");
      setOtp(digits);
      handleVerify(text);
    } else {
      Alert.alert("Clipboard", "No valid OTP found");
    }
  };

  /* Resend OTP */
  const handleResend = async () => {
    try {
      let accessToken = await SecureStore.getItemAsync("access_token");

      if (!accessToken) {
        Alert.alert("Error", "Access token not found");
        return;
      }

      await resendOtp(accessToken);

      Alert.alert("OTP Resent", "Check your email again");

      setResendEnabled(false);
      setTimerKey(prev => prev + 1);
      setOtp(Array(OTP_LENGTH).fill(""));

      inputs.current[0].focus();

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Verify Your Account</Text>

      <Text style={styles.subtitle}>
        Enter the code sent to {email}
      </Text>

      {/* OTP BOXES */}
      <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            style={[styles.otpBox, digit ? styles.otpFilled : null]}
            keyboardType="number-pad"
            maxLength={1}
            textContentType="oneTimeCode"
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") handleBackspace(index);
            }}
          />
        ))}
      </Animated.View>

      {/* PASTE BUTTON */}
      {/* <TouchableOpacity onPress={pasteOtp}>
        <Text style={styles.paste}>Paste Code</Text>
      </TouchableOpacity> */}

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        style={{ width: "100%" }}
        onPress={() => handleVerify()}
        disabled={loading}
      >
        <LinearGradient
          colors={["#2563EB", "#1E40AF"]}
          style={styles.button}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.buttonText}>Verify</Text>}
        </LinearGradient>
      </TouchableOpacity>

      {/* TIMER / RESEND */}
      {!resendEnabled ? (
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <CountdownCircleTimer
            key={timerKey}
            isPlaying
            duration={RESEND_SECONDS}
            size={80}
            strokeWidth={6}
            colors={["#2563EB", "#F7B801", "#EF4444"]}
            colorsTime={[60, 30, 0]}
            onComplete={() => {
              setResendEnabled(true);
              return { shouldRepeat: false };
            }}
          >
            {({ remainingTime }) => (
              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                {remainingTime}s
              </Text>
            )}
          </CountdownCircleTimer>

          <Text style={{ marginTop: 10, color: "#64748B" }}>
            You can resend OTP when timer ends
          </Text>
        </View>
      ) : (
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 40,
  },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginVertical: 20,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },

  otpBox: {
    width: 48,
    height: 58,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "#FFFFFF",
  },

  otpFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  paste: {
    marginBottom: 20,
    color: "#2563EB",
    fontWeight: "600"
  },

  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  resend: {
    marginTop: 25,
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 16
  }

});