import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InventoryHistoryCard = ({ item }) => {
    console.log('6');
    console.log(item);
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="laptop-outline" size={28} color="#2563EB" />
        <Text style={styles.title}>{item.inventoryName}</Text>
      </View>

      <Text style={styles.text}>Category: {item.category}</Text>
      <Text style={styles.text}>
        Action:{" "}
        <Text style={{ fontWeight: "600", color: item.action === "assigned" ? "green" : "red" }}>
          {item.action}
        </Text>
      </Text>
      {item.assignedDate && (
        <Text style={styles.text}>
          Assigned: {new Date(item.assignedDate).toLocaleString()}
        </Text>
      )}
      {item.returnedDate ? (
        <Text style={styles.text}>
          Returned: {new Date(item.returnedDate).toLocaleString()}
        </Text>
      ) : (
        <Text style={styles.text}>Returned: Not yet returned</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
    color: "#111",
  },
  text: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
});

export default InventoryHistoryCard;
