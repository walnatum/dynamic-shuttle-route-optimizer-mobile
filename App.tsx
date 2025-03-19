import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler'; 

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ParentScreen from './src/screens/ParentScreen';
import RouteTrackerScreen from './src/screens/RouteTrackerScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import ListScreen from './src/screens/ListScreen';
import LogScreen from './src/screens/LogScreen';
import ParentLogScreen from './src/screens/ParentLogScreen';
import AssistantLogScreen from './src/screens/AssistantLogScreen';






// Define the type for navigation
export type RootStackParamList = {
  Login: undefined;
  HomeScreen: undefined;
  ParentScreen: undefined;


};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ParentScreen" component={ParentScreen} />
          <Stack.Screen name="RouteTrackerScreen" component={RouteTrackerScreen} />
          <Stack.Screen name="AssistantScreen" component={AssistantScreen} />
          <Stack.Screen name="ListScreen" component={ListScreen} />
          <Stack.Screen name="LogScreen" component={LogScreen} />
          <Stack.Screen name="ParentLogScreen" component={ParentLogScreen} />
          <Stack.Screen name="AssistantLogScreen" component={AssistantLogScreen} />





        


        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;