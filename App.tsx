import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ParentScreen from "./src/screens/ParentScreen";
import RouteTrackerScreen from "./src/screens/RouteTrackerScreen";
import AssistantScreen from "./src/screens/AssistantScreen";
import ListScreen from "./src/screens/ListScreen";
import LogScreen from "./src/screens/LogScreen";
import ParentLogScreen from "./src/screens/ParentLogScreen";
import AdminLoginScreen from "./src/screens/AdminLoginScreen";
import TrafficScreen from "./src/screens/trafficscreen";
import AdminScreen from "./src/screens/AdminScreen";
import WeatherScreen from "./src/screens/WeatherScreen";
import CrashScreen from "./src/screens/CrashScreen";
import ModelDemoScreen from "./src/screens/ModelDemoScreen";

export type RootStackParamList = {
  Login: undefined;
  HomeScreen: undefined;
  ParentScreen: undefined;
  RouteTrackerScreen: undefined;
  AssistantScreen: { tempCode: string; driverCode: string };
  ListScreen: { driverCode: string; shuttle: { reg_number: string } | null };
  LogScreen: { tempCode: string; driverCode: string } | undefined;
  ParentLogScreen: undefined;
  AdminLoginScreen: undefined;
  TrafficScreen: undefined;
  AdminScreen: undefined;
  RouteScreen: undefined;
  WeatherScreen: undefined;
  CrashScreen: undefined;
  ModelDemoScreen: undefined;
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
          <Stack.Screen name="AdminLoginScreen" component={AdminLoginScreen} />
          <Stack.Screen name="TrafficScreen" component={TrafficScreen} />
          <Stack.Screen name="AdminScreen" component={AdminScreen} />
          <Stack.Screen name="WeatherScreen" component={WeatherScreen} />
          <Stack.Screen name="CrashScreen" component={CrashScreen} />
          <Stack.Screen name="ModelDemoScreen" component={ModelDemoScreen} />



        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;