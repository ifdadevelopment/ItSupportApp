// BottomSheetPicker.js
import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";

const { height } = Dimensions.get("window");

export default function BottomSheetPicker({
  label,
  icon = "list",
  value,
  options = [],
  onSelect,
  placeholder,
  modalHeight = 0.9, // percent of screen
}) {
  const modalizeRef = useRef(null);

  const openSheet = useCallback(() => {
    try { modalizeRef.current?.open(); } catch (e) { /* ignore */ }
  }, []);

  const closeSheet = useCallback(() => {
    try { modalizeRef.current?.close(); } catch (e) { /* ignore */ }
  }, []);

  // handler that sets value then closes the sheet after a tiny delay to avoid race/unmount issues
  const handleSelect = useCallback(
    (item) => {
      if (onSelect) onSelect(item);
      // small delay helps in cases where closing the modal unmounts things too quickly
      // tweak 50-150ms if you observe any problems
      setTimeout(() => {
        closeSheet();
      }, 100);
    },
    [onSelect, closeSheet]
  );

  // stable renderItem
  const renderItem = useCallback(
    ({ item, index }) => {
      const key = item == null ? `item-${index}` : `${String(item)}-${index}`;
      return (
        <Pressable
          key={key}
          android_ripple={{ color: "#e6e6e6" }}
          style={({ pressed }) => [
            styles.option,
            pressed && { opacity: 0.7 },
          ]}
          // If you still see missed taps, try switching to onPressIn here.
          onPress={() => handleSelect(item)}
        >
          <Text style={styles.optionText}>{String(item)}</Text>
        </Pressable>
      );
    },
    [handleSelect]
  );

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.inputRow} onPress={openSheet} accessibilityRole="button">
        <Ionicons name={icon} size={22} color="darkblue" style={styles.icon} />
        <Text style={{ flex: 1, fontSize: 15, color: value ? "#2d3436" : "#999" }}>
          {value || placeholder || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </Pressable>
      <Modalize
        ref={modalizeRef}
        modalHeight={height * modalHeight}
        handlePosition="inside"
        withHandle
        modalStyle={styles.modal}
        // Important: pass flatListProps so Modalize does not wrap a ScrollView around the virtualized list
        flatListProps={{
          data: options,
          keyExtractor: (item, idx) => (item == null ? `i-${idx}` : `${String(item)}-${idx}`),
          renderItem,
          keyboardShouldPersistTaps: "always", // make taps reliable even when the list is scrollable / keyboard present
          showsVerticalScrollIndicator: false,
          initialNumToRender: 12,
          removeClippedSubviews: true,
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: "600", color: "#002fbb", marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcdde1",
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginBottom: 20,
  },
  icon: { marginRight: 8 },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 8 },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionText: { fontSize: 16 },
});
