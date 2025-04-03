// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   FlatList,
// } from "react-native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";

// // Dummy Data
// const schools = [
//   { id: "1", name: "Kampala Primary School" },
//   { id: "2", name: "Jinja Road Academy" },
//   { id: "3", name: "Central City School" },
//   { id: "4", name: "Eastside Academy" },
// ];

// const classes = ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "Primary 7"];

// const dummyStudents = [
//   { id: "S001", name: "John Doe", location: { latitude: 0.3476, longitude: 32.5825 }, road: "Kampala" },
//   { id: "S002", name: "Jane Smith", location: { latitude: 0.3500, longitude: 32.5900 }, road: "Jinja" },
//   { id: "S003", name: "Peter Okot", location: { latitude: 0.3450, longitude: 32.5750 }, road: "Kampala" },
//   { id: "S004", name: "Mary Auma", location: { latitude: 0.3520, longitude: 32.5950 }, road: "Jinja" },
// ];

// const shuttleRoutes = {
//   A: {
//     name: "Shuttle A (Kampala Road)",
//     route: [
//       { latitude: 0.3400, longitude: 32.5700 },
//       { latitude: 0.3476, longitude: 32.5825 },
//       { latitude: 0.3450, longitude: 32.5750 },
//     ],
//     time: "25 mins",
//   },
//   B: {
//     name: "Shuttle B (Jinja Road)",
//     route: [
//       { latitude: 0.3480, longitude: 32.5850 },
//       { latitude: 0.3500, longitude: 32.5900 },
//       { latitude: 0.3520, longitude: 32.5950 },
//     ],
//     time: "30 mins",
//   },
// };

// const RouteScreen = () => {
//   const mapRef = useRef<MapView>(null);
//   const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
//   const [selectedClass, setSelectedClass] = useState<string | null>(null);
//   const [showStudentsOverlay, setShowStudentsOverlay] = useState(false);
//   const [showAssigningOverlay, setShowAssigningOverlay] = useState(false);
//   const [showShuttleOverlay, setShowShuttleOverlay] = useState(false);
//   const [assignedShuttles, setAssignedShuttles] = useState<any>(null);
//   const [selectedShuttle, setSelectedShuttle] = useState<string | null>(null);

//   const defaultRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   const handleAssign = () => {
//     setShowStudentsOverlay(false);
//     setShowAssigningOverlay(true);
//     const assignments = {
//       A: dummyStudents.filter((student) => student.road === "Kampala"),
//       B: dummyStudents.filter((student) => student.road === "Jinja"),
//     };
//     setTimeout(() => {
//       setAssignedShuttles(assignments);
//       setShowAssigningOverlay(false);
//       setShowShuttleOverlay(true);
//     }, 2000); // Simulate assigning delay
//   };

//   const renderSchoolItem = ({ item }: { item: { id: string; name: string } }) => (
//     <TouchableOpacity
//       style={styles.schoolItem}
//       onPress={() => setSelectedSchool(item.name)}
//     >
//       <Text style={styles.schoolText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   const renderClassItem = ({ item }: { item: string }) => (
//     <TouchableOpacity
//       style={styles.classItem}
//       onPress={() => {
//         setSelectedClass(item);
//         setShowStudentsOverlay(true);
//       }}
//     >
//       <Text style={styles.classText}>{item}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView style={styles.listContainer}>
//         <Text style={styles.title}>Schools</Text>
//         <FlatList
//           data={schools}
//           renderItem={renderSchoolItem}
//           keyExtractor={(item) => item.id}
//           style={styles.schoolList}
//         />
//         {selectedSchool && (
//           <>
//             <Text style={styles.subtitle}>Classes in {selectedSchool}</Text>
//             <FlatList
//               data={classes}
//               renderItem={renderClassItem}
//               keyExtractor={(item) => item}
//               style={styles.classList}
//             />
//           </>
//         )}
//       </ScrollView>

//       {/* Students Overlay */}
//       {showStudentsOverlay && (
//         <View style={styles.overlay}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setShowStudentsOverlay(false)}
//           >
//             <Text style={styles.closeText}>✕</Text>
//           </TouchableOpacity>
//           <Text style={styles.overlayTitle}>{selectedClass} Students</Text>
//           <FlatList
//             data={dummyStudents}
//             renderItem={({ item }) => (
//               <View style={styles.studentItem}>
//                 <Text style={styles.studentText}>{item.name}</Text>
//                 <Text style={styles.studentLocation}>
//                   Lat: {item.location.latitude}, Lon: {item.location.longitude}
//                 </Text>
//               </View>
//             )}
//             keyExtractor={(item) => item.id}
//           />
//           <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
//             <Text style={styles.buttonText}>Assign</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Assigning Overlay */}
//       {showAssigningOverlay && (
//         <View style={styles.overlay}>
//           <Text style={styles.overlayTitle}>Assigning Students...</Text>
//         </View>
//       )}

//       {/* Shuttle Overlay */}
//       {showShuttleOverlay && (
//         <View style={styles.overlay}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setShowShuttleOverlay(false)}
//           >
//             <Text style={styles.closeText}>✕</Text>
//           </TouchableOpacity>
//           <Text style={styles.overlayTitle}>Shuttle Assignments</Text>
//           <TouchableOpacity
//             style={styles.shuttleItem}
//             onPress={() => setSelectedShuttle("A")}
//           >
//             <Text style={styles.shuttleText}>{shuttleRoutes.A.name}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.shuttleItem}
//             onPress={() => setSelectedShuttle("B")}
//           >
//             <Text style={styles.shuttleText}>{shuttleRoutes.B.name}</Text>
//           </TouchableOpacity>

//           {selectedShuttle && (
//             <View style={styles.mapContainer}>
//               <MapView
//                 ref={mapRef}
//                 style={styles.map}
//                 provider={PROVIDER_GOOGLE}
//                 initialRegion={defaultRegion}
//               >
//                 <Polyline
//                   coordinates={shuttleRoutes[selectedShuttle].route}
//                   strokeColor="#0000FF"
//                   strokeWidth={4}
//                 />
//                 {assignedShuttles[selectedShuttle].map((student: any) => (
//                   <Marker
//                     key={student.id}
//                     coordinate={student.location}
//                     title={student.name}
//                     pinColor="red"
//                   />
//                 ))}
//               </MapView>
//               <Text style={styles.timeText}>
//                 Time to Reach: {shuttleRoutes[selectedShuttle].time}
//               </Text>
//               <TouchableOpacity
//                 style={styles.backButton}
//                 onPress={() => setSelectedShuttle(null)}
//               >
//                 <Text style={styles.buttonText}>Back</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   listContainer: {
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   schoolList: {
//     marginBottom: 20,
//   },
//   schoolItem: {
//     padding: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   schoolText: {
//     fontSize: 16,
//   },
//   classList: {},
//   classItem: {
//     padding: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   classText: {
//     fontSize: 16,
//   },
//   overlay: {
//     position: "absolute",
//     top: "12.5%",
//     left: 0,
//     right: 0,
//     height: "75%",
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     elevation: 10,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     backgroundColor: "#FF3B30",
//     width: 25,
//     height: 25,
//     borderRadius: 12.5,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closeText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   overlayTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   studentItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   studentText: {
//     fontSize: 16,
//   },
//   studentLocation: {
//     fontSize: 12,
//     color: "#666",
//   },
//   assignButton: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   shuttleItem: {
//     padding: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   shuttleText: {
//     fontSize: 16,
//   },
//   mapContainer: {
//     flex: 1,
//     marginTop: 20,
//   },
//   map: {
//     flex: 1,
//     borderRadius: 10,
//   },
//   timeText: {
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 10,
//   },
//   backButton: {
//     backgroundColor: "#FF9500",
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default RouteScreen;




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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  schoolList: {
    marginBottom: 20,
  },
  schoolItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  schoolText: {
    fontSize: 16,
  },
  classList: {},
  classItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  classText: {
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: "12.5%",
    left: 0,
    right: 0,
    height: "75%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF3B30",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  studentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  studentText: {
    fontSize: 16,
  },
  studentLocation: {
    fontSize: 12,
    color: "#666",
  },
  assignButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  shuttleItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  shuttleText: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    marginTop: 20,
  },
  largeMap: {
    height: 400, // Increased map size
    borderRadius: 10,
  },
  timeText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  backButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RouteScreen;