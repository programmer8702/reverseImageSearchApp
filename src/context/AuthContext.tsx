import React, { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { refreshTokenAPI,getProfile } from "../services/auth_api";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  emailVerified: boolean;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapAuth: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: any) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const bootstrapAuth = async () => {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    console.log("Bootstrap Refresh Token:", refreshToken);
    if (!refreshToken) {
        setLoading(false);
        return;
      }

    try {
      // const refreshRes = await refreshTokenAPI(refreshToken);

      // const newAccess = refreshRes.accessToken;

      // await SecureStore.setItemAsync("access_token", newAccess);

      // setAccessToken(newAccess);

      const newAccess = await SecureStore.getItemAsync("access_tokens") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWExNjJlYjRiYmFiMzczOWUwNDU4NjMiLCJpYXQiOjE3NzI4ODA2MDUsImV4cCI6MTc3Mjg4NDIwNX0.lAyutUfQibBWXLkyFhBKMxVQhFy4qkGIbItQ9kDPRIE";
      const profile = await getProfile(newAccess);
      // console.log("Bootstrap Profile:", profile);
      if(profile == null) {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        //refresh token might be invalid or expired, clear stored tokens and reset state
        setAccessToken(null);
        setRefreshToken(null);
        setLoading(false);
        return;
      }
      setUser(profile);
      setEmailVerified(profile.emailVerified);
      setLoading(false);
      return profile;

    } catch {
      return null;
    }
  };

  const loadTokens = async () => {
    const storedAccess = await SecureStore.getItemAsync("access_token");
    const storedRefresh = await SecureStore.getItemAsync("refresh_token");

    setAccessToken(storedAccess);
    setRefreshToken(storedRefresh);
    setLoading(false);
  };

  const login = async (newAccess: string, newRefresh: string) => {
    await SecureStore.setItemAsync("access_token", newAccess);
    await SecureStore.setItemAsync("refresh_token", newRefresh);

    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");

    setAccessToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
        bootstrapAuth,
        emailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};