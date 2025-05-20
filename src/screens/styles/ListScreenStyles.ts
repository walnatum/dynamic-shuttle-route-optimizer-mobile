import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: "#f5f5f5" // Light gray background for a cleaner look
    },
    map: { 
      flex: 1 
    },
    infoContainer: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      backgroundColor: "rgba(255, 255, 255, 0.95)", // Slightly more opaque
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    info: { 
      fontSize: 16, 
      color: "#333", 
      marginBottom: 5, 
      fontWeight: "600" // Bolder text
    },
    inputContainer: {
      position: "absolute",
      top: 80, // Adjusted for better spacing below info
      left: 10,
      right: 10,
      padding: 15,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 12,
      marginBottom: 15,
      paddingHorizontal: 15,
      paddingVertical: 5,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    input: { 
      flex: 1, 
      height: 45, 
      fontSize: 16, 
      color: "#333" 
    },
    addButton: {
      backgroundColor: "#28a745", // Green for "Add"
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginLeft: 10,
    },
    addButtonText: { 
      color: "#fff", 
      fontSize: 14, 
      fontWeight: "bold" 
    },
    studentList: { 
      backgroundColor: "#fff", // White for contrast
      borderRadius: 12, 
      padding: 15, 
      marginBottom: 15,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    listTitle: { 
      fontSize: 18, 
      fontWeight: "700", 
      marginBottom: 10, 
      color: "#2c3e50" // Darker blue-gray
    },
    studentItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    studentInitial: {
      width: 40,
      height: 40,
      backgroundColor: "#3498db", // Bright blue for initials
      borderRadius: 20,
      textAlign: "center",
      lineHeight: 40, // Center vertically
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginRight: 15,
    },
    studentName: { 
      flex: 1, 
      fontSize: 16, 
      color: "#333",
      fontWeight: "500"
    },
    onboardStatus: { 
      fontSize: 14, 
      color: "#6b4e91", 
      marginRight: 10 
    }, // Still here but not used for onboarded list
    leaveButton: {
      backgroundColor: "#dc3545", // Red for "OffBoard"
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    leaveButtonText: { 
      color: "#fff", 
      fontSize: 14, 
      fontWeight: "bold" 
    },
    statusText: { 
      fontSize: 14, 
      color: "#dc3545", // Red for "Left"
      marginLeft: 10,
      fontWeight: "500"
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
      backgroundColor: "#007bff", // Slightly brighter blue
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    buttonText: { 
      color: "white", 
      fontWeight: "bold",
      fontSize: 14 
    },
  });

  export default styles; // Use default export
  