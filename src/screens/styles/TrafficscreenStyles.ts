// import { StyleSheet } from "react-native";

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//     },
//     map: {
//       ...StyleSheet.absoluteFillObject,
//     },
//     showDataButton: {
//       position: 'absolute',
//       top: 10,
//       right: 10,
//       backgroundColor: '#007AFF',
//       paddingVertical: 10,
//       paddingHorizontal: 15,
//       borderRadius: 20,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       elevation: 5,
//     },
//     buttonText: {
//       color: 'white',
//       fontWeight: 'bold',
//     },
//     trafficInfo: {
//       position: 'absolute',
//       bottom: 10,
//       left: 10,
//       right: 10,
//       backgroundColor: 'rgba(255, 255, 255, 0.9)',
//       padding: 10,
//       borderRadius: 5,
//       maxHeight: '50%', // Limit height to avoid covering the map
//       alignItems: 'center', // Center the content
//     },
//     trafficTitle: {
//       fontWeight: 'bold',
//       marginBottom: 5,
//     },
//     trafficText: {
//       fontSize: 12,
//       color: '#333',
//       marginVertical: 2,
//     },
//     cancelButton: {
//       backgroundColor: '#FF2D55',
//       paddingVertical: 8,
//       paddingHorizontal: 20,
//       borderRadius: 20,
//       marginTop: 10,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       elevation: 5,
//     },
//     cancelButtonText: {
//       color: 'white',
//       fontWeight: 'bold',
//       fontSize: 14,
//     },
//   });

//   export default styles; // Use default export
  



import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    customHeaderOverlay: {
        height: 70,  // Slightly taller for better proportions
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,  // For Android shadow
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,     // Crucial for iOS
      },
      customHeaderText: {
        color: '#2563EB',  // More vibrant blue
        fontSize: 22,
        fontWeight: '700',  // Semi-bold
        fontStyle: 'italic',
        letterSpacing: 0.5,
        marginLeft: 10,  // Space after icon
        includeFontPadding: false,  // Better text alignment
      },
      headerIcon: {
        marginRight: 8,  // Space between icon and text
      },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        elevation: 3,
        marginTop:50,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: '#333',
    },
    searchButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        marginRight: 5,
    },
    trafficOverlay: {
        position: 'absolute',
        top: '30%',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        maxHeight: '50%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        elevation: 5,
    },
    trafficCard: {
        alignItems: 'center',
    },
    location: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    trafficTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    trafficContainer: {
        width: '100%',
        marginBottom: 20,
    },
    trafficItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    roadName: {
        fontSize: 14,
        color: '#333',
        width: 100,
    },
    trafficCondition: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    floatingButtons: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        elevation: 5,
    },
    floatingButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    buttonIcon: {
        marginBottom: 5,
    },
    buttonText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#FF2D55',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
        alignSelf: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default styles;