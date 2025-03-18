

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; 

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
    try {
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Home screen');
    }
  };

  const goToHome = () => {
    console.log("Navigating to HomeScreen...");
    try {
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Home screen');
    }
  };

  const goToParent = () => {
    console.log("Navigating to ParentScreen...");
    try {
      navigation.navigate('ParentScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Parent screen');
    }
  };

  const goToAssistant = () => {
    console.log("Navigating to ParentScreen...");
    try {
      navigation.navigate('AssistantScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Parent screen');
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Here</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      
      <View style={styles.buttonSpacing}>
        <Button title="Go to Home" onPress={goToHome} color="#841584" />
      </View>

      <View style={styles.buttonSpacing}>
        <Button title="Go to ParentScreen" onPress={goToParent} color="#007AFF" />
      </View>

      <View style={styles.buttonSpacing}>
        <Button title="Go to AssistantScreen" onPress={goToAssistant} color="#007AFF" />
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonSpacing: {
    marginTop: 10,
  },
});

export default LoginScreen;
