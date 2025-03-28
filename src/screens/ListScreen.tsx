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
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

interface Student {
  id: string;
  name: string;
  school: string;
  onboarded: boolean;
}

const ListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assistantNameId, code } = route.params || {};
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

  // Add new student
  const addStudent = async () => {
    if (!newStudentCode.trim()) {
      Alert.alert("Error", "Please enter a student code.");
      return;
    }

    try {
      console.log(`Fetching student with code: ${newStudentCode}`);
      const fetchResponse = await fetch(`http://192.168.216.163:8000/api/students/${newStudentCode}/`, {
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
      const updateResponse = await fetch(`http://192.168.216.163:8000/api/students/${newStudentCode}/`, {
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

  // Remove student function
  const removeStudent = (id: string, name: string) => {
    const studentToRemove = students.find((student) => student.id === id);
    if (!studentToRemove) return;

    const updatedStudents = students.filter((student) => student.id !== id);
    setStudents(updatedStudents);

    setLeftStudents((prevLeftStudents) => [
      ...prevLeftStudents,
      { id, name, school: studentToRemove.school, onboarded: false },
    ]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.info}>Assistant Name/Id: {assistantNameId || "N/A"}</Text>
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
          <Text style={styles.listTitle}>Student Names</Text>
          <FlatList
            data={students}
            renderItem={({ item }) => (
              <View style={styles.studentItem}>
                <Text style={styles.studentInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.onboardStatus}>
                  {item.onboarded ? "Onboard" : "Not Onboard"}
                </Text>
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
            <Text style={styles.listTitle}>Left/Off Board</Text>
            <FlatList
              data={leftStudents}
              renderItem={({ item }) => (
                <View style={styles.studentItem}>
                  <Text style={styles.studentInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.statusText}>Left</Text>
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
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  info: { fontSize: 16, color: "#333", marginBottom: 5, textAlign: "center" },
  inputContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    padding: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: { flex: 1, height: 40, fontSize: 16, color: "#333" },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  studentList: { backgroundColor: "#f0e8f5", borderRadius: 8, padding: 10, marginBottom: 10 },
  listTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#333" },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  studentInitial: {
    width: 20,
    height: 20,
    backgroundColor: "#d8b5e5",
    borderRadius: 10,
    textAlign: "center",
    color: "#fff",
    marginRight: 10,
  },
  studentName: { flex: 1, fontSize: 16, color: "#333" },
  onboardStatus: { fontSize: 14, color: "#6b4e91", marginRight: 10 },
  leaveButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  leaveButtonText: { color: "#fff", fontSize: 14 },
  statusText: { fontSize: 16, color: "#ff4444", marginLeft: 10 },
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
  buttonText: { color: "white", fontWeight: "bold" },
});

export default ListScreen;