import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { View, AppState, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

import Login from "./pages/authPages/Login/Login";
import LoadingSpinner from "./component/LoadingSpinner/LoadingSpinner";
import Home from "./pages/HomePage/HomePage";
import PurchaseEntryForm from "./pages/InventoryManagement/purchaseEntry/PurchaseEntry";
import TicketDetailsScreen from "./pages/TicketManagement/TicketDetailsPage/TicketDetailsPage";
import TicketEntryForm from "./pages/TicketManagement/TicketRaise/TicketRaise";
import TakenInventoryScreen from "./pages/InventoryManagement/InventoryPage/TakenInventory";
import ProfileScreen from "./pages/authPages/Profile/ProfilePage";
import ItInventoryCreateForm from "./pages/ItInventoryManagement/ItInventoryManagement";
import ItInventoryScreen from "./pages/ItInventoryManagement/ItInventoryScreen/ItInventoryScreen";
import ItInventoryPreview from "./pages/ItInventoryManagement/ItInventoryScreen/InventorySearchPage/ItInventoriesDetails";
import AddItemsInventory from "./pages/ItemInventoryManagement/ItemInventoryMangent";
import AllItemsScreen from "./pages/ItemInventoryManagement/ItemDisplay/ItemDisplay";
import AddItemToSystemForm from "./pages/ItInventoryManagement/AddItemToSystem/AddItemToSystem";
import GetTicketByStatus from "./pages/TicketManagement/GetTicketByStatus/GetTicketByStatus";
import AdminRegisterFormUI from "./pages/authPages/RegisterUser/RegisterUser";
import InventoryItemHistoryPage from "./pages/ItemInventoryManagement/ItemDisplay/EditItemDisplay";
import AddItemKeyForm from "./pages/ItemKeyAdd/ItemKeyAdd";
import ForgotPassword from "./component/ForgotPassword";
import ResetPassword from "./component/ResetPassword";

import { DataContext } from "./context";
import { navigationRef } from "./navserviceRef";
import { API_BASE_URL } from "./config";

const Stack = createNativeStackNavigator();

/* ---------------- ANDROID CHANNEL ---------------- */
async function createAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    showBadge: true,
  });
}

export default function Main() {
  const { checkSession, token, user, loading } = useContext(DataContext);

  const [ready, setReady] = useState(false);

  const pendingNotificationRef = useRef(null);
  const seenMsgIdsRef = useRef(new Map());
  const badgeRef = useRef(0);

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    "5702ad9c-3426-4d47-9c31-fb3607581f4c";

  /* ---------- Notification Handler (MUST be inside component) ---------- */
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  /* ---------- Boot ---------- */
  useEffect(() => {
    checkSession();
  }, []);

  /* ---------- Dedup Logic ---------- */
  const shouldProcessMessage = useCallback((remoteMessage) => {
    const id =
      remoteMessage?.messageId ||
      remoteMessage?.data?.messageId ||
      `${remoteMessage?.data?.type || "na"}:${remoteMessage?.sentTime || Date.now()}`;

    const now = Date.now();
    const last = seenMsgIdsRef.current.get(id);

    if (last && now - last < 10000) return false;

    seenMsgIdsRef.current.set(id, now);

    for (const [k, t] of seenMsgIdsRef.current.entries()) {
      if (now - t > 60000) seenMsgIdsRef.current.delete(k);
    }

    return true;
  }, []);

  /* ---------- Navigation Routing ---------- */
  const handleNotificationNavigation = useCallback(
    (data) => {
      if (!data?.type) return;

      switch (data.type) {
        case "ticket_created":
        case "ticket_commented":
        case "ticket_updated":
        case "ticket_resolved":
          navigationRef.current?.navigate("TicketHistory");
          break;

        case "inventory_created":
        case "inventory_updated":
          navigationRef.current?.navigate("SearchInventory");
          break;

        case "itemkey_created":
        case "itemkey_updated":
          navigationRef.current?.navigate("AddItemKeyForm");
          break;
        default:
          console.log("Unknown notification type:", data);
      }
    },
    [user?.user_type]
  );

  /* ---------- Badge Reset ---------- */
  useEffect(() => {
    let sub;

    (async () => {
      try {
        const count = await Notifications.getBadgeCountAsync();
        badgeRef.current = Number(count || 0);
      } catch {
        badgeRef.current = 0;
      }
    })();

    sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        badgeRef.current = 0;
        try {
          await Notifications.setBadgeCountAsync(0);
        } catch {}
      }
    });

    return () => sub?.remove?.();
  }, []);

  /* ---------- FCM Setup ---------- */
  useEffect(() => {
    let unsubMessage;
    let unsubToken;

    (async () => {
      try {
        if (Platform.OS === "android" && Platform.Version >= 33) {
          const perm = await Notifications.getPermissionsAsync();
          if (perm.status !== "granted") {
            await Notifications.requestPermissionsAsync();
          }
        }

        await createAndroidChannel();

        if (Constants.appOwnership === "expo") {
          setReady(true);
          return;
        }

        const messaging = require("@react-native-firebase/messaging").default;

        await messaging().registerDeviceForRemoteMessages();
        await messaging().requestPermission();

        const fcmToken = await messaging().getToken();

        if (fcmToken) {
          await fetch(`${API_BASE_URL}/save-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              token: fcmToken,
              projectId,
              platform: Platform.OS,
              meta: {
                userId: user?._id || null,
                userType: user?.user_type || null,
              },
            }),
          });
        }

        unsubToken = messaging().onTokenRefresh(async (t) => {
          try {
            await fetch(`${API_BASE_URL}/save-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                token: t,
                projectId,
                platform: Platform.OS,
                meta: {
                  userId: user?._id || null,
                  userType: user?.user_type || null,
                },
              }),
            });
          } catch {}
        });

        unsubMessage = messaging().onMessage(async (remoteMessage) => {
          if (!shouldProcessMessage(remoteMessage)) return;

          const data = remoteMessage.data || {};
          const title = data.title || "Notification";
          const body = data.body || "";

          let current = badgeRef.current || 0;
          const next = current + 1;
          badgeRef.current = next;

          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data,
              badge: next,
              sound: "default",
            },
            trigger: null,
          });

          try {
            await Notifications.setBadgeCountAsync(next);
          } catch {}
        });

        setReady(true);
      } catch (e) {
        console.log("FCM ERROR:", e);
        setReady(true);
      }
    })();

    return () => {
      unsubMessage && unsubMessage();
      unsubToken && unsubToken();
    };
  }, [token, user?._id, user?.user_type, shouldProcessMessage]);

  /* ---------- Notification Tap ---------- */
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data;

      if (navigationRef.current) {
        handleNotificationNavigation(data);
      } else {
        pendingNotificationRef.current = data;
      }
    });

    return () => sub.remove();
  }, [handleNotificationNavigation]);

  useEffect(() => {
    if (ready && pendingNotificationRef.current && navigationRef.current) {
      handleNotificationNavigation(pendingNotificationRef.current);
      pendingNotificationRef.current = null;
    }
  }, [ready, handleNotificationNavigation]);

  /* ---------- Loader ---------- */
  if (loading || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
      </View>
    );
  }

  /* ---------- Navigation ---------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar style="light" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="RaiseTicket" component={TicketEntryForm} />
            <Stack.Screen name="PurchaseEntryForm" component={PurchaseEntryForm} />
            <Stack.Screen name="TicketDetailsScreen" component={TicketDetailsScreen} />
            <Stack.Screen name="TakenInventoryScreen" component={TakenInventoryScreen} />
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
          </>
        )}
      </Stack.Navigator>

      <Toast />
    </SafeAreaView>
  );
}
