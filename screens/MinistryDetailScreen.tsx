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
import BiometricAuthModal from '../components/BiometricAuthModal';

const MinistryDetailScreen = ({ route, navigation }: any) => {
  const { ministryId } = route.params;
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ministriesData, memosData] = await Promise.all([
        DataService.getMinistries(),
        DataService.getMemos(ministryId)
      ]);
      
      const ministryData = ministriesData.find(m => m.id === ministryId);
      setMinistry(ministryData || null);
      setMemos(memosData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load ministry data');
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
    }, [ministryId])
  );

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'request_details':
        return 'Request Details';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const handleMemoPress = (memo: Memo) => {
    setSelectedMemo(memo);
    setShowBiometricModal(true);
  };

  const handleBiometricSuccess = () => {
    setShowBiometricModal(false);
    if (selectedMemo) {
      navigation.navigate('MemoView', { memoId: selectedMemo.id });
    }
  };

  const renderMemoItem = ({ item }: { item: Memo }) => (
    <TouchableOpacity
      style={styles.memoCard}
      onPress={() => handleMemoPress(item)}
      activeOpacity={0.6}
    >
      <View style={styles.memoContent}>
        <View style={styles.memoHeader}>
          <Text style={styles.memoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.memoBadges}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.badgeText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.memoContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        <View style={styles.memoFooter}>
          <Text style={styles.memoDate}>
            {new Date(item.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="document-outline" size={48} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Memos Found</Text>
      <Text style={styles.emptySubtitle}>
        This ministry hasn't sent any memos yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={24} color={colors.gray[400]} />
        <Text style={styles.loadingText}>Loading memos...</Text>
      </View>
    );
  }

  if (!ministry) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Ministry Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The requested ministry could not be found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.ministryInfo}>
          <View style={styles.ministryIcon}>
            <Ionicons name="business" size={24} color={colors.primary} />
          </View>
          <View style={styles.ministryDetails}>
            <Text style={styles.ministryName}>{ministry.name}</Text>
            <Text style={styles.ministryDescription}>{ministry.description}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={memos}
        keyExtractor={(item) => item.id}
        renderItem={renderMemoItem}
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

      <BiometricAuthModal
        visible={showBiometricModal}
        onSuccess={handleBiometricSuccess}
        onCancel={() => setShowBiometricModal(false)}
        title="Authenticate to View Memo"
        subtitle="Use biometric authentication to view this memo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
  },
  ministryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ministryDescription: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  listContainer: {
    flexGrow: 1,
  },
  memoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
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
  memoContent: {
    padding: 16,
  },
  memoHeader: {
    marginBottom: 12,
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  memoBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  memoContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  memoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memoDate: {
    fontSize: 13,
    color: colors.text.tertiary,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MinistryDetailScreen;
