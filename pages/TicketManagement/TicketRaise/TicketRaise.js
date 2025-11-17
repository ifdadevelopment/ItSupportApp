import React, { useContext, useRef, useState, useCallback } from "react";
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
  Alert,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { Formik } from "formik";
import * as Yup from "yup";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";
import { steps, subLocationMapping } from "./TicketRaiseArr";
import * as ImagePicker from "expo-image-picker";
import DocumentPicker from "expo-document-picker";

const { width, height } = Dimensions.get("window");

// Validation schema
const TicketSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
  priority: Yup.string().required("Priority is required"),
  location: Yup.string().required("Location is required"),
  sublocation: Yup.string().required("Sub Location is required"),
  description: Yup.string().required("Description is required"),
});

export default function TicketEntryForm({ navigation, currentUser }) {
  const { apiPost, apiPostForm, apiGet } = useContext(DataContext);
  const [step, setStep] = useState(0);
  const [anim] = useState(new Animated.Value(0));
  const [button, setButton] = useState(false);
  const modalizeRef = useRef(null);
  const [currentField, setCurrentField] = useState(null);
  const [searchValue, setSearchValue] = useState();
  const [options, setOptions] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [pcOptions, setPcOptions] = useState([]);
  const [pcLoading, setPcLoading] = useState(false);
  const [pcHasMore, setPcHasMore] = useState(true);
  const pcSkip = useRef(0);
  const pcSearch = useRef("");

  const fetchUsers = async () => {
    try {
      const users = await apiGet(`/get-all-user-for-ticket/`, {}, () => { });
      setAssignedTo(users.user);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPcOptions = async (reset = false) => {
    setPcLoading(true);
    const limit = 5;

    const res = await apiGet(
      `/get-pc-options?limit=${limit}&skip=${reset ? 0 : pcSkip.current}&search=${pcSearch.current}`,
      {},
      () => { }
    );

    const fetched = res?.data || [];

    if (reset) {
      setPcOptions(fetched);
      pcSkip.current = fetched.length;
      setPcHasMore(fetched.length === limit);
    } else {
      setPcOptions((prev) => [...prev, ...fetched]);
      pcSkip.current += fetched.length;
      setPcHasMore(fetched.length === limit);
    }

    setPcLoading(false);
  };

  const openOptions = (fieldKey, fieldOptions, setFieldValue, values) => {
    setCurrentField({ key: fieldKey, setFieldValue });

    if (fieldKey === "pc") {
      pcSkip.current = 0;
      pcSearch.current = "";
      fetchPcOptions(true);
    } else if (fieldKey === "assignedTo") {
      fetchUsers();
    } else if (fieldKey === "sublocation") {
      const selectedLocation = values.location;
      const subOptions = subLocationMapping[selectedLocation] || [];
      setOptions(subOptions);
    } else {
      setOptions(fieldOptions);
    }

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
  // const handleSubmit = async (values, { resetForm }) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("title", values.title.trim());
  //     formData.append("description", values.description.trim());
  //     formData.append("category", values.category);
  //     formData.append("priority", values.priority);
  //     formData.append("location", values.location);
  //     formData.append("sublocation", values.sublocation);
  //     if (values.pc) formData.append("pc", values.pc);
  //     if (values.assignedTo) formData.append("assignedTo", values.assignedTo);
  //     const files = Array.isArray(file) ? file : file ? [file] : [];

  //     files.forEach((f, index) => {
  //       formData.append("attachments", {
  //         uri: f.uri,
  //         type: f.mimeType || f.type || "application/octet-stream",
  //         name: f.name || `ticket-file-${Date.now()}-${index}`,
  //       });
  //     });
  //     const result = await apiPostForm("/raise-ticket", formData, setButton);

  //     if (result?.success) {
  //       alert("Ticket submitted successfully!");
  //       resetForm();
  //       setFile(null);
  //       setFilePreview(null);
  //       setStep(0);
  //       Animated.timing(anim, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }).start();
  //     } else {
  //       alert(result?.message || "Failed to submit ticket");
  //     }
  //   } catch (error) {
  //     console.log("Ticket Submit Error:", error);
  //     alert("Something went wrong while submitting.");
  //   }
  // };

  // Pick image handler
  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();

      formData.append("title", values.title.trim());
      formData.append("description", values.description.trim());
      formData.append("category", values.category);
      formData.append("priority", values.priority);
      formData.append("location", values.location);
      formData.append("sublocation", values.sublocation);

      if (values.pc) formData.append("pc", values.pc);
      if (values.assignedTo) formData.append("assignedTo", values.assignedTo);

      const files = Array.isArray(file) ? file : file ? [file] : [];

      files.forEach((f, index) => {
        formData.append("attachments", {
          uri: f.uri,
          type: f.mimeType || f.type || "application/octet-stream",
          name: f.name || `ticket-file-${Date.now()}-${index}`,
        });
      });

      const result = await apiPostForm("/raise-ticket", formData, setButton);

      if (result?.success) {
        alert("Ticket submitted successfully!");
        resetForm();
        setFile(null);
        setFilePreview(null);
        // setFieldValue("file", "");

        setStep(0);
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        return;
      }

      alert(result?.message || "Failed to submit ticket");

    } catch (error) {
      console.log("Ticket Submit Error:", error);
      alert("Something went wrong while submitting.");
    }
  };


  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length) {
      const selectedFile = result.assets[0];
      setFile(selectedFile);
      setFilePreview(selectedFile.uri);  // Show file preview
    }
  }, []);

  // Pick document handler
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",  // Accept all types of files
      });

      if (result.type === "success") {
        setFile(result);  // Store file
        setFilePreview(result.uri);  // Show file preview
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  // Open camera for image selection
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length) {
      const selectedFile = result.assets[0];
      setFile(selectedFile);
      setFilePreview(selectedFile.uri);  // Show file preview
    }
  };

  // Open options to select image, document, or camera
  const openFileOptions = () => {
    const options = ["Pick Image", "Pick Document", "Open Camera", "Cancel"];
    const cancelIndex = 3;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex },
        (index) => {
          if (index === 0) pickImage();
          if (index === 1) pickDocument();
          if (index === 2) openCamera();
        }
      );
    } else {
      Alert.alert("Add Attachment", "Choose how to attach", [
        { text: "Pick Image", onPress: pickImage },
        { text: "Pick Document", onPress: pickDocument },
        { text: "Open Camera", onPress: openCamera },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        category: "Hardware Issue",
        priority: "Medium",
        location: "Kalkaji G33",
        pc: "",
        assignedTo: "",
        file: ""
      }}
      validationSchema={TicketSchema}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
        <>
          <MyHeader navigation={navigation} />
          <View style={styles.container}>
            {step > 0 ? <View style={{ height: 30 }}></View> : null}
            {step > 0 && (
              <TouchableOpacity style={styles.backArrow} onPress={prevStep}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <Animated.View style={[styles.slider, { transform: [{ translateX: anim }] }]}>

              {steps.map((fields, idx) => (
                <View key={idx} style={styles.slide}>
                  {fields?.map((field) => (
                    <View key={field.key} style={styles.fieldWrapper}>
                      <Text style={styles.label}>{field.label}</Text>
                      {/* PICKERS */}
                      {field.type === "picker" || field.type === "remotePicker" ? (
                        <TouchableOpacity
                          style={styles.inputRow}
                          onPress={() => openOptions(field.key, field.options, setFieldValue, values)}
                        >
                          <Ionicons name={field.icon} size={22} color="darkblue" style={styles.icon} />
                          <Text style={styles.inputText}>
                            {field.key == "assignedTo" ? null : field.key === "pc"
                              ? pcOptions.find((opt) => opt._id === values.pc)?.displayName || "Select"
                              : values[field.key] || "Select"}

                            {field.key == 'assignedTo' ? assignedTo?.find((opt) => opt._id == values.assignedTo)?.name : null}
                          </Text>
                          <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                      ) : (
                        // TEXT / TEXTAREA
                        <View style={[styles.inputRow, field.type === "textarea" && styles.textareaWrapper]}>
                          <Ionicons
                            name={field.icon}
                            size={22}
                            color="darkblue"
                            style={[styles.icon, field.type === "textarea" && { marginTop: 12 }]}

                          />
                          <TextInput
                            placeholderTextColor="#222222ff"
                            style={[styles.input, field.type === "textarea" && styles.textareaInput]}
                            placeholder={field.placeholder}
                            value={values[field.key]}
                            onChangeText={handleChange(field.key)}
                          />
                        </View>
                      )}

                      {errors[field.key] && touched[field.key] && (
                        <Text style={{ color: "red", fontSize: 12 }}>{errors[field.key]}</Text>
                      )}
                    </View>
                  ))}

                  {/* File Upload Preview */}
                  {step > 0 ? null : <View style={{}}>
                    <Text style={styles.label}>Upload File</Text>
                    <TouchableOpacity
                      style={styles.inputRow}
                      onPress={openFileOptions}
                    >
                      <Ionicons name="cloud-upload-outline" size={22} color="darkblue" style={styles.icon} />
                      <Text style={styles.inputText}>
                        {file ? file.name || file?.assets?.[0]?.fileName || "File Selected" : "No file selected"}
                      </Text>
                    </TouchableOpacity>
                    {filePreview && (
                      <View style={styles.previewWrapper}>
                        <Image
                          source={{ uri: filePreview }}
                          style={styles.filePreview}
                        />

                        <TouchableOpacity
                          style={styles.removeFileBtn}
                          onPress={() => {
                            setFile(null);
                            setFilePreview(null);
                            setFieldValue("file", "");
                          }}
                        >
                          <Ionicons name="close-circle" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    )}

                  </View>}

                  {idx === 1 && (
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                      {button ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitText}>Raise Ticket</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </Animated.View>
            {/* Navigation buttons */}
            <View style={styles.navRow}>
              {step < steps.length - 1 && (
                <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                  <Text style={styles.navText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bottom Sheet */}
          <Modalize
            ref={modalizeRef}
            modalHeight={height * 0.8}
            handlePosition="inside"
            withHandle
            onClose={() => { setSearchValue("") }}
            modalStyle={styles.modal}
            flatListProps={{
              ListHeaderComponent: (
                <View style={{ paddingBottom: 10 }}>
                  <TextInput
                    value={searchValue}
                    onChangeText={(text) => {
                      setSearchValue(text);
                      if (currentField?.key === "pc") {
                        pcSearch.current = text;
                        fetchPcOptions(true);
                      } else if (currentField?.key == 'assignedTo') {
                        fetchUsers();
                      }
                    }}
                    placeholder={`Search here .....`}
                    style={styles.searchInput}
                    placeholderTextColor="#999"
                  />
                </View>
              ),
              data: currentField?.key === "pc" ? pcOptions : (currentField?.key === "assignedTo" ? assignedTo : options),
              keyExtractor: (item, index) => `${item._id || "unknown"}-${index}`,
              renderItem: ({ item }) => {
                const isDisabled = item.disabled;
                return (
                  <Pressable
                    android_ripple={isDisabled ? null : { color: "#f2f2f2" }}
                    style={[styles.optionRow, isDisabled && { opacity: 0.5 }]}

                    onPressIn={() => {
                      if (isDisabled) return;
                      if (currentField.key === "pc") {
                        currentField.setFieldValue("pc", item._id);
                      } else if (currentField.key === "assignedTo") {
                        currentField.setFieldValue("assignedTo", item._id);
                      } else {
                        currentField.setFieldValue(currentField.key, item.displayName || item.label);
                      }
                      modalizeRef.current?.close();
                    }}
                    disabled={isDisabled}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons
                        name={currentField.key === "assignedTo" ? "person-circle-outline" : "desktop-outline"}
                        size={20}
                        color={isDisabled ? "#ccc" : "#4a90e2"}
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        style={[styles.optionText, isDisabled && { color: "#ccc", fontStyle: "italic" }]}

                      >
                        {currentField.key == 'assignedTo' ? item.name : item.displayName || item.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              },
            }}
          />
        </>
      )}
    </Formik>
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
  input: { flex: 1, padding: 12, fontSize: 15, color: "#000000ff", placeholderTextColor: 'black' },
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
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
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
  textareaInput: { height: 70, textAlignVertical: "top", paddingTop: 10 },
  filePreview: {
    width: 40,
    height: 40,
    marginTop: 10,
    resizeMode: "contain",
  },
  previewWrapper: {
    position: "relative",
    marginTop: 10,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  removeFileBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 3,
  },
});
