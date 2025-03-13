import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert, PermissionsAndroid, Platform } from "react-native";
import { useNavigation } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  
  // Default location (Kampala, Uganda)
  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  
  // Add permission request on component mount
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
              buttonPositive: "OK"
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Location permission granted");
            setPermissionGranted(true);
          } else {
            console.log("Location permission denied");
            setErrorMsg("Location permission denied");
          }
        } else {
          // For iOS - permissions are handled differently
          setPermissionGranted(true);
        }
      } catch (err) {
        console.warn(err);
        setErrorMsg("Error requesting location permission");
      }
    };

    requestLocationPermission();
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Map with default location */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      />

      {/* Permission status indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Permission status: {permissionGranted ? "Granted" : "Not granted"}
        </Text>
        {errorMsg && <Text style={styles.errorText}>Error: {errorMsg}</Text>}
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>

      {/* Floating Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Weather Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Traffic Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Crash Data</Text>
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
  statusContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    padding: 10,
  },
  statusText: {
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
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
});

export default HomeScreen;