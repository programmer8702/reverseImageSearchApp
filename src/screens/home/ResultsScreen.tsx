import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["Similar", "Duplicate", "Face"];

export default function ResultsScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState("Similar");

  // Data passed from HomeScreen
  const {
    similar = [],
    duplicates = [],
    faces = 0,
  } = route.params || {};

  // Determine current tab data
  const getCurrentData = () => {
    if (activeTab === "Similar") return similar;
    if (activeTab === "Duplicate") return duplicates;
    if (activeTab === "Face") return []; // If later face images added
    return similar;
  };

  const currentData = getCurrentData();

  const openSource = (url: string) => {
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openSource(item.sourceUrl)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Search Results</Text>
          <Text style={styles.matchesText}>
            {currentData.length} matches found
          </Text>
        </View>

        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeTab === "Similar" && "Visually Similar Results"}
          {activeTab === "Duplicate" && "Duplicate Images"}
          {activeTab === "Face" && `Detected Faces: ${faces}`}
        </Text>

        {activeTab !== "Face" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {currentData.length} Found
            </Text>
          </View>
        )}
      </View>

      {/* Results Grid */}
      <FlatList
        data={currentData}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingTop: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  headerTitle: {
    fontWeight: "600",
    fontSize: 16,
  },

  matchesText: {
    fontSize: 12,
    color: "#64748B",
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },

  tab: {
    marginRight: 20,
    paddingVertical: 12,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#2563EB",
  },

  tabText: {
    color: "#64748B",
    fontWeight: "500",
  },

  activeTabText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  sectionHeader: {
    marginTop: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  badge: {
    backgroundColor: "#E0EDFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },

  badgeText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 15,
    width: "48%",
    overflow: "hidden",
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 140,
  },
});