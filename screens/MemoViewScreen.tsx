import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { Memo, MemoAction } from '../types';
import { DataService } from '../services/DataService';
import { colors } from '../styles/colors';
import BiometricAuthModal from '../components/BiometricAuthModal';

const MemoViewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { memoId } = route.params as { memoId: string };
  
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState('');

  useEffect(() => {
    loadMemo();
  }, [memoId]);

  const loadMemo = async () => {
    try {
      setLoading(true);
      const memos = await DataService.getMemos();
      const foundMemo = memos.find(m => m.id === memoId);
      setMemo(foundMemo || null);
    } catch (error) {
      console.error('Error loading memo:', error);
      Alert.alert('Error', 'Failed to load memo');
    } finally {
      setLoading(false);
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
      case 'archived':
        return colors.gray[400];
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
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateRefNumber = (memo: Memo) => {
    const year = new Date(memo.date).getFullYear();
    const month = String(new Date(memo.date).getMonth() + 1).padStart(2, '0');
    const day = String(new Date(memo.date).getDate()).padStart(2, '0');
    return `REF/${year}/${month}/${day}/${memo.id}`;
  };

  const handleAction = async (action: string) => {
    if (!memo) return;

    // Set the pending action and show biometric modal
    setPendingAction(action);
    setShowActionModal(false);
    setShowBiometricModal(true);
  };

  const handleBiometricSuccess = async () => {
    if (!memo || !pendingAction) return;

    try {
      const memoAction: MemoAction = {
        id: Date.now().toString(),
        memoId: memo.id,
        action: pendingAction as any,
        comment: actionComment,
        timestamp: new Date(),
      };

      await DataService.saveAction(memoAction);
      
      // Update memo status
      const updatedMemo = { ...memo, status: pendingAction as any };
      await DataService.saveMemo(updatedMemo);
      
      setMemo(updatedMemo);
      setShowBiometricModal(false);
      setActionComment('');
      setPendingAction(null);
      
      Alert.alert('Success', `Memo ${pendingAction.replace('_', ' ')} successfully`);
    } catch (error) {
      console.error('Error performing action:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const handleBiometricCancel = () => {
    setShowBiometricModal(false);
    setPendingAction(null);
    setShowActionModal(true); // Return to action modal
  };

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
              <Ionicons name="close" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
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
              style={styles.actionButton}
              onPress={() => handleAction('approved')}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('rejected')}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('request_details')}
            >
              <Text style={styles.actionButtonText}>Request Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('pending')}
            >
              <Text style={styles.actionButtonText}>Leave Pending</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading memo...</Text>
      </View>
    );
  }

  if (!memo) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.errorTitle}>Memo Not Found</Text>
        <Text style={styles.errorText}>The requested memo could not be found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Reference and Date */}
        <View style={styles.referenceSection}>
          <Text style={styles.refNumber}>Ref No: {generateRefNumber(memo)}</Text>
          <Text style={styles.dateText}>Date: {formatDate(memo.date)}</Text>
        </View>

        {/* From */}
        <View style={styles.fromSection}>
          <Text style={styles.fromText}>From: Commissioner of Finance</Text>
          <Text style={styles.ministryText}>Ministry of Budget and Planning</Text>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Dear Sir/Madam,</Text>

        {/* Subject */}
        <View style={styles.subjectSection}>
          <Text style={styles.subjectText}>{memo.title.toUpperCase()}</Text>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.memoContent}>{memo.content}</Text>
        </View>

        {/* Closing */}
        <View style={styles.closingSection}>
          <Text style={styles.closingText}>Yours faithfully,</Text>
          <Text style={styles.authorName}>Principal Private Secretary</Text>
          <Text style={styles.authorTitle}>Katsina State Government</Text>
        </View>
      </ScrollView>

      {/* Three Dot Menu */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowActionModal(true)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.primary} />
      </TouchableOpacity>

      {renderActionModal()}
      
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={handleBiometricCancel}
        onSuccess={handleBiometricSuccess}
        action={pendingAction ? pendingAction.replace('_', ' ') : ''}
        memoTitle={memo?.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Reference and Date
  referenceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  refNumber: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  // From
  fromSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  fromText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  ministryText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  // Greeting
  greeting: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  // Subject
  subjectSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  // Content
  contentSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  memoContent: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    textAlign: 'justify',
  },
  // Closing
  closingSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  closingText: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 16,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  authorTitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  menuButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: colors.gray[50],
  },
  commentSection: {
    padding: 20,
    paddingTop: 0,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.surface,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MemoViewScreen;
