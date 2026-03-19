import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { searchImage } from "../../services/api";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// ─── Types ───────────────────────────────────────────────────────────────────

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── CropModal ────────────────────────────────────────────────────────────────

interface CropModalProps {
  visible: boolean;
  imageUri: string;
  onCrop: (croppedUri: string) => void;
  onCancel: () => void;
}

function CropModal({ visible, imageUri, onCrop, onCancel }: CropModalProps) {
  const PREVIEW_SIZE = SCREEN_WIDTH - 40; // 20px padding each side

  // Crop box state (in preview-image coordinates)
  const [cropBox, setCropBox] = useState({
    x: PREVIEW_SIZE * 0.1,
    y: PREVIEW_SIZE * 0.1,
    size: PREVIEW_SIZE * 0.8,
  });

  // Original image dimensions (fetched once)
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });
  const [previewHeight, setPreviewHeight] = useState(PREVIEW_SIZE);
  const [applying, setApplying] = useState(false);

  // Which handle is being dragged: "move" | "br" (bottom-right)
  const activeHandle = useRef<"move" | "br" | null>(null);
  const lastTouch = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!imageUri) return;
    Image.getSize(
      imageUri,
      (w, h) => {
        setImgSize({ width: w, height: h });
        const ratio = h / w;
        setPreviewHeight(PREVIEW_SIZE * ratio);
        // Reset crop box to 80% of preview
        const size = Math.min(PREVIEW_SIZE, PREVIEW_SIZE * ratio) * 0.8;
        const cx = (PREVIEW_SIZE - size) / 2;
        const cy = (PREVIEW_SIZE * ratio - size) / 2;
        setCropBox({ x: cx, y: cy, size });
      },
      () => {}
    );
  }, [imageUri]);

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const handleSize = 30;
      const brX = cropBox.x + cropBox.size;
      const brY = cropBox.y + cropBox.size;

      // Check if touching bottom-right handle
      if (
        Math.abs(locationX - brX) < handleSize &&
        Math.abs(locationY - brY) < handleSize
      ) {
        activeHandle.current = "br";
      } else if (
        locationX >= cropBox.x &&
        locationX <= brX &&
        locationY >= cropBox.y &&
        locationY <= brY
      ) {
        activeHandle.current = "move";
      } else {
        activeHandle.current = null;
      }
      lastTouch.current = { x: locationX, y: locationY };
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const dx = locationX - lastTouch.current.x;
      const dy = locationY - lastTouch.current.y;
      lastTouch.current = { x: locationX, y: locationY };

      setCropBox((prev) => {
        if (activeHandle.current === "move") {
          return {
            ...prev,
            x: clamp(prev.x + dx, 0, PREVIEW_SIZE - prev.size),
            y: clamp(prev.y + dy, 0, previewHeight - prev.size),
          };
        } else if (activeHandle.current === "br") {
          const delta = (dx + dy) / 2;
          const newSize = clamp(prev.size + delta, 40, Math.min(PREVIEW_SIZE - prev.x, previewHeight - prev.y));
          return { ...prev, size: newSize };
        }
        return prev;
      });
    },

    onPanResponderRelease: () => {
      activeHandle.current = null;
    },
  });

  const handleApplyCrop = async () => {
    setApplying(true);
    try {
      // Map preview coords → original image coords
      const scaleX = imgSize.width / PREVIEW_SIZE;
      const scaleY = imgSize.height / previewHeight;

      const originX = Math.round(cropBox.x * scaleX);
      const originY = Math.round(cropBox.y * scaleY);
      const cropWidth = Math.round(cropBox.size * scaleX);
      const cropHeight = Math.round(cropBox.size * scaleY);

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      onCrop(result.uri);
    } catch (e) {
      Alert.alert("Crop failed", "Could not apply crop. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={cropStyles.wrapper}>
        {/* Header */}
        <View style={cropStyles.header}>
          <TouchableOpacity onPress={onCancel} style={cropStyles.headerBtn}>
            <Ionicons name="close" size={22} color="#fff" />
            <Text style={cropStyles.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={cropStyles.headerTitle}>Crop Image</Text>
          <TouchableOpacity
            onPress={handleApplyCrop}
            style={[cropStyles.headerBtn, cropStyles.doneBtn]}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={cropStyles.headerBtnText}>Done</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Image + Crop Overlay */}
        <View style={cropStyles.canvasWrapper}>
          <View
            style={{ width: PREVIEW_SIZE, height: previewHeight }}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: PREVIEW_SIZE, height: previewHeight }}
              resizeMode="stretch"
            />

            {/* Dark overlay: top */}
            <View style={[cropStyles.overlay, { top: 0, left: 0, right: 0, height: cropBox.y }]} />
            {/* Dark overlay: bottom */}
            <View
              style={[
                cropStyles.overlay,
                {
                  top: cropBox.y + cropBox.size,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />
            {/* Dark overlay: left */}
            <View
              style={[
                cropStyles.overlay,
                {
                  top: cropBox.y,
                  left: 0,
                  width: cropBox.x,
                  height: cropBox.size,
                },
              ]}
            />
            {/* Dark overlay: right */}
            <View
              style={[
                cropStyles.overlay,
                {
                  top: cropBox.y,
                  left: cropBox.x + cropBox.size,
                  right: 0,
                  height: cropBox.size,
                },
              ]}
            />

            {/* Crop Box Border */}
            <View
              pointerEvents="none"
              style={[
                cropStyles.cropBorder,
                {
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.size,
                  height: cropBox.size,
                },
              ]}
            >
              {/* Grid lines */}
              <View style={cropStyles.gridH1} />
              <View style={cropStyles.gridH2} />
              <View style={cropStyles.gridV1} />
              <View style={cropStyles.gridV2} />

              {/* Corner handles */}
              <View style={[cropStyles.corner, cropStyles.cornerTL]} />
              <View style={[cropStyles.corner, cropStyles.cornerTR]} />
              <View style={[cropStyles.corner, cropStyles.cornerBL]} />
              <View style={[cropStyles.corner, cropStyles.cornerBR]} />
            </View>
          </View>
        </View>

        <Text style={cropStyles.hint}>
          Drag inside to move · Drag corner to resize
        </Text>
      </SafeAreaView>
    </Modal>
  );
}

const cropStyles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
  },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  doneBtn: { backgroundColor: "#2563EB" },
  headerBtnText: { color: "#fff", fontWeight: "600" },
  canvasWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  cropBorder: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  gridH1: {
    position: "absolute",
    top: "33.3%",
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  gridH2: {
    position: "absolute",
    top: "66.6%",
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  gridV1: {
    position: "absolute",
    left: "33.3%",
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  gridV2: {
    position: "absolute",
    left: "66.6%",
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  corner: {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: "#fff",
    borderWidth: 3,
  },
  cornerTL: { top: -2, left: -2, borderBottomWidth: 0, borderRightWidth: 0 },
  cornerTR: { top: -2, right: -2, borderBottomWidth: 0, borderLeftWidth: 0 },
  cornerBL: { bottom: -2, left: -2, borderTopWidth: 0, borderRightWidth: 0 },
  cornerBR: { bottom: -2, right: -2, borderTopWidth: 0, borderLeftWidth: 0 },
  hint: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 14,
    fontSize: 13,
  },
});

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [cropVisible, setCropVisible] = useState(false);

  const navigation: any = useNavigation();

  useEffect(() => {
    loadRecentImages();
  }, []);

  const loadRecentImages = async () => {
    const data = await AsyncStorage.getItem("recent_images");
    if (data) setRecentImages(JSON.parse(data));
  };

  const saveRecentImage = async (uri: string) => {
    let updated = [uri, ...recentImages.filter((i) => i !== uri)];
    updated = updated.slice(0, 6);
    setRecentImages(updated);
    await AsyncStorage.setItem("recent_images", JSON.stringify(updated));
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission required"); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission required"); return; }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false, // we handle crop ourselves now
      quality: 0.9,
    });

    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const handleSearch = async (uri?: string) => {
    const imageToSearch = uri || selectedImage || imageUrl;
    if (!imageToSearch) return;

    setLoading(true);
    const data = await searchImage(imageToSearch);
    setLoading(false);

    if (!data || data.status !== "Success") {
      Alert.alert("Error", "Failed to fetch results");
      return;
    }

    await saveRecentImage(imageToSearch);

    navigation.navigate("ResultsScreen", {
      similar: data?.search_results?.results?.similar || [],
      duplicates: data?.search_results?.results?.duplicates || [],
      faces: data?.search_results?.faces || 0,
      originalImage: imageToSearch,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Search with images</Text>
        <Text style={styles.subtitle}>
          Find products, plants, or landmarks instantly.
        </Text>

        {/* Upload */}
        {!selectedImage && (
          <View style={styles.uploadRow}>
            <TouchableOpacity style={styles.uploadCard} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={28} color="#2563EB" />
              <Text style={styles.uploadText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard} onPress={openCamera}>
              <Ionicons name="camera-outline" size={28} color="#2563EB" />
              <Text style={styles.uploadText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* URL */}
        <Text style={styles.sectionLabel}>SEARCH BY URL</Text>
        <View style={styles.urlRow}>
          <TextInput
            placeholder="Paste an image URL..."
            value={imageUrl}
            onChangeText={setImageUrl}
            style={styles.urlInput}
          />
          <TouchableOpacity style={styles.urlButton} onPress={() => handleSearch()}>
            <Text style={styles.urlButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        {selectedImage && (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />

            {/* Remove */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={18} color="#FFF" />
            </TouchableOpacity>

            {/* ✂️ Crop — opens the inline crop modal */}
            <TouchableOpacity
              style={styles.cropButton}
              onPress={() => setCropVisible(true)}
            >
              <Ionicons name="crop-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Search Button */}
        {selectedImage && (
          <TouchableOpacity onPress={() => handleSearch()} disabled={loading}>
            <LinearGradient colors={["#2563EB", "#06B6D4"]} style={styles.searchButton}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={18} color="#fff" />
                  <Text style={styles.searchText}>Search Image</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Recent */}
        {recentImages.length > 0 && (
          <>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <View style={styles.recentGrid}>
              {recentImages.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => handleSearch(img)}>
                  <Image source={{ uri: img }} style={styles.recentImage} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ✂️ Inline Crop Modal */}
      {selectedImage && (
        <CropModal
          visible={cropVisible}
          imageUri={selectedImage}
          onCrop={(croppedUri) => {
            setSelectedImage(croppedUri);
            setCropVisible(false);
          }}
          onCancel={() => setCropVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748B", marginBottom: 20 },

  uploadRow: { flexDirection: "row", justifyContent: "space-between" },
  uploadCard: {
    backgroundColor: "#FFF",
    width: "48%",
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
  },
  uploadText: { marginTop: 10, fontWeight: "600" },

  sectionLabel: { marginTop: 20, marginBottom: 8, color: "#94A3B8" },
  urlRow: { flexDirection: "row" },
  urlInput: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  urlButton: {
    marginLeft: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 12,
  },
  urlButtonText: { color: "#FFF", fontWeight: "600" },

  previewWrapper: { marginTop: 20, position: "relative" },
  previewImage: { width: "100%", height: 250, borderRadius: 20 },

  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    padding: 6,
  },
  cropButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  searchButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  searchText: { color: "#fff", marginLeft: 8, fontWeight: "600" },

  recentTitle: { marginTop: 25, fontWeight: "600", fontSize: 16 },
  recentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  recentImage: { width: 100, height: 100, borderRadius: 12 },
});
