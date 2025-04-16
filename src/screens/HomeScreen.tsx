
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import Config from "react-native-config";
import Geolocation from '@react-native-community/geolocation';
// import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { Linking } from 'react-native';

// Add this import at the top of HomeScreen.tsx with other imports
import PullUpPanel from "./PullUpPanel";

// Add this import at the top of HomeScreen.tsx with other imports
import styles from "./HomeScreenStyles"; // Adjust the path if you placed the file in a different 

export type RootStackParamList = {
  HomeScreen: undefined;
  AssistantScreen: undefined;
  ParentTrackingScreen: { driverCode: string };
};


const HomeScreen = () => {
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
  const [showAssistantOverlay, setShowAssistantOverlay] = useState<boolean>(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"UnSync" | "In Sync" | "Synced">("UnSync");
  const [shuttleRegNumber, setShuttleRegNumber] = useState<string>("");
  const [timeMarkers, setTimeMarkers] = useState<{ name: string; latitude: number; longitude: number; description: string }[]>([]);
  const [selectedTime, setSelectedTime] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [hideInputs, setHideInputs] = useState<boolean>(false);
  const screenHeight = Dimensions.get("window").height;
  const [panelHeight] = useState(new Animated.Value(100));
  const maxPanelHeight = screenHeight * 0.75;
  const [currentLegIndex, setCurrentLegIndex] = useState<number>(0);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(false);
  const [destinationMarker, setDestinationMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [startMarker, setStartMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Checking...");

  const openPhotoOverlay = () => {
    setShowPhotoOverlay(true);
  };

  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const timeBasedLocations = {
    morning: [
      { name: "City Square", latitude: 0.3163, longitude: 32.5820, description: "Central hub of Kampala with shops and offices." },
      { name: "Makerere University", latitude: 0.3349, longitude: 32.5678, description: "Premier educational institution in Uganda." },
      { name: "Nakivubo Market", latitude: 0.3114, longitude: 32.5761, description: "Busy market known for fresh produce." },
      { name: "Kampala Road", latitude: 0.3176, longitude: 32.5866, description: "Main commercial street with banks." },
      { name: "Owino Market", latitude: 0.3098, longitude: 32.5738, description: "Popular spot for second-hand goods." },
    ],
    afternoon: [
      { name: "Lugogo Mall", latitude: 0.3262, longitude: 32.6058, description: "Shopping mall with various stores." },
      { name: "Kololo Airstrip", latitude: 0.3278, longitude: 32.5978, description: "Open area often used for events." },
      { name: "Garden City", latitude: 0.3168, longitude: 32.5912, description: "Modern mall with a cinema." },
      { name: "Bugolobi Market", latitude: 0.3068, longitude: 32.6208, description: "Local market with fresh foods." },
      { name: "Muyenga Hill", latitude: 0.2936, longitude: 32.6113, description: "Residential area with scenic views." },
    ],
    evening: [
      { name: "Acacia Mall", latitude: 0.3375, longitude: 32.5869, description: "Upscale mall with dining options." },
      { name: "Kabalagala", latitude: 0.2978, longitude: 32.5998, description: "Vibrant nightlife and eateries." },
      { name: "Speke Resort", latitude: 0.2276, longitude: 32.6198, description: "Luxury resort by Lake Victoria." },
      { name: "Victoria Mall", latitude: 0.2845, longitude: 32.6065, description: "Shopping center in Entebbe." },
      { name: "Kasubi Tombs", latitude: 0.3298, longitude: 32.5534, description: "Historical site of Buganda kings." },
    ],
  };


  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "This app needs access to your location for shuttle tracking.",
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
            Alert.alert("Permission Denied", "Please enable location permissions in Settings > Apps > Your App.");
          }
        }
      } catch (err) {
        console.error("Permission request error:", err);
        setLocationStatus("Permission request failed");
        Alert.alert("Error", "Failed to request location permission.");
      }
    };
    requestLocationPermission();
  }, []);


  const goToTraffic = () => {
    navigation.navigate("TrafficScreen");
  };
  const goToWeather = () => {
    navigation.navigate("WeatherScreen");
  };

  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert("Error", "Please enter both start and end locations.");
      return;
    }

    if (end === "Close Parking (Multiple Locations in Kampala)") {
      showParkingLocations();
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
    const modes = ["driving", "walking", "bicycling", "transit"];
    let timesByMode = {};
    let points = [];

    let startCoords, endCoords;
    try {
      // Use Google Places API Text Search instead of Geocoding for more precise results
      const startPlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(start)}&key=${apiKey}&region=ug`;
      const startResponse = await fetch(startPlacesUrl);
      const startData = await startResponse.json();
      if (startData.status !== "OK" || !startData.results[0]) {
        Alert.alert("Error", "Invalid starting location. Try a more specific query like 'Acacia Mall, Kampala'");
        return;
      }
      startCoords = startData.results[0].geometry.location;
      setStartMarker({
        latitude: startCoords.lat,
        longitude: startCoords.lng,
      });

      const endPlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(end)}&key=${apiKey}&region=ug`;
      const endResponse = await fetch(endPlacesUrl);
      const endData = await endResponse.json();
      if (endData.status !== "OK" || !endData.results[0]) {
        Alert.alert("Error", "Invalid destination. Try a more specific query like 'Kampala Road'");
        return;
      }
      endCoords = endData.results[0].geometry.location;
      setDestinationMarker({
        latitude: endCoords.lat,
        longitude: endCoords.lng,
      });

    } catch (error) {
      Alert.alert("Error", "Failed to find locations. Check your input or internet connection.");
      console.error("Places API error:", error);
      return;
    }

    const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=driving`;
    try {
      const response = await fetch(drivingUrl);
      const data = await response.json();
      if (data.status === "OK") {
        points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        setParkingMarkers([]);
        setTravelTimes([data.routes[0].legs[0].duration.text]);
        mapRef.current.fitToCoordinates(points, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
        timesByMode["driving"] = data.routes[0].legs[0].duration.text;
      } else {
        Alert.alert("Error", `Could not find a driving route: ${data.status}`);
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch driving route.");
      return;
    }

    for (const mode of modes) {
      if (mode === "driving") continue;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=${mode}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
          timesByMode[mode] = data.routes[0].legs[0].duration.text;
        } else {
          timesByMode[mode] = "N/A";
        }
      } catch (error) {
        timesByMode[mode] = "Error";
      }
    }
    setTravelTimesByMode(timesByMode);
  };
  const decodePolyline = (encoded) => {
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

  const showParkingLocations = async () => {
    if (!start) {
      Alert.alert("Error", "Please enter a starting location.");
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
    const parkingLocations = [
      { name: "Parking Lot A", latitude: 0.3163, longitude: 32.5820 },
      { name: "Parking Lot B", latitude: 0.3349, longitude: 32.5678 },
    ];
    let newTravelTimes = [];
    let allCoordinates = [];

    setParkingMarkers(parkingLocations);

    for (const location of parkingLocations) {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        start
      )}&destination=${location.latitude},${location.longitude}&key=${apiKey}&mode=driving`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          allCoordinates = [...allCoordinates, ...points];
          newTravelTimes.push(`${location.name}: ${data.routes[0].legs[0].duration.text}`);
        }
      } catch (error) {
        console.error("Error fetching parking route:", error);
      }
    }

    setRouteCoordinates(allCoordinates);
    setTravelTimes(newTravelTimes);
    mapRef.current.fitToCoordinates(allCoordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  };


  const useCurrentLocation = () => {
    if (!permissionGranted) {
      // Alert.alert("Error", "Location permission not granted.");
      // return;
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
      // Show loading indicator
      Alert.alert("Getting Location", "Please wait while we fetch your location...");
  
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Set the start marker
        setStartMarker({
          latitude,
          longitude,
        });
  
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`
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
      // (error) => {
      //   console.error("Geolocation error:", error.message);
      //   Alert.alert("Error", `Could not get current location: ${error.message}`);
      // },
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
    setTimeMarkers([]);
    setSelectedTime(null);
    setHideInputs(false);
    setCurrentLegIndex(0);
    setDestinationMarker(null);
    setStartMarker(null);
    mapRef.current?.animateToRegion(defaultLocation);
  };

  const showTimeBasedLocations = (time: "morning" | "afternoon" | "evening") => {
    setSelectedTime(time);
    const locations = timeBasedLocations[time];
    setTimeMarkers(locations);
    mapRef.current?.fitToCoordinates(locations, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  };

  const navigateToTimeLocations = async () => {
    if (!selectedTime) {
      Alert.alert("Error", "Please select a time (Morning, Afternoon, or Evening) first.");
      return;
    }

    const locations = timeBasedLocations[selectedTime];
    if (locations.length < 2) {
      Alert.alert("Error", "Not enough locations to create a route.");
      return;
    }

    setShowRouteInput(false);

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
    let allTravelTimes: string[] = [];

    for (let i = 0; i < locations.length - 1; i++) {
      const origin = `${locations[i].latitude},${locations[i].longitude}`;
      const destination = `${locations[i + 1].latitude},${locations[i + 1].longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=driving`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
          const duration = data.routes[0].legs[0].duration.text;
          allTravelTimes.push(`${locations[i].name} to ${locations[i + 1].name}     ${duration}`);
        } else {
          allTravelTimes.push(`${locations[i].name} to ${locations[i + 1].name}     N/A`);
        }
      } catch (error) {
        console.error("Error fetching route for time-based locations:", error);
        allTravelTimes.push(`${locations[i].name} to ${locations[i + 1].name}     Error`);
      }
    }

    setTravelTimes(allTravelTimes);

    const displayLeg = async (legIndex: number) => {
      if (legIndex >= locations.length - 1) return;

      const origin = `${locations[legIndex].latitude},${locations[legIndex].longitude}`;
      const destination = `${locations[legIndex + 1].latitude},${locations[legIndex + 1].longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=driving`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoordinates(points);
          mapRef.current?.fitToCoordinates(points, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          });

          setTimeout(() => {
            setCurrentLegIndex(legIndex + 1);
            displayLeg(legIndex + 1);
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching route for leg:", error);
      }
    };

    setCurrentLegIndex(0);
    displayLeg(0);
  };

  const searchPlaces = async () => {
    if (!searchQuery) {
      Alert.alert("Error", "Please enter a search query.");
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}&region=ug`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const newMarker = { 
          name: data.results[0].name, 
          latitude: lat, 
          longitude: lng 
        };
        setSearchMarkers([newMarker]);
        setSearchQuery("");
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        Alert.alert("Error", "No results found. Try a more specific query like 'Acacia Mall, Kampala'");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to search. Please check your internet connection.");
      console.error("Search error:", error);
    }
  };

  const openSearchOverlay = () => {
    setShowSearchOverlay(true);
  };

  const generateCode = async () => {
    setSyncStatus("In Sync");
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated Code:", newCode);
    setGeneratedCode(newCode);
  
    try {
      // Create driver
      const driverResponse = await fetch(`${API_BASE_URL}/api/drivers/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver_code: newCode,
        }),
      });
  
      if (!driverResponse.ok) {
        const errorText = await driverResponse.text();
        throw new Error(`Failed to store driver code: ${errorText}`);
      }
  
      const driverData = await driverResponse.json();
      console.log("Driver created with code:", driverData);
  
      // Assign shuttle
      const shuttleResponse = await fetch(`${API_BASE_URL}/api/assign-shuttle/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver_code: newCode,
          reg_number: "UAB 345H",
        }),
      });
  
      if (!shuttleResponse.ok) {
        const errorText = await shuttleResponse.text();
        throw new Error(`Failed to assign shuttle: ${errorText}`);
      }
  
      const shuttleData = await shuttleResponse.json();
      console.log("Shuttle assigned:", shuttleData);
      setShuttleRegNumber(shuttleData.shuttle.reg_number);
      setSyncStatus("Synced");
  
      // Start location updates
      const updateLocation = (driverCode: string) => {
        if (!driverCode) {
          setLocationStatus("Error: Driver code not provided");
          return;
        }
  
        if (!permissionGranted) {
          setLocationStatus("No permission, using mock location");
          const mockLocation = { latitude: 0.3476, longitude: 32.5825, driver_code: driverCode };
          fetch(`${API_BASE_URL}/api/driver/update-location/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockLocation),
          })
            .then((res) => {
              if (!res.ok) {
                return res.json().then((errorData) => {
                  throw new Error(errorData.error || "Failed to update mock location");
                });
              }
              return res.json();
            })
            .then((data) => {
              console.log("Mock location updated:", data);
              setLocationStatus("Mock location updated");
            })
            .catch((err) => {
              console.error("Mock location update error:", err.message);
              setLocationStatus(`Mock Update Error: ${err.message}`);
            });
          return;
        }
  
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocationStatus(`Location: ${latitude}, ${longitude} (GPS)`);
            sendLocationUpdate(latitude, longitude, driverCode);
          },
          (error) => {
            console.error("GPS error:", error.message, "Code:", error.code);
            setLocationStatus(`GPS Error: ${error.message}`);
            if (error.code === 3) {
              // Fallback to network location on timeout
              setLocationStatus("GPS timed out, trying network...");
              Geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setLocationStatus(`Location: ${latitude}, ${longitude} (Network)`);
                  sendLocationUpdate(latitude, longitude, driverCode);
                },
                (error) => {
                  console.error("Network error:", error.message, "Code:", error.code);
                  setLocationStatus(`Network Error: ${error.message}`);
                  Alert.alert(
                    "Location Failed",
                    "Couldn’t get location. Ensure GPS is enabled and you’re in an open area, or check Wi-Fi/mobile data."
                  );
                },
                { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
              );
            } else {
              Alert.alert("Location Error", `Code ${error.code}: ${error.message}`);
            }
          },
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
        );
      };
  
      const sendLocationUpdate = async (latitude: number, longitude: number, driverCode: string) => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/driver/update-location/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude, driver_code: driverCode }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to update location");
          }
          const data = await res.json();
          console.log("Location updated:", data);
        } catch (err) {
          console.error("Location update error:", err.message);
          setLocationStatus(`Update Error: ${err.message}`);
          Alert.alert("Location Update Failed", err.message);
        }
      };
  
      updateLocation(newCode); // Initial update
      const interval = setInterval(() => updateLocation(newCode), 30000); // Every 30s
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error generating code:", error);
      setSyncStatus("UnSync");
      Alert.alert("Error", "Failed to setup driver or shuttle.");
    }
  };


  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = Math.max(100, Math.min(maxPanelHeight, 100 - gestureState.dy));
        panelHeight.setValue(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newHeight = gestureState.dy < -50 ? maxPanelHeight : 100;
        Animated.spring(panelHeight, {
          toValue: newHeight,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

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
        {timeMarkers.map((marker, index) => (
          <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                <Text style={styles.calloutDescription}>{marker.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {startMarker && (
            <Marker
              coordinate={startMarker}
              title="Start"
              pinColor="green" // Different color for start marker
            />
          )}
        {destinationMarker && (
                <Marker
                  coordinate={destinationMarker}
                  title={end}
                  pinColor="red" // You can change the color to distinguish it from other markers
                />
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
        <TouchableOpacity 
          style={styles.searchImageContainer} 
          onPress={searchPlaces}
        >
          <Icon name="search" size={30} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.photoIconContainer}
        onPress={openPhotoOverlay}
      >
        <Icon name="photo-camera" size={30} color="#666" />
      </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.assistantButton}
        onPress={() => setShowAssistantOverlay(true)}
      >
        <Text style={styles.buttonText}>Assistant</Text>
      </TouchableOpacity>

      {!showRouteInput && !travelTimesByMode && (
        <TouchableOpacity style={styles.routeWiseButton} onPress={() => setShowRouteInput(true)}>
          <Text style={styles.buttonText}>RouteWise</Text>
        </TouchableOpacity>
      )}

      {showRouteInput && !travelTimesByMode && !hideInputs && (
        <View style={styles.routeWiseOverlay}>
          {/* <TouchableOpacity 
            style={styles.cancelIcon} 
            onPress={() => setShowRouteInput(false)}
          >
            <Icon name="cancel" size={30} color="#FF2D55" />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.cancelIcon}  // ✅ Use proper style reference
            onPress={() => setShowRouteInput(false)}  // ✅ Fixed arrow function
        >
            <Icon name="cancel" size={30} color="#FF2D55" />  // ✅ Correct icon name
        </TouchableOpacity>
          <View style={styles.inputContainer}>
            <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
              <TextInput
                style={styles.beautifiedInput}
                placeholder="Starting Point"
                value={start}
                onChangeText={setStart}
                placeholderTextColor="#ffffff"
                returnKeyType="next"
              />
            </LinearGradient>
            <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.inputWrapper}>
              <TextInput
                style={styles.beautifiedInput}
                placeholder="Destination"
                value={end}
                onChangeText={setEnd}
                placeholderTextColor="#ffffff"
                returnKeyType="go"
                onSubmitEditing={calculateRoute}
              />
            </LinearGradient>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.functionButton}
                onPress={calculateRoute}
              >
                <Text style={styles.buttonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.functionButton}
                onPress={useCurrentLocation}
              >
                <Text style={styles.buttonText}>My Location</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.functionButton}
                onPress={resetMap}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeButtonRow}>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={() => showTimeBasedLocations("morning")}
              >
                <Text style={styles.buttonText}>Morning</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={() => showTimeBasedLocations("afternoon")}
              >
                <Text style={styles.buttonText}>Afternoon</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={() => showTimeBasedLocations("evening")}
              >
                <Text style={styles.buttonText}>Evening</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.navigateButton} 
              onPress={navigateToTimeLocations}
            >
              <Text style={styles.buttonText}>Navigate Time Locations</Text>
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
              <Text style={styles.timeText}>🚶 {travelTimesByMode.walking}</Text>
              <Text style={styles.timeText}>🚴 {travelTimesByMode.bicycling}</Text>
              <Text style={styles.timeText}>🚍 {travelTimesByMode.transit}</Text>
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


{/* Other components like MapView, searchContainer, etc. */}
<View style={{ width: "100%", position: "relative" }}>
  <PullUpPanel
    selectedTime={selectedTime}
    showTimeBasedLocations={showTimeBasedLocations}
    navigateToTimeLocations={navigateToTimeLocations}
    setShowRouteInput={setShowRouteInput}
    useCurrentLocation={useCurrentLocation}
    setShowAssistantOverlay={setShowAssistantOverlay}
    generatedCode={generatedCode}
    shuttleRegNumber={shuttleRegNumber}
    setSearchQuery={setSearchQuery}
    searchPlaces={searchPlaces}
    goToWeather={goToWeather}
    goToTraffic={goToTraffic}
  />
</View>
{/* Other overlays like showPhotoOverlay, showAssistantOverlay, etc. */}

        <View style={styles.floatingButtons}>
          {/* <TouchableOpacity style={styles.floatingButton}>
            <Text style={styles.buttonText}>Weather</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.floatingButton} onPress={goToWeather}>
            <Text style={styles.buttonText}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
            <Text style={styles.buttonText}>Traffic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton}>
            <Text style={styles.buttonText}>Crash</Text>
          </TouchableOpacity>

        </View>



      {showPhotoOverlay && (
      <View style={styles.overlay}>
        <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.photoOverlayContent}>
          <Text style={styles.overlayTitle}>Photo Options</Text>
          <Text style={styles.overlayText}>Take a photo or upload from gallery</Text>
          <TouchableOpacity style={styles.overlayButton}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayButton}>
            <Text style={styles.buttonText}>Upload from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPhotoOverlay(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )}

      {showAssistantOverlay && (
              <View style={styles.overlay}>
                <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.overlayContent}>
                  <View style={styles.syncContainer}>
                    <Text style={styles.syncLabel}>Sync:</Text>
                    <Text style={[styles.syncStatus, syncStatus === "Synced" && { color: "#00ff00" }]}>
                      {syncStatus}
                    </Text>
                  </View>
                  <Text style={styles.syncLabel}>Location: {locationStatus}</Text> {/* Debug info */}
                  <TouchableOpacity style={styles.generateButton} onPress={generateCode}>
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                  {generatedCode && (
                    <View style={styles.codeContainer}>
                      <Text style={styles.generatedCodeText}>{generatedCode}</Text>
                      {shuttleRegNumber && (
                        <Text style={styles.generatedCodeText}>Shuttle: {shuttleRegNumber}</Text>
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowAssistantOverlay(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
    )}

      {showSearchOverlay && (
        <View style={styles.searchOverlay}>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.searchOverlayContent}>
            <Text style={styles.overlayTitle}>Search Details</Text>
            <Text style={styles.overlayText}>Add more search options or details here!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSearchOverlay(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};


export default HomeScreen;