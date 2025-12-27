import { useContext, useEffect, useState, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Modal,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import * as Yup from "yup";

import { DataContext } from "../../context";
import LoadingSpinner from "../../component/LoadingSpinner/LoadingSpinner";
import UserHomePage from "./HomeScreen/UserHomePage";
import AdminHome from "./HomeScreen/AdminHomePage";
import ITDepartmentHomePage from "./HomeScreen/ItScreenPage";
import { Ionicons } from "@expo/vector-icons";

const feedbackSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string().required("Required"),
  message: Yup.string().required("Required"),
});

const HomePage = ({ navigation }) => {
  const { user, apiGet, apiPostForm } = useContext(DataContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load Home Data
  useEffect(() => {
    apiGet("/home-page/", {}, (res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  // 📌 IMAGE PICKER
  const pickImage = useCallback(async (setFieldValue) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setSelectedFile(file);
      setFilePreview(file.uri);
      setFieldValue("file", file);
    }
  }, []);

  // 📌 DOCUMENT PICKER
  const pickDocument = async (setFieldValue) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setSelectedFile(result);
        setFilePreview(result.uri);
        setFieldValue("file", result);
      }
    } catch (error) {
      console.log("Document Error:", error);
    }
  };

  // 📌 OPEN CAMERA
  const openCamera = async (setFieldValue) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setSelectedFile(file);
      setFilePreview(file.uri);
      setFieldValue("file", file);
    }
  };
  const openFileOptions = (setFieldValue) => {
    const options = ["Pick Image", "Pick Document", "Open Camera", "Cancel"];
    const cancelIndex = 3;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex },
        (index) => {
          if (index === 0) pickImage(setFieldValue);
          if (index === 1) pickDocument(setFieldValue);
          if (index === 2) openCamera(setFieldValue);
        }
      );
    } else {
      Alert.alert("Add Attachment", "Choose how to attach:", [
        { text: "Pick Image", onPress: () => pickImage(setFieldValue) },
        { text: "Pick Document", onPress: () => pickDocument(setFieldValue) },
        { text: "Open Camera", onPress: () => openCamera(setFieldValue) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };
  const submitFeedback = async (values, { resetForm }) => {
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("message", values.message);
      formData.append("type", values.type);
      formData.append("rating", values.rating);

      if (selectedFile) {
        formData.append("attachments", {
          uri: selectedFile.uri,
          name: selectedFile.name || "feedback-file.jpg",
          type: selectedFile.mimeType || "image/jpeg",
        });
      }

      const res = await apiPostForm("/submit-feedback", formData, () => { });

      if (res?.success) {
        Alert.alert("Success", "Thank you! Your feedback has been submitted.");
        resetForm();
        setSelectedFile(null);
        setFilePreview(null);
        setModalVisible(false);
      } else {
        Alert.alert("Error", "Unable to send feedback. Try again.");
      }
    } catch (error) {
      console.log("FEEDBACK SUBMIT ERROR:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={{ flex: 1 }}>

      {/* HOME SCREENS */}
      {user?.user_type === "user" && <UserHomePage data={data} navigation={navigation} />}
      {user?.user_type === "admin" && <AdminHome data={data} navigation={navigation} />}
      {user?.user_type === "technician" && <ITDepartmentHomePage data={data} navigation={navigation} />}

      {/* FLOATING FEEDBACK BUTTON */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          bottom: 30,
          right: 25,
          backgroundColor: "#2563EB",
          padding: 18,
          borderRadius: 50,
          elevation: 8,
        }}
      >
        <Ionicons name="chatbubbles-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              maxHeight: "85%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Feedback Form
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Formik
                initialValues={{
                  name: "",
                  email: "",
                  phone: "",
                  message: "",
                  type: "General",
                  rating: 0,
                  file: null,
                }}
                validationSchema={feedbackSchema}
                onSubmit={submitFeedback}
              >
                {({
                  handleChange,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  setFieldValue,
                }) => (
                  <>
                    {/* --- PICKER FIXED: DEFAULT TEXT + DROPDOWN COLOR --- */}
                    <Picker
                      selectedValue={values.type}
                      onValueChange={(v) => setFieldValue("type", v)}
                      style={{ marginBottom: 10, color: "#030000" }}
                      dropdownIconColor="#030000"
                    >
                      <Picker.Item
                        label="General Feedback"
                        value="General"
                        color="#030000"
                      />
                      <Picker.Item label="Bug Report" value="Bug" color="#030000" />
                      <Picker.Item label="Suggestion" value="Suggestion" color="#030000" />
                      <Picker.Item
                        label="Feature Request"
                        value="Feature"
                        color="#030000"
                      />
                    </Picker>

                    <View style={{ flexDirection: "row", marginBottom: 10 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setFieldValue("rating", star)}
                        >
                          <Ionicons
                            name={values.rating >= star ? "star" : "star-outline"}
                            size={28}
                            color="#f5a623"
                            style={{ marginRight: 5 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* ---- INPUT WITH PLACEHOLDER COLOR FIX ---- */}

                    <TextInput
                      placeholder="Name"
                      placeholderTextColor="#030000"
                      value={values.name}
                      onChangeText={handleChange("name")}
                      style={inputBox}
                    />
                    {errors.name && touched.name && <Text style={err}>{errors.name}</Text>}

                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#030000"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      keyboardType="email-address"
                      style={inputBox}
                    />
                    {errors.email && touched.email && (
                      <Text style={err}>{errors.email}</Text>
                    )}

                    <TextInput
                      placeholder="Phone"
                      placeholderTextColor="#030000"
                      value={values.phone}
                      onChangeText={handleChange("phone")}
                      keyboardType="phone-pad"
                      style={inputBox}
                      maxLength={10}
                    />
                    {errors.phone && touched.phone && <Text style={err}>{errors.phone}</Text>}

                    <TextInput
                      placeholder="Message"
                      placeholderTextColor="#030000"
                      value={values.message}
                      onChangeText={handleChange("message")}
                      multiline
                      numberOfLines={4}
                      style={[inputBox, { minHeight: 80 }]}
                    />
                    {errors.message && touched.message && (
                      <Text style={err}>{errors.message}</Text>
                    )}

                    <TouchableOpacity
                      onPress={() => openFileOptions(setFieldValue)}
                      style={{
                        backgroundColor: "#2563EB",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Add Attachment
                      </Text>
                    </TouchableOpacity>

                    {filePreview && (
                      <Image
                        source={{ uri: filePreview }}
                        style={{
                          width: "100%",
                          height: 100,
                          borderRadius: 10,
                          marginBottom: 15,
                        }}
                      />
                    )}

                    <TouchableOpacity
                      onPress={handleSubmit}
                      style={{
                        backgroundColor: "green",
                        padding: 14,
                        borderRadius: 8,
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        Submit Feedback
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Formik>
            </ScrollView>

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 15,
                alignItems: "center",
                padding: 10,
                backgroundColor: "#ddd",
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const inputBox = {
  borderWidth: 1,
  borderColor: "#030000",
  padding: 10,
  borderRadius: 8,
  marginBottom: 5,
};

const err = {
  color: "red",
  marginBottom: 5,
};

export default HomePage;
