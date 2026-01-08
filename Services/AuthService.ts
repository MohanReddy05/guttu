import * as LocalAuthentication from 'expo-local-authentication';

export const authenticateUser = async (): Promise<boolean> => {
  try {
    // Check if the device has biometric hardware
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      console.warn('This device does not support biometrics');
      return true; // Or false, depending on if you want to force security
    }

    // Check if biometrics are actually set up
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      console.warn('No biometrics enrolled');
      return true; // Fallback to allowing save
    }

    // Perform authentication
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm identity to save account',
      fallbackLabel: 'Use Passcode',
    });

    return result.success;
  } catch (error) {
    console.error('Auth error:', error);
    return false;
  }
};
