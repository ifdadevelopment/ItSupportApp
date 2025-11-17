import { registerRootComponent } from 'expo';
import App from './App';
import { DataProviderFuncComp } from './context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navserviceRef';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
