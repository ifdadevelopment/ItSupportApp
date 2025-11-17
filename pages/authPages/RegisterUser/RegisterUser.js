import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { Formik } from "formik";
import * as Yup from "yup";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";

  const userTypes = ["admin", "manager", "technician", "user"];

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  user_type: Yup.string().oneOf(userTypes).required("User type is required"),
});

const AdminRegisterFormUI = ({ navigation }) => {
  const modalizeRef = useRef(null);
  

  const openUserTypePicker = () => modalizeRef.current?.open();
  const { apiPost } = useContext(DataContext);
  return (
    <>
      <MyHeader navigation={navigation} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headingWrapper}>
            <Text style={styles.headingTitle}>Create User</Text>
            <Text style={styles.headingSub}>Fill in the details to register a new admin or team member</Text>
          </View>

          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              user_type: "user",
            }}
            validationSchema={validationSchema}
            onSubmit={(values, {setSubmitting}) => {
              apiPost('/register/', { ...values, confirmPassword: values.password }, setSubmitting, ()=>{
                navigation.navigate("Home");
              });
              // You can call your API here
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }) => (
              <>
                {/* Name */}
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#353535ff"
                    style={styles.input}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    value={values.name}
                  />
                </View>
                {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#353535ff"
                    keyboardType="email-address"
                    style={styles.input}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                  />
                </View>
                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#353535ff"
                    secureTextEntry
                    style={styles.input}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                  />
                </View>
                {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                {/* User Type Picker */}
                <Pressable
                  style={styles.inputContainer}
                  onPress={openUserTypePicker}
                >
                  <Ionicons name="briefcase-outline" size={20} color="#6B7280" style={styles.icon} />
                  <Text style={[styles.input, { color: values.user_type ? "#111827" : "#9CA3AF" }]}>
                    {values.user_type || "Select User Type"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={18} color="#9CA3AF" />
                </Pressable>
                {touched.user_type && errors.user_type && (
                  <Text style={styles.errorText}>{errors.user_type}</Text>
                )}

                {/* Submit */}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>{isSubmitting ? <ActivityIndicator size={19} color={'white'} />: "Create User"}</Text>
                </TouchableOpacity>

                {/* Modalize Picker */}
                <Modalize ref={modalizeRef} adjustToContentHeight>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select User Type</Text>
                    {userTypes.map((type, i) => (
                      <Pressable
                        key={i}
                        style={({ pressed }) => [
                          styles.modalOption,
                          pressed && { backgroundColor: "#F3F4F6" },
                        ]}
                        onPress={() => {
                          setFieldValue("user_type", type);
                          modalizeRef.current?.close();
                        }}
                      >
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color="#4B5563"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.modalOptionText}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Modalize>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    flexGrow: 1,
    padding: 20,
  },
  headingWrapper: {
    marginBottom: 24,
    alignItems: "",

  },
  headingTitle: {
    marginLeft: 6,
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
  },
  headingSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "",
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#374151",
    textTransform: "capitalize",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 6,
  },
});

export default AdminRegisterFormUI;
