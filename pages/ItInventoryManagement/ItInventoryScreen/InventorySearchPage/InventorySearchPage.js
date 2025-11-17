// InventorySearchPage/ItInventorySearchPage.js
import React, { useState, useRef, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { DataContext } from "../../../../context";

const { height } = Dimensions.get("window");

export const locationData = [
  // ... your locationData array
];

export default function ItInventorySearchPage({ setItInventories }) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [currentField, setCurrentField] = useState(null);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const { apiGet } = useContext(DataContext);

  const openOptions = (fieldKey, mainLocation = null) => {
    setCurrentField(fieldKey);
    if (fieldKey === "mainLocation") setOptions(locationData);
    else if (fieldKey === "location" && mainLocation) {
      const found = locationData.find((loc) => loc.key === mainLocation.key);
      setOptions(found ? found.subLocations : []);
    }
    modalRef.current?.open();
  };

  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleFilter = async () => {
    if (!selectedMain || !selectedSub) {
      Alert.alert("Error", "Please select both Main and Sub Location");
      return;
    }
    try {
      setLoading(true);
      await apiGet("/get-it-inventory/", { mainLocation: selectedMain.key, location: selectedSub.key }, setItInventories);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch inventories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Locations</Text>

      <TouchableOpacity style={styles.inputRow} onPress={() => openOptions("mainLocation")}>
        <Ionicons name="location-outline" size={22} color="darkblue" />
        <Text style={styles.inputText}>{selectedMain?.label || "Select Main Location"}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {selectedMain && (
        <TouchableOpacity style={[styles.inputRow, { marginTop: 16 }]} onPress={() => openOptions("location", selectedMain)}>
          <Ionicons name="business-outline" size={22} color="darkblue" />
          <Text style={styles.inputText}>{selectedSub?.label || "Select Sub Location"}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleFilter}>
        <Text style={styles.submitText}>{loading ? <ActivityIndicator size={19} color="white" /> : "Filter"}</Text>
      </TouchableOpacity>

      <Modalize
        ref={modalRef}
        modalHeight={height * 0.7}
        handlePosition="inside"
        withHandle
        modalStyle={styles.modal}
        flatListProps={{
          data: filteredOptions,
          keyExtractor: (item) => item.key,
          ListHeaderComponent: (
            <TextInput
              placeholder="Search..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          ),
          renderItem: ({ item }) => (
            <Pressable
              style={styles.optionRow}
              onPressIn={() => {
                if (currentField === "mainLocation") {
                  setSelectedMain({ key: item.key, label: item.label });
                  setSelectedSub(null);
                } else if (currentField === "location") {
                  setSelectedSub({ key: item.key, label: item.label });
                }
                modalRef.current?.close();
                setSearch("");
              }}
            >
              <Ionicons name={item.icon} size={20} color="#4a90e2" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>{item.label}</Text>
            </Pressable>
          ),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f7fa" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#dcdde1", padding: 12 },
  inputText: { flex: 1, marginLeft: 8, fontSize: 15, color: "#2d3436" },
  submitBtn: { marginTop: 24, backgroundColor: "#4a90e2", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  searchInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginBottom: 12 },
  optionRow: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionText: { fontSize: 16, color: "#333" },
});
