
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "./styles/TrafficscreenStyles";

const TrafficScreen = ({ navigation }) => {

    const initialRegion = {
        latitude: 0.3476,
        longitude: 32.5825,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const [trafficData, setTrafficData] = useState([]);
    const [region, setRegion] = useState(initialRegion);
    const [searchQuery, setSearchQuery] = useState('');
    const [marker, setMarker] = useState(null);
    const [currentLocation, setCurrentLocation] = useState('Kampala');
    const [showOverlay, setShowOverlay] = useState(true);
    const mapRef = useRef(null);
    const apiKey = 'AIzaSyBIq7bzSYsYJ65cLhtYsQTx_q0bBzRreWU';

    const goToHome = () => navigation.navigate("HomeScreen");
    const goToWeather = () => navigation.navigate("WeatherScreen");
    const goToTraffic = () => navigation.navigate("TrafficScreen");
    const goToCrash = () => navigation.navigate("CrashScreen");

    const fetchNearbyRoadsTraffic = async (centerLat, centerLng) => {
        const directionsPromises = [
            fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${centerLat + 0.01},${centerLng}&destination=${centerLat - 0.01},${centerLng}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`),
            fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${centerLat},${centerLng + 0.01}&destination=${centerLat},${centerLng - 0.01}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`),
            fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${centerLat + 0.01},${centerLng + 0.01}&destination=${centerLat - 0.01},${centerLng - 0.01}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`),
            fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${centerLat + 0.01},${centerLng - 0.01}&destination=${centerLat - 0.01},${centerLng + 0.01}&key=${apiKey}&mode=driving&departure_time=now&traffic_model=best_guess`)
        ];

        try {
            const responses = await Promise.all(directionsPromises);
            const data = await Promise.all(responses.map(res => res.json()));

            const roadsMap = new Map();

            data.forEach(routeData => {
                if (routeData.status === 'OK' && routeData.routes[0]) {
                    const steps = routeData.routes[0].legs[0].steps;

                    steps.forEach(step => {
                        const cleanInstruction = step.html_instructions.replace(/<[^>]*>/g, '');
                        const roadMatch = cleanInstruction.match(/(?:on|onto|to|via)\s(.+)/i);
                        const roadName = roadMatch ? roadMatch[1].split('(')[0].trim() : cleanInstruction.trim();

                        if (roadName) {
                            const distance = step.distance.value;
                            const duration = step.duration.value;
                            const durationInTraffic = step.duration_in_traffic?.value || duration;
                            const speed = distance / durationInTraffic;
                            const speedKmh = (speed * 3.6).toFixed(2);

                            let trafficCondition = 'Free';
                            if (speed < 5) trafficCondition = 'Congested';
                            else if (speed < 10) trafficCondition = 'Medium';

                            if (!roadsMap.has(roadName)) {
                                roadsMap.set(roadName, {
                                    road: roadName,
                                    trafficCondition,
                                    speedKmh,
                                    coordinates: step.polyline?.points || ''
                                });
                            }
                        }
                    });
                }
            });

            const nearbyRoads = Array.from(roadsMap.values());
            setTrafficData(nearbyRoads);
            setShowOverlay(true); // Ensure overlay is shown
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch nearby roads traffic data');
            console.error(error);
        }
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            if (geoData.status === 'OK') {
                const locality = geoData.results[0].address_components.find(
                    comp => comp.types.includes('locality')
                );
                return locality ? locality.long_name : geoData.results[0].formatted_address.split(',')[0];
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            searchQuery + ', Uganda'
        )}&key=${apiKey}`;
        try {
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();

            if (geoData.status === 'OK') {
                const { lat, lng } = geoData.results[0].geometry.location;
                const newRegion = {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };

                setRegion(newRegion);
                setMarker({ latitude: lat, longitude: lng });
                mapRef.current.animateToRegion(newRegion, 1000);

                const locationName = await reverseGeocode(lat, lng);
                if (locationName) setCurrentLocation(locationName);

                await fetchNearbyRoadsTraffic(lat, lng);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        
    navigation.setOptions({ headerShown: false });
        fetchNearbyRoadsTraffic(initialRegion.latitude, initialRegion.longitude);
        const interval = setInterval(() => {
            fetchNearbyRoadsTraffic(region.latitude, region.longitude);
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const onRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
        fetchNearbyRoadsTraffic(newRegion.latitude, newRegion.longitude);
    };

    const getTrafficIcon = (condition) => {
        switch (condition) {
            case 'Congested': return 'traffic-cone';
            case 'Medium': return 'car-speed-limiter';
            default: return 'highway';
        }
    };

    return (
        <View style={styles.container}>
            
            <View style={styles.customHeaderOverlay}>
        <Icon
          name="traffic-light"  // Or "navigate" or "map"
          size={24}
          color="#2563EB"
          style={styles.headerIcon}
        />
        <Text style={styles.customHeaderText}>RouteWise - Traffic</Text>
      </View>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsTraffic={true}
                onRegionChangeComplete={onRegionChangeComplete}
            >
                {marker && <Marker coordinate={marker} />}
            </MapView>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search a place in Uganda (e.g., Jinja)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Icon name="magnify" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {showOverlay && trafficData.length > 0 && (
                <View style={styles.trafficOverlay}>
                    <ScrollView>
                        <View style={styles.trafficCard}>
                            <Text style={styles.location}>{currentLocation}</Text>
                            <Text style={styles.trafficTitle}>Nearby Roads Traffic</Text>

                            <View style={styles.trafficContainer}>
                                {trafficData.map((data, index) => (
                                    <View key={index} style={styles.trafficItem}>
                                        <Icon
                                            name={getTrafficIcon(data.trafficCondition)}
                                            size={20}
                                            color={
                                                data.trafficCondition === 'Congested' ? '#FF2D55' :
                                                data.trafficCondition === 'Medium' ? '#FF9500' : '#007AFF'
                                            }
                                        />
                                        <Text style={styles.roadName} numberOfLines={1}>
                                            {data.road}
                                        </Text>
                                        <Text style={[
                                            styles.trafficCondition,
                                            data.trafficCondition === 'Congested' && { color: '#FF2D55' },
                                            data.trafficCondition === 'Medium' && { color: '#FF9500' }
                                        ]}>
                                            {data.trafficCondition} ({data.speedKmh} km/h)
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOverlay(false)}>
                                <Text style={styles.cancelButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            )}

            <View style={styles.floatingButtons}>
                {/* <TouchableOpacity style={styles.floatingButton} onPress={goToHome}>
                    <Icon name="home" size={24} color="#007AFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Home</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.floatingButton} onPress={goToWeather}>
                    <Icon name="cloud" size={24} color="#007AFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Weather</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
                    <Icon name="traffic-light" size={24} color="#007AFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Traffic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatingButton} onPress={goToCrash}>
                    <Icon name="alert" size={24} color="#007AFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Crash</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TrafficScreen;
