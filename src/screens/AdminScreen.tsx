import React, { useState, useEffect, useCallback } from "react";
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
  ScrollView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Config from "react-native-config";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';
import styles from "./styles/AdminScreenStyles"; // Adjust the path if you placed the file in a different 


// --- Constants ---
const CLASS_CHOICES = [
  { label: "Primary One", value: "primary_one" },
  { label: "Primary Two", value: "primary_two" },
  { label: "Primary Three", value: "primary_three" },
  { label: "Primary Four", value: "primary_four" },
  { label: "Primary Five", value: "primary_five" },
  { label: "Primary Six", value: "primary_six" },
  { label: "Primary Seven", value: "primary_seven" },
];
const CLASS_CHOICES_MAP = Object.fromEntries(CLASS_CHOICES.map((c) => [c.value, c.label]));
const PICKER_CLASS_CHOICES = [{ label: "Select Class...", value: "" }, ...CLASS_CHOICES];
const CLASS_LEVELS = CLASS_CHOICES.map((c) => c.value);

// --- Types ---
type School = {
  id: string;
  school_name: string;
  school_address?: string;
  latitude?: number;
  longitude?: number;
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
  user?: User;
  parent_name: string;
  parent_phone: string;
  parent_address: string;
  created_at?: string;
  modified_at?: string;
};

type Shuttle = {
  reg_number: string;
  id: string;
  school?: School | null;
  school_id?: string | null;
  capacity: number;
  is_active: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
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
  parent?: string | null;
  shuttle_details?: Shuttle | null;
  shuttle?: string | null;
  onboarded: boolean;
  offboarded_at: string | null;
};

type ShuttleTrackingState = {
  selectedSchoolId: string | null;
  selectedShuttleRegNumber: string | null;
  shuttleLocation: { latitude: number; longitude: number } | null;
  studentsOnShuttle: Student[];
  loadingShuttleDetails: boolean;
};

// --- Component ---
const AdminScreen = () => {
  // --- State ---
  const [viewMode, setViewMode] = useState<"initial" | "school-manage" | "shuttleTracking">("initial");
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<"school" | "edit_school" | "student">("school");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [expandedClassLevel, setExpandedClassLevel] = useState<string | null>(null);
  const [selectedSchoolIdForModal, setSelectedSchoolIdForModal] = useState<string | null>(null);
  const [selectedClassLevelForModal, setSelectedClassLevelForModal] = useState<string | null>(null);
  const [shuttleTrackingState, setShuttleTrackingState] = useState<ShuttleTrackingState>({
    selectedSchoolId: null,
    selectedShuttleRegNumber: null,
    shuttleLocation: null,
    studentsOnShuttle: [],
    loadingShuttleDetails: false,
  });
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
    parent_id: "",
    shuttle_id: "",
    onboarded: false,
  });

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = { Accept: "application/json", "Content-Type": "application/json" };
      const baseUrl = Config.API_BASE_URL;

      const [schoolsRes, studentsRes, parentsRes, shuttlesRes] = await Promise.all([
        fetch(`${baseUrl}/api/schools/`, { headers }),
        fetch(`${baseUrl}/api/students/`, { headers }),
        fetch(`${baseUrl}/api/parents/`, { headers }),
        fetch(`${baseUrl}/api/shuttles/`, { headers }),
      ]);

      if (!schoolsRes.ok) {
        const errorText = await schoolsRes.text();
        throw new Error(`Schools: ${schoolsRes.status} ${errorText}`);
      }
      const schoolsData: School[] = await schoolsRes.json();
      if (!Array.isArray(schoolsData)) throw new Error("Invalid format for school data.");
      setSchools(schoolsData);

      if (!studentsRes.ok) {
        const errorText = await studentsRes.text();
        throw new Error(`Students: ${studentsRes.status} ${errorText}`);
      }
      const studentsData: Student[] = await studentsRes.json();
      if (!Array.isArray(studentsData)) throw new Error("Invalid format for student data.");
      setStudents(studentsData);

      if (!parentsRes.ok) {
        const errorText = await parentsRes.text();
        throw new Error(`Parents: ${parentsRes.status} ${errorText}`);
      }
      const parentsData: Parent[] = await parentsRes.json();
      if (!Array.isArray(parentsData)) throw new Error("Invalid format for parent data.");
      setParents(parentsData);

      if (!shuttlesRes.ok) {
        const errorText = await shuttlesRes.text();
        throw new Error(`Shuttles: ${shuttlesRes.status} ${errorText}`);
      }
      let shuttlesData: Shuttle[] = await shuttlesRes.json();
      if (!Array.isArray(shuttlesData)) throw new Error("Invalid format for shuttle data.");
      shuttlesData = shuttlesData.map((shuttle: any) => {
        let schoolId: string | undefined = shuttle.school_id;
        let schoolInfo: School | undefined;

        if (shuttle.school) {
          if (typeof shuttle.school === "string") {
            schoolId = shuttle.school;
            schoolInfo = schoolsData.find((s) => s.id === schoolId);
          } else if (typeof shuttle.school === "object" && shuttle.school.id) {
            schoolId = shuttle.school.id;
            schoolInfo = shuttle.school;
          }
        }
        if (!schoolInfo && schoolId) {
          schoolInfo = schoolsData.find((s) => s.id === schoolId);
        }
        if (!schoolId && schoolInfo?.id) {
          schoolId = schoolInfo.id;
        }

        const shuttleId = shuttle.id || shuttle.reg_number;

        return {
          ...shuttle,
          id: shuttleId,
          school: schoolInfo || null,
          school_id: schoolId || null,
        };
      });
      setShuttles(shuttlesData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [Config.API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD Operations ---
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
      const response = await fetch(`${Config.API_BASE_URL}/api/schools/`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`Failed to add school: ${errorData.detail || JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      setSchools([...schools, data]);
      setModalVisible(false);
      setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
      Alert.alert("Success", "School added successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add school");
    }
  };

  const handleUpdateSchool = async () => {
    if (!schoolForm.school_name.trim()) {
      Alert.alert("Error", "School name is required");
      return;
    }
    if (!schoolForm.id) {
      Alert.alert("Error", "School ID missing");
      return;
    }
    try {
      const body: any = {
        school_name: schoolForm.school_name,
        school_address: schoolForm.school_address || null,
      };
      if (schoolForm.latitude.trim()) body.latitude = parseFloat(schoolForm.latitude);
      if (schoolForm.longitude.trim()) body.longitude = parseFloat(schoolForm.longitude);
      const response = await fetch(`${Config.API_BASE_URL}/api/schools/${schoolForm.id}/`, {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`Failed to update school: ${errorData.detail || JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      setSchools(schools.map((s) => (s.id === data.id ? data : s)));
      setModalVisible(false);
      setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
      Alert.alert("Success", "School updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update school");
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    Alert.alert("Confirm Delete", "Delete this school and associated data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${Config.API_BASE_URL}/api/schools/${schoolId}/`, {
              method: "DELETE",
              headers: { Accept: "application/json" },
            });
            if (!response.ok && response.status !== 204) {
              const errorText = await response.text();
              throw new Error(`Failed to delete school: ${errorText}`);
            }
            await fetchData();
            Alert.alert("Success", "School deleted");
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete school");
          }
        },
      },
    ]);
  };

  const resetStudentForm = () => {
    setStudentForm({ student_name: "", student_code: "", parent_id: "", shuttle_id: "", onboarded: false });
  };

  const handleAddStudent = async () => {
    if (!selectedSchoolIdForModal || !selectedClassLevelForModal) {
      Alert.alert("Error", "School/Class context missing.");
      return;
    }
    if (!studentForm.student_name.trim()) {
      Alert.alert("Error", "Student name required");
      return;
    }
    if (!studentForm.student_code.trim()) {
      Alert.alert("Error", "Student code required");
      return;
    }
    if (studentForm.onboarded && !studentForm.shuttle_id) {
      Alert.alert("Error", "Select shuttle if onboarded.");
      return;
    }

    try {
      const body: any = {
        student_name: studentForm.student_name.trim(),
        student_code: studentForm.student_code.trim().toUpperCase(),
        school: selectedSchoolIdForModal,
        class_level: selectedClassLevelForModal,
        onboarded: studentForm.onboarded,
        parent: studentForm.parent_id || null,
        shuttle: studentForm.onboarded ? studentForm.shuttle_id || null : null,
      };
      const response = await fetch(`${Config.API_BASE_URL}/api/students/`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) errorDetail = errorData.detail;
          else if (errorData.student_code) errorDetail = `Student Code: ${errorData.student_code.join(", ")}`;
          else errorDetail = JSON.stringify(errorData);
        } catch {
          errorDetail = await response.text();
        }
        throw new Error(`Failed to add student: ${errorDetail}`);
      }
      await fetchData();
      setModalVisible(false);
      resetStudentForm();
      setSelectedSchoolIdForModal(null);
      setSelectedClassLevelForModal(null);
      Alert.alert("Success", "Student added successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add student.");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    Alert.alert("Confirm Delete", "Delete this student?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${Config.API_BASE_URL}/api/students/${studentId}/`, {
              method: "DELETE",
            });
            if (!response.ok && response.status !== 204) {
              throw new Error(`HTTP ${response.status}`);
            }
            await fetchData();
            Alert.alert("Success", "Student deleted successfully.");
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete student.");
          }
        },
      },
    ]);
  };

  // --- Shuttle Tracking Logic ---
  const fetchShuttleDetails = async (regNumber: string) => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const result = await request(permission);
    if (result !== 'granted') {
      Alert.alert("Error", "Location permission denied");
      return;
    }
    setShuttleTrackingState((prev) => ({
      ...prev,
      loadingShuttleDetails: true,
      shuttleLocation: null,
      studentsOnShuttle: [],
    }));
    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/shuttle-tracking/`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ reg_number: regNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to get shuttle details" }));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const studentsOnThisShuttle = students.filter((s) => s.shuttle === regNumber && s.onboarded);

      setShuttleTrackingState((prev) => ({
        ...prev,
        shuttleLocation: data.current_location
          ? {
              latitude: Number(data.current_location.latitude),
              longitude: Number(data.current_location.longitude),
            }
          : null,
        studentsOnShuttle: studentsOnThisShuttle,
        loadingShuttleDetails: false,
      }));
    } catch (err: any) {
      Alert.alert("Error", `Failed to load shuttle details: ${err.message}`);
      setShuttleTrackingState((prev) => ({ ...prev, loadingShuttleDetails: false }));
    }
  };

  // --- UI Helpers ---
  const toggleSchool = (schoolId: string) => {
    const isOpening = expandedSchoolId !== schoolId;
    setExpandedSchoolId(isOpening ? schoolId : null);
    if (isOpening || expandedSchoolId === schoolId) {
      setExpandedClassLevel(null);
    }
  };

  const toggleClass = (classLevel: string) => {
    setExpandedClassLevel((prev) => (prev === classLevel ? null : classLevel));
  };

  const getStudentsForClass = (schoolId: string, classLevel: string): Student[] => {
    if (!Array.isArray(students)) return [];
    return students.filter((student) => student.school_id === schoolId && student.class_level === classLevel);
  };

  const getShuttlesForSchool = (schoolId: string | null): Shuttle[] => {
    if (!schoolId || !Array.isArray(shuttles)) return [];
    return shuttles.filter((shuttle) => shuttle.school_id === schoolId);
  };

  const getShuttlesForSelectedSchoolInModal = (): Shuttle[] => {
    return getShuttlesForSchool(selectedSchoolIdForModal);
  };

  // --- Render Logic ---
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
      {viewMode === "initial" && (
        <View style={styles.initialView}>
          <Text style={styles.dashboardTitle}>Admin Dashboard</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, styles.menuButton]}
            onPress={() => setViewMode("school-manage")}
          >
            <Icon name="class" size={20} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>School Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.menuButton]}
            onPress={() => setViewMode("shuttleTracking")}
          >
            <Icon name="directions-bus" size={20} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Shuttle Tracking</Text>
          </TouchableOpacity>
        </View>
      )}

      {viewMode === "school-manage" && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setViewMode("initial")} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>School Management</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setCurrentStep("school");
                setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
                setModalVisible(true);
              }}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add School</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={schools}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.noData}>No schools found.</Text>}
            renderItem={({ item: school }) => {
              const studentCount = students.filter((s) => s.school_id === school.id).length;
              const isSchoolExpanded = expandedSchoolId === school.id;

              return (
                <View style={styles.card}>
                  <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSchool(school.id)}>
                    <View style={styles.schoolHeaderInfo}>
                      <Text style={styles.schoolName}>{school.school_name}</Text>
                      <Text style={styles.schoolMeta}>Students: {studentCount}</Text>
                    </View>
                    <Icon
                      name={isSchoolExpanded ? "expand-less" : "expand-more"}
                      size={24}
                      color="#007AFF"
                    />
                  </TouchableOpacity>

                  {isSchoolExpanded && (
                    <View style={styles.cardContent}>
                      <Text style={styles.detailTextLabel}>Address:</Text>
                      <Text style={styles.detailTextValue}>{school.school_address || "Not provided"}</Text>
                      {school.latitude && school.longitude && (
                        <>
                          <Text style={styles.detailTextLabel}>Coordinates:</Text>
                          <Text style={styles.detailTextValue}>
                            ({school.latitude}, {school.longitude})
                          </Text>
                        </>
                      )}
                      <View style={styles.separatorThin} />

                      <Text style={styles.sectionTitle}>Classes</Text>
                      {CLASS_LEVELS.map((classLevel) => {
                        const studentsInClass = getStudentsForClass(school.id, classLevel);
                        const isClassExpanded = expandedSchoolId === school.id && expandedClassLevel === classLevel;
                        return (
                          <View key={classLevel} style={styles.classGroup}>
                            <TouchableOpacity
                              style={styles.classHeader}
                              onPress={() => toggleClass(classLevel)}
                            >
                              <Text style={styles.className}>
                                {CLASS_CHOICES_MAP[classLevel] || classLevel} ({studentsInClass.length})
                              </Text>
                              <Icon
                                name={isClassExpanded ? "expand-less" : "expand-more"}
                                size={20}
                                color="#6f42c1"
                              />
                            </TouchableOpacity>

                            {isClassExpanded && (
                              <View style={styles.classContent}>
                                {studentsInClass.length === 0 ? (
                                  <View style={styles.emptyClassContainer}>
                                    <Text style={[styles.noData, { textAlign: "left" }]}>
                                      No students currently in this class.
                                    </Text>
                                  </View>
                                ) : (
                                  studentsInClass.map((student) => (
                                    <View key={student.id} style={styles.studentItem}>
                                      <View style={styles.studentItemHeader}>
                                        <Icon
                                          name="person"
                                          size={18}
                                          color="#17a2b8"
                                          style={{ marginRight: 8 }}
                                        />
                                        <Text
                                          style={styles.studentNameText}
                                          numberOfLines={1}
                                          ellipsizeMode="tail"
                                        >
                                          {student.student_name} ({student.student_code})
                                        </Text>
                                        <View style={styles.actionIcons}>
                                          <TouchableOpacity onPress={() => handleDeleteStudent(student.id)}>
                                            <Icon name="delete" size={18} color="#dc3545" />
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                      <View style={styles.studentItemDetails}>
                                        <Text style={styles.detailItem}>
                                          <Text style={styles.detailLabel}>Onboarded:</Text>{" "}
                                          {student.onboarded ? "Yes" : "No"}
                                        </Text>
                                        {student.parent_details && (
                                          <Text style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Parent:</Text>{" "}
                                            {student.parent_details.parent_name} (
                                            {student.parent_details.parent_phone})
                                          </Text>
                                        )}
                                        {student.shuttle_details && (
                                          <Text style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Shuttle:</Text>{" "}
                                            {student.shuttle_details.reg_number} (
                                            {student.shuttle_details.is_active ? "Active" : "Inactive"})
                                          </Text>
                                        )}
                                        {student.offboarded_at && (
                                          <Text style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Offboarded:</Text>{" "}
                                            {new Date(student.offboarded_at).toLocaleDateString()}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                  ))
                                )}
                                <TouchableOpacity
                                  style={styles.inlineAddButton}
                                  onPress={() => {
                                    setCurrentStep("student");
                                    resetStudentForm();
                                    setSelectedSchoolIdForModal(school.id);
                                    setSelectedClassLevelForModal(classLevel);
                                    setModalVisible(true);
                                  }}
                                >
                                  <Icon name="person-add" size={16} color="#6f42c1" />
                                  <Text style={[styles.inlineAddButtonText, { color: "#6f42c1" }]}>
                                    Add Student to {CLASS_CHOICES_MAP[classLevel] || classLevel}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        );
                      })}
                      <View style={styles.separator} />

                      <View style={styles.schoolActionButtons}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
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
              );
            }}
          />
        </>
      )}

      {viewMode === "shuttleTracking" && (
        <View style={styles.shuttleTrackingContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setViewMode("initial")} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Shuttle Tracking</Text>
            <View style={{ width: 50 }} />
          </View>

          {!shuttleTrackingState.selectedSchoolId && (
            <FlatList
              data={schools}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={<Text style={styles.listHeader}>Select a School</Text>}
              renderItem={({ item: school }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() =>
                    setShuttleTrackingState((prev) => ({
                      ...prev,
                      selectedSchoolId: school.id,
                      selectedShuttleRegNumber: null,
                    }))
                  }
                >
                  <Text style={styles.listItemText}>{school.school_name}</Text>
                  <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separatorThin} />}
              ListEmptyComponent={<Text style={styles.noData}>No schools found.</Text>}
            />
          )}

          {shuttleTrackingState.selectedSchoolId && !shuttleTrackingState.selectedShuttleRegNumber && (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  setShuttleTrackingState((prev) => ({ ...prev, selectedSchoolId: null }))
                }
              >
                <Text style={{ color: "#007AFF", fontSize: 16 }}>Back to Schools</Text>
              </TouchableOpacity>
              <FlatList
                data={getShuttlesForSchool(shuttleTrackingState.selectedSchoolId)}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<Text style={styles.listHeader}>Select a Shuttle</Text>}
                renderItem={({ item: shuttle }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      setShuttleTrackingState((prev) => ({
                        ...prev,
                        selectedShuttleRegNumber: shuttle.reg_number,
                      }));
                      fetchShuttleDetails(shuttle.reg_number);
                    }}
                  >
                    <Text style={styles.listItemText}>
                      {shuttle.reg_number} ({shuttle.is_active ? "Active" : "Inactive"})
                    </Text>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separatorThin} />}
                ListEmptyComponent={<Text style={styles.noData}>No shuttles found for this school.</Text>}
              />
            </>
          )}

          {shuttleTrackingState.selectedSchoolId && shuttleTrackingState.selectedShuttleRegNumber && (
            <ScrollView>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  setShuttleTrackingState((prev) => ({
                    ...prev,
                    selectedShuttleRegNumber: null,
                    shuttleLocation: null,
                    studentsOnShuttle: [],
                  }))
                }
              >
                <Text style={{ color: "#007AFF", fontSize: 16 }}>Back to Shuttles</Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Shuttle: {shuttleTrackingState.selectedShuttleRegNumber}</Text>

              {shuttleTrackingState.loadingShuttleDetails && <ActivityIndicator size="large" />}

              <View style={styles.mapPlaceholder}>
                {shuttleTrackingState.shuttleLocation ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: shuttleTrackingState.shuttleLocation.latitude,
                      longitude: shuttleTrackingState.shuttleLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker coordinate={shuttleTrackingState.shuttleLocation}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold' }}>
                          Shuttle {shuttleTrackingState.selectedShuttleRegNumber}
                        </Text>
                        <Text>Current Location</Text>
                      </View>
                    </Marker>
                  </MapView>
                ) : (
                  <Text>Location data unavailable.</Text>
                )}
              </View>

              <Text style={styles.sectionTitle}>Students Onboard</Text>
              {shuttleTrackingState.studentsOnShuttle.length > 0 ? (
                shuttleTrackingState.studentsOnShuttle.map((student) => (
                  <View key={student.id} style={styles.studentItemSimple}>
                    <Icon name="person" size={16} color="#17a2b8" style={{ marginRight: 8 }} />
                    <Text>
                      {student.student_name} ({student.student_code})
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>No students currently onboard this shuttle.</Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetStudentForm();
          setSelectedClassLevelForModal(null);
          setSelectedSchoolIdForModal(null);
          setCurrentStep("school");
        }}
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
                  resetStudentForm();
                  setSelectedClassLevelForModal(null);
                  setSelectedSchoolIdForModal(null);
                  setCurrentStep("school");
                }}
              >
                <Icon name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                {(currentStep === "school" || currentStep === "edit_school") && (
                  <>
                    <Text style={styles.inputLabel}>School Name*</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter school name"
                      value={schoolForm.school_name}
                      onChangeText={(t) => setSchoolForm((f) => ({ ...f, school_name: t }))}
                    />
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter address (optional)"
                      value={schoolForm.school_address}
                      onChangeText={(t) => setSchoolForm((f) => ({ ...f, school_address: t }))}
                    />
                    <Text style={styles.inputLabel}>Latitude</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Latitude (optional)"
                      value={schoolForm.latitude}
                      onChangeText={(t) =>
                        setSchoolForm((f) => ({ ...f, latitude: t.replace(/[^0-9.-]/g, "") }))
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.inputLabel}>Longitude</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Longitude (optional)"
                      value={schoolForm.longitude}
                      onChangeText={(t) =>
                        setSchoolForm((f) => ({ ...f, longitude: t.replace(/[^0-9.-]/g, "") }))
                      }
                      keyboardType="numeric"
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

                {currentStep === "student" && (
                  <>
                    <Text style={styles.contextLabel}>School:</Text>
                    <Text style={styles.contextValue}>
                      {schools.find((s) => s.id === selectedSchoolIdForModal)?.school_name || "N/A"}
                    </Text>
                    <Text style={styles.contextLabel}>Class:</Text>
                    <Text style={styles.contextValue}>
                      {CLASS_CHOICES_MAP[selectedClassLevelForModal || ""] || "N/A"}
                    </Text>
                    <View style={styles.separatorThinModal} />

                    <Text style={styles.inputLabel}>Student Name*</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter full name"
                      value={studentForm.student_name}
                      onChangeText={(t) => setStudentForm((f) => ({ ...f, student_name: t }))}
                    />
                    <Text style={styles.inputLabel}>Student Code*</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter unique student code"
                      value={studentForm.student_code}
                      onChangeText={(t) =>
                        setStudentForm((f) => ({ ...f, student_code: t.toUpperCase() }))
                      }
                      autoCapitalize="characters"
                    />

                    <Text style={styles.inputLabel}>Parent</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={studentForm.parent_id}
                        onValueChange={(itemValue) =>
                          setStudentForm((f) => ({ ...f, parent_id: itemValue as string }))
                        }
                        style={styles.pickerStyle}
                        prompt="Select Parent"
                      >
                        <Picker.Item label="- Select Parent -" value="" />
                        {parents.map((parent) => (
                          <Picker.Item
                            key={parent.id}
                            label={`${parent.parent_name} (${parent.parent_phone})`}
                            value={parent.id}
                          />
                        ))}
                      </Picker>
                    </View>

                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>Onboarded:</Text>
                      <TouchableOpacity
                        style={[
                          styles.switch,
                          { backgroundColor: studentForm.onboarded ? "#28a745" : "#dc3545" },
                        ]}
                        onPress={() =>
                          setStudentForm((f) => ({
                            ...f,
                            onboarded: !f.onboarded,
                            shuttle_id: !f.onboarded ? f.shuttle_id : "",
                          }))
                        }
                      >
                        <Text style={styles.switchText}>{studentForm.onboarded ? "Yes" : "No"}</Text>
                      </TouchableOpacity>
                    </View>

                    {studentForm.onboarded && (
                      <>
                        <Text style={styles.inputLabel}>Shuttle* (if Onboarded):</Text>
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={studentForm.shuttle_id}
                            onValueChange={(itemValue) =>
                              setStudentForm((f) => ({ ...f, shuttle_id: itemValue as string }))
                            }
                            style={styles.pickerStyle}
                            enabled={getShuttlesForSelectedSchoolInModal().length > 0}
                            prompt="Select Shuttle"
                          >
                            <Picker.Item
                              label={
                                getShuttlesForSelectedSchoolInModal().length > 0
                                  ? "- Select Shuttle -"
                                  : "- No Shuttles for this School -"
                              }
                              value=""
                            />
                            {getShuttlesForSelectedSchoolInModal().map((shuttle) => (
                              <Picker.Item
                                key={shuttle.id}
                                label={`${shuttle.reg_number} (${shuttle.is_active ? "Active" : "Inactive"})`}
                                value={shuttle.id}
                              />
                            ))}
                          </Picker>
                        </View>
                      </>
                    )}

                    <TouchableOpacity
                      style={[styles.button, styles.primaryButton, { marginTop: 10 }]}
                      onPress={handleAddStudent}
                    >
                      <Icon name="save" size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Save Student</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetStudentForm();
                    setSelectedClassLevelForModal(null);
                    setSelectedSchoolIdForModal(null);
                    setCurrentStep("school");
                  }}
                >
                  <Icon name="cancel" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};


export default AdminScreen;