// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const mapRef = useRef(null);
//   const searchRadius = 500;

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3;
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   };

//   const filterCrashesByLocation = (lat, lon, query = '') => {
//     const filtered = crashesData.filter((crash) => {
//       const distance = getDistance(lat, lon, crash.lat, crash.long);
//       const isWithinRadius = distance <= searchRadius;

//       const queryLower = query.toLowerCase();
//       const matchesQuery =
//         query === '' ||
//         (crash.road || '').toLowerCase().includes(queryLower) ||
//         (crash.village || '').toLowerCase().includes(queryLower) ||
//         (crash.crashLocation || '').toLowerCase().includes(queryLower);

//       return isWithinRadius && matchesQuery;
//     });

//     setFilteredCrashes(filtered);

//     if (filtered.length === 0) {
//       Alert.alert('No Crashes Found', `No crashes found near ${query} within ${searchRadius}m.`);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     // Use Nominatim for geocoding (free and reliable for testing)
//     const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//       searchQuery + ', Uganda'
//     )}&format=json&limit=1`;
//     try {
//       const geoResponse = await fetch(geoUrl, {
//         headers: {
//           'User-Agent': 'DynamicShuttleRouteApp/1.0',
//         },
//       });
//       const geoData = await geoResponse.json();

//       if (geoData && geoData.length > 0) {
//         const { lat, lon } = geoData[0];
//         const newRegion = {
//           latitude: parseFloat(lat),
//           longitude: parseFloat(lon),
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         };

//         setRegion(newRegion);
//         setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//         mapRef.current.animateToRegion(newRegion, 1000);

//         filterCrashesByLocation(parseFloat(lat), parseFloat(lon), searchQuery);
//       } else {
//         Alert.alert('Error', `Location "${searchQuery}" not found in Uganda. Please try a different place.`);
//       }
//     } catch (error) {
//       Alert.alert('Error', `Failed to search location: ${error.message}. Please check your internet connection and try again.`);
//       console.error(error);
//     }
//   };

//   const getVehicleIcon = (vehicleType) => {
//     switch (vehicleType?.toLowerCase()) {
//       case 'motorcycle/tricycle':
//         return 'motorbike';
//       case 'motorcar':
//         return 'car';
//       case 'light omnibus':
//         return 'bus';
//       default:
//         return 'car-side';
//     }
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//       >
//         {marker && (
//           <>
//             <Marker coordinate={marker} pinColor="#FF0000" />
//             <Circle
//               center={marker}
//               radius={searchRadius}
//               strokeColor="rgba(255, 0, 0, 0.5)"
//               fillColor="rgba(255, 0, 0, 0.1)"
//             />
//           </>
//         )}
//         {filteredCrashes.map((crash, index) => (
//           <Marker
//             key={index}
//             coordinate={{ latitude: crash.lat, longitude: crash.long }}
//             pinColor="#FF0000"
//             onPress={() => handleMarkerPress(crash)}
//           />
//         ))}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {selectedCrash && (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>
//                 Crash Details
//               </Text>
//               <Text style={styles.crashDesc}>
//                 {selectedCrash.crashLocation || 'Unknown Location'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Vehicle: {selectedCrash.vehicleType || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Cause: {selectedCrash.causeOfCrash || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Date: {selectedCrash.monthOfCrash || 'Unknown'} {selectedCrash.timeOfCrash || ''}
//               </Text>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {!selectedCrash && !filteredCrashes.length && (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {crashesData.length}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// export default CrashScreen;




// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const mapRef = useRef(null);
//   const searchRadius = 500;

//   // Validate crashes data on load
//   useEffect(() => {
//     const validatedCrashes = crashesData.filter(crash => {
//       return (
//         typeof crash.lat === 'number' && 
//         typeof crash.long === 'number' &&
//         !isNaN(crash.lat) && 
//         !isNaN(crash.long))
//     });
    
//     if (validatedCrashes.length !== crashesData.length) {
//       console.warn('Some crash data was invalid and filtered out');
//     }
//   }, []);

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3;
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   };

//   const filterCrashesByLocation = (lat, lon, query = '') => {
//     try {
//       const filtered = crashesData.filter((crash) => {
//         // Skip if crash coordinates are invalid
//         if (typeof crash.lat !== 'number' || typeof crash.long !== 'number') {
//           return false;
//         }

//         const distance = getDistance(lat, lon, crash.lat, crash.long);
//         const isWithinRadius = distance <= searchRadius;

//         if (!query) return isWithinRadius;

//         const queryLower = query.toLowerCase();
//         const road = crash.road || '';
//         const village = crash.village || '';
//         const crashLocation = crash.crashLocation || '';

//         const matchesQuery = 
//           road.toLowerCase().includes(queryLower) ||
//           village.toLowerCase().includes(queryLower) ||
//           crashLocation.toLowerCase().includes(queryLower);

//         return isWithinRadius && matchesQuery;
//       });

//       setFilteredCrashes(filtered);

//       if (filtered.length === 0 && query) {
//         Alert.alert(
//           'No Crashes Found', 
//           `No crashes found near "${query}" within ${searchRadius}m.`
//         );
//       }
//     } catch (error) {
//       console.error('Error filtering crashes:', error);
//       Alert.alert('Error', 'Failed to filter crashes. Please try again.');
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//       searchQuery + ', Uganda'
//     )}&format=json&limit=1`;
    
//     try {
//       const geoResponse = await fetch(geoUrl, {
//         headers: {
//           'User-Agent': 'DynamicShuttleRouteApp/1.0',
//         },
//       });
//       const geoData = await geoResponse.json();

//       if (geoData && geoData.length > 0) {
//         const { lat, lon } = geoData[0];
//         const newRegion = {
//           latitude: parseFloat(lat),
//           longitude: parseFloat(lon),
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         };

//         setRegion(newRegion);
//         setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//         mapRef.current.animateToRegion(newRegion, 1000);

//         filterCrashesByLocation(parseFloat(lat), parseFloat(lon), searchQuery);
//       } else {
//         Alert.alert(
//           'Error', 
//           `Location "${searchQuery}" not found in Uganda. Please try a different place.`
//         );
//       }
//     } catch (error) {
//       console.error('Geocoding error:', error);
//       Alert.alert(
//         'Error', 
//         'Failed to search location. Please check your internet connection and try again.'
//       );
//     }
//   };

//   const getVehicleIcon = (vehicleType) => {
//     if (!vehicleType) return 'car-side';
    
//     switch (vehicleType.toLowerCase()) {
//       case 'motorcycle/tricycle':
//         return 'motorbike';
//       case 'motorcar':
//         return 'car';
//       case 'light omnibus':
//         return 'bus';
//       default:
//         return 'car-side';
//     }
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//       >
//         {marker && (
//           <>
//             <Marker coordinate={marker} pinColor="#FF0000" />
//             <Circle
//               center={marker}
//               radius={searchRadius}
//               strokeColor="rgba(255, 0, 0, 0.5)"
//               fillColor="rgba(255, 0, 0, 0.1)"
//             />
//           </>
//         )}
//         {filteredCrashes.map((crash, index) => (
//           <Marker
//             key={index}
//             coordinate={{ latitude: crash.lat, longitude: crash.long }}
//             pinColor="#FF0000"
//             onPress={() => handleMarkerPress(crash)}
//           />
//         ))}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {selectedCrash && (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>
//                 Crash Details
//               </Text>
//               <Text style={styles.crashDesc}>
//                 {selectedCrash.crashLocation || 'Unknown Location'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Vehicle: {selectedCrash.vehicleType || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Cause: {selectedCrash.causeOfCrash || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Date: {selectedCrash.monthOfCrash || 'Unknown'} {selectedCrash.timeOfCrash || ''}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Village: {selectedCrash.village || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 Road: {selectedCrash.road || 'Unknown'}
//               </Text>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {!selectedCrash && !filteredCrashes.length && (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {crashesData.length}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// export default CrashScreen;




// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const [totalCrashes, setTotalCrashes] = useState(0);
//   const mapRef = useRef(null);
//   const searchRadius = 5000000;

//   // Validate and count crashes on load
//   useEffect(() => {
//     try {
//       const validCrashes = crashesData.filter(crash => 
//         typeof crash?.lat === 'number' && 
//         typeof crash?.long === 'number' &&
//         !isNaN(crash.lat) && 
//         !isNaN(crash.long)
//       );
//       setTotalCrashes(validCrashes.length);
//     } catch (error) {
//       console.error('Error loading crash data:', error);
//       setTotalCrashes(0);
//     }
//   }, []);

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     try {
//       const R = 6371e3;
//       const φ1 = lat1 * Math.PI/180;
//       const φ2 = lat2 * Math.PI/180;
//       const Δφ = (lat2-lat1) * Math.PI/180;
//       const Δλ = (lon2-lon1) * Math.PI/180;

//       const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//                 Math.cos(φ1) * Math.cos(φ2) *
//                 Math.sin(Δλ/2) * Math.sin(Δλ/2);
//       return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     } catch (error) {
//       console.error('Distance calculation error:', error);
//       return Infinity; // Return large distance if calculation fails
//     }
//   };

//   const safeStringCompare = (str, query) => {
//     try {
//       return str?.toString().toLowerCase().includes(query.toLowerCase()) || false;
//     } catch {
//       return false;
//     }
//   };

//   const filterCrashesByLocation = (lat, lon, query = '') => {
//     try {
//       const filtered = crashesData.filter((crash) => {
//         // Skip invalid crashes
//         if (typeof crash?.lat !== 'number' || typeof crash?.long !== 'number') {
//           return false;
//         }

//         // Calculate distance
//         const distance = getDistance(lat, lon, crash.lat, crash.long);
//         const isWithinRadius = distance <= searchRadius;

//         // If no query, just check radius
//         if (!query.trim()) return isWithinRadius;

//         // Check if matches query
//         const matchesQuery = 
//           safeStringCompare(crash.road, query) ||
//           safeStringCompare(crash.village, query) ||
//           safeStringCompare(crash.crashLocation, query);

//         return isWithinRadius && matchesQuery;
//       });

//       setFilteredCrashes(filtered);

//       if (filtered.length === 0 && query.trim()) {
//         Alert.alert(
//           'No Crashes Found', 
//           `No crashes found near "${query}" within ${searchRadius}m.`
//         );
//       }
//     } catch (error) {
//       console.error('Filtering error:', error);
//       Alert.alert('Error', 'Failed to filter crashes. Please try again.');
//       setFilteredCrashes([]);
//     }
//   };

//   const handleSearch = async () => {
//     const trimmedQuery = searchQuery.trim();
//     if (!trimmedQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     try {
//       const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//         trimmedQuery + ', Uganda'
//       )}&format=json&limit=1`;
      
//       const response = await fetch(geoUrl, {
//         headers: { 'User-Agent': 'DynamicShuttleRouteApp/1.0' },
//       });
//       const data = await response.json();

//       if (!data || data.length === 0) {
//         throw new Error('Location not found');
//       }

//       const { lat, lon } = data[0];
//       const newRegion = {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       };

//       setRegion(newRegion);
//       setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//       mapRef.current?.animateToRegion(newRegion, 1000);
//       filterCrashesByLocation(parseFloat(lat), parseFloat(lon), trimmedQuery);

//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert(
//         'Error', 
//         error.message === 'Location not found' 
//           ? `Location "${searchQuery}" not found in Uganda. Please try a different place.`
//           : 'Failed to search location. Please check your internet connection and try again.'
//       );
//     }
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       // In your MapView component, update the markers section like this:
// <MapView
//   ref={mapRef}
//   provider={PROVIDER_GOOGLE}
//   style={styles.map}
//   initialRegion={initialRegion}
//   onRegionChangeComplete={setRegion}
// >
//   {/* Search location marker */}
//   {marker && (
//     <>
//       <Marker 
//         coordinate={marker} 
//         pinColor="#4285F4" // Blue color for search location
//         title="Search Center"
//       />
//       <Circle
//         center={marker}
//         radius={searchRadius}
//         strokeColor="rgba(66, 133, 244, 0.5)"
//         fillColor="rgba(66, 133, 244, 0.1)"
//       />
//     </>
//   )}

//   {/* Accident markers */}
//   {filteredCrashes.map((crash, index) => (
//     <Marker
//       key={`crash-${crash.lat}-${crash.long}-${index}`}
//       coordinate={{ 
//         latitude: Number(crash.lat), 
//         longitude: Number(crash.long) 
//       }}
//       pinColor="#FF0000" // Red color for accidents
//       title={`Accident: ${crash.vehicleType || 'Unknown vehicle'}`}
//       description={`${crash.crashLocation || 'Unknown location'}`}
//       onPress={() => handleMarkerPress(crash)}
//     >
//       {/* Custom marker icon based on vehicle type */}
//       <View style={{ alignItems: 'center' }}>
//         <Icon 
//           name={getVehicleIcon(crash.vehicleType)} 
//           size={28} 
//           color="#FF0000" 
//         />
//         <View style={{
//           backgroundColor: 'white',
//           borderRadius: 10,
//           paddingHorizontal: 5,
//           marginTop: 2
//         }}>
//           <Text style={{ fontSize: 10, color: '#FF0000' }}>
//             {crash.monthOfCrash?.substring(0, 3) || '???'}
//           </Text>
//         </View>
//       </View>
//     </Marker>
//   ))}
// </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {selectedCrash ? (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>Crash Details</Text>
//               <Text style={styles.crashDesc}>
//                 {selectedCrash.crashLocation || 'Unknown Location'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 <Text style={{fontWeight: 'bold'}}>Vehicle:</Text> {selectedCrash.vehicleType || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 <Text style={{fontWeight: 'bold'}}>Cause:</Text> {selectedCrash.causeOfCrash || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 <Text style={{fontWeight: 'bold'}}>Date:</Text> {selectedCrash.monthOfCrash || 'Unknown'} {selectedCrash.timeOfCrash || ''}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 <Text style={{fontWeight: 'bold'}}>Village:</Text> {selectedCrash.village || 'Unknown'}
//               </Text>
//               <Text style={styles.crashDetail}>
//                 <Text style={{fontWeight: 'bold'}}>Road:</Text> {selectedCrash.road || 'Unknown'}
//               </Text>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       ) : !filteredCrashes.length ? (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {totalCrashes}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       ) : null}
//     </View>
//   );
// };

// export default CrashScreen;







// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const [totalCrashes, setTotalCrashes] = useState(0);
//   const mapRef = useRef(null);
//   const searchRadius = 500; // Changed back to 500 meters

//   // Validate and count crashes on load
//   useEffect(() => {
//     try {
//       const validCrashes = crashesData.filter(crash => 
//         typeof crash?.lat === 'number' && 
//         typeof crash?.long === 'number' &&
//         !isNaN(crash.lat) && 
//         !isNaN(crash.long)
//       );
//       setTotalCrashes(validCrashes.length);
//     } catch (error) {
//       console.error('Error loading crash data:', error);
//       setTotalCrashes(0);
//     }
//   }, []);

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     try {
//       const R = 6371e3;
//       const φ1 = lat1 * Math.PI / 180;
//       const φ2 = lat2 * Math.PI / 180;
//       const Δφ = (lat2 - lat1) * Math.PI / 180;
//       const Δλ = (lon2 - lon1) * Math.PI / 180;

//       const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//                 Math.cos(φ1) * Math.cos(φ2) *
//                 Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//       return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     } catch (error) {
//       console.error('Distance calculation error:', error);
//       return Infinity;
//     }
//   };

//   const safeStringCompare = (str, query) => {
//     try {
//       return str?.toString().toLowerCase().includes(query.toLowerCase()) || false;
//     } catch {
//       return false;
//     }
//   };

//   const filterCrashesByLocation = (lat, lon, query = '') => {
//     try {
//       const filtered = crashesData.filter((crash) => {
//         if (typeof crash?.lat !== 'number' || typeof crash?.long !== 'number') {
//           console.warn(`Invalid coordinates for crash:`, crash);
//           return false;
//         }

//         // Swap lat and long due to incorrect labeling in crashes.json
//         const crashLat = crash.long; // Should be latitude
//         const crashLon = crash.lat;  // Should be longitude

//         const distance = getDistance(lat, lon, crashLat, crashLon);
//         console.log(`Distance from ${lat},${lon} to ${crashLat},${crashLon}: ${distance}m`);
//         const isWithinRadius = distance <= searchRadius;

//         if (!query.trim()) return isWithinRadius;

//         const matchesQuery = 
//           safeStringCompare(crash.road, query) ||
//           safeStringCompare(crash.village, query) ||
//           safeStringCompare(crash.crashLocation, query);

//         return isWithinRadius && matchesQuery;
//       });

//       setFilteredCrashes(filtered);

//       if (filtered.length === 0 && query.trim()) {
//         Alert.alert(
//           'No Crashes Found', 
//           `No crashes found near "${query}" within ${searchRadius}m.`
//         );
//       }
//     } catch (error) {
//       console.error('Filtering error:', error);
//       Alert.alert('Error', 'Failed to filter crashes. Please try again.');
//       setFilteredCrashes([]);
//     }
//   };

//   const handleSearch = async () => {
//     const trimmedQuery = searchQuery.trim();
//     if (!trimmedQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     try {
//       const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//         trimmedQuery + ', Uganda'
//       )}&format=json&limit=1`;
      
//       const response = await fetch(geoUrl, {
//         headers: { 'User-Agent': 'DynamicShuttleRouteApp/1.0' },
//       });
//       const data = await response.json();

//       if (!data || data.length === 0) {
//         throw new Error('Location not found');
//       }

//       const { lat, lon } = data[0];
//       const newRegion = {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       };

//       setRegion(newRegion);
//       setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//       mapRef.current?.animateToRegion(newRegion, 1000);
//       filterCrashesByLocation(parseFloat(lat), parseFloat(lon), trimmedQuery);

//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert(
//         'Error', 
//         error.message === 'Location not found' 
//           ? `Location "${searchQuery}" not found in Uganda. Please try a different place.`
//           : 'Failed to search location. Please check your internet connection and try again.'
//       );
//     }
//   };

//   const getVehicleIcon = (vehicleType) => {
//     if (!vehicleType) return 'car-side';
    
//     const type = vehicleType.toLowerCase();
    
//     if (type.includes('motorcycle') || type.includes('tricycle')) return 'motorbike';
//     if (type.includes('motorcar') || type.includes('car')) return 'car';
//     if (type.includes('bus') || type.includes('omnibus')) return 'bus';
//     if (type.includes('truck') || type.includes('lorry')) return 'truck';
//     if (type.includes('bicycle') || type.includes('cycle')) return 'bicycle';
    
//     return 'car-side';
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//       >
//         {marker && (
//           <>
//             <Marker 
//               coordinate={marker} 
//               pinColor="#4285F4"
//               title="Search Center"
//             />
//             <Circle
//               center={marker}
//               radius={searchRadius}
//               strokeColor="rgba(66, 133, 244, 0.5)"
//               fillColor="rgba(66, 133, 244, 0.1)"
//             />
//           </>
//         )}
//         {filteredCrashes.map((crash, index) => (
//           <Marker
//             key={`crash-${crash.lat}-${crash.long}-${index}`}
//             coordinate={{ 
//               latitude: Number(crash.long), // Swap due to incorrect labeling
//               longitude: Number(crash.lat), 
//             }}
//             pinColor="#FF0000"
//             title={`Accident: ${crash.vehicleType || 'Unknown vehicle'}`}
//             description={`${crash.crashLocation || 'Unknown location'}`}
//             onPress={() => handleMarkerPress(crash)}
//           >
//             <View style={{ alignItems: 'center' }}>
//               <Icon 
//                 name={getVehicleIcon(crash.vehicleType)} 
//                 size={28} 
//                 color="#FF0000" 
//               />
//               <View style={{
//                 backgroundColor: 'white',
//                 borderRadius: 10,
//                 paddingHorizontal: 5,
//                 marginTop: 2
//               }}>
//                 <Text style={{ fontSize: 10, color: '#FF0000' }}>
//                   {crash.monthOfCrash?.substring(0, 3) || '???'}
//                 </Text>
//               </View>
//             </View>
//           </Marker>
//         ))}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {selectedCrash ? (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>
//                 {selectedCrash.crashLocation || 'Accident Details'}
//               </Text>
              
//               <View style={{ 
//                 flexDirection: 'row', 
//                 alignItems: 'center',
//                 marginBottom: 10 
//               }}>
//                 <Icon 
//                   name={getVehicleIcon(selectedCrash.vehicleType)} 
//                   size={24} 
//                   color="#FF0000" 
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={styles.crashDetail}>
//                   {selectedCrash.vehicleType || 'Unknown vehicle type'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Date:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.monthOfCrash || '?'} {selectedCrash.timeOfCrash || ''}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Cause:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.causeOfCrash || 'Unknown'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Road:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.road || 'Unknown road'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Village:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.village || 'Unknown area'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Coordinates:</Text>
//                 <Text style={styles.detailValue}>
//                   {Number(selectedCrash.long).toFixed(6)}, {Number(selectedCrash.lat).toFixed(6)}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       ) : !filteredCrashes.length ? (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {totalCrashes}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       ) : null}
//     </View>
//   );
// };

// export default CrashScreen; 










// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   Modal,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [matchingCrashes, setMatchingCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const [totalCrashes, setTotalCrashes] = useState(0);
//   const [showMatchesOverlay, setShowMatchesOverlay] = useState(false);
//   const [searchCenter, setSearchCenter] = useState(null);
//   const mapRef = useRef(null);
//   const searchRadius = 5000; // 5km for testing

//   // Validate and count crashes on load
//   useEffect(() => {
//     try {
//       const validCrashes = crashesData.filter(crash => 
//         typeof crash?.lat === 'number' && 
//         typeof crash?.long === 'number' &&
//         !isNaN(crash.lat) && 
//         !isNaN(crash.long)
//       );
//       setTotalCrashes(validCrashes.length);
//       console.log(`Total valid crashes: ${validCrashes.length}`);
//       if (validCrashes.length > 0) {
//         console.log('Sample crash 1:', validCrashes[0]);
//         if (validCrashes.length > 1) console.log('Sample crash 2:', validCrashes[1]);
//       }
//     } catch (error) {
//       console.error('Error loading crash data:', error);
//       setTotalCrashes(0);
//     }
//   }, []);

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     try {
//       const R = 6371e3; // Earth's radius in meters
//       const φ1 = lat1 * Math.PI / 180;
//       const φ2 = lat2 * Math.PI / 180;
//       const Δφ = (lat2 - lat1) * Math.PI / 180;
//       const Δλ = (lon2 - lon1) * Math.PI / 180;

//       const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//                 Math.cos(φ1) * Math.cos(φ2) *
//                 Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//       const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       console.log(`Distance between (${lat1}, ${lon1}) and (${lat2}, ${lon2}): ${distance}m`);
//       return distance;
//     } catch (error) {
//       console.error('Distance calculation error:', error);
//       return Infinity;
//     }
//   };

//   const safeStringCompare = (str, query) => {
//     try {
//       const result = str?.toString().toLowerCase().includes(query.toLowerCase()) || false;
//       console.log(`Comparing "${str}" with "${query}": ${result}`);
//       return result;
//     } catch {
//       return false;
//     }
//   };

//   const findMatchingCrashes = (query) => {
//     try {
//       console.log(`Finding crashes matching query: "${query}"`);
//       const matches = crashesData.filter((crash) => {
//         if (typeof crash?.lat !== 'number' || typeof crash?.long !== 'number') {
//           console.warn(`Invalid coordinates for crash:`, crash);
//           return false;
//         }

//         const matchesQuery = 
//           safeStringCompare(crash.road, query) ||
//           safeStringCompare(crash.village, query) ||
//           safeStringCompare(crash.crashLocation, query);
//         console.log(`Crash (Location: ${crash.crashLocation}, Road: ${crash.road}, Village: ${crash.village}) - Matches query "${query}": ${matchesQuery}`);
//         return matchesQuery;
//       });

//       console.log(`Found ${matches.length} crashes matching query`);
//       return matches;
//     } catch (error) {
//       console.error('Error finding matching crashes:', error);
//       return [];
//     }
//   };

//   const filterCrashesByLocation = (lat, lon, crashes) => {
//     try {
//       console.log(`Filtering ${crashes.length} matching crashes near ${lat}, ${lon} within ${searchRadius}m`);
//       const filtered = crashes.filter((crash) => {
//         const crashLat = crash.long; // Should be latitude
//         const crashLon = crash.lat;  // Should be longitude

//         const distance = getDistance(lat, lon, crashLat, crashLon);
//         const isWithinRadius = distance <= searchRadius;
//         console.log(`Crash at ${crashLat}, ${crashLon} (Location: ${crash.crashLocation}) - Distance: ${distance}m, isWithinRadius: ${isWithinRadius}`);
//         return isWithinRadius;
//       });

//       console.log(`Found ${filtered.length} crashes within radius`);
//       setFilteredCrashes(filtered);

//       if (filtered.length === 0) {
//         Alert.alert(
//           'No Crashes Found', 
//           `No crashes found near "${searchQuery}" within ${searchRadius}m.`
//         );
//       }
//     } catch (error) {
//       console.error('Filtering error:', error);
//       Alert.alert('Error', 'Failed to filter crashes. Please try again.');
//       setFilteredCrashes([]);
//     }
//   };

//   const handleSearch = async () => {
//     const trimmedQuery = searchQuery.trim();
//     if (!trimmedQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     try {
//       const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//         trimmedQuery + ', Uganda'
//       )}&format=json&limit=1`;
      
//       const response = await fetch(geoUrl, {
//         headers: { 'User-Agent': 'DynamicShuttleRouteApp/1.0' },
//       });
//       const data = await response.json();

//       if (!data || data.length === 0) {
//         throw new Error('Location not found');
//       }

//       const { lat, lon } = data[0];
//       console.log(`Geocoded "${trimmedQuery}" to ${lat}, ${lon}`);
//       const newRegion = {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       };

//       setRegion(newRegion);
//       setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//       setSearchCenter({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//       mapRef.current?.animateToRegion(newRegion, 1000);

//       // Step 1: Find crashes matching the query
//       const matches = findMatchingCrashes(trimmedQuery);
//       setMatchingCrashes(matches);
//       setShowMatchesOverlay(true);

//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert(
//         'Error', 
//         error.message === 'Location not found' 
//           ? `Location "${searchQuery}" not found in Uganda. Please try a different place.`
//           : 'Failed to search location. Please check your internet connection and try again.'
//       );
//     }
//   };

//   const handleMatchesOverlayClose = () => {
//     setShowMatchesOverlay(false);
//     if (matchingCrashes.length > 0 && searchCenter) {
//       // Step 2: Filter matching crashes by distance and display on map
//       filterCrashesByLocation(searchCenter.latitude, searchCenter.longitude, matchingCrashes);
//     }
//   };

//   const getVehicleIcon = (vehicleType) => {
//     if (!vehicleType) return 'car-side';
    
//     const type = vehicleType.toLowerCase();
    
//     if (type.includes('motorcycle') || type.includes('tricycle')) return 'motorbike';
//     if (type.includes('motorcar') || type.includes('car')) return 'car';
//     if (type.includes('bus') || type.includes('omnibus')) return 'bus';
//     if (type.includes('truck') || type.includes('lorry')) return 'truck';
//     if (type.includes('bicycle') || type.includes('cycle')) return 'bicycle';
    
//     return 'car-side';
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//       >
//         {marker && (
//           <>
//             <Marker 
//               coordinate={marker} 
//               pinColor="#4285F4"
//               title="Search Center"
//             />
//             <Circle
//               center={marker}
//               radius={searchRadius}
//               strokeColor="rgba(66, 133, 244, 0.5)"
//               fillColor="rgba(66, 133, 244, 0.1)"
//             />
//           </>
//         )}
//         {filteredCrashes.map((crash, index) => (
//           <Marker
//             key={`crash-${crash.lat}-${crash.long}-${index}`}
//             coordinate={{ 
//               latitude: Number(crash.long), // Swap due to incorrect labeling
//               longitude: Number(crash.lat), 
//             }}
//             pinColor="#FF0000"
//             title={`Accident: ${crash.vehicleType || 'Unknown vehicle'}`}
//             description={`${crash.crashLocation || 'Unknown location'}`}
//             onPress={() => handleMarkerPress(crash)}
//           >
//             <View style={{ alignItems: 'center' }}>
//               <Icon 
//                 name={getVehicleIcon(crash.vehicleType)} 
//                 size={28} 
//                 color="#FF0000" 
//               />
//               <View style={{
//                 backgroundColor: 'white',
//                 borderRadius: 10,
//                 paddingHorizontal: 5,
//                 marginTop: 2
//               }}>
//                 <Text style={{ fontSize: 10, color: '#FF0000' }}>
//                   {crash.monthOfCrash?.substring(0, 3) || '???'}
//                 </Text>
//               </View>
//             </View>
//           </Marker>
//         ))}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showMatchesOverlay}
//         transparent={true}
//         animationType="fade"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Search Results</Text>
//             <Text style={styles.modalMessage}>
//               Found {matchingCrashes.length} crashes matching "{searchQuery}"
//             </Text>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={handleMatchesOverlayClose}
//             >
//               <Text style={styles.modalButtonText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {selectedCrash ? (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>
//                 {selectedCrash.crashLocation || 'Accident Details'}
//               </Text>
              
//               <View style={{ 
//                 flexDirection: 'row', 
//                 alignItems: 'center',
//                 marginBottom: 10 
//               }}>
//                 <Icon 
//                   name={getVehicleIcon(selectedCrash.vehicleType)} 
//                   size={24} 
//                   color="#FF0000" 
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={styles.crashDetail}>
//                   {selectedCrash.vehicleType || 'Unknown vehicle type'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Date:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.monthOfCrash || '?'} {selectedCrash.timeOfCrash || ''}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Cause:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.causeOfCrash || 'Unknown'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Road:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.road || 'Unknown road'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Village:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.village || 'Unknown area'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Coordinates:</Text>
//                 <Text style={styles.detailValue}>
//                   {Number(selectedCrash.long).toFixed(6)}, {Number(selectedCrash.lat).toFixed(6)}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       ) : !filteredCrashes.length && !showMatchesOverlay ? (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {totalCrashes}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       ) : null}
//     </View>
//   );
// };

// export default CrashScreen;





// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   Modal,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [matchingCrashes, setMatchingCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const [totalCrashes, setTotalCrashes] = useState(0);
//   const [showMatchesOverlay, setShowMatchesOverlay] = useState(false);
//   const mapRef = useRef(null);

//   // Validate and count crashes on load
//   useEffect(() => {
//     try {
//       const validCrashes = crashesData.filter(crash => 
//         typeof crash?.lat === 'number' && 
//         typeof crash?.long === 'number' &&
//         !isNaN(crash.lat) && 
//         !isNaN(crash.long)
//       );
//       setTotalCrashes(validCrashes.length);
//       console.log(`Total valid crashes: ${validCrashes.length}`);
//       if (validCrashes.length > 0) {
//         console.log('Sample crash 1:', validCrashes[0]);
//         if (validCrashes.length > 1) console.log('Sample crash 2:', validCrashes[1]);
//       }
//     } catch (error) {
//       console.error('Error loading crash data:', error);
//       setTotalCrashes(0);
//     }
//   }, []);

//   const safeStringCompare = (str, query) => {
//     try {
//       const result = str?.toString().toLowerCase().includes(query.toLowerCase()) || false;
//       console.log(`Comparing "${str}" with "${query}": ${result}`);
//       return result;
//     } catch {
//       return false;
//     }
//   };

//   const findMatchingCrashes = (query) => {
//     try {
//       console.log(`Finding crashes matching query: "${query}"`);
//       const matches = crashesData.filter((crash) => {
//         if (typeof crash?.lat !== 'number' || typeof crash?.long !== 'number') {
//           console.warn(`Invalid coordinates for crash:`, crash);
//           return false;
//         }

//         const matchesQuery = 
//           safeStringCompare(crash.road, query) ||
//           safeStringCompare(crash.village, query) ||
//           safeStringCompare(crash.crashLocation, query);
//         console.log(`Crash (Location: ${crash.crashLocation}, Road: ${crash.road}, Village: ${crash.village}) - Matches query "${query}": ${matchesQuery}`);
//         return matchesQuery;
//       });

//       console.log(`Found ${matches.length} crashes matching query`);
//       return matches;
//     } catch (error) {
//       console.error('Error finding matching crashes:', error);
//       return [];
//     }
//   };

//   const handleSearch = async () => {
//     const trimmedQuery = searchQuery.trim();
//     if (!trimmedQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     try {
//       const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//         trimmedQuery + ', Uganda'
//       )}&format=json&limit=1`;
      
//       const response = await fetch(geoUrl, {
//         headers: { 'User-Agent': 'DynamicShuttleRouteApp/1.0' },
//       });
//       const data = await response.json();

//       if (!data || data.length === 0) {
//         throw new Error('Location not found');
//       }

//       const { lat, lon } = data[0];
//       console.log(`Geocoded "${trimmedQuery}" to ${lat}, ${lon}`);
//       const newRegion = {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       };

//       setRegion(newRegion);
//       setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//       mapRef.current?.animateToRegion(newRegion, 1000);

//       // Step 1: Find crashes matching the query
//       const matches = findMatchingCrashes(trimmedQuery);
//       setMatchingCrashes(matches);
//       setShowMatchesOverlay(true);

//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert(
//         'Error', 
//         error.message === 'Location not found' 
//           ? `Location "${searchQuery}" not found in Uganda. Please try a different place.`
//           : 'Failed to search location. Please check your internet connection and try again.'
//       );
//     }
//   };

//   const handleMatchesOverlayClose = () => {
//     setShowMatchesOverlay(false);
//     if (matchingCrashes.length > 0) {
//       // Step 2: Display all matching crashes on the map (no radius filtering)
//       setFilteredCrashes(matchingCrashes);
//       console.log(`Displaying ${matchingCrashes.length} matching crashes on the map`);
      
//       if (matchingCrashes.length === 0) {
//         Alert.alert(
//           'No Crashes Found', 
//           `No crashes found matching "${searchQuery}".`
//         );
//       }
//     }
//   };

//   const getVehicleIcon = (vehicleType) => {
//     if (!vehicleType) return 'car-side';
    
//     const type = vehicleType.toLowerCase();
    
//     if (type.includes('motorcycle') || type.includes('tricycle')) return 'motorbike';
//     if (type.includes('motorcar') || type.includes('car')) return 'car';
//     if (type.includes('bus') || type.includes('omnibus')) return 'bus';
//     if (type.includes('truck') || type.includes('lorry')) return 'truck';
//     if (type.includes('bicycle') || type.includes('cycle')) return 'bicycle';
    
//     return 'car-side';
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//       >
//         {marker && (
//           <Marker 
//             coordinate={marker} 
//             pinColor="#4285F4"
//             title="Search Center"
//           />
//         )}
//         {filteredCrashes.map((crash, index) => (
//           <Marker
//             key={`crash-${crash.lat}-${crash.long}-${index}`}
//             coordinate={{ 
//               latitude: Number(crash.lat),
//               longitude: Number(crash.long), 
//             }}
//             pinColor="#FF0000"
//             title={`Accident: ${crash.vehicleType || 'Unknown vehicle'}`}
//             description={`${crash.crashLocation || 'Unknown location'}`}
//             onPress={() => handleMarkerPress(crash)}
//           >
//             <View style={{ alignItems: 'center' }}>
//               <Icon 
//                 name={getVehicleIcon(crash.vehicleType)} 
//                 size={28} 
//                 color="#FF0000" 
//               />
//               <View style={{
//                 backgroundColor: 'white',
//                 borderRadius: 10,
//                 paddingHorizontal: 5,
//                 marginTop: 2
//               }}>
//                 <Text style={{ fontSize: 10, color: '#FF0000' }}>
//                   {crash.monthOfCrash?.substring(0, 3) || '???'}
//                 </Text>
//               </View>
//             </View>
//           </Marker>
//         ))}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showMatchesOverlay}
//         transparent={true}
//         animationType="fade"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Search Results</Text>
//             <Text style={styles.modalMessage}>
//               Found {matchingCrashes.length} crashes matching "{searchQuery}"
//             </Text>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={handleMatchesOverlayClose}
//             >
//               <Text style={styles.modalButtonText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {selectedCrash ? (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>
//                 {selectedCrash.crashLocation || 'Accident Details'}
//               </Text>
              
//               <View style={{ 
//                 flexDirection: 'row', 
//                 alignItems: 'center',
//                 marginBottom: 10 
//               }}>
//                 <Icon 
//                   name={getVehicleIcon(selectedCrash.vehicleType)} 
//                   size={24} 
//                   color="#FF0000" 
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={styles.crashDetail}>
//                   {selectedCrash.vehicleType || 'Unknown vehicle type'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Date:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.monthOfCrash || '?'} {selectedCrash.timeOfCrash || ''}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Cause:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.causeOfCrash || 'Unknown'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Road:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.road || 'Unknown road'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Village:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.village || 'Unknown area'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Coordinates:</Text>
//                 <Text style={styles.detailValue}>
//                   {Number(selectedCrash.lat).toFixed(6)}, {Number(selectedCrash.long).toFixed(6)}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       ) : !filteredCrashes.length && !showMatchesOverlay ? (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {totalCrashes}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       ) : null}
//     </View>
//   );
// };

// export default CrashScreen;







// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   Modal,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import styles from './styles/CrashScreenStyles';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState([]);
//   const [matchingCrashes, setMatchingCrashes] = useState([]);
//   const [selectedCrash, setSelectedCrash] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const [totalCrashes, setTotalCrashes] = useState(0);
//   const [showMatchesOverlay, setShowMatchesOverlay] = useState(false);
//   const mapRef = useRef(null);

//   // Validate and count crashes on load
//   useEffect(() => {
//     try {
//       const validCrashes = crashesData.filter(crash => 
//         typeof crash?.lat === 'number' && 
//         typeof crash?.long === 'number' &&
//         !isNaN(crash.lat) && 
//         !isNaN(crash.long)
//       );
//       setTotalCrashes(validCrashes.length);
//       console.log(`Total valid crashes: ${validCrashes.length}`);
//       if (validCrashes.length > 0) {
//         console.log('Sample crash 1:', validCrashes[0]);
//         if (validCrashes.length > 1) console.log('Sample crash 2:', validCrashes[1]);
//       }
//     } catch (error) {
//       console.error('Error loading crash data:', error);
//       setTotalCrashes(0);
//     }
//   }, []);

//   const safeStringCompare = (str, query) => {
//     try {
//       const result = str?.toString().toLowerCase().includes(query.toLowerCase()) || false;
//       console.log(`Comparing "${str}" with "${query}": ${result}`);
//       return result;
//     } catch {
//       return false;
//     }
//   };

//   const findMatchingCrashes = (query) => {
//     try {
//       console.log(`Finding crashes matching query: "${query}"`);
//       const matches = crashesData.filter((crash) => {
//         if (typeof crash?.lat !== 'number' || typeof crash?.long !== 'number') {
//           console.warn(`Invalid coordinates for crash:`, crash);
//           return false;
//         }

//         const matchesQuery = 
//           safeStringCompare(crash.road, query) ||
//           safeStringCompare(crash.village, query) ||
//           safeStringCompare(crash.crashLocation, query);
//         console.log(`Crash (Location: ${crash.crashLocation}, Road: ${crash.road}, Village: ${crash.village}, Lat: ${crash.lat}, Long: ${crash.long}) - Matches query "${query}": ${matchesQuery}`);
//         return matchesQuery;
//       });

//       console.log(`Found ${matches.length} crashes matching query`);
//       return matches;
//     } catch (error) {
//       console.error('Error finding matching crashes:', error);
//       return [];
//     }
//   };

//   const fitMapToMarkers = (crashes) => {
//     if (crashes.length === 0 || !mapRef.current) return;

//     const coordinates = crashes.map(crash => ({
//       latitude: Number(crash.long), // Swap lat and long for correct mapping
//       longitude: Number(crash.lat),
//     }));

//     if (marker) {
//       coordinates.push(marker);
//     }

//     if (coordinates.length === 1) {
//       // If only one marker, center on it with a default zoom
//       mapRef.current.animateToRegion({
//         latitude: coordinates[0].latitude,
//         longitude: coordinates[0].longitude,
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       }, 1000);
//     } else if (coordinates.length > 1) {
//       // Fit map to include all markers
//       mapRef.current.fitToCoordinates(coordinates, {
//         edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//         animated: true,
//       });
//     }
//   };

//   const handleSearch = async () => {
//     const trimmedQuery = searchQuery.trim();
//     if (!trimmedQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     try {
//       const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//         trimmedQuery + ', Uganda'
//       )}&format=json&limit=1`;
      
//       const response = await fetch(geoUrl, {
//         headers: { 'User-Agent': 'DynamicShuttleRouteApp/1.0' },
//       });
//       const data = await response.json();

//       if (!data || data.length === 0) {
//         throw new Error('Location not found');
//       }

//       const { lat, lon } = data[0];
//       console.log(`Geocoded "${trimmedQuery}" to ${lat}, ${lon}`);
//       const newRegion = {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       };

//       setRegion(newRegion);
//       setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
//       mapRef.current?.animateToRegion(newRegion, 1000);

//       // Step 1: Find crashes matching the query
//       const matches = findMatchingCrashes(trimmedQuery);
//       setMatchingCrashes(matches);
//       setShowMatchesOverlay(true);

//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert(
//         'Error', 
//         error.message === 'Location not found' 
//           ? `Location "${searchQuery}" not found in Uganda. Please try a different place.`
//           : 'Failed to search location. Please check your internet connection and try again.'
//       );
//     }
//   };

//   const handleMatchesOverlayClose = () => {
//     setShowMatchesOverlay(false);
//     if (matchingCrashes.length > 0) {
//       // Step 2: Display all matching crashes on the map
//       setFilteredCrashes(matchingCrashes);
//       console.log(`Displaying ${matchingCrashes.length} matching crashes on the map`);
//       matchingCrashes.forEach((crash, index) => {
//         console.log(`Marker ${index + 1}: Lat: ${crash.long}, Long: ${crash.lat} (Location: ${crash.crashLocation})`);
//       });

//       // Step 3: Adjust map to fit all markers
//       fitMapToMarkers(matchingCrashes);
      
//       if (matchingCrashes.length === 0) {
//         Alert.alert(
//           'No Crashes Found', 
//           `No crashes found matching "${searchQuery}".`
//         );
//       }
//     }
//   };

//   const getVehicleIcon = (vehicleType) => {
//     if (!vehicleType) return 'car-side';
    
//     const type = vehicleType.toLowerCase();
    
//     if (type.includes('motorcycle') || type.includes('tricycle')) return 'motorbike';
//     if (type.includes('motorcar') || type.includes('car')) return 'car';
//     if (type.includes('bus') || type.includes('omnibus')) return 'bus';
//     if (type.includes('truck') || type.includes('lorry')) return 'truck';
//     if (type.includes('bicycle') || type.includes('cycle')) return 'bicycle';
    
//     return 'car-side';
//   };

//   const handleMarkerPress = (crash) => {
//     setSelectedCrash(crash);
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//       >
//         {marker && (
//           <Marker 
//             coordinate={marker} 
//             pinColor="#4285F4"
//             title="Search Center"
//           />
//         )}
//         {filteredCrashes.map((crash, index) => (
//           <Marker
//             key={`crash-${index}`}
//             coordinate={{ 
//               latitude: Number(crash.long), // Swap lat and long for correct mapping
//               longitude: Number(crash.lat), 
//             }}
//             pinColor="#FF0000"
//             title={`Accident: ${crash.vehicleType || 'Unknown vehicle'}`}
//             description={`${crash.crashLocation || 'Unknown location'}`}
//             onPress={() => handleMarkerPress(crash)}
//           >
//             <View style={{ alignItems: 'center' }}>
//               <Icon 
//                 name={getVehicleIcon(crash.vehicleType)} 
//                 size={28} 
//                 color="#FF0000" 
//               />
//               <View style={{
//                 backgroundColor: 'white',
//                 borderRadius: 10,
//                 paddingHorizontal: 5,
//                 marginTop: 2
//               }}>
//                 <Text style={{ fontSize: 10, color: '#FF0000' }}>
//                   {crash.monthOfCrash?.substring(0, 3) || '???'}
//                 </Text>
//               </View>
//             </View>
//           </Marker>
//         ))}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showMatchesOverlay}
//         transparent={true}
//         animationType="fade"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Search Results</Text>
//             <Text style={styles.modalMessage}>
//               Found {matchingCrashes.length} crashes matching "{searchQuery}"
//             </Text>
//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={handleMatchesOverlayClose}
//             >
//               <Text style={styles.modalButtonText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {selectedCrash ? (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.location}>
//                 {selectedCrash.crashLocation || 'Accident Details'}
//               </Text>
              
//               <View style={{ 
//                 flexDirection: 'row', 
//                 alignItems: 'center',
//                 marginBottom: 10 
//               }}>
//                 <Icon 
//                   name={getVehicleIcon(selectedCrash.vehicleType)} 
//                   size={24} 
//                   color="#FF0000" 
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={styles.crashDetail}>
//                   {selectedCrash.vehicleType || 'Unknown vehicle type'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Date:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.monthOfCrash || '?'} {selectedCrash.timeOfCrash || ''}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Cause:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.causeOfCrash || 'Unknown'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Road:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.road || 'Unknown road'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Village:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.village || 'Unknown area'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Coordinates:</Text>
//                 <Text style={styles.detailValue}>
//                   {Number(selectedCrash.lat).toFixed(6)}, {Number(selectedCrash.long).toFixed(6)}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.cancelIconContainer}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={24} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       ) : !filteredCrashes.length && !showMatchesOverlay ? (
//         <View style={styles.defaultCrash}>
//           <Text style={styles.defaultTitle}>Crash Statistics</Text>
//           <View style={styles.defaultCard}>
//             <Text style={styles.location}>
//               Total Crashes in Dataset
//             </Text>
//             <Text style={styles.location}>
//               {totalCrashes}
//             </Text>
//             <Text style={styles.crashDesc}>
//               Search for a place to see nearby crashes
//             </Text>
//           </View>
//         </View>
//       ) : null}
//     </View>
//   );
// };

// export default CrashScreen;




import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles/CrashScreenStyles';
import crashesData from '../data/crashes.json';

const CrashScreen = () => {
  const initialRegion = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState(initialRegion);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCrashes, setFilteredCrashes] = useState([]);
  const [matchingCrashes, setMatchingCrashes] = useState([]);
  const [selectedCrash, setSelectedCrash] = useState(null);
  const [marker, setMarker] = useState(null);
  const [totalCrashes, setTotalCrashes] = useState(0);
  const [showMatchesOverlay, setShowMatchesOverlay] = useState(false);
  const mapRef = useRef(null);

  // Validate and count crashes on load
  useEffect(() => {
    try {
      const validCrashes = crashesData.filter(crash => 
        typeof crash?.lat === 'number' && 
        typeof crash?.long === 'number' &&
        !isNaN(crash.lat) && 
        !isNaN(crash.long)
      );
      setTotalCrashes(validCrashes.length);
      console.log(`Total valid crashes: ${validCrashes.length}`);
      if (validCrashes.length > 0) {
        console.log('Sample crash 1:', validCrashes[0]);
        if (validCrashes.length > 1) console.log('Sample crash 2:', validCrashes[1]);
      }
    } catch (error) {
      console.error('Error loading crash data:', error);
      setTotalCrashes(0);
    }
  }, []);

  const safeStringCompare = (str, query) => {
    try {
      const result = str?.toString().toLowerCase().includes(query.toLowerCase()) || false;
      console.log(`Comparing "${str}" with "${query}": ${result}`);
      return result;
    } catch {
      return false;
    }
  };

  const findMatchingCrashes = (query) => {
    try {
      console.log(`Finding crashes matching query: "${query}"`);
      const matches = crashesData.filter((crash) => {
        if (typeof crash?.lat !== 'number' || typeof crash?.long !== 'number') {
          console.warn(`Invalid coordinates for crash:`, crash);
          return false;
        }

        const matchesQuery = 
          safeStringCompare(crash.road, query) ||
          safeStringCompare(crash.village, query) ||
          safeStringCompare(crash.crashLocation, query);
        console.log(`Crash (Location: ${crash.crashLocation}, Road: ${crash.road}, Village: ${crash.village}, Lat: ${crash.lat}, Long: ${crash.long}) - Matches query "${query}": ${matchesQuery}`);
        return matchesQuery;
    });

      console.log(`Found ${matches.length} crashes matching query`);
      return matches;
    } catch (error) {
      console.error('Error finding matching crashes:', error);
      return [];
    }
  };

  const fitMapToMarkers = (crashes) => {
    if (crashes.length === 0 || !mapRef.current) return;

    const coordinates = crashes.map(crash => ({
      latitude: Number(crash.long), // Swap lat and long for correct mapping
      longitude: Number(crash.lat),
    }));

    if (marker) {
      coordinates.push(marker);
    }

    if (coordinates.length === 1) {
      mapRef.current.animateToRegion({
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    } else if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        trimmedQuery + ', Uganda'
      )}&format=json&limit=1`;
      
      console.log('Fetching geocoding data...');
      const response = await fetch(geoUrl, {
        headers: { 'User-Agent': 'DynamicShuttleRouteApp/1.0' },
      });
      const data = await response.json();
      console.log('Geocoding response:', data);

      if (!data || data.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lon } = data[0];
      console.log(`Geocoded "${trimmedQuery}" to ${lat}, ${lon}`);
      const newRegion = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setRegion(newRegion);
      setMarker({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Find crashes matching the query
      const matches = findMatchingCrashes(trimmedQuery);
      setMatchingCrashes(matches);
      console.log('Setting showMatchesOverlay to true');
      setShowMatchesOverlay(true); // Show the modal

    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Error', 
        error.message === 'Location not found' 
          ? `Location "${searchQuery}" not found in Uganda. Please try a different place.`
          : 'Failed to search location. Please check your internet connection and try again.'
      );
    }
  };

  const handleMatchesOverlayClose = () => {
    console.log('Closing matches overlay');
    setShowMatchesOverlay(false);
    if (matchingCrashes.length > 0) {
      // Display all matching crashes on the map
      setFilteredCrashes(matchingCrashes);
      console.log(`Displaying ${matchingCrashes.length} matching crashes on the map`);
      matchingCrashes.forEach((crash, index) => {
        console.log(`Marker ${index + 1}: Lat: ${crash.long}, Long: ${crash.lat} (Location: ${crash.crashLocation})`);
      });

      // Adjust map to fit all markers
      fitMapToMarkers(matchingCrashes);
      
      if (matchingCrashes.length === 0) {
        Alert.alert(
          'No Crashes Found', 
          `No crashes found matching "${searchQuery}".`
        );
      }
    }
  };

  const getVehicleIcon = (vehicleType) => {
    if (!vehicleType) return 'car-side';
    
    const type = vehicleType.toLowerCase();
    
    if (type.includes('motorcycle') || type.includes('tricycle')) return 'motorbike';
    if (type.includes('motorcar') || type.includes('car')) return 'car';
    if (type.includes('bus') || type.includes('omnibus')) return 'bus';
    if (type.includes('truck') || type.includes('lorry')) return 'truck';
    if (type.includes('bicycle') || type.includes('cycle')) return 'bicycle';
    
    return 'car-side';
  };

  const handleMarkerPress = (crash) => {
    setSelectedCrash(crash);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
      >
        {marker && (
          <Marker 
            coordinate={marker} 
            pinColor="#4285F4"
            title="Search Center"
          />
        )}
        {filteredCrashes.map((crash, index) => (
          <Marker
            key={`crash-${index}`}
            coordinate={{ 
              latitude: Number(crash.long), // Swap lat and long for correct mapping
              longitude: Number(crash.lat), 
            }}
            pinColor="#FF0000"
            title={`Accident: ${crash.vehicleType || 'Unknown vehicle'}`}
            description={`${crash.crashLocation || 'Unknown location'}`}
            onPress={() => handleMarkerPress(crash)}
          >
            <View style={{ alignItems: 'center' }}>
              <Icon 
                name={getVehicleIcon(crash.vehicleType)} 
                size={28} 
                color="#FF0000" 
              />
              <View style={{
                backgroundColor: 'white',
                borderRadius: 10,
                paddingHorizontal: 5,
                marginTop: 2
              }}>
                <Text style={{ fontSize: 10, color: '#FF0000' }}>
                  {crash.monthOfCrash?.substring(0, 3) || '???'}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a place (e.g., Jinja Road)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="magnify" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showMatchesOverlay && (
        <Modal
          visible={showMatchesOverlay}
          transparent={true}
          animationType="fade"
          onRequestClose={handleMatchesOverlayClose}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Search Results</Text>
              <Text style={styles.modalMessage}>
                Found {matchingCrashes.length} crashes matching "{searchQuery}"
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleMatchesOverlayClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {selectedCrash ? (
        <View style={styles.crashOverlay}>
          <ScrollView>
            <View style={styles.crashCard}>
              <Text style={styles.location}>
                {selectedCrash.crashLocation || 'Accident Details'}
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                marginBottom: 10 
              }}>
                <Icon 
                  name={getVehicleIcon(selectedCrash.vehicleType)} 
                  size={24} 
                  color="#FF0000" 
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.crashDetail}>
                  {selectedCrash.vehicleType || 'Unknown vehicle type'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.monthOfCrash || '?'} {selectedCrash.timeOfCrash || ''}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cause:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.causeOfCrash || 'Unknown'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Road:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.road || 'Unknown road'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Village:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.village || 'Unknown area'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coordinates:</Text>
                <Text style={styles.detailValue}>
                  {Number(selectedCrash.lat).toFixed(6)}, {Number(selectedCrash.long).toFixed(6)}
                </Text>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.cancelIconContainer}
            onPress={() => setSelectedCrash(null)}
          >
            <Icon name="close-circle" size={24} color="#FF0000" />
          </TouchableOpacity>
        </View>
      ) : !filteredCrashes.length && !showMatchesOverlay ? (
        <View style={styles.defaultCrash}>
          <Text style={styles.defaultTitle}>Crash Statistics</Text>
          <View style={styles.defaultCard}>
            <Text style={styles.location}>
              Total Crashes in Dataset
            </Text>
            <Text style={styles.location}>
              {totalCrashes}
            </Text>
            <Text style={styles.crashDesc}>
              Search for a place to see nearby crashes
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default CrashScreen;