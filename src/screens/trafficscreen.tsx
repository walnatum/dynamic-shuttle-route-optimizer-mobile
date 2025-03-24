// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// const TrafficScreen = () => {
//   // Initial region set to Kampala, Uganda
//   const initialRegion = {
//     latitude: 0.3476,         // Kampala's latitude
//     longitude: 32.5825,       // Kampala's longitude
//     latitudeDelta: 0.0922,    // Approx zoom level 13 (adjusted for consistency)
//     longitudeDelta: 0.0421,   // Approx zoom level 13
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE} // Use Google Maps
//         style={styles.map}
//         initialRegion={initialRegion}
//         showsTraffic={true} // Show traffic layer
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject, // Fills the entire screen
//   },
// });

// export default TrafficScreen;




// import React, { useState, useEffect } from 'react';
// import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

// const TrafficScreen = () => {
//   // Initial region set to Kampala, Uganda
//   const initialRegion = {
//     latitude: 0.3476,         // Kampala's latitude
//     longitude: 32.5825,       // Kampala's longitude
//     latitudeDelta: 0.0922,    // Approx zoom level 13
//     longitudeDelta: 0.0421,   // Approx zoom level 13
//   };

//   const [trafficData, setTrafficData] = useState([]); // Store traffic data
//   const [showTrafficData, setShowTrafficData] = useState(false); // Toggle visibility
//   const apiKey = 'AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg'; // Replace with your API key (e.g., AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg)

//   // Sample start and end points in Kampala for demonstration
//   const startPoint = 'City Square, Kampala, Uganda';
//   const endPoint = 'Makerere University, Kampala, Uganda';

//   // Function to fetch traffic data
//   const fetchTrafficData = async () => {
//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
//       startPoint
//     )}&destination=${encodeURIComponent(endPoint)}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status === 'OK') {
//         const legs = data.routes[0].legs[0];
//         const steps = legs.steps;

//         // Extract traffic info from each step
//         const extractedTraffic = steps.map((step, index) => {
//           const distance = step.distance.value; // in meters
//           const duration = step.duration.value; // in seconds
//           const durationInTraffic = step.duration_in_traffic?.value || duration; // in seconds
//           const speed = distance / durationInTraffic; // meters per second
//           const roadName = step.html_instructions.replace(/<[^>]*>/g, ""); // Strip HTML tags

//           // Define traffic condition based on speed (example threshold: 5 m/s ~ 18 km/h)
//           const trafficCondition = speed < 5 ? 'Congested' : 'Free';

//           return {
//             road: roadName,
//             speedKmh: (speed * 3.6).toFixed(2), // Convert to km/h
//             trafficCondition,
//             startLat: step.start_location.lat,
//             startLng: step.start_location.lng,
//             endLat: step.end_location.lat,
//             endLng: step.end_location.lng,
//             durationInTraffic: durationInTraffic / 60, // Convert to minutes
//           };
//         });

//         setTrafficData(extractedTraffic);
//         console.log('Real-time Traffic Data:', extractedTraffic);
//       } else {
//         Alert.alert('Error', `Failed to fetch traffic data: ${data.status}`);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch traffic data. Check your connection or API key.');
//       console.error(error);
//     }
//   };

//   // Fetch traffic data on component mount and every 5 minutes
//   useEffect(() => {
//     fetchTrafficData(); // Initial fetch
//     const interval = setInterval(fetchTrafficData, 5 * 60 * 1000); // Refresh every 5 minutes

//     return () => clearInterval(interval); // Cleanup on unmount
//   }, []);

//   // Decode polyline for visualization (if needed)
//   const decodePolyline = (encoded) => {
//     let points = [];
//     let index = 0, len = encoded.length;
//     let lat = 0, lng = 0;

//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
//       lng += dlng;

//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   // Toggle traffic data visibility
//   const toggleTrafficData = () => {
//     setShowTrafficData(!showTrafficData);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         showsTraffic={true}
//       >
//         {/* Optional: Visualize traffic route */}
//         {trafficData.length > 0 && (
//           <Polyline
//             coordinates={trafficData.map((step) => ({
//               latitude: step.startLat,
//               longitude: step.startLng,
//             }))}
//             strokeColor="#FF0000"
//             strokeWidth={4}
//           />
//         )}
//       </MapView>

//       {/* Button to show traffic data */}
//       <TouchableOpacity style={styles.showDataButton} onPress={toggleTrafficData}>
//         <Text style={styles.buttonText}>
//           {showTrafficData ? 'Hide Traffic Data' : 'Show Traffic Data'}
//         </Text>
//       </TouchableOpacity>

//       {/* Display traffic data when toggled */}
//       {showTrafficData && trafficData.length > 0 && (
//         <View style={styles.trafficInfo}>
//           <Text style={styles.trafficTitle}>Real-Time Traffic Data:</Text>
//           {trafficData.map((data, index) => (
//             <Text key={index} style={styles.trafficText}>
//               {data.road}: {data.trafficCondition} ({data.speedKmh} km/h, {data.durationInTraffic.toFixed(1)} min)
//             </Text>
//           ))}
//         </View>
//       )}

//       {/* Display message if no data yet */}
//       {showTrafficData && trafficData.length === 0 && (
//         <View style={styles.trafficInfo}>
//           <Text style={styles.trafficText}>Fetching traffic data...</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   showDataButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: '#007AFF',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     elevation: 5,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   trafficInfo: {
//     position: 'absolute',
//     bottom: 10,
//     left: 10,
//     right: 10,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     padding: 10,
//     borderRadius: 5,
//     maxHeight: '50%', // Limit height to avoid covering the map
//   },
//   trafficTitle: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   trafficText: {
//     fontSize: 12,
//     color: '#333',
//   },
// });

// export default TrafficScreen;




// import React, { useState, useEffect } from 'react';
// import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// const TrafficScreen = () => {
//   // Initial region set to Kampala, Uganda
//   const initialRegion = {
//     latitude: 0.3476,         // Kampala's latitude
//     longitude: 32.5825,       // Kampala's longitude
//     latitudeDelta: 0.0922,    // Approx zoom level 13
//     longitudeDelta: 0.0421,   // Approx zoom level 13
//   };

//   const [trafficData, setTrafficData] = useState([]); // Store traffic data
//   const [showTrafficData, setShowTrafficData] = useState(false); // Toggle visibility
//   const apiKey = 'AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg'; // Replace with your API key (e.g., AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg)

//   // Sample start and end points in Kampala for demonstration
//   const startPoint = 'City Square, Kampala, Uganda';
//   const endPoint = 'Makerere University, Kampala, Uganda';

//   // Function to fetch traffic data
//   const fetchTrafficData = async () => {
//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
//       startPoint
//     )}&destination=${encodeURIComponent(endPoint)}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status === 'OK') {
//         const legs = data.routes[0].legs[0];
//         const steps = legs.steps;

//         // Extract traffic info from each step
//         const extractedTraffic = steps.map((step, index) => {
//           const distance = step.distance.value; // in meters
//           const duration = step.duration.value; // in seconds
//           const durationInTraffic = step.duration_in_traffic?.value || duration; // in seconds
//           const speed = distance / durationInTraffic; // meters per second
//           const roadName = step.html_instructions.replace(/<[^>]*>/g, ""); // Strip HTML tags

//           // Define traffic condition based on speed
//           let trafficCondition;
//           if (speed < 5) {
//             trafficCondition = 'Congested'; // < 18 km/h
//           } else if (speed >= 5 && speed <= 10) {
//             trafficCondition = 'Medium'; // 18-36 km/h
//           } else {
//             trafficCondition = 'Free'; // > 36 km/h
//           }

//           return {
//             road: roadName,
//             trafficCondition,
//             speedKmh: (speed * 3.6).toFixed(2), // Convert to km/h for reference
//           };
//         });

//         setTrafficData(extractedTraffic);
//         console.log('Real-time Traffic Data:', extractedTraffic);
//       } else {
//         Alert.alert('Error', `Failed to fetch traffic data: ${data.status}`);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch traffic data. Check your connection or API key.');
//       console.error(error);
//     }
//   };

//   // Fetch traffic data on component mount and every 5 minutes
//   useEffect(() => {
//     fetchTrafficData(); // Initial fetch
//     const interval = setInterval(fetchTrafficData, 5 * 60 * 1000); // Refresh every 5 minutes

//     return () => clearInterval(interval); // Cleanup on unmount
//   }, []);

//   // Toggle traffic data visibility
//   const toggleTrafficData = () => {
//     setShowTrafficData(!showTrafficData);
//   };

//   // Close the overlay
//   const closeTrafficData = () => {
//     setShowTrafficData(false);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         showsTraffic={true}
//       />

//       {/* Button to show traffic data */}
//       <TouchableOpacity style={styles.showDataButton} onPress={toggleTrafficData}>
//         <Text style={styles.buttonText}>
//           {showTrafficData ? 'Hide Traffic Data' : 'Show Traffic Data'}
//         </Text>
//       </TouchableOpacity>

//       {/* Display traffic data when toggled */}
//       {showTrafficData && trafficData.length > 0 && (
//         <View style={styles.trafficInfo}>
//           <Text style={styles.trafficTitle}>Real-Time Traffic Data:</Text>
//           {trafficData.map((data, index) => (
//             <Text key={index} style={styles.trafficText}>
//               {data.road} - {data.trafficCondition}
//             </Text>
//           ))}
//           {/* Cancel button */}
//           <TouchableOpacity style={styles.cancelButton} onPress={closeTrafficData}>
//             <Text style={styles.cancelButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Display message if no data yet */}
//       {showTrafficData && trafficData.length === 0 && (
//         <View style={styles.trafficInfo}>
//           <Text style={styles.trafficText}>Fetching traffic data...</Text>
//           {/* Cancel button */}
//           <TouchableOpacity style={styles.cancelButton} onPress={closeTrafficData}>
//             <Text style={styles.cancelButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   showDataButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: '#007AFF',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     elevation: 5,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   trafficInfo: {
//     position: 'absolute',
//     bottom: 10,
//     left: 10,
//     right: 10,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     padding: 10,
//     borderRadius: 5,
//     maxHeight: '50%', // Limit height to avoid covering the map
//     alignItems: 'center', // Center the content
//   },
//   trafficTitle: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   trafficText: {
//     fontSize: 12,
//     color: '#333',
//     marginVertical: 2,
//   },
//   cancelButton: {
//     backgroundColor: '#FF2D55', // Red color consistent with your HomeScreen
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     marginTop: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     elevation: 5,
//   },
//   cancelButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });

// export default TrafficScreen;





import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const TrafficScreen = () => {
  // Initial region set to Kampala, Uganda
  const initialRegion = {
    latitude: 0.3476,         // Kampala's latitude
    longitude: 32.5825,       // Kampala's longitude
    latitudeDelta: 0.0922,    // Approx zoom level 13
    longitudeDelta: 0.0421,   // Approx zoom level 13
  };

  const [trafficData, setTrafficData] = useState([]); // Store traffic data
  const [showTrafficData, setShowTrafficData] = useState(false); // Toggle visibility
  const [region, setRegion] = useState(initialRegion); // Track current map region
  const mapRef = useRef(null); // Reference to MapView
  const apiKey = 'AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg'; // Replace with your API key

  // Function to fetch traffic data based on current map center
  const fetchTrafficData = async (centerLat, centerLng) => {
    // Define dynamic start and end points around the center (e.g., ±0.01 degrees ~ 1 km)
    const startLat = centerLat - 0.01;
    const startLng = centerLng - 0.01;
    const endLat = centerLat + 0.01;
    const endLng = centerLng + 0.01;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const legs = data.routes[0].legs[0];
        const steps = legs.steps;

        // Extract traffic info from each step
        const extractedTraffic = steps.map((step, index) => {
          const distance = step.distance.value; // in meters
          const duration = step.duration.value; // in seconds
          const durationInTraffic = step.duration_in_traffic?.value || duration; // in seconds
          const speed = distance / durationInTraffic; // meters per second
          const roadName = step.html_instructions.replace(/<[^>]*>/g, ""); // Strip HTML tags

          // Define traffic condition based on speed
          let trafficCondition;
          if (speed < 5) {
            trafficCondition = 'Congested'; // < 18 km/h
          } else if (speed >= 5 && speed <= 10) {
            trafficCondition = 'Medium'; // 18-36 km/h
          } else {
            trafficCondition = 'Free'; // > 36 km/h
          }

          return {
            road: roadName,
            trafficCondition,
            speedKmh: (speed * 3.6).toFixed(2), // Convert to km/h for reference
          };
        });

        setTrafficData(extractedTraffic);
        console.log('Real-time Traffic Data:', extractedTraffic);
      } else {
        Alert.alert('Error', `Failed to fetch traffic data: ${data.status}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch traffic data. Check your connection or API key.');
      console.error(error);
    }
  };

  // Fetch traffic data initially and on region change
  useEffect(() => {
    fetchTrafficData(initialRegion.latitude, initialRegion.longitude); // Initial fetch
    const interval = setInterval(() => {
      fetchTrafficData(region.latitude, region.longitude); // Refresh every 5 minutes based on current center
    }, 5 * 60 * 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [region]); // Re-run when region changes

  // Update region when user moves the map
  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
    fetchTrafficData(newRegion.latitude, newRegion.longitude); // Fetch new data immediately
  };

  // Toggle traffic data visibility
  const toggleTrafficData = () => {
    setShowTrafficData(!showTrafficData);
  };

  // Close the overlay
  const closeTrafficData = () => {
    setShowTrafficData(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsTraffic={true}
        onRegionChangeComplete={onRegionChangeComplete} // Detect map movement
      />

      {/* Button to show traffic data */}
      <TouchableOpacity style={styles.showDataButton} onPress={toggleTrafficData}>
        <Text style={styles.buttonText}>
          {showTrafficData ? 'Hide Traffic Data' : 'Show Traffic Data'}
        </Text>
      </TouchableOpacity>

      {/* Display traffic data when toggled */}
      {showTrafficData && trafficData.length > 0 && (
        <View style={styles.trafficInfo}>
          <Text style={styles.trafficTitle}>Real-Time Traffic Data:</Text>
          {trafficData.map((data, index) => (
            <Text key={index} style={styles.trafficText}>
              {data.road} - {data.trafficCondition}
            </Text>
          ))}
          {/* Cancel button */}
          <TouchableOpacity style={styles.cancelButton} onPress={closeTrafficData}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Display message if no data yet */}
      {showTrafficData && trafficData.length === 0 && (
        <View style={styles.trafficInfo}>
          <Text style={styles.trafficText}>Fetching traffic data...</Text>
          {/* Cancel button */}
          <TouchableOpacity style={styles.cancelButton} onPress={closeTrafficData}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  showDataButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  trafficInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 5,
    maxHeight: '50%', // Limit height to avoid covering the map
    alignItems: 'center', // Center the content
  },
  trafficTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trafficText: {
    fontSize: 12,
    color: '#333',
    marginVertical: 2,
  },
  cancelButton: {
    backgroundColor: '#FF2D55',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TrafficScreen;