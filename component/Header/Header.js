import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from '@react-navigation/native';
import { DataContext } from '../../context';
import logo from "../../assets/ifda.png";
import { navigate } from '../../navserviceRef';

export default function MyHeader({ navigation }) {
  const route = useRoute();
  const { logoutFunc, user, checkSession } = React.useContext(DataContext);
  const activeRoute = route.name;

  // For More menu modal
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  // Define all tabs
  const allTabs = [
    { name: "Home", label: "Home", user: "all" },
    { name: "SearchInventory", label: "Lab & Office PCs", user: "admin" },
    { name: "RegisterUser", label: "Add User", user: "admin" },
    { name: "AddItInventory", label: "Add Device", user: "technician" },
    { name: "AddItemInventory", label: "Purchase Record", user: "technician" },
    { name: "SearchInventory", label: "Lab & Office PCs", user: "technician" },
    { name: "RaiseTicket", label: "Raise Ticket", user: "user" },
    // { name: "TakenInventoryScreen", label: "Taken Inventory", user: "user" }
  ];

  if (!user) return null;

  // Filter tabs based on user role
  const roleTabs = allTabs.filter(tab => tab.user === user.user_type || tab.user === "all");

  // Show first 3 tabs only
  const visibleTabs = roleTabs.slice(0, 2);

  // Remaining tabs go to More menu
  const moreTabs = roleTabs.slice(2);

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.rightRow}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logoutFunc}>
            <Ionicons name="power" size={18} color="#FF3D00" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {visibleTabs.map(tab => {
          const isActive = activeRoute === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => navigate(tab.name)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          );
        })}

        {moreTabs.length > 0 && (
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setShowMore(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* More Modal */}
      <Modal
        visible={showMore}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMore(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>More Options</Text>
            {moreTabs.map(tab => (
              <TouchableOpacity
                key={tab.name}
                style={styles.moreItem}
                onPress={() => {
                  setShowMore(false);
                  navigate(tab.name);
                }}
              >
                <Text style={styles.moreItemText}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowMore(false)} style={styles.closeIcon}>
              <Ionicons name="close" size={22} color="#FF3D00" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 100,
    height: 30,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF3D00",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  tab: {
    alignItems: "center",
    paddingVertical: 10,
    flex: 1,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "700",
  },
  activeUnderline: {
    marginTop: 4,
    height: 2,
    width: "80%",
    backgroundColor: "#000",
    borderRadius: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  moreItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  moreItemText: {
    fontSize: 14,
    color: "#333",
  },
  closeBtn: {
    marginTop: 12,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    paddingVertical: 10,
  },
  closeIcon: {
    padding: 4,
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ffe5e5",
    borderRadius: 20,
  },
  closeBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
