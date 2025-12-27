import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomButton from "../../../component/Button/Button";
import { Modalize } from 'react-native-modalize';
import AssignUserModal from "./AssignToContent";
import AnimatedInputBar from "../../../component/Input";
import { SafeAreaView } from "react-native-safe-area-context";

const TicketDetailsScreen = ({ navigation, route }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [newComment, setNewComment] = useState("");
  const { apiGet, apiPost, socket, user } = useContext(DataContext);
  const [commentButton, setCommentButton] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const modalRef = useRef(null);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  useEffect(() => {
    if (!socket) return;

    const handleTicketRaised = (data) => {
      fetchTicket();
    };

    const handleUpdateTicketStatus = (data) => {
      fetchTicket();
      // refresh state if needed
    };

    socket.on("add_comment", handleTicketRaised);
    socket.on("update_ticket_status", handleUpdateTicketStatus);

    return () => {
      socket.off("add_comment", handleTicketRaised);
      socket.off("update_ticket_status", handleUpdateTicketStatus);
    };
  }, [socket]);
  const fetchTicket = async () => {
    try {
      await apiGet(`/get-ticket/${ticketId}`, {}, setTicket);
    } catch (error) {
      console.error(error);
    }
  };

  const statusButtons = [
    { action: "add-keyboard", text: "Ticket Resolved", color: "#BBDEFB", textColor: "#0D47A1", status: "resolved" }, // light blue background, dark blue text
    { action: "add-mouse", status: "in-progress", text: "In Progress", color: "#C8E6C9", textColor: "#1B5E20" },       // light green background, dark green text
    { action: "add-ram", status: "closed", text: "Close Ticket", color: "#FFCCBC", textColor: "#BF360C" },          // light orange background, dark orange text
  ];


  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiPost(
        `/add-comment/${ticketId}/`,
        { content: newComment, isInternal: false },
        setCommentButton
      );
      setNewComment("");
      // fetchTicket();
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = () => modalRef.current?.open();

  if (!ticket) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <>
      <MyHeader navigation={navigation} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerCard}>
              <Ionicons name="document-text-outline" size={28} color="#1E3A8A" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.ticketId}>{ticket.data.ticketId} {console.log(ticket.data.pc)}</Text>
                <Text style={styles.title}>{ticket.data.title}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{ticket.data.status}</Text>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color="#6B7280"
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.metaText}>{ticket.data.priority}</Text>
                  <Ionicons
                    name="folder-outline"
                    size={16}
                    color="#6B7280"
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.metaText}>{ticket.data.category}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={30} color="#2563EB" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{ticket.data.description}</Text>
                </View>
              </View>

              {ticket.data.location && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={30} color="#DC2626" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{ticket.data.location}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={30} color="#F59E0B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Created At</Text>
                  <Text style={styles.infoValue}>
                    {new Date(ticket.data.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-circle-outline" size={30} color="#16A34A" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Requested By</Text>
                  <Text style={styles.infoValue}>
                    {ticket.data.requestedBy?.name}
                  </Text>
                  <Text style={styles.infoSubValue}>
                    {ticket.data.requestedBy?.email}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={30} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Assigned To</Text>
                  <Text style={styles.infoValue}>
                    {ticket.data.assignedTo?.name || "Not assigned"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="desktop-outline" size={30} color="#6B7280" />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>PC Serial Number</Text>
                  <Text style={styles.infoValue}>
                    {ticket.data.pc?.tagNoCpu || "No Serial Number"}
                  </Text>
                </View>
              </View>
            </View>
            {<View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Comments</Text>
              {ticket?.data?.comments?.length === 0 ? (
                <Text style={styles.sectionText}>No comments yet</Text>
              ) : (
                ticket.data?.comments?.map((c, idx) => (
                  <View key={idx} style={styles.commentBox}>
                    <Ionicons name="person-circle-outline" size={20} color="#2563EB" />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={styles.commentAuthor}>
                        {c?.author?.name || "User"} •{" "}
                        {new Date(c?.createdAt).toLocaleString()}
                      </Text>
                      <Text style={styles.commentText}>{c?.content}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>}
            {user.user_type != 'user' ? <View style={{ marginVertical: 10 }}>
              {statusButtons
                .filter((btn) => btn.status !== ticket.data.status) 
                .map((btn, idx) => (
                  <CustomButton
                    key={idx}
                    textColor={btn.textColor}
                    body={{ status: btn.status }}
                    text={btn.text}
                    route={`/update-ticket-status/${ticketId}/`}
                    color={btn.color}
                    callBackFunc={fetchTicket}
                  />
                ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => { navigation.navigate('AddItemToSystem', { id: ticket.data.pc }) }}
              >
                <Text style={styles.addButtonText}>Add Item to PC</Text>
              </TouchableOpacity>
            </View> : null}


          </ScrollView>

          {/* === Fixed Bottom Input === */}
          <View style={styles.bottomBar}>
            <View style={styles.commentInput}>
              <TextInput
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.input}
                multiline
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={addComment} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => modalRef.current?.open()} style={styles.selectBox}>
              <Text style={styles.selectText}>Assign Ticket</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView >

      <AssignUserModal
        fetchFunction={fetchTicket}
        ref={modalRef}
        userList={ticket.user?.filter((u) => u.user_type !== "user")}
        onAssign={() => { }}
        ticketId={ticketId}
      />
    </>
  );

};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, backgroundColor: "#F9FAFB", position: "relative" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 20 : 10, // safe space for iPhones
  },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#E0F7FA', // light color
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#00796B', // dark text for contrast
    fontSize: 16,
    fontWeight: '600',
  },
  ticketId: { fontSize: 13, color: "#6B7280" },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaText: { fontSize: 13, color: "#374151", marginLeft: 4 },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row", alignItems: "flex-start",
  },
  infoContent: { marginLeft: 10, flex: 1 },
  infoLabel: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#111827", fontWeight: "500" },
  infoSubValue: { fontSize: 13, color: "#4B5563" },
  commentBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
  },
  commentAuthor: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  commentText: { color: "#111827", fontSize: 14 },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    left: 0,
    right: 0,
    bottom: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#111827",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  label: { fontSize: 16, marginBottom: 6 },
  selectBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: '#f9f9f9',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  modalContent: { padding: 20 },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // marginBottom: 12,
    textAlign: 'center',
  },
  userOption: {
    paddingVertical: 14,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  userText: {
    fontSize: 16,
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subValue: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
});

export default TicketDetailsScreen;
