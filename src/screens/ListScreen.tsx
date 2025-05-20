import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Config from "react-native-config";
import styles from "./styles/ListScreenStyles";
import Icon from "react-native-vector-icons/MaterialIcons";



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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ListScreenRouteProp>();
  const { driverCode, shuttle } = route.params || { driverCode: "", shuttle: null };
  const [students, setStudents] = useState<Student[]>([]);
  const [leftStudents, setLeftStudents] = useState<Student[]>([]);
  const [newStudentCode, setNewStudentCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Log students state on change
  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    console.log("Current students state:", students);
  }, [students]);

  const addStudent = async () => {
    if (!newStudentCode.trim()) {
      Alert.alert("Error", "Please enter a student code.");
      return;
    }
    if (!shuttle) {
      Alert.alert("Error", "No shuttle assigned to this driver.");
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

      // Create a ShuttleAssignment
      const assignmentData = {
        student: updatedStudentData.id,
        shuttle: shuttle.reg_number,
      };
      console.log("Creating shuttle assignment:", assignmentData);
      const assignmentResponse = await fetch(`${Config.API_BASE_URL}/api/shuttle-assignments/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      if (!assignmentResponse.ok) {
        const errorText = await assignmentResponse.text();
        console.error("Assignment creation error:", assignmentResponse.status, errorText);
        throw new Error(`Failed to create shuttle assignment. Status: ${assignmentResponse.status}`);
      }

      const assignmentResult = await assignmentResponse.json();
      console.log("Created shuttle assignment:", assignmentResult);

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
      setNewStudentCode("");
      Alert.alert("Success", `Student ${newStudent.name} onboarded successfully.`);
    } catch (error: any) {
      console.error("Error onboarding student:", error.message);
      Alert.alert("Error", error.message || "Failed to onboard student. Check the code or network.");
    }
  };

  const removeStudent = async (id: string, name: string) => {
    console.log(`Attempting to offboard student ID: ${id}, Name: ${name}`);
    const studentToRemove = students.find((student) => student.id === id);
    if (!studentToRemove) {
      console.error(`Student with ID ${id} not found in students state`);
      Alert.alert("Error", "Student not found in the list.");
      return;
    }

    try {
      console.log(`Fetching shuttle assignments for student ID: ${id}`);
      const assignmentsResponse = await fetch(`${Config.API_BASE_URL}/api/shuttle-assignments/?student=${id}`, {
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
      console.log("Fetched assignments:", assignmentsData);
      const activeAssignment = assignmentsData.find(
        (assignment: any) => assignment.student === id && !assignment.offboarded_at
      );

      if (!activeAssignment) {
        console.error(`No active assignment found for student ID: ${id}`);
        throw new Error("No active shuttle assignment found for this student.");
      }
      console.log("Active assignment found:", activeAssignment);

      const offboardTime = new Date().toISOString();
      console.log(`Offboarding student ID: ${id} at ${offboardTime}`);
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

      // Update Student
      console.log(`Updating student ${studentToRemove.student_code} to offboarded`);
      const updateStudentResponse = await fetch(`${Config.API_BASE_URL}/api/students/${studentToRemove.student_code}/`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboarded: false,
          offboarded_at: offboardTime,
        }),
      });

      if (!updateStudentResponse.ok) {
        const errorText = await updateStudentResponse.text();
        console.error("Offboard student error:", updateStudentResponse.status, errorText);
        throw new Error(`Failed to offboard student. Status: ${updateStudentResponse.status}`);
      }

      const updatedAssignment = await updateResponse.json();
      console.log("Updated assignment:", updatedAssignment);

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


    const goToTraffic = () => {
    navigation.navigate("TrafficScreen");
  };

  const goToWeather = () => {
    navigation.navigate("WeatherScreen");
  };

  const goToCrash = () => {
    navigation.navigate("CrashScreen");
  };

  return (
    <View style={styles.container}>
            <View style={styles.customHeaderOverlay}>
              <Icon
                name="list"  // Or "navigate" or "map"
                size={24}
                color="#2563EB"
                style={styles.headerIcon}
              />
              <Text style={styles.customHeaderText}>RouteWise - List</Text>
            </View>
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
            placeholder="Enter student code"
            value={newStudentCode}
            onChangeText={setNewStudentCode}
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.addButton} onPress={addStudent}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
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
            extraData={students}
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
              extraData={leftStudents}
            />
          </View>
        )}
      </View>
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={goToWeather}>
          <Icon name="cloud" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
          <Icon name="traffic" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Traffic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={goToCrash}>
          <Icon name="warning" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Crash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListScreen;