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
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator, 
} from "react-native";
import { useNavigation, useRoute, RouteProp, NavigationProp } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import Config from "react-native-config";
import Geolocation from '@react-native-community/geolocation';
import { Linking } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import PullUpPanel from "./PullUpPanel";
import styles from "./styles/HomeScreenStyles"; 
import Profile from "./Profile";

export type RootStackParamList = {
  HomeScreen: { driverCode: string } | undefined;
  AssistantScreen: { tempCode: string; driverCode: string };
  LogScreen: { tempCode: string; driverCode: string } | undefined;
  ParentTrackingScreen: { driverCode: string };
  TrafficScreen: undefined;
  WeatherScreen: undefined;
};

type HomeScreenRouteProp = RouteProp<RootStackParamList, "HomeScreen">;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<HomeScreenRouteProp>();
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
  const [driverCode, setDriverCode] = useState<string>("");
  const [showProfileOverlay, setShowProfileOverlay] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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

  // Load driver_code from AsyncStorage on mount
  useEffect(() => {
    const loadDriverCode = async () => {
      try {
        const storedCode = await AsyncStorage.getItem("driver_code");
        if (storedCode) {
          setDriverCode(storedCode);
        } else {
          Alert.alert("Error", "Please log in first.");
          navigation.navigate("LogScreen");
        }
      } catch (error) {
        console.error("Error loading driver code:", error);
        Alert.alert("Error", "Failed to load driver information.");
        navigation.navigate("LogScreen");
      }
    };
    loadDriverCode();
  }, [navigation]);

  const goToTraffic = () => {
    navigation.navigate("TrafficScreen");
  };
  const goToWeather = () => {
    navigation.navigate("WeatherScreen");
  };
  const goToCrash = () => {
    navigation.navigate("CrashScreen");
  };

  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert("Error", "Please enter both start and end locations.");
      return;
    }

    if (end === "Close Parking (Multiple Locations in Kampala)") {
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
    const modes = ["driving", "walking", "bicycling", "transit"];
    let timesByMode = {};
    let points = [];

    let startCoords, endCoords;
    try {
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
    if (!driverCode) {
      Alert.alert("Error", "Please log in first.");
      navigation.navigate("LogScreen");
      return;
    }
  
    setIsGenerating(true);
    setSyncStatus("In Sync");
    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/generate-driver-code/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driver_code: driverCode }),
      });
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code");
      }
  
      setGeneratedCode(data.code);
      setSyncStatus("Synced");
      navigation.navigate("LogScreen", { tempCode: data.code, driverCode });
    } catch (error: any) {
      console.error("Error generating code:", error.message);
      setSyncStatus("UnSync");
      Alert.alert("Error", error.message || "Failed to generate code");
    } finally {
      setIsGenerating(false);
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
            pinColor="green"
          />
        )}
        {destinationMarker && (
          <Marker
            coordinate={destinationMarker}
            title={end}
            pinColor="red"
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
          {/* <Icon name="search" size={30} color="#666" /> */}
          <Icon name="search" size={30} color="#0000FF" />

        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.photoIconContainer}
          onPress={() => setShowProfileOverlay(true)}
        >
          <Icon name="person" size={30} color="#0000FF" />
        </TouchableOpacity>
      </View>
      // Container for both buttons to align them side by side
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
          style={styles.assistantButton}
          onPress={() => setShowAssistantOverlay(true)}
        >
          <Icon name="assistant" size={24} color="#007AFF" style={styles.buttonIcon} />
          <Text style={styles.assistantButtonText}>Assistant</Text>
        </TouchableOpacity>
      </View>
z

// RouteWise Overlay
{showRouteInput && !travelTimesByMode && !hideInputs && (
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
        <TouchableOpacity style={[styles.modeButton, styles.modeButtonActive]} onPress={() => calculateRoute()}>
          <Icon name="directions-car" size={24} color="#fff" />
          <Text style={styles.modeButtonTextActive}>Drive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => calculateRoute()}>
          <Icon name="directions-walk" size={24} color="#666" />
          <Text style={styles.modeButtonText}>Walk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => calculateRoute()}>
          <Icon name="directions-transit" size={24} color="#666" />
          <Text style={styles.modeButtonText}>Transit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => calculateRoute()}>
          <Icon name="directions-bike" size={24} color="#666" />
          <Text style={styles.modeButtonText}>Bike</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeButtonRow}>
        <TouchableOpacity 
          style={styles.timeButton} 
          onPress={() => showTimeBasedLocations("morning")}
        >
          <Icon name="wb-sunny" size={24} color="#007AFF" />
          <Text style={styles.timeButtonText}>Morning</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.timeButton} 
          onPress={() => showTimeBasedLocations("afternoon")}
        >
          <Icon name="brightness-high" size={24} color="#007AFF" />
          <Text style={styles.timeButtonText}>Afternoon</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.timeButton} 
          onPress={() => showTimeBasedLocations("evening")}
        >
          <Icon name="nights-stay" size={24} color="#007AFF" />
          <Text style={styles.timeButtonText}>Evening</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.navigateButton} 
        onPress={navigateToTimeLocations}
      >
        <Icon name="route" size={20} color="#007AFF" style={styles.routeIcon} />
        <Text style={styles.navigateButtonText}>RouteWise</Text>
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

      // Floating Buttons Container
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

      {/* {showAssistantOverlay && (
        <View style={styles.overlay}>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>Driver Verification</Text>
            <Text style={styles.overlayText}>
              Generate a verification code to assign a shuttle.
            </Text>
            <View style={styles.syncContainer}>
              <Text style={styles.syncLabel}>Sync:</Text>
              <Text style={[styles.syncStatus, syncStatus === "Synced" && { color: "#00ff00" }]}>
                {syncStatus}
              </Text>
            </View>
            {generatedCode && (
              <View style={styles.codeContainer}>
                <Text style={styles.generatedCodeText}>Code: {generatedCode}</Text>
                {shuttleRegNumber && (
                  <Text style={styles.generatedCodeText}>Shuttle: {shuttleRegNumber}</Text>
                )}
              </View>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.generateButton, isGenerating && styles.disabledButton]}
                onPress={generateCode}
                disabled={isGenerating}
              >
                <Text style={styles.generateButtonText}>
                  {isGenerating ? "Generating..." : "Generate Verification Code"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAssistantOverlay(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )} */}
// Assistant Overlay (functionality remains identical)
{showAssistantOverlay && (
  <View style={styles.overlay}>
    <View style={styles.overlayContent}>
      <View style={styles.header}>
        <Icon name="verified-user" size={28} color="#007AFF" />
        <Text style={styles.overlayTitle}>Driver Verification</Text>
      </View>

      <Text style={styles.overlayText}>
        Generate a verification code to assign a shuttle
      </Text>

      <View style={styles.statusContainer}>
        <View style={styles.syncContainer}>
          <Text style={styles.syncLabel}>Sync:</Text>
          <View style={styles.syncStatusContainer}>
            <View style={[styles.syncIndicator, syncStatus === "Synced" ? styles.synced : styles.notSynced]} />
            <Text style={styles.syncStatusText}>{syncStatus}</Text>
          </View>
        </View>

        {generatedCode && (
          <View style={styles.codeContainer}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeLabel}>Verification Code</Text>
              <Text style={styles.codeValue}>{generatedCode}</Text>
            </View>
            {shuttleRegNumber && (
              <View style={styles.codeBadge}>
                <Text style={styles.codeLabel}>Shuttle Number</Text>
                <Text style={styles.codeValue}>{shuttleRegNumber}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.disabledButton]}
          onPress={generateCode}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="vpn-key" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.generateButtonText}>Generate Code</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowAssistantOverlay(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
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

      {showProfileOverlay && (
        <Profile onClose={() => setShowProfileOverlay(false)} />
      )}
    </View>
  );
};

export default HomeScreen;





