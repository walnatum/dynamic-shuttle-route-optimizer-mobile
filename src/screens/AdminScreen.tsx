import React, { useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";

const AdminScreen = () => {
  const navigation = useNavigation();

  // State for schools with dummy data
  const [schools, setSchools] = useState([
    {
      id: "1",
      name: "Greenwood High",
      location: "Kampala (0.3476, 32.5825)",
      description: "A leading school in Kampala with excellent facilities.",
      shuttles: [
        { id: "s1", name: "Shuttle A", numberPlate: "UGX 123A" },
        { id: "s2", name: "Shuttle B", numberPlate: "UGX 456B" },
      ],
      drivers: [
        { id: "d1", name: "John Doe", contact: "+256 700 123 456" },
        { id: "d2", name: "Jane Smith", contact: "+256 700 654 321" },
      ],
      students: [
        { id: "st1", name: "Alice Brown", class: "Primary 1", pickUpPoint: "Kampala (0.3476, 32.5825)", dropOffPoint: "Kampala (0.3476, 32.5825)", parentName: "Mary Brown", parentContact: "+256 700 111 222" },
        { id: "st2", name: "Bob White", class: "Primary 2", pickUpPoint: "Kampala (0.3476, 32.5825)", dropOffPoint: "Kampala (0.3476, 32.5825)", parentName: "Tom White", parentContact: "+256 700 333 444" },
      ],
      expanded: false, // For dropdown toggle
    },
    {
      id: "2",
      name: "Sunnydale Academy",
      location: "Entebbe (0.0513, 32.4637)",
      description: "A prestigious academy in Entebbe known for academic excellence.",
      shuttles: [
        { id: "s3", name: "Shuttle C", numberPlate: "UGX 789C" },
      ],
      drivers: [
        { id: "d3", name: "Mike Johnson", contact: "+256 700 555 666" },
      ],
      students: [
        { id: "st3", name: "Charlie Green", class: "Primary 1", pickUpPoint: "Entebbe (0.0513, 32.4637)", dropOffPoint: "Entebbe (0.0513, 32.4637)", parentName: "Sarah Green", parentContact: "+256 700 777 888" },
        { id: "st4", name: "Diana Blue", class: "Primary 2", pickUpPoint: "Entebbe (0.0513, 32.4637)", dropOffPoint: "Entebbe (0.0513, 32.4637)", parentName: "James Blue", parentContact: "+256 700 999 000" },
      ],
      expanded: false,
    },
  ]);

  // States for modals and form inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState("school"); // Steps: school, shuttles, drivers, students
  const [newSchool, setNewSchool] = useState({
    name: "",
    location: "",
    locationType: "predefined", // "predefined" or "custom"
    predefinedPlace: "", // New field for place name
    predefinedCoordinates: "", // New field for coordinates
    customLatitude: "",
    customLongitude: "",
    description: "",
    shuttles: [],
    drivers: [],
    students: [],
  });
  const [newShuttle, setNewShuttle] = useState({ name: "", numberPlate: "" });
  const [newDriver, setNewDriver] = useState({ name: "", contact: "" });
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    pickUpPoint: "",
    pickUpPointType: "predefined", // "predefined" or "custom"
    pickUpPredefinedPlace: "", // New field for place name
    pickUpPredefinedCoordinates: "", // New field for coordinates
    pickUpCustomLatitude: "",
    pickUpCustomLongitude: "",
    dropOffPoint: "",
    dropOffPointType: "predefined", // "predefined" or "custom"
    dropOffPredefinedPlace: "", // New field for place name
    dropOffPredefinedCoordinates: "", // New field for coordinates
    dropOffCustomLatitude: "",
    dropOffCustomLongitude: "",
    parentName: "",
    parentContact: "",
  });
  const [selectedSchoolId, setSelectedSchoolId] = useState(null); // For adding data to existing schools

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Toggle school dropdown
  const toggleSchool = (id) => {
    setSchools(
      schools.map((school) =>
        school.id === id ? { ...school, expanded: !school.expanded } : school
      )
    );
  };

  // Open modal to add data to an existing school
  const openAddDataModal = (schoolId, step) => {
    setSelectedSchoolId(schoolId);
    setCurrentStep(step);
    setModalVisible(true);
  };

  // Save school
  const saveSchool = () => {
    if (!newSchool.name.trim() || !newSchool.description.trim()) {
      Alert.alert("Error", "Please fill in all school details.");
      return;
    }
    if (
      newSchool.locationType === "predefined" &&
      (!newSchool.predefinedPlace.trim() || !newSchool.predefinedCoordinates.trim())
    ) {
      Alert.alert("Error", "Please enter both the place name and coordinates for the predefined location.");
      return;
    }
    if (
      newSchool.locationType === "custom" &&
      (!newSchool.customLatitude.trim() || !newSchool.customLongitude.trim())
    ) {
      Alert.alert("Error", "Please enter both latitude and longitude for the custom location.");
      return;
    }

    const location =
      newSchool.locationType === "predefined"
        ? `${newSchool.predefinedPlace} ${newSchool.predefinedCoordinates}`
        : `${newSchool.customLatitude}, ${newSchool.customLongitude}`;

    const schoolToAdd = {
      id: Date.now().toString(),
      name: newSchool.name,
      location: location,
      description: newSchool.description,
      shuttles: [],
      drivers: [],
      students: [],
      expanded: false,
    };
    setSchools([...schools, schoolToAdd]);
    setSelectedSchoolId(schoolToAdd.id);
    setCurrentStep("shuttles");
    setNewSchool({
      name: "",
      location: "",
      locationType: "predefined",
      predefinedPlace: "",
      predefinedCoordinates: "",
      customLatitude: "",
      customLongitude: "",
      description: "",
      shuttles: [],
      drivers: [],
      students: [],
    });
  };

  // Save shuttle
  const saveShuttle = () => {
    if (!newShuttle.name.trim() || !newShuttle.numberPlate.trim()) {
      Alert.alert("Error", "Please enter both shuttle name and number plate.");
      return;
    }
    setSchools(
      schools.map((school) =>
        school.id === selectedSchoolId
          ? {
              ...school,
              shuttles: [
                ...school.shuttles,
                { id: Date.now().toString(), name: newShuttle.name, numberPlate: newShuttle.numberPlate },
              ],
            }
          : school
      )
    );
    setNewShuttle({ name: "", numberPlate: "" });
    if (currentStep === "shuttles") {
      setCurrentStep("drivers");
    }
  };

  // Save driver
  const saveDriver = () => {
    if (!newDriver.name.trim() || !newDriver.contact.trim()) {
      Alert.alert("Error", "Please enter both driver name and contact.");
      return;
    }
    setSchools(
      schools.map((school) =>
        school.id === selectedSchoolId
          ? {
              ...school,
              drivers: [
                ...school.drivers,
                { id: Date.now().toString(), name: newDriver.name, contact: newDriver.contact },
              ],
            }
          : school
      )
    );
    setNewDriver({ name: "", contact: "" });
    if (currentStep === "drivers") {
      setCurrentStep("students");
    }
  };

  // Save student
  const saveStudent = () => {
    if (
      !newStudent.name.trim() ||
      !newStudent.class.trim() ||
      !newStudent.parentName.trim() ||
      !newStudent.parentContact.trim()
    ) {
      Alert.alert("Error", "Please fill in all student details.");
      return;
    }

    // Validate pick-up point
    if (
      newStudent.pickUpPointType === "predefined" &&
      (!newStudent.pickUpPredefinedPlace.trim() || !newStudent.pickUpPredefinedCoordinates.trim())
    ) {
      Alert.alert("Error", "Please enter both the place name and coordinates for the predefined pick-up point.");
      return;
    }
    if (
      newStudent.pickUpPointType === "custom" &&
      (!newStudent.pickUpCustomLatitude.trim() || !newStudent.pickUpCustomLongitude.trim())
    ) {
      Alert.alert("Error", "Please enter both latitude and longitude for the custom pick-up point.");
      return;
    }

    // Validate drop-off point
    if (
      newStudent.dropOffPointType === "predefined" &&
      (!newStudent.dropOffPredefinedPlace.trim() || !newStudent.dropOffPredefinedCoordinates.trim())
    ) {
      Alert.alert("Error", "Please enter both the place name and coordinates for the predefined drop-off point.");
      return;
    }
    if (
      newStudent.dropOffPointType === "custom" &&
      (!newStudent.dropOffCustomLatitude.trim() || !newStudent.dropOffCustomLongitude.trim())
    ) {
      Alert.alert("Error", "Please enter both latitude and longitude for the custom drop-off point.");
      return;
    }

    const pickUpPoint =
      newStudent.pickUpPointType === "predefined"
        ? `${newStudent.pickUpPredefinedPlace} ${newStudent.pickUpPredefinedCoordinates}`
        : `${newStudent.pickUpCustomLatitude}, ${newStudent.pickUpCustomLongitude}`;

    const dropOffPoint =
      newStudent.dropOffPointType === "predefined"
        ? `${newStudent.dropOffPredefinedPlace} ${newStudent.dropOffPredefinedCoordinates}`
        : `${newStudent.dropOffCustomLatitude}, ${newStudent.dropOffCustomLongitude}`;

    setSchools(
      schools.map((school) =>
        school.id === selectedSchoolId
          ? {
              ...school,
              students: [
                ...school.students,
                {
                  id: Date.now().toString(),
                  name: newStudent.name,
                  class: newStudent.class,
                  pickUpPoint: pickUpPoint,
                  dropOffPoint: dropOffPoint,
                  parentName: newStudent.parentName,
                  parentContact: newStudent.parentContact,
                },
              ],
            }
          : school
      )
    );
    setNewStudent({
      name: "",
      class: "",
      pickUpPoint: "",
      pickUpPointType: "predefined",
      pickUpPredefinedPlace: "",
      pickUpPredefinedCoordinates: "",
      pickUpCustomLatitude: "",
      pickUpCustomLongitude: "",
      dropOffPoint: "",
      dropOffPointType: "predefined",
      dropOffPredefinedPlace: "",
      dropOffPredefinedCoordinates: "",
      dropOffCustomLatitude: "",
      dropOffCustomLongitude: "",
      parentName: "",
      parentContact: "",
    });
  };

  // Group students by class
  const groupStudentsByClass = (students) => {
    const grouped = {};
    students.forEach((student) => {
      if (!grouped[student.class]) {
        grouped[student.class] = [];
      }
      grouped[student.class].push(student);
    });
    return grouped;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.addSchoolButton} onPress={() => { setCurrentStep("school"); setModalVisible(true); }}>
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.addSchoolButtonText}>Add School</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      />

      {/* Schools List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schools</Text>
        <FlatList
          data={schools}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSchool(item.id)}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Icon
                  name={item.expanded ? "expand-less" : "expand-more"}
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>

              {item.expanded && (
                <View style={styles.cardContent}>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.location}>Location: {item.location}</Text>

                  {/* Shuttles */}
                  <Text style={styles.subTitle}>Shuttles:</Text>
                  {item.shuttles.map((shuttle) => (
                    <View key={shuttle.id} style={styles.subItem}>
                      <Icon name="directions-bus" size={20} color="#007AFF" style={styles.icon} />
                      <Text style={styles.subItemText}>
                        {shuttle.name} (Number Plate: {shuttle.numberPlate})
                      </Text>
                    </View>
                  ))}

                  {/* Drivers */}
                  <Text style={styles.subTitle}>Drivers:</Text>
                  {item.drivers.map((driver) => (
                    <View key={driver.id} style={styles.subItem}>
                      <Icon name="person" size={20} color="#4CAF50" style={styles.icon} />
                      <Text style={styles.subItemText}>
                        {driver.name} (Contact: {driver.contact})
                      </Text>
                    </View>
                  ))}

                  {/* Students Grouped by Class */}
                  <Text style={styles.subTitle}>Students:</Text>
                  {Object.entries(groupStudentsByClass(item.students)).map(([className, students]) => (
                    <View key={className}>
                      <Text style={styles.classTitle}>{className}:</Text>
                      {students.map((student) => (
                        <View key={student.id} style={styles.subItem}>
                          <Icon name="school" size={20} color="#FF9500" style={styles.icon} />
                          <View>
                            <Text style={styles.subItemText}>{student.name}</Text>
                            <Text style={styles.subItemText}>Pick-up: {student.pickUpPoint}</Text>
                            <Text style={styles.subItemText}>Drop-off: {student.dropOffPoint}</Text>
                            <Text style={styles.subItemText}>Parent: {student.parentName}</Text>
                            <Text style={styles.subItemText}>Parent Contact: {student.parentContact}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}

                  {/* Buttons to Add More Data */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openAddDataModal(item.id, "shuttles")}
                    >
                      <Text style={styles.actionButtonText}>Add Shuttle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openAddDataModal(item.id, "drivers")}
                    >
                      <Text style={styles.actionButtonText}>Add Driver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openAddDataModal(item.id, "students")}
                    >
                      <Text style={styles.actionButtonText}>Add Student</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Modal for Adding Data */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentStep === "school" && (
              <>
                <Text style={styles.modalTitle}>Add New School</Text>
                <TextInput
                  style={styles.input}
                  placeholder="School Name"
                  value={newSchool.name}
                  onChangeText={(text) => setNewSchool({ ...newSchool, name: text })}
                  placeholderTextColor="#666"
                />
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Location Type:</Text>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.optionButton, newSchool.locationType === "predefined" && styles.selectedOption]}
                      onPress={() => setNewSchool({ ...newSchool, locationType: "predefined", customLatitude: "", customLongitude: "" })}
                    >
                      <Text style={styles.optionText}>Place with Coordinates</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.optionButton, newSchool.locationType === "custom" && styles.selectedOption]}
                      onPress={() => setNewSchool({ ...newSchool, locationType: "custom", predefinedPlace: "", predefinedCoordinates: "" })}
                    >
                      <Text style={styles.optionText}>Custom Coordinates</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newSchool.locationType === "predefined" ? (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Enter Location:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Place Name (e.g., Kampala)"
                      value={newSchool.predefinedPlace}
                      onChangeText={(text) => setNewSchool({ ...newSchool, predefinedPlace: text })}
                      placeholderTextColor="#666"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Coordinates (e.g., (0.3476, 32.5825))"
                      value={newSchool.predefinedCoordinates}
                      onChangeText={(text) => setNewSchool({ ...newSchool, predefinedCoordinates: text })}
                      placeholderTextColor="#666"
                    />
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Custom Location:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Latitude"
                      value={newSchool.customLatitude}
                      onChangeText={(text) => setNewSchool({ ...newSchool, customLatitude: text })}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Longitude"
                      value={newSchool.customLongitude}
                      onChangeText={(text) => setNewSchool({ ...newSchool, customLongitude: text })}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Description"
                  value={newSchool.description}
                  onChangeText={(text) => setNewSchool({ ...newSchool, description: text })}
                  placeholderTextColor="#666"
                  multiline
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveSchool}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {currentStep === "shuttles" && (
              <>
                <Text style={styles.modalTitle}>Add Shuttle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Shuttle Name"
                  value={newShuttle.name}
                  onChangeText={(text) => setNewShuttle({ ...newShuttle, name: text })}
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Number Plate"
                  value={newShuttle.numberPlate}
                  onChangeText={(text) => setNewShuttle({ ...newShuttle, numberPlate: text })}
                  placeholderTextColor="#666"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveShuttle}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {currentStep === "drivers" && (
              <>
                <Text style={styles.modalTitle}>Add Driver</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Driver Name"
                  value={newDriver.name}
                  onChangeText={(text) => setNewDriver({ ...newDriver, name: text })}
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contact"
                  value={newDriver.contact}
                  onChangeText={(text) => setNewDriver({ ...newDriver, contact: text })}
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveDriver}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {currentStep === "students" && (
              <>
                <Text style={styles.modalTitle}>Add Student</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Student Name"
                  value={newStudent.name}
                  onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Class (e.g., Primary 1)"
                  value={newStudent.class}
                  onChangeText={(text) => setNewStudent({ ...newStudent, class: text })}
                  placeholderTextColor="#666"
                />

                {/* Pick-up Point */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Pick-up Point Type:</Text>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.optionButton, newStudent.pickUpPointType === "predefined" && styles.selectedOption]}
                      onPress={() => setNewStudent({ ...newStudent, pickUpPointType: "predefined", pickUpCustomLatitude: "", pickUpCustomLongitude: "" })}
                    >
                      <Text style={styles.optionText}>Place with Coordinates</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.optionButton, newStudent.pickUpPointType === "custom" && styles.selectedOption]}
                      onPress={() => setNewStudent({ ...newStudent, pickUpPointType: "custom", pickUpPredefinedPlace: "", pickUpPredefinedCoordinates: "" })}
                    >
                      <Text style={styles.optionText}>Custom Coordinates</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newStudent.pickUpPointType === "predefined" ? (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Enter Pick-up Point:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Place Name (e.g., Kampala)"
                      value={newStudent.pickUpPredefinedPlace}
                      onChangeText={(text) => setNewStudent({ ...newStudent, pickUpPredefinedPlace: text })}
                      placeholderTextColor="#666"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Coordinates (e.g., (0.3476, 32.5825))"
                      value={newStudent.pickUpPredefinedCoordinates}
                      onChangeText={(text) => setNewStudent({ ...newStudent, pickUpPredefinedCoordinates: text })}
                      placeholderTextColor="#666"
                    />
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Custom Pick-up Point:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Latitude"
                      value={newStudent.pickUpCustomLatitude}
                      onChangeText={(text) => setNewStudent({ ...newStudent, pickUpCustomLatitude: text })}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Longitude"
                      value={newStudent.pickUpCustomLongitude}
                      onChangeText={(text) => setNewStudent({ ...newStudent, pickUpCustomLongitude: text })}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {/* Drop-off Point */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Drop-off Point Type:</Text>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.optionButton, newStudent.dropOffPointType === "predefined" && styles.selectedOption]}
                      onPress={() => setNewStudent({ ...newStudent, dropOffPointType: "predefined", dropOffCustomLatitude: "", dropOffCustomLongitude: "" })}
                    >
                      <Text style={styles.optionText}>Place with Coordinates</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.optionButton, newStudent.dropOffPointType === "custom" && styles.selectedOption]}
                      onPress={() => setNewStudent({ ...newStudent, dropOffPointType: "custom", dropOffPredefinedPlace: "", dropOffPredefinedCoordinates: "" })}
                    >
                      <Text style={styles.optionText}>Custom Coordinates</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newStudent.dropOffPointType === "predefined" ? (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Enter Drop-off Point:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Place Name (e.g., Entebbe)"
                      value={newStudent.dropOffPredefinedPlace}
                      onChangeText={(text) => setNewStudent({ ...newStudent, dropOffPredefinedPlace: text })}
                      placeholderTextColor="#666"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Coordinates (e.g., (0.0513, 32.4637))"
                      value={newStudent.dropOffPredefinedCoordinates}
                      onChangeText={(text) => setNewStudent({ ...newStudent, dropOffPredefinedCoordinates: text })}
                      placeholderTextColor="#666"
                    />
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Custom Drop-off Point:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Latitude"
                      value={newStudent.dropOffCustomLatitude}
                      onChangeText={(text) => setNewStudent({ ...newStudent, dropOffCustomLatitude: text })}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Longitude"
                      value={newStudent.dropOffCustomLongitude}
                      onChangeText={(text) => setNewStudent({ ...newStudent, dropOffCustomLongitude: text })}
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Parent's Name"
                  value={newStudent.parentName}
                  onChangeText={(text) => setNewStudent({ ...newStudent, parentName: text })}
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Parent's Contact"
                  value={newStudent.parentContact}
                  onChangeText={(text) => setNewStudent({ ...newStudent, parentContact: text })}
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveStudent}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  addSchoolButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addSchoolButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  map: {
    height: 200,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  section: {
    margin: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  cardContent: {
    padding: 15,
    paddingTop: 0,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  classTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginTop: 5,
    marginLeft: 10,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  subItemText: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    color: "#333",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AdminScreen;