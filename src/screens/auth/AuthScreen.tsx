import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../context/AuthContext";
import { loginUser, registerUser, sendEmailVerificationOTP } from "../../services/auth_api";
import { Ionicons } from "@expo/vector-icons";

export default function AuthScreen({ navigation, route }: any) {
  const { login } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isLogin ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isLogin]);

  const slide = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      let accessToken, refreshToken, response;

      if (isLogin) {
        response = await loginUser(email, password);
        //console.log("Login Response:", response);
        if (response.code && response.code !== 200) {
          throw new Error(response.message || "Login failed");
        }
        accessToken = response.token;
        refreshToken = response.refreshToken;
        if (!accessToken || !refreshToken) {
          throw new Error("Invalid token response");
        }
        if (!response.emailVerified) {
          await sendEmailVerificationOTP(accessToken);
          navigation.navigate("OtpScreen", { email });
          return;
        }
        await login(accessToken, refreshToken);
        // else{
        //   navigation.navigate("MainTabs");
        //   return;
        // }
        
      }
      else {
        response = await registerUser(email, password, firstName, lastName, phone);
        if (response.code && response.code !== 201) {
          throw new Error(response.message || "Registration failed");
        }
        navigation.navigate("OtpScreen", { email });
        return;
        // accessToken = response.token;
        // refreshToken = response.refreshToken;
      }



    } catch (error: any) {
      Alert.alert("Authentication Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>👁️</Text>
              </View>
            </View>

            <Text style={styles.title}>VisionSearch AI</Text>
            <Text style={styles.subtitle}>
              Search faces. Detect duplicates. Discover identities.
            </Text>

            {/* Toggle */}
            <View style={styles.switchContainer}>
              <Animated.View
                style={[
                  styles.animatedBackground,
                  { transform: [{ translateX: slide }] },
                ]}
              />

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(true)}
              >
                <Text style={isLogin ? styles.activeSwitchText : styles.switchText}>
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(false)}
              >
                <Text style={!isLogin ? styles.activeSwitchText : styles.switchText}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.inputContainer}>
              {isLogin ? null : (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.label}>First Name</Text>
                      <TextInput
                        placeholder="First Name"
                        style={styles.input}
                        autoCapitalize="words"
                        keyboardType="default"
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.label}>Last Name</Text>
                      <TextInput
                        placeholder="Last Name"
                        style={styles.input}
                        autoCapitalize="words"
                        keyboardType="default"
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>

                </>
              )}
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="you@example.com"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {!isLogin && (
                <>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    placeholder="+1 234 567 890"
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </>
              )}

              <Text style={styles.label}>Password</Text>

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

              {isLogin && (
                <TouchableOpacity
                  style={{ alignSelf: "flex-end", marginBottom: 20 }}
                  onPress={() => navigation.navigate("ForgotPassword", { 'forgot': true, email })}
                >
                  <Text style={styles.forgot}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {!isLogin && (
                <>
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
                </>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              style={{ width: "100%" }}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2563EB", "#1E40AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, { opacity: loading ? 0.85 : 1 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By continuing, you agree to our Terms & Privacy Policy.
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: { marginBottom: 20 },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  logoIcon: { fontSize: 46 },
  title: { fontSize: 28, fontWeight: "700", color: "#0F172A" },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 6,
    marginBottom: 30,
  },
  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
  },
  animatedBackground: {
    position: "absolute",
    width: 150,
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  switchButton: { width: 150, paddingVertical: 12, alignItems: "center" },
  switchText: { color: "#64748B", fontWeight: "500" },
  activeSwitchText: { color: "#0F172A", fontWeight: "600" },
  inputContainer: { width: "100%", marginBottom: 25 },
  label: { color: "#334155", marginBottom: 6, fontSize: 14 },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
    fontSize: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  footerText: {
    marginTop: 30,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
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

  forgot: {
    color: "#2563EB",
    fontWeight: "500"
  },
});