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
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";
import Config from "react-native-config";

interface Shuttle {
  reg_number: string;
  current_latitude: number | null;
  current_longitude: number | null;
  driver_code: string | null;
}

interface Student {
  id: string;
  name: string;
  school: string;
  onboarded: boolean;
  student_code: string;
  offboarded_at?: string;
  shuttle: Shuttle;
  latitude?: number;
  longitude?: number;
  point_latitude?: number;
  point_longitude?: number;
}

const RouteTrackerScreen = () => {
  const mapRef = useRef<MapView>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [schoolNameId, setSchoolNameId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [eta, setEta] = useState<string>("Calculating...");
  const [shuttleName, setShuttleName] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [showRoute, setShowRoute] = useState(false);

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

  // Updated function to display shuttle location
  const updateShuttleDisplay = async (studentData: Student) => {
    try {
      // Log shuttle data for debugging
      console.log("Shuttle data:", JSON.stringify(studentData.shuttle, null, 2));

      // Convert coordinates to numbers
      const latitude = Number(studentData.shuttle.current_latitude);
      const longitude = Number(studentData.shuttle.current_longitude);

      // Validate shuttle coordinates
      if (
        latitude != null &&
        longitude != null &&
        !isNaN(latitude) &&
        !isNaN(longitude)
      ) {
        const shuttleLoc = { latitude, longitude };
        setShuttleLocation(shuttleLoc);
        setShuttleName(studentData.shuttle.reg_number || "Unknown");

        // Center map on shuttle location
        mapRef.current?.animateToRegion({
          latitude: shuttleLoc.latitude,
          longitude: shuttleLoc.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        console.warn(
          "Invalid shuttle coordinates after conversion:",
          `latitude: ${latitude}, longitude: ${longitude}`
        );
        setShuttleLocation(null);
        setEta("Shuttle location unavailable");
        Alert.alert(
          "Error",
          "Shuttle location data is invalid. Please ensure the shuttle has valid coordinates."
        );
        return;
      }

      // Set destination to pickup point
      const pickupLatitude = Number(studentData.point_latitude);
      const pickupLongitude = Number(studentData.point_longitude);

      if (
        pickupLatitude != null &&
        pickupLongitude != null &&
        !isNaN(pickupLatitude) &&
        !isNaN(pickupLongitude)
      ) {
        setDestination(
          `Pickup Point: (${pickupLatitude}, ${pickupLongitude})`
        );
      } else {
        setDestination("Pickup point unavailable");
      }
    } catch (error: any) {
      console.error("Shuttle display error:", error.message);
      setEta("Error displaying shuttle");
      Alert.alert("Error", error.message || "Failed to display shuttle location");
    }
  };

  // Calculate route and ETA when Route button is tapped
  const calculateRouteAndETA = async () => {
    if (!student || !shuttleLocation || !student.point_latitude || !student.point_longitude) {
      Alert.alert("Error", "Missing shuttle or pickup point coordinates.");
      return;
    }

    try {
      // Placeholder: Google Maps Directions API
      const origin = `${shuttleLocation.latitude},${shuttleLocation.longitude}`;
      const destination = `${student.point_latitude},${student.point_longitude}`;
      const apiKey = Config.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(data.error_message || "Failed to calculate route");
      }

      // Extract route coordinates
      const points = data.routes[0]?.legs[0]?.steps.map((step: any) => ({
        latitude: step.start_location.lat,
        longitude: step.start_location.lng,
      }));
      if (points) {
        setRouteCoordinates(points);
      } else {
        setRouteCoordinates([]);
      }

      // Extract ETA
      const duration = data.routes[0]?.legs[0]?.duration?.text || "Unknown";
      setEta(`Current Location to Pickup Point ETA: ${duration}`);

      // Fit map to show route
      if (points && points.length > 0) {
        mapRef.current?.fitToCoordinates(
          [shuttleLocation, ...points, { latitude: Number(student.point_latitude), longitude: Number(student.point_longitude) }],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    } catch (error: any) {
      console.error("Route calculation error:", error.message);
      setEta("Error calculating route");
      Alert.alert("Error", error.message || "Failed to calculate route and ETA");
    }
  };

  // Fetch student details
  const fetchStudent = async () => {
    if (!studentCode.trim()) {
      Alert.alert("Error", "Please enter a student code.");
      return;
    }

    try {
      setIsSearching(true);
      console.log(`Fetching student with code: ${studentCode}`);
      const fetchResponse = await fetch(`${Config.API_BASE_URL}/api/students/${studentCode}/`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error("Fetch error:", fetchResponse.status, errorText);
        throw new Error(`Student not found. Status: ${fetchResponse.status}`);
      }

      const studentData = await fetchResponse.json();
      console.log("Fetched student:", JSON.stringify(studentData, null, 2));

      const fetchedStudent: Student = {
        id: studentData.id,
        name: studentData.student_name,
        school: studentData.school_name,
        onboarded: studentData.onboarded,
        student_code: studentData.student_code,
        offboarded_at: studentData.offboarded_at,
        shuttle: {
          reg_number: studentData.shuttle.reg_number,
          current_latitude: studentData.shuttle.current_latitude,
          current_longitude: studentData.shuttle.current_longitude,
          driver_code: studentData.shuttle.driver_code,
        },
        latitude: studentData.latitude,
        longitude: studentData.longitude,
        point_latitude: studentData.point_latitude,
        point_longitude: studentData.point_longitude,
      };

      setStudent(fetchedStudent);

      // Set destination and display shuttle
      if (fetchedStudent.onboarded) {
        await updateShuttleDisplay(fetchedStudent);
      } else {
        setDestination("Student not onboarded");
        setShuttleLocation(null);
      }

      // Reset showRoute
      setShowRoute(false);
    } catch (error: any) {
      console.error("Error fetching student:", error.message);
      Alert.alert("Error", error.message || "Failed to fetch student. Check the code or network.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!schoolNameId || !studentCode) {
      Alert.alert("Error", "Please enter both School Name/Id and Student Code.");
      return;
    }

    await fetchStudent();
  };

  // Reset inputs and map
  const resetInputs = () => {
    setSchoolNameId("");
    setStudentCode("");
    setStudent(null);
    setShuttleLocation(null);
    setRouteCoordinates([]);
    setEta("Calculating...");
    setShuttleName("");
    setDestination("");
    setShowRoute(false);
    mapRef.current?.animateToRegion(defaultLocation);
  };

  // Handle Route button click
  const handleShowRoute = async () => {
    setShowRoute(true);
    await calculateRouteAndETA();
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
        {shuttleLocation && (
          <Marker coordinate={shuttleLocation} title={shuttleName} pinColor="blue">
            <Callout>
              <View>
                <Text style={styles.calloutTitle}>{shuttleName}</Text>
                <Text>Student: {student?.name || "Unknown"}</Text>
                <Text>Destination: {destination}</Text>
              </View>
            </Callout>
          </Marker>
        )}
        {student?.point_latitude && student?.point_longitude && (
          <Marker
            coordinate={{ latitude: Number(student.point_latitude), longitude: Number(student.point_longitude) }}
            title="Pickup Point"
            pinColor="green"
          />
        )}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#007AFF" />
        )}
      </MapView>

      {/* Show either search inputs or student/shuttle info */}
      {!student ? (
        <View style={styles.inputContainer}>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
            <TextInput
              style={styles.beautifiedInput}
              placeholder="School Name/Id"
              value={schoolNameId}
              onChangeText={setSchoolNameId}
              placeholderTextColor="#ffffff"
            />
            <TouchableOpacity style={styles.clearButton} onPress={() => setSchoolNameId("")}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Student Code"
              value={studentCode}
              onChangeText={setStudentCode}
              placeholderTextColor="#ffffff"
            />
            <TouchableOpacity style={styles.clearButton} onPress={() => setStudentCode("")}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          </LinearGradient>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
            <Text style={styles.searchButtonText}>{isSearching ? "Searching..." : "Search"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.studentInfoContainer}>
            <View style={styles.studentCard}>
              <View style={styles.studentInitial}>
                <Text style={styles.studentInitialText}>{student.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentSchool}>{student.school}</Text>
                <Text style={styles.studentCode}>Code: {student.student_code}</Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={resetInputs}>
                <Text style={styles.resetButtonText}>Search Again</Text>
              </TouchableOpacity>
            </View>
          </View>
          {student.onboarded ? (
            <View style={styles.statusOverlay}>
              {showRoute ? (
                <Text style={styles.statusText}>{eta}</Text>
              ) : (
                <TouchableOpacity style={styles.routeButton} onPress={handleShowRoute}>
                  <Text style={styles.routeButtonText}>Route</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.statusOverlay}>
              <Text style={styles.statusText}>
                Student offboarded at: {student.offboarded_at || "Unknown"}
              </Text>
            </View>
          )}
        </>
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
    </View>
  );
};

// Styles remain unchanged
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
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 25,
  },
  clearButton: {
    padding: 10,
  },
  clearButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchButton: {
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
  searchButtonText: {
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
  studentInfoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  studentInitial: {
    width: 50,
    height: 50,
    backgroundColor: "#4facfe",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  studentInitialText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  studentSchool: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  studentCode: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  statusOverlay: {
    position: "absolute",
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  routeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  routeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RouteTrackerScreen;