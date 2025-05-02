// import { StyleSheet } from "react-native";

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#f5f5f5',
//     },
//     map: {
//       ...StyleSheet.absoluteFillObject,
//     },
//     searchContainer: {
//       position: 'absolute',
//       top: 20,
//       left: 20,
//       right: 20,
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: 'white',
//       borderRadius: 25,
//       padding: 5,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       elevation: 5,
//     },
//     searchInput: {
//       flex: 1,
//       padding: 10,
//       fontSize: 16,
//       color: '#333',
//     },
//     searchButton: {
//       backgroundColor: '#ff8c00',
//       padding: 10,
//       borderRadius: 20,
//     },
//     weatherOverlay: {
//       position: 'absolute',
//       bottom: 20,
//       left: 20,
//       right: 20,
//       backgroundColor: 'rgba(255, 255, 255, 0.95)',
//       borderRadius: 15,
//       padding: 15,
//       maxHeight: '70%',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       elevation: 5,
//     },
//     weatherCard: {
//       alignItems: 'center',
//     },
//     location: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: '#333',
//       marginBottom: 10,
//     },
//     tempContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 10,
//     },
//     temp: {
//       fontSize: 40,
//       fontWeight: 'bold',
//       color: '#ff8c00',
//       marginLeft: 10,
//     },
//     weatherDesc: {
//       fontSize: 16,
//       fontStyle: 'italic',
//       color: '#666',
//       marginBottom: 10,
//     },
//     weatherDetails: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       justifyContent: 'center',
//       marginBottom: 10,
//     },
//     detail: {
//       fontSize: 14,
//       color: '#333',
//       margin: 5,
//     },
//     lastUpdated: {
//       fontSize: 12,
//       color: '#666',
//       marginBottom: 10,
//     },
//     hourlyButton: {
//       backgroundColor: '#007AFF',
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 20,
//       marginVertical: 10,
//     },
//     buttonText: {
//       color: 'white',
//       fontWeight: 'bold',
//     },
//     hourlyContainer: {
//       width: '100%',
//       marginBottom: 10,
//     },
//     hourlyItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 5,
//       borderBottomWidth: 1,
//       borderBottomColor: '#ddd',
//     },
//     hourlyText: {
//       marginLeft: 10,
//       fontSize: 14,
//       color: '#333',
//     },
//     cancelButton: {
//       backgroundColor: '#FF2D55',
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 20,
//       marginTop: 10,
//     },
//     cancelButtonText: {
//       color: 'white',
//       fontWeight: 'bold',
//     },
//     defaultWeather: {
//       position: 'absolute',
//       bottom: 20,
//       left: 20,
//       right: 20,
//       alignItems: 'center',
//     },
//     defaultTitle: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       color: '#ff8c00',
//       marginBottom: 10,
//     },
//     defaultCard: {
//       backgroundColor: 'rgba(255, 255, 255, 0.95)',
//       borderRadius: 15,
//       padding: 20,
//       alignItems: 'center',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       elevation: 5,
//     },
//   });

//   export default styles; // Use default export
  



// import { StyleSheet } from "react-native";

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     map: {
//         ...StyleSheet.absoluteFillObject,
//     },
//     searchContainer: {
//         position: 'absolute',
//         top: 50,
//         left: 20,
//         right: 20,
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'white',
//         borderRadius: 10,
//         padding: 5,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         elevation: 3,
//     },
//     searchInput: {
//         flex: 1,
//         padding: 10,
//         fontSize: 16,
//         color: '#333',
//     },
//     searchButton: {
//         backgroundColor: '#007AFF',
//         padding: 10,
//         borderRadius: 8,
//         marginRight: 5,
//     },
//     weatherOverlay: {
//         position: 'absolute',
//         bottom: 20,
//         left: 20,
//         right: 20,
//         backgroundColor: 'white',
//         borderRadius: 15,
//         padding: 20,
//         maxHeight: '60%',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         elevation: 5,
//     },
//     weatherCard: {
//         alignItems: 'center',
//     },
//     location: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 15,
//         textAlign: 'center',
//     },
//     date: {
//         fontSize: 16,
//         color: '#666',
//         marginBottom: 15,
//         textAlign: 'center',
//     },
//     tempContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15,
//         justifyContent: 'center',
//     },
//     temp: {
//         fontSize: 48,
//         fontWeight: '300',
//         color: '#333',
//         marginLeft: 10,
//     },
//     weatherDesc: {
//         fontSize: 18,
//         color: '#666',
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     hourlyForecastTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 15,
//         textAlign: 'center',
//     },
//     hourlyContainer: {
//         width: '100%',
//         marginBottom: 20,
//     },
//     hourlyItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     hourlyTime: {
//         fontSize: 14,
//         color: '#333',
//         width: 80,
//     },
//     hourlyTemp: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     weatherDetails: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         width: '100%',
//         marginBottom: 20,
//     },
//     detailItem: {
//         alignItems: 'center',
//     },
//     detailLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginBottom: 5,
//     },
//     detailValue: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     actionButtons: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         width: '100%',
//         marginTop: 20,
//     },
//     actionButton: {
//         backgroundColor: '#007AFF',
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         borderRadius: 25,
//         flex: 1,
//         marginHorizontal: 5,
//         alignItems: 'center',
//     },
//     actionButtonText: {
//         color: 'white',
//         fontWeight: 'bold',
//     },
//     defaultWeather: {
//         position: 'absolute',
//         bottom: 20,
//         left: 20,
//         right: 20,
//         backgroundColor: 'white',
//         borderRadius: 15,
//         padding: 20,
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         elevation: 5,
//     },
//     defaultTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 10,
//     },
// });

// export default styles;






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
    weatherOverlay: {
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
    weatherCard: {
        alignItems: 'center',
    },
    location: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    date: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    tempContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'center',
    },
    temp: {
        fontSize: 48,
        fontWeight: '300',
        color: '#333',
        marginLeft: 10,
    },
    weatherDesc: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    hourlyForecastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    hourlyContainer: {
        width: '100%',
        marginBottom: 20,
    },
    hourlyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    hourlyTime: {
        fontSize: 14,
        color: '#333',
        width: 100,
    },
    hourlyTemp: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    weatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
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

    // Add this to the existing styles object in WeatherScreenStyles.ts
floatingButtonHome: {
  alignItems: 'center',
  paddingVertical: 10,
},
buttonIconHome: {
  marginBottom: 5,
},
buttonTextHome: {
  fontSize: 12,
  color: '#007AFF',
  fontWeight: 'bold',
},
});

export default styles;