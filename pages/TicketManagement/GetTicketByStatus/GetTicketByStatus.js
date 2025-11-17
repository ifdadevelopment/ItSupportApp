import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";
import LoadingSpinner from "../../../component/LoadingSpinner/LoadingSpinner";

const GetTicketByStatus = ({ navigation, route }) => {
    const [data, setData] = useState();
    const { socket,apiGet } = useContext(DataContext);
    const getDataFunc = () => {
        apiGet('/get-ticket-status/', route.params.filter || {}, setData);
    }
    
    useEffect(()=>{
        apiGet('/get-ticket-status/', route.params.filter || {}, setData);
    },[])
    useEffect(() => {
        if (!socket) return;

        const handleTicketRaised = (data) => {
            getDataFunc();
            // refresh state if needed
        };

        const handleUpdateTicketStatus = (data) => {
            getDataFunc();
            // refresh state if needed
        };

        socket.on("ticket_raised", handleTicketRaised);
        socket.on("update_ticket_status", handleUpdateTicketStatus);

        return () => {
            socket.off("ticket_raised", handleTicketRaised);
            socket.off("update_ticket_status", handleUpdateTicketStatus);
        };
    }, [socket]);


    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "open":
                return "#F59E0B"; // amber
            case "in-progress":
                return "#3B82F6"; // blue
            case "resolved":
                return "#10B981"; // green
            case "closed":
                return "#6B7280"; // gray
            default:
                return "#9CA3AF"; // neutral
        }
    };

    const renderTicketCard = ({ item }) => (
        <TouchableOpacity style={styles.ticketCard} onPress={() => navigation.navigate("TicketDetailsScreen", { ticketId: item._id })}>
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
                    <Text style={styles.metaText}>{item?.pc?.tagNoCpu}</Text>
                </View>
                <View style={styles.metaRow}>
                <Text  >Raised By : </Text>
                    <Text style={styles.metaText}>{item?.requestedBy?.name}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{item.sublocation}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{item.location}</Text>
                </View>
            </View>

            <View style={styles.ticketFooter}>
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}
                >
                    <Ionicons
                        name={
                            item.status === "resolved"
                                ? "checkmark-circle-outline"
                                : "time-outline"
                        }
                        size={14}
                        color="#fff"
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>

                <View style={styles.priorityBadge}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={14}
                        color="#fff"
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.badgeText}>{item.priority}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
    if (!data) return <LoadingSpinner />;

    return (
        <View style={{ flex: 1 }}>
            <MyHeader navigation={navigation} />
            <FlatList
                ListHeaderComponent={
                    <>
                        <Text style={styles.sectionTitle}>{route?.params?.heading}</Text>
                    </>
                }
                data={data?.data}
                keyExtractor={(item) => item._id}
                renderItem={renderTicketCard}
            />
        </View>
    );
};

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
        shadowOpacity: 0.05,
        elevation: 2,
    },
    summaryNumber: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
        marginTop: 6,
    },
    summaryLabel: { fontSize: 13, color: "#475569", marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: "700", margin: 12, color: "#222" },
    ticketCard: {
        backgroundColor: "#fff",
        padding: 14,
        marginHorizontal: 14,
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
    },
    ticketHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    ticketTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginLeft: 6 },
    ticketMeta: { marginBottom: 10 },
    metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    metaText: { fontSize: 13, color: "#444", marginLeft: 4 },
    ticketFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    priorityBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: "#F59E0B",
    },
});

export default GetTicketByStatus;
