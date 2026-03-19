import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateProfileAPI } from "../../services/auth_api";

export default function SettingsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  const { logout, user, updateProfile } = useContext(AuthContext);

  const [loggingOut, setLoggingOut] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);


      await logout();
    } catch (error) {
      console.log("Logout Error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const saveName = async () => {
    try {
      setSaving(true);

      const accessToken = await SecureStore.getItemAsync("access_token");
      // TODO: replace with your API call
      await updateProfileAPI({ firstName, lastName }, accessToken || "");
      updateProfile({ firstName, lastName });
      console.log("Updated name:", firstName, lastName);

      setEditingName(false);
    } catch (error) {
      console.log("Update name error", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=12",
            }}
            style={styles.avatar}
          />

          <TouchableOpacity
            style={styles.editBadge}
            onPress={() => setEditingName(true)}
          >
            <Ionicons name="pencil" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          {editingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                style={styles.input}
              />

              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                style={styles.input}
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveName}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={styles.name}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </TouchableOpacity>

              <Text style={styles.email}>{user?.email}</Text>
            </>
          )}
        </View>

        {/* Subscription Card */}
        <LinearGradient
          colors={["#2563EB", "#1E40AF"]}
          style={styles.subscriptionCard}
        >
          <View>
            <Text style={styles.planLabel}>Current Plan</Text>
            <Text style={styles.planName}>VisionSearch Pro</Text>
            <Text style={styles.renewText}>Renews on Oct 12, 2025</Text>
          </View>

          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageText}>Manage</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

        <View style={styles.card}>
          <SettingsRow
            icon="lock-closed-outline"
            title="Change Password"
          />

          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor="#FFFFFF"
                trackColor={{ true: "#2563EB" }}
              />
            }
          />
        </View>

        {/* App Preferences */}
        <Text style={styles.sectionTitle}>APP PREFERENCES</Text>

        <View style={styles.card}>
          <SettingsRow
            icon="moon-outline"
            title="Dark Mode"
            subtitle="System"
          />

          <SettingsRow
            icon="language-outline"
            title="Language"
            subtitle="English (US)"
          />
        </View>

        {/* Info */}
        <Text style={styles.sectionTitle}>MORE INFORMATION</Text>

        <View style={styles.card}>
          <SettingsRow
            icon="information-circle-outline"
            title="About VisionSearch"
          />

          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
          />

          <SettingsRow
            icon="document-text-outline"
            title="Terms of Service"
          />
        </View>

        {/* Logout */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>

          {loggingOut && (
            <ActivityIndicator
              size="small"
              color="#EF4444"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.2.0 (Build 402)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingsRow = ({
  icon,
  title,
  subtitle,
  rightElement,
}: any) => (
  <TouchableOpacity style={styles.row}>
    <View style={styles.rowLeft}>
      <Ionicons name={icon} size={20} color="#2563EB" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
    </View>

    {rightElement ? (
      rightElement
    ) : (
      <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 18,
  },

  header: {
    paddingVertical: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
  },

  editBadge: {
    position: "absolute",
    bottom: 50,
    right: 135,
    backgroundColor: "#2563EB",
    padding: 6,
    borderRadius: 20,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  email: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
  },

  editNameContainer: {
    width: "80%",
    alignItems: "center",
  },

  input: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  subscriptionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    marginBottom: 25,
  },

  planLabel: {
    color: "#BFDBFE",
    fontSize: 12,
  },

  planName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  renewText: {
    color: "#DBEAFE",
    fontSize: 12,
    marginTop: 2,
  },

  manageButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  manageText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 15,
    paddingVertical: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },

  rowSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
  },

  logoutText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#EF4444",
  },

  version: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginVertical: 15,
  },
});