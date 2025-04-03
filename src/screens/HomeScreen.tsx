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

  const locationOptions: GeoOptions = {
    enableHighAccuracy: true,  // Use GPS and other sensors
    timeout: 20000,           // 20 second timeout
    maximumAge: 10000         // Accept cached locations up to 10 seconds old
  };

  const checkGpsStatus = async () => {
    if (Platform.OS === 'android') {
      const enabled = await PROVIDER_GOOGLE.isGpsEnabled();
      if (!enabled) {
        Alert.alert(
          "GPS Disabled",
          "Please enable GPS for better location accuracy",
          [
            { text: "Cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    }
    return true;
  };

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
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          // For iOS, request permission when needed
          const status = await Geolocation.requestAuthorization('whenInUse');
          setPermissionGranted(status === 'granted');
        }
      } catch (err) {
        Alert.alert("Error", "Failed to request location permission.");
      }
    };
    requestLocationPermission();
  }, []);

  const goToTest = () => {
    navigation.navigate("Test");
  };

  const goToTraffic = () => {
    navigation.navigate("TrafficScreen");
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
      const startGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(start)}&key=${apiKey}&region=ug`;
      const startResponse = await fetch(startGeocodeUrl);
      const startData = await startResponse.json();
      if (startData.status !== "OK" || !startData.results[0]) {
        Alert.alert("Error", "Invalid starting location.");
        return;
      }
      startCoords = startData.results[0].geometry.location;
          // Set the start marker
      setStartMarker({
        latitude: startCoords.lat,
        longitude: startCoords.lng,
      });

      const endGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(end)}&key=${apiKey}&region=ug`;
      const endResponse = await fetch(endGeocodeUrl);
      const endData = await endResponse.json();
      if (endData.status !== "OK" || !endData.results[0]) {
        Alert.alert("Error", "Invalid destination.");
        return;
      }
      endCoords = endData.results[0].geometry.location;
      // Store the destination coordinates for the marker
      setDestinationMarker({
        latitude: endCoords.lat,
        longitude: endCoords.lng,
      });

    } catch (error) {
      Alert.alert("Error", "Failed to geocode locations.");
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

  // const useCurrentLocation = () => {
  //   if (!permissionGranted) {
  //     Alert.alert("Error", "Location permission not granted.");
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const { latitude, longitude } = position.coords;
  //       fetch(
  //         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`
  //       )
  //         .then((response) => response.json())
  //         .then((data) => {
  //           if (data.status === "OK") {
  //             setStart(data.results[0].formatted_address);
  //             mapRef.current.animateToRegion({
  //               latitude,
  //               longitude,
  //               latitudeDelta: 0.05,
  //               longitudeDelta: 0.05,
  //             });
  //           } else {
  //             Alert.alert("Error", "Geocoding failed: " + data.status);
  //           }
  //         })
  //         .catch((error) => {
  //           console.error("Geocoding error:", error);
  //           Alert.alert("Error", "Could not geocode location.");
  //         });
  //     },
  //     (error) => {
  //       console.error("Geolocation error:", error.message);
  //       Alert.alert("Error", `Could not get current location: ${error.message}`);
  //     },
  //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //   );
  // };

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
      //const token = "eyJhbGciOiJIUzI1NiIsI
      const response = await fetch(`${Config.API_BASE_URL}/api/drivers/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          //"Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          driver_code: newCode,
          // user: "204f86a8-cd25-4314-b5b9-2868dcd8b2f9", 
          // school: "ab12c1be-959e-4d59-bbb3-39b5134ada5b", 
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error storing driver code:", response.status, errorText);
        throw new Error("Failed to store driver code");
      }
  
      const driverData = await response.json();
      console.log("Driver created with code:", driverData);
      setSyncStatus("Synced");
    } catch (error) {
      console.error("Error generating code:", error);
      setSyncStatus("UnSync");
      Alert.alert("Error", "Failed to store driver code. Check network or backend.");
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

      <Animated.View style={[styles.panel, { height: panelHeight }]} {...panResponder.panHandlers}>
        <View style={styles.panelHandle} />
        <ScrollView style={styles.panelContent}>
          <Text style={styles.panelTitle}>Explore Kampala</Text>
          <Text style={styles.panelText}>Discover popular spots and events!</Text>
          <Text style={styles.panelText}>Visit markets, malls, and more.</Text>
          <View style={styles.panelSpacer} />
        </ScrollView>
        <View style={styles.floatingButtons}>
          <TouchableOpacity style={styles.floatingButton}>
            <Text style={styles.buttonText}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
            <Text style={styles.buttonText}>Traffic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton}>
            <Text style={styles.buttonText}>Crash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={goToTest}>
            <Text style={styles.buttonText}>Test</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>


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
              <Text
                style={[styles.syncStatus, syncStatus === "Synced" && { color: "#00ff00" }]}
              >
                {syncStatus}
              </Text>
            </View>
            <TouchableOpacity style={styles.generateButton} onPress={generateCode}>
              <Text style={styles.generateButtonText}>Generate</Text>
            </TouchableOpacity>
            {generatedCode && (
              <View style={styles.codeContainer}>
                <Text style={styles.generatedCodeText}>{generatedCode}</Text>
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

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  searchImageContainer: {
    padding: 5,
  },
  photoOverlayContent: {
    width: "75%",
    height: "50%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  overlayButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  assistantButton: {
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "#FF9500",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  routeWiseButton: {
    position: "absolute",
    top: 60,
    left: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  routeWiseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    paddingTop: 100,
    alignItems: "center",
  },
  inputContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  inputWrapper: {
    borderRadius: 25,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  beautifiedInput: {
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 25,
  },
  cancelIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 120,
    left: 10,
    right: 10,
    alignItems: "center",
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 10,
    minHeight: 80,
    maxHeight: 150,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
    flexWrap: "wrap",
  },
  functionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  travelTimesPanel: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  timeList: {
    maxHeight: 80,
    width: "100%",
    marginBottom: 10,
  },
  timeTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  timeText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    overflow: "hidden",
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 10,
  },
  panelContent: {
    padding: 15,
    paddingBottom: 80,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  panelText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  panelSpacer: {
    height: 20,
  },
  floatingButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  floatingButton: {
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
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
    minHeight: 40,
  },
  timeButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  timeButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
    margin: 2,
  },
  navigateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    width: 280,
    height: 280,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "space-around",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    elevation: 10,
  },
  syncContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  syncLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginRight: 10,
  },
  syncStatus: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  generateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  codeContainer: {
    marginTop: 20,
    alignItems: "center",
    marginBottom: 100,
  },
  generatedCodeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 15,
    borderRadius: 15,
    textAlign: "center",
    width: 120,
  },
  closeButton: {
    backgroundColor: "#FF2D55",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
    position: "absolute",
    bottom: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchOverlayContent: {
    width: "75%",
    height: "75%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  overlayText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default HomeScreen;