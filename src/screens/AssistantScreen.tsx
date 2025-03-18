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
import { useNavigation } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";

const AssistantScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [assistantNameId, setAssistantNameId] = useState("");
  const [code, setCode] = useState("");

  // Default location (Kampala, Uganda - can be adjusted)
  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Request location permission
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
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setPermissionGranted(true);
          } else {
            setErrorMsg("Location permission denied");
          }
        } else {
          setPermissionGranted(true);
        }
      } catch (err) {
        setErrorMsg("Error requesting location permission");
      }
    };
    requestLocationPermission();
  }, []);

  // Handle enter action
  const handleEnter = () => {
    if (!assistantNameId || !code) {
      Alert.alert("Error", "Please enter both Assistant Name/Id and Code.");
      return;
    }
    // Navigate to AssistantScreen2 with the entered data
    navigation.navigate("ListScreen", { assistantNameId, code });
  };

  // Reset inputs
  const resetInput = (field) => {
    if (field === "assistant") setAssistantNameId("");
    if (field === "code") setCode("");
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      >
        {/* Add markers or data based on assistant input if needed */}
      </MapView>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Assistant Name/Id"
            value={assistantNameId}
            onChangeText={setAssistantNameId}
            placeholderTextColor="#666"
          />
          {assistantNameId ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => resetInput("assistant")}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Code"
            value={code}
            onChangeText={setCode}
            placeholderTextColor="#666"
          />
          {code ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => resetInput("code")}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.enterButton} onPress={handleEnter}>
          <Text style={styles.enterButtonText}>Enter</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Buttons (Bottom) */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  enterButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
  },
  enterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingButtons: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  floatingButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  bottomNavTitle: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  bottomNavButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  navButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  navButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
});

export default AssistantScreen;