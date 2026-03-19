import React, { useEffect, useRef,useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AuthContext } from "../context/AuthContext";


SplashScreen.preventAutoHideAsync();

export default function CustomSplash({ onFinish }: any) {
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { bootstrapAuth } = useContext(AuthContext);

  // useEffect(() => {
  //   Animated.timing(progress, {
  //     toValue: 1,
  //     duration: 2200,
  //     easing: Easing.inOut(Easing.ease),
  //     useNativeDriver: false
  //   }).start();

  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 1200,
  //     useNativeDriver: true
  //   }).start();

  //   setTimeout(async () => {
  //     await SplashScreen.hideAsync();
  //     onFinish();
  //   }, 2500);
  // }, []);

  useEffect(() => {
  const initializeApp = async () => {
    try {

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

      const user = await bootstrapAuth();

      await SplashScreen.hideAsync();

      if (!user) {
        onFinish("auth");
        return;
      }

      if (!user.emailVerified) {
        onFinish("verify");
        return;
      }

      onFinish("main");

    } catch (error) {
      //console.log("Splash bootstrap error:", error);
      onFinish("auth");
    }
  };

  initializeApp();
}, []);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "90%"]
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={{ alignItems: "center" }}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🎯</Text>
        </View>

        <Text style={styles.title}>VisionSearch</Text>
        <Text style={styles.subtitle}>Search with your eyes</Text>
        </View>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressBar, { width: widthInterpolated }]}
        />
      </View>

      <Text style={styles.powered}>POWERED BY VISION AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center"
  },
  logoBox: {
    backgroundColor: "white",
    width: 110,
    height: 110,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30
  },
  logoIcon: {
    fontSize: 45
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center"
  },
  subtitle: {
    color: "#DCEBFF",
    marginTop: 6,
    textAlign: "center"
  },
  progressContainer: {
    position: "absolute",
    bottom: 120,
    width: "70%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2
  },
  progressBar: {
    height: 4,
    backgroundColor: "white",
    borderRadius: 2
  },
  powered: {
    position: "absolute",
    bottom: 70,
    color: "#BFD8FF",
    fontSize: 10,
    letterSpacing: 1
  }
});