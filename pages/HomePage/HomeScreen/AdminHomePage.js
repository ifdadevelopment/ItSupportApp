import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  TouchableOpacity,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MyHeader from "../../../component/Header/Header";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";


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
const COLORS = {
  bg: "#F9FAFB",
  card: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  border: "#E5E7EB",
  chipText: "#FFFFFF",
  // priority
  pHigh: "#DC2626",
  pMed: "#F59E0B",
  pLow: "#16A34A",
  // status
  sOpen: "#2563EB",
  sPending: "#6B7280",
  sSolved: "#10B981",
};

const getPriorityColor = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "high") return COLORS.pHigh;
  if (p === "medium" || p === "med") return COLORS.pMed;
  return COLORS.pLow;
};

const getStatusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "open" || s === "new") return COLORS.sOpen;
  if (s === "pending" || s === "in-progress") return COLORS.sPending;
  return COLORS.sSolved; // solved/closed/default
};

const formatDate = (v) => {
  try {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
};

const Chip = memo(({ label, bg }) => (
  <View style={[styles.chip, { backgroundColor: bg }]}>
    <Text style={styles.chipText} numberOfLines={1}>
      {label}
    </Text>
  </View>
));

const Meta = memo(({ icon, text }) => (
  <View style={styles.metaRow}>
    <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
    <Text style={styles.metaText} numberOfLines={1}>
      {text || "—"}
    </Text>
  </View>
));

const Separator = () => <View style={styles.separator} />;

const EmptyBlock = ({ icon, title, subtitle }) => (
  <View style={styles.emptyWrap} accessible accessibilityRole="text">
    <Ionicons name={icon} size={28} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySub}>{subtitle}</Text>
  </View>
);

const AdminHome = ({ navigation, data }) => {
  const summary = data?.summary || {};
  const tickets = data?.tickets || [];
  const users = data?.users || [];
 const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const renderSummaryCard = useCallback(
    (icon, label, value, color, bg) => (
      <View style={[styles.summaryCard, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.summaryNumber}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    ),
    []
  );
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
  // const renderTicketCard = useCallback(
  //   ({ item }) => {
  //     const prColor = getPriorityColor(item?.priority);
  //     const stColor = getStatusColor(item?.status);

  //     return (
  //       <Pressable
  //         onPress={() =>
  //           navigation.navigate("TicketDetailsScreen", { ticketId: item?._id })
  //         }
  //         android_ripple={{ color: "#E5E7EB" }}
  //         style={styles.ticketCard}
  //         accessibilityRole="button"
  //         accessibilityLabel={`Ticket ${item?.title || "Untitled"}`}
  //       >
  //         {/* Title + ID */}
  //         <View style={styles.ticketHeader}>
  //           <Text style={styles.ticketTitle} numberOfLines={2}>
  //             {item?.title || "Untitled Ticket"}
  //           </Text>
  //           <Text style={styles.ticketId} selectable>
  //             #{(item?._id || "").slice(-6) || "—"}
  //           </Text>
  //         </View>
  //         {/* Pc Number */}

  //         {/* Chips */}
  //         <View style={styles.ticketChips}>
  //           <Chip label={`Priority: ${item?.priority || "low"}`} bg={prColor} />
  //           <Chip label={item?.status || "open"} bg={stColor} />
  //           {!!item?.category && <Chip label={item.category} bg={"#334155"} />}
  //         </View>

  //         {/* Meta */}
  //         <View style={styles.ticketMetaWrap}>
  //           <Meta icon="person-outline" text={`By: ${item?.requestedBy?.name || item?.requester || "Unknown"}`} />
  //           <Meta icon="person-circle-outline" text={`To: ${item?.assignedTo?.name || item?.assignee || "Unassigned"}`} />
  //         </View>

  //         <View style={styles.ticketMetaWrap}>
  //           <Meta icon="time-outline" text={formatDate(item?.createdAt)} />
  //           <Meta icon="refresh-outline" text={formatDate(item?.updatedAt)} />
  //         </View>
  //       </Pressable>
  //     );
  //   },
  //   [navigation]
  // );
  // const renderTicketCard = useCallback(
  //   ({ item }) => {
  //     const prColor = getPriorityColor(item?.priority);
  //     const stColor = getStatusColor(item?.status);

  //     return (
  //       <Pressable
  //         onPress={() =>
  //           navigation.navigate("TicketDetailsScreen", { ticketId: item?._id })
  //         }
  //         android_ripple={{ color: "#E5E7EB" }}
  //         style={styles.ticketCard}
  //         accessibilityRole="button"
  //         accessibilityLabel={`Ticket ${item?.title || "Untitled"}`}
  //       >
  //         {/* Title + ID */}
  //         <View style={styles.ticketHeader}>
  //           <Text style={styles.ticketTitle} numberOfLines={2}>
  //             {item?.title || "Untitled Ticket"}
  //           </Text>
  //           <Text style={styles.ticketId} selectable>
  //             #{(item?._id || "").slice(-6) || "—"}
  //           </Text>
  //         </View>

  //         {/* Chips */}
  //         <View style={styles.ticketChips}>
  //           <Chip label={`Priority: ${item?.priority || "low"}`} bg={prColor} />
  //           <Chip label={item?.status || "open"} bg={stColor} />
  //           {!!item?.category && <Chip label={item.category} bg={"#334155"} />}
  //         </View>

  //         {/* Meta */}
  //         <View style={styles.ticketMetaWrap}>
  //           <Meta icon="person-outline" text={`By: ${item?.requestedBy?.name || item?.requester || "Unknown"}`} />
  //           <Meta icon="person-circle-outline" text={`To: ${item?.assignedTo?.name || item?.assignee || "Unassigned"}`} />
  //           <Meta
  //             icon="desktop-outline"
  //             text={`PC: ${item?.pc?.tagNoCpu || "No Serial Number"}`}
  //           />
  //         </View>

  //         <View style={styles.ticketMetaWrap}>
  //           <Meta icon="time-outline" text={formatDate(item?.createdAt)} />
  //           <Meta icon="refresh-outline" text={formatDate(item?.updatedAt)} />
  //         </View>
  //       </Pressable>
  //     );
  //   },
  //   [navigation]
  // );
const renderTicketCard = useCallback(
  ({ item }) => {
    const prColor = getPriorityColor(item?.priority);
    const stColor = getStatusColor(item?.status);

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("TicketDetailsScreen", {
            ticketId: item?._id,
          })
        }
        android_ripple={{ color: "#E5E7EB" }}
        style={styles.ticketCard}
        accessibilityRole="button"
        accessibilityLabel={`Ticket ${item?.title || "Untitled"}`}
      >
        {/* Title + ID */}
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle} numberOfLines={2}>
            {item?.title || "Untitled Ticket"}
          </Text>
          <Text style={styles.ticketId} selectable>
            #{(item?._id || "").slice(-6) || "—"}
          </Text>
        </View>

        {/* Chips */}
        <View style={styles.ticketChips}>
          <Chip label={`Priority: ${item?.priority || "low"}`} bg={prColor} />
          <Chip label={item?.status || "open"} bg={stColor} />
          {!!item?.category && <Chip label={item.category} bg="#334155" />}
        </View>

        {/* Meta */}
        <View style={styles.ticketMetaWrap}>
          <Meta
            icon="person-outline"
            text={`By: ${
              item?.requestedBy?.name || item?.requester || "Unknown"
            }`}
          />
          <Meta
            icon="person-circle-outline"
            text={`To: ${
              item?.assignedTo?.name || item?.assignee || "Unassigned"
            }`}
          />
          <Meta
            icon="desktop-outline"
            text={`PC: ${item?.pc?.tagNoCpu || "No Serial Number"}`}
          />
        </View>

        <View style={styles.ticketMetaWrap}>
          <Meta icon="time-outline" text={formatDate(item?.createdAt)} />
          <Meta icon="refresh-outline" text={formatDate(item?.updatedAt)} />
        </View>
        {item.attachments?.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 6,
                color: "#1F2937",
              }}
            >
              Attachments
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {item.attachments.map((file, index) => {
                const type = getFileType(file.url);

                return (
                  <Pressable
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
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </Pressable>
    );
  },
  [navigation]
);

  const renderUserRow = ({ item }) => {
    const statusColor = item?.active ? "#10B981" : "#EF4444";
    const joinedDate = formatDate(item?.createdAt);
    console.log(item);
    const tickets = item?.ticketsRaised ?? 0;


    return (
      <View style={styles.userCard}>
        <View style={styles.userInfoWrap}>
          <Ionicons name="person-circle-outline" size={38} color="#2563EB" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.userName}>{item?.name || "Unnamed"}</Text>
            <Text style={styles.userEmail}>{item?.email || "No email"}</Text>
            <Text style={styles.userMeta}>
              Role: <Text style={{ fontWeight: "600" }}>{item?.user_type || "user"}</Text> | Joined: {joinedDate}
            </Text>
          </View>
        </View>

        <View style={styles.userStatsRow}>
          <View style={[styles.userStatusChip, { backgroundColor: statusColor }]}>
            <Text style={styles.userStatusText}>{item?.active ? "Active" : "Inactive"}</Text>
          </View>
          <View style={[styles.userTicketChip]}>
            <Ionicons name="ticket-outline" size={14} color="#fff" />
            <Text style={styles.userTicketText}>{tickets} tickets</Text>
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={{ flex: 1 }}>
      <MyHeader navigation={navigation} />
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
        {/* Overview */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.summaryRow}>
          {renderSummaryCard("people-outline", "Users", summary?.totalUsers || 0, "#2563EB", "#E0F2FE")}
          {renderSummaryCard("albums-outline", "Tickets", summary?.totalTickets || 0, "#9333EA", "#F3E8FF")}
          {renderSummaryCard("time-outline", "Pending", summary?.pending || 0, "#F59E0B", "#FEF3C7")}
          {renderSummaryCard("checkmark-done-outline", "Solved", summary?.solved || 0, "#16A34A", "#DCFCE7")}
          {renderSummaryCard("cube-outline", "Taken Inv.", summary?.inventoryTaken || 0, "#DC2626", "#FEE2E2")}
          {renderSummaryCard("archive-outline", "Available Inv.", summary?.inventoryAvailable || 0, "#0EA5E9", "#E0F2FE")}
        </View>

        {/* Recent Tickets */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
        </View>
        <FlatList
          data={tickets}
          keyExtractor={(item, i) => String(item?._id || i)}
          renderItem={renderTicketCard}
          ItemSeparatorComponent={Separator}
          scrollEnabled={false}
          ListEmptyComponent={
            <EmptyBlock
              icon="document-text-outline"
              title="No tickets yet"
              subtitle="New tickets will appear here with priority, status and meta."
            />
          }
        />
        {/* Top Users */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Top Active Users</Text>
        </View>
        <FlatList
          data={users}
          keyExtractor={(item, i) => String(item?._id || i)}
          renderItem={renderUserRow}
          ItemSeparatorComponent={() => <View style={styles.userDivider} />}
          scrollEnabled={false}
          ListEmptyComponent={
            <EmptyBlock
              icon="people-outline"
              title="No users to show"
              subtitle="User activity will show here once tickets are created."
            />
          }
        />
      </ScrollView>
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
  container: { flex: 1, padding: 14, backgroundColor: COLORS.bg },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 12, color: COLORS.textPrimary },
  sectionHeaderRow: { marginTop: 4, marginBottom: 6 },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "47%",
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  summaryNumber: { fontSize: 20, fontWeight: "800", color: "#111827" },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary },

  // Ticket
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  ticketTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  ticketId: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
  ticketChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: { color: COLORS.chipText, fontWeight: "700", fontSize: 11, textTransform: "capitalize" },
  ticketMetaWrap: {
    flexDirection: "row",
    gap: 18,
    marginTop: 12,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  metaText: { color: COLORS.textSecondary, fontSize: 12, flexShrink: 1 },

  // Users
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  userEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    gap: 6
  },
  userChipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  userDivider: { height: 10 },

  // Misc
  separator: { height: 12 },
  emptyWrap: { alignItems: "center", paddingVertical: 18, gap: 6 },
  emptyTitle: { fontWeight: "700", color: COLORS.textPrimary },
  emptySub: { color: COLORS.textSecondary, fontSize: 12 },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    borderColor: "#E5E7EB",
    borderWidth: StyleSheet.hairlineWidth,
  },
  userInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  userMeta: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 2,
  },
  userStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userStatusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  userStatusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },
  userTicketChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  userTicketText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  
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

export default AdminHome;
