import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";

const ParentScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [parkingMarkers, setParkingMarkers] = useState([]);
  const [travelTimes, setTravelTimes] = useState([]);
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [travelTimesByMode, setTravelTimesByMode] = useState(null);

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

  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert("Error", "Please enter both start and end locations.");
      return;
    }
    // ... (rest of calculateRoute remains unchanged)
  };

  const decodePolyline = (encoded) => {
    // ... (unchanged)
  };

  const showParkingLocations = async () => {
    // ... (unchanged)
  };

  const useCurrentLocation = () => {
    // ... (unchanged)
  };

  const resetMap = () => {
    setStart("");
    setEnd("");
    setRouteCoordinates([]);
    setParkingMarkers([]);
    setTravelTimes([]);
    setTravelTimesByMode(null);
    setShowRouteInput(false);
    mapRef.current.animateToRegion(defaultLocation);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      >
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#0000FF" strokeWidth={4} />
        )}
        {parkingMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            pinColor="red"
          />
        ))}
        {start && routeCoordinates.length > 0 && (
          <Marker coordinate={routeCoordinates[0]} pinColor="green">
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Start Point</Text>
                <Text style={styles.calloutText}>Location: {start}</Text>
                <Text style={styles.calloutText}>
                  Coords: {routeCoordinates[0].latitude}, {routeCoordinates[0].longitude}
                </Text>
              </View>
            </Callout>
          </Marker>
        )}
        {end && routeCoordinates.length > 0 && (
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            pinColor="blue"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Destination</Text>
                <Text style={styles.calloutText}>Location: {end}</Text>
                <Text style={styles.calloutText}>
                  Coords: {routeCoordinates[routeCoordinates.length - 1].latitude},{" "}
                  {routeCoordinates[routeCoordinates.length - 1].longitude}
                </Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>

      {/* RouteWise Button (Initially Visible) */}
      {!showRouteInput && !travelTimesByMode && (
        <TouchableOpacity
          style={styles.routeWiseButton}
          onPress={() => setShowRouteInput(true)}
        >
          <Text style={styles.buttonText}>RouteWise</Text>
        </TouchableOpacity>
      )}

      {/* Directions Input with Cancel Icon */}
      {showRouteInput && !travelTimesByMode && (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowRouteInput(false)}
          >
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Starting Point"
              value={start}
              onChangeText={setStart}
              placeholderTextColor="#ffffff"
            />
          </LinearGradient>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Destination"
              value={end}
              onChangeText={(text) => {
                setEnd(text);
                if (text === "Close Parking (Multiple Locations in Kampala)") {
                  showParkingLocations();
                }
              }}
              placeholderTextColor="#ffffff"
            />
          </LinearGradient>
        </View>
      )}

      {/* Action Buttons or Travel Times Panel */}
      {showRouteInput && !travelTimesByMode && (
        <View style={styles.bottomContainer}>
          <View style={styles.buttonRow}>
            <Button title="Get Directions" onPress={calculateRoute} />
            <Button title="Use My Location" onPress={useCurrentLocation} />
            <Button title="Reset" onPress={resetMap} />
          </View>
        </View>
      )}

      {travelTimesByMode && (
        <View style={styles.bottomContainer}>
          <View style={styles.travelTimesPanel}>
            <Text style={styles.timeTitle}>Estimated Travel Times</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>🚗 {travelTimesByMode.driving}</Text>
              <Text style={styles.timeText}>🚶 {travelTimesByMode.walking}</Text>
              <Text style={styles.timeText}>🚴 {travelTimesByMode.bicycling}</Text>
              <Text style={styles.timeText}>🚍 {travelTimesByMode.transit}</Text>
            </View>
            <Button title="Cancel" onPress={resetMap} />
          </View>
        </View>
      )}

      {/* Travel Times Panel for Parking */}
      {travelTimes.length > 0 && (
        <ScrollView style={styles.timePanel}>
          <Text style={styles.timeTitle}>Estimated Travel Times</Text>
          {travelTimes.map((time, index) => (
            <Text key={index} style={styles.timeText}>{time}</Text>
          ))}
        </ScrollView>
      )}

      {/* Floating Buttons */}
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

      {/* Top-Right Route Tracker Button (Adjusted Position) */}
      <TouchableOpacity
        style={[
          styles.topRightButton,
          showRouteInput && !travelTimesByMode ? { top: 130 } : { top: 10 },
        ]}
        onPress={() => navigation.navigate("RouteTrackerScreen")}
      >
        <Text style={styles.buttonText}>Route Tracker</Text>
      </TouchableOpacity>
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
  routeWiseButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  inputContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
  },
  cancelButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: "#FF3B30",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputWrapper: {
    borderRadius: 25,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  beautifiedInput: {
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 25,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 80,
    left: 10,
    right: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  travelTimesPanel: {
    width: "100%",
    alignItems: "center",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  timePanel: {
    position: "absolute",
    top: 150,
    left: 10,
    width: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 5,
    maxHeight: "50%",
  },
  timeTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  timeText: {
    marginHorizontal: 5,
    fontSize: 14,
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
  topRightButton: {
    position: "absolute",
    right: 10,
    backgroundColor: "#FF9500",
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
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
    color: "#333",
  },
});

export default ParentScreen;