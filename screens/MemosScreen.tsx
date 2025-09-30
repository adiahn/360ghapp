import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Memo } from '../types';
import { DataService } from '../services/DataService';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import BiometricAuthModal from '../components/BiometricAuthModal';
import MDAScreen from './MDAScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MemosScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'mda'>('home');
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));

  // Responsive sidebar width (60% of screen width, min 280px, max 320px)
  const sidebarWidth = Math.min(Math.max(screenWidth * 0.6, 280), 320);

  const loadData = async () => {
    try {
      setLoading(true);
      const contactsData = await DataService.getContacts();
      
      // Update unread counts based on pending memos
      const updatedContacts = await Promise.all(
        contactsData.map(async (contact) => {
          const memos = await DataService.getMemos(contact.id);
          const unreadCount = memos.filter(memo => memo.status === 'pending').length;
          return { ...contact, unreadCount };
        })
      );
      
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load contacts data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleMenu = () => {
    const toValue = showMenu ? 0 : 1;
    setShowMenu(!showMenu);
    
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const selectTab = (tab: 'home' | 'mda') => {
    setActiveTab(tab);
    setShowMenu(false);
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const formatLastMessage = (contact: Contact) => {
    if (contact.lastMemo) {
      const time = new Date(contact.lastMemo.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${contact.lastMemo.title} • ${time}`;
    }
    return 'No memos yet';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.primary;
      case 'low':
        return colors.gray[500];
      default:
        return colors.gray[500];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'request_details':
        return colors.warning;
      case 'pending':
        return colors.gray[500];
      default:
        return colors.gray[500];
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={() => navigation.navigate('MemoDetail', { contactId: item.id })}
      activeOpacity={0.6}
    >
      <View style={styles.cardContent}>
        <View style={styles.contactInfo}>
          <View style={styles.contactIcon}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.contactSubtitle} numberOfLines={1}>
              {item.lastMemo ? formatLastMessage(item) : 'No recent activity'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <Text style={styles.timestamp}>
            {item.lastMemo ? new Date(item.lastMemo.date).toLocaleDateString() : ''}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="people-outline" size={48} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Contacts Found</Text>
      <Text style={styles.emptySubtitle}>
        Contact your administrator to set up contacts and start managing memos.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={24} color={colors.gray[400]} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Hamburger Menu */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'home' ? 'Home' : 'MDA\'s'}
        </Text>
        <TouchableOpacity style={styles.notificationButton} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Animated Sidebar Menu */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            transform: [{
              translateX: menuAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-sidebarWidth, 0],
              })
            }],
            opacity: menuAnimation,
          }
        ]}
      >
        <SafeAreaView style={styles.sidebarSafeArea}>
          {/* Sidebar Header */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarHeaderContent}>
              <View style={styles.governorImage}>
                <Ionicons name="person" size={20} color={colors.text.secondary} />
              </View>
              <View style={styles.governorInfo}>
                <Text style={styles.governorName}>Gov. Dikko Umaru Radda</Text>
                <Text style={styles.governorTitle}>Executive Governor</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={toggleMenu}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content Area */}
          <View style={styles.scrollableContent}>
            <View style={styles.sidebarContent}>
              <Text style={styles.sectionTitle}>Navigation</Text>
              
              <TouchableOpacity 
                style={[styles.menuItem, activeTab === 'home' && styles.activeMenuItem]}
                onPress={() => selectTab('home')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons 
                    name="home" 
                    size={22} 
                    color={activeTab === 'home' ? colors.primary : colors.text.secondary} 
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[
                    styles.menuText,
                    activeTab === 'home' && styles.activeMenuText
                  ]}>
                    Home
                  </Text>
                  <Text style={styles.menuSubtext}>
                    Personnel memos
                  </Text>
                </View>
                {activeTab === 'home' && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, activeTab === 'mda' && styles.activeMenuItem]}
                onPress={() => selectTab('mda')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons 
                    name="business" 
                    size={22} 
                    color={activeTab === 'mda' ? colors.primary : colors.text.secondary} 
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[
                    styles.menuText,
                    activeTab === 'mda' && styles.activeMenuText
                  ]}>
                    MDA's
                  </Text>
                  <Text style={styles.menuSubtext}>
                    Ministry memos
                  </Text>
                </View>
                {activeTab === 'mda' && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            </View>
          </View>

        </SafeAreaView>
      </Animated.View>

      {/* Overlay when menu is open */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      {/* Content */}
      {activeTab === 'home' ? (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <MDAScreen navigation={navigation} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  notificationCount: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: screenHeight,
    backgroundColor: colors.surface,
    zIndex: 999,
    shadowColor: colors.shadow.lg,
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarSafeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sidebarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  governorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  governorInfo: {
    flex: 1,
  },
  governorName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  governorTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableContent: {
    flex: 1,
    minHeight: 0,
    paddingBottom: 80,
  },
  sidebarContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 998,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 48,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeMenuItem: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 1,
  },
  activeMenuText: {
    color: colors.primary,
    fontWeight: '600',
  },
  menuSubtext: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  listContainer: {
    flexGrow: 1,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
});

export default MemosScreen;
