import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import dayjs from "dayjs";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";

/* -----------------------------------------
   File Helpers
----------------------------------------- */
const getFileType = (url = "") => {
  const ext = url.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["mp4", "mov"].includes(ext)) return "video";
  return "file";
};

const getIconByType = (type) => {
  switch (type) {
    case "pdf":
      return "document-text-outline";
    case "doc":
      return "document-attach-outline";
    case "xls":
      return "grid-outline";
    case "video":
      return "videocam-outline";
    default:
      return "document-outline";
  }
};

/* -----------------------------------------
   Main Component
----------------------------------------- */
const TechnicianHomePage = ({ navigation, data, getDataFunc }) => {
  const { socket, user } = useContext(DataContext);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  if (!data) return null;

  /* -----------------------------------------
     Socket Listeners
  ----------------------------------------- */
  useEffect(() => {
    if (!socket) return;

    const refresh = () => getDataFunc();

    socket.on("ticket_raised", refresh);
    socket.on("update_ticket_status", refresh);

    return () => {
      socket.off("ticket_raised", refresh);
      socket.off("update_ticket_status", refresh);
    };
  }, [socket]);

  const { summary, tickets } = data;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#F59E0B";
      case "in-progress":
        return "#3B82F6";
      case "resolved":
        return "#10B981";
      case "closed":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  /* -----------------------------------------
      Open Attachment
  ----------------------------------------- */
  const handleOpenAttachment = async (file, type) => {
    try {
      if (!file?.url) return alert("Invalid file URL");

      // 🔥 Open image preview modal
      if (type === "image") {
        setPreviewImage(file.url);
        setPreviewVisible(true);
        return;
      }

      // 🔥 For docs — download + share
      const fileName = file.originalName || file.url.split("/").pop();
      const localUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(file.url, localUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return alert("Sharing not available");

      await Sharing.shareAsync(downloadResult.uri);
    } catch (err) {
      console.log("Attachment error:", err.message);
      alert("Unable to open attachment.");
    }
  };

  /* -----------------------------------------
      Render Ticket Card
  ----------------------------------------- */
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

        {/* PC Info */}
        {item?.pc?.tagNoCpu && (
          <View style={styles.metaRow}>
            <Ionicons name="desktop-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{item.pc.tagNoCpu}</Text>
          </View>
        )}

        {/* Resolved Status */}
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

      {/* Attachments */}
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
                    <Image source={{ uri: file.url }} style={styles.attachmentImage} />
                  ) : (
                    <Ionicons
                      name={getIconByType(type)}
                      size={26}
                      color="#1E40AF"
                      style={{ marginRight: 6 }}
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

            {/* Summary Stats */}
            <View style={styles.summaryRow}>
              <SummaryCard
                label="Total Tickets"
                value={summary?.totalTicket}
                icon="albums-outline"
                bg="#E3F2FD"
                color="#2563EB"
                onPress={() =>
                  navigation.navigate("TicketHistory", {
                    heading: "Total Tickets",
                    filter: {},
                  })
                }
              />

              <SummaryCard
                label="Assigned Tickets"
                value={summary?.totalAssigned}
                icon="albums-outline"
                bg="#E3F2FD"
                color="#2563EB"
                onPress={() =>
                  navigation.navigate("TicketHistory", {
                    heading: "Assigned Tickets",
                    filter: { assignedTo: user._id },
                  })
                }
              />

              <SummaryCard
                label="Pending"
                value={summary?.pendingAssigned}
                icon="time-outline"
                bg="#FFF3E0"
                color="#F59E0B"
                onPress={() =>
                  navigation.navigate("TicketHistory", {
                    heading: "Pending Tickets",
                    filter: { status: "pending" },
                  })
                }
              />

              <SummaryCard
                label="In Progress"
                value={summary?.inProgress}
                icon="construct-outline"
                bg="#DBEAFE"
                color="#3B82F6"
                onPress={() =>
                  navigation.navigate("TicketHistory", {
                    heading: "In Progress",
                    filter: { status: "in-progress" },
                  })
                }
              />

              <SummaryCard
                label="Resolved"
                value={summary?.resolvedByTech}
                icon="checkmark-done-outline"
                bg="#E8F5E9"
                color="#16A34A"
                onPress={() =>
                  navigation.navigate("TicketHistory", {
                    heading: "Resolved Tickets",
                    filter: { status: "resolved" },
                  })
                }
              />
            </View>

            <Text style={styles.sectionTitle}>Recent Raised Tickets</Text>
          </>
        }
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={renderTicketCard}
      />

      {/* FULLSCREEN IMAGE PREVIEW */}
      <Modal transparent visible={previewVisible}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPreviewVisible(false)}
          >
            <Ionicons name="close-circle" size={38} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{ uri: previewImage }}
            style={styles.fullPreviewImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

/* -----------------------------------------
    Small Summary Card Component
----------------------------------------- */
const SummaryCard = ({ label, value, icon, bg, color, onPress }) => (
  <TouchableOpacity style={[styles.summaryCard, { backgroundColor: bg }]} onPress={onPress}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.summaryNumber}>{value || 0}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </TouchableOpacity>
);

/* -----------------------------------------
   Styles
----------------------------------------- */
const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
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
  summaryLabel: { fontSize: 13, color: "#475569", marginTop: 2 },

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

  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  ticketTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
    color: "#111",
  },

  ticketMeta: { marginBottom: 10 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  metaText: { fontSize: 13, color: "#444", marginLeft: 4 },

  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    padding: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: "47%",
  },

  attachmentText: {
    fontSize: 11,
    color: "#1E3A8A",
    maxWidth: 120,
  },

  attachmentImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullPreviewImage: {
    width: "90%",
    height: "80%",
  },

  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default TechnicianHomePage;
