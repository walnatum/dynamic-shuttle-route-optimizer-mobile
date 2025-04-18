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
import styles from "./styles/RouteTrackerStyles"; // Adjust the path if you placed the file in a different 


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



export default RouteTrackerScreen;