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