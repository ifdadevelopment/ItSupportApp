// ItInventoryManagement.js

import React, { useContext, useState, useRef, useEffect } from "react";
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
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { Formik } from "formik";
import DateTimePicker from "@react-native-community/datetimepicker";

// --- Excel, CSV, JSON ---
import * as XLSX from "xlsx";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// --- UI + Context ---
import MyHeader from "../../component/Header/Header";
import { DataContext } from "../../context";
import itInventorySteps, { subLocationMapping } from "./ItManagementArr";
import { generateArrValidationSchema } from "../../component/GenrateValidationSchema/genArrValidationSchema";
import { generateArrInitialValues } from "../../component/genrateInitialValues/arrInitalValues";

const { width, height } = Dimensions.get("window");

// ------------------------ FLAT FIELD + HEADERS ------------------------

const FLAT_FIELDS = itInventorySteps.flat();

const EXCEL_HEADERS = FLAT_FIELDS.map((f) => ({
  key: f.key,
  label: f.excelLabel || f.label || f.key,
}));

// ------------------------ FALLBACK ENUMS (used only if backend fails) ------------------------

const ENUMS_FALLBACK = {
  category: [
    "Computers",
    "Display",
  ],
  mainLocation: ["Kalkaji G33", "Kalkaji H18", "Badarpur"],
  condition: ["Good", "Fair", "Poor", "Damaged"],
  status: ["available", "in-use", "repair", "retired"],
};
const INVALID_ICON_NAMES = new Set(["network-outline"]);

const getSafeIconName = (iconName) => {
  if (!iconName || INVALID_ICON_NAMES.has(iconName)) return "list-outline";
  return iconName;
};
const writeAndShareWorkbook = async (wb, filename) => {
  try {
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const uri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: "base64",
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert("File Created", `Saved to cache:\n${uri}`);
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: filename,
      UTI: "com.microsoft.excel.xlsx",
    });
  } catch (e) {
    console.log("writeAndShareWorkbook error:", e);
    Alert.alert("Error", "Unable to export Excel file.");
  }
};

// Normalise one inventory item object for export
const normaliseItemForExport = (item) => {
  const row = {};
  EXCEL_HEADERS.forEach((h) => {
    let v = item[h.key];

    if (v === undefined || v === null) {
      row[h.key] = "";
      return;
    }

    if (h.key.toLowerCase().includes("date") || h.key === "createdAt") {
      const d = new Date(v);
      row[h.key] = !isNaN(d) ? d.toISOString().slice(0, 10) : "";
      return;
    }

    // If it's an object (e.g. ref), try to pull name/displayName
    if (typeof v === "object") {
      row[h.key] = v?.name || v?.displayName || JSON.stringify(v);
      return;
    }

    row[h.key] = v;
  });

  return row;
};
const parseAoAToObjects = (aoa) => {
  if (!aoa?.length) return [];

  const [headerRow, ...rows] = aoa;

  const headerMap = {};
  EXCEL_HEADERS.forEach((h) => {
    const labelLower = String(h.label).trim().toLowerCase();
    const keyLower = String(h.key).trim().toLowerCase();

    const idxByLabel = headerRow.findIndex(
      (cell) => String(cell || "").trim().toLowerCase() === labelLower
    );
    const idxByKey = headerRow.findIndex(
      (cell) => String(cell || "").trim().toLowerCase() === keyLower
    );

    const idx = idxByLabel !== -1 ? idxByLabel : idxByKey;
    if (idx !== -1) headerMap[h.key] = idx;
  });

  const results = [];
  rows.forEach((r) => {
    const obj = {};
    Object.entries(headerMap).forEach(([key, col]) => {
      const cell = r[col];
      if (cell === undefined || cell === null || cell === "") return;

      if (key.toLowerCase().includes("date")) {
        const d = new Date(cell);
        obj[key] = !isNaN(d) ? d.toISOString() : cell;
      } else {
        obj[key] = cell;
      }
    });

    if (Object.keys(obj).length) results.push(obj);
  });

  return results;
};
export default function ItInventoryForm({ navigation }) {
  const { apiPost, apiGet } = useContext(DataContext);

  const [step, setStep] = useState(0);
  const [anim] = useState(new Animated.Value(0));
  const [button, setButton] = useState(false);

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [enums, setEnums] = useState(ENUMS_FALLBACK);

  const modalizeRef = useRef(null);
  const [currentField, setCurrentField] = useState(null);
  const [options, setOptions] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState(null);
useEffect(() => {
  const fetchEnums = async () => {
    try {
      const res = await apiGet("/inventory/enums");
      if (res?.data) {
        setEnums(prev => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      console.log("Enum fetch error:", e?.message || e);
    }
  };

  fetchEnums();
}, []);   

  const openOptions = (fieldKey, fieldOptions, mainLocation) => {
    setCurrentField(fieldKey);

    if (fieldKey === "location" && mainLocation) {
      const key = mainLocation.toLowerCase().replace(/\s/g, "_");
      setOptions(subLocationMapping[key] || []);
    } else {
      setOptions(fieldOptions);
    }

    modalizeRef.current?.open();
  };
  const nextStep = () => {
    if (step < itInventorySteps.length - 1) {
      Animated.timing(anim, {
        toValue: -(step + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      Animated.timing(anim, {
        toValue: -(step - 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setStep((s) => s - 1);
    }
  };
  const handleSubmitForm = async (values, { resetForm }) => {
    const result = await apiPost("/add-it-inventory/", values, setButton);
    if (result) {
      alert("Inventory added.");
      resetForm();
      setStep(0);
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const initialValues = generateArrInitialValues(itInventorySteps);
  const validationSchema = generateArrValidationSchema(itInventorySteps);
const handleDemoTemplate = async () => {
  try {
    setCreatingTemplate(true);

    // API call
    const res = await apiGet("/inventory/template", {}, () => {}, true);

    if (!res?.fileBase64) {
      Alert.alert("Error", "Template file missing from server.");
      return;
    }

    // Save base64 → file
    const fileUri = FileSystem.cacheDirectory + "ITInventoryTemplate.xlsx";

    await FileSystem.writeAsStringAsync(fileUri, res.fileBase64, {
      encoding: "base64",
    });

    // Share file
    await Sharing.shareAsync(fileUri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "ITInventoryTemplate.xlsx",
    });

  } catch (e) {
    console.log("Template error:", e);
    Alert.alert("Error", "Template download failed.");
  } finally {
    setCreatingTemplate(false);
  }
};


const handleExport = async () => {
  try {
    setExporting(true);

    // API call
    const res = await apiGet("/inventory/export-excel", {}, () => {}, true);

    if (!res?.fileBase64) {
      Alert.alert("Error", "Export file not found.");
      return;
    }

    // Save base64 → file
    const fileUri = FileSystem.cacheDirectory + "ITInventoryExport.xlsx";

    await FileSystem.writeAsStringAsync(fileUri, res.fileBase64, {
      encoding: "base64",
    });

    // Share file
    await Sharing.shareAsync(fileUri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "ITInventoryExport.xlsx",
    });

  } catch (e) {
    console.log("Export error:", e);
    Alert.alert("Error", "Export failed.");
  } finally {
    setExporting(false);
  }
};






const handleImport = async (format) => {
  try {
    setImporting(true);

    const pick = await DocumentPicker.getDocumentAsync({
      type:
        format === "excel"
          ? [
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]
          : format === "csv"
          ? ["text/csv"]
          : ["application/json"],
      copyToCacheDirectory: true,
    });

    if (pick.canceled) return;

    const fileUri = pick.assets?.[0]?.uri || pick.uri;
    const fileName = pick.assets?.[0]?.name;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "base64",
    });

    const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const fileBlob = new Blob([byteArray], {
      type:
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : format === "csv"
          ? "text/csv"
          : "application/json",
    });

    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    const res = await apiPost(
      "/inventory/import-excel",
      formData,
      () => {},
      true
    );

    Alert.alert(
      "Import Complete",
      `Inserted: ${res?.inserted || 0}\nUpdated: ${res?.updated || 0}\nSkipped: ${res?.skipped || 0}`
    );
  } catch (e) {
    console.log("Import error:", e);
    Alert.alert("Error", "Failed to import inventory.");
  } finally {
    setImporting(false);
  }
};

const handleImportPress = () =>
  Alert.alert("Import IT Inventory", "Choose format", [
    { text: "Excel (.xlsx)", onPress: () => handleImport("excel") },
    { text: "CSV (.csv)", onPress: () => handleImport("csv") },
    { text: "JSON (.json)", onPress: () => handleImport("json") },
    { text: "Cancel", style: "cancel" },
  ]);

  const handleExportPress = () =>
    Alert.alert("Export IT Inventory", "Choose file format", [
      { text: "Excel (.xlsx)", onPress: () => handleExport("excel") },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <>
      <MyHeader navigation={navigation} />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
          validateForm,
          setTouched,
        }) => (
          <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerRow}>
              {step > 0 && (
                <TouchableOpacity
                  onPress={prevStep}
                  style={styles.backButtonClean}
                >
                  <Ionicons name="arrow-back" size={22} color="#002fbb" />
                </TouchableOpacity>
              )}

              <View style={{ flex: 1, marginLeft: step > 0 ? 12 : 0 }}>
                <Text style={styles.stepTitle}>
                  Step {step + 1} / {itInventorySteps.length}
                </Text>

                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${
                          ((step + 1) / itInventorySteps.length) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.stepCircles}>
                  {itInventorySteps.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.circle,
                        idx <= step
                          ? styles.circleActive
                          : styles.circleInactive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* IMPORT */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleImportPress}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={22}
                    color="#002fbb"
                  />
                )}
              </TouchableOpacity>

              {/* EXPORT */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleExportPress}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Ionicons
                    name="cloud-download-outline"
                    size={22}
                    color="#002fbb"
                  />
                )}
              </TouchableOpacity>

              {/* DEMO TEMPLATE */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleDemoTemplate}
                disabled={creatingTemplate}
              >
                {creatingTemplate ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Ionicons name="sparkles-outline" size={22} color="#002fbb" />
                )}
              </TouchableOpacity>
            </View>

            {/* FORM SLIDER */}
            <Animated.View
              style={[
                styles.slider,
                {
                  width: width * itInventorySteps.length,
                  transform: [{ translateX: anim }],
                },
              ]}
            >
              {itInventorySteps.map((fields, idx) => (
                <ScrollView
                  key={idx}
                  contentContainerStyle={styles.slide}
                  keyboardShouldPersistTaps="handled"
                >
                  {fields.map((field) => (
                    <View key={field.key} style={styles.fieldWrapper}>
                      <Text style={styles.label}>{field.label}</Text>

                      {/* PICKER */}
                      {field.type === "picker" ? (
                        <TouchableOpacity
                          style={[styles.inputRow, { paddingVertical: 14 }]}
                          onPress={() =>
                            openOptions(
                              field.key,
                              field.options,
                              values?.mainLocation
                            )
                          }
                        >
                          <Ionicons
                            name={getSafeIconName(field.icon)}
                            size={22}
                            color="darkblue"
                            style={styles.icon}
                          />
                          <Text style={styles.inputText}>
                            {values[field.key]}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      ) : field.type === "date" ? (
                        <>
                          <TouchableOpacity
                            style={[styles.inputRow, { paddingVertical: 14 }]}
                            onPress={() => {
                              setCurrentDateField(field.key);
                              setShowDatePicker(true);
                            }}
                          >
                            <Ionicons
                              name={getSafeIconName(field.icon)}
                              size={22}
                              color="darkblue"
                              style={styles.icon}
                            />
                            <Text style={styles.inputText}>
                              {values[field.key]
                                ? new Date(
                                    values[field.key]
                                  ).toLocaleDateString()
                                : "Select Date"}
                            </Text>
                            <Ionicons
                              name="calendar-outline"
                              size={20}
                              color="#666"
                            />
                          </TouchableOpacity>

                          {showDatePicker &&
                            currentDateField === field.key && (
                              <DateTimePicker
                                value={
                                  values[field.key]
                                    ? new Date(values[field.key])
                                    : new Date()
                                }
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                  setShowDatePicker(false);
                                  if (selectedDate) {
                                    setFieldValue(
                                      field.key,
                                      selectedDate.toISOString()
                                    );
                                  }
                                }}
                              />
                            )}
                        </>
                      ) : (
                        <View
                          style={[
                            styles.inputRow,
                            field.type === "textarea" && styles.textareaWrapper,
                          ]}
                        >
                          <Ionicons
                            name={getSafeIconName(field.icon)}
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
                              field.type === "textarea" && {
                                ...styles.textareaInput,
                                height: 80,
                              },
                            ]}
                            placeholder={field.placeholder}
                            placeholderTextColor="#1f1f1fff"
                            value={values[field.key]}
                            onChangeText={handleChange(field.key)}
                            keyboardType={
                              field.type === "number" ? "numeric" : "default"
                            }
                          />
                        </View>
                      )}

                      {errors[field.key] && touched[field.key] && (
                        <Text style={{ color: "red", fontSize: 12 }}>
                          {errors[field.key]}
                        </Text>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.submitBtn, { marginTop: 16 }]}
                    onPress={async () => {
                      const currentKeys = itInventorySteps[step].map(
                        (f) => f.key
                      );
                      const touchedFields = {};
                      currentKeys.forEach((k) => (touchedFields[k] = true));

                      setTouched({ ...touched, ...touchedFields });

                      const errs = await validateForm();
                      if (currentKeys.some((k) => errs[k])) return;

                      if (step === itInventorySteps.length - 1) handleSubmit();
                      else nextStep();
                    }}
                  >
                    {button && step === itInventorySteps.length - 1 ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.navText}>
                        {step === itInventorySteps.length - 1
                          ? "Add Item"
                          : "Next"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              ))}
            </Animated.View>

            {/* BOTTOM SHEET OPTIONS */}
            <Modalize
              ref={modalizeRef}
              modalHeight={height * 0.8}
              handlePosition="inside"
              withHandle
              modalStyle={styles.modal}
              flatListProps={{
                data: options,
                keyExtractor: (i) => i.label,
                renderItem: ({ item }) => (
                  <Pressable
                    style={styles.optionRow}
                    onPressIn={() => {
                      setFieldValue(currentField, item.label);
                      modalizeRef.current?.close();
                    }}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons
                        name={getSafeIconName(item.icon || "list-outline")}
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

// =============================================================
//      STYLESHEET
// =============================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f7fa",
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dcdde1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  backButtonClean: {
    padding: 4,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#002fbb",
  },

  progressBarBackground: {
    height: 4,
    backgroundColor: "#dcdde1",
    borderRadius: 2,
    marginTop: 6,
  },

  progressBarFill: {
    height: 4,
    backgroundColor: "#002fbb",
    borderRadius: 2,
  },

  stepCircles: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginRight: 20,
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  circleActive: { backgroundColor: "#002fbb" },
  circleInactive: { backgroundColor: "#dcdde1" },

  slider: { flexDirection: "row" },
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

  input: { flex: 1, padding: 12, fontSize: 15, color: "#2d3436" },

  inputText: { flex: 1, fontSize: 15, color: "#2d3436" },

  textareaWrapper: { alignItems: "flex-start", paddingVertical: 10 },

  textareaInput: { height: 150, textAlignVertical: "top", paddingTop: 10 },

  submitBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },

  navText: { color: "#fff", fontWeight: "700", fontSize: 16 },

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
});
