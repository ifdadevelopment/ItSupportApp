import React, { useRef, useState, useMemo, useContext, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert
} from "react-native";
import { Modalize } from "react-native-modalize";
import MyHeader from "../../../component/Header/Header";
import { Ionicons } from "@expo/vector-icons";
import { DataContext } from "../../../context";
import { Formik } from "formik";
import * as Yup from "yup";
import LoadingSpinner from "../../../component/LoadingSpinner/LoadingSpinner";

const validationSchema = Yup.object().shape({
    itemId: Yup.string().required("Item is required"),
    systemId: Yup.string().required("System is required"),
    quantity: Yup.number()
        .typeError("Quantity must be a number")
        .positive("Must be positive")
        .required("Quantity is required"),
});

const AddItemToSystemForm = ({ navigation, route }) => {
    const itemModalRef = useRef(null);
    const systemModalRef = useRef(null);
    const [item, setItem] = useState(null);
    const [itemSearch, setItemSearch] = useState("");
    const [systemSearch, setSystemSearch] = useState("");
    const { apiGet, apiPut } = useContext(DataContext);
    const { id } = route.params;

    useEffect(() => {
        apiGet("/add-inventory-items/", {}, setItem); // Assuming this API endpoint provides data for items and systems
    }, []);

    const filteredItems = useMemo(() => {
        return (
            item?.data?.items?.filter((i) =>
                (i?.key ?? "").toLowerCase().includes(itemSearch.toLowerCase())
            ) ?? []
        );
    }, [item, itemSearch]);

    const filteredSystems = useMemo(() => {
        return (
            item?.data?.systems?.filter((sys) =>
                (sys?.displayTag ?? sys?.name ?? "")
                    .toLowerCase()
                    .includes(systemSearch.toLowerCase())
            ) ?? []
        );
    }, [item, systemSearch]);

    if (!item) return <LoadingSpinner />;

    return (
        <>
            <MyHeader navigation={navigation} />
            <Formik
                initialValues={{ itemId: "", systemId: id, quantity: "" }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                    const selectedItem = filteredItems.find((i) => i._id === values.itemId);
                    const enteredQuantity = Number(values.quantity);

                    // Check if the entered quantity exceeds the available stock
                    if (selectedItem && enteredQuantity > selectedItem.quantity) {
                        setErrors({ quantity: `Only ${selectedItem.quantity} items available` });
                        setSubmitting(false);  // Stop submitting the form
                        return;
                    }
                    // If quantity is valid, proceed with the submission
                    setSubmitting(true);
                    apiPut("/add-items-history/", values, setSubmitting);
                }}
            >
                {({
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                    values,
                    errors,
                    touched,
                    isSubmitting,
                }) => (
                    <View style={styles.container}>
                        {/* ITEM SELECT */}
                        <Text style={styles.label}>Select Item</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => itemModalRef.current?.open()}
                        >
                            <Text style={[styles.selectorText, values.itemId && { color: "#aaa" }]}>
                                {values.itemId
                                    ? filteredItems.find((i) => i._id === values.itemId)?.key
                                    : "Choose an item"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#64748B" />
                        </TouchableOpacity>
                        {touched.itemId && errors.itemId && (
                            <Text style={{ color: "red" }}>{errors.itemId}</Text>
                        )}

                        {/* SYSTEM SELECT */}


                        {/* QUANTITY */}
                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            placeholder="Enter quantity"
                            keyboardType="numeric"
                            style={styles.input}
                            value={values.quantity}
                            onChangeText={handleChange("quantity")}
                        />
                        {touched.quantity && errors.quantity && (
                            <Text style={{ color: "red" }}>{errors.quantity}</Text>
                        )}

                        {/* SUBMIT */}
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>
                                {isSubmitting ? (
                                    <ActivityIndicator size={19} color={"white"} />
                                ) : (
                                    "Add to System"
                                )}
                            </Text>
                        </TouchableOpacity>

                        {/* ITEM MODAL */}
                        <Modalize
                            ref={itemModalRef}
                            modalHeight={400}
                            flatListProps={{
                                data: filteredItems,
                                keyExtractor: (item) => item._id,
                                keyboardShouldPersistTaps: "handled",
                                extraData: itemSearch,
                                ListHeaderComponent: (
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Select an Item</Text>
                                        <TextInput
                                            placeholder="Search items..."
                                            style={styles.searchBox}
                                            value={itemSearch}
                                            onChangeText={setItemSearch}
                                        />
                                    </View>
                                ),
                                ListEmptyComponent: (
                                    <Text style={styles.emptyText}>
                                        {itemSearch
                                            ? "No matching items found"
                                            : "No items available"}
                                    </Text>
                                ),
                                renderItem: ({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            item.quantity === 0 && { backgroundColor: "#f8d7da" }, // Highlight out of stock items
                                        ]}
                                        onPress={() => {
                                            if (item.quantity > 0) {
                                                setFieldValue("itemId", item._id);
                                                itemModalRef.current?.close();
                                            }
                                        }}
                                        disabled={item.quantity === 0} // Disable items with no stock
                                    >
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                item.quantity === 0 && { color: "#dc3545" }, // Red color for out-of-stock items
                                            ]}
                                        >
                                            {item.key} (Stock: {item.quantity})
                                        </Text>
                                    </TouchableOpacity>
                                ),
                            }}
                        />
                        {/* SYSTEM MODAL */}
                        <Modalize
                            ref={systemModalRef}
                            modalHeight={500}
                            flatListProps={{
                                data: filteredSystems,
                                keyExtractor: (item) => item._id,
                                keyboardShouldPersistTaps: "handled",
                                extraData: systemSearch,
                                ListHeaderComponent: (
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Select a System</Text>
                                        <TextInput
                                            placeholder="Search systems..."
                                            style={styles.searchBox}
                                            value={systemSearch}
                                            onChangeText={setSystemSearch}
                                        />
                                    </View>
                                ),
                                ListEmptyComponent: (
                                    <Text style={styles.emptyText}>
                                        {systemSearch
                                            ? "No matching systems found"
                                            : "No systems available"}
                                    </Text>
                                ),
                                renderItem: ({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setFieldValue("systemId", item._id);
                                            systemModalRef.current?.close();
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>
                                            {item.displayTag || item.name}
                                        </Text>
                                    </TouchableOpacity>
                                ),
                            }}
                        />
                    </View>
                )}
            </Formik>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 16,
    },
    label: {
        fontSize: 16,
        color: "#1E293B",
        marginBottom: 6,
        marginTop: 16,
    },
    selector: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 10,
        borderColor: "#E2E8F0",
        borderWidth: 1,
    },
    selectorText: {
        fontSize: 15,
        color: "#1b1b1bff",
    },
    input: {
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 10,
        borderColor: "#E2E8F0",
        borderWidth: 1,
        fontSize: 16,
        color: "#0F172A",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#1F4FFF",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
        shadowColor: "#1F4FFF",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
        marginLeft: 10,
    },
    modalHeader: {
        padding: 16,
        borderBottomColor: "#E2E8F0",
        borderBottomWidth: 1,
        backgroundColor: "#F8FAFC",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 10,
    },
    searchBox: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#FFFFFF",
    },
    modalItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalItemText: {
        fontSize: 16,
        color: "#1E293B",
    },
    emptyText: {
        textAlign: "center",
        paddingVertical: 20,
        fontSize: 14,
        color: "#9CA3AF",
    },
    backButtonContainer: {
        paddingTop: 12,
        paddingHorizontal: 10,
        paddingBottom: 8,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "gray",
        borderRadius: 100,
        width: 40,
        height: 40,
    },
});

export default AddItemToSystemForm;
