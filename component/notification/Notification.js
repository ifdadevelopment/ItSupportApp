import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { API_BASE_URL } from '../../config';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    } 

    token = (await Notifications.getExpoPushTokenAsync()).data;
  
    await fetch(`${API_BASE_URL}/update-profile/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      user_token :  token,
      }),
    });
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
