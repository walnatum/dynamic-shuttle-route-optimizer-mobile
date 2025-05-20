import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "./styles/WeatherScreenStyles";

const WeatherScreen = ({ navigation }) => {
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
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('Kampala');
  const mapRef = useRef(null);
  const apiKey = '7e4608c65c1d3bd4fabca0d0b0910025';

  const goToTraffic = () => navigation.navigate("TrafficScreen");
  const goToWeather = () => navigation.navigate("WeatherScreen");
  const goToCrash = () => navigation.navigate("CrashScreen");
  // Add this with the other navigation functions
  const goToHome = () => navigation.navigate("HomeScreen"); 

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `http://api.weatherstack.com/current?access_key=${apiKey}&query=${lat},${lon}`
      );
      const data = await response.json();
      return data.success === false ? null : data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      if (geoData.status === 'OK') {
        // Extract just the locality name (e.g., "Jinja") without address components
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

  const fetchHourlyData = (weather) => {
    const hourlyMock = [];
    const currentHour = new Date().getHours();
    const condition = weather.weather_descriptions[0];
    
    for (let i = 0; i < 6; i++) {
      const hour = (currentHour + i) % 24;
      hourlyMock.push({
        time: `${hour}:00 - ${hour + 1}:00`,
        condition: condition.includes('Rain') ? 'Rain' : 
                 condition.includes('Sunny') ? 'Sunny' : 'Cloudy',
        temp: weather.temperature + Math.floor(Math.random() * 5 - 2),
      });
    }
    setHourlyData(hourlyMock);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      searchQuery + ', Uganda'
    )}&key=AIzaSyDmSlFirzRkhgtbOaMhh1SzlbygYTEKkzg`;
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

        const weather = await fetchWeatherData(lat, lng);
        if (weather) {
          setWeatherData(weather);
          fetchHourlyData(weather.current);
          setShowWeatherOverlay(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'weather-sunny';
      case 'rain': return 'weather-rainy';
      case 'cloudy': return 'weather-cloudy';
      default: return 'weather-partly-cloudy';
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    const loadDefaultWeather = async () => {
      const weather = await fetchWeatherData(initialRegion.latitude, initialRegion.longitude);
      if (weather) {
        setWeatherData(weather);
        fetchHourlyData(weather.current);
      }
    };
    loadDefaultWeather();
  }, [navigation]);

  return (
    <View style={styles.container}>

            <View style={styles.customHeaderOverlay}>
              <Icon
                name="cloud"  // Or "navigate" or "map"
                size={24}
                color="#2563EB"
                style={styles.headerIcon}
              />
              <Text style={styles.customHeaderText}>RouteWise - Weather</Text>
            </View>
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={async (region) => {
          setRegion(region);
          const weather = await fetchWeatherData(region.latitude, region.longitude);
          if (weather) {
            setWeatherData(weather);
            fetchHourlyData(weather.current);
            const locationName = await reverseGeocode(region.latitude, region.longitude);
            if (locationName) setCurrentLocation(locationName);
          }
        }}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a city in Uganda (e.g., Jinja)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="magnify" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showWeatherOverlay && weatherData && (
        <View style={styles.weatherOverlay}>
          <ScrollView>
            <View style={styles.weatherCard}>
              <Text style={styles.location}>{currentLocation}</Text>
              <Text style={styles.date}>
                {new Date(weatherData.location.localtime).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              
              <View style={styles.tempContainer}>
                <Icon
                  name={getWeatherIcon(weatherData.current.weather_descriptions[0])}
                  size={50}
                  color="#007AFF"
                />
                <Text style={styles.temp}>
                  {weatherData.current.temperature}°C
                </Text>
              </View>
              
              <Text style={styles.weatherDesc}>
                {weatherData.current.weather_descriptions[0]}
              </Text>

              <Text style={styles.hourlyForecastTitle}>Hourly Forecast</Text>
              <View style={styles.hourlyContainer}>
                {hourlyData.map((hour, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={styles.hourlyTime}>{hour.time}</Text>
                    <Icon
                      name={getWeatherIcon(hour.condition)}
                      size={24}
                      color="#007AFF"
                      style={styles.hourlyIcon}
                    />
                    <Text style={styles.hourlyTemp}>{hour.temp}°C</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.floatingButtons}>
      {/* <TouchableOpacity style={styles.floatingButton} onPress={goToHome}>
      <Icon name="home" size={24} color="#007AFF" style={styles.buttonIconHome} />
      <Text style={styles.buttonTextHome}>Home</Text>
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

export default WeatherScreen;