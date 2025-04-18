import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    showDataButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    trafficInfo: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: 10,
      borderRadius: 5,
      maxHeight: '50%', // Limit height to avoid covering the map
      alignItems: 'center', // Center the content
    },
    trafficTitle: {
      fontWeight: 'bold',
      marginBottom: 5,
    },
    trafficText: {
      fontSize: 12,
      color: '#333',
      marginVertical: 2,
    },
    cancelButton: {
      backgroundColor: '#FF2D55',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    cancelButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });

  export default styles; // Use default export
  