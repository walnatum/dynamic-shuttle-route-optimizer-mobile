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

// Define Student interface (simplified for student_name only)
interface Student {
  student_name: string;
}

const ParentScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [parkingMarkers, setParkingMarkers] = useState([]);
  const [travelTimes, setTravelTimes] = useState<string[]>([]);
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [travelTimesByMode, setTravelTimesByMode] = useState<any>(null);

  // State for student data
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showStudentData, setShowStudentData] = useState(false); // Added missing state

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Fetch student data
  const fetchStudent = async () => {
    try {
      console.log('Starting fetch from: http://192.168.216.163:8000/api/students/S002/');
      const response = await fetch('http://192.168.216.163:8000/api/students/S002/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data: Student = await response.json();
      console.log('Parsed data:', JSON.stringify(data, null, 2));
      setStudent(data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch Error Details:', {
        name: err.name,
        message: err.message,
      });
      setError(`Failed to fetch student data: ${err.message}`);
      Alert.alert('Fetch Error', `Could not load student data: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
    fetchStudent(); // Fetch on mount
  }, []);

  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert("Error", "Please enter both start and end locations.");
      return;
    }
    // ... (rest of calculateRoute remains unchanged)
  };

  const decodePolyline = (encoded: string) => {
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
    mapRef.current?.animateToRegion(defaultLocation);
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

      {/* RouteWise Button */}
      {!showRouteInput && !travelTimesByMode && (
        <TouchableOpacity
          style={styles.routeWiseButton}
          onPress={() => setShowRouteInput(true)}
        >
          <Text style={styles.buttonText}>RouteWise</Text>
        </TouchableOpacity>
      )}

      {/* Directions Input */}
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
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            setShowStudentData(!showStudentData);
            if (!showStudentData && !student && !loading) fetchStudent(); // Refetch if no data
          }}
        >
          <Text style={styles.buttonText}>Student</Text>
        </TouchableOpacity>
      </View>

      {/* Student Data Overlay */}
      {showStudentData && (
        <View style={styles.studentOverlay}>
          {loading ? (
            <Text style={styles.studentText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.studentText}>Error: {error}</Text>
          ) : student ? (
            <Text style={styles.studentText}>Student Name: {student.student_name}</Text>
          ) : (
            <Text style={styles.studentText}>No student data available</Text>
          )}
        </View>
      )}

      {/* Route Tracker Button */}
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
  studentOverlay: {
    position: "absolute",
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  studentText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },
});

export default ParentScreen;