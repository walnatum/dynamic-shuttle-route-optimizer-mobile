



import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { decode } from '@mapbox/polyline'; // For decoding Google Maps polyline

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

  const mapRef = useRef(null);

  const apiKey = 'AIzaSyBIq7bzSYsYJ65cLhtYsQTx_q0bBzRreWU'; // Your Google Maps API key
  // const backendUrl = 'http://10.0.2.2:5000/get_route'; // Update if hosted on Render
  const backendUrl = 'https://routewise-ml.onrender.com/get_route'; // Update if hosted on Render


  

  // Hide the default navigation header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // This removes the "ModelDemoScreen" navigation bar
    });
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

    let startCoords, endCoords;
    try {
      const startResult = await getPlaceCoordinates(start);
      if (!startResult) {
        Alert.alert('Error', `Could not find the starting location: ${start}`);
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
        return;
      }
      endCoords = { lat: endResult.latitude, lng: endResult.longitude };
      setDestinationMarker({
        latitude: endResult.latitude,
        longitude: endResult.longitude,
      });

      // Fetch Google Maps route
      const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.lat},${startCoords.lng}&destination=${endCoords.lat},${endCoords.lng}&key=${apiKey}&mode=driving`;
      const response = await fetch(drivingUrl);
      const data = await response.json();
      if (data.status === 'OK') {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        setTravelTimes([data.routes[0].legs[0].duration.text]);
        mapRef.current?.fitToCoordinates(points, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
        setTravelTimesByMode({ driving: data.routes[0].legs[0].duration.text });
      } else {
        Alert.alert('Error', `Could not find a driving route: ${data.status}`);
        return;
      }

      // Fetch smart model route from backend
      console.log('Fetching smart route from backend...');
      try {
        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start, end }),
        });
        console.log('Backend response status:', backendResponse.status);
        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('Backend error response:', errorText);
          Alert.alert('Backend Error', `Failed to fetch smart route: ${errorText}`);
          return;
        }

        const backendData = await backendResponse.json();
        console.log('Backend data:', JSON.stringify(backendData, null, 2));

        if (backendData.error) {
          console.error('Backend returned an error:', backendData.error);
          Alert.alert('Backend Error', `Backend error: ${backendData.error}`);
          return;
        }

        const bestRoute = backendData.best_route;
        if (!bestRoute || !bestRoute.points) {
          console.error('Invalid backend response: best_route or points missing');
          Alert.alert('Backend Error', 'Invalid response from backend: missing best route or points');
          return;
        }

        setSmartRouteCoordinates(bestRoute.points);
        setSmartTravelTimes([bestRoute.duration_in_traffic]);
        setRouteDetails({
          ...bestRoute.details,
          total_score: bestRoute.total_score,
          normalized_score: bestRoute.normalized_score,
        });
        mapRef.current?.fitToCoordinates([...points, ...bestRoute.points], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
      } catch (backendError) {
        console.error('Error fetching smart route:', backendError);
        Alert.alert('Backend Error', `Failed to fetch smart route: ${backendError.message}`);
        return;
      }

    } catch (error) {
      console.error('General error in calculateRoute:', error);
      Alert.alert('Error', 'Failed to fetch routes: ' + error.message);
      return;
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
    mapRef.current?.animateToRegion({
      latitude: 0.3476, // Default to Kampala, Uganda
      longitude: 32.5825,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>RouteWise - Model Demo</Text>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 0.3476, // Kampala, Uganda
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
          <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth= {4} />
        )}
        {smartRouteCoordinates.length > 0 && (
          <Polyline coordinates={smartRouteCoordinates} strokeColor="green" strokeWidth={4} />
        )}
      </MapView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Start location (e.g., Kampala, Uganda)"
          value={start}
          onChangeText={setStart}
        />
        <TextInput
          style={styles.input}
          placeholder="End location (e.g., Jinja, Uganda)"
          value={end}
          onChangeText={setEnd}
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Calculate Route"
            onPress={calculateRoute}
            color="#1E90FF"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Cancel"
            onPress={resetMap}
            color="#FF4444"
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        {travelTimesByMode && (
          <View style={styles.travelTimesPanel}>
            <Text style={styles.timeTitle}>Route Details</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.icon}>🚗</Text>
                <Text style={styles.listText}>
                  Google: {travelTimesByMode.driving || 'Not available'}
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
                  Traffic Risk: {routeDetails?.avg_traffic_score?.toFixed(2) || 'N/A'}
                </Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.icon}>⚠️</Text>
                <Text style={styles.listText}>
                  Crash Risk: {routeDetails?.avg_crash_score?.toFixed(2) || 'N/A'}
                </Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.icon}>⛅</Text>
                <Text style={styles.listText}>
                  Weather Risk: {routeDetails?.avg_weather_score?.toFixed(2) || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F5', // Light gray background for subtle contrast
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
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E90FF', // Blue color for the title
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    top: 60, // Adjusted to sit below the header
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
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
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
    color: '#1E90FF', // Blue for title
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



