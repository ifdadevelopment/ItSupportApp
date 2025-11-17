import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DataContext } from "../../../context";

const ProfileScreen = () => {
  const { logoutFunc } = useContext(DataContext);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* --- Profile Card --- */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://via.placeholder.com/120" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>johndoe@example.com</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* --- Info Section --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {[
            { icon: "lock-closed-outline", text: "Change Password" },
            { icon: "notifications-outline", text: "Notifications" },
            { icon: "help-circle-outline", text: "Help & Support" },
            { icon: "information-circle-outline", text: "About" },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.optionRow}>
              <Ionicons name={item.icon} size={22} color="#2563EB" />
              <Text style={styles.optionText}>{item.text}</Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* --- App Info --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="moon-outline" size={22} color="#2563EB" />
            <Text style={styles.optionText}>Dark Mode</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="language-outline" size={22} color="#2563EB" />
            <Text style={styles.optionText}>Language</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Logout Button --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => logoutFunc()}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scroll: {
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  editText: {
    color: "white",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    elevation: 3,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});
