import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../screens/auth/AuthScreen";
import MainTabs from "./MainTabs";
import OtpScreen from "../screens/auth/OtpScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="OtpScreen" component={OtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}