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
  SafeAreaView,
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
  const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'comments'>('details');
  const [showActionModal, setShowActionModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [comments, setComments] = useState<MemoAction[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);

  useEffect(() => {
    loadMemo();
    loadComments();
    loadWorkflowHistory();
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

  const loadComments = async () => {
    try {
      const actions = await DataService.getActions();
      const memoComments = actions.filter(action => action.memoId === memoId);
      setComments(memoComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadWorkflowHistory = async () => {
    try {
      // Simulate workflow history - in a real app, this would come from the backend
      const history = [
        {
          id: '1',
          office: 'Principal Private Secretary',
          status: 'created',
          startDate: memo?.date || new Date(),
          endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          duration: '2 days',
          completed: true,
        },
        {
          id: '2',
          office: 'Chief of Staff',
          status: 'under_review',
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          duration: '1 day',
          completed: true,
        },
        {
          id: '3',
          office: 'Cabinet Secretary',
          status: 'pending',
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          endDate: null,
          duration: '1 day (ongoing)',
          completed: false,
        },
      ];
      setWorkflowHistory(history);
    } catch (error) {
      console.error('Error loading workflow history:', error);
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
      
      const updatedMemo = { ...memo, status: pendingAction as any };
      await DataService.saveMemo(updatedMemo);
      
      setMemo(updatedMemo);
      setShowBiometricModal(false);
      setActionComment('');
      setPendingAction(null);
      
      // Reload comments
      await loadComments();
      
      Alert.alert('Success', `Memo ${pendingAction.replace('_', ' ')} successfully`);
    } catch (error) {
      console.error('Error performing action:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const handleBiometricCancel = () => {
    setShowBiometricModal(false);
    setPendingAction(null);
    setShowActionModal(true);
  };

  const renderTabButton = (tab: 'details' | 'workflow' | 'comments', icon: string, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={activeTab === tab ? colors.text.inverse : colors.text.secondary} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderMemoDetails = () => {
    if (!memo) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.memoContainer}>
          {/* Header */}
          <View style={styles.memoHeader}>
            <View style={styles.refContainer}>
              <Text style={styles.refLabel}>Ref No:</Text>
              <Text style={styles.refNumber}>{generateRefNumber(memo)}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Date:</Text>
              <Text style={styles.dateText}>{formatDate(memo.date)}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(memo.status) }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.text.inverse} />
              <Text style={styles.statusText}>{getStatusText(memo.status)}</Text>
            </View>
          </View>

          {/* Sender Info */}
          <View style={styles.senderContainer}>
            <Text style={styles.senderLabel}>From:</Text>
            <Text style={styles.senderName}>Principal Private Secretary</Text>
            <Text style={styles.senderDept}>Katsina State Government</Text>
          </View>

          {/* Salutation */}
          <Text style={styles.salutation}>Dear Sir/Madam,</Text>

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectText}>{memo.title.toUpperCase()}</Text>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{memo.content}</Text>
          </View>

          {/* Closing */}
          <View style={styles.closingContainer}>
            <Text style={styles.closingText}>Yours faithfully,</Text>
            <Text style={styles.signatureName}>Principal Private Secretary</Text>
            <Text style={styles.signatureDept}>Katsina State Government</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderWorkflow = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.workflowContainer}>
        <Text style={styles.sectionTitle}>Workflow History</Text>
        <Text style={styles.sectionSubtitle}>Track the memo's journey through different offices</Text>
        
        <View style={styles.workflowSteps}>
          {workflowHistory.map((step, index) => (
            <View key={step.id} style={styles.workflowItem}>
              <View style={styles.workflowStep}>
                <View style={[styles.stepIcon, step.completed ? styles.completedIcon : styles.pendingIcon]}>
                  <Ionicons 
                    name={step.completed ? "checkmark" : "time"} 
                    size={16} 
                    color={step.completed ? colors.text.inverse : colors.text.secondary} 
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.office}</Text>
                  <Text style={styles.stepStatus}>
                    {step.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.stepDuration}>
                    Duration: {step.duration}
                  </Text>
                  <Text style={styles.stepDate}>
                    {formatDate(step.startDate)} - {step.endDate ? formatDate(step.endDate) : 'Ongoing'}
                  </Text>
                </View>
              </View>
              {index < workflowHistory.length - 1 && (
                <View style={styles.workflowConnector} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderComments = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.commentsContainer}>
        <Text style={styles.sectionTitle}>Comments & Actions</Text>
        
        {comments.length === 0 ? (
          <View style={styles.emptyComments}>
            <Ionicons name="chatbubble-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyCommentsText}>No comments yet</Text>
          </View>
        ) : (
          comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAction}>{comment.action.replace('_', ' ')}</Text>
                <Text style={styles.commentDate}>
                  {formatDate(comment.timestamp)} at {formatTime(comment.timestamp)}
                </Text>
              </View>
              {comment.comment && (
                <Text style={styles.commentText}>{comment.comment}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAction('approved')}
            >
              <Ionicons name="checkmark" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleAction('rejected')}
            >
              <Ionicons name="close" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.requestButton]}
              onPress={() => handleAction('request_details')}
            >
              <Ionicons name="help-circle" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Request Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={24} color={colors.gray[400]} />
        <Text style={styles.loadingText}>Loading memo...</Text>
      </View>
      </SafeAreaView>
    );
  }

  if (!memo) {
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Memo Not Found</Text>
          <Text style={styles.errorSubtitle}>The requested memo could not be found.</Text>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {renderTabButton('details', 'document-text', 'Details')}
        {renderTabButton('workflow', 'git-branch', 'Workflow')}
        {renderTabButton('comments', 'chatbubble', 'Comments')}
        </View>

      {/* Tab Content */}
      {activeTab === 'details' && renderMemoDetails()}
      {activeTab === 'workflow' && renderWorkflow()}
      {activeTab === 'comments' && renderComments()}

      {/* Main Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowActionModal(true)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={colors.text.inverse} />
      </TouchableOpacity>

      {/* Modals */}
      {renderActionModal()}
      
      <BiometricAuthModal
        visible={showBiometricModal}
        onSuccess={handleBiometricSuccess}
        onClose={handleBiometricCancel}
        action={pendingAction || 'perform action'}
        memoTitle={memo?.title}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  memoContainer: {
    padding: 20,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  refContainer: {
    flex: 1,
  },
  refLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  refNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
  senderContainer: {
    marginBottom: 20,
  },
  senderLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  senderDept: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  salutation: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 20,
  },
  subjectContainer: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  contentContainer: {
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  closingContainer: {
    marginTop: 20,
  },
  closingText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 16,
  },
  signatureName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  signatureDept: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  workflowContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: -16,
    marginBottom: 20,
  },
  workflowSteps: {
    gap: 8,
  },
  workflowItem: {
    marginBottom: 8,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  completedStep: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  pendingStep: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedIcon: {
    backgroundColor: colors.success,
  },
  pendingIcon: {
    backgroundColor: colors.gray[200],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stepDuration: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  stepDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  workflowConnector: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 15,
    marginVertical: 4,
  },
  commentsContainer: {
    padding: 20,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  commentItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  commentDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  commentText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.lg,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 80,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  requestButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default MemoViewScreen;