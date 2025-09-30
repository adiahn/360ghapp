import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BiometricAuthService, BiometricAuthResult } from '../services/BiometricAuthService';
import { colors } from '../styles/colors';

interface BiometricAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: string;
  memoTitle?: string;
}

const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
  action,
  memoTitle,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (visible) {
      checkBiometricAvailability();
    }
  }, [visible]);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricAuthService.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        const type = await BiometricAuthService.getPrimaryBiometricType();
        setBiometricType(type);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!isAvailable) {
      BiometricAuthService.showNotAvailableAlert();
      return;
    }

    setIsAuthenticating(true);
    
    try {
      const result: BiometricAuthResult = await BiometricAuthService.authenticateForMemoAction(action);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        if (result.error) {
          BiometricAuthService.showAuthErrorAlert(result.error);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      BiometricAuthService.showAuthErrorAlert('Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    if (Platform.OS === 'ios') {
      return 'finger-print-outline'; // Biometrics icon for iOS
    } else {
      return 'scan-outline'; // Biometrics icon for Android
    }
  };

  const getActionColor = () => {
    switch (action.toLowerCase()) {
      case 'approve':
        return colors.success;
      case 'reject':
        return colors.error;
      case 'request details':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: getActionColor() + '20' }]}>
                <Ionicons 
                  name={getBiometricIcon()} 
                  size={32} 
                  color={getActionColor()} 
                />
              </View>
              <Text style={styles.title}>Biometric Authentication Required</Text>
              <Text style={styles.subtitle}>
                Use {biometricType} to {action} this memo
              </Text>
            </View>

            {/* Memo Info */}
            {memoTitle && (
              <View style={styles.memoInfo}>
                <Text style={styles.memoLabel}>Memo:</Text>
                <Text style={styles.memoTitle} numberOfLines={2}>
                  {memoTitle}
                </Text>
              </View>
            )}

            {/* Status */}
            <View style={styles.statusContainer}>
              {!isAvailable ? (
                <View style={styles.statusItem}>
                  <Ionicons name="warning-outline" size={20} color={colors.warning} />
                  <Text style={styles.statusText}>
                    {biometricType} is not available on this device
                  </Text>
                </View>
              ) : (
                <View style={styles.statusItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={styles.statusText}>
                    {biometricType} is ready for authentication
                  </Text>
                </View>
              )}
              
              {/* Fallback info */}
              <View style={styles.fallbackInfo}>
                <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.fallbackText}>
                  If {biometricType} fails, you can use your device {Platform.OS === 'ios' ? 'passcode' : 'PIN/password'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isAuthenticating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.authenticateButton,
                  { backgroundColor: getActionColor() },
                  (!isAvailable || isAuthenticating) && styles.disabledButton
                ]}
                onPress={handleAuthenticate}
                disabled={!isAvailable || isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name={getBiometricIcon()} 
                      size={20} 
                      color={colors.text.inverse} 
                    />
                    <Text style={styles.authenticateButtonText}>
                      {isAvailable ? `Use ${biometricType}` : 'Not Available'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.securityNoteText}>
                Your biometric data is stored securely on your device
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 0,
    shadowColor: colors.shadow.lg,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  memoInfo: {
    backgroundColor: colors.gray[50],
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  memoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  memoTitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  statusContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  statusText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  fallbackInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  fallbackText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 52,
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  authenticateButton: {
    shadowColor: colors.shadow.sm,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  authenticateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  securityNoteText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default BiometricAuthModal;
