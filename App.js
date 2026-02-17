import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import RandomPicker from './src/components/RandomPicker';
import { theme } from './src/styles/theme';

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
    backgroundColor: theme.colors.background,
  },
});
