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

import { Memo, MemoAction, Contact } from '../types';
import { DataService } from '../services/DataService';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

const HistoriesScreen = () => {
  const [actions, setActions] = useState<MemoAction[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'request_details'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [actionsData, memosData, contactsData] = await Promise.all([
        DataService.getActions(),
        DataService.getMemos(),
        DataService.getContacts(),
      ]);
      
      setActions(actionsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setMemos(memosData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load history data');
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

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.title || 'Unknown Contact';
  };

  const getMemoTitle = (memoId: string) => {
    const memo = memos.find(m => m.id === memoId);
    return memo?.title || 'Unknown Memo';
  };

  const getActionColor = (action: string) => {
    switch (action) {
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'request_details':
        return 'help-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    return action.action === filter;
  });

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderActionItem = ({ item }: { item: MemoAction }) => (
    <View style={styles.actionCard}>
      <View style={styles.actionHeader}>
        <View style={styles.actionInfo}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getActionIcon(item.action) as any}
              size={20}
              color={getActionColor(item.action)}
            />
          </View>
          <View style={styles.actionDetails}>
            <Text style={styles.memoTitle} numberOfLines={2}>
              {getMemoTitle(item.memoId)}
            </Text>
            <Text style={styles.contactName}>
              {getContactName(memos.find(m => m.id === item.memoId)?.contactId || '')}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getActionColor(item.action) }]}>
          <Text style={styles.statusText}>
            {item.action.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.timestampContainer}>
        <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
        <Text style={styles.timestamp}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      
      {item.comment && (
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Comment:</Text>
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="time-outline" size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No History Found</Text>
      <Text style={styles.emptySubtitle}>
        Your actions on memos will appear here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={globalStyles.body}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('approved', 'Approved')}
        {renderFilterButton('rejected', 'Rejected')}
        {renderFilterButton('request_details', 'Requested')}
      </View>
      
      <FlatList
        data={filteredActions}
        keyExtractor={(item, index) => `${item.memoId}-${item.timestamp}-${index}`}
        renderItem={renderActionItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.gray[100],
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.text.inverse,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionDetails: {
    flex: 1,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  timestamp: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginLeft: 6,
    fontWeight: '500',
  },
  commentContainer: {
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  commentText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: colors.gray[100],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});

export default HistoriesScreen;
