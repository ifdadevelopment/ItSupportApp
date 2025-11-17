import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, StyleSheet } from "react-native";
import InventoryCard from "../../../component/inventoryCard/InventoryCard";
import InventoryHistoryCard from "../../../component/cards/InventoryHistoryCard";
import { DataContext } from "../../../context";
import LoadingSpinner from "../../../component/LoadingSpinner/LoadingSpinner";
import NoData from "../../../component/NoDataPage";
import Headers from "../../../component/Header/Header";

const TakenInventoryScreen = () => {
  const { apiGet } = useContext(DataContext);
  const [userInventories, setUserInventories] = useState();

  useEffect(() => {
    apiGet(`/get-user-inventory/`, {}, setUserInventories);
  }, []);

  const getUserInventories = () => {
    apiGet(`/get-user-inventory/`, {}, setUserInventories);
  }
  if (!userInventories) {
    return <LoadingSpinner />;
  }

  const current = userInventories?.data?.data || [];
  const history = userInventories?.history || [];

  return (
    <>
      <Headers />
      <View style={styles.container}>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Inventory Section */}
          <Text style={styles.sectionTitle}>Your Current Inventory</Text>
          {current.length > 0 ? (
            <FlatList
              data={current}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <InventoryCard item={item} getDataFunc={getUserInventories} />
                </View>
              )}
              scrollEnabled={false} // FlatList inside ScrollView
            />
          ) : (
            <NoData message="No Inventory Taken" />
          )}

          {/* History Section */}
          <Text style={styles.sectionTitle}>Inventory History</Text>
          {history.length > 0 ? (
            <FlatList
              data={history}
              keyExtractor={(item) => item._id || Math.random().toString()} // safer than index
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <InventoryHistoryCard item={item} setData={setUserInventories} />
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <NoData message="Your Inventory History will show here" />
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default TakenInventoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // light neutral bg
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: "#111827",
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
