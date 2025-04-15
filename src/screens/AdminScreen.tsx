import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
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
  ScrollView, // Added for modal content
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Config from "react-native-config";
import { Picker } from "@react-native-picker/picker";

// --- Constants ---
const CLASS_CHOICES = [
    { label: 'Primary One', value: 'primary_one' },
    { label: 'Primary Two', value: 'primary_two' },
    { label: 'Primary Three', value: 'primary_three' },
    { label: 'Primary Four', value: 'primary_four' },
    { label: 'Primary Five', value: 'primary_five' },
    { label: 'Primary Six', value: 'primary_six' },
    { label: 'Primary Seven', value: 'primary_seven' },
];
const CLASS_CHOICES_MAP = Object.fromEntries(CLASS_CHOICES.map(c => [c.value, c.label]));
// Add the placeholder item for the Picker default
const PICKER_CLASS_CHOICES = [{ label: 'Select Class...', value: '' }, ...CLASS_CHOICES];

// --- Types ---
type School = {
  id: string;
  school_name: string;
  school_address?: string;
  latitude?: number;
  longitude?: number;
};

type User = { // Added User type based on sample
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

type Parent = { // Added Parent type based on sample
    id: string;
    user?: User; // Make user optional as it might not always be needed/present
    parent_name: string;
    parent_phone: string;
    parent_address: string;
    created_at?: string; // Optional timestamps
    modified_at?: string; // Optional timestamps
};

type Shuttle = {
  reg_number: string;
  school?: School; // Make optional to handle potential inconsistencies from backend
  school_id?: string; // Add school_id if backend sends it separately sometimes
  capacity: number;
  is_active: boolean;
  current_latitude?: number | string; // Allow string or number
  current_longitude?: number | string; // Allow string or number
  driver_code?: string | null;
};

// Use the existing Student type which includes school_id (from Option 1 serializer)
type Student = {
    id: string;
    student_name: string;
    student_code: string;
    school_name: string; // Keep if backend sends it
    school_id: string;   // Essential for filtering
    class_level: string;
    parent_details: Parent | null; // Use Parent type, allow null
    shuttle: Shuttle | null;     // Use Shuttle type, allow null
    onboarded: boolean;
    offboarded_at: string | null;
};

// Type for grouped students
type GroupedStudents = {
    [classLevel: string]: Student[];
};

// Type for expanded class state
type ExpandedClassesState = {
    [schoolId: string]: {
        [classLevel: string]: boolean;
    };
};

// --- Component ---
const AdminScreen = () => {
  console.log("AdminScreen rendered");

  // --- State ---
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  // Only need school and student steps now based on the flow described
  const [currentStep, setCurrentStep] = useState<"school" | "edit_school" | "student">("school");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  // Keep track of expanded class within the currently expanded school
  const [expandedClassLevel, setExpandedClassLevel] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null); // For linking new student/shuttle
  const [selectedClassLevel, setSelectedClassLevel] = useState<string | null>(null); // For linking new student

  // State to manage expanded classes within each school
  const [expandedClasses, setExpandedClasses] = useState<ExpandedClassesState>({});

  // Form states
  const [schoolForm, setSchoolForm] = useState({ id: "", school_name: "", school_address: "", latitude: "", longitude: "" });
  // Explicitly define student form state based on modal fields
  const [studentForm, setStudentForm] = useState({
    student_name: "",
    student_code: "",
    // school_id and class_level will be pre-filled when opening modal
    parent_id: "", // ID of selected parent
    shuttle_reg_number: "", // Reg number of selected shuttle
    onboarded: false,
  });

  // Define CLASS_LEVELS based on constant
  const CLASS_LEVELS = CLASS_CHOICES.map(c => c.value);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => { // Use useCallback
    try {
      setLoading(true);
      setError(null);
      const headers = { Accept: "application/json", "Content-Type": "application/json" };
      const baseUrl = Config.API_BASE_URL;

      console.log("Fetching schools, students, parents, shuttles...");
      const [schoolsRes, studentsRes, parentsRes, shuttlesRes] = await Promise.all([
        fetch(`${baseUrl}/api/schools/`, { headers }),
        fetch(`${baseUrl}/api/students/`, { headers }), // Ensure backend sends school_id here
        fetch(`${baseUrl}/api/parents/`, { headers }),
        fetch(`${baseUrl}/api/shuttles/`, { headers }),
      ]);

      // Process Schools
      if (!schoolsRes.ok) throw new Error(`Schools: ${schoolsRes.status} ${await schoolsRes.text()}`);
      const schoolsData = await schoolsRes.json();
      if (!Array.isArray(schoolsData)) throw new Error("Invalid format for school data.");
      setSchools(schoolsData);
      console.log(`Workspaceed ${schoolsData.length} schools`);

      // Process Students
      if (!studentsRes.ok) throw new Error(`Students: ${studentsRes.status} ${await studentsRes.text()}`);
      const studentsData = await studentsRes.json();
      if (!Array.isArray(studentsData)) throw new Error("Invalid format for student data.");
      // Verify school_id presence (due to Option 1 serializer)
      if (studentsData.length > 0 && studentsData[0].school_id === undefined) {
          console.warn("Student data fetched might be missing 'school_id'. Ensure backend StudentSerializer includes it (Option 1).");
      }
      setStudents(studentsData);
      console.log(`Workspaceed ${studentsData.length} students`);

      // Process Parents
      if (!parentsRes.ok) throw new Error(`Parents: ${parentsRes.status} ${await parentsRes.text()}`);
      const parentsData = await parentsRes.json();
      if (!Array.isArray(parentsData)) throw new Error("Invalid format for parent data.");
      setParents(parentsData);
      console.log(`Workspaceed ${parentsData.length} parents`);

      // Process Shuttles & **Normalize School Relation**
      if (!shuttlesRes.ok) throw new Error(`Shuttles: ${shuttlesRes.status} ${await shuttlesRes.text()}`);
      let shuttlesData = await shuttlesRes.json();
      if (!Array.isArray(shuttlesData)) throw new Error("Invalid format for shuttle data.");

      // Ensure each shuttle has a school *object* if possible, or at least school_id
      shuttlesData = shuttlesData.map((shuttle: any) => {
          let schoolInfo: School | undefined;
          let schoolId: string | undefined = shuttle.school_id; // Check if ID is sent directly

          if (shuttle.school) {
              if (typeof shuttle.school === 'string') { // If backend sent only ID in 'school' field
                  schoolId = shuttle.school;
                  schoolInfo = schoolsData.find(s => s.id === schoolId);
              } else if (typeof shuttle.school === 'object' && shuttle.school.id) { // If backend sent nested object
                  schoolId = shuttle.school.id;
                  schoolInfo = shuttle.school;
              }
          }
          // Fallback if only school_id was present
          if (!schoolInfo && schoolId) {
             schoolInfo = schoolsData.find(s => s.id === schoolId);
          }

          // Ensure school_id is set if we found the school object
          if (!schoolId && schoolInfo?.id) {
              schoolId = schoolInfo.id;
          }

          return { ...shuttle, school: schoolInfo, school_id: schoolId }; // Ensure both school object and school_id are present if possible
      });

      setShuttles(shuttlesData);
      console.log(`Workspaceed and processed ${shuttlesData.length} shuttles`);

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []); // Re-run if schools change (for shuttle normalization)

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Use fetchData in dependency array

  // --- CRUD Operations ---
  // School CRUD (Keep existing logic - trimmed for brevity)
  const handleAddSchool = async () => { /* ... */ };
  const handleUpdateSchool = async () => { /* ... */ };
  const handleDeleteSchool = async (schoolId: string) => { /* ... */ };
  // Need Shuttle CRUD handlers if shuttle management is done here
  // const handleAddShuttle = async () => { /* ... */ };
  // const handleUpdateShuttle = async () => { /* ... */ };
  // const handleDeleteShuttle = async (regNumber: string) => { /* ... */ };

  // Student Add Handler
  const handleAddStudent = async () => {
    // Get school_id and class_level from the context where modal was opened
    if (!selectedSchoolId || !selectedClassLevel) {
        Alert.alert("Error", "School or Class context is missing. Please reopen the form.");
        return;
    }

    // Basic Validations
    if (!studentForm.student_name.trim()) { Alert.alert("Error", "Student name is required"); return; }
    if (!studentForm.student_code.trim()) { Alert.alert("Error", "Student code is required"); return; }
    // Parent is optional
    // Shuttle required only if onboarded
    if (studentForm.onboarded && !studentForm.shuttle_reg_number) {
      Alert.alert("Error", "Please select a shuttle if the student is onboarded.");
      return;
    }

    try {
      // Construct body, ensuring correct field names expected by backend
      const body: any = {
        student_name: studentForm.student_name.trim(),
        student_code: studentForm.student_code.trim().toUpperCase(),
        school: selectedSchoolId, // Send the school ID
        class_level: selectedClassLevel, // Send the class level
        onboarded: studentForm.onboarded,
      };
      // Send optional fields only if they have a value
      if (studentForm.parent_id) {
        body.parent = studentForm.parent_id; // Assumes backend expects 'parent' field with ID
      }
      if (studentForm.onboarded && studentForm.shuttle_reg_number) {
        body.shuttle = studentForm.shuttle_reg_number; // Assumes backend expects 'shuttle' field with reg_number
      } else {
        // Ensure shuttle is null if not onboarded or not selected
        body.shuttle = null;
      }

      console.log("Adding student with body:", JSON.stringify(body));

      const response = await fetch(`${Config.API_BASE_URL}/api/students/`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            console.error("Add student failed response:", errorData);
            // Extract meaningful errors from DRF response
            if (errorData.detail) errorDetail = errorData.detail;
            else if (errorData.student_code) errorDetail = `Student Code: ${errorData.student_code.join(', ')}`;
            else if (errorData.non_field_errors) errorDetail = errorData.non_field_errors.join(', ');
            else errorDetail = JSON.stringify(errorData);
        } catch (jsonError) { errorDetail = await response.text(); }
        throw new Error(`Failed to add student: ${errorDetail}`);
      }

      const data = await response.json();
      console.log("Student added successfully:", data);

      // Refresh data to show the new student
      await fetchData();
      setModalVisible(false);
      // Reset form and selected context
      resetStudentForm(); // Use a reset function
      setSelectedSchoolId(null);
      setSelectedClassLevel(null);
      // Optionally close the expanded class/school view?
      // setExpandedClassLevel(null);
      // setExpandedSchoolId(null);
      Alert.alert("Success", "Student added successfully");

    } catch (err: any) {
      console.error("Add student error:", err);
      Alert.alert("Error", err.message || "Failed to add student.");
    }
  };

  // Function to reset student form state
  const resetStudentForm = () => {
      setStudentForm({
        student_name: "",
        student_code: "",
        parent_id: "",
        shuttle_reg_number: "",
        onboarded: false,
      });
  };

  // --- UI Helpers ---
  const toggleSchool = (schoolId: string) => {
    const isOpening = expandedSchoolId !== schoolId;
    setExpandedSchoolId(isOpening ? schoolId : null);
    // Reset class level expansion only when opening a different school or closing the current one
    if (isOpening || expandedSchoolId === schoolId) { // Reset if opening new or closing current
      setExpandedClassLevel(null);
    }
  };

  const toggleClass = (classLevel: string) => {
    setExpandedClassLevel(prev => (prev === classLevel ? null : classLevel));
  };

  // Get students for a specific class within a specific school
  const getStudentsForClass = (schoolId: string, classLevel: string): Student[] => {
    if (!Array.isArray(students)) return [];
    return students.filter(
      (student) => student.school_id === schoolId && student.class_level === classLevel
    );
  };

  // Get shuttles specifically for the *currently selected school* in the modal form
  const getShuttlesForSelectedSchool = (): Shuttle[] => {
      if (!selectedSchoolId || !Array.isArray(shuttles)) return [];
      // Use optional chaining and check both school.id and school_id
      // Also check if the shuttle is active, maybe? Optional.
      return shuttles.filter(shuttle => (shuttle.school?.id === selectedSchoolId || shuttle.school_id === selectedSchoolId)); // && shuttle.is_active);
  };

  // --- Render Logic ---
  if (loading) return ( <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /><Text>Loading data...</Text></View> );
  if (error) return ( <View style={styles.center}><Text style={styles.error}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={fetchData}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View> );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>School Admin Dashboard</Text>
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

      {/* Schools List */}
      <FlatList
        data={schools}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.noData}>No schools found.</Text>}
        renderItem={({ item: school }) => {
            // Calculate student count for the header display
            const studentCount = students.filter(s => s.school_id === school.id).length;
            const isSchoolExpanded = expandedSchoolId === school.id;

            return (
              <View style={styles.card}>
                {/* School Header */}
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSchool(school.id)}>
                  <View style={styles.schoolHeaderInfo}>
                    <Text style={styles.schoolName}>{school.school_name}</Text>
                    {/* Display student count */}
                    <Text style={styles.schoolMeta}>Students: {studentCount}</Text>
                  </View>
                  <Icon name={isSchoolExpanded ? "expand-less" : "expand-more"} size={24} color="#007AFF" />
                </TouchableOpacity>

                {/* Expanded School Content */}
                {isSchoolExpanded && (
                  <View style={styles.cardContent}>
                    {/* School Details */}
                    <Text style={styles.detailTextLabel}>Address:</Text>
                    <Text style={styles.detailTextValue}>{school.school_address || "Not provided"}</Text>
                    {school.latitude && school.longitude && (
                        <>
                        <Text style={styles.detailTextLabel}>Coordinates:</Text>
                        <Text style={styles.detailTextValue}>({school.latitude}, {school.longitude})</Text>
                        </>
                    )}
                    <View style={styles.separatorThin} />

                    {/* Classes Section */}
                    <Text style={styles.sectionTitle}>Classes</Text>
                    {CLASS_LEVELS.map((classLevel) => {
                        const studentsInClass = getStudentsForClass(school.id, classLevel);
                        const isClassExpanded = expandedClassLevel === classLevel;
                        return (
                         <View key={classLevel} style={styles.classGroup}>
                            {/* Class Header (Touchable to expand/collapse) */}
                            <TouchableOpacity style={styles.classHeader} onPress={() => toggleClass(classLevel)}>
                                <Text style={styles.className}>{CLASS_CHOICES_MAP[classLevel] || classLevel} ({studentsInClass.length})</Text>
                                <Icon name={isClassExpanded ? "expand-less" : "expand-more"} size={20} color="#6f42c1" />
                            </TouchableOpacity>

                            {/* Expanded Class Content (Student List or Add Button) */}
                            {isClassExpanded && (
                               <View style={styles.classContent}>
                                  {studentsInClass.length === 0 ? (
                                    // Show Add Student Button if no students
                                    <View style={styles.emptyClassContainer}>
                                        <Text style={[styles.noData, { textAlign: 'left'}]}>No students currently in this class.</Text>
                                        <TouchableOpacity
                                           style={styles.inlineAddButton}
                                           onPress={() => {
                                              setCurrentStep("student");
                                              resetStudentForm(); // Reset form fields
                                              setSelectedSchoolId(school.id); // Set context
                                              setSelectedClassLevel(classLevel); // Set context
                                              setModalVisible(true);
                                           }}
                                        >
                                           <Icon name="person-add" size={16} color="#6f42c1" />
                                           <Text style={[styles.inlineAddButtonText, { color: '#6f42c1' }]}>Add Student to {CLASS_CHOICES_MAP[classLevel] || classLevel}</Text>
                                        </TouchableOpacity>
                                     </View>
                                  ) : (
                                    // List Students
                                    studentsInClass.map((student) => (
                                        // Student Row Component (can be extracted)
                                        <View key={student.id} style={styles.studentItem}>
                                            {/* Header with Name/Code and Actions */}
                                            <View style={styles.studentItemHeader}>
                                                <Icon name="person" size={18} color="#17a2b8" style={{ marginRight: 8 }}/>
                                                <Text style={styles.studentNameText} numberOfLines={1} ellipsizeMode="tail">
                                                    {student.student_name} ({student.student_code})
                                                </Text>
                                                <View style={styles.actionIcons}>
                                                    <TouchableOpacity onPress={() => {/* Edit Student */}}><Icon name="edit" size={18} color="#007AFF" /></TouchableOpacity>
                                                    <TouchableOpacity onPress={() => {/* Delete Student */}}><Icon name="delete" size={18} color="#dc3545" /></TouchableOpacity>
                                                 </View>
                                            </View>
                                            {/* Details */}
                                            <View style={styles.studentItemDetails}>
                                                <Text style={styles.detailItem}><Text style={styles.detailLabel}>Onboarded:</Text> {student.onboarded ? 'Yes' : 'No'}</Text>
                                                {student.parent_details && (
                                                <>
                                                    <Text style={styles.detailItem}><Text style={styles.detailLabel}>Parent:</Text> {student.parent_details.parent_name} ({student.parent_details.parent_phone})</Text>
                                                    {/* <Text style={styles.detailItem}><Text style={styles.detailLabel}>Address:</Text> {student.parent_details.parent_address}</Text> */}
                                                </>
                                                )}
                                                {student.shuttle && (
                                                <Text style={styles.detailItem}><Text style={styles.detailLabel}>Shuttle:</Text> {student.shuttle.reg_number} ({student.shuttle.is_active ? 'Active' : 'Inactive'})</Text>
                                                )}
                                                {student.offboarded_at && (
                                                    <Text style={styles.detailItem}><Text style={styles.detailLabel}>Offboarded:</Text> {new Date(student.offboarded_at).toLocaleDateString()}</Text>
                                                )}
                                            </View>
                                        </View>
                                     ))
                                  )}
                               </View>
                            )}
                         </View>
                      );
                    })}
                    {/* Separator before School Actions */}
                    <View style={styles.separator} />

                    {/* School Action Buttons (Edit/Delete School) */}
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
                          onPress={() => handleDeleteSchool(school.id)} >
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
                  {/* Dynamic Title */}
                  {currentStep === "school" && "Add New School"}
                  {currentStep === "edit_school" && "Edit School"}
                  {currentStep === "student" && "Add New Student"}
                </Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetStudentForm(); setSelectedClassLevel(null); setSelectedSchoolId(null); }}>
                   <Icon name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
             </View>
             {/* Use ScrollView for modal content */}
             <ScrollView keyboardShouldPersistTaps="handled">
                 <View style={styles.modalContent}>
                    {/* School Form */}
                    {(currentStep === "school" || currentStep === "edit_school") && (
                       <>
                         <Text style={styles.inputLabel}>School Name*</Text>
                         <TextInput style={styles.input} placeholder="Enter school name" value={schoolForm.school_name} onChangeText={(t) => setSchoolForm(f => ({ ...f, school_name: t }))} />
                         <Text style={styles.inputLabel}>Address</Text>
                         <TextInput style={styles.input} placeholder="Enter address (optional)" value={schoolForm.school_address} onChangeText={(t) => setSchoolForm(f => ({ ...f, school_address: t }))} />
                         <Text style={styles.inputLabel}>Latitude</Text>
                         <TextInput style={styles.input} placeholder="Latitude (optional)" value={schoolForm.latitude} onChangeText={(t) => setSchoolForm(f => ({ ...f, latitude: t.replace(/[^0-9.-]/g, '') }))} keyboardType="numeric" />
                         <Text style={styles.inputLabel}>Longitude</Text>
                         <TextInput style={styles.input} placeholder="Longitude (optional)" value={schoolForm.longitude} onChangeText={(t) => setSchoolForm(f => ({ ...f, longitude: t.replace(/[^0-9.-]/g, '') }))} keyboardType="numeric" />
                         <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={currentStep === "school" ? handleAddSchool : handleUpdateSchool}>
                             <Text style={styles.buttonText}>{currentStep === "school" ? "Save School" : "Update School"}</Text>
                         </TouchableOpacity>
                       </>
                    )}

                    {/* Student Form */}
                    {currentStep === "student" && (
                       <>
                          {/* Display School and Class context */}
                          <Text style={styles.contextLabel}>School:</Text>
                          <Text style={styles.contextValue}>{schools.find((s) => s.id === selectedSchoolId)?.school_name || "N/A"}</Text>
                          <Text style={styles.contextLabel}>Class:</Text>
                          <Text style={styles.contextValue}>{CLASS_CHOICES_MAP[selectedClassLevel || ''] || "N/A"}</Text>
                          <View style={styles.separatorThinModal} />

                          {/* Student Name Input */}
                          <Text style={styles.inputLabel}>Student Name*</Text>
                          <TextInput style={styles.input} placeholder="Enter full name" value={studentForm.student_name} onChangeText={(t) => setStudentForm(f => ({ ...f, student_name: t }))} />
                          {/* Student Code Input */}
                          <Text style={styles.inputLabel}>Student Code* (Unique)</Text>
                          <TextInput style={styles.input} placeholder="Enter unique student code" value={studentForm.student_code} onChangeText={(t) => setStudentForm(f => ({ ...f, student_code: t.toUpperCase() }))} autoCapitalize="characters" />

                          {/* Parent Picker */}
                          <Text style={styles.inputLabel}>Parent (optional):</Text>
                          {/* Apply pickerContainer style here */}
                          <View style={styles.pickerContainer}>
                              <Picker
                                 selectedValue={studentForm.parent_id}
                                 onValueChange={(itemValue) => setStudentForm(f => ({ ...f, parent_id: itemValue as string })) } // Ensure itemValue is string
                                 style={styles.pickerStyle} // Applied style
                                 prompt="Select Parent"
                              >
                                 <Picker.Item label="- Select Parent -" value="" />
                                 {parents.map((parent) => (
                                    <Picker.Item key={parent.id} label={`${parent.parent_name} (${parent.parent_phone})`} value={parent.id} />
                                 ))}
                              </Picker>
                          </View>

                          {/* Onboarded Switch */}
                          <View style={styles.switchContainer}>
                             <Text style={styles.switchLabel}>Onboarded:</Text>
                             <TouchableOpacity
                                style={[styles.switch, { backgroundColor: studentForm.onboarded ? "#28a745" : "#dc3545" }]}
                                onPress={() => setStudentForm(f => ({ ...f, onboarded: !f.onboarded, shuttle_reg_number: !f.onboarded ? f.shuttle_reg_number : "" }))} // Clear shuttle if switching to No
                             >
                                <Text style={styles.switchText}>{studentForm.onboarded ? "Yes" : "No"}</Text>
                             </TouchableOpacity>
                          </View>

                          {/* Shuttle Picker */}
                          {studentForm.onboarded && (
                             <>
                                <Text style={styles.inputLabel}>Shuttle* (if Onboarded):</Text>
                                {/* Apply pickerContainer style here */}
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={studentForm.shuttle_reg_number}
                                        onValueChange={(itemValue) => setStudentForm(f => ({ ...f, shuttle_reg_number: itemValue as string })) }
                                        style={styles.pickerStyle} // Applied style
                                        enabled={getShuttlesForSelectedSchool().length > 0} // Disable if no shuttles
                                        prompt="Select Shuttle"
                                    >
                                        <Picker.Item label={getShuttlesForSelectedSchool().length > 0 ? "- Select Shuttle -" : "- No Shuttles for this School -"} value="" />
                                        {/* Use corrected shuttle getter */}
                                        {getShuttlesForSelectedSchool().map((shuttle) => (
                                            <Picker.Item
                                                key={shuttle.reg_number}
                                                label={`${shuttle.reg_number} (${shuttle.is_active ? "Active" : "Inactive"})`}
                                                value={shuttle.reg_number}
                                             />
                                         ))}
                                    </Picker>
                                </View>
                             </>
                          )}

                          {/* Save Button */}
                          <TouchableOpacity style={[styles.button, styles.primaryButton, { marginTop: 10 }]} onPress={handleAddStudent}>
                              <Icon name="save" size={18} color="white" style={{ marginRight: 8 }} />
                              <Text style={styles.buttonText}>Save Student</Text>
                          </TouchableOpacity>
                       </>
                    )}

                    {/* Cancel Button */}
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => { setModalVisible(false); resetStudentForm(); setSelectedClassLevel(null); setSelectedSchoolId(null); }}>
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

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { backgroundColor: "#007AFF", paddingVertical: 15, paddingHorizontal: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: '#0056b3' },
  headerText: { color: "white", fontSize: 20, fontWeight: "bold" },
  addButton: { flexDirection: "row", backgroundColor: "#28a745", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, alignItems: "center", elevation: 2 },
  addButtonText: { color: "white", marginLeft: 5, fontWeight: "500" },
  listContent: { padding: 10, paddingBottom: 30 }, // Increased bottom padding
  card: { backgroundColor: "white", marginBottom: 12, borderRadius: 8, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  schoolHeaderInfo: { flex: 1, marginRight: 10 },
  schoolName: { fontSize: 17, fontWeight: "600", color: "#343a40" },
  schoolMeta: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  cardContent: { paddingHorizontal: 15, paddingBottom: 15, paddingTop: 10 }, // Adjusted padding
  detailTextLabel: { fontSize: 14, color: '#6c757d', fontWeight: 'bold', marginBottom: 2 },
  detailTextValue: { fontSize: 14, color: '#212529', marginBottom: 8 },
  separator: { height: 1, backgroundColor: '#e9ecef', marginVertical: 15, },
  separatorThin: { height: 1, backgroundColor: '#f1f3f5', marginVertical: 10, },
  separatorThinModal: { height: 1, backgroundColor: '#e9ecef', marginVertical: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#007AFF", marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#dee2e6', paddingBottom: 6 },
  classGroup: { marginLeft: 5, marginBottom: 5, borderLeftWidth: 2, borderLeftColor: '#6f42c1', paddingLeft: 10, }, // Changed color
  classHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, },
  className: { fontSize: 15, fontWeight: '600', color: '#343a40', },
  classContent: { paddingLeft: 5, paddingTop: 5, }, // Reduced padding
  emptyClassContainer: { paddingVertical: 10, alignItems: 'flex-start', },
  studentItem: { backgroundColor: '#ffffff', padding: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', },
  studentItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between', },
  studentNameText: { fontSize: 14, fontWeight: '500', color: '#343a40', flex: 1, marginRight: 10, },
  studentItemDetails: { marginLeft: 26, marginTop: 2, },
  detailItem: { fontSize: 13, color: '#6c757d', marginBottom: 3, lineHeight: 18, },
  detailLabel: { fontWeight: '600', color: '#495057', },
  noData: { color: "#6c757d", fontStyle: "italic", marginVertical: 10, fontSize: 14, }, // Removed center align
  actionButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 15, gap: 10, }, // Removed top border/padding
  schoolActionButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e9ecef', },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, elevation: 1, },
  inlineAddButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5, borderWidth: 1, borderColor: '#dee2e6', marginTop: 10, alignSelf: 'flex-start', },
  inlineAddButtonText: { marginLeft: 5, fontWeight: '500', fontSize: 14, },
  buttonText: { color: "white", fontWeight: "500", fontSize: 14, },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: '#f8f9fa' },
  error: { color: "#dc3545", fontSize: 16, marginBottom: 20, textAlign: "center" },
  retryButton: { backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, elevation: 2 },
  retryText: { color: "white", fontWeight: "500" },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }, // Darker overlay
  modalContainer: { width: '90%', maxHeight: '90%', backgroundColor: "white", borderRadius: 10, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#f8f9fa' },
  modalScrollView: { width: '100%' },
  modalContent: { padding: 20, paddingBottom: 30 }, // Added bottom padding
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#343a40" },
  contextLabel: { fontSize: 13, color: '#6c757d', marginBottom: 1 },
  contextValue: { fontSize: 15, color: '#212529', fontWeight: '500', marginBottom: 8 },
  inputLabel: { fontSize: 15, color: "#495057", marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: "#ced4da", borderRadius: 5, padding: 12, marginBottom: 15, backgroundColor: "white", fontSize: 15 },
  pickerContainer: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 5, marginBottom: 15, backgroundColor: 'white', justifyContent: 'center', },
  pickerStyle: { height: 50, width: '100%', backgroundColor: 'transparent' }, // Explicit height, transparent bg might help iOS
  switchContainer: { flexDirection: "row", alignItems: "center", justifyContent: 'space-between', marginBottom: 20, paddingVertical: 5 },
  switchLabel: { fontSize: 16, color: "#495057", fontWeight: '500' },
  switch: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 15, minWidth: 80, alignItems: 'center' },
  switchText: { color: "white", fontWeight: "bold" },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 5, marginBottom: 10, elevation: 1 },
  primaryButton: { backgroundColor: "#007AFF" },
  cancelButton: { backgroundColor: "#6c757d" },
  actionIcons: { flexDirection: "row", gap: 15 }, // Keep consistent gap
});

export default AdminScreen;