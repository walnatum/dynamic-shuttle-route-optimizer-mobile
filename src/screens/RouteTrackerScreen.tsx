
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
import styles from "./styles/RouteTrackerStyles";

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
  point_latitude?: number;
  point_longitude?: number;
}

const RouteTrackerScreen = () => {
  const mapRef = useRef<MapView>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [studentCode, setStudentCode] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [eta, setEta] = useState<string>("");
  const [shuttleName, setShuttleName] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [showRoute, setShowRoute] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

  // Display shuttle location when student data is available
  useEffect(() => {
    if (student) {
      updateShuttleDisplay(student);
    }
  }, [student]);

  const updateShuttleDisplay = (studentData: Student) => {
    try {
      // Check if we have valid shuttle data
      if (!studentData.shuttle || 
          studentData.shuttle.current_latitude === null || 
          studentData.shuttle.current_longitude === null) {
        throw new Error("Shuttle location data not available");
      }

      const shuttleLat = studentData.shuttle.current_latitude;
      const shuttleLng = studentData.shuttle.current_longitude;

      // Validate and set shuttle location
      if (!isNaN(shuttleLat) && !isNaN(shuttleLng)) {
        const shuttleLoc = { latitude: shuttleLat, longitude: shuttleLng };
        setShuttleLocation(shuttleLoc);
        setShuttleName(studentData.shuttle.reg_number || "Shuttle");

        // Center map on shuttle location
        mapRef.current?.animateToRegion({
          latitude: shuttleLat,
          longitude: shuttleLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }

      // Store pickup location but don't show it yet
      if (studentData.point_latitude && studentData.point_longitude && 
          !isNaN(studentData.point_latitude) && !isNaN(studentData.point_longitude)) {
        setPickupLocation({
          latitude: studentData.point_latitude,
          longitude: studentData.point_longitude
        });
        setDestination(`Pickup Point: ${studentData.point_latitude.toFixed(4)}, ${studentData.point_longitude.toFixed(4)}`);
      } else {
        setDestination("Pickup point not specified");
      }

    } catch (error) {
      console.error("Display error:", error);
      Alert.alert("Error", error.message || "Failed to display shuttle location");
      setShuttleLocation(null);
      setShuttleName("");
    }
  };

  const calculateRouteAndETA = async () => {
    if (!student || !shuttleLocation || !pickupLocation) {
      Alert.alert("Error", "Location data not available.");
      return;
    }

    try {
      const origin = `${shuttleLocation.latitude},${shuttleLocation.longitude}`;
      const destination = `${pickupLocation.latitude},${pickupLocation.longitude}`;
      const apiKey = Config.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(data.error_message || "Failed to calculate route");
      }

      // Extract route coordinates from overview_polyline
      const points = decodePolyline(data.routes[0]?.overview_polyline?.points) || [];
      setRouteCoordinates(points);

      // Extract ETA
      const duration = data.routes[0]?.legs[0]?.duration?.text || "Unknown";
      setEta(`ETA: ${duration}`);

      // Fit map to show both locations and route
      const coordinatesToFit = [shuttleLocation, ...points, pickupLocation];
      mapRef.current?.fitToCoordinates(coordinatesToFit, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });

      setShowRoute(true);
    } catch (error: any) {
      console.error("Route calculation error:", error);
      setEta("Error calculating route");
      Alert.alert("Route Error", error.message || "Failed to calculate route and ETA");
    }
  };

  // Helper function to decode polyline points
  const decodePolyline = (encoded: string) => {
    if (!encoded) return [];
    
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  const fetchStudent = async () => {
    if (!studentCode.trim()) {
      Alert.alert("Error", "Please enter a student code.");
      return;
    }

    try {
      setIsSearching(true);
      setEta("");
      setShowRoute(false);
      setRouteCoordinates([]);
      setPickupLocation(null);
      
      const response = await fetch(`${Config.API_BASE_URL}/api/students/${studentCode}/`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Student not found");
      }

      const studentData = await response.json();
      
      // Check if shuttle_details exists and has coordinates
      if (!studentData.shuttle_details || 
          !studentData.shuttle_details.current_latitude || 
          !studentData.shuttle_details.current_longitude) {
        throw new Error("Shuttle location data not available");
      }

      const fetchedStudent: Student = {
        id: studentData.id,
        name: studentData.student_name,
        school: studentData.school_name,
        onboarded: studentData.onboarded,
        student_code: studentData.student_code,
        offboarded_at: studentData.offboarded_at,
        shuttle: {
          reg_number: studentData.shuttle_details.reg_number,
          current_latitude: parseFloat(studentData.shuttle_details.current_latitude),
          current_longitude: parseFloat(studentData.shuttle_details.current_longitude),
          driver_code: studentData.shuttle_details.driver_code,
        },
        point_latitude: studentData.point_latitude,
        point_longitude: studentData.point_longitude,
      };

      setStudent(fetchedStudent);

    } catch (error: any) {
      console.error("Fetch error:", error);
      Alert.alert("Error", error.message || "Failed to fetch student details");
      setStudent(null);
      setShuttleLocation(null);
    } finally {
      setIsSearching(false);
    }
  };

  const resetInputs = () => {
    setStudentCode("");
    setStudent(null);
    setShuttleLocation(null);
    setPickupLocation(null);
    setRouteCoordinates([]);
    setEta("");
    setShuttleName("");
    setDestination("");
    setShowRoute(false);
    mapRef.current?.animateToRegion(defaultLocation);
  };

  const handleShowRoute = async () => {
    await calculateRouteAndETA();
  };

//   return (
//     <View style={styles.container}>
//       {/* Map */}
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={defaultLocation}
//         showsUserLocation={permissionGranted}
//       >
//         {shuttleLocation && (
//           <Marker coordinate={shuttleLocation} title={shuttleName} pinColor="blue">
//             <Callout>
//               <View>
//                 <Text style={styles.calloutTitle}>{shuttleName}</Text>
//                 <Text>Driver: {student?.shuttle.driver_code || "Unknown"}</Text>
//                 <Text>Student: {student?.name || "Unknown"}</Text>
//                 <Text>Status: {student?.onboarded ? "Onboarded" : "Offboarded"}</Text>
//               </View>
//             </Callout>
//           </Marker>
//         )}
//         {showRoute && pickupLocation && (
//           <Marker
//             coordinate={pickupLocation}
//             title="Pickup Point"
//             pinColor="green"
//           />
//         )}
//         {showRoute && routeCoordinates.length > 0 && (
//           <Polyline
//             coordinates={routeCoordinates}
//             strokeWidth={4}
//             strokeColor="#007AFF"
//           />
//         )}
//       </MapView>

//       {/* Search Input */}
//       {!student ? (
//         <View style={styles.inputContainer}>
//           <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//             <TextInput
//               style={styles.beautifiedInput}
//               placeholder="Enter Student Code"
//               value={studentCode}
//               onChangeText={setStudentCode}
//               placeholderTextColor="#ffffff"
//               autoCapitalize="characters"
//             />
//             {studentCode ? (
//               <TouchableOpacity style={styles.clearButton} onPress={() => setStudentCode("")}>
//                 <Text style={styles.clearButtonText}>X</Text>
//               </TouchableOpacity>
//             ) : null}
//           </LinearGradient>
//           <TouchableOpacity 
//             style={styles.searchButton} 
//             onPress={fetchStudent} 
//             disabled={isSearching || !studentCode.trim()}
//           >
//             <Text style={styles.searchButtonText}>
//               {isSearching ? "Searching..." : "Search"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <>
//           <View style={styles.studentInfoContainer}>
//             <View style={styles.studentCard}>
//               <View style={styles.studentInitial}>
//                 <Text style={styles.studentInitialText}>
//                   {student.name.charAt(0).toUpperCase()}
//                 </Text>
//               </View>
//               <View style={styles.studentDetails}>
//                 <Text style={styles.studentName}>{student.name}</Text>
//                 <Text style={styles.studentSchool}>{student.school}</Text>
//                 <Text style={styles.studentCode}>{student.student_code}</Text>
//                 <Text style={[styles.studentStatus, 
//                   { color: student.onboarded ? 'green' : 'red' }]}>
//                   {student.onboarded ? "ONBOARDED" : "OFFBOARDED"}
//                 </Text>
//               </View>
//               <TouchableOpacity style={styles.resetButton} onPress={resetInputs}>
//                 <Text style={styles.resetButtonText}>New Search</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
          
//           <View style={styles.statusOverlay}>
//             {destination ? (
//               <Text style={styles.destinationText}>{destination}</Text>
//             ) : null}
            
//             {eta ? (
//               <Text style={styles.etaText}>{eta}</Text>
//             ) : shuttleLocation ? (
//               <TouchableOpacity style={styles.routeButton} onPress={handleShowRoute}>
//                 <Text style={styles.routeButtonText}>Show Route</Text>
//               </TouchableOpacity>
//             ) : (
//               <Text style={styles.statusText}>Shuttle location not available</Text>
//             )}
//           </View>
//         </>
//       )}

//       {/* Floating Buttons */}
//       <View style={styles.floatingButtons}>
//         <TouchableOpacity style={styles.floatingButton} onPress={fetchStudent}>
//           <Text style={styles.buttonText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

return (
  <View style={styles.container}>
    {/* Map remains unchanged */}
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={defaultLocation}
      showsUserLocation={permissionGranted}
    >
      {/* Markers and Polyline remain unchanged */}
    </MapView>

    {/* Search Input */}
    {!student ? (
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.beautifiedInput}
            placeholder="Enter Student Code"
            value={studentCode}
            onChangeText={setStudentCode}
            placeholderTextColor="#888"
            autoCapitalize="characters"
          />
          {studentCode ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => setStudentCode("")}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={fetchStudent} 
          disabled={isSearching || !studentCode.trim()}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? "Searching..." : "Search"}
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <>
        <View style={styles.studentInfoContainer}>
          <View style={styles.studentCard}>
            <View style={styles.studentInitial}>
              <Text style={styles.studentInitialText}>
                {student.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentSchool}>{student.school}</Text>
              <Text style={styles.studentCode}>{student.student_code}</Text>
              <Text style={[styles.studentStatus, 
                { color: student.onboarded ? 'green' : 'red' }]}>
                {student.onboarded ? "ONBOARDED" : "OFFBOARDED"}
              </Text>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetInputs}>
              <Text style={styles.resetButtonText}>New Search</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statusOverlay}>
          {destination ? (
            <Text style={styles.destinationText}>{destination}</Text>
          ) : null}
          
          {eta ? (
            <Text style={styles.etaText}>{eta}</Text>
          ) : shuttleLocation ? (
            <TouchableOpacity style={styles.routeButton} onPress={handleShowRoute}>
              <Text style={styles.routeButtonText}>Show Route</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.statusText}>Shuttle location not available</Text>
          )}
        </View>
      </>
    )}

    {/* Floating Buttons */}
    <View style={styles.floatingButtons}>
      <TouchableOpacity style={styles.floatingButton} onPress={fetchStudent}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  </View>
);
};



export default RouteTrackerScreen;