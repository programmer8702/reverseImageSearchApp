import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { resetPassword } from "../../services/auth_api";

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { email, resetToken } = route.params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleReset = async () => {

    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(resetToken, password);

      if (response.code !== 200) {
        throw new Error(response.message || "Password reset failed");
      }

      Alert.alert(
        "Success",
        "Password has been reset successfully",
        [
          {
            text: "Login",
            onPress: () => navigation.navigate("Auth")
          }
        ]
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      <Text style={styles.title}>Reset Password</Text>

      <Text style={styles.subtitle}>
        Enter a new password for {email}
      </Text>

      {/* PASSWORD */}
      <Text style={styles.label}>New Password</Text>

      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* CONFIRM PASSWORD */}
      <Text style={styles.label}>Confirm Password</Text>

      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="••••••••"
          secureTextEntry={!showConfirmPassword}
          style={styles.passwordInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={{ width: "100%" }}
        onPress={handleReset}
        disabled={loading}
      >
        <LinearGradient
          colors={["#2563EB", "#1E40AF"]}
          style={styles.button}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.buttonText}>Reset Password</Text>}
        </LinearGradient>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 40
  },

  subtitle: {
    color: "#64748B",
    marginTop: 10,
    marginBottom: 30
  },

  label: {
    color: "#334155",
    marginBottom: 6,
    fontSize: 14
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 18
  },

  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16
  },

  eyeIcon: {
    paddingHorizontal: 12
  },

  button: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  }

});