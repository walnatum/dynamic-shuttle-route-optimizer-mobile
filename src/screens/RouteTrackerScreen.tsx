// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Button,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   TextInput,
//   ScrollView,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";

// const RouteTrackerScreen = () => {
//   const navigation = useNavigation();
//   const mapRef = useRef(null);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [schoolNameId, setSchoolNameId] = useState("");
//   const [studentCode, setStudentCode] = useState("");
//   const [routeCoordinates, setRouteCoordinates] = useState([]);

//   // Default location (Kampala, Uganda - can be adjusted based on school location)
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

//   // Placeholder for search functionality (to be implemented based on API)
//   const handleSearch = () => {
//     if (!schoolNameId || !studentCode) {
//       Alert.alert("Error", "Please enter both School Name/Id and Student Code.");
//       return;
//     }
//     // Add logic to fetch route or data based on schoolNameId and studentCode
//     Alert.alert("Search", `Searching for ${schoolNameId} with code ${studentCode}`);
//     // Example: Fetch route data from an API and set routeCoordinates
//   };

//   // Reset inputs and map
//   const resetInputs = () => {
//     setSchoolNameId("");
//     setStudentCode("");
//     setRouteCoordinates([]);
//     mapRef.current.animateToRegion(defaultLocation);
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
//         {routeCoordinates.length > 0 && (
//           <Polyline coordinates={routeCoordinates} strokeColor="#0000FF" strokeWidth={4} />
//         )}
//       </MapView>

//       {/* Input Section (Top of Screen) */}
//       <View style={styles.inputContainer}>
//         <LinearGradient
//           colors={["#4facfe", "#00f2fe"]}
//           style={styles.inputWrapper}
//         >
//           <TextInput
//             style={styles.beautifiedInput}
//             placeholder="School Name/Id"
//             value={schoolNameId}
//             onChangeText={setSchoolNameId}
//             placeholderTextColor="#ffffff"
//           />
//           <TouchableOpacity
//             style={styles.clearButton}
//             onPress={() => setSchoolNameId("")}
//           >
//             <Text style={styles.clearButtonText}>X</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//         <LinearGradient
//           colors={["#4facfe", "#00f2fe"]}
//           style={styles.inputWrapper}
//         >
//           <TextInput
//             style={styles.beautifiedInput}
//             placeholder="Student Code"
//             value={studentCode}
//             onChangeText={setStudentCode}
//             placeholderTextColor="#ffffff"
//           />
//           <TouchableOpacity
//             style={styles.clearButton}
//             onPress={() => setStudentCode("")}
//           >
//             <Text style={styles.clearButtonText}>X</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Text style={styles.searchButtonText}>Search</Text>
//         </TouchableOpacity>
//       </View>

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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   inputContainer: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     right: 10,
//     padding: 10,
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 25,
//     marginBottom: 10,
//     overflow: "hidden",
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   beautifiedInput: {
//     flex: 1,
//     height: 50,
//     paddingHorizontal: 20,
//     fontSize: 16,
//     color: "#ffffff",
//     backgroundColor: "rgba(0, 0, 0, 0.1)",
//     borderRadius: 25,
//   },
//   clearButton: {
//     padding: 10,
//   },
//   clearButtonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   searchButton: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//     marginTop: 10,
//   },
//   searchButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   floatingButtons: {
//     position: "absolute",
//     bottom: 20,
//     left: 20,
//     right: 20,
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   floatingButton: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     elevation: 5,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   bottomNavContainer: {
//     position: "absolute",
//     bottom: 80, // Above floating buttons
//     left: 10,
//     right: 10,
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     padding: 10,
//     borderRadius: 10,
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   bottomNavTitle: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 5,
//   },
//   bottomNavButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     width: "100%",
//   },
//   navButton: {
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//   },
//   navButtonText: {
//     fontSize: 14,
//     color: "#007AFF",
//   },
// });

// export default RouteTrackerScreen;


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
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";
import Config from "react-native-config";

interface Student {
  id: string;
  name: string;
  school: string;
  onboarded: boolean;
  student_code: string;
  latitude?: number;
  longitude?: number;
}

const RouteTrackerScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [schoolNameId, setSchoolNameId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Default location (Kampala, Uganda - can be adjusted based on school location)
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
      console.log("Fetched student:", studentData);

      const fetchedStudent: Student = {
        id: studentData.id,
        name: studentData.student_name,
        school: studentData.school_name,
        onboarded: studentData.onboarded,
        student_code: studentData.student_code,
        latitude: studentData.latitude,
        longitude: studentData.longitude,
      };

      setStudent(fetchedStudent);

      // If we have location data, center the map on the student
      if (fetchedStudent.latitude && fetchedStudent.longitude) {
        const studentLocation = {
          latitude: fetchedStudent.latitude,
          longitude: fetchedStudent.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        mapRef.current.animateToRegion(studentLocation);
        setRouteCoordinates([studentLocation]);
      }

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
    setRouteCoordinates([]);
    setStudent(null);
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
          <>
            <Polyline coordinates={routeCoordinates} strokeColor="#0000FF" strokeWidth={4} />
            <Marker
              coordinate={routeCoordinates[0]}
              title={student?.name || "Student"}
              description={student?.school || "School"}
            >
              <Callout>
                <View>
                  <Text style={styles.calloutTitle}>{student?.name}</Text>
                  <Text>{student?.school}</Text>
                  <Text>Code: {student?.student_code}</Text>
                </View>
              </Callout>
            </Marker>
          </>
        )}
      </MapView>

      {/* Show either search inputs or student info */}
      {!student ? (
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.beautifiedInput}
              placeholder="School Name/Id"
              value={schoolNameId}
              onChangeText={setSchoolNameId}
              placeholderTextColor="#ffffff"
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSchoolNameId("")}
            >
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Student Code"
              value={studentCode}
              onChangeText={setStudentCode}
              placeholderTextColor="#ffffff"
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setStudentCode("")}
            >
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          </LinearGradient>
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? "Searching..." : "Search"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
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
});

export default RouteTrackerScreen;