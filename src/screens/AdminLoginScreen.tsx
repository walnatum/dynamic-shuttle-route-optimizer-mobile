import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "react-native-config";

export type RootStackParamList = {
  LogScreen: { tempCode?: string; driverCode?: string } | undefined;
  HomeScreen: { driverCode: string; role: string } | undefined;
  AssistantScreen: { tempCode: string; driverCode: string };
  ParentLogScreen: undefined;
  AdminLoginScreen: undefined;
  RouteScreen: undefined;
  ParentScreen: { parentId: string; role: string };
  AdminScreen: { schoolId: string; role: string };
};

type AdminLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminLoginScreen'>;

const AdminLoginScreen: React.FC = () => {
  const navigation = useNavigation<AdminLoginScreenNavigationProp>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    AsyncStorage.getItem("user_role").then((role) => {
      if (role === "school_admin") {
        AsyncStorage.getItem("school_id").then((schoolId) => {
          if (schoolId) {
            navigation.navigate("AdminScreen", { schoolId, role: "school_admin" });
          }
        });
      }
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.role !== "school_admin") {
        throw new Error("This login is for admins only. Please use the Driver or Parent login.");
      }

      const { school_id, role } = data;
      if (!school_id) {
        throw new Error("No school ID returned from login");
      }

      await AsyncStorage.setItem("school_id", school_id);
      await AsyncStorage.setItem("user_role", role);
      navigation.navigate('AdminScreen', { schoolId: school_id, role });
    } catch (error: any) {
      console.error("Login error:", error.message);
      Alert.alert("Error", error.message || "Could not log in");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    console.log('Navigating back...');
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate back');
    }
  };

  const clearEmail = () => {
    setEmail('');
  };

  const clearPassword = () => {
    setPassword('');
  };

  return (
    <LinearGradient
      colors={['#1A2526', '#00A3FF']}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Manage the System</Text>

        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { fontFamily: undefined }]}>👔</Text>
        </View>

        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['#ffffff', '#e0e0e0']}
            style={styles.inputWrapper}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={clearEmail} style={styles.refreshIcon}>
                  <Icon name="refresh" size={24} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#ffffff', '#e0e0e0']}
            style={styles.inputWrapper}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#888"
              />
              {password.length > 0 && (
                <TouchableOpacity onPress={clearPassword} style={styles.refreshIcon}>
                  <Icon name="refresh" size={24} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>System Administration Portal</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    fontSize: 50,
    textAlign: 'center',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  inputWrapper: {
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  refreshIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#0047AB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default AdminLoginScreen;