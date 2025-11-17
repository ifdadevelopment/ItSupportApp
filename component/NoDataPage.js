import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";


const NoData = ({ message = "No data available" }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="file-tray-outline" size={100} color="#9CA3AF" />
      <Text style={styles.title}>Nothing Here</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export default NoData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
