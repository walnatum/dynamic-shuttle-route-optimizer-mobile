import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions, StyleSheet, Image, TextInput } from "react-native";
import Config from "react-native-config";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Reporter {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface RoadEvent {
  reporter: Reporter;
  reported_at: string;
  description: string;
  id: string;
  expires_at: string;
  score: number;
  userVote?: 'up' | 'down'
}

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
  setShowRouteInput,
  useCurrentLocation,
  setShowAssistantOverlay,
  generatedCode,
  shuttleRegNumber,
  goToWeather,
  goToTraffic,
}) => {
  const screenHeight = Dimensions.get("window").height;
  const [panelHeight] = useState(new Animated.Value(150));
  const maxPanelHeight = screenHeight * 0.85;
  const [activeTab, setActiveTab] = useState<"routes" | "crowdsource">("routes");
  const [roadEvent, setRoadEvent] = useState("");
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [roadEvents, setRoadEvents] = useState<RoadEvent[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only activate if touch is near the top of the panel (where the handle is)
        return gestureState.y0 < 50;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only activate if touch is near the top or if we're moving vertically
        return gestureState.y0 < 50 || Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        setScrollEnabled(false); // Disable scrolling when dragging starts
      },
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
        setScrollEnabled(true); // Re-enable scrolling when dragging ends
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true); // Re-enable scrolling if gesture is terminated
      },
    })
  ).current;

  useEffect(() => {
    const fetchRoadEvents = async () => {
      try {
        const response = await fetch(`${Config.API_BASE_URL}/api/road-events/`);
        const data = await response.json();

        setRoadEvents(data);
      } catch (error) {
        console.error("Error fetching road events:", error);
      }
    };
    fetchRoadEvents();
  }, []);

  const reportEvent =  async () => {
    if (!roadEvent.trim()) return;
    
    const newRoadEvent = {
      description: roadEvent,
      reported_at: new Date(),
    };

    setRoadEvent("");

    try {
        const res = await fetch(`${Config.API_BASE_URL}/api/road-events/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRoadEvent),
        });
        
        const created = await res.json()

        setRoadEvents([{...created}, ...roadEvents])
      } catch (error) {
        console.error("Error fetching road events:", error);
      }
  };

  const handleVote = async (id: string, voteType: 'up' | 'down') => {
    setRoadEvents(roadEvents.map(rdEvent => {
      if (rdEvent.id === id) {
        // user should only vote once, maybe remove this??
        if (rdEvent.userVote) {
          return rdEvent;
        }

        // If user is changing their vote
        if (rdEvent.userVote === voteType) {
          return rdEvent; // No change if clicking same vote again
        }
        
        // Calculate vote change
        let voteChange = 0;
        if (voteType === 'up') {
          voteChange = rdEvent.userVote === 'down' ? 2 : 1;
        } else {
          voteChange = rdEvent.userVote === 'up' ? -2 : -1;
        }
        
        return {
          ...rdEvent,
          score: rdEvent.score + voteChange,
          userVote: voteType
        };
      }
      return rdEvent;
    }));

    try {
        await fetch(`${Config.API_BASE_URL}/api/road-events/${id}/vote/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "vote_type": voteType,
          }),
        });
      } catch (error) {
        console.error("Error fetching road events:", error);
      }
  };

  const formatTime = (date: string) => {
    // return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get top 3 most voted road events
  const topVotedRoadEvents = [...roadEvents]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <Animated.View style={[styles.panel, { height: panelHeight }]} {...panResponder.panHandlers}>
      <View style={styles.panelHandle} />
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "routes" && styles.activeTab]}
          onPress={() => setActiveTab("routes")}
        >
          <Text style={styles.tabText}>Shuttle Updates</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "crowdsource" && styles.activeTab]}
          onPress={() => setActiveTab("crowdsource")}
        >
          <Text style={styles.tabText}>Crowd Sourcing</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "routes" ? (
        <ScrollView style={styles.panelContent}>
          scrollEnabled={scrollEnabled}
          <Text style={styles.panelTitle}>RouteWise</Text>
          
          {/* Top Community Alerts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Alerts</Text>
            {topVotedRoadEvents.map((roadEvent, index) => (
              <View key={roadEvent.id} style={[styles.alertCard, index === 0 && styles.topAlert]}>
                <View style={styles.alertHeader}>
                  <Icon 
                    name={index === 0 ? "warning" : "info"} 
                    size={20} 
                    color={index === 0 ? "#FFA500" : "#007AFF"} 
                  />
                  <Text style={styles.alertTitle}>
                    {index === 0 ? "Top Alert" : `Alert #${index + 1}`}
                    {roadEvent.route && ` • ${roadEvent.route}`}
                  </Text>
                </View>
                <Text style={styles.alertText}>{roadEvent.description}</Text>
                <View style={styles.alertFooter}>
                  <Text style={styles.alertUser}>{roadEvent.reporter.first_name}</Text>
                  <Text style={styles.alertTime}>{formatTime(roadEvent.reported_at)}</Text>
                  <View style={styles.voteCount}>
                    <Icon name="thumb-up" size={14} color="#4CAF50" />
                    <Text style={styles.voteText}>{roadEvent.score}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* North Campus Express */}
          {/* <View style={styles.routeCard}>
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
          </View> */}
          
          {/* South Campus Loop */}
          {/* <View style={styles.routeCard}>
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
          </View> */}
          
          {/* East-West Connector */}
          {/* <View style={styles.routeCard}>
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
          </View> */}
        </ScrollView>
      ) : (
        <View style={styles.crowdsourceContainer}>
          <ScrollView style={styles.messagesContainer}>
            scrollEnabled={scrollEnabled}
            {roadEvents.map((roadEvent) => (
              <View key={roadEvent.id} style={styles.roadEventCard}>
                <View style={styles.roadEventHeader}>
                  <Text style={styles.roadEventUser}>{roadEvent.reporter.first_name}</Text>
                  <Text style={styles.roadEventTime}>{formatTime(roadEvent.reported_at)}</Text>
                </View>
                <Text style={styles.roadEventText}>{roadEvent.description}</Text>
                <View style={styles.voteContainer}>
                  <TouchableOpacity 
                    style={[styles.voteButton, roadEvent.userVote === 'up' && styles.votedUp]}
                    onPress={() => handleVote(roadEvent.id, 'up')}
                    // disabled={!!roadEvent.userVote}
                  >
                    <Icon name="thumb-up" size={16} color={roadEvent.userVote === 'up' ? "#fff" : "#4CAF50"} />
                  </TouchableOpacity>
                  <Text style={styles.voteCountText}>{roadEvent.score}</Text>
                  <TouchableOpacity 
                    style={[styles.voteButton, roadEvent.userVote === 'down' && styles.votedDown]}
                    onPress={() => handleVote(roadEvent.id, 'down')}
                  >
                    <Icon name="thumb-down" size={16} color={roadEvent.userVote === 'down' ? "#fff" : "#F44336"} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.messageInputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Share an update about shuttle services..."
                value={roadEvent}
                onChangeText={setRoadEvent}
                multiline
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={reportEvent}
                disabled={!roadEvent.trim()}
              >
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* <View style={styles.floatingButtons}>
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => {
            setActiveTab("routes");
            setShowRouteInput(true);
          }}
        >
          <Icon name="directions" size={20} color="#fff" />
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => {
            setActiveTab("routes");
            // useCurrentLocation();
          }}
        >
          <Icon name="my-location" size={20} color="#fff" />
          <Text style={styles.buttonText}>My Location</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => setActiveTab(activeTab === "routes" ? "crowdsource" : "routes")}
        >
          <Icon name={activeTab === "routes" ? "chat" : "directions-bus"} size={20} color="#fff" />
          <Text style={styles.buttonText}>{activeTab === "routes" ? "Updates" : "Routes"}</Text>
        </TouchableOpacity>
      </View> */}
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
  height: 20, // Increased height for better touch area
  backgroundColor: "transparent",
  borderRadius: 2.5,
  alignSelf: "center",
  marginTop: 5,
  marginBottom: 5,
  justifyContent: 'center',
  alignItems: 'center',
},
panelHandleBar: {
  width: 40,
  height: 5,
  backgroundColor: "#ccc",
  borderRadius: 2.5,
},
  panelContent: {
    padding: 15,
    paddingBottom: 100,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // color: "#333",
    marginBottom: 12,
    color: '#007AFF',
  },
  crowdsourceContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  roadEventCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  roadEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  roadEventUser: {
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  roadEventTime: {
    fontSize: 12,
    color: '#666',
  },
  roadEventText: {
    color: '#333',
    marginBottom: 8,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  voteButton: {
    padding: 6,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  votedUp: {
    backgroundColor: '#4CAF50',
  },
  votedDown: {
    backgroundColor: '#F44336',
  },
  voteCountText: {
    minWidth: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
  messageInputContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  messageInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
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
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topAlert: {
    borderLeftColor: '#FFA500',
    backgroundColor: '#FFF8E1',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertUser: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 5,
    fontSize: 12,
  },
});

export default PullUpPanel;