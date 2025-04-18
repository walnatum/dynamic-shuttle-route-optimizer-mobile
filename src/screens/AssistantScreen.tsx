import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Config from "react-native-config";
import styles from "./styles/AssistantScreenStyles"; // Adjust the path if you placed the file in a different 


type RootStackParamList = {
  ListScreen: { assistantNameId?: string; code?: string };
  AssistantScreen: undefined;
};


const AssistantScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const mapRef = useRef<MapView>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [assistantNameId, setAssistantNameId] = useState<string>("");
  const [code, setCode] = useState<string>("");

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
    if (!assistantNameId.trim() || !code.trim()) {
      Alert.alert("Error", "Please enter both Assistant Name and Code.");
      return;
    }

    // Verify code with backend
    try {
      console.log("Verifying code:", code);
      console.log("URL:", `${Config.API_BASE_URL}/api/verify-driver-code/`);
      const response = await fetch(`${Config.API_BASE_URL}/api/verify-driver-code/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driver_code: code }),
      });

      const driverData = await response.json(); // Read body once as JSON
      console.log("Response status:", response.status);
      console.log("Response body:", driverData);

      if (!response.ok) {
        console.error("Verification error:", response.status, driverData);
        throw new Error("Invalid driver code");
      }

      console.log("Verified driver:", driverData);
      navigation.navigate("ListScreen", { assistantNameId, code });
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", "Invalid code. Please try again.");
    }
  };

  const resetInput = (field: "assistant" | "code") => {
    if (field === "assistant") setAssistantNameId("");
    if (field === "code") setCode("");
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
            placeholder="Assistant Name"
            value={assistantNameId}
            onChangeText={setAssistantNameId}
            placeholderTextColor="#666"
          />
          {assistantNameId && (
            <TouchableOpacity style={styles.clearButton} onPress={() => resetInput("assistant")}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Code"
            value={code}
            onChangeText={setCode}
            placeholderTextColor="#666"
          />
          {code && (
            <TouchableOpacity style={styles.clearButton} onPress={() => resetInput("code")}>
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