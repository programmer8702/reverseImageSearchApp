import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Linking,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["Similar", "Duplicate", "Face"];

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

export default function ResultsScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState("Similar");
  const [isSaved, setIsSaved] = useState(false);

  const {
    similar = [],
    duplicates = [],
    faces = 0,
    originalImage = null,
  } = route.params || {};

  const getCurrentData = () => {
    if (activeTab === "Similar") return similar;
    if (activeTab === "Duplicate") return duplicates;
    return [];
  };

  const currentData = getCurrentData();

  const openSource = (url: string) => {
    if (url) Linking.openURL(url);
  };

  // ✅ GLOBAL SAVE ALL
  const handleSaveAll = useCallback(() => {
    const allData = [
      ...similar,
      ...duplicates,
      ...(faces ? [{ type: "face_count", count: faces }] : []),
    ];

    if (!originalImage && allData.length === 0) return;

    if (isSaved) {
      showToast("Already saved to history");
      return;
    }

    setIsSaved(true);

    showToast(
      `Saved ${
        allData.length
      } items${originalImage ? " + original image" : ""}`
    );

    // TODO: Persist full search session
  }, [similar, duplicates, faces, originalImage, isSaved]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openSource(item.sourceUrl)}
      activeOpacity={0.85}
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
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Search Results</Text>
            <Text style={styles.matchesText}>
              {similar.length + duplicates.length} matches
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* Save All */}
            <TouchableOpacity
              style={[
                styles.saveAllGlobal,
                isSaved && styles.saveAllGlobalActive,
              ]}
              onPress={handleSaveAll}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={16}
                color={isSaved ? "#fff" : "#2563EB"}
              />
            </TouchableOpacity>

            {/* Thumbnail */}
            {originalImage && (
              <Image source={{ uri: originalImage }} style={styles.thumbnail} />
            )}
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
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

        {/* SECTION HEADER */}
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

        {/* GRID */}
        <FlatList
          data={currentData}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No results for this tab</Text>
            </View>
          }
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

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1E293B",
  },
  matchesText: {
    fontSize: 12,
    color: "#64748B",
  },

  thumbnail: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  saveAllGlobal: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  saveAllGlobalActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  // TABS
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#2563EB",
  },
  tabText: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 14,
  },
  activeTabText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  // SECTION
  sectionHeader: {
    marginTop: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
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

  // CARD
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

  // EMPTY
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
  },
});