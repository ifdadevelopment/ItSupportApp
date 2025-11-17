// ItInventoryPreview.js
import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { SafeAreaView } from "react-native-safe-area-context";
import { DataContext } from "../../../../context";
import { locationData } from "../ItInventoryScreen";

const ItInventoryPreview = ({ route, navigation }) => {
  const { apiGet, apiPut } = useContext(DataContext);
  const { inventoryId } = route.params;

  const [item, setItem] = useState(null);
  const [editingItem, setEditingItem] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [button, setButton] = useState(false);
  const [options, setOptions] = useState([]);
  const modalizeRef = useRef(null);

  // Fetch inventory data
  useEffect(() => {
    apiGet(`/get-it-inventory-by-id/${inventoryId}/`, {}, (data) => {
      setItem(data?.data);
      setEditingItem(data?.data);
    });
  }, [inventoryId]);

  // -------- helpers --------
  const diffPayload = (original = {}, edited = {}) => {
    const out = {};
    Object.keys(edited || {}).forEach((k) => {
      const a = original?.[k];
      const b = edited?.[k];
      if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = b;
    });
    return out;
  };

  const openOptionSelector = (field, optionsList) => {
    setSelectedField(field);
    setOptions(optionsList);
    modalizeRef.current?.open();
  };

  const handleOptionSelect = (value) => {
    setEditingItem({ ...editingItem, [selectedField]: value });
    modalizeRef.current?.close();
  };

  // -------- update function (PUT) --------
  const updateData = async () => {
    try {
      setButton(true);
      if (!editingItem || !item) {
        Alert.alert("Error", "Nothing to update.");
        return;
      }

      // validate sublocation against mainLocation
      const main = locationData.find((l) => l.key === editingItem.mainLocation);
      const validSubs = main?.subLocations?.map((s) => s.key) || [];
      if (
        editingItem.mainLocation &&
        editingItem.location &&
        !validSubs.includes(editingItem.location)
      ) {
        Alert.alert(
          "Invalid Location",
          `“${editingItem.location}” is not a valid sublocation of “${editingItem.mainLocation}”.`
        );
        return;
      }

      // only send changed fields
      const payload = diffPayload(item, editingItem);

      // (optional) whitelist keys
      const allowedKeys = new Set([
        "manufactureBy",
        "processor",
        "ram",
        "storage",
        "mainLocation",
        "location",
        "department",
        "condition",
        "status",
        "operatingSystem",
        "tagNoCpu",
        "serialNo",
        "keyboard",
        "mouse",
        "displayTag",
        "keyboardTag",
        "mouseTag",
        "macAddress",
        "domain",
        "statusExplain",
        "software",
        "purchaseDate",
        "warrantyExpiry",
        "category",
        "subCategory",
        "assignedTo",
      ]);
      Object.keys(payload).forEach((k) => {
        if (!allowedKeys.has(k)) delete payload[k];
      });

      if (Object.keys(payload).length === 0) {
        Alert.alert("No Changes", "Everything is already up to date.");
        return;
      }
delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;
      const res = await apiPut(
        `/update-inventory/${inventoryId}`,
        payload,
        setButton,
        async () => {
          // merge local cache on success
          setItem((prev) => ({ ...(prev || {}), ...payload }));
        }
      );

      if (res) {
        Alert.alert("Success", "Inventory updated successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update inventory.");
    } finally {
      setButton(false);
    }
  };

  if (!item) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1F4FFF" />
      </View>
    );
  }

  const currentMain = locationData.find(
    (l) => l.key === editingItem.mainLocation
  );

  const currentSubOptions = currentMain?.subLocations || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Ionicons name="laptop-outline" size={28} color="#3797EF" />
          <Text style={styles.logoText}>Inventory</Text>
        </View>
      </View>
      {/* Content */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* System Information */}
        <Text style={styles.sectionTitle}>System Information</Text>
        <EditableRow
          label="Manufactured By"
          icon="business-outline"
          value={editingItem.manufactureBy}
          onChangeText={(v) =>
            setEditingItem({ ...editingItem, manufactureBy: v })
          }
        />
        <EditableRow
          label="Processor"
          icon="hardware-chip-outline"
          value={editingItem.processor}
          onChangeText={(v) => setEditingItem({ ...editingItem, processor: v })}
        />
        <EditableRow
          label="RAM"
          icon="cube-outline"
          value={editingItem.ram}
          onChangeText={(v) => setEditingItem({ ...editingItem, ram: v })}
        />
        <EditableRow
          label="Storage"
          icon="save-outline"
          value={editingItem.storage}
          onChangeText={(v) => setEditingItem({ ...editingItem, storage: v })}
        />

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <OptionRow
          label="Main Location"
          value={editingItem.mainLocation}
          icon="location-outline"
          onPress={() =>
            openOptionSelector(
              "mainLocation",
              locationData.map((l) => l.key)
            )
          }
        />
        <OptionRow
          label="Sublocation"
          value={editingItem.location}
          icon="navigate-outline"
          onPress={() =>
            openOptionSelector(
              "location",
              currentSubOptions.map((s) => s.key)
            )
          }
        />
        <EditableRow
          label="Department"
          icon="people-outline"
          value={editingItem.department}
          onChangeText={(v) =>
            setEditingItem({ ...editingItem, department: v })
          }
        />

        {/* Status */}
        <Text style={styles.sectionTitle}>Status</Text>
        <OptionRow
          label="Condition"
          value={editingItem.condition}
          icon="medkit-outline"
          onPress={() =>
            openOptionSelector("condition", ["Good", "Fair", "Poor", "Damaged"])
          }
        />
        <OptionRow
          label="Status"
          value={editingItem.status}
          icon="sync-outline"
          onPress={() =>
            openOptionSelector("status", [
              "available",
              "in-use",
              "repair",
              "retired",
            ])
          }
        />

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, button && { opacity: 0.7 }]}
          onPress={updateData}
          disabled={button}
        >
          <Text style={styles.saveButtonText}>
            {button ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modalize */}
      <Modalize ref={modalizeRef} adjustToContentHeight>
        <View style={styles.modalContent}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPressIn={() => handleOptionSelect(opt)}
              style={styles.optionItem}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

// ------- sub components -------
const EditableRow = ({ label, value, onChangeText, icon }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={18} color="#64748B" style={{ marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="—"
        placeholderTextColor="#C7C7CD"
      />
    </View>
  </View>
);

const OptionRow = ({ label, value, onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={styles.row}>
    <Ionicons name={icon} size={18} color="#64748B" style={{ marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.optionValue}>{value || "—"}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
  </TouchableOpacity>
);

// ------- styles -------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 12,
    marginBottom: 16,
  },
  backIcon: {
    padding: 6,
    borderRadius: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginLeft: 6,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 24,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: "#1C1C1E",
    borderBottomWidth: 0.6,
    borderColor: "#D1D1D6",
    paddingVertical: 6,
  },
  optionValue: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  saveButton: {
    marginTop: 30,
    marginBottom: 50,
    backgroundColor: "#3797EF",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#3797EF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#EFEFF4",
  },
  optionText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
});

export default ItInventoryPreview;
