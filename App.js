import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import RandomPicker from './src/components/RandomPicker';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <RandomPicker />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  }
});
