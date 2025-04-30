import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    searchContainer: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 25,
      paddingHorizontal: 10,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      color: "#333",
    },
    searchImageContainer: {
      padding: 5,
    },
    photoOverlayContent: {
      width: "75%",
      height: "50%",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      justifyContent: "space-around",
    },
    overlayButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginVertical: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    // assistantButton: {
    //   position: "absolute",
    //   top: 60,
    //   right: 10,
    //   backgroundColor: "#FF9500",
    //   paddingVertical: 10,
    //   paddingHorizontal: 15,
    //   borderRadius: 20,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    // },
    // routeWiseButton: {
    //   position: "absolute",
    //   top: 60,
    //   left: 10,
    //   backgroundColor: "#007AFF",
    //   paddingVertical: 10,
    //   paddingHorizontal: 20,
    //   borderRadius: 20,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    // },
    // routeWiseOverlay: {
    //   position: "absolute",
    //   top: 0,
    //   left: 0,
    //   right: 0,
    //   bottom: 0,
    //   backgroundColor: "rgba(0, 0, 0, 0.3)",
    //   justifyContent: "flex-start",
    //   paddingTop: 100,
    //   alignItems: "center",
    // },
    // inputContainer: {
    //   width: "90%",
    //   backgroundColor: "#fff",
    //   borderRadius: 20,
    //   padding: 20,
    //   elevation: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    // },
    // inputWrapper: {
    //   borderRadius: 25,
    //   marginBottom: 10,
    //   overflow: "hidden",
    //   elevation: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    // },
    // beautifiedInput: {
    //   height: 50,
    //   paddingHorizontal: 20,
    //   fontSize: 16,
    //   color: "#ffffff",
    //   backgroundColor: "rgba(0, 0, 0, 0.1)",
    //   borderRadius: 25,
    // },

    // routeWiseOverlay: {
    //   position: "absolute",
    //   top: 60, // Position just below the search bar
    //   left: 10,
    //   right: 10,
    //   backgroundColor: "transparent", // No semi-transparent background
    //   alignItems: "center",
    // },
    // inputContainer: {
    //   width: "100%",
    //   backgroundColor: "#fff",
    //   borderRadius: 10,
    //   padding: 15,
    //   elevation: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    // },
    // inputWrapper: {
    //   marginBottom: 10,
    // },
    // inputLabel: {
    //   fontSize: 14,
    //   color: "#333",
    //   marginBottom: 5,
    // },
    // beautifiedInput: {
    //   height: 40,
    //   paddingHorizontal: 15,
    //   fontSize: 16,
    //   color: "#333",
    //   backgroundColor: "#f0f0f0",
    //   borderRadius: 8,
    // },
    // modeButtonRow: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   marginTop: 10,
    // },
    // modeButton: {
    //   flex: 1,
    //   backgroundColor: "#fff",
    //   paddingVertical: 8,
    //   paddingHorizontal: 10,
    //   borderRadius: 8,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   marginHorizontal: 5,
    //   elevation: 2,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 1 },
    //   shadowOpacity: 0.2,
    // },
    // modeButtonActive: {
    //   backgroundColor: "#007AFF",
    // },
    // modeButtonText: {
    //   fontSize: 12,
    //   color: "#666",
    //   marginTop: 5,
    // },
    // modeButtonTextActive: {
    //   fontSize: 12,
    //   color: "#fff",
    //   marginTop: 5,
    // },
    // timeButtonRow: {
    //   flexDirection: "row",
    //   justifyContent: "space-between", 
    //   marginTop: 10,
    //   flexWrap: "wrap",
    // },
    // timeButton: {
    //   backgroundColor: "#fff",
    //   paddingVertical: 8,
    //   paddingHorizontal: 10,
    //   borderRadius: 20,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    //   margin: 2,
    // },


    // routeWiseButton: {
    //   position: "absolute",
    //   bottom: 120, // Position above the floating buttons
    //   left: 10,
    //   backgroundColor: "#007AFF",
    //   paddingVertical: 10,
    //   paddingHorizontal: 20,
    //   borderRadius: 20,
    //   flexDirection: "row",
    //   alignItems: "center",
    //   justifyContent: "center",
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    // },
    // buttonIcon: {
    //   marginRight: 8,
    // },
    // buttonText: {
    //   color: "#fff",
    //   fontWeight: "bold",
    //   fontSize: 16,
    // },
    // routeWiseOverlay: {
    //   position: "absolute",
    //   top: 60,
    //   left: 10,
    //   right: 10,
    //   backgroundColor: "transparent",
    //   alignItems: "center",
    // },
    // inputContainer: {
    //   width: "100%",
    //   backgroundColor: "#fff",
    //   borderRadius: 10,
    //   padding: 15,
    //   elevation: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    // },
    // inputWrapper: {
    //   marginBottom: 10,
    // },
    // inputLabel: {
    //   fontSize: 14,
    //   color: "#333",
    //   marginBottom: 5,
    // },
    // beautifiedInput: {
    //   height: 40,
    //   paddingHorizontal: 15,
    //   fontSize: 16,
    //   color: "#333",
    //   backgroundColor: "#f0f0f0",
    //   borderRadius: 8,
    // },
    // modeButtonRow: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   marginTop: 10,
    // },
    // modeButton: {
    //   flex: 1,
    //   backgroundColor: "#fff",
    //   paddingVertical: 8,
    //   paddingHorizontal: 10,
    //   borderRadius: 8,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   marginHorizontal: 5,
    //   elevation: 2,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 1 },
    //   shadowOpacity: 0.2,
    // },
    // modeButtonActive: {
    //   backgroundColor: "#007AFF",
    // },
    // modeButtonText: {
    //   fontSize: 12,
    //   color: "#666",
    //   marginTop: 5,
    // },
    // modeButtonTextActive: {
    //   fontSize: 12,
    //   color: "#fff",
    //   marginTop: 5,
    // },
    // timeButtonRow: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   marginTop: 10,
    //   flexWrap: "wrap",
    // },
    // timeButton: {
    //   backgroundColor: "#fff",
    //   paddingVertical: 8,
    //   paddingHorizontal: 10,
    //   borderRadius: 20,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    //   margin: 2,
    // },
    // buttonText: {
    //   color: "#333",
    //   fontWeight: "bold",
    // },
    // cancelIcon: {
    //   position: "absolute",
    //   top: 20,
    //   right: 20,
    //   zIndex: 1,
    // },



    // routeWiseOverlay: {
    //   position: "absolute",
    //   top: 60,
    //   left: 10,
    //   right: 10,
    //   backgroundColor: "transparent",
    //   alignItems: "center",
    // },
    // inputContainer: {
    //   width: "100%",
    //   backgroundColor: "transparent", // Transparent background
    //   padding: 15,
    // },
    // inputWrapper: {
    //   marginBottom: 10,
    //   backgroundColor: "#fff", // White background for inputs only
    //   borderRadius: 8,
    //   padding: 5,
    //   elevation: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    // },
    // inputLabel: {
    //   fontSize: 14,
    //   color: "#333",
    //   marginBottom: 5,
    // },
    // beautifiedInput: {
    //   height: 40,
    //   paddingHorizontal: 15,
    //   fontSize: 16,
    //   color: "#333",
    //   backgroundColor: "#f0f0f0",
    //   borderRadius: 8,
    // },
    // modeButtonRow: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   marginTop: 10,
    // },
    // modeButton: {
    //   flex: 1,
    //   backgroundColor: "#fff",
    //   paddingVertical: 8,
    //   paddingHorizontal: 10,
    //   borderRadius: 8,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   marginHorizontal: 5,
    //   elevation: 2,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 1 },
    //   shadowOpacity: 0.2,
    // },
    // modeButtonActive: {
    //   backgroundColor: "#007AFF",
    // },
    // modeButtonText: {
    //   fontSize: 12,
    //   color: "#666",
    //   marginTop: 5,
    // },
    // modeButtonTextActive: {
    //   fontSize: 12,
    //   color: "#fff",
    //   marginTop: 5,
    // },
    // timeButtonRow: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   marginTop: 10,
    //   marginBottom: 15,
    // },
    // timeButton: {
    //   flex: 1, // Evenly spaced to fill the screen
    //   backgroundColor: "#007AFF", // Blue background
    //   paddingVertical: 8,
    //   paddingHorizontal: 10,
    //   borderRadius: 20,
    //   alignItems: "center",
    //   marginHorizontal: 5,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    // },
    // navigateButton: {
    //   backgroundColor: "#007AFF",
    //   paddingVertical: 10,
    //   paddingHorizontal: 20,
    //   borderRadius: 20,
    //   flexDirection: "row",
    //   alignItems: "center",
    //   justifyContent: "center",
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    // },
    // buttonIcon: {
    //   marginRight: 8,
    // },
    // buttonText: {
    //   color: "#fff",
    //   fontWeight: "bold",
    //   fontSize: 16,
    // },
    // cancelIcon: {
    //   position: "absolute",
    //   top: 10,
    //   right: 10,
    //   zIndex: 1,
    // },


    routeWiseOverlay: {
      position: "absolute",
      top: 60,
      left: 10,
      right: 10,
      backgroundColor: "transparent",
      alignItems: "center",
    },
    inputContainer: {
      width: "100%",
      backgroundColor: "transparent",
      padding: 15,
    },
    inputWrapper: {
      marginBottom: 10,
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 5,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
    },
    locationInputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    beautifiedInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 15,
      fontSize: 16,
      color: "#333",
      backgroundColor: "#f0f0f0",
      borderRadius: 8,
    },
    myLocationButton: {
      padding: 10,
      marginLeft: 5,
    },
    inputLabel: {
      fontSize: 14,
      color: "#333",
      marginBottom: 5,
    },
    modeButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      flexWrap: "wrap",
    },
    modeButton: {
      flex: 1,
      backgroundColor: "#fff",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 5,
      marginVertical: 5,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      minWidth: "18%",
    },
    modeButtonActive: {
      backgroundColor: "#007AFF",
    },
    modeButtonText: {
      fontSize: 12,
      color: "#666",
      marginTop: 5,
    },
    modeButtonTextActive: {
      fontSize: 12,
      color: "#fff",
      marginTop: 5,
    },
    timeButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 20,
    },
    timeButton: {
      flex: 1,
      backgroundColor: "#fff",
      paddingVertical: 15,
      paddingHorizontal: 5,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 5,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
    },
    timeButtonText: {
      color: "#007AFF",
      fontWeight: "500",
      fontSize: 14,
      marginTop: 8,
    },
    navigateButton: {
      width: "100%",
      backgroundColor: "#fff",
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      borderWidth: 1,
      borderColor: "#007AFF",
    },
    navigateButtonText: {
      color: "#007AFF",
      fontWeight: "500",
      fontSize: 16,
    },
    routeIcon: {
      marginRight: 8,
    },
    cancelIcon: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1,
    },
    bottomContainer: {
      position: "absolute",
      bottom: 120,
      left: 10,
      right: 10,
      alignItems: "center",
      backgroundColor: "transparent",
      padding: 10,
      borderRadius: 10,
      minHeight: 80,
      maxHeight: 150,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginVertical: 10,
      flexWrap: "wrap",
    },
    functionButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      margin: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    travelTimesPanel: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      padding: 10,
      borderRadius: 10,
    },
    timeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 10,
      flexWrap: "wrap",
    },
    timeList: {
      maxHeight: 80,
      width: "100%",
      marginBottom: 10,
    },
    timeTitle: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 5,
    },
    timeText: {
      fontSize: 14,
      color: "#333",
      marginVertical: 2,
    },
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
    panelText: {
      fontSize: 14,
      color: "#333",
      marginBottom: 10,
    },
    panelSpacer: {
      height: 20,
    },
    floatingButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 5, // Small padding to prevent buttons from touching screen edges
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#fff",
    },
    floatingButton: {
      flex: 1, // Each button takes equal width
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 20,
      flexDirection: "row", // Align icon and text horizontally
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 5, // Small gap between buttons
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
    // buttonIcon: {
    //   marginRight: 8, // Space between icon and text
    // },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    // buttonText: {
    //   color: "white",
    //   fontWeight: "bold",
    // },
    callout: {
      width: 200,
      padding: 10,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#ccc",
    },
    calloutTitle: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 5,
    },
    calloutDescription: {
      fontSize: 12,
      color: "#333",
      marginBottom: 5,
      minHeight: 40,
    },



    // overlay: {
    //   position: "absolute",
    //   top: 0,
    //   left: 0,
    //   right: 0,
    //   bottom: 0,
    //   backgroundColor: "rgba(0, 0, 0, 0.5)",
    //   justifyContent: "center",
    //   alignItems: "center",
    // },
    // overlayContent: {
    //   width: 280,
    //   borderRadius: 20,
    //   alignItems: "center",
    //   padding: 20,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 5 },
    //   shadowOpacity: 0.3,
    //   elevation: 10,
    // },
    // syncContainer: {
    //   flexDirection: "row",
    //   alignItems: "center",
    //   marginBottom: 10,
    // },
    // syncLabel: {
    //   fontSize: 18,
    //   fontWeight: "600",
    //   color: "#fff",
    //   marginRight: 10,
    // },
    // syncStatus: {
    //   fontSize: 18,
    //   fontWeight: "600",
    //   color: "#fff",
    // },
    // generateButton: {
    //   backgroundColor: "#007AFF",
    //   paddingVertical: 12,
    //   paddingHorizontal: 20, 
    //   borderRadius: 25,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    // },
    // generateButtonText: {
    //   color: "white",
    //   fontSize: 16,
    //   fontWeight: "bold",
    // },
    // codeContainer: {
    //   marginTop: 20,
    //   alignItems: "center",
    //   marginBottom: 20, 
    // },
    // generatedCodeText: {
    //   fontSize: 24,
    //   fontWeight: "bold",
    //   color: "#000",
    //   backgroundColor: "rgba(255, 255, 255, 0.8)",
    //   padding: 15,
    //   borderRadius: 15,
    //   textAlign: "center",
    //   width: 120,
    // },
    // closeButton: {
    //   backgroundColor: "#FF2D55",
    //   paddingVertical: 12,
    //   paddingHorizontal: 20,
    //   borderRadius: 25,
    //   shadowColor: "#000",
    //   shadowOffset: { width: 0, height: 2 },
    //   shadowOpacity: 0.3,
    //   elevation: 5,
    //   // Remove absolute positioning
    // },
    // closeButtonText: {
    //   color: "#fff",
    //   fontSize: 16,
    //   fontWeight: "bold",
    // },


    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for better contrast
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    overlayContent: {
      width: '100%',
      maxWidth: 380, // Adjusted width for better balance
      backgroundColor: '#fff',
      borderRadius: 20, // Smoother, modern corners
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    overlayTitle: {
      fontSize: 24, // Larger title for emphasis
      fontWeight: '700',
      color: '#1A3CFF', // Brighter blue for better visibility
      marginLeft: 12,
    },
    overlayText: {
      fontSize: 16,
      color: '#333', // Darker text for readability
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '400',
    },
    statusContainer: {
      marginBottom: 24,
      alignItems: 'center', // Center align for better presentation
    },
    syncContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F0F5FF', // Light blue background for sync section
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#D6E4FF',
    },
    syncLabel: {
      fontSize: 16,
      color: '#333', // Darker for readability
      marginRight: 8,
      fontWeight: '500',
    },
    syncStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    syncIndicator: {
      width: 14, // Slightly larger for visibility
      height: 14,
      borderRadius: 7,
      marginRight: 8,
    },
    synced: {
      backgroundColor: '#34C759', // Bright green for synced
    },
    notSynced: {
      backgroundColor: '#FF3B30', // Bright red for unsynced
    },
    syncStatusText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333', // Darker for readability
    },
    codeContainer: {
      marginTop: 16,
      alignItems: 'center',
    },
    codeBadge: {
      backgroundColor: '#F0F5FF',
      borderColor: '#1A3CFF',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      width: '80%', // Ensure it doesn't stretch too wide
    },
    codeLabel: {
      fontSize: 14,
      color: '#1A3CFF',
      marginBottom: 4,
      fontWeight: '500',
    },
    codeValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1A3CFF',
      letterSpacing: 1,
    },
    // buttonContainer: {
    //   flexDirection: 'row',
    //   justifyContent: 'space-between',
    //   marginTop: 16,
    // },
    generateButton: {
      flex: 1,
      backgroundColor: '#1A3CFF', // Brighter blue for better contrast
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#1A3CFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    disabledButton: {
      opacity: 0.6,
    },
    generateButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    closeButton: {
      flex: 0.5, // Slightly wider for balance
      backgroundColor: '#fff',
      borderColor: '#1A3CFF',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#1A3CFF',
      fontWeight: '600',
      fontSize: 16,
    },
    searchOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    searchOverlayContent: {
      width: "75%",
      height: "75%",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      justifyContent: "space-around",
    },

    // overlayText: {
    //   fontSize: 16,
    //   color: "#fff",
    //   textAlign: "center",
    // },
  
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

    timeButtonActive: {
      backgroundColor: "#007AFF",
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


    buttonContainer: {
      position: "absolute",
      top: 60,
      left: 10,
      right: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  
    // RouteWise Button Styling
    routeWiseButton: {
      flex: 0.48, // Takes up ~48% of the container width
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
  
    // Assistant Button Styling
    assistantButton: {
      flex: 0.48, // Takes up ~48% of the container width
      backgroundColor: "#fff",
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 5,
    },
  
    // Icon Styling
    buttonIcon: {
      marginRight: 8, // Space between icon and text
    },
  
    // Shared Button Text Styling (for RouteWise)
    // buttonText: {
    //   color: "white",
    //   fontWeight: "bold",
    //   fontSize: 16,
    // },
  
    // Assistant Button Text Styling (Blue text)
    assistantButtonText: {
      color: "#007AFF",
      fontWeight: "bold",
      fontSize: 16,
    },
  });


  export default styles; // Use default export
  

