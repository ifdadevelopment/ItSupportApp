import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

import { Formik } from "formik";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../../config";
import inputLoginArr from "./LoginArr";
import generateValidationSchema from "../../../component/GenrateValidationSchema/genrateValidationSchema";
import genrateInitalValues from "../../../component/genrateInitialValues/InitialValues";
import { DataContext } from "../../../context";

const Login = ({ navigation }) => {
  const validationSchema = generateValidationSchema(inputLoginArr);
  const initialValues = genrateInitalValues(inputLoginArr);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { setToken, setUser } = useContext(DataContext);

  const handleLogin = async (values) => {
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE_URL}/login/`, values);

      await AsyncStorage.setItem("refreshToken", res?.data?.refreshToken);
      setToken(res?.data?.accessToken);
      setUser(res?.data?.my_user);

      navigation.replace("Home");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error.response?.data?.error || "Invalid username or password",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Toast />

        <View style={styles.container}>
          <Image
            source={require("../../../assets/ifda.png")}
            style={styles.logo}
          />

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              errors,
              touched,
            }) => (
              <View style={{ width: "100%" }}>
                {inputLoginArr.map((field, index) => {
                  const hasError =
                    errors[field.name] && touched[field.name];
                  const isPassword = field.name === "password";

                  return (
                    <View key={index} style={{ marginBottom: 16 }}>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              borderColor: hasError
                                ? "red"
                                : touched[field.name]
                                ? "#4a90e2"
                                : "#ddd",
                              paddingRight: isPassword ? 44 : 12,
                            },
                          ]}
                          placeholder={field.placeholder}
                          placeholderTextColor="#999"
                          onChangeText={handleChange(field.name)}
                          onBlur={handleBlur(field.name)}
                          secureTextEntry={
                            isPassword && !passwordVisible
                          }
                          autoCapitalize="none"
                          selectionColor="#4a90e2"
                          keyboardType={
                            field.name === "email"
                              ? "email-address"
                              : "default"
                          }
                        />

                        {isPassword && (
                          <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() =>
                              setPasswordVisible((prev) => !prev)
                            }
                          >
                            <Ionicons
                              name={
                                passwordVisible
                                  ? "eye-off"
                                  : "eye"
                              }
                              size={22}
                              color="#4a90e2"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      {hasError && (
                        <Text style={styles.errorText}>
                          {errors[field.name]}
                        </Text>
                      )}
                    </View>
                  );
                })}

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={isSubmitting ? null : handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.loginText}>Log In</Text>
                  )}
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPasswordCenter}
                  onPress={() =>
                    navigation.navigate("ForgotPassword")
                  }
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* OR Divider */}
                {/* <View style={styles.dividerContainer}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.line} />
                </View> */}

                {/* Signup */}
                {/* <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>
                    Don’t have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SignUp")}
                  >
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View> */}
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  logo: {
    width: "80%",
    height: 80,
    marginBottom: 24,
    resizeMode: "contain",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    color: "black",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
    marginLeft: 4,
  },
  loginBtn: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  forgotPasswordCenter: {
    alignItems: "center",
    marginTop: 12,
  },
  forgotPasswordText: {
    color: "#4a90e2",
    fontSize: 14,
    fontWeight: "500",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#444",
    fontSize: 14,
  },
  signupLink: {
    color: "#4a90e2",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default Login;
