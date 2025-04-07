import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import Config from "react-native-config";

type RootStackParamList = {
  ParentTrackingScreen: { driverCode: string };
};

const ParentTrackingScreen = ({ route }) => {
  const { driverCode } = route.params;
  const mapRef = useRef<MapView>(null);
  const [shuttleLocation, setShuttleLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [eta, setEta] = useState<string>("Calculating...");
  const [shuttleName, setShuttleName] = useState<string>("");
  const [destination, setDestination] = useState<string>("");

  const defaultRegion = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const response = await fetch(`${Config.API_BASE_URL}/api/shuttle-tracking/`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ driver_code: driverCode }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Tracking error:", errorText);
          throw new Error("Failed to fetch tracking data");
        }

        const data = await response.json();
        setShuttleLocation(data.current_location);
        setRouteCoordinates(data.planned_route);
        setEta(data.eta_to_destination);
        setShuttleName(data.shuttle.reg_number);
        setDestination(data.destination);

        if (data.planned_route.length > 0) {
          mapRef.current?.fitToCoordinates(data.planned_route, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          });
        } else if (data.current_location) {
          mapRef.current?.animateToRegion({
            ...data.current_location,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.error("Tracking error:", error.message);
        setEta("Tracking unavailable");
      }
    };

    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [driverCode]);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={defaultRegion}>
        {shuttleLocation && (
          <Marker coordinate={shuttleLocation} title={shuttleName} pinColor="blue" />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#007AFF" />
        )}
      </MapView>
      <View style={styles.statusOverlay}>
        <Text style={styles.statusText}>
          {shuttleName} to {destination} - ETA: {eta}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  statusOverlay: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  statusText: { fontSize: 16, fontWeight: "bold" },
});

export default ParentTrackingScreen;