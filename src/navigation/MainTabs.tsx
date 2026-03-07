import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home/HomeScreen";
import HistoryScreen from "../screens/history/HistoryScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import PackagesScreen from "../screens/subscription/PackagesScreen";
import { View, Text, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();


import ResultsScreen from "../screens/home/ResultsScreen";

const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
    return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="ResultsScreen" component={ResultsScreen} />
    </HomeStack.Navigator>
  );
}

// function HistoryScreen() {
//   return (
//     <View style={styles.center}>
//       <Text>History Screen</Text>
//     </View>
//   );
// }

// function SettingsScreen() {
//   return (
//     <View style={styles.center}>
//       <Text>Settings Screen</Text>
//     </View>
//   );
// }

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Search") {
            iconName = "home-outline";
          } else if (route.name === "History") {
            iconName = "time-outline";
          } else if (route.name === "Settings") {
            iconName = "settings-outline";
          }
            else if (route.name === "Packages") {
            iconName = "pricetags-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Search" component={HomeStackScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Packages" component={PackagesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});