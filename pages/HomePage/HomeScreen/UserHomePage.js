import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";
import dayjs from "dayjs";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
const getFileType = (url = "") => {
  const ext = url.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["zip", "rar"].includes(ext)) return "zip";

  return "file";
};

const getIconByType = (type) => {
  switch (type) {
    case "pdf":
      return "document-text-outline";
    case "doc":
      return "document-outline";
    case "xls":
      return "grid-outline";
    case "zip":
      return "file-tray-full-outline";
    default:
      return "document-attach-outline";
  }
};

const UserHomePage = ({ navigation, data, getDataFunc }) => {
  const { ticketSummary, tickets, socket } = data;
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  useEffect(() => {
    if (!socket) return;

    const refresh = () => getDataFunc();

    socket.on("inventory_update", refresh);
    socket.on("update_ticket_status", refresh);

    return () => {
      socket.off("inventory_update", refresh);
      socket.off("update_ticket_status", refresh);
    };
  }, [socket]);
  const handleOpenAttachment = async (file, type) => {
    try {
      if (!file?.url) return alert("Invalid file URL");

      // 🔥 Open image in WhatsApp-style fullscreen modal
      if (type === "image") {
        setPreviewImage(file.url);
        setPreviewVisible(true);
        return;
      }

      // 🔥 For documents, download & share
      const fileName = file.originalName || file.url.split("/").pop();
      const localUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(file.url, localUri);

      if (!downloadResult?.uri) return alert("Unable to download file");

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return alert("Sharing not available on this device");

      await Sharing.shareAsync(downloadResult.uri);
    } catch (e) {
      console.log("Attachment Error:", e.message);
      alert("Unable to open attachment.");
    }
  };
  const renderTicketCard = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() =>
        navigation.navigate("TicketDetailsScreen", { ticketId: item._id })
      }
    >
      <View style={styles.ticketHeader}>
        <Ionicons name="document-text-outline" size={22} color="#1E3A8A" />
        <Text style={styles.ticketTitle}>{item.title}</Text>
      </View>

      <View style={styles.ticketMeta}>
        <View style={styles.metaRow}>
          <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.ticketId}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="desktop-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item?.pc?.tagNoCpu}</Text>
        </View>

        <Text
          style={[
            styles.metaText,
            !item.resolvedDate && { color: "#9CA3AF", fontStyle: "italic" },
          ]}
        >
          {item.resolvedDate
            ? `Resolved at ${dayjs(item.resolvedDate).format(
                "DD MMM YYYY, hh:mm A"
              )}`
            : "Not resolved yet"}
        </Text>
      </View>
      {item.attachments?.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}>
            Attachments
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {item.attachments.map((file, index) => {
              const type = getFileType(file.url);

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentChip}
                  onPress={() => handleOpenAttachment(file, type)}
                >
                  {type === "image" ? (
                    <Image
                      source={{ uri: file.url }}
                      style={styles.attachmentImage}
                    />
                  ) : (
                    <Ionicons
                      name={getIconByType(type)}
                      size={26}
                      color="#1E40AF"
                      style={{ marginRight: 8 }}
                    />
                  )}

                  <Text numberOfLines={1} style={styles.attachmentText}>
                    {file.originalName || `${index + 1}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
  return (
    <View style={{ flex: 1 }}>
      <MyHeader navigation={navigation} />

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Overview</Text>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="albums-outline" size={28} color="#2563EB" />
                <Text style={styles.summaryNumber}>{ticketSummary?.total}</Text>
                <Text style={styles.summaryLabel}>Total Ticket</Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="checkmark-done-outline" size={28} color="#16A34A" />
                <Text style={styles.summaryNumber}>{ticketSummary?.solved}</Text>
                <Text style={styles.summaryLabel}>Solved</Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="time-outline" size={28} color="#F59E0B" />
                <Text style={styles.summaryNumber}>{ticketSummary?.pending}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="time-outline" size={28} color="#F59E0B" />
                <Text style={styles.summaryNumber}>
                  {ticketSummary?.inProgress}
                </Text>
                <Text style={styles.summaryLabel}>In Progress</Text>
              </View>
            </View>
          </>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>My Last 5 Tickets</Text>

            <FlatList
              data={tickets.slice(0, 5)}
              renderItem={renderTicketCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          </>
        }
      />
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setPreviewVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>

          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  summaryCard: {
    width: "47%",
    marginVertical: 6,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    margin: 12,
    color: "#222",
  },

  ticketCard: {
    backgroundColor: "#fff",
    padding: 14,
    marginHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  ticketHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ticketTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginLeft: 6 },

  ticketMeta: { marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  metaText: { fontSize: 13, color: "#444", marginLeft: 4 },

  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: "80%",
  },

  attachmentImage: {
    width: 38,
    height: 38,
    borderRadius: 6,
    marginRight: 8,
  },

  attachmentText: {
    fontSize: 12,
    color: "#1F2937",
    flexShrink: 1,
  },

  /* 🔥 Fullscreen modal */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default UserHomePage;
