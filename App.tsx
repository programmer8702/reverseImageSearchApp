import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainTabs from "./src/navigation/MainTabs";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CustomSplash from "./src/screens/SplashScreen";
import RootNavigator from "./src/navigation/RootNavigator";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // only here

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}