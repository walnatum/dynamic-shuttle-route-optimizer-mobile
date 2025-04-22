import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Config from "react-native-config";
import styles from "./styles/AssistantScreenStyles";



type RootStackParamList = {
  ListScreen: { driverCode: string; shuttle: { reg_number: string } | null };
  AssistantScreen: { tempCode: string; driverCode: string };
  LogScreen: { tempCode: string; driverCode: string };
};

type AssistantScreenRouteProp = RouteProp<RootStackParamList, 'AssistantScreen'>;

const AssistantScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AssistantScreenRouteProp>();
  const { tempCode, driverCode } = route.params || { tempCode: "", driverCode: "" };
  const mapRef = useRef<MapView>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [code, setCode] = useState<string>(tempCode);

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "This app needs access to your location.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          setPermissionGranted(true);
        }
      } catch (err) {
        setErrorMsg("Error requesting location permission");
      }
    };
    requestLocationPermission();
  }, []);

  const handleEnter = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter a code.");
      return;
    }

    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/verify-driver-code/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driver_code: driverCode, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid code");
      }

      navigation.navigate("ListScreen", { 
        driverCode,
        shuttle: data.shuttle 
      });
    } catch (error: any) {
      console.error("Error verifying code:", error.message);
      Alert.alert("Error", error.message || "Invalid code. Please try again.");
    }
  };

  const resetInput = () => {
    setCode("");
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      />
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter Code"
            value={code}
            onChangeText={setCode}
            placeholderTextColor="#666"
          />
          {code && (
            <TouchableOpacity style={styles.clearButton} onPress={resetInput}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.enterButton} onPress={handleEnter}>
          <Text style={styles.enterButtonText}>Enter</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.buttonText}>Traffic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.buttonText}>Crash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};




export default AssistantScreen;