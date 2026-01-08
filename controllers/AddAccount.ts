import db from 'database/client';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';
import { saveSecret } from 'Services/SecureStorage';

async function addNewAccount(
  title: string,
  selectedGroupId: number | null,
  username: string,
  password: string
) {
  // Validation
  if (!title || !username || !password || !selectedGroupId) {
    Alert.alert('Missing Info', 'Please fill in all fields and select a group.');
    return false; // Return false so the screen stays open
  }

  try {
    const secureKey = Crypto.randomUUID();

    // 1. Save to encrypted storage
    await saveSecret(secureKey, username, password);

    // 2. Save to SQLite
    db.runSync('INSERT INTO password_metadata (group_id, title, secure_key) VALUES (?, ?, ?)', [
      selectedGroupId,
      title,
      secureKey,
    ]);

    Alert.alert('Saved successfully!');
    return true; // Return true to signal success
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'An error occurred while saving.');
    return false;
  }
}

export default addNewAccount;
