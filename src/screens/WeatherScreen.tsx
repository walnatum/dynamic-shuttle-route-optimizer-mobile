import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For weather icons
import styles from "./styles/WeatherScreenStyles"; // Adjust the path if you placed the file in a different 


const WeatherScreen = () => {
  // Initial region set to Kampala, Uganda
  const initialRegion = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState(initialRegion);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);
  const [showHourlyData, setShowHourlyData] = useState(false);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const apiKey = 'e6be8acb4dee4f0094f4ad3e94645f72'; // Weatherstack API key

  // Fetch weather data from Weatherstack
  const fetchWeatherData = async (location) => {
    try {
      const response = await fetch(
        `http://api.weatherstack.com/current?access_key=${apiKey}&query=${encodeURIComponent(location)},Uganda`
      );
      const data = await response.json();

      if (data.success === false) {
        Alert.alert('Error', data.error.info);
        return null;
      }
      return data;
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data. Check your connection.');
      console.error(error);
      return null;
    }
  };

  // Simulate hourly data (Weatherstack doesn't provide this, so we'll mock it)
  const fetchHourlyData = (weather) => {
    const hourlyMock = [];
    const currentHour = new Date().getHours();
    for (let i = 0; i < 6; i++) {
      const hour = (currentHour + i) % 24;
      const condition = weather.weather_descriptions[0];
      hourlyMock.push({
        time: `${hour}:00 - ${hour + 1}:00`,
        condition: condition === 'Rain' ? 'Rain' : condition === 'Sunny' ? 'Sunny' : 'Cloudy',
        temp: weather.temperature + Math.floor(Math.random() * 5 - 2), // Random variation
      });
    }
    setHourlyData(hourlyMock);
  };

  // Search and update map location
  const handleSearch = async () => {
    if (!searchQuery) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    // Use Google Maps Geocoding API to get coordinates (you'd need a separate API key for production)
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      searchQuery + ', Uganda'
    )}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`; // Replace with your Google API key
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

        const weather = await fetchWeatherData(searchQuery);
        if (weather) {
          setWeatherData(weather);
          fetchHourlyData(weather.current);
          setShowWeatherOverlay(true);
        }
      } else {
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
      console.error(error);
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'weather-sunny';
      case 'rain':
        return 'weather-rainy';
      case 'cloudy':
        return 'weather-cloudy';
      default:
        return 'weather-partly-cloudy';
    }
  };

  // Load default weather for Kampala on mount
  useEffect(() => {
    const loadDefaultWeather = async () => {
      const weather = await fetchWeatherData('Kampala');
      if (weather) {
        setWeatherData(weather);
        fetchHourlyData(weather.current);
      }
    };
    loadDefaultWeather();
  }, []);

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a city in Uganda (e.g., Kampala)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="magnify" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Weather Overlay */}
      {showWeatherOverlay && weatherData && (
        <View style={styles.weatherOverlay}>
          <ScrollView>
            <View style={styles.weatherCard}>
              <Text style={styles.location}>
                {weatherData.location.name}, Uganda
              </Text>
              <View style={styles.tempContainer}>
                <Icon
                  name={getWeatherIcon(weatherData.current.weather_descriptions[0])}
                  size={40}
                  color="#ff8c00"
                />
                <Text style={styles.temp}>
                  {weatherData.current.temperature}°C
                </Text>
              </View>
              <Text style={styles.weatherDesc}>
                {weatherData.current.weather_descriptions[0]}
              </Text>
              <View style={styles.weatherDetails}>
                <Text style={styles.detail}>
                  Feels like: {weatherData.current.feelslike}°C
                </Text>
                <Text style={styles.detail}>
                  Humidity: {weatherData.current.humidity}%
                </Text>
                <Text style={styles.detail}>
                  Wind: {weatherData.current.wind_speed} km/h{' '}
                  {weatherData.current.wind_dir}
                </Text>
              </View>
              <Text style={styles.lastUpdated}>
                Last updated:{' '}
                {new Date(weatherData.location.localtime).toLocaleString()}
              </Text>

              {/* Hourly Data Button */}
              <TouchableOpacity
                style={styles.hourlyButton}
                onPress={() => setShowHourlyData(!showHourlyData)}
              >
                <Text style={styles.buttonText}>
                  {showHourlyData ? 'Hide Hourly Data' : 'Show Hourly Data'}
                </Text>
              </TouchableOpacity>

              {/* Hourly Data */}
              {showHourlyData && (
                <View style={styles.hourlyContainer}>
                  {hourlyData.map((hour, index) => (
                    <View key={index} style={styles.hourlyItem}>
                      <Icon
                        name={getWeatherIcon(hour.condition)}
                        size={20}
                        color="#ff8c00"
                      />
                      <Text style={styles.hourlyText}>
                        {hour.time}: {hour.condition}, {hour.temp}°C
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowWeatherOverlay(false);
                  setSearchQuery('');
                  setMarker(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Search Another Place</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Default Weather Display */}
      {!showWeatherOverlay && weatherData && (
        <View style={styles.defaultWeather}>
          <Text style={styles.defaultTitle}>Current Weather</Text>
          <View style={styles.defaultCard}>
            <Text style={styles.location}>
              {weatherData.location.name}, Uganda
            </Text>
            <View style={styles.tempContainer}>
              <Icon
                name={getWeatherIcon(weatherData.current.weather_descriptions[0])}
                size={50}
                color="#ff8c00"
              />
              <Text style={styles.temp}>
                {weatherData.current.temperature}°C
              </Text>
            </View>
            <Text style={styles.weatherDesc}>
              {weatherData.current.weather_descriptions[0]}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};



export default WeatherScreen;