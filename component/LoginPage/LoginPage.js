import React, { useContext, useState } from 'react';
import { View, Text, Touchable, TouchableOpacity, TextInput, Button, ActivityIndicator } from 'react-native';

import { darkGreen } from '../Constants';
import Btn from '../Btn';
import Background from '../Background';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Formik } from 'formik';
import generateValidationSchema from '../GenrateValidationSchema/genrateValidationSchema';
import inputLoginArr from './LoginArr';
import genrateInitalValues from '../genrateInitialValues/InitialValues';
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { DataContext } from '../../context';


const Login = (m_props) => {

  const validationSchema = generateValidationSchema(inputLoginArr);
  const initialValues = genrateInitalValues(inputLoginArr);
  const [button, setButton] = useState(false);
  const { showSuccessToast, handleErrorFunc} = useContext(DataContext);

  return (
    <Background >
      <View style={{
         marginTop: "15%"
      }}>
      <Toast ref={(ref) => Toast.setRef(ref)} />
      </View>
      <View style={{ alignItems: 'center', width: 400, marginTop: "20%" }}>
        <View
          style={{
            backgroundColor: 'white',
            height: 700,
            width: 370,
            borderTopLeftRadius: 30,
            paddingTop: 30,
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 40, color: darkGreen, fontWeight: 'bold' }}>
            Attendence App
          </Text>
          <Text
            style={{
              color: 'grey',
              fontSize: 19,
              fontWeight: 'bold',
              marginBottom: 20,
            }}>
            Login to your account
          </Text>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, actions) => {
              setButton(true);
              axios.post(`${API_BASE_URL}/login/`, values).then((res) => {
                console.log(res.data);
                console.log(res.data?.user_id);
                AsyncStorage.setItem("accessToken", res.data?.token?.access);
                AsyncStorage.setItem("id", `${res.data?.user.id}`);
                AsyncStorage.setItem("user", JSON.stringify(res.data?.user));
                m_props.navigation.popToTop();
                m_props.navigation.navigate("Profile");
              }).catch((error) => {
                console.log(error)
                if(error.response){
                  console.log({"err.response.data" : err.response.data});
                }
                handleErrorFunc(error);                
              }).finally(() => {
                setButton(false);
              })
            }}
          >
            {props => (
              <View>
                {inputLoginArr.map((element, index) => {
                  const borderColor = props.errors[element.name] ? { color: "red", borderSz: 2 } : props.touched[element.name] ? { color: 'green', borderSz: 2 } : { color: 'black', borderSz: 1 }
                  return (
                    <>
                      <TextInput
                        key={index} // Added key prop to satisfy React's requirements
                        style={{ borderRadius: 10, color: darkGreen, paddingHorizontal: 10, backgroundColor: 'rgb(220,220, 220)', marginVertical: 10, height: "14%", borderColor: borderColor.color, borderWidth: borderColor.borderSz }}
                        placeholder={element.placeholder}
                        onChangeText={props.handleChange(element.name)}
                        onFocus={() => {
                          props.setFieldTouched(element.name, true);
                        }}
                        onBlur={() => {
                          props.handleBlur(element.name);
                          props.setFieldTouched(element.name, false);
                        }}
                        secureTextEntry={element.name === "password"}
                      />
                      {props.errors[element.name] ? (
                        <Text style={{ color: "red" }}>{props.errors[element.name]}</Text>
                      ) : null}
                    </>
                  );
                })}
                {button ?
                  <LoadingSpinner />
                  : <Btn textColor='white' bgColor={darkGreen} btnLabel="Login" Press={props.handleSubmit} />
                }
                <View
                  style={{ alignItems: 'flex-end', width: '78%', paddingRight: 16 }}>
                  <Text style={{ color: darkGreen, fontWeight: 'bold', fontSize: 16 }}>
                    Forgot Password ?
                  </Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: "" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>Don't have an account ? </Text>
                  <TouchableOpacity onPress={() => m_props.navigation.navigate("Signup")}>
                    <Text style={{ color: darkGreen, fontWeight: 'bold', fontSize: 16 }}>Signup</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </Background>
  );
};

export default Login;