import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    map: {
      flex: 1,
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
    inputContainer: {
      position: "absolute",
      top: 50,
      left: 20,
      right: 20,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      marginTop:50,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
      backgroundColor: "#fff",
      borderRadius: 8,
      paddingHorizontal: 10,
    },
    input: {
      flex: 1,
      height: 40,
      fontSize: 16,
      color: "#333",
    },
    clearButton: {
      padding: 5,
    },
    clearButtonText: {
      fontSize: 16,
      color: "#666",
    },
    enterButton: {
      backgroundColor: "#007bff",
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    enterButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    floatingButtons: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    floatingButton: {
      backgroundColor: "#007bff",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      elevation: 5,
    },

    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  export default styles; // Use default export
  