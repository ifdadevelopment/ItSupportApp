import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DataContext } from "../../context";

const InventoryCard = ({ item, getDataFunc }) => {
  const [button, setButton] = useState(false);
  const [returnInventoryButton, setReturnInventoryButton] = useState(false);
  const { apiPost, socket } = useContext(DataContext);

  useEffect(() => {
    if (!socket) return;

    socket.on("inventory_update", getDataFunc);

    return () => {
      socket.off("inventory_update", getDataFunc);
    };
  }, [socket]);

  const requestInventory = async () => {
    await apiPost(`/request-inventory/${item?._id}/`, {}, setButton);
  }

  const returnInventory = async () => {
    await apiPost(`/return-inventory/${item?._id}/`, {}, setReturnInventoryButton);
  }
  return (
    <View style={styles.inventoryCard}>
      {/* Header */}
      <View style={styles.inventoryHeader}>
        <Ionicons name="cube-outline" size={22} color="#2563EB" />
        <Text style={styles.itemName}>{item.name}</Text>
      </View>

      {/* Details */}
      <View style={{ marginTop: 6 }}>
        <Text style={styles.subText}>{item.category} • {item.brand}</Text>
        <Text style={styles.subText}>Model: {item.model}</Text>
        <Text style={styles.subText}>
          {item.takenBy ? `Taken By: ${item.takenBy}` : "Not Assigned"}
        </Text>
      </View>

      {/* Action */}
      {!item.assignedTo ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (button) return;
            requestInventory();
          }}
        >
          <Ionicons name="add-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.primaryButtonText}>{button ? <ActivityIndicator color={"white"}
            size={19} /> : "Request Inventory"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.takenBadge}

          onPress={() => {
            returnInventory();
          }}>
          <Ionicons name="lock-closed-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.takenText}>{returnInventoryButton ? <ActivityIndicator size={19}
            color={'white'} /> : "Return Inventory"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inventoryCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  inventoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  itemName: { fontSize: 16, fontWeight: "700", color: "#111", marginLeft: 6 },
  subText: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  primaryButton: {
    marginTop: 12,
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  takenBadge: {
    marginTop: 12,
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  takenText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default InventoryCard;
