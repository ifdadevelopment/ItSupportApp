// components/inventoryCard/ItInventoryCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { navigate } from "../../navserviceRef";

export default function ItInventoryCard({ navigation, inventory }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return "#28a745"; // green
      case "in-use":
        return "#ffc107"; // yellow
      case "maintenance":
        return "#dc3545"; // red
      default:
        return "#6c757d"; // grey
    }
  };

  const getInventoryColor = (count) => {
    if (count > 5) return "#dc3545"; // red
    if (count >= 3) return "#ffc107"; // yellow
    return "#ced4da"; // light gray
  };

  const ticketCount = inventory?.ticketCount ?? 0;
  const ticketBadgeColor = getInventoryColor(ticketCount);


  const statusColor = getStatusColor(inventory.status);

  return (
    <TouchableOpacity
      onPress={() => { navigation.navigate(`ItInventoryDetails`, { inventoryId: inventory._id, }) }}
      style={[styles.card, { borderLeftColor: statusColor }]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.tag}>{inventory.tagNoCpu}</Text>
          <Text style={styles.manufacturer}>{inventory.manufactureBy}</Text>
          <Text style={styles.macAddress}>{inventory.macAddress}</Text>
        </View>
        <View style={{
          backgroundColor: ticketBadgeColor,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginTop: 6,
          minWidth: 80,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: ticketCount > 5 ? "#fff" : "#000"
          }}>
            Tickets: {ticketCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5, // colored left border
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flexDirection: "column",
    flex: 1,
  },
  tag: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },
  manufacturer: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 2,
  },
  macAddress: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textTransform: "capitalize",
  },
});
