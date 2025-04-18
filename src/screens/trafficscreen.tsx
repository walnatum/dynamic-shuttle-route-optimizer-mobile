
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import styles from "./styles/TrafficscreenStyles"; // Adjust the path if you placed the file in a different 


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



export default TrafficScreen;