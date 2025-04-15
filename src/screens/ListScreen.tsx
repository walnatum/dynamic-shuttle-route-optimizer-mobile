import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Config from "react-native-config";

interface Student {
  id: string;
  name: string;
  school: string;
  onboarded: boolean;
  student_code: string;
  offboarded_at?: string | null;
}

type RootStackParamList = {
  ListScreen: {
    assistantName?: string;
    code?: string;
  };
};

type ListScreenRouteProp = RouteProp<RootStackParamList, 'ListScreen'>;


const ListScreen = () => {
  //const navigation = useNavigation();
  const route = useRoute<ListScreenRouteProp>();
  const { assistantName, code } = route.params || {};
  const [students, setStudents] = useState<Student[]>([]);
  const [leftStudents, setLeftStudents] = useState<Student[]>([]);
  const [newStudentCode, setNewStudentCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Location permission request
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
          setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          setPermissionGranted(true);
        }
      } catch (err) {
        setErrorMsg("Error requesting location permission");
      }
    };
    requestLocationPermission();
  }, []);

  // On-board student onto the shuttle
  const addStudent = async () => {
    if (!newStudentCode.trim()) {
      Alert.alert("Error", "Please enter a student code.");
      return;
    }

    try {
      console.log(`Fetching student with code: ${newStudentCode}`);
      const fetchResponse = await fetch(`${Config.API_BASE_URL}/api/students/${newStudentCode}/`, {
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

      // Update onboarded status on the backend
      const updateResponse = await fetch(`${Config.API_BASE_URL}/api/students/${newStudentCode}/`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onboarded: true }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Update error:", updateResponse.status, errorText);
        throw new Error(`Failed to update student. Status: ${updateResponse.status}`);
      }

      const updatedStudentData = await updateResponse.json();
      console.log("Updated student:", updatedStudentData);

      const newStudent: Student = {
        id: updatedStudentData.id,
        name: updatedStudentData.student_name,
        school: updatedStudentData.school_name,
        onboarded: updatedStudentData.onboarded,
        student_code: updatedStudentData.student_code,
        offboarded_at: updatedStudentData.offboarded_at,
      };

      // Check if student already exists
      if (students.some((existingStudent) => existingStudent.id === newStudent.id)) {
        Alert.alert("Error", "Student is already in the list.");
        return;
      }

      setStudents((prevStudents) => [...prevStudents, newStudent]);
      setNewStudentCode(""); // Reset input
    } catch (error: any) {
      console.error("Error fetching student:", error.message);
      Alert.alert("Error", error.message || "Failed to fetch student. Check the code or network.");
    }
  };

  // Off-board student from the shuttle
const removeStudent = async (id: string, name: string) => {
  const studentToRemove = students.find((student) => student.id === id);
  if (!studentToRemove) return;

  try {
    // Fetch the active ShuttleAssignment for this student
    const assignmentsResponse = await fetch(`${Config.API_BASE_URL}/api/shuttle-assignments/`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!assignmentsResponse.ok) {
      const errorText = await assignmentsResponse.text();
      console.error("Assignments fetch error:", assignmentsResponse.status, errorText);
      throw new Error(`Failed to fetch assignments. Status: ${assignmentsResponse.status}`);
    }

    const assignmentsData = await assignmentsResponse.json();
    const activeAssignment = assignmentsData.find(
      (assignment: any) => assignment.student.id === id && !assignment.offboarded_at
    );

    if (!activeAssignment) {
      throw new Error("No active shuttle assignment found for this student.");
    }

    // Update the ShuttleAssignment to set offboarded_at
    const offboardTime = new Date().toISOString();
    const updateResponse = await fetch(`${Config.API_BASE_URL}/api/shuttle-assignments/${activeAssignment.id}/`, {
      method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offboarded_at: offboardTime,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Offboard error:", updateResponse.status, errorText);
      throw new Error(`Failed to offboard student. Status: ${updateResponse.status}`);
    }

    const updatedAssignmentData = await updateResponse.json();
    console.log("Offboarded assignment:", updatedAssignmentData);

    // Update local state
    const updatedStudents = students.filter((student) => student.id !== id);
    setStudents(updatedStudents);

    setLeftStudents((prevLeftStudents) => [
      ...prevLeftStudents,
      {
        id,
        name,
        school: studentToRemove.school,
        onboarded: false,
        student_code: studentToRemove.student_code,
        offboarded_at: offboardTime,
      },
    ]);
  } catch (error: any) {
    console.error("Error offboarding student:", error.message);
    Alert.alert("Error", error.message || "Failed to offboard student.");
  }
};

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.info}>Assistant Name: {assistantName || "N/A"}</Text>
        <Text style={styles.info}>Code: {code || "N/A"}</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter student code"
            value={newStudentCode}
            onChangeText={setNewStudentCode}
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.addButton} onPress={addStudent}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Students List */}
        <View style={styles.studentList}>
          <Text style={styles.listTitle}>On-boarded students</Text>
          <FlatList
            data={students}
            renderItem={({ item }) => (
              <View style={styles.studentItem}>
                <Text style={styles.studentInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                <Text style={styles.studentName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => removeStudent(item.id, item.name)}
                >
                  <Text style={styles.leaveButtonText}>OffBoard</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Left Students List */}
        {leftStudents.length > 0 && (
          <View style={styles.studentList}>
            <Text style={styles.listTitle}>Off-boarded students</Text>
            <FlatList
              data={leftStudents}
              renderItem={({ item }) => (
                <View style={styles.studentItem}>
                  <Text style={styles.studentInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.statusText}>Left at {item.offboarded_at ? new Date(item.offboarded_at).toLocaleTimeString() : "N/A"}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" // Light gray background for a cleaner look
  },
  map: { 
    flex: 1 
  },
  infoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Slightly more opaque
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  info: { 
    fontSize: 16, 
    color: "#333", 
    marginBottom: 5, 
    fontWeight: "600" // Bolder text
  },
  inputContainer: {
    position: "absolute",
    top: 80, // Adjusted for better spacing below info
    left: 10,
    right: 10,
    padding: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  input: { 
    flex: 1, 
    height: 45, 
    fontSize: 16, 
    color: "#333" 
  },
  addButton: {
    backgroundColor: "#28a745", // Green for "Add"
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold" 
  },
  studentList: { 
    backgroundColor: "#fff", // White for contrast
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 10, 
    color: "#2c3e50" // Darker blue-gray
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  studentInitial: {
    width: 40,
    height: 40,
    backgroundColor: "#3498db", // Bright blue for initials
    borderRadius: 20,
    textAlign: "center",
    lineHeight: 40, // Center vertically
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 15,
  },
  studentName: { 
    flex: 1, 
    fontSize: 16, 
    color: "#333",
    fontWeight: "500"
  },
  onboardStatus: { 
    fontSize: 14, 
    color: "#6b4e91", 
    marginRight: 10 
  }, // Still here but not used for onboarded list
  leaveButton: {
    backgroundColor: "#dc3545", // Red for "OffBoard"
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  leaveButtonText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold" 
  },
  statusText: { 
    fontSize: 14, 
    color: "#dc3545", // Red for "Left"
    marginLeft: 10,
    fontWeight: "500"
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
    backgroundColor: "#007bff", // Slightly brighter blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: { 
    color: "white", 
    fontWeight: "bold",
    fontSize: 14 
  },
});

export default ListScreen;