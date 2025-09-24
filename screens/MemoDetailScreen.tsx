import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Memo, MemoStatus } from '../types';
import { DataService } from '../services/DataService';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

const MemoDetailScreen = ({ route, navigation }: any) => {
  const { contactId } = route.params;
  const [contact, setContact] = useState<Contact | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionComment, setActionComment] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsData, memosData] = await Promise.all([
        DataService.getContacts(),
        DataService.getMemos(contactId),
      ]);
      
      const contactData = contactsData.find(c => c.id === contactId);
      setContact(contactData || null);
      setMemos(memosData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load memo data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [contactId])
  );

  const handleAction = async (action: MemoStatus) => {
    if (!selectedMemo) return;

    try {
      await DataService.updateMemoStatus(selectedMemo.id, action, actionComment);
      setShowActionModal(false);
      setActionComment('');
      setSelectedMemo(null);
      await loadData(); // Refresh data
      Alert.alert('Success', `Memo ${action} successfully`);
    } catch (error) {
      console.error('Error updating memo:', error);
      Alert.alert('Error', 'Failed to update memo status');
    }
  };

  const getStatusColor = (status: MemoStatus) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'request_details':
        return colors.warning;
      case 'pending':
        return colors.gray[500];
      case 'archived':
        return colors.text.secondary;
      default:
        return colors.gray[500];
    }
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMemoItem = ({ item }: { item: Memo }) => (
    <TouchableOpacity
      style={styles.memoCard}
      onPress={() => {
        setSelectedMemo(item);
        setShowActionModal(true);
      }}
      activeOpacity={0.6}
    >
      <View style={styles.memoHeader}>
        <Text style={styles.memoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.memoContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.memoFooter}>
        <View style={styles.priorityContainer}>
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: getPriorityColor(item.priority) }
            ]}
          />
          <Text style={styles.priorityText}>
            {item.priority.toUpperCase()} PRIORITY
          </Text>
        </View>
        
        <Text style={styles.memoDate}>
          {formatDate(item.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowActionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Take Action</Text>
          <Text style={[globalStyles.body, { marginBottom: 16 }]}>
            {selectedMemo?.title}
          </Text>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment (optional)"
            value={actionComment}
            onChangeText={setActionComment}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => handleAction('approved')}
            >
              <Ionicons name="checkmark" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => handleAction('rejected')}
            >
              <Ionicons name="close" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.warning }]}
              onPress={() => handleAction('request_details')}
            >
              <Ionicons name="help-circle" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Request Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.gray }]}
              onPress={() => handleAction('pending')}
            >
              <Ionicons name="time" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Leave Pending</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowActionModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="document-outline" size={48} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Memos Found</Text>
      <Text style={styles.emptySubtitle}>
        No memos have been submitted by this ministry yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={globalStyles.body}>Loading memos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={memos}
        keyExtractor={(item) => item.id}
        renderItem={renderMemoItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      
      {renderActionModal()}
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
  memoCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  memoTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  memoContent: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  memoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  memoDate: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.shadow.lg,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    textAlignVertical: 'top',
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: '#F3F4F6',
    minHeight: 80,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: '48%',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: '#F3F4F6',
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
});

export default MemoDetailScreen;
