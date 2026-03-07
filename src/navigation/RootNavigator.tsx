import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainTabs from "./MainTabs";
import OtpScreen from "../screens/auth/OtpScreen";
import CustomSplash from "../screens/SplashScreen";

export default function RootNavigator() {
  const { accessToken, emailVerified, loading } = useContext(AuthContext);

  if (loading) {
    return <CustomSplash />;
  }

  if (!accessToken) {
    return <AuthNavigator />;
  }

  if (!emailVerified) {
    return <OtpScreen />;
  }

  return <MainTabs />;
}