import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const data = [
    {
      title: "TODAY",
      data: [
        {
          id: "1",
          name: "Classic Red Sneakers",
          category: "Fashion / Footwear",
          time: "2:45 PM",
          image: "https://via.placeholder.com/60",
        },
        {
          id: "2",
          name: "Minimalist Wristwatch",
          category: "Accessories / Tech",
          time: "11:20 AM",
          image: "https://via.placeholder.com/60",
        },
      ],
    },
    {
      title: "YESTERDAY",
      data: [
        {
          id: "3",
          name: "MacBook Pro M2",
          category: "Electronics / Computing",
          time: "5:15 PM",
          image: "https://via.placeholder.com/60",
        },
        {
          id: "4",
          name: "Glass Decanter Set",
          category: "Home / Decor",
          time: "9:02 AM",
          image: "https://via.placeholder.com/60",
        },
      ],
    },
  ];

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>

        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>

      <TouchableOpacity>
        <Ionicons name="trash-outline" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Search History</Text>
        <TouchableOpacity>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          placeholder="Search history by description or category..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      {/* History List */}
      <SectionList
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 18,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  clearText: {
    color: "#2563EB",
    fontWeight: "500",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#0F172A",
  },

  sectionHeader: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 1,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  category: {
    fontSize: 12,
    color: "#2563EB",
    marginVertical: 2,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  time: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
});