import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PackagesScreen() {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "0",
      features: [
        "10 Searches per day",
        "Similar Images",
        "Limited History",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: yearly ? "49" : "5",
      features: [
        "Unlimited Searches",
        "Face Search",
        "Duplicate Detection",
        "Full History Access",
        "Save Collections",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: yearly ? "99" : "9",
      features: [
        "Everything in Pro",
        "Priority Processing",
        "API Access",
        "Advanced Analytics",
      ],
      popular: false,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Text style={styles.title}>Upgrade Your Power</Text>
      <Text style={styles.subtitle}>
        Unlock unlimited face search and advanced detection tools.
      </Text>

      {/* Billing Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={!yearly ? styles.activeToggle : styles.inactiveToggle}>
          Monthly
        </Text>

        <TouchableOpacity
          style={[
            styles.switch,
            yearly && { backgroundColor: "#2563EB" },
          ]}
          onPress={() => setYearly(!yearly)}
        >
          <View
            style={[
              styles.switchCircle,
              yearly && { alignSelf: "flex-end" },
            ]}
          />
        </TouchableOpacity>

        <Text style={yearly ? styles.activeToggle : styles.inactiveToggle}>
          Yearly
        </Text>
      </View>

      {/* Plans */}
      {plans.map((plan, index) => (
        <View
          key={index}
          style={[
            styles.card,
            plan.popular && styles.popularCard,
          ]}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
          )}

          <Text style={styles.planName}>{plan.name}</Text>

          <Text style={styles.price}>
            ${plan.price}
            <Text style={styles.duration}>
              /{yearly ? "year" : "month"}
            </Text>
          </Text>

          {/* Features */}
          {plan.features.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#2563EB"
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          {/* Button */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={
                plan.popular
                  ? ["#2563EB", "#1E40AF"]
                  : ["#CBD5E1", "#94A3B8"]
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {plan.name === "Free"
                  ? "Current Plan"
                  : "Get Started"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.footer}>
        Secure payments. Cancel anytime.
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginBottom: 25,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  activeToggle: {
    color: "#2563EB",
    fontWeight: "600",
  },
  inactiveToggle: {
    color: "#94A3B8",
  },
  switch: {
    width: 50,
    height: 26,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
    justifyContent: "center",
    padding: 3,
  },
  switchCircle: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  popularBadge: {
    alignSelf: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  planName: {
    fontSize: 20,
    fontWeight: "600",
  },
  price: {
    fontSize: 26,
    fontWeight: "700",
    marginVertical: 10,
  },
  duration: {
    fontSize: 14,
    color: "#64748B",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  featureText: {
    marginLeft: 8,
    color: "#334155",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    color: "#94A3B8",
  },
});