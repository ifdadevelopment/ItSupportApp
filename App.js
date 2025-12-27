import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './pages/authPages/Login/Login';
import LoadingSpinner from './component/LoadingSpinner/LoadingSpinner';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from "react-native-safe-area-context";
import RegisterScreen from './pages/RegisterUserPage/RegisterUserPage';
import { DataContext } from './context';
import NetInfo from '@react-native-community/netinfo';
const Stack = createNativeStackNavigator();

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Home from './pages/HomePage/HomePage';
import PurchaseEntryForm from "./pages/InventoryManagement/purchaseEntry/PurchaseEntry"
// import RaiseTicket from './pages/TicketRaise/TicketRaise';
import { StatusBar } from 'expo-status-bar';
import MyHeader from './component/Header/Header';
import TicketDetailsScreen from './pages/TicketManagement/TicketDetailsPage/TicketDetailsPage';
import TicketEntryForm from './pages/TicketManagement/TicketRaise/TicketRaise';
import TakenInventoryScreen from './pages/InventoryManagement/InventoryPage/TakenInventory';
import ProfileScreen from './pages/authPages/Profile/ProfilePage';
import ItInventoryCreateForm from './pages/ItInventoryManagement/ItInventoryManagement';
import ItInventoryScreen from './pages/ItInventoryManagement/ItInventoryScreen/ItInventoryScreen';
// import ItInventoryDetails from './pages/ItInventoryManagement/ItInventoryScreen/InventorySearchPage/ItInventoriesDetails';
import ItInventoryPreview from './pages/ItInventoryManagement/ItInventoryScreen/InventorySearchPage/ItInventoriesDetails';
import AddItemsInventory from './pages/ItemInventoryManagement/ItemInventoryMangent';
import AllItemsScreen from './pages/ItemInventoryManagement/ItemDisplay/ItemDisplay';
// import ItemsProfilePage from './pages/ItemInventoryManagement/ItemDisplay/EditItemDisplay';
import AddItemToSystemForm from './pages/ItInventoryManagement/AddItemToSystem/AddItemToSystem';
import GetTicketByStatus from './pages/TicketManagement/GetTicketByStatus/GetTicketByStatus';
import AdminRegisterFormUI from './pages/authPages/RegisterUser/RegisterUser';
import InventoryItemHistoryPage from './pages/ItemInventoryManagement/ItemDisplay/EditItemDisplay';
import AddItemKeyForm from './pages/ItemKeyAdd/ItemKeyAdd';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './component/notification/Notification';
import ForgotPassword from "./component/ForgotPassword";
import ResetPassword from "./component/ResetPassword";


const Tab = createMaterialTopTabNavigator();



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


function Main() {
  const {
    checkSession,
    token,
    user,
    loading
  } = React.useContext(DataContext);
  React.useEffect(() => {
    checkSession();
  }, []);

  React.useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Clicked:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="white" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="RaiseTicket" component={TicketEntryForm} />
            <Stack.Screen name="PurchaseEntryForm" component={PurchaseEntryForm} />
            <Stack.Screen name="TicketDetailsScreen" component={TicketDetailsScreen} />
            <Stack.Screen name="TakenInventoryScreen" component={TakenInventoryScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="AddItInventory" component={ItInventoryCreateForm} />
            <Stack.Screen name="SearchInventory" component={ItInventoryScreen} />
            <Stack.Screen name="ItInventoryDetails" component={ItInventoryPreview} />
            <Stack.Screen name="AddItemInventory" component={AddItemsInventory} />
            <Stack.Screen name="ItemsManagement" component={AllItemsScreen} />
            <Stack.Screen name="ItemProfilePage" component={InventoryItemHistoryPage} />
            <Stack.Screen name="AddItemToSystem" component={AddItemToSystemForm} />
            <Stack.Screen name="TicketHistory" component={GetTicketByStatus} />
            <Stack.Screen name="RegisterUser" component={AdminRegisterFormUI} />
            <Stack.Screen name="AddItemKeyForm" component={AddItemKeyForm} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="RaiseTicket" component={TicketEntryForm} />
            <Stack.Screen name="TakenInventoryScreen" component={TakenInventoryScreen} />
            <Stack.Screen name="PurchaseEntryForm" component={PurchaseEntryForm} />
            <Stack.Screen name="AddItInventory" component={ItInventoryCreateForm} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="SearchInventory" component={ItInventoryScreen} />
            <Stack.Screen name="TicketDetailsScreen/:ticketId" component={TakenInventoryScreen} />
            <Stack.Screen name="ItInventoryDetails" component={ItInventoryPreview} />
            <Stack.Screen name="AddItemInventory" component={AddItemsInventory} />
            <Stack.Screen name="ItemsManagement" component={AllItemsScreen} />
            {/* <Stack.Screen name="ItemProfilePage" component={ItemsProfilePage} /> */}
            <Stack.Screen name="ItemProfilePage" component={InventoryItemHistoryPage} />
            <Stack.Screen name="AddItemKeyForm" component={AddItemKeyForm} />
            <Stack.Screen name="TicketHistory" component={GetTicketByStatus} />
            <Stack.Screen name="AddItemToSystem" component={AddItemToSystemForm} />
            <Stack.Screen name="RegisterUser" component={AdminRegisterFormUI} />
          </>
        )}
      </Stack.Navigator>

      <Toast />
    </SafeAreaView>
  );
}

export default Main;
