// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Button,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   TextInput,
//   ScrollView,
//   Dimensions,
// } from "react-native";
// import { useNavigation, NavigationProp } from "@react-navigation/native";
// import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
// import LinearGradient from "react-native-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Geolocation from '@react-native-community/geolocation';
// import { Linking } from 'react-native';
// import styles from "./styles/ParentScreenStyles";
// import PullUpPanel from "./PullUpPanel";

// export type RootStackParamList = {
//   HomeScreen: undefined;
//   ParentScreen: undefined;
//   RouteTrackerScreen: undefined;
//   TrafficScreen: undefined;
//   WeatherScreen: undefined;
// };

// const ParentScreen = () => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();
//   const mapRef = useRef<MapView>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
//   const [start, setStart] = useState<string>("");
//   const [end, setEnd] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [parkingMarkers, setParkingMarkers] = useState<{ name: string; latitude: number; longitude: number }[]>([]);
//   const [searchMarkers, setSearchMarkers] = useState<{ name: string; latitude: number; longitude: number }[]>([]);
//   const [travelTimes, setTravelTimes] = useState<string[]>([]);
//   const [showRouteInput, setShowRouteInput] = useState<boolean>(false);
//   const [travelTimesByMode, setTravelTimesByMode] = useState<{ [key: string]: string } | null>(null);
//   const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(false);
//   const [destinationMarker, setDestinationMarker] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [startMarker, setStartMarker] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [locationStatus, setLocationStatus] = useState<string>("Checking...");

//   const defaultLocation = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       try {
//         if (Platform.OS === "android") {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//               title: "Location Permission",
//               message: "This app needs access to your location for tracking.",
//               buttonNeutral: "Ask Me Later",
//               buttonNegative: "Cancel",
//               buttonPositive: "OK",
//             }
//           );
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             setPermissionGranted(true);
//             setLocationStatus("Permission granted, checking location services...");
//           } else {
//             setPermissionGranted(false);
//             setLocationStatus("Permission denied");
//             Alert.alert("Permission Denied", "Please enable location permissions in Settings > Apps > Your App.");
//           }
//         }
//       } catch (err) {
//         console.error("Permission request error:", err);
//         setLocationStatus("Permission request failed");
//         Alert.alert("Error", "Failed to request location permission.");
//       }
//     };
//     requestLocationPermission();
//   }, []);

//   const calculateRoute = async () => {
//     if (!start || !end) {
//       Alert.alert("Error", "Please enter both start and end locations.");
//       return;
//     }

//     if (end === "Close Parking (Multiple Locations in Kampala)") {
//       showParkingLocations();
//       return;
//     }

//     const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
//     const modes = ["driving", "walking", "bicycling", "transit"];
//     let timesByMode = {};
//     let points = [];

//     let startCoords, endCoords;
//     try {
//       const startPlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(start)}&key=${apiKey}&region=ug`;
//       const startResponse = await fetch(startPlacesUrl);
//       const startData = await startResponse.json();
//       if (startData.status !== "OK" || !startData.results[0]) {
//         Alert.alert("Error", "Invalid starting location. Try a more specific query like 'Acacia Mall, Kampala'");
//         return;
//       }
//       startCoords = startData.results[0].geometry.location;
//       setStartMarker({
//         latitude: startCoords.lat,
//         longitude: startCoords.lng,
//       });

//       const endPlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(end)}&key=${apiKey}&region=ug`;
//       const endResponse = await fetch(endPlacesUrl);
//       const endData = await endResponse.json();
//       if (endData.status !== "OK" || !endData.results[0]) {
//         Alert.alert("Error", "Invalid destination. Try a more specific query like 'Kampala Road'");
//         return;
//       }
//       endCoords = endData.results[0].geometry.location;
//       setDestinationMarker({
//         latitude: endCoords.lat,
//         longitude: endCoords.lng,
//       });
//     } catch (error) {
//       Alert.alert("Error", "Failed to find locations. Check your input or internet connection.");
//       console.error("Places API error:", error);
//       return;
//     }

//     const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=driving`;
//     try {
//       const response = await fetch(drivingUrl);
//       const data = await response.json();
//       if (data.status === "OK") {
//         points = decodePolyline(data.routes[0].overview_polyline.points);
//         setRouteCoordinates(points);
//         setParkingMarkers([]);
//         setTravelTimes([data.routes[0].legs[0].duration.text]);
//         mapRef.current?.fitToCoordinates(points, {
//           edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//         });
//         timesByMode["driving"] = data.routes[0].legs[0].duration.text;
//       } else {
//         Alert.alert("Error", `Could not find a driving route: ${data.status}`);
//         return;
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to fetch driving route.");
//       return;
//     }

//     for (const mode of modes) {
//       if (mode === "driving") continue;
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=${mode}`;
//       try {
//         const response = await fetch(url);
//         const data = await response.json();
//         if (data.status === "OK") {
//           timesByMode[mode] = data.routes[0].legs[0].duration.text;
//         } else {
//           timesByMode[mode] = "N/A";
//         }
//       } catch (error) {
//         timesByMode[mode] = "Error";
//       }
//     }
//     setTravelTimesByMode(timesByMode);
//   };

//   const decodePolyline = (encoded: string) => {
//     let points = [];
//     let index = 0,
//       len = encoded.length;
//     let lat = 0,
//       lng = 0;

//     while (index < len) {
//       let b,
//         shift = 0,
//         result = 0;
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

//   const showParkingLocations = async () => {
//     if (!start) {
//       Alert.alert("Error", "Please enter a starting location.");
//       return;
//     }

//     const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
//     const parkingLocations = [
//       { name: "Parking Lot A", latitude: 0.3163, longitude: 32.5820 },
//       { name: "Parking Lot B", latitude: 0.3349, longitude: 32.5678 },
//     ];
//     let newTravelTimes = [];
//     let allCoordinates = [];

//     setParkingMarkers(parkingLocations);

//     for (const location of parkingLocations) {
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
//         start
//       )}&destination=${location.latitude},${location.longitude}&key=${apiKey}&mode=driving`;
//       try {
//         const response = await fetch(url);
//         const data = await response.json();
//         if (data.status === "OK") {
//           const points = decodePolyline(data.routes[0].overview_polyline.points);
//           allCoordinates = [...allCoordinates, ...points];
//           newTravelTimes.push(`${location.name}: ${data.routes[0].legs[0].duration.text}`);
//         }
//       } catch (error) {
//         console.error("Error fetching parking route:", error);
//       }
//     }

//     setRouteCoordinates(allCoordinates);
//     setTravelTimes(newTravelTimes);
//     mapRef.current?.fitToCoordinates(allCoordinates, {
//       edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//     });
//   };

//   const useCurrentLocation = () => {
//     if (!permissionGranted) {
//       Alert.alert(
//         "Permission Required",
//         "Please enable location permissions in settings.",
//         [
//           { text: "Cancel" },
//           { text: "Open Settings", onPress: () => Linking.openSettings() },
//         ]
//       );
//       return;
//     }

//     Alert.alert("Getting Location", "Please wait while we fetch your location...");

//     Geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setStartMarker({
//           latitude,
//           longitude,
//         });

//         fetch(
//           `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`
//         )
//           .then((response) => response.json())
//           .then((data) => {
//             if (data.status === "OK") {
//               setStart(data.results[0].formatted_address);
//               mapRef.current?.animateToRegion({
//                 latitude,
//                 longitude,
//                 latitudeDelta: 0.05,
//                 longitudeDelta: 0.05,
//               });
//             } else {
//               Alert.alert("Error", "Geocoding failed: " + data.status);
//             }
//           })
//           .catch((error) => {
//             console.error("Geocoding error:", error);
//             Alert.alert("Error", "Could not geocode location.");
//           });
//       },
//       (error) => {
//         let errorMessage = "Could not get current location";
//         if (error.code === error.TIMEOUT) {
//           errorMessage = "Location request timed out. Please check your GPS/Wi-Fi and try again.";
//         } else if (error.code === error.PERMISSION_DENIED) {
//           errorMessage = "Location permission denied. Please enable in settings.";
//         }
//         Alert.alert("Error", errorMessage);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//     );
//   };

//   const resetMap = () => {
//     setStart("");
//     setEnd("");
//     setSearchQuery("");
//     setRouteCoordinates([]);
//     setParkingMarkers([]);
//     setSearchMarkers([]);
//     setTravelTimes([]);
//     setTravelTimesByMode(null);
//     setShowRouteInput(false);
//     setDestinationMarker(null);
//     setStartMarker(null);
//     mapRef.current?.animateToRegion(defaultLocation);
//   };

//   const searchPlaces = async () => {
//     if (!searchQuery) {
//       Alert.alert("Error", "Please enter a search query.");
//       return;
//     }

//     const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
//     const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}&region=ug`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data.status === "OK" && data.results.length > 0) {
//         const { lat, lng } = data.results[0].geometry.location;
//         const newMarker = {
//           name: data.results[0].name,
//           latitude: lat,
//           longitude: lng,
//         };
//         setSearchMarkers([newMarker]);
//         setSearchQuery("");
//         mapRef.current?.animateToRegion({
//           latitude: lat,
//           longitude: lng,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });
//       } else {
//         Alert.alert("Error", "No results found. Try a more specific query like 'Acacia Mall, Kampala'");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to search. Please check your internet connection.");
//       console.error("Search error:", error);
//     }
//   };

//   const openPhotoOverlay = () => {
//     setShowPhotoOverlay(true);
//   };

//   const goToTraffic = () => {
//     navigation.navigate("TrafficScreen");
//   };

//   const goToWeather = () => {
//     navigation.navigate("WeatherScreen");
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={defaultLocation}
//       >
//         {routeCoordinates.length > 0 && (
//           <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#007AFF" />
//         )}
//         {parkingMarkers.map((marker, index) => (
//           <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} title={marker.name} />
//         ))}
//         {searchMarkers.map((marker, index) => (
//           <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} title={marker.name} pinColor="green" />
//         ))}
//         {startMarker && (
//           <Marker coordinate={startMarker} title="Start" pinColor="green">
//             <Callout>
//               <View style={styles.callout}>
//                 <Text style={styles.calloutTitle}>Start Point</Text>
//                 <Text style={styles.calloutDescription}>Location: {start}</Text>
//               </View>
//             </Callout>
//           </Marker>
//         )}
//         {destinationMarker && (
//           <Marker coordinate={destinationMarker} title="Destination" pinColor="red">
//             <Callout>
//               <View style={styles.callout}>
//                 <Text style={styles.calloutTitle}>Destination</Text>
//                 <Text style={styles.calloutDescription}>Location: {end}</Text>
//               </View>
//             </Callout>
//           </Marker>
//         )}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for a place..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={searchPlaces}
//           placeholderTextColor="#888"
//           returnKeyType="search"
//         />
//         <TouchableOpacity style={styles.searchImageContainer} onPress={searchPlaces}>
//           <Icon name="search" size={30} color="#666" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.photoIconContainer} onPress={openPhotoOverlay}>
//           <Icon name="photo-camera" size={30} color="#666" />
//         </TouchableOpacity>
//       </View>

//       {/* CHANGED: RouteWise Button - Below search bar initially, above overlay when active */}
//       {!showRouteInput && !travelTimesByMode && (
//         <TouchableOpacity
//           style={[styles.routeWiseButton, { top: 60 }]} // Below search bar
//           onPress={() => setShowRouteInput(true)}
//         >
//           <Text style={styles.buttonText}>RouteWise</Text>
//         </TouchableOpacity>
//       )}
//       {showRouteInput && !travelTimesByMode && (
//         <TouchableOpacity
//           style={[styles.routeWiseButton, { top: 10, zIndex: 1000 }]} // Above overlay
//           onPress={() => setShowRouteInput(false)}
//         >
//           <Text style={styles.buttonText}>RouteWise</Text>
//         </TouchableOpacity>
//       )}

//       {/* CHANGED: RouteWise Overlay - Positioned below search bar with proper zIndex */}
//       {showRouteInput && !travelTimesByMode && (
//         <View style={[styles.routeWiseOverlay, { top: 50, zIndex: 500 }]}>
//           <TouchableOpacity style={styles.cancelIcon} onPress={() => setShowRouteInput(false)}>
//             <Icon name="cancel" size={30} color="#FF2D55" />
//           </TouchableOpacity>
//           <View style={styles.inputContainer}>
//             <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.beautifiedInput}
//                 placeholder="Starting Point"
//                 value={start}
//                 onChangeText={setStart}
//                 placeholderTextColor="#ffffff"
//                 returnKeyType="next"
//               />
//             </LinearGradient>
//             <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.beautifiedInput}
//                 placeholder="Destination"
//                 value={end}
//                 onChangeText={setEnd}
//                 placeholderTextColor="#ffffff"
//                 returnKeyType="go"
//                 onSubmitEditing={calculateRoute}
//               />
//             </LinearGradient>
//             <View style={styles.buttonRow}>
//               <TouchableOpacity style={styles.functionButton} onPress={calculateRoute}>
//                 <Text style={styles.buttonText}>Get Directions</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.functionButton} onPress={useCurrentLocation}>
//                 <Text style={styles.buttonText}>My Location</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.functionButton} onPress={resetMap}>
//                 <Text style={styles.buttonText}>Reset</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}

//       <View style={styles.bottomContainer}>
//         {travelTimesByMode && (
//           <View style={styles.travelTimesPanel}>
//             <Text style={styles.timeTitle}>Estimated Travel Times</Text>
//             <View style={styles.timeRow}>
//               <Text style={styles.timeText}>🚗 {travelTimesByMode.driving}</Text>
//               <Text style={styles.timeText}>🚶 {travelTimesByMode.walking}</Text>
//               <Text style={styles.timeText}>🚴 {travelTimesByMode.bicycling}</Text>
//               <Text style={styles.timeText}>🚍 {travelTimesByMode.transit}</Text>
//             </View>
//             <Button title="Cancel" onPress={resetMap} />
//           </View>
//         )}
//         {travelTimes.length > 0 && (
//           <View style={styles.travelTimesPanel}>
//             <Text style={styles.timeTitle}>Estimated Travel Time</Text>
//             <ScrollView style={styles.timeList}>
//               {travelTimes.map((time, index) => (
//                 <Text key={index} style={styles.timeText}>{time}</Text>
//               ))}
//             </ScrollView>
//             <Button title="Cancel" onPress={resetMap} />
//           </View>
//         )}
//       </View>

//       <View style={{ width: "100%", position: "relative" }}>
//         <PullUpPanel
//           setShowRouteInput={setShowRouteInput}
//           useCurrentLocation={useCurrentLocation}
//           setSearchQuery={setSearchQuery}
//           searchPlaces={searchPlaces}
//           goToWeather={goToWeather}
//           goToTraffic={goToTraffic}
//         />
//       </View>



//       <TouchableOpacity
//         style={[
//           styles.topRightButton,
//           showRouteInput && !travelTimesByMode ? { top: 130 } : { top: 10 },
//         ]}
//         onPress={() => navigation.navigate("RouteTrackerScreen")}
//       >
//         <Text style={styles.buttonText}>Route Tracker</Text>
//       </TouchableOpacity>

//       {showPhotoOverlay && (
//         <View style={styles.overlay}>
//           <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.photoOverlayContent}>
//             <Text style={styles.overlayTitle}>Photo Options</Text>
//             <Text style={styles.overlayText}>Take a photo or upload from gallery</Text>
//             <TouchableOpacity style={styles.overlayButton}>
//               <Text style={styles.buttonText}>Take Photo</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.overlayButton}>
//               <Text style={styles.buttonText}>Upload from Gallery</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.closeButton} onPress={() => setShowPhotoOverlay(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </LinearGradient>
//         </View>
//       )}
//     </View>
//   );
// };

// export default ParentScreen;




import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import Geolocation from '@react-native-community/geolocation';
import { Linking } from 'react-native';
import styles from "./styles/ParentScreenStyles";
import PullUpPanel from "./PullUpPanel";

export type RootStackParamList = {
  HomeScreen: undefined;
  ParentScreen: undefined;
  RouteTrackerScreen: undefined;
  TrafficScreen: undefined;
  WeatherScreen: undefined;
};

const ParentScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const mapRef = useRef<MapView>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [parkingMarkers, setParkingMarkers] = useState<{ name: string; latitude: number; longitude: number }[]>([]);
  const [searchMarkers, setSearchMarkers] = useState<{ name: string; latitude: number; longitude: number }[]>([]);
  const [travelTimes, setTravelTimes] = useState<string[]>([]);
  const [showRouteInput, setShowRouteInput] = useState<boolean>(false);
  const [travelTimesByMode, setTravelTimesByMode] = useState<{ [key: string]: string } | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [startMarker, setStartMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Checking...");

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const apiKey = "AIzaSyBIq7bzSYsYJ65cLhtYsQTx_q0bBzRreWU";

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "This app needs access to your location for tracking.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setPermissionGranted(true);
            setLocationStatus("Permission granted, checking location services...");
          } else {
            setPermissionGranted(false);
            setLocationStatus("Permission denied");
          }
        }
      } catch (err) {
        console.error("Permission request error:", err);
        setLocationStatus("Permission request failed");
      }
    };
    requestLocationPermission();
  }, []);

  const getPlaceCoordinates = async (query: string) => {
    // First, try the Autocomplete API
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&location=${defaultLocation.latitude},${defaultLocation.longitude}&radius=500000`;
    try {
      const autocompleteResponse = await fetch(autocompleteUrl);
      const autocompleteData = await autocompleteResponse.json();
      if (autocompleteData.status === "OK" && autocompleteData.predictions.length > 0) {
        const placeId = autocompleteData.predictions[0].place_id;
        // Use Place Details API to get coordinates
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        if (detailsData.status === "OK") {
          const { lat, lng } = detailsData.result.geometry.location;
          return {
            name: detailsData.result.name,
            latitude: lat,
            longitude: lng,
          };
        }
      }
    } catch (error) {
      console.error("Autocomplete/Place Details error:", error);
    }

    // Fallback to Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&region=ug`;
    try {
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
        const { lat, lng } = geocodeData.results[0].geometry.location;
        return {
          name: geocodeData.results[0].formatted_address,
          latitude: lat,
          longitude: lng,
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    return null;
  };

  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert("Error", "Please enter both start and end locations.");
      return;
    }

    let startCoords, endCoords;
    try {
      // Get coordinates for start location
      const startResult = await getPlaceCoordinates(start);
      if (!startResult) {
        Alert.alert("Error", "Could not find the starting location: " + start);
        return;
      }
      startCoords = { lat: startResult.latitude, lng: startResult.longitude };
      setStartMarker({
        latitude: startResult.latitude,
        longitude: startResult.longitude,
      });

      // Get coordinates for end location
      const endResult = await getPlaceCoordinates(end);
      if (!endResult) {
        Alert.alert("Error", "Could not find the destination: " + end);
        return;
      }
      endCoords = { lat: endResult.latitude, lng: endResult.longitude };
      setDestinationMarker({
        latitude: endResult.latitude,
        longitude: endResult.longitude,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to find locations: " + error.message);
      return;
    }

    const modes = ["driving"];
    let timesByMode = {};
    let points = [];

    const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=driving`;
    try {
      const response = await fetch(drivingUrl);
      const data = await response.json();
      if (data.status === "OK") {
        points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        setParkingMarkers([]);
        setTravelTimes([data.routes[0].legs[0].duration.text]);
        mapRef.current?.fitToCoordinates(points, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
        timesByMode["driving"] = data.routes[0].legs[0].duration.text;
      } else {
        Alert.alert("Error", `Could not find a driving route: ${data.status}`);
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch driving route: " + error.message);
      return;
    }

    setTravelTimesByMode(timesByMode);
  };

  const decodePolyline = (encoded: string) => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const useCurrentLocation = () => {
    if (!permissionGranted) {
      Alert.alert(
        "Permission Required",
        "Please enable location permissions in settings.",
        [
          { text: "Cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    Alert.alert("Getting Location", "Please wait while we fetch your location...");

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStartMarker({
          latitude,
          longitude,
        });

        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "OK") {
              setStart(data.results[0].formatted_address);
              mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            } else {
              Alert.alert("Error", "Geocoding failed: " + data.status);
            }
          })
          .catch((error) => {
            console.error("Geocoding error:", error);
            Alert.alert("Error", "Could not geocode location.");
          });
      },
      (error) => {
        let errorMessage = "Could not get current location";
        if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please check your GPS/Wi-Fi and try again.";
        } else if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable in settings.";
        }
        Alert.alert("Error", errorMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const resetMap = () => {
    setStart("");
    setEnd("");
    setSearchQuery("");
    setRouteCoordinates([]);
    setParkingMarkers([]);
    setSearchMarkers([]);
    setTravelTimes([]);
    setTravelTimesByMode(null);
    setShowRouteInput(false);
    setDestinationMarker(null);
    setStartMarker(null);
    mapRef.current?.animateToRegion(defaultLocation);
  };

  const searchPlaces = async () => {
    if (!searchQuery) {
      Alert.alert("Error", "Please enter a search query.");
      return;
    }

    const result = await getPlaceCoordinates(searchQuery);
    if (result) {
      const newMarker = {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      };
      setSearchMarkers([newMarker]);
      setSearchQuery("");
      mapRef.current?.animateToRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      Alert.alert("Error", `No results found for "${searchQuery}". Try a different query or check your spelling.`);
    }
  };

  const goToTraffic = () => {
    navigation.navigate("TrafficScreen");
  };

  const goToWeather = () => {
    navigation.navigate("WeatherScreen");
  };

  const goToCrash = () => {
    navigation.navigate("CrashScreen");
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      >
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#007AFF" />
        )}
        {parkingMarkers.map((marker, index) => (
          <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} title={marker.name} />
        ))}
        {searchMarkers.map((marker, index) => (
          <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} title={marker.name} pinColor="green" />
        ))}
        {startMarker && (
          <Marker coordinate={startMarker} title="Start" pinColor="green">
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Start Point</Text>
                <Text style={styles.calloutDescription}>Location: {start}</Text>
              </View>
            </Callout>
          </Marker>
        )}
        {destinationMarker && (
          <Marker coordinate={destinationMarker} title="Destination" pinColor="red">
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Destination</Text>
                <Text style={styles.calloutDescription}>Location: {end}</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchPlaces}
          placeholderTextColor="#888"
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchImageContainer} onPress={searchPlaces}>
          <Icon name="search" size={30} color="#0000FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {!showRouteInput && !travelTimesByMode && (
          <TouchableOpacity 
            style={styles.routeWiseButton} 
            onPress={() => setShowRouteInput(true)}
          >
            <Icon name="map" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>RouteWise</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.routeTrackerButton}
          onPress={() => navigation.navigate("RouteTrackerScreen")}
        >
          <Icon name="assistant" size={24} color="#007AFF" style={styles.buttonIcon} />
          <Text style={styles.routeTrackerButtonText}>Route Tracker</Text>
        </TouchableOpacity>
      </View>

      {showRouteInput && !travelTimesByMode && (
        <View style={styles.routeWiseOverlay}>
          <TouchableOpacity
            style={styles.cancelIcon}
            onPress={() => setShowRouteInput(false)}
          >
            <Icon name="cancel" size={30} color="#0000FF" />
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Current Location</Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={styles.beautifiedInput}
                  placeholder="Current Location"
                  value={start}
                  onChangeText={setStart}
                  placeholderTextColor="#888"
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  style={styles.myLocationButton} 
                  onPress={useCurrentLocation}
                >
                  <Icon name="my-location" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.beautifiedInput}
                placeholder="Enter destination..."
                value={end}
                onChangeText={setEnd}
                placeholderTextColor="#888"
                returnKeyType="go"
                onSubmitEditing={calculateRoute}
              />
            </View>
            
            <View style={styles.modeButtonRow}>
              <TouchableOpacity 
                style={[styles.modeButton, styles.modeButtonActive]} 
                onPress={calculateRoute}
              >
                <Icon name="directions-car" size={24} color="#fff" />
                <Text style={styles.modeButtonTextActive}>Drive</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.navigateButton} 
              onPress={calculateRoute}
            >
              <Icon name="route" size={20} color="#007AFF" style={styles.routeIcon} />
              <Text style={styles.navigateButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.bottomContainer}>
        {travelTimesByMode && (
          <View style={styles.travelTimesPanel}>
            <Text style={styles.timeTitle}>Estimated Travel Times</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>🚗 {travelTimesByMode.driving}</Text>
            </View>
            <Button title="Cancel" onPress={resetMap} />
          </View>
        )}
        {travelTimes.length > 0 && (
          <View style={styles.travelTimesPanel}>
            <Text style={styles.timeTitle}>Estimated Travel Time</Text>
            <ScrollView style={styles.timeList}>
              {travelTimes.map((time, index) => (
                <Text key={index} style={styles.timeText}>{time}</Text>
              ))}
            </ScrollView>
            <Button title="Cancel" onPress={resetMap} />
          </View>
        )}
      </View>

      <View style={{ width: "100%", position: "relative" }}>
        <PullUpPanel
          setShowRouteInput={setShowRouteInput}
          useCurrentLocation={useCurrentLocation}
          setSearchQuery={setSearchQuery}
          searchPlaces={searchPlaces}
          goToWeather={goToWeather}
          goToTraffic={goToTraffic}
        />
      </View>

      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={goToWeather}>
          <Icon name="cloud" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
          <Icon name="traffic" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Traffic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={goToCrash}>
          <Icon name="warning" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Crash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ParentScreen;