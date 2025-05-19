import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
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

type LogScreenRouteProp = RouteProp<RootStackParamList, "LogScreen">;
type LogScreenNavigationProp = StackNavigationProp<RootStackParamList, "LogScreen">;

const LogScreen = () => {
  const navigation = useNavigation<LogScreenNavigationProp>();
  const route = useRoute<LogScreenRouteProp>();
  const { tempCode = "", driverCode = "" } = route.params || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    AsyncStorage.getItem("user_role").then((role) => {
      if (role === "shuttle_driver") {
        AsyncStorage.getItem("driver_code").then((storedCode) => {
          if (storedCode) {
            navigation.navigate("HomeScreen", { driverCode: storedCode, role: "shuttle_driver" });
          }
        });
      }
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
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

      if (data.role !== "shuttle_driver") {
        throw new Error("This login is for drivers only. Please use the Parent or Admin login.");
      }

      const { driver_code, role } = data;
      if (!driver_code) {
        throw new Error("No driver code returned from login");
      }

      await AsyncStorage.setItem("driver_code", driver_code);
      await AsyncStorage.setItem("user_role", role);
      navigation.navigate("HomeScreen", { driverCode: driver_code, role });
    } catch (error: any) {
      console.error("Login error:", error.message);
      Alert.alert("Error", error.message || "Could not log in");
    } finally {
      setIsLoading(false);
    }
  };

  const goToAssistant = () => {
    try {
      navigation.navigate("AssistantScreen", { tempCode: tempCode || "", driverCode: driverCode || "" });
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not navigate to Assistant screen");
    }
  };

  const goToParent = () => {
    try {
      navigation.navigate("ParentLogScreen");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not navigate to Parent screen");
    }
  };

  const goToAdmin = () => {
    try {
      navigation.navigate("AdminLoginScreen");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not navigate to Admin screen");
    }
  };

  const goToRoute = () => {
    try {
      navigation.navigate("RouteScreen");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not navigate to Route screen");
    }
  };

  const goBack = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        Alert.alert("Navigation", "No previous screen to go back to.");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not navigate back");
    }
  };

  const clearEmail = () => {
    setEmail("");
  };

  const clearPassword = () => {
    setPassword("");
  };

  return (
    <LinearGradient
      colors={["#1A2526", "#00A3FF"]}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topAssistantButton} onPress={goToAssistant}>
          <Text style={styles.assistantButtonText}>Assistant</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Driver Login</Text>
        <Text style={styles.subtitle}>Access Your Journey</Text>

        <View style={styles.iconContainer}>
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.inputContainer}>
          <LinearGradient
            colors={["#ffffff", "#e0e0e0"]}
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
            colors={["#ffffff", "#e0e0e0"]}
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

        <View style={styles.roleButtonContainer}>
          <TouchableOpacity style={[styles.roleButton, styles.parentButton]} onPress={goToParent}>
            <Text style={styles.roleButtonText}>As Parent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleButton, styles.adminButton]} onPress={goToAdmin}>
            <Text style={styles.roleButtonText}>As Admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Navigate Smarter, Travel Better</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 15,
    zIndex: 20,
  },
  topAssistantButton: {
    position: "absolute",
    top: 20,
    right: 15,
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 20,
  },
  assistantButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    fontStyle: "italic",
    opacity: 0.9,
  },
  iconContainer: {
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  inputContainer: {
    width: "80%",
    marginBottom: 20,
  },
  inputWrapper: {
    borderRadius: 25,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
  },
  refreshIcon: {
    padding: 10,
    zIndex: 10,
  },
  loginButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  roleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  parentButton: {
    backgroundColor: "#007AFF",
  },
  adminButton: {
    backgroundColor: "#0047AB",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  roleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    position: "absolute",
    bottom: 20,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    opacity: 0.7,
  },
});

export default LogScreen;