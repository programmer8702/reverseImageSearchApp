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

import { sendForgotPasswordOTP } from "../../services/auth_api";

export default function ForgotPasswordScreen({ navigation }: any) {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {

        if (!email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        try {
            setLoading(true);

            const response = await sendForgotPasswordOTP(email);
            if (response.data.success) {
                navigation.navigate("OtpScreen", {
                    email: email,
                    forgot: true,

                });
            }
            else{
                Alert.alert("Error", response.data.message || "Failed to send OTP");
            }


        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>

            <Text style={styles.title}>Forgot Password</Text>

            <Text style={styles.subtitle}>
                Enter your email and we will send you a verification code
            </Text>

            <Text style={styles.label}>Email</Text>

            <TextInput
                placeholder="you@example.com"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity
                style={{ width: "100%" }}
                onPress={handleSendOtp}
                disabled={loading}
            >
                <LinearGradient
                    colors={["#2563EB", "#1E40AF"]}
                    style={[styles.button, { opacity: loading ? 0.85 : 1 }]}
                >
                    {loading
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.buttonText}>Send OTP</Text>}
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

    input: {
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 20,
        fontSize: 16
    },

    button: {
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center"
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    }

});