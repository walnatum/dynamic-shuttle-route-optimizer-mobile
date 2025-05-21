import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { decode } from '@mapbox/polyline';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ModelDemoScreen = ({ navigation }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [smartRouteCoordinates, setSmartRouteCoordinates] = useState([]);
  const [travelTimes, setTravelTimes] = useState([]);
  const [smartTravelTimes, setSmartTravelTimes] = useState([]);
  const [travelTimesByMode, setTravelTimesByMode] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedMode, setSelectedMode] = useState('driving');
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const apiKey = 'AIzaSyBIq7bzSYsYJ65cLhtYsQTx_q0bBzRreWU';
  const backendUrl = 'https://routewise-ml.onrender.com/get_route';

  // Fade-in animation for route details panel
  useEffect(() => {
    if (travelTimesByMode && showDetails) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [travelTimesByMode, showDetails]);

  // Hide navigation header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const getPlaceCoordinates = async (place) => {
    if (!place) return null;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      } else if (data.status === 'ZERO_RESULTS') {
        const fallbackUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place + ', Uganda')}&key=${apiKey}`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.status === 'OK' && fallbackData.results.length > 0) {
          const location = fallbackData.results[0].geometry.location;
          return { latitude: location.lat, longitude: location.lng };
        }
        console.warn(`Geocoding failed for ${place}: ${data.status}`);
        return null;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const decodePolyline = (encoded) => {
    const points = decode(encoded);
    return points.map(point => ({ latitude: point[0], longitude: point[1] }));
  };

  const calculateRoute = async () => {
    if (!start || !end) {
      Alert.alert('Error', 'Please enter both start and end locations.');
      return;
    }

    setIsLoading(true);
    let startCoords, endCoords;
    try {
      const startResult = await getPlaceCoordinates(start);
      if (!startResult) {
        Alert.alert('Error', `Could not find the starting location: ${start}`);
        setIsLoading(false);
        return;
      }
      startCoords = { lat: startResult.latitude, lng: startResult.longitude };
      setStartMarker({
        latitude: startResult.latitude,
        longitude: startResult.longitude,
      });

      const endResult = await getPlaceCoordinates(end);
      if (!endResult) {
        Alert.alert('Error', `Could not find the destination: ${end}`);
        setIsLoading(false);
        return;
      }
      endCoords = { lat: endResult.latitude, lng: endResult.longitude };
      setDestinationMarker({
        latitude: endResult.latitude,
        longitude: endResult.longitude,
      });

      // Fetch Google Maps route
      const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=${selectedMode}`;
      const response = await fetch(drivingUrl);
      const data = await response.json();
      if (data.status === 'OK') {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        setTravelTimes([data.routes[0].legs[0].duration.text]);
        mapRef.current?.fitToCoordinates(points, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
        setTravelTimesByMode({ [selectedMode]: data.routes[0].legs[0].duration.text });
      } else {
        Alert.alert('Error', `Could not find a ${selectedMode} route: ${data.status}`);
        setIsLoading(false);
        return;
      }

      // Fetch smart model route from backend
      console.log('Fetching smart route from backend...');
      try {
        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start, end, mode: selectedMode }),
        });
        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('Backend error response:', errorText);
          Alert.alert('Backend Error', `Failed to fetch smart route: ${errorText}`);
          setIsLoading(false);
          return;
        }

        const backendData = await backendResponse.json();
        console.log('Backend data:', JSON.stringify(backendData, null, 2));

        if (backendData.error) {
          console.error('Backend returned an error:', backendData.error);
          Alert.alert('Backend Error', `Backend error: ${backendData.error}`);
          setIsLoading(false);
          return;
        }

        const bestRoute = backendData.best_route || {};
        if (!bestRoute.points || !Array.isArray(bestRoute.points)) {
          console.error('Invalid backend response: best_route.points is missing or not an array', backendData);
          Alert.alert('Backend Error', 'Invalid response from backend: missing or invalid best_route.points');
          setIsLoading(false);
          return;
        }

        setSmartRouteCoordinates(bestRoute.points);
        setSmartTravelTimes([bestRoute.duration_in_traffic || 'N/A']);
        setRouteDetails({
          ...bestRoute.details,
          total_score: bestRoute.total_score || 'N/A',
          normalized_score: bestRoute.normalized_score || 'N/A',
          avg_traffic_score: bestRoute.details?.avg_traffic_score || 0,
          avg_crash_score: bestRoute.details?.avg_crash_score || 0,
          avg_weather_score: bestRoute.details?.avg_weather_score || 0,
        });
        mapRef.current?.fitToCoordinates([...points, ...bestRoute.points], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
      } catch (backendError) {
        // console.error('Error fetching smart route:', backendError);
        // Alert.alert('Backend Error', `Failed to fetch smart route: ${backendError.message}`);
      }
    } catch (error) {
      console.error('General error in calculateRoute:', error);
      Alert.alert('Error', 'Failed to fetch routes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMap = () => {
    setStart('');
    setEnd('');
    setRouteCoordinates([]);
    setSmartRouteCoordinates([]);
    setTravelTimes([]);
    setSmartTravelTimes([]);
    setTravelTimesByMode(null);
    setStartMarker(null);
    setDestinationMarker(null);
    setRouteDetails(null);
    setShowDetails(true);
    mapRef.current?.animateToRegion({
      latitude: 0.3476,
      longitude: 32.5825,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    });
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const clearStartInput = () => {
    setStart('');
    if (!end && !routeCoordinates.length) resetMap();
  };

  const clearEndInput = () => {
    setEnd('');
    if (!start && !routeCoordinates.length) resetMap();
  };

  // Ensure scores are numbers and handle toFixed safely
  const formatScore = (value) => {
    return typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : 'N/A';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1E90FF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>RouteWise - ML Model</Text>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 0.3476,
          longitude: 32.5825,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {startMarker && (
          <Marker coordinate={startMarker} title="Start" pinColor="green" />
        )}
        {destinationMarker && (
          <Marker coordinate={destinationMarker} title="Destination" pinColor="red" />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={4} />
        )}
        {smartRouteCoordinates.length > 0 && (
          <Polyline coordinates={smartRouteCoordinates} strokeColor="green" strokeWidth={4} />
        )}
      </MapView>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Kampala Serena Hotel, Uganda"
            placeholderTextColor="#888"
            value={start}
            onChangeText={setStart}
            returnKeyType="next"
          />
          {start && (
            <TouchableOpacity style={styles.clearButton} onPress={clearStartInput}>
              <Icon name="cancel" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Jinja Nile Resort, Uganda"
            placeholderTextColor="#888"
            value={end}
            onChangeText={setEnd}
            returnKeyType="go"
            onSubmitEditing={calculateRoute}
          />
          {end && (
            <TouchableOpacity style={styles.clearButton} onPress={clearEndInput}>
              <Icon name="cancel" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.modeButtonRow}>
          {['drive', 'walk', 'cycle', 'transit'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeButton, selectedMode === mode && styles.modeButtonActive]}
              onPress={() => setSelectedMode(mode)}
            >
              <Icon
                name={
                  mode === 'drive' ? 'directions-car' :
                  mode === 'walk' ? 'directions-walk' :
                  mode === 'cycle' ? 'directions-bike' :
                  'directions-transit'
                }
                size={24}
                color={selectedMode === mode ? '#fff' : '#666'}
              />
              <Text style={[styles.modeButtonText, selectedMode === mode && styles.modeButtonTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? 'Calculating...' : 'Calculate Route'}
            onPress={calculateRoute}
            color="#1E90FF"
            disabled={isLoading}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Cancel"
            onPress={resetMap}
            color="#FF4444"
            disabled={isLoading}
          />
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={styles.loadingText}>Calculating routes...</Text>
        </View>
      )}
      {travelTimesByMode && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleDetails}>
            <Text style={styles.toggleButtonText}>{showDetails ? 'Hide Details' : 'Show Details'}</Text>
          </TouchableOpacity>
          {showDetails && (
            <Animated.View style={[styles.travelTimesPanel, { opacity: fadeAnim }]}>
              <Text style={styles.timeTitle}>Route Details</Text>
              <View style={styles.listContainer}>
                <View style={styles.listItem}>
                  <Text style={styles.icon}>🚗</Text>
                  <Text style={styles.listText}>
                    Google: {travelTimesByMode[selectedMode] || 'Not available'}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.icon}>🌟</Text>
                  <Text style={styles.listText}>
                    Smart Route: {smartTravelTimes.length > 0 ? smartTravelTimes[0] : 'Not available'}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.icon}>🚦</Text>
                  <Text style={styles.listText}>
                    Traffic Risk: {formatScore(routeDetails?.avg_traffic_score)}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.icon}>⚠️</Text>
                  <Text style={styles.listText}>
                    Crash Risk: {formatScore(routeDetails?.avg_crash_score)}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.icon}>⛅</Text>
                  <Text style={styles.listText}>
                    Weather Risk: {formatScore(routeDetails?.avg_weather_score)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F5',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E90FF',
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 999,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearButton: {
    padding: 10,
  },
  modeButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14, // Increased further for better coverage
    paddingHorizontal: 13, // Increased to ensure text fits
    borderRadius: 8,
    marginHorizontal: 5,
  },
  modeButtonActive: {
    backgroundColor: '#1E90FF',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  modeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1E90FF',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
  },
  toggleButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  travelTimesPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E90FF',
    marginBottom: 10,
  },
  listContainer: {
    marginVertical: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
    width: 30,
    textAlign: 'center',
  },
  listText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default ModelDemoScreen;