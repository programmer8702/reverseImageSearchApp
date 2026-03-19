import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function CustomSplash() {
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true
    }).start();
  }, []);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <LinearGradient
      colors={["#3B82F6", "#2563EB"]}
      style={styles.container}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.centerContent}>
          
          <View style={styles.logoBox}>
            <Ionicons name="scan-outline" size={40} color="#2563EB" />
          </View>

          <Text style={styles.title}>VisionSearch AI</Text>
          <Text style={styles.subtitle}>Search with your eyes</Text>
        </View>
      </Animated.View>

      <View style={styles.bottomSection}>
        <Text style={styles.initializing}>INITIALIZING</Text>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { width: widthInterpolated }]}
          />
        </View>

        <Text style={styles.powered}>POWERED BY VISION AI</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  centerContent: {
    alignItems: "center"
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700"
  },
  subtitle: {
    color: "#DCEBFF",
    marginTop: 6,
    fontSize: 14
  },
  bottomSection: {
    position: "absolute",
    bottom: 80,
    width: "75%",
    alignItems: "center"
  },
  initializing: {
    color: "#DCEBFF",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10
  },
  progressContainer: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden"
  },
  progressBar: {
    height: 3,
    backgroundColor: "white",
    borderRadius: 2
  },
  powered: {
    marginTop: 14,
    color: "#BFD8FF",
    fontSize: 10,
    letterSpacing: 1.2
  }
});