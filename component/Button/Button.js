// CustomButton.js
import React, { useContext, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { DataContext } from "../../context";
import { navigate, replace } from "../../navserviceRef";

const CustomButton = ({ text, color = "#2563EB", textColor = "black", route, body, callBackFunc }) => {
  const { apiPost } = useContext(DataContext);
  const [button, setButton] = useState(false);

  const handleSubmit = async () => {
    await apiPost(route, body, setButton, ()=>{replace("Home")});
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]} // background color for the button
      onPress={handleSubmit}
      disabled={button} // disable button while loading
    >
      <Text style={[styles.text, { color: textColor }]}> {/* text color */}
        {button ? <ActivityIndicator color={textColor} size={19} /> : text}
      </Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CustomButton;
