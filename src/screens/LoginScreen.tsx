import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../App';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Remove the header (Login label) by setting headerShown to false
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const goToHome = () => {
    console.log("Navigating to LogScreen...");
    try {
      navigation.navigate('LogScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to LogScreen');
    }
  };

  return (
    <LinearGradient
      colors={['#1A2526', '#00A3FF']} // Gradient from deep blue to blue
      style={styles.container}
    >

      {/* Central Graphic */}
      <View style={styles.graphicContainer}>
        <Image
          source={require('../assets/Logo.png')} // Path to Logo.png
          style={styles.graphic}
        />
      </View>

      {/* RouteWise Title */}
      <Text style={styles.title}>RouteWise</Text>

      {/* Slogan */}
      <Text style={styles.slogan}>Find Your Way, Wisely</Text>

      {/* Navigation Button */}
      <TouchableOpacity style={styles.button} onPress={goToHome}>
        <Text style={styles.buttonText}>RouteWise</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  assistantButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#00A3FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  assistantButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  graphicContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphic: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10, // Reduced margin to make space for the slogan
  },
  slogan: {
    fontSize: 18, // Smaller than the title
    color: '#fff', // White text to match the theme
    textAlign: 'center',
    marginBottom: 30, // Space between slogan and button
    fontStyle: 'italic', // Optional: italic for a stylistic touch
    opacity: 0.9, // Slightly faded for contrast with the title
  },
  button: {
    backgroundColor: '#00A3FF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;