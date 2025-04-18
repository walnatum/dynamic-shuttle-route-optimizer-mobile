import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    listContainer: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
    },
    schoolList: {
      marginBottom: 20,
    },
    schoolItem: {
      padding: 15,
      backgroundColor: "#fff",
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
    },
    schoolText: {
      fontSize: 16,
    },
    classList: {},
    classItem: {
      padding: 15,
      backgroundColor: "#fff",
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
    },
    classText: {
      fontSize: 16,
    },
    overlay: {
      position: "absolute",
      top: "12.5%",
      left: 0,
      right: 0,
      height: "75%",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 10,
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "#FF3B30",
      width: 25,
      height: 25,
      borderRadius: 12.5,
      justifyContent: "center",
      alignItems: "center",
    },
    closeText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    overlayTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    studentItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    studentText: {
      fontSize: 16,
    },
    studentLocation: {
      fontSize: 12,
      color: "#666",
    },
    assignButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    shuttleItem: {
      padding: 15,
      backgroundColor: "#fff",
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
    },
    shuttleText: {
      fontSize: 16,
    },
    mapContainer: {
      flex: 1,
      marginTop: 20,
    },
    largeMap: {
      height: 400, // Increased map size
      borderRadius: 10,
    },
    timeText: {
      fontSize: 16,
      textAlign: "center",
      marginVertical: 10,
    },
    backButton: {
      backgroundColor: "#FF9500",
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  export default styles; // Use default export
  