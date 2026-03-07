import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { verifyOtp, resendOtp } from "../../services/auth_api";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";

export default function OtpScreen({ route }: any) {
  const { email } = route.params;
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    console.log("AccessToken Stored is: " + await SecureStore.getItemAsync("access_token"));
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp(otp);
      console.log("OTP Verification Response:", response);
      const { accessToken, refreshToken } = response;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid token response");
      }

      await login(accessToken, refreshToken);
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      let accessToken = await SecureStore.getItemAsync("access_token");
      if (!accessToken) {
        Alert.alert("Error", "Access token not found");
        return;
      }
      await resendOtp(accessToken);
      Alert.alert("OTP Resent", "Check your email again");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>

      <TextInput
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        placeholder="------"
      />

      <TouchableOpacity
        style={{ width: "100%" }}
        onPress={handleVerify}
        disabled={loading}
      >
        <LinearGradient
          colors={["#2563EB", "#1E40AF"]}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resend}>Resend OTP</Text>
      </TouchableOpacity>
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
  otpInput: {
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 8,
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
    marginTop: 20,
    color: "#2563EB",
    fontWeight: "500",
  },
});