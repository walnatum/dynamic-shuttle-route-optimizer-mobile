import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Config from "react-native-config";

// Types matching Django models/serializers
type School = {
  id: string; // UUID
  school_name: string;
  school_address?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  modified_at?: string;
};

// *** MODIFIED Shuttle Type ***
// Reflecting that 'school' will be a nested object from the serializer
type Shuttle = {
  reg_number: string;
  school: School; // Changed from string to School object
  capacity: number;
  is_active: boolean;
  current_latitude?: number;
  current_longitude?: number;
  created_at?: string;
  modified_at?: string;
  driver_code?: string | null;
};

const AdminScreen = () => {
  console.log("AdminScreen rendered"); // Debug: Confirm component mounts

  // Data states
  const [schools, setSchools] = useState<School[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<"school" | "shuttle" | "edit_school" | "edit_shuttle">("school");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null); // For shuttle creation

  // Form states
  const [schoolForm, setSchoolForm] = useState({
    id: "",
    school_name: "",
    school_address: "",
    latitude: "",
    longitude: "",
  });
  const [shuttleForm, setShuttleForm] = useState({
    reg_number: "",
    capacity: 5,
    is_active: true,
  });

  // Fetch schools and shuttles
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // Fetch schools
      console.log("Fetching schools from:", `${Config.API_BASE_URL}/api/schools/`); // Debug
      const schoolsRes = await fetch(`${Config.API_BASE_URL}/api/schools/`, { headers });
      if (!schoolsRes.ok) {
        const errorText = await schoolsRes.text();
        throw new Error(`Failed to fetch schools: ${schoolsRes.status} ${errorText}`);
      }
      const schoolsData = await schoolsRes.json();
      console.log("Schools fetched:", schoolsData); // Debug
      setSchools(schoolsData);

      // Fetch shuttles
      console.log("Fetching shuttles from:", `${Config.API_BASE_URL}/api/shuttles/`); // Debug
      const shuttlesRes = await fetch(`${Config.API_BASE_URL}/api/shuttles/`, { headers });
      if (!shuttlesRes.ok) {
        const errorText = await shuttlesRes.text();
        throw new Error(`Failed to fetch shuttles: ${shuttlesRes.status} ${errorText}`);
      }
      const shuttlesData = await shuttlesRes.json();
      // *** Important: Ensure shuttlesData is an array ***
      if (!Array.isArray(shuttlesData)) {
        console.error("Shuttle data is not an array:", shuttlesData);
        throw new Error("Received invalid format for shuttle data.");
      }
      console.log("Shuttles fetched:", shuttlesData); // Debug
      setShuttles(shuttlesData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching data on mount"); // Debug
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

      console.log("Adding school with body:", body); // Debug
      const response = await fetch(`${Config.API_BASE_URL}/api/schools/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error("Add school failed:", response.status, errorData);
        throw new Error(`Failed to add school: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("School added:", data); // Debug
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

      console.log(`Updating school ${schoolForm.id} with body:`, body); // Debug
      const response = await fetch(`${Config.API_BASE_URL}/api/schools/${schoolForm.id}/`, {
        method: "PUT", // Use PUT or PATCH as appropriate for your backend
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error("Update school failed:", response.status, errorData);
        throw new Error(`Failed to update school: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("School updated:", data); // Debug
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
      `Are you sure you want to delete this school and all its associated shuttles?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting school:", schoolId); // Debug
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

              console.log("School deleted:", schoolId); // Debug
              // Refresh data to ensure consistency
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

  const handleAddShuttle = async () => {
    if (!selectedSchoolId) {
      Alert.alert("Error", "No school selected for the shuttle");
      return;
    }
    if (!shuttleForm.reg_number.trim()) {
      Alert.alert("Error", "Registration number is required");
      return;
    }
    if (shuttleForm.capacity <= 0) {
      Alert.alert("Error", "Capacity must be a positive number");
      return;
    }

    try {
      // *** MODIFIED: Send school ID string, not the object ***
      const body = {
        reg_number: shuttleForm.reg_number,
        school: selectedSchoolId, // Send the ID
        capacity: shuttleForm.capacity,
        is_active: shuttleForm.is_active,
      };
      console.log("Adding shuttle with body:", body); // Debug
      const response = await fetch(`${Config.API_BASE_URL}/api/shuttles/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error("Add shuttle failed:", response.status, errorData);
        throw new Error(`Failed to add shuttle: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("Shuttle added:", data); // Debug
      // *** Refresh data instead of just appending ***
      // This ensures the nested school object is fetched correctly
      await fetchData();
      // setShuttles([...shuttles, data]); // Replace with fetchData
      setModalVisible(false);
      setShuttleForm({ reg_number: "", capacity: 5, is_active: true });
      setSelectedSchoolId(null);
      Alert.alert("Success", "Shuttle added successfully");
    } catch (err: any) {
      console.error("Add shuttle error:", err);
      Alert.alert("Error", err.message || "Failed to add shuttle");
    }
  };

  const handleUpdateShuttle = async () => {
    if (!selectedSchoolId) {
      Alert.alert("Error", "School context lost for shuttle update."); // More specific error
      return;
    }
    if (!shuttleForm.reg_number.trim()) {
      Alert.alert("Error", "Registration number is required");
      return;
    }
    if (shuttleForm.capacity <= 0) {
      Alert.alert("Error", "Capacity must be a positive number");
      return;
    }

    try {
      // *** MODIFIED: Send school ID string ***
      const body = {
        reg_number: shuttleForm.reg_number,
        school: selectedSchoolId, // Send the ID
        capacity: shuttleForm.capacity,
        is_active: shuttleForm.is_active,
      };
      console.log(`Updating shuttle ${shuttleForm.reg_number} with body:`, body); // Debug
      const response = await fetch(`${Config.API_BASE_URL}/api/shuttles/${shuttleForm.reg_number}/`, {
        method: "PUT", // Or PATCH
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error("Update shuttle failed:", response.status, errorData);
        throw new Error(`Failed to update shuttle: ${errorData.detail || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("Shuttle updated:", data); // Debug
      // *** Refresh data instead of just mapping ***
      await fetchData();
      // setShuttles(shuttles.map((s) => (s.reg_number === data.reg_number ? data : s))); // Replace with fetchData
      setModalVisible(false);
      setShuttleForm({ reg_number: "", capacity: 5, is_active: true });
      setSelectedSchoolId(null);
      Alert.alert("Success", "Shuttle updated successfully");
    } catch (err: any) {
      console.error("Update shuttle error:", err);
      Alert.alert("Error", err.message || "Failed to update shuttle");
    }
  };

  const handleDeleteShuttle = async (regNumber: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete shuttle ${regNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting shuttle:", regNumber); // Debug
              const response = await fetch(`${Config.API_BASE_URL}/api/shuttles/${regNumber}/`, {
                method: "DELETE",
                headers: {
                  Accept: "application/json",
                },
              });

              if (!response.ok && response.status !== 204) {
                const errorText = await response.text();
                console.error("Delete shuttle failed:", response.status, errorText);
                throw new Error(`Failed to delete shuttle: ${errorText}`);
              }

              console.log("Shuttle deleted:", regNumber); // Debug
              // *** Refresh data ***
              await fetchData();
              // setShuttles(shuttles.filter((s) => s.reg_number !== regNumber)); // Replace with fetchData
              Alert.alert("Success", "Shuttle deleted successfully");
            } catch (err: any) {
              console.error("Delete shuttle error:", err);
              Alert.alert("Error", err.message || "Failed to delete shuttle");
            }
          }
        }
      ]
    );
  };

  // UI Helpers
  const toggleSchool = (schoolId: string) => {
    console.log("Toggling school:", schoolId); // Debug
    setExpandedSchoolId(expandedSchoolId === schoolId ? null : schoolId);
  };

  // *** MODIFIED getShuttlesForSchool Function ***
  const getShuttlesForSchool = (schoolId: string): Shuttle[] => {
    if (!Array.isArray(shuttles)) {
      console.error("getShuttlesForSchool called when shuttles is not an array:", shuttles);
      return []; // Return empty array if shuttles state is invalid
    }
    const filtered = shuttles.filter((shuttle) => {
      // Check if shuttle.school and shuttle.school.id exist before comparing
      return shuttle.school?.id === schoolId;
    });
    console.log(`Shuttles for school ${schoolId}:`, filtered); // Debug
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
            console.log("Opening add school modal"); // Debug
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

                {/* Shuttles Section */}
                <Text style={styles.sectionTitle}>Shuttles</Text>
                {getShuttlesForSchool(school.id).length === 0 ? (
                  <Text style={styles.noData}>No shuttles registered for this school.</Text>
                ) : (
                  getShuttlesForSchool(school.id).map((shuttle) => (
                    <View key={shuttle.reg_number} style={styles.itemRow}>
                      <Icon name="directions-bus" size={18} color="#4CAF50" style={{ marginRight: 10 }} />
                      <View style={styles.shuttleInfo}>
                        <Text style={styles.itemTextPrimary}>
                          {shuttle.reg_number}
                        </Text>
                        <Text style={styles.itemTextSecondary}>
                          Capacity: {shuttle.capacity} | Status: {shuttle.is_active ? "Active" : "Inactive"}
                        </Text>
                        {shuttle.driver_code && (
                          <Text style={styles.itemTextSecondary}>Driver Code: {shuttle.driver_code}</Text>
                        )}
                      </View>
                      <View style={styles.actionIcons}>
                        <TouchableOpacity
                          onPress={() => {
                            console.log("Editing shuttle:", shuttle.reg_number); // Debug
                            setCurrentStep("edit_shuttle");
                            setShuttleForm({
                              reg_number: shuttle.reg_number,
                              capacity: shuttle.capacity,
                              is_active: shuttle.is_active,
                            });
                            // Make sure school.id is passed correctly
                            setSelectedSchoolId(shuttle.school?.id); // Use the ID from the shuttle data
                            setModalVisible(true);
                          }}
                        >
                          <Icon name="edit" size={20} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteShuttle(shuttle.reg_number)} // Simplified call
                        >
                          <Icon name="delete" size={20} color="#dc3545" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}

                {/* Action Buttons for the School */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      console.log("Opening add shuttle modal for school:", school.id); // Debug
                      setCurrentStep("shuttle");
                      setShuttleForm({ reg_number: "", capacity: 5, is_active: true });
                      setSelectedSchoolId(school.id); // Set the ID of the current school
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="add" size={16} color="white" style={{ marginRight: 5 }} />
                    <Text style={styles.buttonText}>Add Shuttle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      console.log("Opening edit school modal:", school.id); // Debug
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
                    onPress={() => handleDeleteSchool(school.id)} // Simplified call
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
        transparent={true} // Make modal background semi-transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}> {/* Added overlay */}
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentStep === "school" && "Add New School"}
                {currentStep === "edit_school" && "Edit School"}
                {currentStep === "shuttle" && "Add New Shuttle"}
                {currentStep === "edit_shuttle" && "Edit Shuttle"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {/* School Form */}
              {(currentStep === "school" || currentStep === "edit_school") && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d" // Added placeholder text color
                    placeholder="Enter school name (e.g., Sunshine Academy)"
                    value={schoolForm.school_name}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, school_name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d" // Added placeholder text color
                    placeholder="Enter address (e.g., 123 Kampala Rd)"
                    value={schoolForm.school_address}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, school_address: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d" // Added placeholder text color
                    placeholder="Latitude (e.g., 0.3476, optional)"
                    keyboardType="numeric"
                    value={schoolForm.latitude}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, latitude: text.replace(/[^0-9.-]/g, '') })} // Basic numeric input cleaning
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d" // Added placeholder text color
                    placeholder="Longitude (e.g., 32.5825, optional)"
                    keyboardType="numeric"
                    value={schoolForm.longitude}
                    onChangeText={(text) => setSchoolForm({ ...schoolForm, longitude: text.replace(/[^0-9.-]/g, '') })} // Basic numeric input cleaning
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

              {/* Shuttle Form */}
              {(currentStep === "shuttle" || currentStep === "edit_shuttle") && (
                <>
                  <Text style={styles.inputLabel}>
                    School: {schools.find((s) => s.id === selectedSchoolId)?.school_name || "N/A"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d" // Added placeholder text color
                    placeholder="Enter reg. number (e.g., UAB123X)"
                    value={shuttleForm.reg_number}
                    onChangeText={(text) => setShuttleForm({ ...shuttleForm, reg_number: text.toUpperCase() })} // Example: Auto-uppercase
                    editable={currentStep === "shuttle"} // Only editable when adding
                    autoCapitalize="characters"
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#6c757d" // Added placeholder text color
                    placeholder="Capacity (e.g., 5)"
                    keyboardType="numeric"
                    value={shuttleForm.capacity.toString()}
                    onChangeText={(text) =>
                      setShuttleForm({ ...shuttleForm, capacity: parseInt(text.replace(/[^0-9]/g, '')) || 5 }) // Clean input
                    }
                  />
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Active Status:</Text>
                    <TouchableOpacity
                      style={[
                        styles.switch,
                        { backgroundColor: shuttleForm.is_active ? "#28a745" : "#dc3545" },
                      ]}
                      onPress={() => setShuttleForm({ ...shuttleForm, is_active: !shuttleForm.is_active })}
                    >
                      <Text style={styles.switchText}>{shuttleForm.is_active ? "Active" : "Inactive"}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={currentStep === "shuttle" ? handleAddShuttle : handleUpdateShuttle}
                  >
                    <Text style={styles.buttonText}>
                      {currentStep === "shuttle" ? "Save Shuttle" : "Update Shuttle"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Cancel button moved outside conditional blocks */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  console.log("Closing modal"); // Debug
                  setModalVisible(false);
                  setSchoolForm({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
                  setShuttleForm({ reg_number: "", capacity: 5, is_active: true });
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
    borderBottomColor: '#0056b3', // Slightly darker shade for depth
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
    elevation: 2, // Add subtle shadow
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
    marginBottom: 12, // Increased spacing
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, // Slightly reduced opacity
    shadowRadius: 3, // Slightly increased radius
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  schoolName: {
    fontSize: 17, // Slightly larger
    fontWeight: "600",
    color: "#343a40", // Darker grey
  },
  cardContent: {
    padding: 15,
  },
  schoolAddress: {
    color: "#495057", // Slightly darker grey
    marginBottom: 5, // Reduced margin
    fontSize: 14,
  },
  schoolCoords: {
    color: "#6c757d",
    marginBottom: 15, // Increased margin before shuttles section
    fontSize: 13,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 15, // Slightly larger
    fontWeight: "bold", // Bolder
    color: "#007AFF", // Use theme color
    marginTop: 10,
    marginBottom: 10, // Increased margin
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  itemTextPrimary: { // Style for main shuttle info like Reg Number
    color: '#343a40',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemTextSecondary: { // Style for secondary info like capacity, status
    color: '#6c757d',
    fontSize: 13,
  },
  shuttleInfo: {
    flex: 1,
    // marginLeft: 10, // Removed margin, handled by Icon marginRight
  },
  actionIcons: {
    flexDirection: "row",
    gap: 18, // Increased gap
  },
  noData: {
    color: "#6c757d",
    fontStyle: "italic",
    marginVertical: 10, // Increased margin
    textAlign: 'center',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around", // Better distribution
    marginTop: 20, // Increased margin
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row', // To align icon and text
    alignItems: 'center',
    justifyContent: 'center',
    // flex: 1, // Removed flex: 1 for potentially different button sizes
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15, // Adjusted padding
    borderRadius: 5,
    elevation: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14, // Standardized font size
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  modalOverlay: { // Added style for semi-transparent background
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
  },
  modalContainer: { // Adjusted modal container style
    width: '90%', // Set a width
    maxHeight: '85%', // Set a max height
    backgroundColor: "white",
    borderRadius: 10, // Rounded corners
    overflow: 'hidden', // Ensure content stays within bounds
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa', // Light header background
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18, // Adjusted size
    fontWeight: "600", // Adjusted weight
    color: "#343a40",
  },
  inputLabel: {
    fontSize: 15, // Adjusted size
    color: "#495057",
    marginBottom: 8, // Adjusted margin
    fontWeight: '500',
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between', // Align items nicely
    marginBottom: 20, // Increased margin
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 16,
    color: "#495057",
    fontWeight: '500',
  },
  switch: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15, // Make it more pill-like
    minWidth: 80, // Ensure minimum width
    alignItems: 'center',
  },
  switchText: {
    color: "white",
    fontWeight: "bold", // Bolder text
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14, // Slightly adjusted padding
    borderRadius: 5,
    marginBottom: 10,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#6c757d", // Grey cancel button
  },
});

export default AdminScreen;