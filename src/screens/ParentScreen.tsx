import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { decode } from '@mapbox/polyline'; // For decoding Google Maps polyline

const ParentScreen = () => {
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
  const backendUrl = 'http://10.0.2.2:5000/get_route'; // Update if hosted on Render

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
          <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={4} />
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
        <Button title="Calculate Route" onPress={calculateRoute} />
      </View>
      <View style={styles.bottomContainer}>
        {travelTimesByMode && (
          <View style={styles.travelTimesPanel}>
            <Text style={styles.timeTitle}>Estimated Travel Times</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>🚗 Google: {travelTimesByMode.driving}</Text>
              {smartTravelTimes.length > 0 ? (
                <Text style={styles.timeText}>🌟 Smart Route: {smartTravelTimes[0]}</Text>
              ) : (
                <Text style={styles.timeText}>🌟 Smart Route: Not available</Text>
              )}
            </View>
            {routeDetails ? (
              <View style={styles.routeDetails}>
                <Text style={styles.timeText}>Total Score: {routeDetails.total_score?.toFixed(2) || 'N/A'}</Text>
                <Text style={styles.timeText}>Normalized Score: {routeDetails.normalized_score?.toFixed(2) || 'N/A'}</Text>
                <Text style={styles.timeText}>Traffic Risk: {routeDetails.avg_traffic_score?.toFixed(2) || 'N/A'}</Text>
                <Text style={styles.timeText}>Crash Risk: {routeDetails.avg_crash_score?.toFixed(2) || 'N/A'}</Text>
                <Text style={styles.timeText}>Weather Risk: {routeDetails.avg_weather_score?.toFixed(2) || 'N/A'}</Text>
              </View>
            ) : (
              <View style={styles.routeDetails}>
                <Text style={styles.timeText}>Smart Route Details: Not available</Text>
              </View>
            )}
            <Button title="Cancel" onPress={resetMap} />
          </View>
        )}
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
  inputContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  travelTimesPanel: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    marginBottom: 3,
  },
  routeDetails: {
    marginTop: 10,
  },
});

export default ParentScreen;