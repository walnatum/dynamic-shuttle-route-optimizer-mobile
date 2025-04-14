import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Config from "react-native-config";
import { Picker } from "@react-native-picker/picker";

// Types matching Django models/serializers
type School = {
  id: string;
  school_name: string;
  school_address?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  modified_at?: string;
};

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type Parent = {
  id: string;
  user: User;
  parent_name: string;
  parent_phone: string;
  parent_address: string;
  created_at: string;
  modified_at: string;
};

type Shuttle = {
  reg_number: string;
  school: School;
  capacity: number;
  is_active: boolean;
  current_latitude?: number;
  current_longitude?: number;
  created_at?: string;
  modified_at?: string;
  driver_code?: string | null;
};

type Student = {
  id: string;
  student_name: string;
  student_code: string;
  school_name: string;
  school_id: string;
  class_level: string;
  parent_details: Parent | null;
  shuttle: Shuttle | null;
  onboarded: boolean;
  offboarded_at: string | null;
};

const AdminScreen = () => {
  console.log("AdminScreen rendered");

  // Data states
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<"school" | "edit_school" | "student">("school");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [expandedClassLevel, setExpandedClassLevel] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Form states
  const [schoolForm, setSchoolForm] = useState({
    id: "",
    school_name: "",
    school_address: "",
    latitude: "",
    longitude: "",
  });
  const [studentForm, setStudentForm] = useState({
    student_name: "",
    student_code: "",
    school_id: "",
    class_level: "",
    parent_id: "",
    shuttle_reg_number: "",
    onboarded: false,
  });

  // Hardcoded class levels
  const CLASS_LEVELS = [
    "primary_one",
    "primary_two",
    "primary_three",
    "primary_four",
    "primary_five",
    "primary_six",
    "primary_seven",
  ];

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // Fetch schools
      console.log("Fetching schools from:", `${Config.API_BASE_URL}/api/schools/`);
      const schoolsRes = await fetch(`${Config.API_BASE_URL}/api/schools/`, { headers });
      if (!schoolsRes.ok) {
        const errorText = await schoolsRes.text();
        throw new Error(`Failed to fetch schools: ${schoolsRes.status} ${errorText}`);
      }
      const schoolsData = await schoolsRes.json();
      console.log("Schools fetched:", schoolsData);
      setSchools(schoolsData);

      // Fetch students
      console.log("Fetching students from:", `${Config.API_BASE_URL}/api/students/`);
      const studentsRes = await fetch(`${Config.API_BASE_URL}/api/students/`, { headers });
      if (!studentsRes.ok) {
        const errorText = await studentsRes.text();
        throw new Error(`Failed to fetch students: ${studentsRes.status} ${errorText}`);
      }
      const studentsData = await studentsRes.json();
      if (!Array.isArray(studentsData)) {
        console.error("Student data is not an array:", studentsData);
        throw new Error("Received invalid format for student data.");
      }
      console.log("Students fetched:", studentsData);
      setStudents(studentsData);

      // Fetch parents
      console.log("Fetching parents from:", `${Config.API_BASE_URL}/api/parents/`);
      const parentsRes = await fetch(`${Config.API_BASE_URL}/api/parents/`, { headers });
      if (!parentsRes.ok) {
        const errorText = await parentsRes.text();
        throw new Error(`Failed to fetch parents: ${parentsRes.status} ${errorText}`);
      }
      const parentsData = await parentsRes.json();
      if (!Array.isArray(parentsData)) {
        console.error("Parent data is not an array:", parentsData);
        throw new Error("Received invalid format for parent data.");
      }
      console.log("Parents fetched:", parentsData);
      setParents(parentsData);

      // Fetch shuttles
      console.log("Fetching shuttles from:", `${Config.API_BASE_URL}/api/shuttles/`);
      const shuttlesRes = await fetch(`${Config.API_BASE_URL}/api/shuttles/`, { headers });
      if (!shuttlesRes.ok) {
        const errorText = await shuttlesRes.text();
        throw new Error(`Failed to fetch shuttles: ${shuttlesRes.status} ${errorText}`);
      }
      const shuttlesData = await shuttlesRes.json();
      if (!Array.isArray(shuttlesData)) {
        console.error("Shuttle data is not an array:", shuttlesData);
        throw new Error("Received invalid format for shuttle data.");
      }
      console.log("Shuttles fetched:", shuttlesData);
      setShuttles(shuttlesData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching data on mount");
    fetchData();
  }, []);

  // CRUD Operations
  const handleAddSchool = async () => {
    if (!schoolForm.school_name.trim()) {
      Alert.alert("Error", "School name is required");
      return;
    }

    try {
      const body: any = {
        school_name: schoolForm.school_name,
        school_address: schoolForm.school_address || null,
      };
      if (schoolForm.latitude.trim()) body.latitude = parseFloat(schoolForm.latitude);
      if (schoolForm.longitude.trim()) body.longitude = parseFloat(schoolForm.longitude);

      console.log("Adding school with body:", body);
      const response = await fetch(`${Config.API_BASE_URL}/api/schools/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
        console.error("Add school failed:", response.status, errorData);
        throw new Error(`Failed to add school: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("School added:", data);
      setSchools([...schools, data]);
      setModalVisible(false);
      setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
      Alert.alert("Success", "School added successfully");
    } catch (err: any) {
      console.error("Add school error:", err);
      Alert.alert("Error", err.message || "Failed to add school");
    }
  };

  const handleUpdateSchool = async () => {
    if (!schoolForm.school_name.trim()) {
      Alert.alert("Error", "School name is required");
      return;
    }
    if (!schoolForm.id) {
      Alert.alert("Error", "School ID is missing for update.");
      return;
    }

    try {
      const body: any = {
        school_name: schoolForm.school_name,
        school_address: schoolForm.school_address || null,
      };
      if (schoolForm.latitude.trim()) body.latitude = parseFloat(schoolForm.latitude);
      if (schoolForm.longitude.trim()) body.longitude = parseFloat(schoolForm.longitude);

      console.log(`Updating school ${schoolForm.id} with body:`, body);
      const response = await fetch(`${Config.API_BASE_URL}/api/schools/${schoolForm.id}/`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
        console.error("Update school failed:", response.status, errorData);
        throw new Error(`Failed to update school: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("School updated:", data);
      setSchools(schools.map((s) => (s.id === data.id ? data : s)));
      setModalVisible(false);
      setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
      Alert.alert("Success", "School updated successfully");
    } catch (err: any) {
      console.error("Update school error:", err);
      Alert.alert("Error", err.message || "Failed to update school");
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete this school and all its associated students?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting school:", schoolId);
              const response = await fetch(`${Config.API_BASE_URL}/api/schools/${schoolId}/`, {
                method: "DELETE",
                headers: {
                  Accept: "application/json",
                },
              });

              if (!response.ok && response.status !== 204) {
                const errorText = await response.text();
                console.error("Delete school failed:", response.status, errorText);
                throw new Error(`Failed to delete school: ${errorText}`);
              }

              console.log("School deleted:", schoolId);
              await fetchData();
              Alert.alert("Success", "School deleted successfully");
            } catch (err: any) {
              console.error("Delete school error:", err);
              Alert.alert("Error", err.message || "Failed to delete school");
            }
          },
        },
      ]
    );
  };

  const handleAddStudent = async () => {
    if (!studentForm.student_name.trim()) {
      Alert.alert("Error", "Student name is required");
      return;
    }
    if (!studentForm.student_code.trim()) {
      Alert.alert("Error", "Student code is required");
      return;
    }
    if (!studentForm.school_id) {
      Alert.alert("Error", "School is required");
      return;
    }
    if (!studentForm.class_level.trim()) {
      Alert.alert("Error", "Class level is required");
      return;
    }
    if (studentForm.onboarded && !studentForm.shuttle_reg_number) {
      Alert.alert("Error", "Shuttle is required when student is onboarded");
      return;
    }

    try {
      const body: any = {
        student_name: studentForm.student_name,
        student_code: studentForm.student_code,
        school: studentForm.school_id,
        class_level: studentForm.class_level,
        onboarded: studentForm.onboarded,
      };
      if (studentForm.parent_id) body.parent = studentForm.parent_id;
      if (studentForm.shuttle_reg_number) body.shuttle = studentForm.shuttle_reg_number;

      console.log("Adding student with body:", body);
      const response = await fetch(`${Config.API_BASE_URL}/api/students/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
        console.error("Add student failed:", response.status, errorData);
        throw new Error(`Failed to add student: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("Student added:", data);
      await fetchData();
      setModalVisible(false);
      setStudentForm({
        student_name: "",
        student_code: "",
        school_id: "",
        class_level: "",
        parent_id: "",
        shuttle_reg_number: "",
        onboarded: false,
      });
      setSelectedSchoolId(null);
      Alert.alert("Success", "Student added successfully");
    } catch (err: any) {
      console.error("Add student error:", err);
      Alert.alert("Error", err.message || "Failed to add student");
    }
  };

  // UI Helpers
  const toggleSchool = (schoolId: string) => {
    console.log("Toggling school:", schoolId);
    setExpandedSchoolId(expandedSchoolId === schoolId ? null : schoolId);
    setExpandedClassLevel(null);
  };

  const toggleClass = (classLevel: string) => {
    console.log("Toggling class:", classLevel);
    setExpandedClassLevel(expandedClassLevel === classLevel ? null : classLevel);
  };

  const getStudentsForClass = (schoolId: string, classLevel: string): Student[] => {
    const filtered = students.filter(
      (student) => student.school_id === schoolId && student.class_level === classLevel
    );
    console.log(`Students for school ${schoolId}, class ${classLevel}:`, filtered);
    return filtered;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>School Admin Dashboard</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            console.log("Opening add school modal");
            setCurrentStep("school");
            setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
            setModalVisible(true);
          }}
        >
          <Icon name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add School</Text>
        </TouchableOpacity>
      </View>

      {/* Schools List */}
      <FlatList
        data={schools}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.noData}>No schools found.</Text>}
        renderItem={({ item: school }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSchool(school.id)}>
              <Text style={styles.schoolName}>{school.school_name}</Text>
              <Icon
                name={expandedSchoolId === school.id ? "expand-less" : "expand-more"}
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>

            {expandedSchoolId === school.id && (
              <View style={styles.cardContent}>
                <Text style={styles.schoolAddress}>
                  Address: {school.school_address || "Not provided"}
                </Text>
                {school.latitude && school.longitude ? (
                  <Text style={styles.schoolCoords}>
                    Coordinates: ({school.latitude}, {school.longitude})
                  </Text>
                ) : null}

                {/* Classes Section */}
                <Text style={styles.sectionTitle}>Classes</Text>
                {CLASS_LEVELS.length === 0 ? (
                  <Text style={styles.noData}>No classes defined.</Text>
                ) : (
                  CLASS_LEVELS.map((classLevel) => (
                    <View key={classLevel} style={styles.classContainer}>
                      <TouchableOpacity
                        style={styles.classHeader}
                        onPress={() => toggleClass(classLevel)}
                      >
                        <Text style={styles.className}>
                          {classLevel.replace(/_/g, " ").toUpperCase()}
                        </Text>
                        <Icon
                          name={expandedClassLevel === classLevel ? "expand-less" : "expand-more"}
                          size={20}
                          color="#007AFF"
                        />
                      </TouchableOpacity>

                      {expandedClassLevel === classLevel && (
                        <View style={styles.classContent}>
                          {getStudentsForClass(school.id, classLevel).length === 0 ? (
                            <View>
                              <Text style={styles.noData}>No students in this class.</Text>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                  console.log("Opening add student modal for class:", classLevel);
                                  setCurrentStep("student");
                                  setStudentForm({
                                    student_name: "",
                                    student_code: "",
                                    school_id: school.id,
                                    class_level: classLevel,
                                    parent_id: "",
                                    shuttle_reg_number: "",
                                    onboarded: false,
                                  });
                                  setSelectedSchoolId(school.id);
                                  setModalVisible(true);
                                }}
                              >
                                <Icon name="add" size={16} color="white" style={{ marginRight: 5 }} />
                                <Text style={styles.buttonText}>Add Student</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            getStudentsForClass(school.id, classLevel).map((student) => (
                              <View key={student.student_code} style={styles.studentRow}>
                                <Icon name="person" size={18} color="#17a2b8" style={{ marginRight: 10 }} />
                                <View style={styles.studentInfo}>
                                  <Text style={styles.itemTextPrimary}>
                                    {student.student_name} ({student.student_code})
                                  </Text>
                                  <Text style={styles.itemTextSecondary}>
                                    Onboarded: {student.onboarded ? "Yes" : "No"}
                                  </Text>
                                  {student.parent_details && (
                                    <>
                                      <Text style={styles.itemTextSecondary}>
                                        Parent: {student.parent_details.parent_name}
                                      </Text>
                                      <Text style={styles.itemTextSecondary}>
                                        Phone: {student.parent_details.parent_phone}
                                      </Text>
                                      <Text style={styles.itemTextSecondary}>
                                        Address: {student.parent_details.parent_address}
                                      </Text>
                                    </>
                                  )}
                                  {student.shuttle && (
                                    <Text style={styles.itemTextSecondary}>
                                      Shuttle: {student.shuttle.reg_number} (
                                      {student.shuttle.is_active ? "Active" : "Inactive"})
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))
                          )}
                        </View>
                      )}
                    </View>
                  ))
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      console.log("Opening edit school modal:", school.id);
                      setCurrentStep("edit_school");
                      setSchoolForm({
                        id: school.id,
                        school_name: school.school_name,
                        school_address: school.school_address || "",
                        latitude: school.latitude ? school.latitude.toString() : "",
                        longitude: school.longitude ? school.longitude.toString() : "",
                      });
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="edit" size={16} color="white" style={{ marginRight: 5 }} />
                    <Text style={styles.buttonText}>Edit School</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#dc3545" }]}
                    onPress={() => handleDeleteSchool(school.id)}
                  >
                    <Icon name="delete" size={16} color="white" style={{ marginRight: 5 }} />
                    <Text style={styles.buttonText}>Delete School</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Modal for Add/Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentStep === "school" && "Add New School"}
                {currentStep === "edit_school" && "Edit School"}
                {currentStep === "student" && "Add New Student"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
                  setStudentForm({
                    student_name: "",
                    student_code: "",
                    school_id: "",
                    class_level: "",
                    parent_id: "",
                    shuttle_reg_number: "",
                    onboarded: false,
                  });
                  setSelectedSchoolId(null);
                }}
              >
                <Icon name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {/* School Form */}
              {(currentStep === "school" || currentStep === "edit_school") && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d"
                    placeholder="Enter school name (e.g., Sunshine Academy)"
                    value={schoolForm.school_name}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, school_name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d"
                    placeholder="Enter address (e.g., 123 Kampala Rd)"
                    value={schoolForm.school_address}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, school_address: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d"
                    placeholder="Latitude (e.g., 0.3476, optional)"
                    keyboardType="numeric"
                    value={schoolForm.latitude}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, latitude: text.replace(/[^0-9.-]/g, "") })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d"
                    placeholder="Longitude (e.g., 32.5825, optional)"
                    keyboardType="numeric"
                    value={schoolForm.longitude}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, longitude: text.replace(/[^0-9.-]/g, "") })}
                  />
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={currentStep === "school" ? handleAddSchool : handleUpdateSchool}
                  >
                    <Text style={styles.buttonText}>
                      {currentStep === "school" ? "Save School" : "Update School"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Student Form */}
              {currentStep === "student" && (
                <>
                  <Text style={styles.inputLabel}>
                    School: {schools.find((s) => s.id === studentForm.school_id)?.school_name || "N/A"}
                  </Text>
                  <Text style={styles.inputLabel}>
                    Class: {studentForm.class_level.replace(/_/g, " ").toUpperCase()}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d"
                    placeholder="Enter student name (e.g., Halley Quin)"
                    value={studentForm.student_name}
                    onChangeText={(text) => setStudentForm({ ...studentForm, student_name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d"
                    placeholder="Enter student code (e.g., S765)"
                    value={studentForm.student_code}
                    onChangeText={(text) => setStudentForm({ ...studentForm, student_code: text.toUpperCase() })}
                    autoCapitalize="characters"
                  />
                  <Text style={styles.inputLabel}>Parent (optional):</Text>
                  <Picker
                    selectedValue={studentForm.parent_id}
                    onValueChange={(itemValue) =>
                      setStudentForm({ ...studentForm, parent_id: itemValue })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a parent" value="" />
                    {parents.map((parent) => (
                      <Picker.Item
                        key={parent.id}
                        label={parent.parent_name}
                        value={parent.id}
                      />
                    ))}
                  </Picker>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Onboarded:</Text>
                    <TouchableOpacity
                      style={[styles.switch, { backgroundColor: studentForm.onboarded ? "#28a745" : "#dc3545" }]}
                      onPress={() =>
                        setStudentForm({
                          ...studentForm,
                          onboarded: !studentForm.onboarded,
                          shuttle_reg_number: !studentForm.onboarded ? studentForm.shuttle_reg_number : "",
                        })
                      }
                    >
                      <Text style={styles.switchText}>{studentForm.onboarded ? "Yes" : "No"}</Text>
                    </TouchableOpacity>
                  </View>
                  {studentForm.onboarded && (
                    <>
                      <Text style={styles.inputLabel}>Shuttle (required):</Text>
                      <Picker
                        selectedValue={studentForm.shuttle_reg_number}
                        onValueChange={(itemValue) =>
                          setStudentForm({ ...studentForm, shuttle_reg_number: itemValue })
                        }
                        style={styles.picker}
                      >
                        <Picker.Item label="Select a shuttle" value="" />
                        {shuttles
                          .filter((shuttle) => shuttle.school.id === studentForm.school_id)
                          .map((shuttle) => (
                            <Picker.Item
                              key={shuttle.reg_number}
                              label={`${shuttle.reg_number} (${shuttle.is_active ? "Active" : "Inactive"})`}
                              value={shuttle.reg_number}
                            />
                          ))}
                      </Picker>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleAddStudent}
                  >
                    <Text style={styles.buttonText}>Save Student</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  console.log("Closing modal");
                  setModalVisible(false);
                  setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
                  setStudentForm({
                    student_name: "",
                    student_code: "",
                    school_id: "",
                    class_level: "",
                    parent_id: "",
                    shuttle_reg_number: "",
                    onboarded: false,
                  });
                  setSelectedSchoolId(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#0056b3",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    elevation: 2,
  },
  addButtonText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "500",
  },
  listContent: {
    padding: 10,
  },
  card: {
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  schoolName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#343a40",
  },
  cardContent: {
    padding: 15,
  },
  schoolAddress: {
    color: "#495057",
    marginBottom: 5,
    fontSize: 14,
  },
  schoolCoords: {
    color: "#6c757d",
    marginBottom: 15,
    fontSize: 13,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    paddingBottom: 5,
  },
  classContainer: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#007AFF",
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  className: {
    fontSize: 15,
    fontWeight: "500",
    color: "#343a40",
  },
  classContent: {
    paddingLeft: 10,
    paddingTop: 5,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  studentInfo: {
    flex: 1,
  },
  itemTextPrimary: {
    color: "#343a40",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  itemTextSecondary: {
    color: "#6c757d",
    fontSize: 13,
  },
  noData: {
    color: "#6c757d",
    fontStyle: "italic",
    marginVertical: 10,
    textAlign: "center",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  error: {
    color: "#dc3545",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  retryText: {
    color: "white",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343a40",
  },
  inputLabel: {
    fontSize: 15,
    color: "#495057",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "white",
    fontSize: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "white",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "500",
  },
  switch: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 80,
    alignItems: "center",
  },
  switchText: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
});

export default AdminScreen;