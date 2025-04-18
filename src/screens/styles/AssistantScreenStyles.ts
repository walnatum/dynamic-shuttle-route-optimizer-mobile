import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    map: {
      flex: 1,
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
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 14,
    },
  });

  export default styles; // Use default export
  