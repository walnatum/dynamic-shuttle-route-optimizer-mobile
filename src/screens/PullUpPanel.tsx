import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface PullUpPanelProps {
  selectedTime: "morning" | "afternoon" | "evening" | null;
  showTimeBasedLocations: (time: "morning" | "afternoon" | "evening") => void;
  navigateToTimeLocations: () => void;
  setShowRouteInput: (value: boolean) => void;
  useCurrentLocation: () => void;
  setShowAssistantOverlay: (value: boolean) => void;
  generatedCode: string;
  shuttleRegNumber: string;
  setSearchQuery: (query: string) => void;
  searchPlaces: () => void;
  goToWeather: () => void;
  goToTraffic: () => void;
}

const PullUpPanel: React.FC<PullUpPanelProps> = ({
  selectedTime,
  showTimeBasedLocations,
  navigateToTimeLocations,
  setShowRouteInput,
  useCurrentLocation,
  setShowAssistantOverlay,
  generatedCode,
  shuttleRegNumber,
  setSearchQuery,
  searchPlaces,
  goToWeather,
  goToTraffic,
}) => {
  const screenHeight = Dimensions.get("window").height;
  const [panelHeight] = useState(new Animated.Value(150));
  const maxPanelHeight = screenHeight * 0.75;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = Math.max(150, Math.min(maxPanelHeight, 150 - gestureState.dy));
        panelHeight.setValue(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newHeight = gestureState.dy < -50 ? maxPanelHeight : 150;
        Animated.spring(panelHeight, {
          toValue: newHeight,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.panel, { height: panelHeight }]} {...panResponder.panHandlers}>
      <View style={styles.panelHandle} />
      <ScrollView style={styles.panelContent}>
        <Text style={styles.panelTitle}>RouteWise</Text>
        
        {/* North Campus Express */}
        <View style={styles.routeCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
            style={styles.routeImage}
          />
          <View style={styles.routeDetails}>
            <Text style={styles.routeTitle}>North Campus Express</Text>
            <View style={styles.routeInfo}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.routeText}>Next Stop: Student Center</Text>
            </View>
            <View style={styles.routeInfo}>
              <Icon name="access-time" size={16} color="#666" />
              <Text style={styles.routeText}>Peak Hours: 9:00 AM - 10:00 AM</Text>
            </View>
          </View>
        </View>
        
        {/* South Campus Loop */}
        <View style={styles.routeCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
            style={styles.routeImage}
          />
          <View style={styles.routeDetails}>
            <Text style={styles.routeTitle}>South Campus Loop</Text>
            <View style={styles.routeInfo}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.routeText}>Next Stop: Library</Text>
            </View>
            <View style={styles.routeInfo}>
              <Icon name="update" size={16} color="#666" />
              <Text style={styles.routeText}>Frequency: Every 15 minutes</Text>
            </View>
          </View>
        </View>
        
        {/* East-West Connector */}
        <View style={styles.routeCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
            style={styles.routeImage}
          />
          <View style={styles.routeDetails}>
            <Text style={styles.routeTitle}>East-West Connector</Text>
            <View style={styles.routeInfo}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.routeText}>Next Stop: Sports Complex</Text>
            </View>
            <View style={styles.routeInfo}>
              <Icon name="schedule" size={16} color="#666" />
              <Text style={styles.routeText}>Service Hours: 7:00 AM - 9:00 PM</Text>
            </View>
          </View>
        </View>
        
        {/* Sea Route Alert */}
        <View style={[styles.routeCard, styles.alertCard]}>
          <Icon name="warning" size={24} color="#FFA500" />
          <View style={styles.routeDetails}>
            <Text style={[styles.routeTitle, styles.alertTitle]}>Sea Route Alert</Text>
            <Text style={styles.alertText}>Service temporarily suspended due to weather conditions</Text>
          </View>
        </View>

        {/* Original content sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Your Journey</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowRouteInput(true)}
            >
              <Icon name="directions" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={useCurrentLocation}
            >
              <Icon name="my-location" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Use My Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track a Shuttle</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAssistantOverlay(true)}
          >
            <Icon name="directions-bus" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Sync with Shuttle</Text>
          </TouchableOpacity>
          {generatedCode && (
            <View style={styles.shuttleInfo}>
              <Text style={styles.shuttleInfoText}>Code: {generatedCode}</Text>
              {shuttleRegNumber && (
                <Text style={styles.shuttleInfoText}>Shuttle: {shuttleRegNumber}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={goToWeather}>
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
          <Text style={styles.buttonText}>Traffic</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    overflow: "hidden",
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 10,
  },
  panelContent: {
    padding: 15,
    paddingBottom: 100,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: 'blue',
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  alertCard: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  routeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  routeDetails: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  alertTitle: {
    color: '#FFA500',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  alertText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  shuttleInfo: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  shuttleInfoText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },
  floatingButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  floatingButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PullUpPanel;