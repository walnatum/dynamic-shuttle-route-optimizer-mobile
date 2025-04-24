import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import crashesData from '../data/crashes.json';

const CrashScreen = () => {
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
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    try {
      const validCrashes = crashesData.filter(crash => {
        const lat = parseFloat(crash.lat);
        const long = parseFloat(crash.long);
        return !isNaN(lat) && !isNaN(long);
      });
      setTotalCrashes(validCrashes.length);
      console.log(`Total valid crashes: ${validCrashes.length}`);
      if (validCrashes.length > 0) {
        console.log('Sample crash 1:', validCrashes[0]);
        if (validCrashes.length > 1) console.log('Sample crash 2:', validCrashes[1]);
      }
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
    console.log(`Finding crashes matching query: "${query}"`);
    const matches = crashesData.filter(crash => {
      const locationMatch = safeStringCompare(crash.crashLocation, lowerQuery);
      const roadMatch = safeStringCompare(crash.road, lowerQuery);
      const villageMatch = safeStringCompare(crash.village, lowerQuery);
      console.log(`Crash (Location: ${crash.crashLocation}, Road: ${crash.road}, Village: ${crash.village}, Lat: ${crash.lat}, Long: ${crash.long}) - Matches query "${query}": ${locationMatch || roadMatch || villageMatch}`);
      return locationMatch || roadMatch || villageMatch;
    });
    console.log(`Found ${matches.length} crashes matching query`);
    return matches;
  };

  const fitMapToMarkers = (crashes: any[]) => {
    if (!crashes.length || !mapRef.current) return;

    const coordinates = crashes.map(crash => ({
      latitude: parseFloat(crash.lat), // Correct: lat as latitude
      longitude: parseFloat(crash.long), // Correct: long as longitude
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
      console.log('Searching for crashes...');
      const matches = findMatchingCrashes(trimmedQuery);
      setMatchingCrashes(matches);
      setShowMatchesOverlay(true);
      console.log('Setting showMatchesOverlay to true');
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search crashes. Please try again.');
    }
  };

  const handleMatchesOverlayClose = () => {
    console.log('Closing matches overlay');
    setShowMatchesOverlay(false);
    if (matchingCrashes.length > 0) {
      setCurrentPage(1);
      setTotalPages(Math.ceil(matchingCrashes.length / crashesPerPage));
      
      const startIndex = 0;
      const endIndex = Math.min(crashesPerPage, matchingCrashes.length);
      const initialCrashes = matchingCrashes.slice(startIndex, endIndex);
      setFilteredCrashes(initialCrashes);
      console.log(`Displaying crashes ${startIndex + 1}-${endIndex} of ${matchingCrashes.length}`);
      initialCrashes.forEach((crash, index) => {
        console.log(`Marker ${startIndex + index + 1}: Latitude: ${crash.lat}, Longitude: ${crash.long} (Location: ${crash.crashLocation})`);
      });
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
      console.log(`Displaying crashes ${startIndex + 1}-${endIndex} of ${matchingCrashes.length}`);
      crashesToShow.forEach((crash, index) => {
        console.log(`Marker ${startIndex + index + 1}: Latitude: ${crash.lat}, Longitude: ${crash.long} (Location: ${crash.crashLocation})`);
      });
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
      console.log(`Displaying crashes ${startIndex + 1}-${endIndex} of ${matchingCrashes.length}`);
      crashesToShow.forEach((crash, index) => {
        console.log(`Marker ${startIndex + index + 1}: Latitude: ${crash.lat}, Longitude: ${crash.long} (Location: ${crash.crashLocation})`);
      });
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
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
      >
        {filteredCrashes.map((crash, index) => {
          const lat = parseFloat(crash.lat); // Correct: lat as latitude
          const long = parseFloat(crash.long); // Correct: long as longitude
          
          if (isNaN(lat) || isNaN(long)) {
            console.warn(`Invalid coordinates for crash at index ${index}: Lat: ${crash.lat}, Long: ${crash.long}`);
            return null;
          }

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
                <View style={styles.markerLabel}>
                  <Text style={styles.markerText}>
                    {crash.monthOfCrash?.substring(0, 3) || '???'}
                  </Text>
                </View>
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
            Showing crashes {(currentPage - 1) * crashesPerPage + 1}-
            {Math.min(currentPage * crashesPerPage, matchingCrashes.length)} of {matchingCrashes.length}
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
              <Text style={styles.crashLocation}>
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
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedCrash(null)}
          >
            <Icon name="close-circle" size={30} color="#FF0000" />
          </TouchableOpacity>
        </View>
      )}

      {!filteredCrashes.length && !showMatchesOverlay && (
        <View style={styles.infoOverlay}>
          <Text style={styles.infoTitle}>Crash Statistics</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Total Crashes: {totalCrashes}</Text>
            <Text style={styles.infoHint}>
              Search for a location to view crash data
            </Text>
          </View>
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
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    flex: 1,
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerLabel: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 5,
    marginTop: 2,
  },
  markerText: {
    fontSize: 10,
    color: '#FF0000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  crashOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    maxHeight: '50%',
  },
  crashCard: {
    paddingBottom: 15,
  },
  crashLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleText: {
    marginLeft: 10,
    fontSize: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoCard: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoHint: {
    fontSize: 14,
    color: '#666',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  paginationText: {
    fontSize: 14,
    color: '#333',
  },
  paginationButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default CrashScreen;










// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import crashesData from '../data/crashes.json';

// const CrashScreen = () => {
//   const initialRegion = {
//     latitude: 0.3476,
//     longitude: 32.5825,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   const [region, setRegion] = useState(initialRegion);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCrashes, setFilteredCrashes] = useState<any[]>([]);
//   const [matchingCrashes, setMatchingCrashes] = useState<any[]>([]);
//   const [selectedCrash, setSelectedCrash] = useState<any>(null);
//   const [totalCrashes, setTotalCrashes] = useState(0);
//   const [showMatchesOverlay, setShowMatchesOverlay] = useState(false);
//   const [isSearching, setIsSearching] = useState(false); // New state for loading
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const crashesPerPage = 10;
//   const mapRef = useRef<MapView>(null);

//   useEffect(() => {
//     try {
//       const validCrashes = crashesData.filter(crash => {
//         const lat = parseFloat(crash.lat);
//         const long = parseFloat(crash.long);
//         return !isNaN(lat) && !isNaN(long);
//       });
//       setTotalCrashes(validCrashes.length);
//       console.log(`Total valid crashes: ${validCrashes.length}`);
//       if (validCrashes.length > 0) {
//         console.log('Sample crash 1:', validCrashes[0]);
//         if (validCrashes.length > 1) console.log('Sample crash 2:', validCrashes[1]);
//       }
//     } catch (error) {
//       console.error('Error loading crash data:', error);
//       setTotalCrashes(0);
//     }
//   }, []);

//   const safeStringCompare = (str: any, query: string): boolean => {
//     const strValue = str ? String(str) : '';
//     return strValue.toLowerCase().includes(query.toLowerCase());
//   };

//   const findMatchingCrashes = (query: string) => {
//     const lowerQuery = query.toLowerCase();
//     console.log(`Finding crashes matching query: "${query}"`);
//     const matches = crashesData.filter(crash => {
//       const locationMatch = safeStringCompare(crash.crashLocation, lowerQuery);
//       const roadMatch = safeStringCompare(crash.road, lowerQuery);
//       const villageMatch = safeStringCompare(crash.village, lowerQuery);
//       console.log(`Crash (Location: ${crash.crashLocation}, Road: ${crash.road}, Village: ${crash.village}, Lat: ${crash.lat}, Long: ${crash.long}) - Matches query "${query}": ${locationMatch || roadMatch || villageMatch}`);
//       return locationMatch || roadMatch || villageMatch;
//     });
//     console.log(`Found ${matches.length} crashes matching query`);
//     return matches;
//   };

//   const fitMapToMarkers = (crashes: any[]) => {
//     if (!crashes.length || !mapRef.current) return;

//     const coordinates = crashes.map(crash => ({
//       latitude: parseFloat(crash.lat),
//       longitude: parseFloat(crash.long),
//     }));

//     if (coordinates.length === 1) {
//       mapRef.current.animateToRegion({
//         latitude: coordinates[0].latitude,
//         longitude: coordinates[0].longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }, 1000);
//     } else {
//       mapRef.current.fitToCoordinates(coordinates, {
//         edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//         animated: true,
//       });
//     }
//   };

//   const handleSearch = async () => {
//     const trimmedQuery = searchQuery.trim();
//     if (!trimmedQuery) {
//       Alert.alert('Error', 'Please enter a location');
//       return;
//     }

//     setIsSearching(true); // Show loading indicator
//     try {
//       console.log('Searching for crashes...');
//       const matches = findMatchingCrashes(trimmedQuery);
//       setMatchingCrashes(matches);
//       setShowMatchesOverlay(true);
//       console.log('Setting showMatchesOverlay to true');
//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert('Error', 'Failed to search crashes. Please try again.');
//     } finally {
//       setIsSearching(false); // Hide loading indicator
//     }
//   };

//   const handleMatchesOverlayClose = () => {
//     console.log('Closing matches overlay');
//     setShowMatchesOverlay(false);
//     if (matchingCrashes.length > 0) {
//       setCurrentPage(1);
//       setTotalPages(Math.ceil(matchingCrashes.length / crashesPerPage));
      
//       const startIndex = 0;
//       const endIndex = Math.min(crashesPerPage, matchingCrashes.length);
//       const initialCrashes = matchingCrashes.slice(startIndex, endIndex);
//       setFilteredCrashes(initialCrashes);
//       console.log(`Displaying crashes ${startIndex + 1}-${endIndex} of ${matchingCrashes.length}`);
//       initialCrashes.forEach((crash, index) => {
//         console.log(`Marker ${startIndex + index + 1}: Latitude: ${crash.lat}, Longitude: ${crash.long} (Location: ${crash.crashLocation})`);
//       });
//       fitMapToMarkers(initialCrashes);
//     } else {
//       Alert.alert('No Results', `No crashes found matching "${searchQuery}"`);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       const newPage = currentPage + 1;
//       setCurrentPage(newPage);
//       const startIndex = (newPage - 1) * crashesPerPage;
//       const endIndex = Math.min(newPage * crashesPerPage, matchingCrashes.length);
//       const crashesToShow = matchingCrashes.slice(startIndex, endIndex);
//       setFilteredCrashes(crashesToShow);
//       console.log(`Displaying crashes ${startIndex + 1}-${endIndex} of ${matchingCrashes.length}`);
//       crashesToShow.forEach((crash, index) => {
//         console.log(`Marker ${startIndex + index + 1}: Latitude: ${crash.lat}, Longitude: ${crash.long} (Location: ${crash.crashLocation})`);
//       });
//       fitMapToMarkers(crashesToShow);
//     }
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       const newPage = currentPage - 1;
//       setCurrentPage(newPage);
//       const startIndex = (newPage - 1) * crashesPerPage;
//       const endIndex = newPage * crashesPerPage;
//       const crashesToShow = matchingCrashes.slice(startIndex, endIndex);
//       setFilteredCrashes(crashesToShow);
//       console.log(`Displaying crashes ${startIndex + 1}-${endIndex} of ${matchingCrashes.length}`);
//       crashesToShow.forEach((crash, index) => {
//         console.log(`Marker ${startIndex + index + 1}: Latitude: ${crash.lat}, Longitude: ${crash.long} (Location: ${crash.crashLocation})`);
//       });
//       fitMapToMarkers(crashesToShow);
//     }
//   };

//   const getVehicleIcon = (vehicleType?: string) => {
//     if (!vehicleType) return 'car-side';
//     const type = vehicleType.toLowerCase();
//     if (type.includes('motorcycle')) return 'motorbike';
//     if (type.includes('car')) return 'car';
//     if (type.includes('bus')) return 'bus';
//     if (type.includes('truck')) return 'truck';
//     if (type.includes('bicycle')) return 'bicycle';
//     return 'car-side';
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//         region={region}
//       >
//         {filteredCrashes.map((crash, index) => {
//           const lat = parseFloat(crash.lat);
//           const long = parseFloat(crash.long);
          
//           if (isNaN(lat) || isNaN(long)) {
//             console.warn(`Invalid coordinates for crash at index ${index}: Lat: ${crash.lat}, Long: ${crash.long}`);
//             return null;
//           }

//           return (
//             <Marker
//               key={`crash-${(currentPage - 1) * crashesPerPage + index}`}
//               coordinate={{ latitude: lat, longitude: long }}
//               onPress={() => setSelectedCrash(crash)}
//             >
//               <View style={styles.markerContainer}>
//                 <Icon 
//                   name={getVehicleIcon(crash.vehicleType)} 
//                   size={28} 
//                   color="#FF0000" 
//                 />
//                 <View style={styles.markerLabel}>
//                   <Text style={styles.markerText}>
//                     {crash.monthOfCrash?.substring(0, 3) || '???'}
//                   </Text>
//                 </View>
//               </View>
//             </Marker>
//           );
//         })}
//       </MapView>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search a place (e.g., Jinja Road)"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="magnify" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {isSearching && (
//         <Modal
//           visible={isSearching}
//           transparent={true}
//           animationType="fade"
//         >
//           <View style={styles.loadingContainer}>
//             <View style={styles.loadingContent}>
//               <ActivityIndicator size="large" color="#4285F4" />
//               <Text style={styles.loadingText}>Searching...</Text>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {showMatchesOverlay && (
//         <Modal
//           visible={showMatchesOverlay}
//           transparent={true}
//           animationType="fade"
//           onRequestClose={handleMatchesOverlayClose}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Search Results</Text>
//               <Text style={styles.modalMessage}>
//                 Found {matchingCrashes.length} crashes matching "{searchQuery}"
//               </Text>
//               <TouchableOpacity
//                 style={styles.modalButton}
//                 onPress={handleMatchesOverlayClose}
//               >
//                 <Text style={styles.modalButtonText}>OK</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {filteredCrashes.length > 0 && !showMatchesOverlay && !selectedCrash && (
//         <View style={styles.paginationContainer}>
//           <TouchableOpacity
//             style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
//             onPress={handlePreviousPage}
//             disabled={currentPage === 1}
//           >
//             <Text style={styles.paginationButtonText}>Previous</Text>
//           </TouchableOpacity>
          
//           <Text style={styles.paginationText}>
//             Showing crashes {(currentPage - 1) * crashesPerPage + 1}-
//             {Math.min(currentPage * crashesPerPage, matchingCrashes.length)} of {matchingCrashes.length}
//           </Text>
          
//           <TouchableOpacity
//             style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
//             onPress={handleNextPage}
//             disabled={currentPage === totalPages}
//           >
//             <Text style={styles.paginationButtonText}>Next</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {selectedCrash && (
//         <View style={styles.crashOverlay}>
//           <ScrollView>
//             <View style={styles.crashCard}>
//               <Text style={styles.crashLocation}>
//                 {selectedCrash.crashLocation || 'Accident Details'}
//               </Text>
              
//               <View style={styles.vehicleRow}>
//                 <Icon 
//                   name={getVehicleIcon(selectedCrash.vehicleType)} 
//                   size={24} 
//                   color="#FF0000" 
//                 />
//                 <Text style={styles.vehicleText}>
//                   {selectedCrash.vehicleType || 'Unknown vehicle type'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Date:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.monthOfCrash || 'Unknown date'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Cause:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.causeOfCrash || 'Unknown'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Road:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.road || 'Unknown road'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Village:</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedCrash.village || 'Unknown area'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Coordinates:</Text>
//                 <Text style={styles.detailValue}>
//                   {parseFloat(selectedCrash.lat).toFixed(6)}, {parseFloat(selectedCrash.long).toFixed(6)}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setSelectedCrash(null)}
//           >
//             <Icon name="close-circle" size={30} color="#FF0000" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {!filteredCrashes.length && !showMatchesOverlay && (
//         <View style={styles.infoOverlay}>
//           <Text style={styles.infoTitle}>Crash Statistics</Text>
//           <View style={styles.infoCard}>
//             <Text style={styles.infoText}>Total Crashes: {totalCrashes}</Text>
//             <Text style={styles.infoHint}>
//               Search for a location to view crash data
//             </Text>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   searchContainer: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   searchInput: {
//     flex: 1,
//     padding: 8,
//   },
//   searchButton: {
//     backgroundColor: '#4285F4',
//     borderRadius: 8,
//     padding: 8,
//     marginLeft: 8,
//   },
//   markerContainer: {
//     alignItems: 'center',
//   },
//   markerLabel: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     paddingHorizontal: 5,
//     marginTop: 2,
//   },
//   markerText: {
//     fontSize: 10,
//     color: '#FF0000',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   modalMessage: {
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   modalButton: {
//     backgroundColor: '#4285F4',
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   modalButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   loadingContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   loadingText: {
//     fontSize: 16,
//     marginLeft: 10,
//     color: '#333',
//   },
//   crashOverlay: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 15,
//     elevation: 5,
//     maxHeight: '50%',
//   },
//   crashCard: {
//     paddingBottom: 15,
//   },
//   crashLocation: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   vehicleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   vehicleText: {
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 5,
//   },
//   detailLabel: {
//     fontWeight: 'bold',
//     width: 80,
//   },
//   detailValue: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//   },
//   infoOverlay: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 15,
//     elevation: 5,
//     alignItems: 'center',
//   },
//   infoTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   infoCard: {
//     alignItems: 'center',
//   },
//   infoText: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   infoHint: {
//     fontSize: 14,
//     color: '#666',
//   },
//   paginationContainer: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 10,
//     elevation: 5,
//   },
//   paginationText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   paginationButton: {
//     backgroundColor: '#4285F4',
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//   },
//   paginationButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   disabledButton: {
//     backgroundColor: '#cccccc',
//   },
// });

// export default CrashScreen;