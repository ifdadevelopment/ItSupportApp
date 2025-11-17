import React, { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MyHeader from '../../component/Header/Header';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context';

// Validation Schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters long"),
});

const AddItemKeyForm = ({  navigation }) => {
    const { apiPost } = useContext(DataContext);
  return (
    <>
      <MyHeader navigation={navigation} />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Form Content */}
      <View style={styles.container}>
        <Text style={styles.heading}>Add New Item Key</Text>

        <Formik
          initialValues={{ name: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting})=>{
            setSubmitting(true);
            await apiPost(`/create-key-controler/`, values, setSubmitting, ()=>{
                  navigation.goBack();
            });
          
          }}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.formContainer}>
              {/* Name Input */}
              <Text style={styles.label}>Item Key Name</Text>
              <TextInput
                style={styles.input}
                value={values.name}
                onChangeText={handleChange('name')}
                placeholder="Enter item key name"
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? <ActivityIndicator size={19} color="white" /> : "Add Item Key"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#0d0083ff',
    borderRadius: 50,
    padding: 10,
    width: 100,
    marginLeft: 10, // Adjust if needed
    marginBottom: 20,
    elevation: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1F4FFF',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddItemKeyForm;
