import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";
import styles from "./styles/RouteScreenStyles"; // Adjust the path if you placed the file in a different 


// Dummy Data
const schools = [
  { id: "1", name: "Kampala Primary School" },
  { id: "2", name: "Jinja Road Academy" },
  { id: "3", name: "Central City School" },
  { id: "4", name: "Eastside Academy" },
];

const classes = ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "Primary 7"];

const dummyStudents = [
  // Kampala Road Students (Shuttle A)
  { id: "S001", name: "John Doe", location: { latitude: 0.3476, longitude: 32.5825 }, road: "Kampala" },
  { id: "S002", name: "Jane Smith", location: { latitude: 0.3450, longitude: 32.5750 }, road: "Kampala" },
  { id: "S003", name: "Peter Okot", location: { latitude: 0.3400, longitude: 32.5700 }, road: "Kampala" },
  { id: "S004", name: "Mary Auma", location: { latitude: 0.3420, longitude: 32.5780 }, road: "Kampala" },
  { id: "S005", name: "Tom Lwanga", location: { latitude: 0.3460, longitude: 32.5800 }, road: "Kampala" },
  // Jinja Road Students (Shuttle B)
  { id: "S006", name: "Alice Kisa", location: { latitude: 0.3500, longitude: 32.5900 }, road: "Jinja" },
  { id: "S007", name: "Bob Mutebi", location: { latitude: 0.3520, longitude: 32.5950 }, road: "Jinja" },
  { id: "S008", name: "Sarah Naka", location: { latitude: 0.3480, longitude: 32.5850 }, road: "Jinja" },
  { id: "S009", name: "David Ouma", location: { latitude: 0.3540, longitude: 32.5980 }, road: "Jinja" },
  { id: "S010", name: "Emma Kato", location: { latitude: 0.3490, longitude: 32.5870 }, road: "Jinja" },
];

const shuttleRoutes = {
  A: {
    name: "Shuttle A (Kampala Road)",
    startLocation: { latitude: 0.3380, longitude: 32.5650 },
    route: [
      { latitude: 0.3380, longitude: 32.5650 }, // Start
      { latitude: 0.3400, longitude: 32.5700 },
      { latitude: 0.3420, longitude: 32.5780 },
      { latitude: 0.3450, longitude: 32.5750 },
      { latitude: 0.3460, longitude: 32.5800 },
      { latitude: 0.3476, longitude: 32.5825 },
    ],
    time: "25 mins",
  },
  B: {
    name: "Shuttle B (Jinja Road)",
    startLocation: { latitude: 0.3460, longitude: 32.5830 },
    route: [
      { latitude: 0.3460, longitude: 32.5830 }, // Start
      { latitude: 0.3480, longitude: 32.5850 },
      { latitude: 0.3490, longitude: 32.5870 },
      { latitude: 0.3500, longitude: 32.5900 },
      { latitude: 0.3520, longitude: 32.5950 },
      { latitude: 0.3540, longitude: 32.5980 },
    ],
    time: "30 mins",
  },
};

const RouteScreen = () => {
  const mapRef = useRef<MapView>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showStudentsOverlay, setShowStudentsOverlay] = useState(false);
  const [showAssigningOverlay, setShowAssigningOverlay] = useState(false);
  const [showShuttleOverlay, setShowShuttleOverlay] = useState(false);
  const [assignedShuttles, setAssignedShuttles] = useState<any>(null);
  const [selectedShuttle, setSelectedShuttle] = useState<string | null>(null);

  const defaultRegion = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleAssign = () => {
    setShowStudentsOverlay(false);
    setShowAssigningOverlay(true);
    const assignments = {
      A: dummyStudents.filter((student) => student.road === "Kampala"),
      B: dummyStudents.filter((student) => student.road === "Jinja"),
    };
    setTimeout(() => {
      setAssignedShuttles(assignments);
      setShowAssigningOverlay(false);
      setShowShuttleOverlay(true);
    }, 2000); // Simulate assigning delay
  };

  const renderSchoolItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={styles.schoolItem}
      onPress={() => setSelectedSchool(item.name)}
    >
      <Text style={styles.schoolText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderClassItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.classItem}
      onPress={() => {
        setSelectedClass(item);
        setShowStudentsOverlay(true);
      }}
    >
      <Text style={styles.classText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.listContainer}>
        <Text style={styles.title}>Schools</Text>
        <FlatList
          data={schools}
          renderItem={renderSchoolItem}
          keyExtractor={(item) => item.id}
          style={styles.schoolList}
        />
        {selectedSchool && (
          <>
            <Text style={styles.subtitle}>Classes in {selectedSchool}</Text>
            <FlatList
              data={classes}
              renderItem={renderClassItem}
              keyExtractor={(item) => item}
              style={styles.classList}
            />
          </>
        )}
      </ScrollView>

      {/* Students Overlay */}
      {showStudentsOverlay && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowStudentsOverlay(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>{selectedClass} Students</Text>
          <FlatList
            data={dummyStudents}
            renderItem={({ item }) => (
              <View style={styles.studentItem}>
                <Text style={styles.studentText}>{item.name}</Text>
                <Text style={styles.studentLocation}>
                  Lat: {item.location.latitude}, Lon: {item.location.longitude}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
            <Text style={styles.buttonText}>Assign</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Assigning Overlay */}
      {showAssigningOverlay && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Assigning Students...</Text>
        </View>
      )}

      {/* Shuttle Overlay */}
      {showShuttleOverlay && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowShuttleOverlay(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Shuttle Assignments</Text>
          <TouchableOpacity
            style={styles.shuttleItem}
            onPress={() => setSelectedShuttle("A")}
          >
            <Text style={styles.shuttleText}>{shuttleRoutes.A.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shuttleItem}
            onPress={() => setSelectedShuttle("B")}
          >
            <Text style={styles.shuttleText}>{shuttleRoutes.B.name}</Text>
          </TouchableOpacity>

          {selectedShuttle && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.largeMap}
                provider={PROVIDER_GOOGLE}
                initialRegion={defaultRegion}
              >
                <Polyline
                  coordinates={shuttleRoutes[selectedShuttle].route}
                  strokeColor="#0000FF"
                  strokeWidth={4}
                />
                {/* Start Location Marker */}
                <Marker
                  coordinate={shuttleRoutes[selectedShuttle].startLocation}
                  title={`${shuttleRoutes[selectedShuttle].name} Start`}
                  pinColor="green"
                />
                {/* Student Pickup Points */}
                {assignedShuttles[selectedShuttle].map((student: any) => (
                  <Marker
                    key={student.id}
                    coordinate={student.location}
                    title={student.name}
                    pinColor="red"
                  />
                ))}
              </MapView>
              <Text style={styles.timeText}>
                Time to Reach: {shuttleRoutes[selectedShuttle].time}
              </Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedShuttle(null)}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};



export default RouteScreen;