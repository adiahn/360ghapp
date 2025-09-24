import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DataService } from '../services/DataService';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

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
          <Ionicons name={icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={globalStyles.subtitle}>{title}</Text>
          <Text style={globalStyles.caption}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={globalStyles.container}>
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
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.gray}
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
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={darkModeEnabled ? colors.primary : colors.gray}
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
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={autoSyncEnabled ? colors.primary : colors.gray}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {renderSettingItem(
          'download',
          'Load Sample Data',
          'Load sample ministries and memos for testing',
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

const styles = {
  section: {
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
};

export default SettingsScreen;
