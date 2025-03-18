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

  // Default location (Kampala, Uganda)
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

  // Calculate route using Google Maps Directions API for multiple modes
  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert("Error", "Please enter both start and end locations.");
      return;
    }

    if (end === "Close Parking (Multiple Locations in Kampala)") {
      showParkingLocations();
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg"; // Replace with your API key
    const modes = ["driving", "walking", "bicycling", "transit"];
    let timesByMode = {};
    let points = [];

    for (const mode of modes) {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        start
      )}&destination=${encodeURIComponent(end)}&key=${apiKey}&mode=${mode}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
          if (mode === "driving") {
            points = decodePolyline(data.routes[0].overview_polyline.points);
            setRouteCoordinates(points);
            setParkingMarkers([]);
            setTravelTimes([data.routes[0].legs[0].duration.text]);
            mapRef.current.fitToCoordinates(points, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            });
          }
          timesByMode[mode] = data.routes[0].legs[0].duration.text;
        } else {
          timesByMode[mode] = "N/A";
        }
      } catch (error) {
        timesByMode[mode] = "Error";
      }
    }

    setTravelTimesByMode(timesByMode);
  };

  // Decode Google Maps polyline
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  // Show parking locations with routes
  const showParkingLocations = async () => {
    if (!start) {
      Alert.alert("Error", "Please enter a starting location.");
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg"; // Replace with your API key
    let newTravelTimes = [];
    let allCoordinates = [];

    setParkingMarkers(parkingLocations);

    for (const location of parkingLocations) {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        start
      )}&destination=${location.latitude},${location.longitude}&key=${apiKey}&mode=driving`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          allCoordinates = [...allCoordinates, ...points];
          newTravelTimes.push(
            `${location.name}: ${data.routes[0].legs[0].duration.text}`
          );
        }
      } catch (error) {
        console.error("Error fetching parking route:", error);
      }
    }

    setRouteCoordinates(allCoordinates);
    setTravelTimes(newTravelTimes);
    mapRef.current.fitToCoordinates(allCoordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  };

  // Use current location as starting point
  const useCurrentLocation = () => {
    if (!permissionGranted) {
      Alert.alert("Error", "Location permission not granted.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "OK") {
              setStart(data.results[0].formatted_address);
              mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            } else {
              Alert.alert("Error", "Geocoding failed: " + data.status);
            }
          })
          .catch((error) => {
            console.error("Geocoding error:", error);
            Alert.alert("Error", "Could not geocode location.");
          });
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        Alert.alert("Error", `Could not get current location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Reset the map and UI
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
      {/* Map */}
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
          <Marker
            coordinate={routeCoordinates[0]}
            pinColor="green"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Start Point</Text>
                <Text style={styles.calloutText}>Location: {start}</Text>
                <Text style={styles.calloutText}>Coords: {routeCoordinates[0].latitude}, {routeCoordinates[0].longitude}</Text>
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
                <Text style={styles.calloutText}>Coords: {routeCoordinates[routeCoordinates.length - 1].latitude}, {routeCoordinates[routeCoordinates.length - 1].longitude}</Text>
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

      {/* Directions Input (Visible after clicking RouteWise) */}
      {showRouteInput && !travelTimesByMode && (
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Starting Point"
              value={start}
              onChangeText={setStart}
              placeholderTextColor="#ffffff"
            />
          </LinearGradient>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.inputWrapper}
          >
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

      {/* Action Buttons or Travel Times Panel (Below the Screen) */}
      <View style={styles.bottomContainer}>
        {showRouteInput && !travelTimesByMode && (
          <View style={styles.buttonRow}>
            <Button title="Get Directions" onPress={calculateRoute} />
            <Button title="Use My Location" onPress={useCurrentLocation} />
            <Button title="Reset" onPress={resetMap} />
          </View>
        )}

        {travelTimesByMode && (
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
        )}
      </View>

      {/* Travel Times Panel for Parking (Left Side) */}
      {travelTimes.length > 0 && (
        <ScrollView style={styles.timePanel}>
          <Text style={styles.timeTitle}>Estimated Travel Times</Text>
          {travelTimes.map((time, index) => (
            <Text key={index} style={styles.timeText}>{time}</Text>
          ))}
        </ScrollView>
      )}

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

      {/* Top-Right Corner Button (Always Visible) */}
      <TouchableOpacity style={styles.topRightButton}>
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
    bottom: 80, // Above the floating buttons
    left: 10,
    right: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    minHeight: 80,
    maxHeight: 120,
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
    top: 10,
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