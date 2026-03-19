import React, { useContext, useEffect, useState }  from "react";
import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainTabs from "./MainTabs";
import CustomSplash from "../screens/SplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";

// export default function RootNavigator() {
//   const { accessToken, loading } = useContext(AuthContext);

//   if (loading) {
//     return <CustomSplash />;
//   }
//   return accessToken ? <MainTabs key="app" /> : <AuthNavigator key="auth" />;
// }

export default function RootNavigator() {
  const { accessToken, loading, bootstrapAuth } = useContext(AuthContext);
  const [appReady, setAppReady] = useState(false);
    useEffect(() => {
    async function init() {
      await bootstrapAuth();

      // 👇 enforce minimum splash duration
      await new Promise(resolve => setTimeout(resolve, 1800));

      setAppReady(true);
      await SplashScreen.hideAsync();
    }

    init();
  }, []);

  if (loading || !appReady) {
    return <CustomSplash />;
  }

  return accessToken ? <MainTabs key="app" /> : <AuthNavigator key="auth" />;
}