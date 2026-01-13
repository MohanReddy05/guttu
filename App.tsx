import { StatusBar } from 'expo-status-bar';
import './global.css';
import Header from 'components/header/Header';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { HomeScreen } from 'components/Home/HomeScreen';
import { GroupProvider } from 'context/GroupContext';
import { useEffect } from 'react';
import { initializeDatabase } from 'database/client';

export default function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <GroupProvider>
        <StatusBar style="auto" backgroundColor="#61dafb" translucent={false} hidden={false} />
        <HomeScreen />
      </GroupProvider>
    </SafeAreaProvider>
  );
}
