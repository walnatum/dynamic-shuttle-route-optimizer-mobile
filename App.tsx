import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Login from './screens/Login';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Login />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
