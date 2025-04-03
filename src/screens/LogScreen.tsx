import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/MaterialIcons';

type LogScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Log'>;

const LogScreen = () => {
  const navigation = useNavigation<LogScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    console.log('Logging in with:', email, password);
    try {
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Home screen');
    }
  };

  const goToParent = () => {
    console.log("Navigating to ParentLogScreen...");
    try {
      navigation.navigate('ParentLogScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Parent screen');
    }
  };

  const goToAssistant = () => {
    console.log("Navigating to AssistantScreen...");
    try {
      navigation.navigate('AssistantScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Assistant screen');
    }
  };

  const goToAdmin = () => {
    console.log("Navigating to AdminScreen...");
    try {
      navigation.navigate('AssistantLogScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Admin screen');
    }
  };

  const goToRoute = () => {
    console.log("Navigating to AdminScreen...");
    try {
      navigation.navigate('RouteScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Admin screen');
    }
  };

  const goBack = () => {
    console.log("Navigating back...");
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
      colors={['#1A2526', '#00A3FF']} // Gradient from deep blue to blue
      style={styles.container}
    >
      <View style={styles.overlay}>
        {/* Back Arrow */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        {/* Assistant Button in Top-Right Corner */}
        <TouchableOpacity style={styles.topAssistantButton} onPress={goToAssistant}>
          <Text style={styles.assistantButtonText}>Assistant</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.title}>Driver Login</Text>
        <Text style={styles.subtitle}>Access Your Journey</Text>

        {/* Logo */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/Logo.png')} // Path to Logo.png
            style={styles.logo}
          />
        </View>

        {/* Login Fields */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['#ffffff', '#e0e0e0']}
            style={styles.inputWrapper}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Username"
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

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Role Buttons (As Parent, As Admin) */}
        <View style={styles.roleButtonContainer}>
          <TouchableOpacity style={[styles.roleButton, styles.parentButton]} onPress={goToParent}>
            <Text style={styles.roleButtonText}>As Parent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleButton, styles.adminButton]} onPress={goToAdmin}>
            <Text style={styles.roleButtonText}>As Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleButton, styles.adminButton]} onPress={goToRoute}>
            <Text style={styles.roleButtonText}>As Route</Text>
          </TouchableOpacity>

        </View>

        

        {/* Footer Text */}
        <Text style={styles.footerText}>Navigate Smarter, Travel Better</Text>
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
    top: 20,
    left: 15,
    zIndex: 20,
  },
  topAssistantButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    backgroundColor: '#007AFF', // Bright blue
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 20,
  },
  assistantButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
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
    zIndex: 10,
  },
  loginButton: {
    backgroundColor: '#0066CC', // Darker blue for login button
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
  roleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  parentButton: {
    backgroundColor: '#007AFF', // Bright blue
  },
  adminButton: {
    backgroundColor: '#0047AB', // Different shade of blue (cobalt)
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 16,
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

export default LogScreen;