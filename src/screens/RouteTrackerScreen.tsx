// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   TextInput,
// } from "react-native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";
// import Config from "react-native-config";
// import styles from "./styles/RouteTrackerStyles"; // Adjust the path if you placed the file in a different 


// interface Shuttle {
//   reg_number: string;
//   current_latitude: number | null;
//   current_longitude: number | null;
//   driver_code: string | null;
// }

// interface Student {
//   id: string;
//   name: string;
//   school: string;
//   onboarded: boolean;
//   student_code: string;
//   offboarded_at?: string;
//   shuttle: Shuttle;
//   latitude?: number;
//   longitude?: number;
//   point_latitude?: number;
//   point_longitude?: number;
// }

// const RouteTrackerScreen = () => {
//   const mapRef = useRef<MapView>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [schoolNameId, setSchoolNameId] = useState("");
//   const [studentCode, setStudentCode] = useState("");
//   const [student, setStudent] = useState<Student | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [eta, setEta] = useState<string>("Calculating...");
//   const [shuttleName, setShuttleName] = useState<string>("");
//   const [destination, setDestination] = useState<string>("");
//   const [showRoute, setShowRoute] = useState(false);

//   const defaultLocation = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   // Request location permission
//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       try {
//         if (Platform.OS === "android") {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//               title: "Location Permission",
//               message: "This app needs access to your location.",
//               buttonNeutral: "Ask Me Later",
//               buttonNegative: "Cancel",
//               buttonPositive: "OK",
//             }
//           );
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             setPermissionGranted(true);
//           } else {
//             setErrorMsg("Location permission denied");
//           }
//         } else {
//           setPermissionGranted(true);
//         }
//       } catch (err) {
//         setErrorMsg("Error requesting location permission");
//       }
//     };
//     requestLocationPermission();
//   }, []);

//   // Updated function to display shuttle location
//   const updateShuttleDisplay = async (studentData: Student) => {
//     try {
//       // Log shuttle data for debugging
//       console.log("Shuttle data:", JSON.stringify(studentData.shuttle, null, 2));

//       // Convert coordinates to numbers
//       const latitude = Number(studentData.shuttle.current_latitude);
//       const longitude = Number(studentData.shuttle.current_longitude);

//       // Validate shuttle coordinates
//       if (
//         latitude != null &&
//         longitude != null &&
//         !isNaN(latitude) &&
//         !isNaN(longitude)
//       ) {
//         const shuttleLoc = { latitude, longitude };
//         setShuttleLocation(shuttleLoc);
//         setShuttleName(studentData.shuttle.reg_number || "Unknown");

//         // Center map on shuttle location
//         mapRef.current?.animateToRegion({
//           latitude: shuttleLoc.latitude,
//           longitude: shuttleLoc.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });
//       } else {
//         console.warn(
//           "Invalid shuttle coordinates after conversion:",
//           `latitude: ${latitude}, longitude: ${longitude}`
//         );
//         setShuttleLocation(null);
//         setEta("Shuttle location unavailable");
//         Alert.alert(
//           "Error",
//           "Shuttle location data is invalid. Please ensure the shuttle has valid coordinates."
//         );
//         return;
//       }

//       // Set destination to pickup point
//       const pickupLatitude = Number(studentData.point_latitude);
//       const pickupLongitude = Number(studentData.point_longitude);

//       if (
//         pickupLatitude != null &&
//         pickupLongitude != null &&
//         !isNaN(pickupLatitude) &&
//         !isNaN(pickupLongitude)
//       ) {
//         setDestination(
//           `Pickup Point: (${pickupLatitude}, ${pickupLongitude})`
//         );
//       } else {
//         setDestination("Pickup point unavailable");
//       }
//     } catch (error: any) {
//       console.error("Shuttle display error:", error.message);
//       setEta("Error displaying shuttle");
//       Alert.alert("Error", error.message || "Failed to display shuttle location");
//     }
//   };

//   // Calculate route and ETA when Route button is tapped
//   const calculateRouteAndETA = async () => {
//     if (!student || !shuttleLocation || !student.point_latitude || !student.point_longitude) {
//       Alert.alert("Error", "Missing shuttle or pickup point coordinates.");
//       return;
//     }

//     try {
//       // Placeholder: Google Maps Directions API
//       const origin = `${shuttleLocation.latitude},${shuttleLocation.longitude}`;
//       const destination = `${student.point_latitude},${student.point_longitude}`;
//       const apiKey = Config.GOOGLE_MAPS_API_KEY;
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status !== "OK") {
//         throw new Error(data.error_message || "Failed to calculate route");
//       }

//       // Extract route coordinates
//       const points = data.routes[0]?.legs[0]?.steps.map((step: any) => ({
//         latitude: step.start_location.lat,
//         longitude: step.start_location.lng,
//       }));
//       if (points) {
//         setRouteCoordinates(points);
//       } else {
//         setRouteCoordinates([]);
//       }

//       // Extract ETA
//       const duration = data.routes[0]?.legs[0]?.duration?.text || "Unknown";
//       setEta(`Current Location to Pickup Point ETA: ${duration}`);

//       // Fit map to show route
//       if (points && points.length > 0) {
//         mapRef.current?.fitToCoordinates(
//           [shuttleLocation, ...points, { latitude: Number(student.point_latitude), longitude: Number(student.point_longitude) }],
//           {
//             edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           }
//         );
//       }
//     } catch (error: any) {
//       console.error("Route calculation error:", error.message);
//       setEta("Error calculating route");
//       Alert.alert("Error", error.message || "Failed to calculate route and ETA");
//     }
//   };

//   // Fetch student details
//   const fetchStudent = async () => {
//     if (!studentCode.trim()) {
//       Alert.alert("Error", "Please enter a student code.");
//       return;
//     }

//     try {
//       setIsSearching(true);
//       console.log(`Fetching student with code: ${studentCode}`);
//       const fetchResponse = await fetch(`${Config.API_BASE_URL}/api/students/${studentCode}/`, {
//         method: "GET",
//         headers: {
//           "Accept": "application/json",
//           "Content-Type": "application/json",
//         },
//       });

//       if (!fetchResponse.ok) {
//         const errorText = await fetchResponse.text();
//         console.error("Fetch error:", fetchResponse.status, errorText);
//         throw new Error(`Student not found. Status: ${fetchResponse.status}`);
//       }

//       const studentData = await fetchResponse.json();
//       console.log("Fetched student:", JSON.stringify(studentData, null, 2));

//       const fetchedStudent: Student = {
//         id: studentData.id,
//         name: studentData.student_name,
//         school: studentData.school_name,
//         onboarded: studentData.onboarded,
//         student_code: studentData.student_code,
//         offboarded_at: studentData.offboarded_at,
//         shuttle: {
//           reg_number: studentData.shuttle.reg_number,
//           current_latitude: studentData.shuttle.current_latitude,
//           current_longitude: studentData.shuttle.current_longitude,
//           driver_code: studentData.shuttle.driver_code,
//         },
//         latitude: studentData.latitude,
//         longitude: studentData.longitude,
//         point_latitude: studentData.point_latitude,
//         point_longitude: studentData.point_longitude,
//       };

//       setStudent(fetchedStudent);

//       // Set destination and display shuttle
//       if (fetchedStudent.onboarded) {
//         await updateShuttleDisplay(fetchedStudent);
//       } else {
//         setDestination("Student not onboarded");
//         setShuttleLocation(null);
//       }

//       // Reset showRoute
//       setShowRoute(false);
//     } catch (error: any) {
//       console.error("Error fetching student:", error.message);
//       Alert.alert("Error", error.message || "Failed to fetch student. Check the code or network.");
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (!schoolNameId || !studentCode) {
//       Alert.alert("Error", "Please enter both School Name/Id and Student Code.");
//       return;
//     }

//     await fetchStudent();
//   };

//   // Reset inputs and map
//   const resetInputs = () => {
//     setSchoolNameId("");
//     setStudentCode("");
//     setStudent(null);
//     setShuttleLocation(null);
//     setRouteCoordinates([]);
//     setEta("Calculating...");
//     setShuttleName("");
//     setDestination("");
//     setShowRoute(false);
//     mapRef.current?.animateToRegion(defaultLocation);
//   };

//   // Handle Route button click
//   const handleShowRoute = async () => {
//     setShowRoute(true);
//     await calculateRouteAndETA();
//   };

//   return (
//     <View style={styles.container}>
//       {/* Map */}
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={defaultLocation}
//       >
//         {shuttleLocation && (
//           <Marker coordinate={shuttleLocation} title={shuttleName} pinColor="blue">
//             <Callout>
//               <View>
//                 <Text style={styles.calloutTitle}>{shuttleName}</Text>
//                 <Text>Student: {student?.name || "Unknown"}</Text>
//                 <Text>Destination: {destination}</Text>
//               </View>
//             </Callout>
//           </Marker>
//         )}
//         {student?.point_latitude && student?.point_longitude && (
//           <Marker
//             coordinate={{ latitude: Number(student.point_latitude), longitude: Number(student.point_longitude) }}
//             title="Pickup Point"
//             pinColor="green"
//           />
//         )}
//         {showRoute && routeCoordinates.length > 0 && (
//           <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#007AFF" />
//         )}
//       </MapView>

//       {/* Show either search inputs or student/shuttle info */}
//       {!student ? (
//         <View style={styles.inputContainer}>
//           <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//             <TextInput
//               style={styles.beautifiedInput}
//               placeholder="School Name/Id"
//               value={schoolNameId}
//               onChangeText={setSchoolNameId}
//               placeholderTextColor="#ffffff"
//             />
//             <TouchableOpacity style={styles.clearButton} onPress={() => setSchoolNameId("")}>
//               <Text style={styles.clearButtonText}>X</Text>
//             </TouchableOpacity>
//           </LinearGradient>
//           <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//             <TextInput
//               style={styles.beautifiedInput}
//               placeholder="Student Code"
//               value={studentCode}
//               onChangeText={setStudentCode}
//               placeholderTextColor="#ffffff"
//             />
//             <TouchableOpacity style={styles.clearButton} onPress={() => setStudentCode("")}>
//               <Text style={styles.clearButtonText}>X</Text>
//             </TouchableOpacity>
//           </LinearGradient>
//           <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
//             <Text style={styles.searchButtonText}>{isSearching ? "Searching..." : "Search"}</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <>
//           <View style={styles.studentInfoContainer}>
//             <View style={styles.studentCard}>
//               <View style={styles.studentInitial}>
//                 <Text style={styles.studentInitialText}>{student.name.charAt(0).toUpperCase()}</Text>
//               </View>
//               <View style={styles.studentDetails}>
//                 <Text style={styles.studentName}>{student.name}</Text>
//                 <Text style={styles.studentSchool}>{student.school}</Text>
//                 <Text style={styles.studentCode}>Code: {student.student_code}</Text>
//               </View>
//               <TouchableOpacity style={styles.resetButton} onPress={resetInputs}>
//                 <Text style={styles.resetButtonText}>Search Again</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           {student.onboarded ? (
//             <View style={styles.statusOverlay}>
//               {showRoute ? (
//                 <Text style={styles.statusText}>{eta}</Text>
//               ) : (
//                 <TouchableOpacity style={styles.routeButton} onPress={handleShowRoute}>
//                   <Text style={styles.routeButtonText}>Route</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ) : (
//             <View style={styles.statusOverlay}>
//               <Text style={styles.statusText}>
//                 Student offboarded at: {student.offboarded_at || "Unknown"}
//               </Text>
//             </View>
//           )}
//         </>
//       )}

//       {/* Floating Buttons (Bottom) */}
//       <View style={styles.floatingButtons}>
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Weather</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Traffic</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Crash</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };



// export default RouteTrackerScreen;


// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   TextInput,
// } from "react-native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";
// import Config from "react-native-config";
// import styles from "./styles/RouteTrackerStyles";

// interface Shuttle {
//   reg_number: string;
//   current_latitude: number | null;
//   current_longitude: number | null;
//   driver_code: string | null;
// }

// interface Student {
//   id: string;
//   name: string;
//   school: string;
//   onboarded: boolean;
//   student_code: string;
//   offboarded_at?: string;
//   shuttle: Shuttle;
//   latitude?: number;
//   longitude?: number;
//   point_latitude?: number;
//   point_longitude?: number;
// }

// const RouteTrackerScreen = () => {
//   const mapRef = useRef<MapView>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [schoolNameId, setSchoolNameId] = useState("");
//   const [studentCode, setStudentCode] = useState("");
//   const [student, setStudent] = useState<Student | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [eta, setEta] = useState<string>("Calculating...");
//   const [shuttleName, setShuttleName] = useState<string>("");
//   const [destination, setDestination] = useState<string>("");
//   const [showRoute, setShowRoute] = useState(false);

//   const defaultLocation = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   // Request location permission
//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       try {
//         if (Platform.OS === "android") {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//               title: "Location Permission",
//               message: "This app needs access to your location.",
//               buttonNeutral: "Ask Me Later",
//               buttonNegative: "Cancel",
//               buttonPositive: "OK",
//             }
//           );
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             setPermissionGranted(true);
//           } else {
//             setErrorMsg("Location permission denied");
//           }
//         } else {
//           setPermissionGranted(true);
//         }
//       } catch (err) {
//         setErrorMsg("Error requesting location permission");
//       }
//     };
//     requestLocationPermission();
//   }, []);

//   // Updated function to display shuttle location
//   const updateShuttleDisplay = async (studentData: Student) => {
//     try {
//       // Convert coordinates to numbers
//       const latitude = parseFloat(studentData.shuttle.current_latitude as any);
//       const longitude = parseFloat(studentData.shuttle.current_longitude as any);

//       // Validate shuttle coordinates
//       if (!isNaN(latitude) && !isNaN(longitude)) {
//         const shuttleLoc = { latitude, longitude };
//         setShuttleLocation(shuttleLoc);
//         setShuttleName(studentData.shuttle.reg_number || "Unknown Shuttle");

//         // Center map on shuttle location
//         mapRef.current?.animateToRegion({
//           latitude: shuttleLoc.latitude,
//           longitude: shuttleLoc.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });

//         // Set destination to pickup point if available
//         if (studentData.point_latitude && studentData.point_longitude) {
//           const pickupLat = parseFloat(studentData.point_latitude as any);
//           const pickupLng = parseFloat(studentData.point_longitude as any);
//           if (!isNaN(pickupLat) && !isNaN(pickupLng)) {
//             setDestination(`Pickup Point: (${pickupLat.toFixed(4)}, ${pickupLng.toFixed(4)})`);
//           } else {
//             setDestination("Pickup point coordinates invalid");
//           }
//         } else {
//           setDestination("Pickup point not specified");
//         }
//       } else {
//         console.warn("Invalid shuttle coordinates:", latitude, longitude);
//         setShuttleLocation(null);
//         setEta("Shuttle location unavailable");
//         Alert.alert(
//           "Location Error",
//           "Shuttle location data is invalid or not available."
//         );
//       }
//     } catch (error: any) {
//       console.error("Shuttle display error:", error);
//       setEta("Error displaying shuttle");
//       Alert.alert("Error", "Failed to display shuttle location");
//     }
//   };

//   // Calculate route and ETA when Route button is tapped
//   const calculateRouteAndETA = async () => {
//     if (!student || !shuttleLocation) {
//       Alert.alert("Error", "Shuttle location not available.");
//       return;
//     }

//     const pickupLat = parseFloat(student.point_latitude as any);
//     const pickupLng = parseFloat(student.point_longitude as any);
    
//     if (isNaN(pickupLat) || isNaN(pickupLng)) {
//       Alert.alert("Error", "Pickup point coordinates are invalid.");
//       return;
//     }

//     try {
//       const origin = `${shuttleLocation.latitude},${shuttleLocation.longitude}`;
//       const destination = `${pickupLat},${pickupLng}`;
//       const apiKey = Config.GOOGLE_MAPS_API_KEY;
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status !== "OK") {
//         throw new Error(data.error_message || "Failed to calculate route");
//       }

//       // Extract route coordinates
//       const points = data.routes[0]?.overview_path?.map((point: any) => ({
//         latitude: point.lat,
//         longitude: point.lng,
//       })) || [];

//       setRouteCoordinates(points);

//       // Extract ETA
//       const duration = data.routes[0]?.legs[0]?.duration?.text || "Unknown";
//       setEta(`ETA to Pickup: ${duration}`);

//       // Fit map to show route
//       if (points.length > 0) {
//         const pickupPoint = { latitude: pickupLat, longitude: pickupLng };
//         const coordinatesToFit = [shuttleLocation, ...points, pickupPoint];
        
//         mapRef.current?.fitToCoordinates(coordinatesToFit, {
//           edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//           animated: true,
//         });
//       }
//     } catch (error: any) {
//       console.error("Route calculation error:", error);
//       setEta("Error calculating route");
//       Alert.alert("Route Error", error.message || "Failed to calculate route and ETA");
//     }
//   };

//   // Fetch student details
//   const fetchStudent = async () => {
//     if (!studentCode.trim()) {
//       Alert.alert("Error", "Please enter a student code.");
//       return;
//     }

//     try {
//       setIsSearching(true);
//       const response = await fetch(`${Config.API_BASE_URL}/api/students/${studentCode}/`);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Student not found");
//       }

//       const studentData = await response.json();
      
//       const fetchedStudent: Student = {
//         id: studentData.id,
//         name: studentData.student_name,
//         school: studentData.school_name,
//         onboarded: studentData.onboarded,
//         student_code: studentData.student_code,
//         offboarded_at: studentData.offboarded_at,
//         shuttle: {
//           reg_number: studentData.shuttle?.reg_number || "Unknown",
//           current_latitude: studentData.shuttle?.current_latitude || null,
//           current_longitude: studentData.shuttle?.current_longitude || null,
//           driver_code: studentData.shuttle?.driver_code || null,
//         },
//         point_latitude: studentData.point_latitude,
//         point_longitude: studentData.point_longitude,
//       };

//       setStudent(fetchedStudent);

//       if (fetchedStudent.onboarded && fetchedStudent.shuttle.current_latitude && fetchedStudent.shuttle.current_longitude) {
//         await updateShuttleDisplay(fetchedStudent);
//       } else {
//         setDestination("Student not onboarded or shuttle location unavailable");
//         setShuttleLocation(null);
//       }

//       setShowRoute(false);
//     } catch (error: any) {
//       console.error("Fetch error:", error);
//       Alert.alert("Error", error.message || "Failed to fetch student details");
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (!schoolNameId || !studentCode) {
//       Alert.alert("Error", "Please enter both School Name/Id and Student Code.");
//       return;
//     }
//     await fetchStudent();
//   };

//   const resetInputs = () => {
//     setSchoolNameId("");
//     setStudentCode("");
//     setStudent(null);
//     setShuttleLocation(null);
//     setRouteCoordinates([]);
//     setEta("Calculating...");
//     setShuttleName("");
//     setDestination("");
//     setShowRoute(false);
//     mapRef.current?.animateToRegion(defaultLocation);
//   };

//   const handleShowRoute = async () => {
//     setShowRoute(true);
//     await calculateRouteAndETA();
//   };

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
//                 <Text>Student: {student?.name || "Unknown"}</Text>
//                 <Text>Status: {student?.onboarded ? "Onboarded" : "Offboarded"}</Text>
//                 <Text>Destination: {destination}</Text>
//               </View>
//             </Callout>
//           </Marker>
//         )}
//         {student?.point_latitude && student?.point_longitude && (
//           <Marker
//             coordinate={{
//               latitude: parseFloat(student.point_latitude as any),
//               longitude: parseFloat(student.point_longitude as any),
//             }}
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

//       {/* Show either search inputs or student/shuttle info */}
//       {!student ? (
//         <View style={styles.inputContainer}>
//           <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//             <TextInput
//               style={styles.beautifiedInput}
//               placeholder="School Name/Id"
//               value={schoolNameId}
//               onChangeText={setSchoolNameId}
//               placeholderTextColor="#ffffff"
//             />
//             <TouchableOpacity style={styles.clearButton} onPress={() => setSchoolNameId("")}>
//               <Text style={styles.clearButtonText}>X</Text>
//             </TouchableOpacity>
//           </LinearGradient>
//           <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//             <TextInput
//               style={styles.beautifiedInput}
//               placeholder="Student Code"
//               value={studentCode}
//               onChangeText={setStudentCode}
//               placeholderTextColor="#ffffff"
//             />
//             <TouchableOpacity style={styles.clearButton} onPress={() => setStudentCode("")}>
//               <Text style={styles.clearButtonText}>X</Text>
//             </TouchableOpacity>
//           </LinearGradient>
//           <TouchableOpacity 
//             style={styles.searchButton} 
//             onPress={handleSearch} 
//             disabled={isSearching}
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
//                 <Text style={styles.studentCode}>Code: {student.student_code}</Text>
//                 <Text style={styles.studentStatus}>
//                   Status: {student.onboarded ? "Onboarded" : "Offboarded"}
//                 </Text>
//               </View>
//               <TouchableOpacity style={styles.resetButton} onPress={resetInputs}>
//                 <Text style={styles.resetButtonText}>Search Again</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           {student.onboarded ? (
//             <View style={styles.statusOverlay}>
//               {showRoute ? (
//                 <Text style={styles.statusText}>{eta}</Text>
//               ) : shuttleLocation ? (
//                 <TouchableOpacity style={styles.routeButton} onPress={handleShowRoute}>
//                   <Text style={styles.routeButtonText}>Show Route</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <Text style={styles.statusText}>Shuttle location not available</Text>
//               )}
//             </View>
//           ) : (
//             <View style={styles.statusOverlay}>
//               <Text style={styles.statusText}>
//                 Student offboarded at: {student.offboarded_at || "Unknown time"}
//               </Text>
//             </View>
//           )}
//         </>
//       )}

//       {/* Floating Buttons */}
//       <View style={styles.floatingButtons}>
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Weather</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Traffic</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Alert</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default RouteTrackerScreen;



// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   TextInput,
// } from "react-native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";
// import Config from "react-native-config";
// import styles from "./styles/RouteTrackerStyles";

// interface Shuttle {
//   reg_number: string;
//   current_latitude: number | null;
//   current_longitude: number | null;
//   driver_code: string | null;
// }

// interface Student {
//   id: string;
//   name: string;
//   school: string;
//   onboarded: boolean;
//   student_code: string;
//   offboarded_at?: string;
//   shuttle: Shuttle;
//   latitude?: number;
//   longitude?: number;
//   point_latitude?: number;
//   point_longitude?: number;
// }

// const RouteTrackerScreen = () => {
//   const mapRef = useRef<MapView>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [studentCode, setStudentCode] = useState("");
//   const [student, setStudent] = useState<Student | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [eta, setEta] = useState<string>("");
//   const [shuttleName, setShuttleName] = useState<string>("");
//   const [destination, setDestination] = useState<string>("");
//   const [showRoute, setShowRoute] = useState(false);

//   const defaultLocation = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   // Request location permission
//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       try {
//         if (Platform.OS === "android") {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//               title: "Location Permission",
//               message: "This app needs access to your location.",
//               buttonNeutral: "Ask Me Later",
//               buttonNegative: "Cancel",
//               buttonPositive: "OK",
//             }
//           );
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             setPermissionGranted(true);
//           } else {
//             setErrorMsg("Location permission denied");
//           }
//         } else {
//           setPermissionGranted(true);
//         }
//       } catch (err) {
//         setErrorMsg("Error requesting location permission");
//       }
//     };
//     requestLocationPermission();
//   }, []);

//   // Display shuttle and pickup location when student data is available
//   useEffect(() => {
//     if (student) {
//       updateShuttleAndPickupDisplay(student);
//     }
//   }, [student]);

//   const updateShuttleAndPickupDisplay = (studentData: Student) => {
//     try {
//       // Extract shuttle data
//       const shuttle = studentData.shuttle;
//       const shuttleLat = parseFloat(shuttle.current_latitude as any);
//       const shuttleLng = parseFloat(shuttle.current_longitude as any);

//       // Extract pickup point data
//       const pickupLat = parseFloat(studentData.point_latitude as any);
//       const pickupLng = parseFloat(studentData.point_longitude as any);

//       // Validate and set shuttle location
//       if (!isNaN(shuttleLat) && !isNaN(shuttleLng)) {
//         const shuttleLoc = { latitude: shuttleLat, longitude: shuttleLng };
//         setShuttleLocation(shuttleLoc);
//         setShuttleName(shuttle.reg_number || "Shuttle");

//         // Center map between shuttle and pickup point if both available
//         if (!isNaN(pickupLat) && !isNaN(pickupLng)) {
//           const centerLat = (shuttleLat + pickupLat) / 2;
//           const centerLng = (shuttleLng + pickupLng) / 2;
//           const latDelta = Math.abs(shuttleLat - pickupLat) * 1.5;
//           const lngDelta = Math.abs(shuttleLng - pickupLng) * 1.5;

//           mapRef.current?.animateToRegion({
//             latitude: centerLat,
//             longitude: centerLng,
//             latitudeDelta: Math.max(latDelta, 0.01),
//             longitudeDelta: Math.max(lngDelta, 0.01),
//           });
//         } else {
//           // Just center on shuttle if no pickup point
//           mapRef.current?.animateToRegion({
//             latitude: shuttleLat,
//             longitude: shuttleLng,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           });
//         }
//       }

//       // Set destination text
//       if (!isNaN(pickupLat) && !isNaN(pickupLng)) {
//         setDestination(`Pickup Point: ${pickupLat.toFixed(4)}, ${pickupLng.toFixed(4)}`);
//       } else {
//         setDestination("Pickup point not specified");
//       }

//     } catch (error) {
//       console.error("Display error:", error);
//       Alert.alert("Error", "Failed to display locations");
//     }
//   };

//   const calculateRouteAndETA = async () => {
//     if (!student || !shuttleLocation) {
//       Alert.alert("Error", "Shuttle location not available.");
//       return;
//     }

//     const pickupLat = parseFloat(student.point_latitude as any);
//     const pickupLng = parseFloat(student.point_longitude as any);
    
//     if (isNaN(pickupLat) || isNaN(pickupLng)) {
//       Alert.alert("Error", "Pickup point coordinates are invalid.");
//       return;
//     }

//     try {
//       const origin = `${shuttleLocation.latitude},${shuttleLocation.longitude}`;
//       const destination = `${pickupLat},${pickupLng}`;
//       const apiKey = Config.GOOGLE_MAPS_API_KEY;
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status !== "OK") {
//         throw new Error(data.error_message || "Failed to calculate route");
//       }

//       // Extract route coordinates from overview_polyline
//       const points = decodePolyline(data.routes[0]?.overview_polyline?.points) || [];
//       setRouteCoordinates(points);

//       // Extract ETA
//       const duration = data.routes[0]?.legs[0]?.duration?.text || "Unknown";
//       setEta(`ETA: ${duration}`);

//       // Fit map to show route
//       if (points.length > 0) {
//         const pickupPoint = { latitude: pickupLat, longitude: pickupLng };
//         const coordinatesToFit = [shuttleLocation, ...points, pickupPoint];
        
//         mapRef.current?.fitToCoordinates(coordinatesToFit, {
//           edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//           animated: true,
//         });
//       }
//     } catch (error: any) {
//       console.error("Route calculation error:", error);
//       setEta("Error calculating route");
//       Alert.alert("Route Error", error.message || "Failed to calculate route and ETA");
//     }
//   };

//   // Helper function to decode polyline points
//   const decodePolyline = (encoded: string) => {
//     if (!encoded) return [];
    
//     const poly = [];
//     let index = 0, len = encoded.length;
//     let lat = 0, lng = 0;

//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lng += dlng;

//       poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return poly;
//   };

//   const fetchStudent = async () => {
//     if (!studentCode.trim()) {
//       Alert.alert("Error", "Please enter a student code.");
//       return;
//     }

//     try {
//       setIsSearching(true);
//       setEta("");
//       setShowRoute(false);
//       setRouteCoordinates([]);
      
//       const response = await fetch(`${Config.API_BASE_URL}/api/students/${studentCode}/`);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Student not found");
//       }

//       const studentData = await response.json();
//       console.log("Student data:", studentData); // For debugging
      
//       if (!studentData.shuttle) {
//         throw new Error("No shuttle assigned to this student");
//       }

//       const fetchedStudent: Student = {
//         id: studentData.id,
//         name: studentData.student_name,
//         school: studentData.school_name,
//         onboarded: studentData.onboarded,
//         student_code: studentData.student_code,
//         offboarded_at: studentData.offboarded_at,
//         shuttle: {
//           reg_number: studentData.shuttle.reg_number,
//           current_latitude: studentData.shuttle.current_latitude,
//           current_longitude: studentData.shuttle.current_longitude,
//           driver_code: studentData.shuttle.driver_code,
//         },
//         point_latitude: studentData.point_latitude,
//         point_longitude: studentData.point_longitude,
//       };

//       setStudent(fetchedStudent);

//     } catch (error: any) {
//       console.error("Fetch error:", error);
//       Alert.alert("Error", error.message || "Failed to fetch student details");
//       setStudent(null);
//       setShuttleLocation(null);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const resetInputs = () => {
//     setStudentCode("");
//     setStudent(null);
//     setShuttleLocation(null);
//     setRouteCoordinates([]);
//     setEta("");
//     setShuttleName("");
//     setDestination("");
//     setShowRoute(false);
//     mapRef.current?.animateToRegion(defaultLocation);
//   };

//   const handleShowRoute = async () => {
//     setShowRoute(true);
//     await calculateRouteAndETA();
//   };

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
//         {student?.point_latitude && student?.point_longitude && !isNaN(parseFloat(student.point_latitude as any)) && (
//           <Marker
//             coordinate={{
//               latitude: parseFloat(student.point_latitude as any),
//               longitude: parseFloat(student.point_longitude as any),
//             }}
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
//         <TouchableOpacity style={styles.floatingButton}>
//           <Text style={styles.buttonText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default RouteTrackerScreen;





// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   TextInput,
// } from "react-native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";
// import Config from "react-native-config";
// import styles from "./styles/RouteTrackerStyles";

// interface Shuttle {
//   reg_number: string;
//   current_latitude: number | null;
//   current_longitude: number | null;
//   driver_code: string | null;
// }

// interface Student {
//   id: string;
//   name: string;
//   school: string;
//   onboarded: boolean;
//   student_code: string;
//   offboarded_at?: string;
//   shuttle: Shuttle;
//   point_latitude?: number;
//   point_longitude?: number;
// }

// const RouteTrackerScreen = () => {
//   const mapRef = useRef<MapView>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [studentCode, setStudentCode] = useState("");
//   const [student, setStudent] = useState<Student | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [eta, setEta] = useState<string>("");
//   const [shuttleName, setShuttleName] = useState<string>("");
//   const [destination, setDestination] = useState<string>("");
//   const [showRoute, setShowRoute] = useState(false);

//   const defaultLocation = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   // Request location permission
//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       try {
//         if (Platform.OS === "android") {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//               title: "Location Permission",
//               message: "This app needs access to your location.",
//               buttonNeutral: "Ask Me Later",
//               buttonNegative: "Cancel",
//               buttonPositive: "OK",
//             }
//           );
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             setPermissionGranted(true);
//           } else {
//             setErrorMsg("Location permission denied");
//           }
//         } else {
//           setPermissionGranted(true);
//         }
//       } catch (err) {
//         setErrorMsg("Error requesting location permission");
//       }
//     };
//     requestLocationPermission();
//   }, []);

//   // Display shuttle and pickup location when student data is available
//   useEffect(() => {
//     if (student) {
//       updateShuttleAndPickupDisplay(student);
//     }
//   }, [student]);

//   const updateShuttleAndPickupDisplay = (studentData: Student) => {
//     try {
//       // Check if we have valid shuttle data
//       if (!studentData.shuttle || 
//           studentData.shuttle.current_latitude === null || 
//           studentData.shuttle.current_longitude === null) {
//         throw new Error("Shuttle location data not available");
//       }

//       const shuttleLat = studentData.shuttle.current_latitude;
//       const shuttleLng = studentData.shuttle.current_longitude;

//       // Extract pickup point data
//       const pickupLat = studentData.point_latitude;
//       const pickupLng = studentData.point_longitude;

//       // Validate and set shuttle location
//       if (!isNaN(shuttleLat) && !isNaN(shuttleLng)) {
//         const shuttleLoc = { latitude: shuttleLat, longitude: shuttleLng };
//         setShuttleLocation(shuttleLoc);
//         setShuttleName(studentData.shuttle.reg_number || "Shuttle");

//         // Center map between shuttle and pickup point if both available
//         if (pickupLat && pickupLng && !isNaN(pickupLat) && !isNaN(pickupLng)) {
//           const centerLat = (shuttleLat + pickupLat) / 2;
//           const centerLng = (shuttleLng + pickupLng) / 2;
//           const latDelta = Math.abs(shuttleLat - pickupLat) * 1.5;
//           const lngDelta = Math.abs(shuttleLng - pickupLng) * 1.5;

//           mapRef.current?.animateToRegion({
//             latitude: centerLat,
//             longitude: centerLng,
//             latitudeDelta: Math.max(latDelta, 0.01),
//             longitudeDelta: Math.max(lngDelta, 0.01),
//           });
//         } else {
//           // Just center on shuttle if no pickup point
//           mapRef.current?.animateToRegion({
//             latitude: shuttleLat,
//             longitude: shuttleLng,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           });
//         }
//       }

//       // Set destination text
//       if (pickupLat && pickupLng && !isNaN(pickupLat) && !isNaN(pickupLng)) {
//         setDestination(`Pickup Point: ${pickupLat.toFixed(4)}, ${pickupLng.toFixed(4)}`);
//       } else {
//         setDestination("Pickup point not specified");
//       }

//     } catch (error) {
//       console.error("Display error:", error);
//       Alert.alert("Error", error.message || "Failed to display locations");
//       setShuttleLocation(null);
//       setShuttleName("");
//     }
//   };

//   const calculateRouteAndETA = async () => {
//     if (!student || !shuttleLocation) {
//       Alert.alert("Error", "Shuttle location not available.");
//       return;
//     }

//     const pickupLat = student.point_latitude;
//     const pickupLng = student.point_longitude;
    
//     if (!pickupLat || !pickupLng || isNaN(pickupLat) || isNaN(pickupLng)) {
//       Alert.alert("Error", "Pickup point coordinates are invalid.");
//       return;
//     }

//     try {
//       const origin = `${shuttleLocation.latitude},${shuttleLocation.longitude}`;
//       const destination = `${pickupLat},${pickupLng}`;
//       const apiKey = Config.GOOGLE_MAPS_API_KEY;
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status !== "OK") {
//         throw new Error(data.error_message || "Failed to calculate route");
//       }

//       // Extract route coordinates from overview_polyline
//       const points = decodePolyline(data.routes[0]?.overview_polyline?.points) || [];
//       setRouteCoordinates(points);

//       // Extract ETA
//       const duration = data.routes[0]?.legs[0]?.duration?.text || "Unknown";
//       setEta(`ETA: ${duration}`);

//       // Fit map to show route
//       if (points.length > 0) {
//         const pickupPoint = { latitude: pickupLat, longitude: pickupLng };
//         const coordinatesToFit = [shuttleLocation, ...points, pickupPoint];
        
//         mapRef.current?.fitToCoordinates(coordinatesToFit, {
//           edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//           animated: true,
//         });
//       }
//     } catch (error: any) {
//       console.error("Route calculation error:", error);
//       setEta("Error calculating route");
//       Alert.alert("Route Error", error.message || "Failed to calculate route and ETA");
//     }
//   };

//   // Helper function to decode polyline points
//   const decodePolyline = (encoded: string) => {
//     if (!encoded) return [];
    
//     const poly = [];
//     let index = 0, len = encoded.length;
//     let lat = 0, lng = 0;

//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lng += dlng;

//       poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return poly;
//   };

//   const fetchStudent = async () => {
//     if (!studentCode.trim()) {
//       Alert.alert("Error", "Please enter a student code.");
//       return;
//     }

//     try {
//       setIsSearching(true);
//       setEta("");
//       setShowRoute(false);
//       setRouteCoordinates([]);
      
//       const response = await fetch(`${Config.API_BASE_URL}/api/students/${studentCode}/`);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Student not found");
//       }

//       const studentData = await response.json();
//       console.log("Student data:", studentData);
      
//       // Check if shuttle_details exists and has coordinates
//       if (!studentData.shuttle_details || 
//           !studentData.shuttle_details.current_latitude || 
//           !studentData.shuttle_details.current_longitude) {
//         throw new Error("Shuttle location data not available");
//       }

//       const fetchedStudent: Student = {
//         id: studentData.id,
//         name: studentData.student_name,
//         school: studentData.school_name,
//         onboarded: studentData.onboarded,
//         student_code: studentData.student_code,
//         offboarded_at: studentData.offboarded_at,
//         shuttle: {
//           reg_number: studentData.shuttle_details.reg_number,
//           current_latitude: parseFloat(studentData.shuttle_details.current_latitude),
//           current_longitude: parseFloat(studentData.shuttle_details.current_longitude),
//           driver_code: studentData.shuttle_details.driver_code,
//         },
//         point_latitude: studentData.point_latitude,
//         point_longitude: studentData.point_longitude,
//       };

//       setStudent(fetchedStudent);

//     } catch (error: any) {
//       console.error("Fetch error:", error);
//       Alert.alert("Error", error.message || "Failed to fetch student details");
//       setStudent(null);
//       setShuttleLocation(null);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const resetInputs = () => {
//     setStudentCode("");
//     setStudent(null);
//     setShuttleLocation(null);
//     setRouteCoordinates([]);
//     setEta("");
//     setShuttleName("");
//     setDestination("");
//     setShowRoute(false);
//     mapRef.current?.animateToRegion(defaultLocation);
//   };

//   const handleShowRoute = async () => {
//     setShowRoute(true);
//     await calculateRouteAndETA();
//   };

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
//         {student?.point_latitude && student?.point_longitude && !isNaN(student.point_latitude) && (
//           <Marker
//             coordinate={{
//               latitude: student.point_latitude,
//               longitude: student.point_longitude,
//             }}
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
// };

// export default RouteTrackerScreen;









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

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
        showsUserLocation={permissionGranted}
      >
        {shuttleLocation && (
          <Marker coordinate={shuttleLocation} title={shuttleName} pinColor="blue">
            <Callout>
              <View>
                <Text style={styles.calloutTitle}>{shuttleName}</Text>
                <Text>Driver: {student?.shuttle.driver_code || "Unknown"}</Text>
                <Text>Student: {student?.name || "Unknown"}</Text>
                <Text>Status: {student?.onboarded ? "Onboarded" : "Offboarded"}</Text>
              </View>
            </Callout>
          </Marker>
        )}
        {showRoute && pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Point"
            pinColor="green"
          />
        )}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#007AFF"
          />
        )}
      </MapView>

      {/* Search Input */}
      {!student ? (
        <View style={styles.inputContainer}>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Enter Student Code"
              value={studentCode}
              onChangeText={setStudentCode}
              placeholderTextColor="#ffffff"
              autoCapitalize="characters"
            />
            {studentCode ? (
              <TouchableOpacity style={styles.clearButton} onPress={() => setStudentCode("")}>
                <Text style={styles.clearButtonText}>X</Text>
              </TouchableOpacity>
            ) : null}
          </LinearGradient>
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