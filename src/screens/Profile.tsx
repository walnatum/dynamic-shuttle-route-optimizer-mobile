// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialIcons";

// interface ProfileProps {
//   onClose: () => void;
// }

// const Profile: React.FC<ProfileProps> = ({ onClose }) => {
//   // Placeholder user data
//   const user = {
//     fullName: "John Doe",
//     email: "johndoe@example.com",
//     phone: "+256-123-456-789",
//     address: "123 Acacia Avenue, Kampala, Uganda",
//     dateOfBirth: "January 1, 1990",
//     gender: "Male",
//     emergencyContact: "Jane Doe (+256-987-654-321)",
//     profilePicture: "https://via.placeholder.com/150", // Placeholder image URL
//     accountCreated: "March 15, 2023",
//     lastLogin: "April 16, 2025, 10:30 AM",
//   };

//   return (
//     <View style={styles.overlay}>
//       <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.profileOverlayContent}>
//         <Text style={styles.overlayTitle}>User Profile</Text>

//         <View style={styles.profilePictureContainer}>
//           <Image
//             source={{ uri: user.profilePicture }}
//             style={styles.profilePicture}
//           />
//         </View>

//         <View style={styles.profileInfo}>
//           <View style={styles.infoRow}>
//             <Icon name="person" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Name: {user.fullName}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="email" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Email: {user.email}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="phone" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Phone: {user.phone}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="home" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Address: {user.address}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="cake" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Date of Birth: {user.dateOfBirth}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="wc" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Gender: {user.gender}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="contact-emergency" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Emergency Contact: {user.emergencyContact}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="event" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Account Created: {user.accountCreated}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="login" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Last Login: {user.lastLogin}</Text>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.editButton}>
//           <Text style={styles.buttonText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.closeButton}
//           onPress={onClose}
//         >
//           <Text style={styles.closeButtonText}>Close</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   profileOverlayContent: {
//     width: "90%",
//     maxHeight: "80%",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     overflow: "hidden",
//   },
//   overlayTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 20,
//   },
//   profilePictureContainer: {
//     marginBottom: 20,
//   },
//   profilePicture: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   profileInfo: {
//     width: "100%",
//     marginBottom: 20,
//   },
//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: "#fff",
//     flexShrink: 1,
//   },
//   editButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   buttonText: {
//     fontSize: 16,
//     color: "#4facfe",
//     fontWeight: "bold",
//   },
//   closeButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: "#4facfe",
//     fontWeight: "bold",
//   },
// });

// export default Profile;


// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialIcons";

// interface ProfileProps {
//   onClose: () => void;
// }

// const Profile: React.FC<ProfileProps> = ({ onClose }) => {
//   // Placeholder user data
//   const user = {
//     fullName: "John Doe",
//     email: "johndoe@example.com",
//     phone: "+256-123-456-789",
//     address: "123 Acacia Avenue, Kampala, Uganda",
//     profilePicture: "https://via.placeholder.com/150", // Placeholder image URL
//     lastLogin: "April 16, 2025, 10:30 AM",
//   };

//   return (
//     <View style={styles.overlay}>
//       <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.profileOverlayContent}>
//         <TouchableOpacity
//           style={styles.cancelIcon}
//           onPress={onClose}
//         >
//           <Icon name="cancel" size={30} color="#FF2D55" />
//         </TouchableOpacity>

//         <Text style={styles.overlayTitle}>User Profile</Text>

//         <View style={styles.profilePictureContainer}>
//           <Image
//             source={{ uri: user.profilePicture }}
//             style={styles.profilePicture}
//           />
//         </View>

//         <View style={styles.profileInfo}>
//           <View style={styles.infoRow}>
//             <Icon name="person" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Name: {user.fullName}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="email" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Email: {user.email}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="phone" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Phone: {user.phone}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="home" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Address: {user.address}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="login" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Last Login: {user.lastLogin}</Text>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.editButton}>
//           <Text style={styles.buttonText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.closeButton}
//           onPress={onClose}
//         >
//           <Text style={styles.closeButtonText}>Close</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   profileOverlayContent: {
//     width: "90%",
//     maxHeight: "80%",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     overflow: "hidden",
//     position: "relative",
//   },
//   cancelIcon: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//   },
//   overlayTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 20,
//   },
//   profilePictureContainer: {
//     marginBottom: 20,
//   },
//   profilePicture: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   profileInfo: {
//     width: "100%",
//     marginBottom: 20,
//   },
//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: "#fff",
//     flexShrink: 1,
//   },
//   editButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   buttonText: {
//     fontSize: 16,
//     color: "#4facfe",
//     fontWeight: "bold",
//   },
//   closeButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: "#4facfe",
//     fontWeight: "bold",
//   },
// });

// export default Profile;



// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   TextInput,
//   Alert,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { launchImageLibrary, launchCamera } from "react-native-image-picker";

// interface ProfileProps {
//   onClose: () => void;
// }

// const Profile: React.FC<ProfileProps> = ({ onClose }) => {
//   // Placeholder user data
//   const [user, setUser] = useState({
//     fullName: "John Doe",
//     email: "johndoe@example.com",
//     phone: "+256-123-456-789",
//     address: "123 Acacia Avenue, Kampala, Uganda",
//     profilePicture: "https://via.placeholder.com/150",
//     lastLogin: "April 16, 2025, 10:30 AM",
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [editedUser, setEditedUser] = useState({ ...user });

//   const requestCameraPermission = async () => {
//     if (Platform.OS === "android") {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: "Camera Permission",
//             message: "This app needs access to your camera to take a profile picture.",
//             buttonNeutral: "Ask Me Later",
//             buttonNegative: "Cancel",
//             buttonPositive: "OK",
//           }
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.error("Camera permission error:", err);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleImagePick = async (source: "camera" | "gallery") => {
//     const options = {
//       mediaType: "photo" as const,
//       maxWidth: 300,
//       maxHeight: 300,
//       quality: 1,
//     };

//     if (source === "camera") {
//       const hasPermission = await requestCameraPermission();
//       if (!hasPermission) {
//         Alert.alert("Error", "Camera permission denied.");
//         return;
//       }
//       launchCamera(options, (response) => {
//         if (response.didCancel) {
//           console.log("User cancelled camera");
//         } else if (response.errorCode) {
//           Alert.alert("Error", `Camera error: ${response.errorMessage}`);
//         } else if (response.assets && response.assets[0].uri) {
//           setEditedUser({ ...editedUser, profilePicture: response.assets[0].uri });
//         }
//       });
//     } else {
//       launchImageLibrary(options, (response) => {
//         if (response.didCancel) {
//           console.log("User cancelled image picker");
//         } else if (response.errorCode) {
//           Alert.alert("Error", `Image picker error: ${response.errorMessage}`);
//         } else if (response.assets && response.assets[0].uri) {
//           setEditedUser({ ...editedUser, profilePicture: response.assets[0].uri });
//         }
//       });
//     }
//   };

//   const toggleEdit = () => {
//     if (isEditing) {
//       // Reset editedUser to current user data if cancelling
//       setEditedUser({ ...user });
//     }
//     setIsEditing(!isEditing);
//   };

//   const saveChanges = () => {
//     // Validate email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(editedUser.email)) {
//       Alert.alert("Error", "Please enter a valid email address.");
//       return;
//     }

//     // Validate phone (basic check for +256 format)
//     const phoneRegex = /^\+256\d{9}$/;
//     if (!phoneRegex.test(editedUser.phone)) {
//       Alert.alert("Error", "Please enter a valid phone number starting with +256 followed by 9 digits.");
//       return;
//     }

//     // Validate non-empty fields
//     if (!editedUser.fullName || !editedUser.address) {
//       Alert.alert("Error", "Name and address cannot be empty.");
//       return;
//     }

//     // Update user data
//     setUser({ ...editedUser });
//     setIsEditing(false);
//     Alert.alert("Success", "Profile updated successfully.");
//     // TODO: Add API call to save changes to backend
//   };

//   return (
//     <View style={styles.overlay}>
//       <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.profileOverlayContent}>
//         <TouchableOpacity
//           style={styles.cancelIcon}
//           onPress={onClose}
//         >
//           <Icon name="cancel" size={30} color="#FF2D55" />
//         </TouchableOpacity>

//         <Text style={styles.overlayTitle}>User Profile</Text>

//         <View style={styles.profilePictureContainer}>
//           <TouchableOpacity
//             onPress={() =>
//               Alert.alert(
//                 "Change Profile Picture",
//                 "Choose an option",
//                 [
//                   { text: "Take Photo", onPress: () => handleImagePick("camera") },
//                   { text: "Choose from Gallery", onPress: () => handleImagePick("gallery") },
//                   { text: "Cancel", style: "cancel" },
//                 ]
//               )
//             }
//             disabled={!isEditing}
//           >
//             <Image
//               source={{ uri: editedUser.profilePicture }}
//               style={styles.profilePicture}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.profileInfo}>
//           <View style={styles.infoRow}>
//             <Icon name="person" size={24} color="#fff" style={styles.icon} />
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedUser.fullName}
//                 onChangeText={(text) => setEditedUser({ ...editedUser, fullName: text })}
//                 placeholder="Full Name"
//                 placeholderTextColor="#ccc"
//               />
//             ) : (
//               <Text style={styles.infoText}>Name: {user.fullName}</Text>
//             )}
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="email" size={24} color="#fff" style={styles.icon} />
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedUser.email}
//                 onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
//                 placeholder="Email"
//                 placeholderTextColor="#ccc"
//                 keyboardType="email-address"
//               />
//             ) : (
//               <Text style={styles.infoText}>Email: {user.email}</Text>
//             )}
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="phone" size={24} color="#fff" style={styles.icon} />
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedUser.phone}
//                 onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
//                 placeholder="Phone (+256)"
//                 placeholderTextColor="#ccc"
//                 keyboardType="phone-pad"
//               />
//             ) : (
//               <Text style={styles.infoText}>Phone: {user.phone}</Text>
//             )}
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="home" size={24} color="#fff" style={styles.icon} />
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedUser.address}
//                 onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
//                 placeholder="Address"
//                 placeholderTextColor="#ccc"
//               />
//             ) : (
//               <Text style={styles.infoText}>Address: {user.address}</Text>
//             )}
//           </View>
//           <View style={styles.infoRow}>
//             <Icon name="login" size={24} color="#fff" style={styles.icon} />
//             <Text style={styles.infoText}>Last Login: {user.lastLogin}</Text>
//           </View>
//         </View>

//         <View style={styles.buttonContainer}>
//           {isEditing ? (
//             <>
//               <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
//                 <Text style={styles.buttonText}>Save Changes</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.cancelButton} onPress={toggleEdit}>
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
//               <Text style={styles.buttonText}>Edit Profile</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         <TouchableOpacity
//           style={styles.closeButton}
//           onPress={onClose}
//         >
//           <Text style={styles.closeButtonText}>Close</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   profileOverlayContent: {
//     width: "90%",
//     maxHeight: "80%",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     overflow: "hidden",
//     position: "relative",
//   },
//   cancelIcon: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//   },
//   overlayTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 20,
//   },
//   profilePictureContainer: {
//     marginBottom: 20,
//   },
//   profilePicture: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   profileInfo: {
//     width: "100%",
//     marginBottom: 20,
//   },
//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: "#fff",
//     flexShrink: 1,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#fff",
//     paddingVertical: 5,
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     marginBottom: 10,
//   },
//   editButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     flex: 1,
//     alignItems: "center",
//   },
//   saveButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     flex: 1,
//     alignItems: "center",
//     marginRight: 5,
//   },
//   cancelButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     flex: 1,
//     alignItems: "center",
//     marginLeft: 5,
//   },
//   buttonText: {
//     fontSize: 16,
//     color: "#4facfe",
//     fontWeight: "bold",
//   },
//   closeButton: {
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: "#4facfe",
//     fontWeight: "bold",
//   },
// });

// export default Profile;

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

interface ProfileProps {
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const navigation = useNavigation();

  // Placeholder user data
  const [user, setUser] = useState({
    fullName: "John Doe",
    email: "johndoe@example.com",
    phone: "+256-123-456-789",
    address: "123 Acacia Avenue, Kampala, Uganda",
    profilePicture: "https://via.placeholder.com/150",
    lastLogin: "April 16, 2025, 10:30 AM",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  const goToDemo = () => {
    navigation.navigate("ModelDemoScreen");
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset editedUser to current user data if cancelling
      setEditedUser({ ...user });
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Validate phone (basic check for +256 format)
    const phoneRegex = /^\+256\d{9}$/;
    if (!phoneRegex.test(editedUser.phone)) {
      Alert.alert("Error", "Please enter a valid phone number starting with +256 followed by 9 digits.");
      return;
    }

    // Validate non-empty fields
    if (!editedUser.fullName || !editedUser.address) {
      Alert.alert("Error", "Name and address cannot be empty.");
      return;
    }

    // Update user data
    setUser({ ...editedUser });
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully.");
    // TODO: Add API call to save changes to backend
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.profileOverlayContent}>
        <TouchableOpacity
          style={styles.cancelIcon}
          onPress={onClose}
        >
          <Icon name="cancel" size={30} color="#FF2D55" />
        </TouchableOpacity>

        <Text style={styles.overlayTitle}>User Profile</Text>

        <View style={styles.profilePictureContainer}>
          <Image
            source={{ uri: user.profilePicture }}
            style={styles.profilePicture}
          />
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Icon name="person" size={24} color="#fff" style={styles.icon} />
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.fullName}
                onChangeText={(text) => setEditedUser({ ...editedUser, fullName: text })}
                placeholder="Full Name"
                placeholderTextColor="#ccc"
              />
            ) : (
              <Text style={styles.infoText}>Name: {user.fullName}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Icon name="email" size={24} color="#fff" style={styles.icon} />
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                placeholder="Email"
                placeholderTextColor="#ccc"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoText}>Email: {user.email}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={24} color="#fff" style={styles.icon} />
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.phone}
                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                placeholder="Phone (+256)"
                placeholderTextColor="#ccc"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoText}>Phone: {user.phone}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Icon name="home" size={24} color="#fff" style={styles.icon} />
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.address}
                onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
                placeholder="Address"
                placeholderTextColor="#ccc"
              />
            ) : (
              <Text style={styles.infoText}>Address: {user.address}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Icon name="login" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.infoText}>Last Login: {user.lastLogin}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={toggleEdit}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

              <TouchableOpacity onPress={goToDemo}>
              <Text style={styles.buttonText}>Model Demo</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  profileOverlayContent: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  cancelIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  profilePictureContainer: {
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    width: "100%",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#fff",
    flexShrink: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#4facfe",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#4facfe",
    fontWeight: "bold",
  },
});

export default Profile;