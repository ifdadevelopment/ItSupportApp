import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../../context';
import MyHeader from '../../../component/Header/Header';
import { Modalize } from 'react-native-modalize';

// Constants for stock status
const STATUS_COLORS = {
  outOfStock: '#FF4136',
  lowStock: '#FF851B',
  inStock: '#2ECC40',
};

const STATUS_LABELS = {
  outOfStock: 'Out of Stock',
  lowStock: 'Low Stock',
  inStock: 'Available',
};

const AllItemsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { apiGet } = useContext(DataContext);
  const [filterType, setFilterType] = useState('all');
  const modalRef = useRef(null);
  const [scale, setScale] = useState(new Animated.Value(0)); // FAB animation state

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { color: STATUS_COLORS.outOfStock, label: STATUS_LABELS.outOfStock, icon: 'close-circle-outline', backgroundColor: '#FFE6E6' };
    if (quantity <= 3) return { color: STATUS_COLORS.lowStock, label: STATUS_LABELS.lowStock, icon: 'alert-circle-outline', backgroundColor: '#FFF4E1' };
    return { color: STATUS_COLORS.inStock, label: STATUS_LABELS.inStock, icon: 'checkmark-circle-outline', backgroundColor: '#E3F9E5' };
  };

  const fetchItems = async () => {
    setLoading(true);
    apiGet('/get-inventory-items/', {}, (res) => {
      setItems(res.data || []);
      setFiltered(res.data || []);
      setLoading(false);
    });
  };

  const searchFilter = (text) => {
    setSearch(text);
    if (text) {
      const newData = items.filter(item => item?.key.toLowerCase().includes(text.toLowerCase()));
      setFiltered(newData);
    } else {
      setFiltered(items);
    }
  };

  const handleFilterPress = (type) => {
    setFilterType(type);
    if (type === 'all') {
      fetchItems();
    } else if (type === 'low') {
      const newData = items?.filter((element) => element.quantity < 10);
      setFiltered(newData);
    } else if (type === 'out') {
      const newData = items?.filter((element) => element.quantity === 0);
      setFiltered(newData);
    }
    modalRef.current?.close();
  };

  const renderItem = ({ item }) => {
    const { color, label, icon, backgroundColor } = getStockStatus(item.quantity);
    return (
      <TouchableOpacity

        onPress={() => {
          navigation.navigate('ItemProfilePage', { itemKeyId : item._id })
        }}
        style={[styles.card, { backgroundColor: backgroundColor }]}>
        <View style={styles.cardContent}>
          <Ionicons name={icon} size={30} color="#1d3557" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.key}</Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color }]}>{item.quantity} Left</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.statusButton, { backgroundColor: color }]}>
            <Text style={styles.statusButtonText}>{label}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Floating Action Button Animation
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
      <MyHeader navigation={navigation} />
      {/* Filter Container with Search */}
      <View style={{ ...styles.filterContainer, flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Filter Button */}
        <TouchableOpacity style={styles.filterBtn} onPress={() => modalRef.current?.open()}>
          <Ionicons name="filter-outline" size={20} color="#2a9d8f" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            // Add navigation logic for Add Key screen
            navigation.navigate("AddItemKeyForm");
          }}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar inside Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Search by name..."
          value={search}
          onChangeText={searchFilter}
        />
      </View>

      {/* Item List */}
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2a9d8f" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modalize ref={modalRef} adjustToContentHeight modalStyle={styles.modal} handleStyle={{ backgroundColor: '#ccc' }}>
        <View style={styles.modalContent}>
          {['all', 'low', 'out'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.modalItem, filterType === type && styles.modalItemActive]}
              onPressIn={() => handleFilterPress(type)}
            >
              <Ionicons
                name={type === 'all' ? 'layers-outline' : type === 'low' ? 'alert-circle-outline' : 'close-circle-outline'}
                size={20}
                color={filterType === type ? '#2a9d8f' : '#555'}
              />
              <Text style={[styles.modalItemText, filterType === type && { color: '#2a9d8f' }]}>
                {type === 'all' ? 'All Stock' : type === 'low' ? 'Low Stock' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modalize>

      {/* Floating Action Button */}
    </>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  filterText: {
    color: '#2a9d8f',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  addBtn: {
    flexDirection: 'row', // Ensure the icon and text are aligned horizontally
    backgroundColor: '#0d0083ff', // Button color for Add New
    borderRadius: 25, // Rounded corners
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center', // Vertically center the content
    justifyContent: 'center', // Center text and icon horizontally
    elevation: 5, // Shadow effect for the button
  },
  addText: {
    color: 'white',
    marginLeft: 8, // Space between icon and text
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  search: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F9F9',
  },
  card: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  statusContainer: {
    marginTop: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#777',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalContent: {
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  modalItemActive: {
    backgroundColor: '#E8F7F2',
  },
  modalItemText: {
    fontSize: 16,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2a9d8f',
    borderRadius: 50,
    padding: 18,
    elevation: 6,
  },
});

export default AllItemsScreen;
