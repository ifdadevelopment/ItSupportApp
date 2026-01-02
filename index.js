import { registerRootComponent } from 'expo';
import App from './App';
import { DataProviderFuncComp } from './context';
import * as Notifications from "expo-notifications";
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navserviceRef';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
/**
 * ✅ ALWAYS allow notifications in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * ✅ Android notification channel (once)
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    showBadge: true,
    vibrationPattern: [0, 250, 250, 250],
  });
}

// Ensure channel on app start
ensureAndroidChannel();

function Root() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DataProviderFuncComp>
          <NavigationContainer ref={navigationRef}>
            <App />
          </NavigationContainer>
        </DataProviderFuncComp>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
registerRootComponent(Root);
