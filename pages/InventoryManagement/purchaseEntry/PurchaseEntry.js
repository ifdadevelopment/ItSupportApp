import React, { useContext, useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";

const { width, height } = Dimensions.get("window");

export default function PurchaseEntryForm({ navigation, currentUser }) {
    const { apiPost } = useContext(DataContext);
    const [form, setForm] = useState({
        name: "",
        category: "Computer",   // default
        brand: "",
        model: "",
        serialNumber: "",
        location: "Kalkaji Lab 1", // default
        // status: "Available",       // default
        // condition: "Good",         // default
        price: "",
        description: "",
    });

    const [step, setStep] = useState(0);
    const [anim] = useState(new Animated.Value(0));
    const [button, setButton] = useState(false);
    // bottom sheet state
    const modalizeRef = useRef(null);
    const [currentField, setCurrentField] = useState(null);
    const [options, setOptions] = useState([]);

    const openOptions = (fieldKey, fieldOptions) => {
        setCurrentField(fieldKey);
        setOptions(fieldOptions);
        modalizeRef.current?.open();
    };

    const handleChange = (key, value) => setForm({ ...form, [key]: value });

    const steps = [
        [
            {
                key: "name",
                label: "Item Name",
                type: "text",
                placeholder: "Enter item name",
                icon: "cube",
            },
            {
                key: "price",
                label: "Price",
                type: "text",
                placeholder: "Enter price",
                icon: "cash-outline",
            },
            {
                key: "serialNumber",
                label: "Serial Number",
                type: "text",
                placeholder: "Enter serial number",
                icon: "barcode-outline",
            },

            {
                key: "category",
                label: "Category",
                type: "picker",
                icon: "list",
                options: [
                    { label: "Computer", icon: "desktop-outline" },
                    { label: "Laptop", icon: "laptop-outline" },
                    { label: "Printer", icon: "print-outline" },
                    { label: "Monitor", icon: "tv-outline" },
                    { label: "Networking Equipment", icon: "wifi-outline" },
                    { label: "Mobile", icon: "phone-portrait-outline" },
                    { label: "Tablet", icon: "tablet-landscape-outline" },
                    { label: "Server", icon: "server-outline" },
                    { label: "Other", icon: "ellipsis-horizontal" },
                ],
            },

        ],
        [
            {
                key: "brand",
                label: "Brand",
                type: "text",
                placeholder: "Enter brand",
                icon: "pricetag-outline",
            },
            {
                key: "model",
                label: "Model",
                type: "text",
                placeholder: "Enter model",
                icon: "construct-outline",
            },
            // {
            //     key: "condition",
            //     label: "Condition",
            //     type: "picker",
            //     icon: "alert-circle-outline",
            //     options: [
            //         { label: "Excellent", icon: "star-outline" },
            //         { label: "Good", icon: "thumbs-up-outline" },
            //         { label: "Fair", icon: "help-circle-outline" },
            //         { label: "Poor", icon: "alert-outline" },
            //     ],
            // },            
            {
                key: "location",
                label: "Location",
                type: "picker",
                icon: "location",
                options: [
                    { key: "loc1", label: "Kalkaji Lab 1", icon: "location-outline" },
                    { key: "loc2", label: "Kalkaji Lab 2", icon: "location-outline" },
                    { key: "loc3", label: "Kalkaji Lab 3", icon: "location-outline" },
                ],
            },

        ],
        [
            {
                key: "description",
                label: "Description",
                type: "textarea",
                placeholder: "Enter description",
                icon: "create-outline",
            },
        ]
    ];


    const nextStep = () => {
        if (step < steps.length - 1) {
            Animated.timing(anim, {
                toValue: -(step + 1) * width,
                duration: 300,
                useNativeDriver: true,
            }).start();
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            Animated.timing(anim, {
                toValue: -(step - 1) * width,
                duration: 300,
                useNativeDriver: true,
            }).start();
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        const payload = { ...form, requestedBy: currentUser?.id };
        const result = await apiPost(`/add-inventory/`, payload, setButton);
        if (result) alert("Inventory Added Successfully!!");
    };

    return (
        <>
            <MyHeader navigation={navigation} />
            <View style={styles.container}>
                {step > 0 && (
                    <TouchableOpacity style={[styles.backArrow]} onPress={prevStep}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                )}
                <Animated.View
                    style={[styles.slider, { transform: [{ translateX: anim }] }]}
                >
                    {steps.map((fields, idx) => (
                        <View key={idx} style={[styles.slide]} >
                            {idx >= 1 ? <View style={{ height: 40 }} /> : null}
                            {fields.map((field, fIdx) => (
                                <View key={field.key} style={styles.fieldWrapper}>
                                    <Text style={styles.label}>{field.label}</Text>
                                    {field.type === "picker" ? (
                                        <TouchableOpacity
                                            style={[styles.inputRow, {
                                                paddingVertical: 14
                                            }]}
                                            onPress={() => openOptions(field.key, field.options)}
                                        >
                                            <Ionicons
                                                name={field.icon}
                                                size={22}
                                                color="darkblue"
                                                style={styles.icon}
                                            />
                                            <Text style={styles.inputText}>{form[field.key]}</Text>
                                            <Ionicons name="chevron-down" size={20} color="#666" />
                                        </TouchableOpacity>
                                    ) : (
                                        <View
                                            style={[
                                                styles.inputRow, { paddingVertical: 4 },
                                                field.type === "textarea" && styles.textareaWrapper,
                                            ]}
                                        >
                                            <Ionicons
                                                name={field.icon}
                                                size={22}
                                                color="darkblue"
                                                style={[
                                                    styles.icon,
                                                    field.type === "textarea" && { marginTop: 12 },
                                                ]}
                                            />
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    field.type === "textarea" && styles.textareaInput,
                                                ]}
                                                placeholder={field.placeholder}
                                                value={form[field.key]}
                                                onChangeText={(v) => handleChange(field.key, v)}
                                                multiline={field.type === "textarea"}
                                            />
                                        </View>
                                    )}
                                    {fIdx === fields.length - 1 && (
                                        <>
                                            {idx === steps.length - 1 ? (
                                                <TouchableOpacity
                                                    style={[styles.submitBtn, { marginTop: 16 }]}
                                                    onPress={handleSubmit}
                                                >
                                                    {button ? (
                                                        <ActivityIndicator size="small" color="#fff" />
                                                    ) : (
                                                        <Text style={styles.submitText}>Add Inventory</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    style={[styles.submitBtn, { marginTop: 16 }]}
                                                    onPress={nextStep}
                                                >
                                                    <Text style={styles.navText}>Next</Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </Animated.View>
                {/* Navigation buttons */}
            </View>
            {/* Bottom Sheet */}
            <Modalize
                ref={modalizeRef}
                modalHeight={height * 0.8}
                handlePosition="inside"
                withHandle
                modalStyle={styles.modal}
                flatListProps={{
                    data: options,
                    keyExtractor: (item) => item.label,
                    renderItem: ({ item }) => (
                        <Pressable
                            android_ripple={{ color: "#f2f2f2" }}
                            style={styles.optionRow}
                            onPressIn={() => {
                                handleChange(currentField, item.label);
                                modalizeRef.current?.close();
                            }}
                        >
                            <View style={styles.optionLeft}>
                                <Ionicons
                                    name={item.icon}
                                    size={20}
                                    color="#4a90e2"
                                    style={{ marginRight: 12 }}
                                />
                                <Text style={styles.optionText}>{item.label}</Text>
                            </View>
                        </Pressable>
                    ),
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    slider: { flexDirection: "row", width: width * 3 },
    slide: { width, padding: 24 },
    fieldWrapper: { marginBottom: 20 },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#002fbb",
        marginBottom: 6,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#dcdde1",
        paddingHorizontal: 10,
    },
    icon: { marginRight: 8 },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 15,
        color: "#2d3436"
    },
    inputText: { flex: 1, fontSize: 15, color: "#2d3436" },
    navRow: { flexDirection: "row", justifyContent: "space-between", margin: 24 },
    nextBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#080a0c",
        alignItems: "center",
    },
    submitBtn: {
        paddingVertical: 12,   // slimmer height
        paddingHorizontal: 20, // good spacing left/right
        borderRadius: 12,      // pill shape
        width: "100%",
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",   // centers button, doesn’t stretch
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    navText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    backArrow: {
        position: "absolute",
        top: 10,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: "#fff",
        borderRadius: 50,
        elevation: 3,
    },
    modal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionLeft: { flexDirection: "row", alignItems: "center" },
    optionText: { fontSize: 16, color: "#333" },
    textareaWrapper: {
        alignItems: "flex-start",
        paddingVertical: 10,
    },
    textareaInput: {
        height: 150,
        textAlignVertical: "top",
        paddingTop: 10,
    },

});
