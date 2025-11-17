// QtyAndAmount.js
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as yup from "yup";
import MyHeader from "../../component/Header/Header";
import { DataContext } from "../../context";
import Toast from "react-native-toast-message";
import { navigate } from "../../navserviceRef";
import { Modalize } from "react-native-modalize";
import LoadingSpinner from "../../component/LoadingSpinner/LoadingSpinner";

const validationSchema = yup.object().shape({
  name: yup.string().required("Item name is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});

export default function QtyAndAmount() {
  const { apiPost, apiGet } = useContext(DataContext);
  const modalRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [inventoryOptions, setInventoryOption] = useState();

  const fetchData = async () => {
    const data = await apiGet('/get-it-inventory-key/', {}, () => { });
    setInventoryOption(data.itemKey);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!inventoryOptions) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <MyHeader />
      <KeyboardAvoidingView
        style={{ flex: 1, padding: 16 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Formik
          initialValues={{ name: "", price: "", quantity: "" }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            apiPost(`/add-inventory-item/`, values, setSubmitting, () => {
              Toast.show({
                type: "success",
                text1: "Item Added Successfully!!",
                text2: "Your item was saved to inventory.",
                position: "top",
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 40,
              });
              resetForm();
            });
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            isSubmitting,
            setFieldValue,
            errors,
            touched,
          }) => {
            const totalAmount = useMemo(() => {
              const p = parseFloat(values.price) || 0;
              const q = parseInt(values.quantity) || 0;
              return p * q;
            }, [values.price, values.quantity]);

            return (
              <>
                <View style={styles.fixedInputs}>
                  <View style={styles.headerBox}>
                    <Ionicons name="cube-outline" size={28} color="#1F4FFF" />
                    <Text style={styles.header}>Add Inventory Item</Text>
                  </View>

                  <View style={styles.card}>
                    {/* Item Name Picker */}
                    <TouchableOpacity
                      style={styles.inputRow}
                      onPress={() => modalRef.current?.open()}
                    >
                      <Ionicons
                        name="create-outline"
                        size={22}
                        color="#64748B"
                      />
                      <Text style={styles.inputText}>
                        {values.name || "Select item name"}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                    {touched.name && errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}

                    {/* Price */}
                    <View style={styles.inputRow}>
                      <Ionicons name="pricetag-outline" size={22} color="#64748B" />
                      <TextInput
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        placeholder="Enter price (₹)"
                        keyboardType="numeric"
                        value={values.price}
                        onChangeText={handleChange("price")}
                        onBlur={handleBlur("price")}
                      />
                    </View>
                    {touched.price && errors.price && (
                      <Text style={styles.errorText}>{errors.price}</Text>
                    )}

                    {/* Quantity */}
                    <View style={styles.inputRow}>
                      <Ionicons name="layers-outline" size={22} color="#64748B" />
                      <TextInput
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        placeholder="Enter quantity"
                        keyboardType="numeric"
                        value={values.quantity}
                        onChangeText={handleChange("quantity")}
                        onBlur={handleBlur("quantity")}
                      />
                    </View>
                    {touched.quantity && errors.quantity && (
                      <Text style={styles.errorText}>{errors.quantity}</Text>
                    )}
                  </View>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <View style={styles.totalCard}>
                    <View style={styles.totalLeft}>
                      <Ionicons name="calculator-outline" size={28} color="#1F4FFF" />
                      <Text style={styles.totalLabel}>Total Amount</Text>
                    </View>
                    <Text style={styles.totalValue}>
                      ₹ {totalAmount.toFixed(2)}
                    </Text>
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#1D4ED8" }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size={19} color="white" />
                    ) : (
                      <>
                        <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Save Item</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Manage Items */}
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => navigate("ItemsManagement")}
                  >
                    <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Manage Items</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Modal Picker */}
                <Modalize
                  ref={modalRef}
                  modalHeight={420}
                  handlePosition="inside"
                  modalStyle={styles.modal}
                  onClose={() => setSearchValue("")}
                  flatListProps={{
                    ListHeaderComponent: (
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search item name..."
                        placeholderTextColor="#999"
                        value={searchValue}
                        onChangeText={setSearchValue}
                      />
                    ),
                    showsVerticalScrollIndicator: false,
                    data: inventoryOptions?.filter((item) =>
                      item?.name.toLowerCase().includes(searchValue.toLowerCase())
                    ),
                    keyExtractor: (item, index) => `${item}-${index}`,
                    renderItem: ({ item }) => (
                      <TouchableOpacity
                        style={styles.optionRow}
                        onPressIn={() => {
                          setFieldValue("name", item.name);
                          setFieldValue("itemKey", item._id);
                          modalRef.current?.close();
                        }}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={20}
                          color="#2a9d8f"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.optionText}>{item.name}</Text>
                      </TouchableOpacity>
                    ),
                  }}
                />
              </>
            );
          }}
        </Formik>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Wrapper for the form
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Soft light gray background
    padding: 20,
  },

  // Header section
headerBox: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,  // Add more space below the heading
},
header: {
  fontSize: 32,  // Larger size for emphasis
  fontWeight: "800",  // Bold weight for a strong presence
  color: "#313131ff",  // Darker color for professionalism
  marginLeft: 12,
  textShadowColor: "#CBD5E1",  // Subtle text shadow for depth
  textShadowOffset: { width: 1, height: 1 },  // Slight offset for shadow effect
  textShadowRadius: 4,  // Softer shadow radius for smooth effect
},
  // Card around input fields
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    // marginBottom: 20,
  },

  // Common input row style
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0", // Subtle gray border
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#F9FAFB", // Light background for inputs
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748", // Dark text for readability
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginLeft: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: "#4A5568", // Lighter gray for labels
    marginBottom: 6,
  },
  errorText: {
    color: "#F56565", // Red for errors
    fontSize: 13,
    marginTop: 8,
    marginLeft: 10,
  },

  // Total amount section
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 15,

  },
  totalLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    color: "#2D3748", // Subtle text for labels
    marginLeft: 12,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3182CE", // Professional blue for total amount
  },

  // Button styling
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#4A90E2",  // Softer blue for primary action
    shadowColor: "#4A90E2",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 10,
  },

  // Secondary Button (Manage Items)
  buttonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#6B7280", // Muted gray for secondary action
    shadowColor: "#6B7280",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },

  // Disabled Button (when action is not available)
  buttonDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#D1D5DB", // Lighter gray for disabled
    opacity: 0.6,
  },

  // Button Text (for the secondary button)
  buttonSecondaryText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 10,
  },

  // Modal styling
  modal: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0", // Light border for search input
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#2D3748",
  },

  // Option row in modal
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#2D3748", // Dark text color for options
  },
});

