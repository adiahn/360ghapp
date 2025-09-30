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
import BiometricAuthModal from '../components/BiometricAuthModal';

const MemoDetailScreen = ({ route, navigation }: any) => {
  const { contactId } = route.params;
  const [contact, setContact] = useState<Contact | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<MemoStatus | null>(null);
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

    // Set the pending action and show biometric modal
    setPendingAction(action);
    setShowActionModal(false);
    setShowBiometricModal(true);
  };

  const handleBiometricSuccess = async () => {
    if (!selectedMemo || !pendingAction) return;

    try {
      await DataService.updateMemoStatus(selectedMemo.id, pendingAction, actionComment);
      setShowBiometricModal(false);
      setActionComment('');
      setSelectedMemo(null);
      setPendingAction(null);
      await loadData(); // Refresh data
      Alert.alert('Success', `Memo ${pendingAction} successfully`);
    } catch (error) {
      console.error('Error updating memo:', error);
      Alert.alert('Error', 'Failed to update memo status');
    }
  };

  const handleBiometricCancel = () => {
    setShowBiometricModal(false);
    setPendingAction(null);
    setShowActionModal(true); // Return to action modal
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'request_details':
        return 'help-circle';
      case 'pending':
        return 'time';
      case 'archived':
        return 'archive';
      default:
        return 'help-circle';
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
        navigation.navigate('MemoView', { memoId: item.id });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.memoHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.memoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priorityIndicator}>
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(item.priority) }
              ]}
            />
            <Text style={styles.priorityText}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={14} 
            color={colors.text.inverse} 
          />
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.memoContent} numberOfLines={4}>
          {item.content}
        </Text>
      </View>
      
      <View style={styles.memoFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.memoDate}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View style={styles.actionIndicator}>
          <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowActionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Take Action</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowActionModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.memoPreview}>
            <Text style={styles.memoPreviewTitle}>{selectedMemo?.title}</Text>
            <Text style={styles.memoPreviewContent} numberOfLines={2}>
              {selectedMemo?.content}
            </Text>
          </View>
          
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Add a comment (optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Enter your comments here..."
              value={actionComment}
              onChangeText={setActionComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => handleAction('approved')}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => handleAction('rejected')}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.warning }]}
              onPress={() => handleAction('request_details')}
            >
              <Ionicons name="help-circle" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Request Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.gray[500] }]}
              onPress={() => handleAction('pending')}
            >
              <Ionicons name="time" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Leave Pending</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-outline" size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Memos Found</Text>
      <Text style={styles.emptySubtitle}>
        This contact hasn't sent any memos yet.
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
      
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={handleBiometricCancel}
        onSuccess={handleBiometricSuccess}
        action={pendingAction ? pendingAction.replace('_', ' ') : ''}
        memoTitle={selectedMemo?.title}
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
    padding: 20,
  },
  memoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  memoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 28,
    marginBottom: 8,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.inverse,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  contentContainer: {
    marginBottom: 20,
  },
  memoContent: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  memoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoDate: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionIndicator: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 0,
    width: '100%',
    maxWidth: 420,
    shadowColor: colors.shadow.md,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
  },
  memoPreview: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: colors.gray[50],
    margin: 24,
    marginTop: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  memoPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  memoPreviewContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  commentSection: {
    padding: 24,
    paddingTop: 0,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  actionButtons: {
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

export default MemoDetailScreen;
