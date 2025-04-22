import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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
import styles from "./styles/ListScreenStyles"; 

type RootStackParamList = {
  ListScreen: { driverCode: string; shuttle: { reg_number: string } | null };
};

type ListScreenRouteProp = RouteProp<RootStackParamList, 'ListScreen'>;

interface Student {
  id: string;
  name: string;
  school: string;
  onboarded: boolean;
  student_code: string;
  offboarded_at?: string | null;
}

const ListScreen = () => {
  const route = useRoute<ListScreenRouteProp>();
  const { driverCode, shuttle } = route.params || { driverCode: "", shuttle: null };
  const [students, setStudents] = useState<Student[]>([]);
  const [leftStudents, setLeftStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newStudentCode, setNewStudentCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

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

  const addStudent = async () => {
    if (!newStudentName.trim()) {
      Alert.alert("Error", "Please enter a student name.");
      return;
    }
    if (!shuttle) {
      Alert.alert("Error", "No shuttle assigned to this driver.");
      return;
    }

    try {
      const studentData: any = {
        driver_code: driverCode,
        student_name: newStudentName,
        shuttle: shuttle.reg_number,
      };
      if (newStudentCode.trim()) {
        studentData.student_code = newStudentCode;
      }

      const response = await fetch(`${Config.API_BASE_URL}/api/students/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add student");
      }

      const newStudent: Student = {
        id: data.id,
        name: data.student_name,
        school: data.school_name,
        onboarded: data.onboarded,
        student_code: data.student_code,
        offboarded_at: data.offboarded_at,
      };

      if (students.some((existingStudent) => existingStudent.id === newStudent.id)) {
        Alert.alert("Error", "Student is already in the list.");
        return;
      }

      setStudents((prevStudents) => [...prevStudents, newStudent]);
      setNewStudentName("");
      setNewStudentCode("");
      Alert.alert("Success", "Student added successfully.");
    } catch (error: any) {
      console.error("Error adding student:", error.message);
      Alert.alert("Error", error.message || "Failed to add student. Check the code or network.");
    }
  };

  const removeStudent = async (id: string, name: string) => {
    const studentToRemove = students.find((student) => student.id === id);
    if (!studentToRemove) return;

    try {
      const assignmentsResponse = await fetch(`${Config.API_BASE_URL}/api/shuttle-assignments/`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!assignmentsResponse.ok) {
        const errorText = await assignmentsResponse.text();
        throw new Error(`Failed to fetch assignments: ${errorText}`);
      }

      const assignmentsData = await assignmentsResponse.json();
      const activeAssignment = assignmentsData.find(
        (assignment: any) => assignment.student.id === id && !assignment.offboarded_at
      );

      if (!activeAssignment) {
        throw new Error("No active shuttle assignment found for this student.");
      }

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
        throw new Error(`Failed to offboard student: ${errorText}`);
      }

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
      Alert.alert("Success", "Student offboarded successfully.");
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
        <Text style={styles.info}>Driver Code: {driverCode || "N/A"}</Text>
        <Text style={styles.info}>Shuttle: {shuttle?.reg_number || "N/A"}</Text>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Student Name"
            value={newStudentName}
            onChangeText={setNewStudentName}
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Student Code (optional)"
            value={newStudentCode}
            onChangeText={setNewStudentCode}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addStudent}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
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
        {leftStudents.length > 0 && (
          <View style={styles.studentList}>
            <Text style={styles.listTitle}>Off-boarded students</Text>
            <FlatList
              data={leftStudents}
              renderItem={({ item }) => (
                <View style={styles.studentItem}>
                  <Text style={styles.studentInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.statusText}>
                    Left at {item.offboarded_at ? new Date(item.offboarded_at).toLocaleTimeString() : "N/A"}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>
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


export default ListScreen;