import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DataService } from '../services/DataService';
import { BiometricAuthService } from '../services/BiometricAuthService';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricAuthService.isAvailable();
      setBiometricAvailable(available);
      
      if (available) {
        const type = await BiometricAuthService.getPrimaryBiometricType();
        setBiometricType(type);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value && !biometricAvailable) {
      BiometricAuthService.showNotAvailableAlert();
      return;
    }

    if (value) {
      // Test biometric authentication before enabling
      const result = await BiometricAuthService.authenticate('Enable biometric authentication for memo actions');
      if (result.success) {
        setBiometricEnabled(true);
        Alert.alert('Success', `${biometricType} authentication enabled successfully`);
      } else {
        Alert.alert('Authentication Failed', 'Could not enable biometric authentication');
      }
    } else {
      setBiometricEnabled(false);
      Alert.alert('Disabled', 'Biometric authentication has been disabled');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will clear all memos and actions. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data
              await DataService.saveContacts([]);
              await DataService.saveMemo({} as any);
              await DataService.saveAction({} as any);
              Alert.alert('Success', 'Data has been reset successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  const handleInitializeSampleData = () => {
    Alert.alert(
      'Load Sample Data',
      'This will load sample ministries and memos for testing purposes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Load',
          onPress: async () => {
            try {
              await DataService.initializeSampleData();
              Alert.alert('Success', 'Sample data loaded successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to load sample data');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {renderSettingItem(
          'notifications',
          'Push Notifications',
          'Receive notifications for new memos',
          undefined,
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.gray[500]}
          />
        )}
        
        {renderSettingItem(
          'moon',
          'Dark Mode',
          'Use dark theme (coming soon)',
          undefined,
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
            thumbColor={darkModeEnabled ? colors.primary : colors.gray[500]}
            disabled={true}
          />
        )}
        
        {renderSettingItem(
          'sync',
          'Auto Sync',
          'Automatically sync data when connected',
          undefined,
          <Switch
            value={autoSyncEnabled}
            onValueChange={setAutoSyncEnabled}
            trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
            thumbColor={autoSyncEnabled ? colors.primary : colors.gray[500]}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {renderSettingItem(
          biometricAvailable ? (Platform.OS === 'ios' ? 'finger-print' : 'scan') : 'shield-checkmark',
          biometricAvailable ? `${biometricType} Authentication` : 'Biometric Authentication',
          biometricAvailable 
            ? `Use ${biometricType} to secure memo actions` 
            : 'Biometric authentication is not available on this device',
          undefined,
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
            thumbColor={biometricEnabled ? colors.primary : colors.gray[500]}
            disabled={!biometricAvailable}
          />
        )}
        
        {biometricAvailable && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={checkBiometricAvailability}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="refresh" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Refresh Biometric Status</Text>
                <Text style={styles.settingSubtitle}>Check for biometric changes</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {renderSettingItem(
          'download',
          'Load Sample Data',
          'Load sample contacts and memos for testing',
          handleInitializeSampleData
        )}
        
        {renderSettingItem(
          'trash',
          'Reset All Data',
          'Clear all memos and actions',
          handleResetData
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        {renderSettingItem(
          'information-circle',
          'App Version',
          '1.0.0',
          undefined
        )}
        
        {renderSettingItem(
          'shield-checkmark',
          'Privacy Policy',
          'View our privacy policy',
          () => Alert.alert('Privacy Policy', 'Privacy policy content would go here.')
        )}
        
        {renderSettingItem(
          'help-circle',
          'Help & Support',
          'Get help and contact support',
          () => Alert.alert('Help & Support', 'Support information would go here.')
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Katsina State Government{'\n'}
          Memo Management System
        </Text>
        <Text style={styles.footerSubtext}>
          © 2024 All rights reserved
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    padding: 20,
    paddingBottom: 12,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 16,
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  footerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default SettingsScreen;
