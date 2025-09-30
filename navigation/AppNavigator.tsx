import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import MemosScreen from '../screens/MemosScreen';
import HistoriesScreen from '../screens/HistoriesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MemoDetailScreen from '../screens/MemoDetailScreen';
import MemoViewScreen from '../screens/MemoViewScreen';
import MinistryDetailScreen from '../screens/MinistryDetailScreen';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MemosStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MemosList" 
      component={MemosScreen} 
      options={{ 
        headerShown: false,
      }} 
    />
    <Stack.Screen 
      name="MemoDetail" 
      component={MemoDetailScreen} 
      options={{ 
        title: 'Memo Details',
        headerStyle: { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.gray[200],
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { 
          fontWeight: '600',
          fontSize: 16,
        },
        headerBackTitleVisible: false,
        headerBackTitle: '',
        headerLeftContainerStyle: {
          marginLeft: 16,
        },
      }} 
    />
    <Stack.Screen 
      name="MemoView" 
      component={MemoViewScreen} 
      options={{ 
        title: 'Memo View',
        headerStyle: { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.gray[200],
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { 
          fontWeight: '600',
          fontSize: 20,
        },
        headerBackTitleVisible: false,
      }} 
    />
    <Stack.Screen 
      name="MinistryDetail" 
      component={MinistryDetailScreen} 
      options={{ 
        title: 'Ministry Details',
        headerStyle: { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.gray[200],
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { 
          fontWeight: '600',
          fontSize: 20,
        },
        headerBackTitleVisible: false,
      }} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Memos') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Histories') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray[500],
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
            height: 70,
            paddingBottom: 12,
            paddingTop: 8,
            shadowColor: colors.shadow.sm,
            shadowOffset: {
              width: 0,
              height: -1,
            },
            shadowOpacity: 1,
            shadowRadius: 2,
            elevation: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Memos" 
          component={MemosStack} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Histories" 
          component={HistoriesScreen} 
          options={{
            title: 'History',
            headerStyle: { 
              backgroundColor: colors.surface,
              borderBottomColor: colors.gray[200],
              borderBottomWidth: 0.5,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { 
              fontWeight: '600',
              fontSize: 20,
            },
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            title: 'Settings',
            headerStyle: { 
              backgroundColor: colors.surface,
              borderBottomColor: colors.gray[200],
              borderBottomWidth: 0.5,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { 
              fontWeight: '600',
              fontSize: 20,
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
