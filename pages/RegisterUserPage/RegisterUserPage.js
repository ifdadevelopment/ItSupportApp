// pages/Auth/RegisterScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import LoadingSpinner from "../../component/LoadingSpinner/LoadingSpinner";
import Btn from "../../component/Btn";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import Toast from "react-native-toast-message";

// ✅ Validation Schema
const RegisterSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm your password"),
});

export default function RegisterScreen({ navigation }) {
    const [button, setButton] = useState(false);
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register</Text>
                <View style={{ width: 24 }} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Create New User</Text>
                    <Formik
                        initialValues={{ email: "", password: "", confirmPassword: "" }}
                        validationSchema={RegisterSchema}
                        onSubmit={async (values, actions) => {
                            setButton(true);
                            try {
                                const res = await axios.post(`${API_BASE_URL}/register/`, values);
                                Toast.show({
                                    type: "success",
                                    text1: "Registration Successful",
                                    text2: "Welcome aboard!",
                                    position: "top",
                                    visibilityTime: 3000,
                                });
                                actions.resetForm();
                                navigation.popToTop();
                                navigation.navigate("Users");
                            } catch (error) {
                                Toast.show({
                                    type: "error",
                                    text1: "Registration Failed",
                                    text2: error.response?.data?.error || "Something went wrong",
                                    position: "top",
                                    visibilityTime: 3000,
                                });
                            } finally {
                                setButton(false);
                            }
                        }}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched, props
                        }) => (
                            <>
                                {/* Name */}

                                {/* Name */}
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        placeholderTextColor="#aaa"
                                        autoCapitalize="words"
                                        onChangeText={handleChange("name")}
                                        onBlur={handleBlur("name")}
                                        value={values.name}
                                    />
                                    {errors.name && touched.name && (
                                        <Text style={styles.errorText}>{errors.name}</Text>
                                    )}
                                </View>

                                {/* Email */}
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="#aaa"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onChangeText={handleChange("email")}
                                        onBlur={handleBlur("email")}
                                        value={values.email}
                                    />
                                    {errors.email && touched.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}
                                </View>

                                {/* Password */}
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#aaa"
                                        secureTextEntry
                                        onChangeText={handleChange("password")}
                                        onBlur={handleBlur("password")}
                                        value={values.password}
                                    />
                                    {errors.password && touched.password && (
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    )}
                                </View>

                                {/* Confirm Password */}
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#aaa"
                                        secureTextEntry
                                        onChangeText={handleChange("confirmPassword")}
                                        onBlur={handleBlur("confirmPassword")}
                                        value={values.confirmPassword}
                                    />
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <Text style={styles.errorText}>
                                            {errors.confirmPassword}
                                        </Text>
                                    )}
                                </View>

                                {/* Button */}
                                {button
                                    ? <LoadingSpinner />
                                    : <Btn
                                        width={"100%"}
                                        textColor="white"
                                        bgColor={"green"}
                                        btnLabel="Create User"
                                        Press={handleSubmit}
                                    />
                                }

                                {/* Go Back Home */}
                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => navigation.navigate("Home")}
                                >
                                    <Text>  <Ionicons name="arrow-back" size={40} color="black" style={styles.linkText} /> Go Back Home</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },

    // ✅ Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#075E54",
        padding: 20,
        paddingTop: 36,
        justifyContent: "space-between",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    container: { flex: 1 },
    scrollContainer: {
        padding: 20,
        justifyContent: "center",
        flexGrow: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#333",
        marginBottom: 25,
        textAlign: "center",
    },
    inputGroup: { marginBottom: 15 },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    errorText: { color: "red", fontSize: 13, marginTop: 5 },
    button: {
        backgroundColor: "#075E54",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonText: { color: "white", fontSize: 16, fontWeight: "600" },

    // ✅ Go Back Home link
    linkButton: {
        marginTop: 20,
        alignItems: "center",
    },
    linkText: {
        color: "#075E54",
        fontSize: 14,
        fontWeight: "500",
    },
});
