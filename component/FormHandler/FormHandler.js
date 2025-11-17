import React, { useContext, useRef, useState } from "react";
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
import { Formik } from "formik";
import MyHeader from "../../component/Header/Header";
import { DataContext } from "../../context";
import generateInitialValues from "../../component/genrateInitialValues/InitialValues";
import generateValidationSchema from "../../component/GenrateValidationSchema/genrateValidationSchema";

const { width, height } = Dimensions.get("window");

export default function CommonFormHandler({ navigation, steps, my_route, buttonText }) {
    const { apiPost } = useContext(DataContext);

    const [step, setStep] = useState(0);
    const [anim] = useState(new Animated.Value(0));
    const [button, setButton] = useState(false);

    // bottom sheet state
    const modalizeRef = useRef(null);
    const [currentField, setCurrentField] = useState(null);
    const [options, setOptions] = useState([]);

    // Flatten all fields for initial values and validation
    const allFields = steps.flat();
    const initialValues = generateInitialValues(allFields);
    const validationSchema = generateValidationSchema(allFields);

    const openOptions = (fieldKey, fieldOptions) => {
        setCurrentField(fieldKey);
        setOptions(fieldOptions);
        modalizeRef.current?.open();
    };

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

    const handleSubmit = async (values) => {
        const payload = { ...values};
        const result = await apiPost(my_route, payload, setButton);
        if (result) alert("Ticket submitted successfully!");
    };

    return (
        <>
            <MyHeader navigation={navigation} />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}>
                {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <View style={styles.container}>
                        {step > 0 && (
                            <TouchableOpacity style={styles.backArrow} onPress={prevStep}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                        )}
                        <Animated.View
                            style={[styles.slider, { transform: [{ translateX: anim }] }]}
                        >
                            {steps.map((fields, idx) => (
                                <View key={idx} style={styles.slide}>
                                    {idx === 1 && <View style={{ height: 40 }} />}
                                    {fields.map((field) => (
                                        <View key={field.name} style={styles.fieldWrapper}>
                                            <Text style={styles.label}>{field.label}</Text>

                                            {field.type === "picker" ? (
                                                <TouchableOpacity
                                                    style={styles.inputRow}
                                                    onPress={() => openOptions(field.name, field.options)}
                                                >
                                                    <Ionicons
                                                        name={field.icon}
                                                        size={22}
                                                        color="darkblue"
                                                        style={styles.icon}
                                                    />
                                                    <Text style={styles.inputText}>
                                                        {values[field.name] || `Select ${field.label}`}
                                                    </Text>
                                                    <Ionicons
                                                        name="chevron-down"
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                            ) : (
                                                <View
                                                    style={[
                                                        styles.inputRow,
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
                                                        value={values[field.name]}
                                                        onChangeText={handleChange(field.name)}
                                                        multiline={field.type === "textarea"}
                                                    />
                                                </View>
                                            )}

                                            {errors[field.name] && touched[field.name] && (
                                                <Text style={{ color: "red", marginTop: 4 }}>
                                                    {errors[field.name]}
                                                </Text>
                                            )}
                                        </View>
                                    ))}

                                    {idx === steps.length - 1 && (
                                        <TouchableOpacity
                                            style={styles.submitBtn}
                                            onPress={handleSubmit}
                                        >
                                            {button ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.submitText}>{buttonText}</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </Animated.View>

                        <View style={styles.navRow}>
                            {step < steps.length - 1 && (
                                <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                                    <Text style={styles.navText}>Next</Text>
                                </TouchableOpacity>
                            )}
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
                                            setFieldValue(currentField, item.label);
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
                    </View>
                )}
            </Formik>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    slider: { flexDirection: "row", width: width * 3 },
    slide: { width, padding: 24 },
    fieldWrapper: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: "600", color: "#002fbb", marginBottom: 6 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#dcdde1",
        paddingHorizontal: 10,
        paddingVertical: 14,
    },
    icon: { marginRight: 8 },
    input: { flex: 1, padding: 12, fontSize: 15, color: "#2d3436" },
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
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: "100%",
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    submitText: { color: "#fff", fontWeight: "600", fontSize: 16 },
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
    textareaWrapper: { alignItems: "flex-start", paddingVertical: 10 },
    textareaInput: { height: 150, textAlignVertical: "top", paddingTop: 10 },
});
