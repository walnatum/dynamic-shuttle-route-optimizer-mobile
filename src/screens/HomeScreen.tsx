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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Callout } from "react-native-maps";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import icon library for cancel icon
import { RootStackParamList } from "../../App";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

const HomeScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [parkingMarkers, setParkingMarkers] = useState([]);
  const [travelTimes, setTravelTimes] = useState([]);
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [travelTimesByMode, setTravelTimesByMode] = useState(null);
  const [showAssistantOverlay, setShowAssistantOverlay] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [storedCode, setStoredCode] = useState(null);
  const [syncStatus, setSyncStatus] = useState("UnSync");
  const [timeMarkers, setTimeMarkers] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [hideInputs, setHideInputs] = useState(false);


  const goToTest = () => {
    console.log("Navigating to TestScreen...");
    try {
      navigation.navigate('Test');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Test screen');
    }
  };

    const goToTraffic = () => {
      console.log("Navigating to LogScreen...");
      try {
        navigation.navigate('TrafficScreen');
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Could not navigate to Home screen');
      }
    };

  // Default location (Kampala, Uganda)
  const defaultLocation = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Default locations around Kampala with descriptions
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

  // Request location permission
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "This app needs access to your location.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setPermissionGranted(true);
          } else {
            setErrorMsg("Location permission denied");
          }
        } else {
          setPermissionGranted(true);
        }
      } catch (err) {
        setErrorMsg("Error requesting location permission");
      }
    };
    requestLocationPermission();
  }, []);

  // Calculate route using Google Maps Directions API for normal navigation (start to end)
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

    // First, try geocoding the start and end points to ensure they are valid
    let startCoords, endCoords;
    try {
      const startGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(start)}&key=${apiKey}`;
      const startResponse = await fetch(startGeocodeUrl);
      const startData = await startResponse.json();
      if (startData.status !== "OK" || !startData.results[0]) {
        Alert.alert("Error", "Invalid starting location. Please check the address and try again.");
        return;
      }
      startCoords = startData.results[0].geometry.location;

      const endGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(end)}&key=${apiKey}`;
      const endResponse = await fetch(endGeocodeUrl);
      const endData = await endResponse.json();
      if (endData.status !== "OK" || !endData.results[0]) {
        Alert.alert("Error", "Invalid destination. Please check the address and try again.");
        return;
      }
      endCoords = endData.results[0].geometry.location;
    } catch (error) {
      Alert.alert("Error", "Failed to geocode locations. Please check your internet connection and try again.");
      return;
    }

    // Now try to fetch the driving route
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
        Alert.alert("Error", `Could not find a driving route: ${data.status}. Try a different start or end location.`);
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch driving route. Please check your internet connection and try again.");
      return;
    }

    // Calculate times for other modes
    for (const mode of modes) {
      if (mode === "driving") continue; // Already handled
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

  // Decode Google Maps polyline
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

  // Show parking locations with routes (still using driving for parking)
  const showParkingLocations = async () => {
    if (!start) {
      Alert.alert("Error", "Please enter a starting location.");
      return;
    }

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
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
          newTravelTimes.push(
            `${location.name}: ${data.routes[0].legs[0].duration.text}`
          );
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

  // Use current location as starting point
  const useCurrentLocation = () => {
    if (!permissionGranted) {
      Alert.alert("Error", "Location permission not granted.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "OK") {
              setStart(data.results[0].formatted_address);
              mapRef.current.animateToRegion({
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
        console.error("Geolocation error:", error.message);
        Alert.alert("Error", `Could not get current location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Reset the map and UI
  const resetMap = () => {
    setStart("");
    setEnd("");
    setRouteCoordinates([]);
    setParkingMarkers([]);
    setTravelTimes([]);
    setTravelTimesByMode(null);
    setShowRouteInput(false);
    setTimeMarkers([]);
    setSelectedTime(null);
    setHideInputs(false);
    mapRef.current.animateToRegion(defaultLocation);
  };

  // Show time-based locations
  const showTimeBasedLocations = (time) => {
    setSelectedTime(time);
    const locations = timeBasedLocations[time];
    setTimeMarkers(locations);
    mapRef.current.fitToCoordinates(locations, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Navigate to time-based locations sequentially with animation
  const navigateToTimeLocations = async () => {
    if (!start) {
      Alert.alert("Error", "Please enter a starting location.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Error", "Please select a time period (Morning, Afternoon, Evening).");
      return;
    }

    // Hide the input fields
    setHideInputs(true);

    const apiKey = "AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg";
    let totalDuration = 0;
    let travelTimesList = [];
    let locations = [...timeBasedLocations[selectedTime]]; // Copy to sort

    // Get starting coordinates for sorting
    let startCoords = null;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      start
    )}&key=${apiKey}`;
    try {
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      if (data.status === "OK") {
        startCoords = data.results[0].geometry.location;
      } else {
        Alert.alert("Error", "Could not geocode starting point.");
        setHideInputs(false); // Show inputs again if there's an error
        return;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("Error", "Failed to geocode starting point.");
      setHideInputs(false); // Show inputs again if there's an error
      return;
    }

    // Sort locations by distance from starting point
    locations.sort((a, b) => {
      const distA = calculateDistance(
        startCoords.lat,
        startCoords.lng,
        a.latitude,
        a.longitude
      );
      const distB = calculateDistance(
        startCoords.lat,
        startCoords.lng,
        b.latitude,
        b.longitude
      );
      return distA - distB;
    });

    // Start from the user-entered starting point
    let currentOrigin = start;
    let currentIndex = 0;

    // Function to process each leg with a delay
    const processLeg = async () => {
      if (currentIndex >= locations.length) {
        // All legs are done, display total time and individual times
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const totalTimeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        setTravelTimes([`Total Travel Time: ${totalTimeText}`, ...travelTimesList]);
        return;
      }

      const destination = `${locations[currentIndex].latitude},${locations[currentIndex].longitude}`;
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        currentOrigin
      )}&destination=${encodeURIComponent(destination)}&key=${apiKey}&mode=transit`;

      try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.status !== "OK") {
          // Fallback to driving mode
          url = url.replace("mode=transit", "mode=driving");
          response = await fetch(url);
          data = await response.json();
        }

        if (data.status === "OK") {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoordinates(points); // Show only the current leg
          totalDuration += data.routes[0].legs[0].duration.value; // Add duration in seconds
          
          // Add individual leg time to the list
          const legTime = data.routes[0].legs[0].duration.text;
          const legLabel = currentIndex === 0 
            ? `${start} → ${locations[currentIndex].name}: ${legTime}`
            : `${locations[currentIndex - 1].name} → ${locations[currentIndex].name}: ${legTime}`;
          travelTimesList.push(legLabel);

          // Update travel times to show current progress
          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.floor((totalDuration % 3600) / 60);
          const totalTimeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          setTravelTimes([`Total Travel Time: ${totalTimeText}`, ...travelTimesList]);

          // Fit map to the current leg
          mapRef.current.fitToCoordinates(points, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          });

          // Move to the next leg after 10 seconds
          currentOrigin = destination;
          currentIndex++;
          setTimeout(processLeg, 10000); // 10-second delay
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        // Skip to the next leg if there's an error
        currentIndex++;
        setTimeout(processLeg, 10000);
      }
    };

    // Start processing the first leg
    setRouteCoordinates([]); // Clear previous routes
    setTravelTimes([]); // Clear previous times
    processLeg();
  };

  // Placeholder for Add PickUp Points
  const addPickUpPoints = () => {
    Alert.alert("Feature Not Implemented", "Add PickUp Points functionality coming soon!");
  };

  // Assistant Code
  const generateCode = () => {
    setSyncStatus("In Sync");
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated Code:", newCode);
    setGeneratedCode(newCode);
    setTimeout(() => {
      setSyncStatus("Synced");
    }, 2000);
  };

  return (

    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultLocation}
      >
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#0000FF" strokeWidth={4} />
        )}
        {parkingMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            pinColor="red"
          />
        ))}
        {timeMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            pinColor={selectedTime === "morning" ? "orange" : selectedTime === "afternoon" ? "yellow" : "purple"}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                <Text style={styles.calloutDescription}>{marker.description}</Text>
                <Text style={styles.calloutText}>
                  Coords: {marker.latitude}, {marker.longitude}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
        {start && routeCoordinates.length > 0 && (
          <Marker coordinate={routeCoordinates[0]} pinColor="green">
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Start Point</Text>
                <Text style={styles.calloutText}>Location: {start}</Text>
                <Text style={styles.calloutText}>
                  Coords: {routeCoordinates[0].latitude}, {routeCoordinates[0].longitude}
                </Text>
              </View>
            </Callout>
          </Marker>
        )}
        {end && routeCoordinates.length > 0 && (
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            pinColor="blue"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Destination</Text>
                <Text style={styles.calloutText}>Location: {end}</Text>
                <Text style={styles.calloutText}>
                  Coords: {routeCoordinates[routeCoordinates.length - 1].latitude},{" "}
                  {routeCoordinates[routeCoordinates.length - 1].longitude}
                </Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>

      {/* RouteWise Button (Initially Visible) */}
      {!showRouteInput && !travelTimesByMode && (
        <TouchableOpacity
          style={styles.routeWiseButton}
          onPress={() => setShowRouteInput(true)}
        >
          <Text style={styles.buttonText}>RouteWise</Text>
        </TouchableOpacity>
      )}

      {/* Directions Input and Time Buttons */}
      {showRouteInput && !travelTimesByMode && !hideInputs && (
        <View style={styles.inputContainer}>
          {/* Cancel Icon */}
          <TouchableOpacity
            style={styles.cancelIcon}
            onPress={() => setShowRouteInput(false)}
          >
            <Icon name="cancel" size={30} color="#FF2D55" />
          </TouchableOpacity>

          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Starting Point"
              value={start}
              onChangeText={setStart}
              placeholderTextColor="#ffffff"
            />
          </LinearGradient>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.beautifiedInput}
              placeholder="Destination"
              value={end}
              onChangeText={(text) => {
                setEnd(text);
                if (text === "Close Parking (Multiple Locations in Kampala)") {
                  showParkingLocations();
                }
              }}
              placeholderTextColor="#ffffff"
            />
          </LinearGradient>

          {/* Time-Based Buttons */}
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

          {/* Navigate Time Locations Button */}
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={navigateToTimeLocations}
          >
            <Text style={styles.buttonText}>Navigate Time Locations</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons or Travel Times Panel */}
      <View style={styles.bottomContainer}>
        {showRouteInput && !travelTimesByMode && !travelTimes.length > 0 && (
          <View style={styles.buttonRow}>
            <Button title="Get Directions" onPress={calculateRoute} />
            <Button title="Use My Location" onPress={useCurrentLocation} />
            <Button title="Reset" onPress={resetMap} />
          </View>
        )}

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


      {/* Floating Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.buttonText}>Traffic</Text>
        </TouchableOpacity> */}

        {/* Floating Button for Traffic */}
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

      {/* Top-Right Corner Button (Assistant) - Positioned dynamically */}
      <TouchableOpacity
        style={[
          styles.topRightButton,
          showRouteInput && !hideInputs && { top: 220 }, // Adjust position when input fields are visible
        ]}
        onPress={() => setShowAssistantOverlay(true)}
      >
        <Text style={styles.buttonText}>Assistant</Text>
      </TouchableOpacity>

      {/* Assistant Overlay */}
      {showAssistantOverlay && (
        <View style={styles.overlay}>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={styles.overlayContent}
          >
            <View style={styles.syncContainer}>
              <Text style={styles.syncLabel}>Sync:</Text>
              <Text
                style={[
                  styles.syncStatus,
                  syncStatus === "Synced" && { color: "#00ff00" },
                ]}
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
  routeWiseButton: {
    position: "absolute",
    top: 10,
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
  inputContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
  },
  inputWrapper: {
    borderRadius: 25,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    top: 10,
    right: 10,
    zIndex: 1,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 80,
    left: 10,
    right: 10,
    alignItems: "center",
    backgroundColor: "transparent", // Changed to transparent to remove white background
    padding: 10,
    borderRadius: 10,
    minHeight: 80,
    maxHeight: 150,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    flexWrap: "wrap",
  },
  travelTimesPanel: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Keep background for travel times panel
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
  floatingButtons: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
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
  topRightButton: {
    position: "absolute",
    top: 10, // Default position
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
  calloutText: {
    fontSize: 12,
    color: "#333",
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
    shadowRadius: 10,
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
    shadowRadius: 4,
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
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    bottom: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;  


