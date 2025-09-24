import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
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
    return contact?.name || 'Unknown Contact';
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
        return colors.gray;
      default:
        return colors.gray;
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
    <View style={globalStyles.card}>
      <View style={styles.actionHeader}>
        <View style={styles.actionInfo}>
          <Ionicons
            name={getActionIcon(item.action) as any}
            size={24}
            color={getActionColor(item.action)}
          />
          <View style={styles.actionDetails}>
            <Text style={globalStyles.subtitle}>
              {getMemoTitle(item.memoId)}
            </Text>
            <Text style={globalStyles.caption}>
              {getContactName(memos.find(m => m.id === item.memoId)?.contactId || '')}
            </Text>
          </View>
        </View>
        <Text style={globalStyles.caption}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      
      <View style={styles.actionStatus}>
        <Text style={[styles.statusText, { color: getActionColor(item.action) }]}>
          {item.action.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
      
      {item.comment && (
        <View style={styles.commentContainer}>
          <Text style={globalStyles.body}>{item.comment}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={globalStyles.emptyState}>
      <Ionicons name="time-outline" size={64} color={colors.lightGray} />
      <Text style={globalStyles.emptyStateText}>
        No history found.{'\n'}Your actions on memos will appear here.
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
    <View style={globalStyles.container}>
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

const styles = {
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  actionStatus: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  commentContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
};

export default HistoriesScreen;
