
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import crashesData from '../data/crashes.json';
import styles from "./styles/CrashScreenStyles";

const CrashScreen = ({ navigation }) => {
  const initialRegion = {
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState(initialRegion);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCrashes, setFilteredCrashes] = useState<any[]>([]);
  const [matchingCrashes, setMatchingCrashes] = useState<any[]>([]);
  const [selectedCrash, setSelectedCrash] = useState<any>(null);
  const [totalCrashes, setTotalCrashes] = useState(0);
  const [showMatchesOverlay, setShowMatchesOverlay] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const crashesPerPage = 10;
  const mapRef = useRef(null);

  const goToHome = () => navigation.navigate("HomeScreen");
  const goToWeather = () => navigation.navigate("WeatherScreen");
  const goToTraffic = () => navigation.navigate("TrafficScreen");
  const goToCrash = () => navigation.navigate("CrashScreen");

  useEffect(() => {
    
    navigation.setOptions({ headerShown: false });
    try {
      const validCrashes = crashesData.filter(crash => {
        const lat = parseFloat(crash.lat);
        const long = parseFloat(crash.long);
        return !isNaN(lat) && !isNaN(long);
      });
      setTotalCrashes(validCrashes.length);
    } catch (error) {
      console.error('Error loading crash data:', error);
      setTotalCrashes(0);
    }
  }, []);

  const safeStringCompare = (str: any, query: string): boolean => {
    const strValue = str ? String(str) : '';
    return strValue.toLowerCase().includes(query.toLowerCase());
  };

  const findMatchingCrashes = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const matches = crashesData.filter(crash => {
      const locationMatch = safeStringCompare(crash.crashLocation, lowerQuery);
      const roadMatch = safeStringCompare(crash.road, lowerQuery);
      const villageMatch = safeStringCompare(crash.village, lowerQuery);
      return locationMatch || roadMatch || villageMatch;
    });
    return matches;
  };

  const fitMapToMarkers = (crashes: any[]) => {
    if (!crashes.length || !mapRef.current) return;

    const coordinates = crashes.map(crash => ({
      latitude: parseFloat(crash.lat),
      longitude: parseFloat(crash.long),
    }));

    if (coordinates.length === 1) {
      mapRef.current.animateToRegion({
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    try {
      const matches = findMatchingCrashes(trimmedQuery);
      setMatchingCrashes(matches);
      setShowMatchesOverlay(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search crashes. Please try again.');
    }
  };

  const handleMatchesOverlayClose = () => {
    setShowMatchesOverlay(false);
    if (matchingCrashes.length > 0) {
      setCurrentPage(1);
      setTotalPages(Math.ceil(matchingCrashes.length / crashesPerPage));
      
      const startIndex = 0;
      const endIndex = Math.min(crashesPerPage, matchingCrashes.length);
      const initialCrashes = matchingCrashes.slice(startIndex, endIndex);
      setFilteredCrashes(initialCrashes);
      fitMapToMarkers(initialCrashes);
    } else {
      Alert.alert('No Results', `No crashes found matching "${searchQuery}"`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const startIndex = (newPage - 1) * crashesPerPage;
      const endIndex = Math.min(newPage * crashesPerPage, matchingCrashes.length);
      const crashesToShow = matchingCrashes.slice(startIndex, endIndex);
      setFilteredCrashes(crashesToShow);
      fitMapToMarkers(crashesToShow);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const startIndex = (newPage - 1) * crashesPerPage;
      const endIndex = newPage * crashesPerPage;
      const crashesToShow = matchingCrashes.slice(startIndex, endIndex);
      setFilteredCrashes(crashesToShow);
      fitMapToMarkers(crashesToShow);
    }
  };

  const getVehicleIcon = (vehicleType?: string) => {
    if (!vehicleType) return 'car-side';
    const type = vehicleType.toLowerCase();
    if (type.includes('motorcycle')) return 'motorbike';
    if (type.includes('car')) return 'car';
    if (type.includes('bus')) return 'bus';
    if (type.includes('truck')) return 'truck';
    if (type.includes('bicycle')) return 'bicycle';
    return 'car-side';
  };

  return (
    <View style={styles.container}>
                  <View style={styles.customHeaderOverlay}>
        <Icon
          name="alert"  // Or "navigate" or "map"
          size={24}
          color="#2563EB"
          style={styles.headerIcon}
        />
        <Text style={styles.customHeaderText}>RouteWise - Crash</Text>
      </View>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
      >
        {filteredCrashes.map((crash, index) => {
          const lat = parseFloat(crash.lat);
          const long = parseFloat(crash.long);
          
          if (isNaN(lat) || isNaN(long)) return null;

          return (
            <Marker
              key={`crash-${(currentPage - 1) * crashesPerPage + index}`}
              coordinate={{ latitude: lat, longitude: long }}
              onPress={() => setSelectedCrash(crash)}
            >
              <View style={styles.markerContainer}>
                <Icon 
                  name={getVehicleIcon(crash.vehicleType)} 
                  size={28} 
                  color="#FF0000" 
                />
                <Text style={styles.markerText}>
                  {crash.monthOfCrash?.substring(0, 3) || '???'}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a place (e.g., Jinja Road)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="magnify" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showMatchesOverlay && (
        <Modal
          visible={showMatchesOverlay}
          transparent={true}
          animationType="fade"
          onRequestClose={handleMatchesOverlayClose}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Search Results</Text>
              <Text style={styles.modalMessage}>
                Found {matchingCrashes.length} crashes matching "{searchQuery}"
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleMatchesOverlayClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {filteredCrashes.length > 0 && !showMatchesOverlay && !selectedCrash && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <Text style={styles.paginationButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
          
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.paginationButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedCrash && (
        <View style={styles.crashOverlay}>
          <ScrollView>
            <View style={styles.crashCard}>
              <Text style={styles.location}>
                {selectedCrash.crashLocation || 'Accident Details'}
              </Text>
              
              <View style={styles.vehicleRow}>
                <Icon 
                  name={getVehicleIcon(selectedCrash.vehicleType)} 
                  size={24} 
                  color="#FF0000" 
                />
                <Text style={styles.vehicleText}>
                  {selectedCrash.vehicleType || 'Unknown vehicle type'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.monthOfCrash || 'Unknown date'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cause:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.causeOfCrash || 'Unknown'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Road:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.road || 'Unknown road'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Village:</Text>
                <Text style={styles.detailValue}>
                  {selectedCrash.village || 'Unknown area'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coordinates:</Text>
                <Text style={styles.detailValue}>
                  {parseFloat(selectedCrash.lat).toFixed(6)}, {parseFloat(selectedCrash.long).toFixed(6)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedCrash(null)}
              >
                <Text style={styles.cancelButtonText}>Close Details</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {!filteredCrashes.length && !showMatchesOverlay && (
        <View style={styles.infoOverlay}>
          <Text style={styles.infoTitle}>Crash Statistics</Text>
          <Text style={styles.infoText}>Total Crashes: {totalCrashes}</Text>
          <Text style={styles.infoText}>
            Search for a location to view crash data
          </Text>
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

export default CrashScreen;