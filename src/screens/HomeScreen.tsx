// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// const HomeScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome Home!</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e0f7fa",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
// });

// export default HomeScreen;









// import React from "react";
// import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
// import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
// import { Ionicons } from "@expo/vector-icons";

// const HomeScreen = () => {
//   return (
//     <View style={styles.container}>
//       {/* Search Bar */}
//       {/* <View style={styles.searchBar}>
//         <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
//         <TextInput placeholder="Search" style={styles.searchInput} />
//       </View> */}

//       {/* Map */}
//       <MapView
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={{
//           latitude: 57.1334, // Example latitude (adjust to your location)
//           longitude: 13.0012, // Example longitude (adjust to your location)
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       />

//       {/* Floating Buttons */}
//       <View style={styles.floatingButtons}>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Weather Data</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Traffic Data</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Crash Data</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   searchBar: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     right: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "white",
//     padding: 10,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     elevation: 5,
//     zIndex: 1,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//   },
//   map: {
//     flex: 1,
//   },
//   floatingButtons: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     elevation: 5,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
// });

// export default HomeScreen;



// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from "expo-location";

// const HomeScreen = () => {
//   const [location, setLocation] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setErrorMsg("Permission to access location was denied");
//         return;
//       }
      
//       let userLocation = await Location.getCurrentPositionAsync({});
//       setLocation(userLocation.coords);
//     })();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={{
//           latitude: location ? location.latitude : 37.78825, // Default to an example location
//           longitude: location ? location.longitude : -122.4324,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         region={
//           location
//             ? {
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//                 latitudeDelta: 0.05,
//                 longitudeDelta: 0.05,
//               }
//             : undefined
//         }
//       >
//         {location && (
//           <Marker
//             coordinate={{ latitude: location.latitude, longitude: location.longitude }}
//             title="You are here"
//           />
//         )}
//       </MapView>

//       {/* Floating Buttons */}
//       <View style={styles.floatingButtons}>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Weather Data</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Traffic Data</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Crash Data</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   floatingButtons: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     elevation: 5,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
// });

// export default HomeScreen;


import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

// Define a type for location coordinates
interface LocationCoords {
  latitude: number;
  longitude: number;
}

const HomeScreen = () => {
  // Update state type to be either LocationCoords or null
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location ? location.latitude : 37.78825, // Default to an example location
          longitude: location ? location.longitude : -122.4324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="You are here"
          />
        )}
      </MapView>

      {/* Floating Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Weather Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Traffic Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Crash Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;