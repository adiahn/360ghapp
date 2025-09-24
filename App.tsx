import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataService } from './services/DataService';

import AppNavigator from './navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Initialize sample data on first launch
    const initializeApp = async () => {
      try {
        const contacts = await DataService.getContacts();
        if (contacts.length === 0) {
          await DataService.initializeSampleData();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
