import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Use your actual backend IP address here
const API_BASE = 'http://192.168.137.173:8000';

// Types matching your Django models
type School = {
  id: string;
  school_name: string;
  school_address?: string;
};

type Shuttle = {
  reg_number: string;
  school: string; // school ID
  capacity: number;
};

type Driver = {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  driver_code: string;
  school: string; // school ID
};

type Student = {
  id: string;
  student_name: string;
  class_level: string;
  school: string; // school ID
  parent?: {
    parent_name: string;
    parent_phone: string;
  };
};

const AdminScreen = () => {
  // Data states
  const [schools, setSchools] = useState<School[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<"school" | "shuttle" | "driver" | "student">("school");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);

  // Form states
  const [newSchool, setNewSchool] = useState({ school_name: "", school_address: "" });
  const [newShuttle, setNewShuttle] = useState({ reg_number: "", capacity: 20 });
  const [newDriver, setNewDriver] = useState({ 
    first_name: "", 
    last_name: "", 
    email: "", 
    driver_code: "" 
  });
  const [newStudent, setNewStudent] = useState({ 
    student_name: "", 
    class_level: "primary_one",
    parent_name: "",
    parent_phone: ""
  });

  // Fetch all data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all schools
      const schoolsRes = await fetch(`${API_BASE}/api/schools/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const schoolsData = await schoolsRes.json();
      setSchools(schoolsData);

      // Fetch all shuttles
      const shuttlesRes = await fetch(`${API_BASE}/api/shuttles/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const shuttlesData = await shuttlesRes.json();
      setShuttles(shuttlesData);

      // Fetch all drivers
      const driversRes = await fetch(`${API_BASE}/api/drivers/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const driversData = await driversRes.json();
      setDrivers(driversData);

      // Fetch all students
      const studentsRes = await fetch(`${API_BASE}/api/students/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on first render
  useEffect(() => {
    fetchData();
  }, []);

  // Toggle school expansion
  const toggleSchool = (schoolId: string) => {
    setExpandedSchoolId(expandedSchoolId === schoolId ? null : schoolId);
  };

  // Filter data by school
  const getShuttlesForSchool = (schoolId: string) => {
    return shuttles.filter(shuttle => shuttle.school === schoolId);
  };

  const getDriversForSchool = (schoolId: string) => {
    return drivers.filter(driver => driver.school === schoolId);
  };

  const getStudentsForSchool = (schoolId: string) => {
    return students.filter(student => student.school === schoolId);
  };

  // Add new school
  const handleAddSchool = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/schools/`, {
        method: "POST",
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(newSchool),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save school: ${errorText}`);
      }
      
      const data = await response.json();
      setSchools([...schools, data]);
      setModalVisible(false);
      setNewSchool({ school_name: "", school_address: "" });
      
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to add school");
    }
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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchData}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>School Admin</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setCurrentStep("school");
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
        renderItem={({ item: school }) => (
          <View style={styles.card}>
            {/* School Header */}
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => toggleSchool(school.id)}
            >
              <Text style={styles.schoolName}>{school.school_name}</Text>
              <Icon 
                name={expandedSchoolId === school.id ? "expand-less" : "expand-more"} 
                size={24} 
                color="#007AFF" 
              />
            </TouchableOpacity>

            {/* Expanded Content */}
            {expandedSchoolId === school.id && (
              <View style={styles.cardContent}>
                <Text style={styles.schoolAddress}>
                  {school.school_address || "No address provided"}
                </Text>

                {/* Shuttles Section */}
                <Text style={styles.sectionTitle}>Shuttles</Text>
                {getShuttlesForSchool(school.id).length === 0 ? (
                  <Text style={styles.noData}>No shuttles registered</Text>
                ) : (
                  getShuttlesForSchool(school.id).map((shuttle) => (
                    <View key={shuttle.reg_number} style={styles.itemRow}>
                      <Icon name="directions-bus" size={18} color="#4CAF50" />
                      <Text style={styles.itemText}>
                        {shuttle.reg_number} (Capacity: {shuttle.capacity})
                      </Text>
                    </View>
                  ))
                )}

                {/* Drivers Section */}
                <Text style={styles.sectionTitle}>Drivers</Text>
                {getDriversForSchool(school.id).length === 0 ? (
                  <Text style={styles.noData}>No drivers assigned</Text>
                ) : (
                  getDriversForSchool(school.id).map((driver) => (
                    <View key={driver.id} style={styles.itemRow}>
                      <Icon name="person" size={18} color="#FF9500" />
                      <Text style={styles.itemText}>
                        {driver.user.first_name} {driver.user.last_name} ({driver.driver_code})
                      </Text>
                    </View>
                  ))
                )}

                {/* Students Section */}
                <Text style={styles.sectionTitle}>Students</Text>
                {getStudentsForSchool(school.id).length === 0 ? (
                  <Text style={styles.noData}>No students enrolled</Text>
                ) : (
                  getStudentsForSchool(school.id).map((student) => (
                    <View key={student.id} style={styles.studentItem}>
                      <Icon name="school" size={18} color="#9C27B0" />
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.student_name}</Text>
                        <Text style={styles.studentClass}>Class: {student.class_level}</Text>
                        {student.parent && (
                          <>
                            <Text style={styles.parentText}>Parent: {student.parent.parent_name}</Text>
                            <Text style={styles.parentText}>Phone: {student.parent.parent_phone}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  ))
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setCurrentStep("shuttle");
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Add Shuttle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setCurrentStep("driver");
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Add Driver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setCurrentStep("student");
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Add Student</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Add Data Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* School Form */}
            {currentStep === "school" && (
              <>
                <Text style={styles.modalTitle}>Add New School</Text>
                <TextInput
                  style={styles.input}
                  placeholder="School Name*"
                  value={newSchool.school_name}
                  onChangeText={(text) => setNewSchool({...newSchool, school_name: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={newSchool.school_address}
                  onChangeText={(text) => setNewSchool({...newSchool, school_address: text})}
                />
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleAddSchool}
                >
                  <Text style={styles.buttonText}>Save School</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Shuttle Form */}
            {currentStep === "shuttle" && (
              <>
                <Text style={styles.modalTitle}>Add New Shuttle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Registration Number*"
                  value={newShuttle.reg_number}
                  onChangeText={(text) => setNewShuttle({...newShuttle, reg_number: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Capacity"
                  keyboardType="numeric"
                  value={newShuttle.capacity.toString()}
                  onChangeText={(text) => setNewShuttle({...newShuttle, capacity: parseInt(text) || 20})}
                />
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => Alert.alert("Info", "Shuttle addition would be implemented here")}
                >
                  <Text style={styles.buttonText}>Save Shuttle</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Driver Form */}
            {currentStep === "driver" && (
              <>
                <Text style={styles.modalTitle}>Add New Driver</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name*"
                  value={newDriver.first_name}
                  onChangeText={(text) => setNewDriver({...newDriver, first_name: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name*"
                  value={newDriver.last_name}
                  onChangeText={(text) => setNewDriver({...newDriver, last_name: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email*"
                  keyboardType="email-address"
                  value={newDriver.email}
                  onChangeText={(text) => setNewDriver({...newDriver, email: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Driver Code*"
                  value={newDriver.driver_code}
                  onChangeText={(text) => setNewDriver({...newDriver, driver_code: text})}
                />
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => Alert.alert("Info", "Driver addition would be implemented here")}
                >
                  <Text style={styles.buttonText}>Save Driver</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Student Form */}
            {currentStep === "student" && (
              <>
                <Text style={styles.modalTitle}>Add New Student</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Student Name*"
                  value={newStudent.student_name}
                  onChangeText={(text) => setNewStudent({...newStudent, student_name: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Class Level*"
                  value={newStudent.class_level}
                  onChangeText={(text) => setNewStudent({...newStudent, class_level: text})}
                />
                <Text style={styles.sectionTitle}>Parent Information</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Parent Name*"
                  value={newStudent.parent_name}
                  onChangeText={(text) => setNewStudent({...newStudent, parent_name: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Parent Phone*"
                  keyboardType="phone-pad"
                  value={newStudent.parent_phone}
                  onChangeText={(text) => setNewStudent({...newStudent, parent_phone: text})}
                />
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => Alert.alert("Info", "Student addition would be implemented here")}
                >
                  <Text style={styles.buttonText}>Save Student</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  listContent: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  cardContent: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  schoolAddress: {
    color: '#6c757d',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginTop: 10,
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  itemText: {
    marginLeft: 10,
    color: '#212529',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  studentInfo: {
    marginLeft: 10,
    flex: 1,
  },
  studentName: {
    fontWeight: '500',
    color: '#212529',
  },
  studentClass: {
    fontSize: 12,
    color: '#6c757d',
  },
  parentText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  noData: {
    color: '#6c757d',
    fontStyle: 'italic',
    marginVertical: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default AdminScreen;


// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   ScrollView,
//   Modal,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";

// const API_BASE = 'http://10.10.161.245:8000';

// // Types matching your Django models
// type School = {
//   id: string;
//   school_name: string;
//   school_address?: string;
//   latitude?: number;
//   longitude?: number;
// };

// type Shuttle = {
//   id: string;
//   reg_number: string;
//   school: string;
//   capacity: number;
//   is_active: boolean;
// };

// type Driver = {
//   id: string;
//   user: {
//     first_name: string;
//     last_name: string;
//     email: string;
//   };
//   driver_code: string;
//   school: string;
//   current_shuttle?: string;
// };

// type Student = {
//   id: string;
//   student_name: string;
//   class_level: string;
//   school: string;
//   parent?: {
//     parent_name: string;
//     parent_phone: string;
//   };
//   shuttle?: string;
// };

// const AdminScreen = () => {
//   // Data states
//   const [schools, setSchools] = useState<School[]>([]);
//   const [shuttles, setShuttles] = useState<Shuttle[]>([]);
//   const [drivers, setDrivers] = useState<Driver[]>([]);
//   const [students, setStudents] = useState<Student[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // UI states
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentStep, setCurrentStep] = useState<"school" | "shuttle" | "driver" | "student">("school");
//   const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
//   const [editingItem, setEditingItem] = useState<any>(null);

//   // Form states
//   const [formData, setFormData] = useState({
//     school: { school_name: "", school_address: "" },
//     shuttle: { reg_number: "", capacity: 20, is_active: true, school: "" },
//     driver: { 
//       first_name: "", 
//       last_name: "", 
//       email: "", 
//       driver_code: "",
//       school: ""
//     },
//     student: { 
//       student_name: "", 
//       class_level: "primary_one",
//       parent_name: "",
//       parent_phone: "",
//       school: ""
//     }
//   });

//   // Fetch all data from backend
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [schoolsRes, shuttlesRes, driversRes, studentsRes] = await Promise.all([
//         fetch(`${API_BASE}/api/schools/`),
//         fetch(`${API_BASE}/api/shuttles/`),
//         fetch(`${API_BASE}/api/drivers/`),
//         fetch(`${API_BASE}/api/students/`),
//       ]);

//       if (!schoolsRes.ok || !shuttlesRes.ok || !driversRes.ok || !studentsRes.ok) {
//         throw new Error('Failed to fetch data');
//       }

//       const [schoolsData, shuttlesData, driversData, studentsData] = await Promise.all([
//         schoolsRes.json(),
//         shuttlesRes.json(),
//         driversRes.json(),
//         studentsRes.json(),
//       ]);

//       setSchools(schoolsData);
//       setShuttles(shuttlesData);
//       // setDrivers(driversData);
//       // setStudents(studentsData);

//     } catch (err) {
//       setError(error.message);
//       Alert.alert("Error", "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load data on first render and when modal closes
//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Handle form input changes
//   const handleInputChange = (field: string, value: string, formType: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [formType]: {
//         ...prev[formType],
//         [field]: value
//       }
//     }));
//   };

//   // Set form data when editing
//   const setupEditForm = (item: any, type: string) => {
//     setEditingItem(item);
//     setCurrentStep(type as any);
    
//     if (type === 'school') {
//       setFormData(prev => ({
//         ...prev,
//         school: {
//           school_name: item.school_name,
//           school_address: item.school_address || ""
//         }
//       }));
//     } else if (type === 'shuttle') {
//       setFormData(prev => ({
//         ...prev,
//         shuttle: {
//           reg_number: item.reg_number,
//           capacity: item.capacity,
//           is_active: item.is_active,
//           school: item.school
//         }
//       }));
//     } else if (type === 'driver') {
//       setFormData(prev => ({
//         ...prev,
//         driver: {
//           first_name: item.user.first_name,
//           last_name: item.user.last_name,
//           email: item.user.email,
//           driver_code: item.driver_code,
//           school: item.school
//         }
//       }));
//     } else if (type === 'student') {
//       setFormData(prev => ({
//         ...prev,
//         student: {
//           student_name: item.student_name,
//           class_level: item.class_level,
//           parent_name: item.parent?.parent_name || "",
//           parent_phone: item.parent?.parent_phone || "",
//           school: item.school
//         }
//       }));
//     }
    
//     setModalVisible(true);
//   };

//   // Submit form data
//   const handleSubmit = async () => {
//     try {
//       let url = '';
//       let method = 'POST';
//       let body = {};
//       let successMessage = '';

//       if (currentStep === 'school') {
//         url = `${API_BASE}/api/schools/`;
//         body = formData.school;
//         successMessage = 'School saved successfully';
        
//         if (editingItem) {
//           url += `${editingItem.id}/`;
//           method = 'PUT';
//         }
//       } 
//       else if (currentStep === 'shuttle') {
//         url = `${API_BASE}/api/shuttles/`;
//         body = formData.shuttle;
//         successMessage = 'Shuttle saved successfully';
        
//         if (editingItem) {
//           url += `${editingItem.id}/`;
//           method = 'PUT';
//         }
//       }
//       else if (currentStep === 'driver') {
//         url = `${API_BASE}/api/drivers/`;
//         body = {
//           user: {
//             first_name: formData.driver.first_name,
//             last_name: formData.driver.last_name,
//             email: formData.driver.email,
//           },
//           driver_code: formData.driver.driver_code,
//           school: formData.driver.school
//         };
//         successMessage = 'Driver saved successfully';
        
//         if (editingItem) {
//           url += `${editingItem.id}/`;
//           method = 'PUT';
//         }
//       }
//       else if (currentStep === 'student') {
//         url = `${API_BASE}/api/students/`;
//         body = {
//           student_name: formData.student.student_name,
//           class_level: formData.student.class_level,
//           parent: {
//             parent_name: formData.student.parent_name,
//             parent_phone: formData.student.parent_phone
//           },
//           school: formData.student.school
//         };
//         successMessage = 'Student saved successfully';
        
//         if (editingItem) {
//           url += `${editingItem.id}/`;
//           method = 'PUT';
//         }
//       }

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'Failed to save data');
//       }

//       Alert.alert("Success", successMessage);
//       setModalVisible(false);
//       setEditingItem(null);
//       fetchData(); // Refresh data

//     } catch (err) {
//       Alert.alert("Error", err.message || "Failed to save data");
//     }
//   };

//   // Delete item
//   const handleDelete = async (id: string, type: string) => {
//     try {
//       const url = `${API_BASE}/api/${type}/${id}/`;
//       const response = await fetch(url, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete');
//       }

//       Alert.alert("Success", `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
//       fetchData(); // Refresh data

//     } catch (err) {
//       Alert.alert("Error", err.message || "Failed to delete");
//     }
//   };

//   // Toggle school expansion
//   const toggleSchool = (schoolId: string) => {
//     setExpandedSchoolId(expandedSchoolId === schoolId ? null : schoolId);
//   };

//   // Filter data by school
//   const getSchoolData = (schoolId: string) => {
//     return {
//       shuttles: shuttles.filter(s => s.school === schoolId),
//       drivers: drivers.filter(d => d.school === schoolId),
//       students: students.filter(s => s.school === schoolId),
//     };
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text>Loading data...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.error}>{error}</Text>
//         <TouchableOpacity 
//           style={styles.retryButton}
//           onPress={fetchData}
//         >
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>School Admin</Text>
//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => {
//             setCurrentStep("school");
//             setEditingItem(null);
//             setFormData({
//               ...formData,
//               school: { school_name: "", school_address: "" }
//             });
//             setModalVisible(true);
//           }}
//         >
//           <Icon name="add" size={20} color="white" />
//           <Text style={styles.addButtonText}>Add School</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Schools List */}
//       <FlatList
//         data={schools}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContent}
//         renderItem={({ item: school }) => {
//           const { shuttles: schoolShuttles, drivers: schoolDrivers, students: schoolStudents } = getSchoolData(school.id);
//           const isExpanded = expandedSchoolId === school.id;

//           return (
//             <View style={styles.card}>
//               {/* School Header */}
//               <TouchableOpacity 
//                 style={styles.cardHeader}
//                 onPress={() => toggleSchool(school.id)}
//               >
//                 <Text style={styles.schoolName}>{school.school_name}</Text>
//                 <Icon 
//                   name={isExpanded ? "expand-less" : "expand-more"} 
//                   size={24} 
//                   color="#007AFF" 
//                 />
//               </TouchableOpacity>

//               {/* Expanded Content */}
//               {isExpanded && (
//                 <View style={styles.cardContent}>
//                   {/* School Information */}
//                   <View style={styles.section}>
//                     <View style={styles.sectionHeader}>
//                       <Text style={styles.sectionTitle}>School Information</Text>
//                       <TouchableOpacity onPress={() => setupEditForm(school, 'school')}>
//                         <Icon name="edit" size={18} color="#007AFF" />
//                       </TouchableOpacity>
//                     </View>
//                     <Text style={styles.infoText}>Address: {school.school_address || 'Not specified'}</Text>
//                     {school.latitude && school.longitude && (
//                       <Text style={styles.infoText}>
//                         Location: {school.latitude}, {school.longitude}
//                       </Text>
//                     )}
//                   </View>

//                   {/* Shuttles Section */}
//                   <View style={styles.section}>
//                     <View style={styles.sectionHeader}>
//                       <Text style={styles.sectionTitle}>Shuttles ({schoolShuttles.length})</Text>
//                       <TouchableOpacity onPress={() => {
//                         setCurrentStep("shuttle");
//                         setEditingItem(null);
//                         setFormData({
//                           ...formData,
//                           shuttle: { 
//                             reg_number: "", 
//                             capacity: 20, 
//                             is_active: true,
//                             school: school.id 
//                           }
//                         });
//                         setModalVisible(true);
//                       }}>
//                         <Icon name="add" size={18} color="#4CAF50" />
//                       </TouchableOpacity>
//                     </View>
                    
//                     {schoolShuttles.length > 0 ? (
//                       schoolShuttles.map(shuttle => (
//                         <View key={shuttle.id} style={styles.item}>
//                           <View style={styles.itemContent}>
//                             <Icon name="directions-bus" size={18} color="#4CAF50" />
//                             <View style={styles.itemDetails}>
//                               <Text style={styles.itemText}>{shuttle.reg_number}</Text>
//                               <Text style={styles.subText}>Capacity: {shuttle.capacity}</Text>
//                               <Text style={styles.subText}>
//                                 Status: {shuttle.is_active ? 'Active' : 'Inactive'}
//                               </Text>
//                             </View>
//                           </View>
//                           <View style={styles.itemActions}>
//                             <TouchableOpacity onPress={() => setupEditForm(shuttle, 'shuttle')}>
//                               <Icon name="edit" size={18} color="#FF9500" />
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => handleDelete(shuttle.id, 'shuttles')}>
//                               <Icon name="delete" size={18} color="#dc3545" />
//                             </TouchableOpacity>
//                           </View>
//                         </View>
//                       ))
//                     ) : (
//                       <Text style={styles.noData}>No shuttles registered</Text>
//                     )}
//                   </View>

//                   {/* Drivers Section */}
//                   <View style={styles.section}>
//                     <View style={styles.sectionHeader}>
//                       <Text style={styles.sectionTitle}>Drivers ({schoolDrivers.length})</Text>
//                       <TouchableOpacity onPress={() => {
//                         setCurrentStep("driver");
//                         setEditingItem(null);
//                         setFormData({
//                           ...formData,
//                           driver: { 
//                             first_name: "", 
//                             last_name: "", 
//                             email: "", 
//                             driver_code: "",
//                             school: school.id
//                           }
//                         });
//                         setModalVisible(true);
//                       }}>
//                         <Icon name="add" size={18} color="#FF9500" />
//                       </TouchableOpacity>
//                     </View>
                    
//                     {schoolDrivers.length > 0 ? (
//                       schoolDrivers.map(driver => (
//                         <View key={driver.id} style={styles.item}>
//                           <View style={styles.itemContent}>
//                             <Icon name="person" size={18} color="#FF9500" />
//                             <View style={styles.itemDetails}>
//                               <Text style={styles.itemText}>
//                                 {driver.user.first_name} {driver.user.last_name}
//                               </Text>
//                               <Text style={styles.subText}>Code: {driver.driver_code}</Text>
//                               <Text style={styles.subText}>Email: {driver.user.email}</Text>
//                               {driver.current_shuttle && (
//                                 <Text style={styles.subText}>Assigned Shuttle: {driver.current_shuttle}</Text>
//                               )}
//                             </View>
//                           </View>
//                           <View style={styles.itemActions}>
//                             <TouchableOpacity onPress={() => setupEditForm(driver, 'driver')}>
//                               <Icon name="edit" size={18} color="#007AFF" />
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => handleDelete(driver.id, 'drivers')}>
//                               <Icon name="delete" size={18} color="#dc3545" />
//                             </TouchableOpacity>
//                           </View>
//                         </View>
//                       ))
//                     ) : (
//                       <Text style={styles.noData}>No drivers assigned</Text>
//                     )}
//                   </View>

//                   {/* Students Section */}
//                   <View style={styles.section}>
//                     <View style={styles.sectionHeader}>
//                       <Text style={styles.sectionTitle}>Students ({schoolStudents.length})</Text>
//                       <TouchableOpacity onPress={() => {
//                         setCurrentStep("student");
//                         setEditingItem(null);
//                         setFormData({
//                           ...formData,
//                           student: { 
//                             student_name: "", 
//                             class_level: "primary_one",
//                             parent_name: "",
//                             parent_phone: "",
//                             school: school.id
//                           }
//                         });
//                         setModalVisible(true);
//                       }}>
//                         <Icon name="add" size={18} color="#9C27B0" />
//                       </TouchableOpacity>
//                     </View>
                    
//                     {schoolStudents.length > 0 ? (
//                       schoolStudents.map(student => (
//                         <View key={student.id} style={styles.item}>
//                           <View style={styles.itemContent}>
//                             <Icon name="school" size={18} color="#9C27B0" />
//                             <View style={styles.itemDetails}>
//                               <Text style={styles.itemText}>{student.student_name}</Text>
//                               <Text style={styles.subText}>Class: {student.class_level}</Text>
//                               {student.parent && (
//                                 <>
//                                   <Text style={styles.subText}>Parent: {student.parent.parent_name}</Text>
//                                   <Text style={styles.subText}>Phone: {student.parent.parent_phone}</Text>
//                                 </>
//                               )}
//                               {student.shuttle && (
//                                 <Text style={styles.subText}>Shuttle: {student.shuttle}</Text>
//                               )}
//                             </View>
//                           </View>
//                           <View style={styles.itemActions}>
//                             <TouchableOpacity onPress={() => setupEditForm(student, 'student')}>
//                               <Icon name="edit" size={18} color="#007AFF" />
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => handleDelete(student.id, 'students')}>
//                               <Icon name="delete" size={18} color="#dc3545" />
//                             </TouchableOpacity>
//                           </View>
//                         </View>
//                       ))
//                     ) : (
//                       <Text style={styles.noData}>No students enrolled</Text>
//                     )}
//                   </View>
//                 </View>
//               )}
//             </View>
//           );
//         }}
//       />

//       {/* Add/Edit Data Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={() => {
//           setModalVisible(false);
//           setEditingItem(null);
//         }}
//       >
//         <View style={styles.modalContainer}>
//           <ScrollView contentContainerStyle={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               {editingItem ? 'Edit' : 'Add New'} {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
//             </Text>

//             {/* School Form */}
//             {currentStep === "school" && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="School Name*"
//                   value={formData.school.school_name}
//                   onChangeText={(text) => handleInputChange('school_name', text, 'school')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Address"
//                   value={formData.school.school_address}
//                   onChangeText={(text) => handleInputChange('school_address', text, 'school')}
//                 />
//               </>
//             )}

//             {/* Shuttle Form */}
//             {currentStep === "shuttle" && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Registration Number*"
//                   value={formData.shuttle.reg_number}
//                   onChangeText={(text) => handleInputChange('reg_number', text, 'shuttle')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Capacity"
//                   keyboardType="numeric"
//                   value={formData.shuttle.capacity.toString()}
//                   onChangeText={(text) => handleInputChange('capacity', text, 'shuttle')}
//                 />
//               </>
//             )}

//             {/* Driver Form */}
//             {currentStep === "driver" && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="First Name*"
//                   value={formData.driver.first_name}
//                   onChangeText={(text) => handleInputChange('first_name', text, 'driver')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Last Name*"
//                   value={formData.driver.last_name}
//                   onChangeText={(text) => handleInputChange('last_name', text, 'driver')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email*"
//                   keyboardType="email-address"
//                   value={formData.driver.email}
//                   onChangeText={(text) => handleInputChange('email', text, 'driver')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Driver Code*"
//                   value={formData.driver.driver_code}
//                   onChangeText={(text) => handleInputChange('driver_code', text, 'driver')}
//                 />
//               </>
//             )}

//             {/* Student Form */}
//             {currentStep === "student" && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Student Name*"
//                   value={formData.student.student_name}
//                   onChangeText={(text) => handleInputChange('student_name', text, 'student')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Class Level*"
//                   value={formData.student.class_level}
//                   onChangeText={(text) => handleInputChange('class_level', text, 'student')}
//                 />
//                 <Text style={styles.sectionTitle}>Parent Information</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Parent Name*"
//                   value={formData.student.parent_name}
//                   onChangeText={(text) => handleInputChange('parent_name', text, 'student')}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Parent Phone*"
//                   keyboardType="phone-pad"
//                   value={formData.student.parent_phone}
//                   onChangeText={(text) => handleInputChange('parent_phone', text, 'student')}
//                 />
//               </>
//             )}

//             <View style={styles.modalButtons}>
//               <TouchableOpacity 
//                 style={[styles.button, styles.cancelButton]}
//                 onPress={() => {
//                   setModalVisible(false);
//                   setEditingItem(null);
//                 }}
//               >
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.button, styles.primaryButton]}
//                 onPress={handleSubmit}
//               >
//                 <Text style={styles.buttonText}>{editingItem ? 'Update' : 'Save'}</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     backgroundColor: '#007AFF',
//     padding: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   addButton: {
//     flexDirection: 'row',
//     backgroundColor: '#28a745',
//     padding: 8,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   addButtonText: {
//     color: 'white',
//     marginLeft: 5,
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 10,
//   },
//   card: {
//     backgroundColor: 'white',
//     marginBottom: 10,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//   },
//   schoolName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#212529',
//   },
//   cardContent: {
//     padding: 15,
//     paddingTop: 0,
//     borderTopWidth: 1,
//     borderTopColor: '#e9ecef',
//   },
//   section: {
//     marginBottom: 15,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#495057',
//   },
//   infoText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 5,
//   },
//   item: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f5f5f5',
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   itemDetails: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   itemText: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//   },
//   subText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   itemActions: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   noData: {
//     color: '#999',
//     fontStyle: 'italic',
//     marginVertical: 5,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   error: {
//     color: '#dc3545',
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     backgroundColor: '#007AFF',
//     padding: 10,
//     borderRadius: 5,
//   },
//   retryText: {
//     color: 'white',
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   modalContent: {
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#212529',
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ced4da',
//     borderRadius: 5,
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: 'white',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   button: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   primaryButton: {
//     backgroundColor: '#007AFF',
//   },
//   cancelButton: {
//     backgroundColor: '#dc3545',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: '500',
//   },
// });

// export default AdminScreen;