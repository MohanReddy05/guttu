import db from 'database/client';
import { Alert } from 'react-native';
import { updateSecret } from 'Services/SecureStorage';

async function UpdateAccountEntries(
  id: number,
  secureKey: string,
  newTitle: string,
  newUsername: string,
  newPass: string,
  setLoading,
  setIsEditing,
  onDataSaved
) {
  try {
    setLoading(true);
    // 1. Update Encrypted Storage (username and password)
    await updateSecret(secureKey, newUsername, newPass);

    // 2. Update SQLite (title)
    db.runSync('UPDATE password_metadata SET title = ? WHERE id = ?', [editTitle, account.id]);

    setIsEditing(false);
    Alert.alert('Updated', 'Account details saved successfully.');
    onDataSaved(); // Refresh the HeroSection in the background
  } catch (error) {
    Alert.alert('Error', 'Update failed.');
  } finally {
    setLoading(false);
  }
}

export default UpdateAccountEntries;
