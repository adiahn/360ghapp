import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: LocalAuthentication.AuthenticationType;
}

export class BiometricAuthService {
  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get the available biometric types on the device
   */
  static async getAvailableTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Get a user-friendly name for the biometric type based on platform
   */
  static getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
      case LocalAuthentication.AuthenticationType.IRIS:
        return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
      default:
        return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
    }
  }

  /**
   * Get the primary biometric type available on the device
   */
  static async getPrimaryBiometricType(): Promise<string> {
    try {
      const types = await this.getAvailableTypes();
      if (types.length === 0) return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
      
      // Return platform-specific names
      return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
    } catch (error) {
      console.error('Error getting primary biometric type:', error);
      return Platform.OS === 'ios' ? 'Biometrics' : 'Biometrics';
    }
  }

  /**
   * Authenticate using biometrics with proper fallback handling
   */
  static async authenticate(reason: string = 'Authenticate to continue'): Promise<BiometricAuthResult> {
    try {
      // Check if biometrics are available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // Get the primary biometric type for the prompt
      const biometricType = await this.getPrimaryBiometricType();

      // Perform authentication with proper fallback labels based on platform
      const fallbackLabel = Platform.OS === 'ios' ? 'Use Passcode' : 'Use PIN/Password';
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: fallbackLabel,
        disableDeviceFallback: false, // This allows fallback to device PIN/passcode
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return {
          success: true,
          biometricType: result.authenticationType
        };
      } else {
        // Provide more specific error messages based on the error type
        let errorMessage = 'Authentication failed';
        
        if (result.error === 'UserCancel') {
          errorMessage = 'Authentication was cancelled';
        } else if (result.error === 'SystemCancel') {
          errorMessage = 'Authentication was interrupted by the system';
        } else if (result.error === 'AuthenticationFailed') {
          errorMessage = 'Authentication failed. Please try again';
        } else if (result.error === 'UserFallback') {
          errorMessage = 'Fallback authentication was used';
        } else if (result.error === 'NotEnrolled') {
          errorMessage = 'No biometric authentication is enrolled on this device';
        } else if (result.error === 'NotAvailable') {
          errorMessage = 'Biometric authentication is not available on this device';
        } else if (result.error === 'PasscodeNotSet') {
          errorMessage = 'No passcode is set on this device';
        } else if (result.error === 'FingerprintScannerUnavailable') {
          errorMessage = 'Fingerprint scanner is not available';
        } else if (result.error === 'FaceIDScannerUnavailable') {
          errorMessage = 'Face ID scanner is not available';
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An error occurred during authentication'
      };
    }
  }

  /**
   * Authenticate for memo actions with specific messaging
   */
  static async authenticateForMemoAction(action: string): Promise<BiometricAuthResult> {
    const biometricType = await this.getPrimaryBiometricType();
    const reason = `Use ${biometricType} to ${action} this memo`;
    
    return this.authenticate(reason);
  }

  /**
   * Show an alert if biometric authentication fails
   */
  static showAuthErrorAlert(error: string) {
    // Don't show error alert for user cancellation or fallback usage
    if (error.includes('cancelled') || error.includes('Fallback authentication was used')) {
      return;
    }
    
    Alert.alert(
      'Authentication Failed',
      error,
      [{ text: 'OK' }]
    );
  }

  /**
   * Show an alert if biometric authentication is not available
   */
  static showNotAvailableAlert() {
    Alert.alert(
      'Biometric Authentication Not Available',
      'Please set up Face ID, Touch ID, or Fingerprint authentication in your device settings to use this feature.',
      [{ text: 'OK' }]
    );
  }
}
