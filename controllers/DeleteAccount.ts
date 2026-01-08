import db from 'database/client';
import { deleteSecret } from 'Services/SecureStorage';

/**
 * Deletes an account by removing its secret from SecureStore
 * and its metadata from the SQLite database.
 */
export async function deleteAccountEntry(id: number, secureKey: string) {
  try {
    // 1️⃣ Remove from Secure Storage using the specific secureKey
    await deleteSecret(secureKey);

    // 2️⃣ Remove from SQLite using the primary ID
    db.runSync('DELETE FROM password_metadata WHERE id = ?', [id]);

    console.log(`Account with ID ${id} successfully deleted.`);
    return true;
  } catch (error) {
    console.error('Delete operation failed:', error);
    return false;
  }
}
