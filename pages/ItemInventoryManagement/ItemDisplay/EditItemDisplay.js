import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../../context';
import MyHeader from '../../../component/Header/Header';

const InventoryItemHistoryPage = ({ route, navigation }) => {
  const { itemKeyId } = route.params;
  const { apiGet } = useContext(DataContext);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryHistory();
  }, []);

  const fetchInventoryHistory = async () => {
    try {
      const response = await apiGet(`/get-itemkey-history-detail/${itemKeyId}`, {}, () => { });

      if (response.message === "No inventory purchased yet") {
        Alert.alert("No Inventory", "This item has not been purchased yet.");
      }

      setInventoryHistory(response.data); // Response should be an array
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("Error", "Failed to fetch inventory history.");
    }
  };

  const renderUsageHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyItem}>Used By: {item.usedBy || 'Unknown'}</Text>
      <Text style={styles.historyItem}>Used In: {item.usedIn || 'Unknown'}</Text>
      <Text style={styles.historyItem}>Quantity Used: {item.quantityUsed || 0}</Text>
      <Text style={styles.historyItem}>Date Used: {new Date(item.dateUsed).toLocaleDateString()}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const itemName = item.itemName || "Item name not available";
    const itemDescription = item.itemDescription || "Description not available";
    const usageHistoryData = item.usageHistory || [];

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{itemName}</Text>
        <Text >Added By : {item?.addedBy}</Text>
        <Text >Purchased At : {item?.createdAt?.substring(0, 10)}</Text>
        <Text style={styles.itemDescription}>{itemDescription}</Text>

        {/* Price & Quantity Row */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: '#e0f7f1' }]}>
            <Ionicons name="pricetag-outline" size={18} color="#2a9d8f" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={[styles.badgeText, { color: '#2a9d8f' }]}>
                ₹ {item.pricePerItem}
              </Text>
              <Text style={styles.badgeLabel}>Price per Item</Text>
            </View>
          </View>

          <View style={[styles.badge, { backgroundColor: '#f0f4f8' }]}>
            <Ionicons name="cube-outline" size={18} color="#264653" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={[styles.badgeText, { color: '#264653' }]}>
                {item.quantityPurchased}
              </Text>
              <Text style={styles.badgeLabel}>Quantity Purchased</Text>
            </View>
          </View>
        </View>

        {/* Usage History Section */}
        <Text style={styles.usageHistoryTitle}>Usage History</Text>
        <FlatList
          data={usageHistoryData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderUsageHistory}
          ListEmptyComponent={<Text style={styles.empty}>No usage history available.</Text>}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2a9d8f" />
      </View>
    );
  }

  return (
    <>
      <MyHeader navigation={navigation} />
      <FlatList
        data={inventoryHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No inventory history available.</Text>}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d3557',
    marginBottom: 10,
  },
  itemDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 100,
    flex: 0.48,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  badgeLabel: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  usageHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  historyItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#777',
  },
});

export default InventoryItemHistoryPage;
