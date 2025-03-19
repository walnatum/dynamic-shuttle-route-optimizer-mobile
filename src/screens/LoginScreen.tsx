
import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
      Alert.alert('Navigation Error', 'Could not navigate to Home screen');
    }
  };

  // const goToParent = () => {
  //   console.log("Navigating to ParentScreen...");
  //   try {
  //     navigation.navigate('ParentScreen');
  //   } catch (error) {
  //     console.error('Navigation error:', error);
  //     Alert.alert('Navigation Error', 'Could not navigate to Parent screen');
  //   }
  // };

  // const goToAssistant = () => {
  //   console.log("Navigating to AssistantScreen...");
  //   try {
  //     navigation.navigate('AssistantScreen');
  //   } catch (error) {
  //     console.error('Navigation error:', error);
  //     Alert.alert('Navigation Error', 'Could not navigate to Assistant screen');
  //   }
  // };

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe']}
      style={styles.container}
    >
      <View style={styles.overlay}>
        {/* Welcome Header */}
        <Text style={styles.title}>Welcome to RouteWise</Text>
        <Text style={styles.subtitle}>Your Journey, Our Priority</Text>

        {/* Icon or Logo (Placeholder) */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🗺️</Text>
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity style={styles.button} onPress={goToHome}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={[styles.button, styles.parentButton]} onPress={goToParent}>
          <Text style={styles.buttonText}>The Parent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.assistantButton]} onPress={goToAssistant}>
          <Text style={styles.buttonText}>The Assistant</Text>
        </TouchableOpacity> */}

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
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slight overlay for better text readability
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
  },
  button: {
    backgroundColor: '#841584',
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
  parentButton: {
    backgroundColor: '#007AFF',
  },
  assistantButton: {
    backgroundColor: '#FF9500',
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

export default LoginScreen;