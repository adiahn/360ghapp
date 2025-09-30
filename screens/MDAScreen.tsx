import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Ministry, Memo } from '../types';
import { DataService } from '../services/DataService';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

const MDAScreen = ({ navigation }: any) => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const ministriesData = await DataService.getMinistries();
      
      // Update unread counts based on pending memos
      const updatedMinistries = await Promise.all(
        ministriesData.map(async (ministry) => {
          const memos = await DataService.getMemos(ministry.id);
          const unreadCount = memos.filter(memo => memo.status === 'pending').length;
          return { ...ministry, unreadCount };
        })
      );
      
      setMinistries(updatedMinistries);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load ministries data');
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

  const formatLastMessage = (ministry: Ministry) => {
    if (ministry.lastMemo) {
      const time = new Date(ministry.lastMemo.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${ministry.lastMemo.title} • ${time}`;
    }
    return 'No memos yet';
  };

  const renderMinistryItem = ({ item }: { item: Ministry }) => (
    <TouchableOpacity
      style={styles.ministryCard}
      onPress={() => navigation.navigate('MinistryDetail', { ministryId: item.id })}
      activeOpacity={0.6}
    >
      <View style={styles.cardContent}>
        <View style={styles.ministryInfo}>
          <View style={styles.ministryIcon}>
            <Ionicons name="business" size={22} color={colors.primary} />
          </View>
          <View style={styles.ministryDetails}>
            <Text style={styles.ministryName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.ministryDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.ministrySubtitle} numberOfLines={1}>
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
        <Ionicons name="business-outline" size={48} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Ministries Found</Text>
      <Text style={styles.emptySubtitle}>
        Contact your administrator to set up ministries and start managing memos.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={24} color={colors.gray[400]} />
        <Text style={styles.loadingText}>Loading ministries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ministries}
        keyExtractor={(item) => item.id}
        renderItem={renderMinistryItem}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flexGrow: 1,
  },
  ministryCard: {
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
  ministryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ministryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ministryDetails: {
    flex: 1,
  },
  ministryName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ministryDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '400',
    marginBottom: 2,
  },
  ministrySubtitle: {
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

export default MDAScreen;
