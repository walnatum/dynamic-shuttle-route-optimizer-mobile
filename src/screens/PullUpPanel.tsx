import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions, StyleSheet } from "react-native";
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
  const [panelHeight] = useState(new Animated.Value(100));
  const maxPanelHeight = screenHeight * 0.75;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = Math.max(100, Math.min(maxPanelHeight, 100 - gestureState.dy));
        panelHeight.setValue(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newHeight = gestureState.dy < -50 ? maxPanelHeight : 100;
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
        <Text style={styles.panelTitle}>Explore Kampala</Text>
        <Text style={styles.panelSubtitle}>Navigate the city with ease</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Your Journey</Text>
          <Text style={styles.sectionDescription}>
            Find the fastest routes to your destination or explore nearby parking options.
          </Text>
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
          <Text style={styles.sectionTitle}>Discover by Time of Day</Text>
          <Text style={styles.sectionDescription}>
            Explore top spots in Kampala tailored to your schedule.
          </Text>
          <View style={styles.timeButtonContainer}>
            <TouchableOpacity
              style={[styles.timeButton, selectedTime === "morning" && styles.timeButtonActive]}
              onPress={() => showTimeBasedLocations("morning")}
            >
              <Text style={[styles.timeButtonText, selectedTime === "morning" && styles.timeButtonTextActive]}>
                Morning
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTime === "afternoon" && styles.timeButtonActive]}
              onPress={() => showTimeBasedLocations("afternoon")}
            >
              <Text style={[styles.timeButtonText, selectedTime === "afternoon" && styles.timeButtonTextActive]}>
                Afternoon
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTime === "evening" && styles.timeButtonActive]}
              onPress={() => showTimeBasedLocations("evening")}
            >
              <Text style={[styles.timeButtonText, selectedTime === "evening" && styles.timeButtonTextActive]}>
                Evening
              </Text>
            </TouchableOpacity>
          </View>
          {selectedTime && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToTimeLocations}
            >
              <Icon name="play-arrow" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>
                Start {selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)} Tour
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track a Shuttle</Text>
          <Text style={styles.sectionDescription}>
            Connect with a shuttle to follow its live location.
          </Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Destinations</Text>
          <Text style={styles.sectionDescription}>
            Check out these popular spots in Kampala.
          </Text>
          <ScrollView horizontal style={styles.horizontalScroll}>
            <TouchableOpacity
              style={styles.placeCard}
              onPress={() => {
                setSearchQuery("City Square, Kampala");
                searchPlaces();
              }}
            >
              <Text style={styles.placeCardText}>City Square</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.placeCard}
              onPress={() => {
                setSearchQuery("Lugogo Mall, Kampala");
                searchPlaces();
              }}
            >
              <Text style={styles.placeCardText}>Lugogo Mall</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.placeCard}
              onPress={() => {
                setSearchQuery("Kabalagala, Kampala");
                searchPlaces();
              }}
            >
              <Text style={styles.placeCardText}>Kabalagala</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Navigating Kampala</Text>
          <Text style={styles.sectionDescription}>
            - Use "My Location" for accurate starting points.
            - Check time-based routes for the best experience.
            - Sync with a shuttle for real-time tracking.
            - Search specific names like "Acacia Mall, Kampala" for better results.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={goToWeather}>
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={goToTraffic}>
          <Text style={styles.buttonText}>Traffic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={styles.buttonText}>Crash</Text>
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
    paddingBottom: 80,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
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
  sectionDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
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
  timeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  timeButtonActive: {
    backgroundColor: "#007AFF",
  },
  timeButtonText: {
    fontSize: 12,
    color: "#333",
  },
  timeButtonTextActive: {
    color: "#fff",
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
  horizontalScroll: {
    flexDirection: "row",
    marginVertical: 10,
  },
  placeCard: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  placeCardText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  floatingButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
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
