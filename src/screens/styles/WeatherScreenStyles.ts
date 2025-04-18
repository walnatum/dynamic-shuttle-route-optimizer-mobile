import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 25,
      padding: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    searchInput: {
      flex: 1,
      padding: 10,
      fontSize: 16,
      color: '#333',
    },
    searchButton: {
      backgroundColor: '#ff8c00',
      padding: 10,
      borderRadius: 20,
    },
    weatherOverlay: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 15,
      padding: 15,
      maxHeight: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    weatherCard: {
      alignItems: 'center',
    },
    location: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    tempContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    temp: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#ff8c00',
      marginLeft: 10,
    },
    weatherDesc: {
      fontSize: 16,
      fontStyle: 'italic',
      color: '#666',
      marginBottom: 10,
    },
    weatherDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 10,
    },
    detail: {
      fontSize: 14,
      color: '#333',
      margin: 5,
    },
    lastUpdated: {
      fontSize: 12,
      color: '#666',
      marginBottom: 10,
    },
    hourlyButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginVertical: 10,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    hourlyContainer: {
      width: '100%',
      marginBottom: 10,
    },
    hourlyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    hourlyText: {
      marginLeft: 10,
      fontSize: 14,
      color: '#333',
    },
    cancelButton: {
      backgroundColor: '#FF2D55',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginTop: 10,
    },
    cancelButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    defaultWeather: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      alignItems: 'center',
    },
    defaultTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ff8c00',
      marginBottom: 10,
    },
    defaultCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
  });

  export default styles; // Use default export
  