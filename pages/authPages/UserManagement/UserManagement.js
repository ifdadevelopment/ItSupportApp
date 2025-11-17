import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MyHeader from "../../../component/Header/Header";
import { DataContext } from "../../../context";
import LoadingSpinner from "../../../component/LoadingSpinner/LoadingSpinner";
import ChatListSkeleton from "../../../component/Skeleton/ConversationSkeleton";

export default function UserManagement({ navigation }) {

  const { checkSession, apiGet, apiPost, user } = React.useContext(DataContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    apiGet("/get-all-user/", {}, setUserData);
  }, []);

  const toggleActive = async (id, active) => {
    setUserData();
    await apiPost(`/update-user/${id}/`, { active: !active });
    await apiGet("/get-all-user/", {}, setUserData);
  };

  const editUser = (id) => {
    alert("Edit user with ID: " + id);
    // later you can open a modal or navigate to EditUser screen
  };

  const renderUser = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <Ionicons name="person-circle-outline" size={32} color="#555" />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>{item.name}</Text>
        <Text style={{ color: "#666" }}>{item.email}</Text>
      </View>
      {
        user?.user_type === "admin" &&
        <Switch value={item.active} onValueChange={() => toggleActive(item._id, item.active)} />
      }
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => {
        console.log(item);
        navigation.navigate("Chat", {
          id: item._id,
          name: item.name
        })
      }}>
        <View style={{ flex: 1 }}>
          <Ionicons name="chatbox-outline" size={24} color="#007AFF" />
          <Text> Chat</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // if (!userData) {
  //   return <LoadingSpinner />;
  // }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <MyHeader navigation={navigation} />
      { !userData ?  <ChatListSkeleton/> : <FlatList
        data={userData}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
      />}
    </View>
  );
}
