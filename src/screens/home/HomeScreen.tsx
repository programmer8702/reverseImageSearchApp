import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { searchImage } from "../../services/api";

export default function HomeScreen() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigation: any = useNavigation();

    // 📷 Pick From Gallery
    const pickFromGallery = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permission required", "Gallery access is required.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    // 📸 Open Camera
    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permission required", "Camera access is required.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    // 🔍 Search Image
    const handleSearch = async () => {
        if (!selectedImage) return;

        setLoading(true);

        const data = await searchImage(selectedImage);

        setLoading(false);

        if (!data || data.status !== "Success") {
            Alert.alert("Error", "Failed to fetch results");
            return;
        }

        const similar =
            data?.search_results?.results?.similar || [];

        const duplicates =
            data?.search_results?.results?.duplicates || [];

        const faces =
            data?.search_results?.faces || 0;

        navigation.navigate("ResultsScreen", {
            similar,
            duplicates,
            faces,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Search with images</Text>
            <Text style={styles.subtitle}>
                Upload an image to search across the web.
            </Text>

            {/* Upload Buttons */}
            {!selectedImage && (
                <View style={styles.uploadRow}>
                    <TouchableOpacity
                        style={styles.uploadCard}
                        onPress={pickFromGallery}
                    >
                        <Ionicons name="images-outline" size={28} color="#2563EB" />
                        <Text style={styles.uploadText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.uploadCard} onPress={openCamera}>
                        <Ionicons name="camera-outline" size={28} color="#2563EB" />
                        <Text style={styles.uploadText}>Camera</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
                <View style={styles.previewWrapper}>
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.previewImage}
                    />

                    {/* ❌ Remove Button */}
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Ionicons name="close" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}

            {/* 🔍 Search Button */}
            {selectedImage && (
                <TouchableOpacity
                    onPress={handleSearch}
                    disabled={loading}
                    style={{ marginTop: 20 }}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#2563EB", "#06B6D4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.searchButton,
                            { opacity: loading ? 0.85 : 1 },
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name="search-outline"
                                    size={18}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.searchButtonText}>
                                    Search Image on Web
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
    },
    subtitle: {
        color: "#64748B",
        marginBottom: 25,
        marginTop: 5,
    },
    uploadRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    uploadCard: {
        backgroundColor: "#FFFFFF",
        width: "48%",
        paddingVertical: 30,
        borderRadius: 20,
        alignItems: "center",
        elevation: 4,
    },
    uploadText: {
        marginTop: 12,
        fontWeight: "600",
        color: "#0F172A",
    },
    previewWrapper: {
        marginTop: 10,
        position: "relative",
    },
    previewImage: {
        width: "100%",
        height: 260,
        borderRadius: 20,
    },
    removeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    searchButton: {
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    searchButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        marginLeft: 8,
    },
});